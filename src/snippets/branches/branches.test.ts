import { Certificate, MasterCertificate, PrivateKey, ProtoWallet, Script, Transaction, WalletClient, type CreateActionArgs, type CreateActionResult, type SignActionArgs, type WalletCertificate, type WalletInterface } from '@bsv/sdk'
import { describe, expect, it, vi } from 'vitest'
import { branchBroadcastActions, branchExplicitInputs, branchNoSendActions, branchSendWithBatches } from './actions'
import { branchCryptoMatrix, branchLinkageMatrix } from './crypto'
import { branchDirectCertificates, makeDirectCertificate } from './certificates'
import { actionQueries, outputQueries } from './lists'
import { branchMetadataSequence } from './metadata'
import { runCases } from './support'
import { ProbeSkipped } from '../../lib/snippet-runner'

const cryptoWallet = (separatePrivilegedRoot = false) => {
  const ordinary = new ProtoWallet(new PrivateKey(42))
  const privileged = new ProtoWallet(new PrivateKey(43))
  if (!separatePrivilegedRoot) return new WalletClient(ordinary as unknown as WalletInterface)
  const methods = ['getPublicKey', 'encrypt', 'decrypt', 'createHmac', 'verifyHmac', 'createSignature', 'verifySignature', 'revealCounterpartyKeyLinkage', 'revealSpecificKeyLinkage']
  const routed = Object.fromEntries(methods.map(method => [method, (args: { privileged?: boolean }) => {
    const target = args.privileged ? privileged : ordinary
    return Reflect.apply(Reflect.get(target, method), target, [args])
  }]))
  return new WalletClient(routed as unknown as WalletInterface)
}
const runner = () => ({ log: vi.fn(), case: vi.fn() })

describe('branch matrices', () => {
  it('cross-checks all 24 crypto cases with real independent peers', async () => {
    const report = runner()
    await branchCryptoMatrix(report, cryptoWallet(true)).catch(() => {})
    expect(report.case.mock.calls.filter(([, result]) => result.status !== 'passed')).toEqual([])
    expect(report.case).toHaveBeenCalledTimes(24)
    expect(report.case.mock.calls.every(([, result]) => result.status === 'passed')).toBe(true)
  })

  it('checks all 20 key-linkage cases with real SDK keys', async () => {
    const report = runner()
    await branchLinkageMatrix(report, cryptoWallet(true))
    expect(report.case).toHaveBeenCalledTimes(20)
  })

  it('enumerates 67 valid action and 55 output query cases', () => {
    const actions = actionQueries()
    const outputs = outputQueries()
    expect(actions).toHaveLength(67)
    expect(outputs).toHaveLength(55)
    expect(new Set(actions.map(query => JSON.stringify(query))).size).toBe(67)
    expect(new Set(outputs.map(query => JSON.stringify(query))).size).toBe(55)
    expect(outputs.some(query => query.include === 'entire transactions')).toBe(true)
    expect(outputs.some(query => query.offset === -1)).toBe(true)
    expect(actions.every(query => !query.includeInputSourceLockingScripts || query.includeInputs)).toBe(true)
  })

  it('continues after a failure and preserves individual outcomes', async () => {
    const report = runner()
    await expect(runCases(report, [
      { id: 'fail', run: async () => { throw new Error('broken') } },
      { id: 'skip', run: async () => { throw new ProbeSkipped('missing fixtures') } },
      { id: 'pass', run: async () => {} },
    ])).rejects.toThrow('1 of 3 branch cases failed')
    expect(report.case.mock.calls.map(([id, result]) => [id, result.status])).toEqual([['fail', 'failed'], ['skip', 'skipped'], ['pass', 'passed']])
  })

  it('stops only after the active case cleans up and records unrun cases as skipped', async () => {
    const report = runner()
    let stopped = false
    let cleaned = false
    const next = vi.fn()
    await expect(runCases({ ...report, shouldStop: () => stopped }, [
      { id: 'active', run: async () => { try { stopped = true } finally { cleaned = true } } },
      { id: 'unrun', run: next },
    ])).rejects.toBeInstanceOf(ProbeSkipped)
    expect(cleaned).toBe(true)
    expect(next).not.toHaveBeenCalled()
    expect(report.case.mock.calls.map(([id, result]) => [id, result.status])).toEqual([['active', 'passed'], ['unrun', 'skipped']])
  })

  it('preserves a failure when stopping the remaining cases', async () => {
    let stopped = false
    await expect(runCases({ ...runner(), shouldStop: () => stopped }, [
      { id: 'failed', run: async () => { stopped = true; throw new Error('broken') } },
      { id: 'unrun', run: vi.fn() },
    ])).rejects.toThrow('1 branch cases failed before stopping')
  })

  it('accepts a locked starting state, then verifies authentication after waiting', async () => {
    let authenticated = false
    const wallet = {
      isAuthenticated: async () => ({ authenticated }),
      waitForAuthentication: async () => { authenticated = true; return { authenticated } },
      getVersion: async () => ({ version: 'testwallet-1.0.0' }),
      getNetwork: async () => ({ network: 'testnet' }),
      getHeight: async () => ({ height: 2 }),
      getHeaderForHeight: async () => ({ header: '00'.repeat(80) }),
    } as unknown as WalletInterface
    const report = runner()
    await branchMetadataSequence(report, wallet)
    expect(report.log).toHaveBeenCalledWith({ authenticatedBeforeWaiting: false })
    expect(report.case.mock.calls.every(([, result]) => result.status === 'passed')).toBe(true)
    expect(authenticated).toBe(true)
  })
})

// Stateful offline transaction model: uses real AtomicBEEF and script parsing,
// but performs no network broadcasts and does not pretend to prove SPV validity.
function actionWallet(fail?: 'child' | 'flush') {
  const records = new Map<string, { tx: Transaction; args: CreateActionArgs }>()
  const references = new Map<string, string>()
  const funding = new Transaction(1, [], [{ satoshis: 100000, lockingScript: Script.fromASM('OP_TRUE') }], 0)
  let serial = 0
  function result(tx: Transaction, only: boolean): CreateActionResult {
    return { txid: tx.id('hex'), ...(only ? {} : { tx: tx.toAtomicBEEF() }) }
  }
  const createAction = vi.fn(async (args: CreateActionArgs): Promise<CreateActionResult> => {
    if (args.options?.sendWith?.length && !args.outputs?.length) {
      if (fail === 'flush') throw new Error('broadcast transport failed')
      return { sendWithResults: args.options.sendWith.map(txid => ({ txid, status: 'sending' })) }
    }
    if (fail === 'child' && args.options?.noSendChange?.length) throw new Error('child construction failed')
    const inputs = args.inputs?.map(input => {
      const [txid, index] = input.outpoint.split('.')
      return { sourceTXID: txid, sourceOutputIndex: Number(index), sourceTransaction: records.get(txid).tx, sequence: input.sequenceNumber ?? 0xffffffff, unlockingScript: Script.fromHex(input.unlockingScript ?? '00') }
    }) ?? [{ sourceTXID: funding.id('hex'), sourceOutputIndex: 0, sourceTransaction: funding, sequence: 0xffffffff, unlockingScript: Script.fromHex('00') }]
    const tx = new Transaction(args.version ?? 1, inputs, [
      ...(args.outputs ?? []).map(output => ({ satoshis: output.satoshis, lockingScript: Script.fromHex(output.lockingScript) })),
      { satoshis: 100 + serial++, lockingScript: Script.fromASM('OP_TRUE') },
    ], args.lockTime ?? 0)
    const txid = tx.id('hex')
    records.set(txid, { tx, args })
    const ref = `reference-${serial}`
    references.set(ref, txid)
    const noSendChange = [`${txid}.${tx.outputs.length - 1}`]
    if (args.options?.signAndProcess === false) return { signableTransaction: { tx: tx.toAtomicBEEF(), reference: ref }, noSendChange }
    return { ...result(tx, args.options?.returnTXIDOnly ?? false), noSendChange }
  })
  const signAction = vi.fn(async (args: SignActionArgs) => {
    if (fail === 'flush' && args.options?.sendWith?.length) throw new Error('broadcast transport failed')
    const record = records.get(references.get(args.reference))
    for (const [index, spend] of Object.entries(args.spends)) {
      record.tx.inputs[Number(index)].unlockingScript = Script.fromHex(spend.unlockingScript)
      if (spend.sequenceNumber != null) record.tx.inputs[Number(index)].sequence = spend.sequenceNumber
    }
    return { ...result(record.tx, args.options?.returnTXIDOnly ?? false), ...(args.options?.sendWith ? { sendWithResults: args.options.sendWith.map(txid => ({ txid, status: 'sending' as const })) } : {}) }
  })
  const abortAction = vi.fn(async (_args: { reference: string }) => ({ aborted: true }))
  return { createAction, signAction, abortAction } as unknown as WalletInterface & { createAction: typeof createAction; signAction: typeof signAction; abortAction: typeof abortAction }
}

describe('transaction sequence construction and cleanup', () => {
  it('checks all 16 noSend combinations and aborts each action', async () => {
    const wallet = actionWallet()
    const report = runner()
    await branchNoSendActions(report, wallet)
    expect(report.case).toHaveBeenCalledTimes(16)
    expect(wallet.abortAction).toHaveBeenCalledTimes(16)
    expect(wallet.createAction.mock.calls.every(([args]) => args.options.noSend === true)).toBe(true)
  })

  it('checks all 16 explicit input sequences and cleans up child before parent', async () => {
    const wallet = actionWallet()
    const report = runner()
    await branchExplicitInputs(report, wallet)
    expect(report.case).toHaveBeenCalledTimes(16)
    expect(wallet.abortAction).toHaveBeenCalledTimes(32)
    for (let index = 0; index < wallet.abortAction.mock.calls.length; index += 2) {
      expect(wallet.abortAction.mock.calls[index][0].reference).not.toEqual(wallet.abortAction.mock.calls[index + 1][0].reference)
    }
  })

  it('checks the 16 broadcast options without trying to abort submitted actions', async () => {
    const wallet = actionWallet()
    await branchBroadcastActions(runner(), wallet)
    expect(wallet.createAction).toHaveBeenCalledTimes(16)
    expect(wallet.abortAction).not.toHaveBeenCalled()
  })

  it('constructs all four batches through both flush methods', async () => {
    const wallet = actionWallet()
    const report = runner()
    await branchSendWithBatches(report, wallet)
    expect(report.case).toHaveBeenCalledTimes(4)
    expect(wallet.createAction.mock.calls.filter(([args]) => args.options?.sendWith?.length)).toHaveLength(2)
    expect(wallet.signAction.mock.calls.filter(([args]) => args.options?.sendWith?.length)).toHaveLength(2)
    expect(wallet.abortAction).not.toHaveBeenCalled()
  })

  it('releases parents when constructing a batch fails', async () => {
    const wallet = actionWallet('child')
    await expect(branchSendWithBatches(runner(), wallet)).rejects.toThrow('4 of 4')
    expect(wallet.abortAction).toHaveBeenCalledTimes(4)
  })

  it('does not release inputs after ambiguous broadcast failures', async () => {
    const wallet = actionWallet('flush')
    await expect(branchSendWithBatches(runner(), wallet)).rejects.toThrow('4 of 4')
    expect(wallet.abortAction).not.toHaveBeenCalled()
  })
})

function certificateWallet() {
  const wallet = cryptoWallet(true)
  const stored = new Map<string, { certificate: WalletCertificate; keyring: Record<string, string>; revealer: string }>()
  const acquireCertificate = vi.fn(async args => {
    const subject = (await wallet.getPublicKey({ identityKey: true, privileged: args.privileged, privilegedReason: args.privilegedReason })).publicKey
    const certificate = { type: args.type, certifier: args.certifier, serialNumber: args.serialNumber, revocationOutpoint: args.revocationOutpoint, signature: args.signature, fields: args.fields, subject }
    expect(await new Certificate(certificate.type, certificate.serialNumber, subject, certificate.certifier, certificate.revocationOutpoint, certificate.fields, certificate.signature).verify()).toBe(true)
    const plaintext = await MasterCertificate.decryptFields(wallet, args.keyringForSubject, certificate.fields, args.keyringRevealer, args.privileged, args.privilegedReason)
    expect(plaintext).toEqual({ visible: 'branch fixture', hidden: 'withheld fixture' })
    stored.set(certificate.serialNumber, { certificate, keyring: args.keyringForSubject, revealer: args.keyringRevealer })
    return certificate
  })
  const listCertificates = vi.fn(async args => {
    const certificates = [...stored.values()].map(value => value.certificate).filter(certificate => (!args.types.length || args.types.includes(certificate.type)) && (!args.certifiers.length || args.certifiers.includes(certificate.certifier)))
    return { totalCertificates: certificates.length, certificates: certificates.slice(args.offset ?? 0, (args.offset ?? 0) + (args.limit ?? 10)) }
  })
  const proveCertificate = vi.fn(async args => {
    const record = stored.get(args.certificate.serialNumber)
    return { keyringForVerifier: await MasterCertificate.createKeyringForVerifier(wallet, record.revealer, args.verifier, record.certificate.fields, args.fieldsToReveal, record.keyring, record.certificate.serialNumber, args.privileged, args.privilegedReason) }
  })
  const relinquishCertificate = vi.fn(async args => {
    const record = stored.get(args.serialNumber)
    expect(record.certificate.certifier).toBe(args.certifier)
    expect(record.certificate.type).toBe(args.type)
    stored.delete(args.serialNumber)
    return { relinquished: true as const }
  })
  Object.assign(wallet, { acquireCertificate, listCertificates, proveCertificate, relinquishCertificate })
  return { wallet, stored, acquireCertificate, relinquishCertificate }
}

describe('direct certificate fixtures and selective disclosure', () => {
  it.each([['certifier', false], ['subject', false], ['certifier', true], ['subject', true]] as const)('builds valid, decryptable keyringRevealer=%s privileged=%s certificates', async (revealer, privileged) => {
    const wallet = cryptoWallet(true)
    const { master, args } = await makeDirectCertificate(wallet, revealer, undefined, privileged)
    expect(await master.verify()).toBe(true)
    expect(master.subject).toBe(new PrivateKey(privileged ? 43 : 42).toPublicKey().toString())
    expect(await MasterCertificate.decryptFields(wallet, args.keyringForSubject, args.fields, args.keyringRevealer, privileged, args.privilegedReason)).toEqual({ visible: 'branch fixture', hidden: 'withheld fixture' })
  })

  it('checks all four direct acquisitions, independent verifier decryption, and exact cleanup', async () => {
    const target = certificateWallet()
    const report = runner()
    await branchDirectCertificates(report, target.wallet)
    expect(report.case).toHaveBeenCalledTimes(4)
    expect(target.acquireCertificate).toHaveBeenCalledTimes(4)
    expect(target.relinquishCertificate).toHaveBeenCalledTimes(4)
    expect(target.stored.size).toBe(0)
  })
})
