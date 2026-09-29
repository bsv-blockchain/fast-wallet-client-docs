import { PrivateKey, ProtoWallet, WalletClient, type WalletInterface } from '@bsv/sdk'
import { describe, expect, it, vi } from 'vitest'
import { ProbeSkipped } from '../../lib/snippet-runner'
import { reliabilityKeyStability } from './key-stability'
import { reliabilityEncryptionBoundaries } from './encryption-boundaries'
import { reliabilityHmacIntegrity } from './hmac-integrity'
import { reliabilitySignatureIntegrity } from './signature-integrity'
import { reliabilityPagination } from './pagination'
import { expectWalletError, type CryptoWallet } from './support'

const runner = { log: vi.fn() }
const wallet = () => new WalletClient(new ProtoWallet(new PrivateKey(42)) as unknown as WalletInterface)

describe('reliability probes against real SDK cryptography', () => {
  it.each([
    ['key stability', reliabilityKeyStability],
    ['encryption boundaries', reliabilityEncryptionBoundaries],
    ['HMAC integrity', reliabilityHmacIntegrity],
    ['data and direct-hash signatures', reliabilitySignatureIntegrity],
  ])('%s', async (_, probe) => {
    await probe(runner, wallet())
  })

  it('detects collapsed key scopes', async () => {
    const real = wallet()
    const publicKey = (await real.getPublicKey({ identityKey: true })).publicKey
    const broken = { getPublicKey: async () => ({ publicKey }) } as unknown as CryptoWallet
    await expect(reliabilityKeyStability(runner, broken)).rejects.toThrow('isolate derived keys')
  })

  it('detects corrupted recovered bytes', async () => {
    const real = wallet()
    vi.spyOn(real, 'decrypt').mockResolvedValue({ plaintext: [42] })
    await expect(reliabilityEncryptionBoundaries(runner, real)).rejects.toThrow('Round trip changed')
  })

  it.each([['HMAC', reliabilityHmacIntegrity, 'verifyHmac'], ['signature', reliabilitySignatureIntegrity, 'verifySignature']] as const)(
    'detects %s verification that always succeeds', async (_, probe, method) => {
      const real = wallet()
      vi.spyOn(real, method).mockResolvedValue({ valid: true })
      await expect(probe(runner, real)).rejects.toThrow('should have been rejected')
    },
  )

  it.each(['Wallet disconnected', 'Permission denied.', 'Request timed out'])('does not count %s as a negative-test pass', async message => {
    await expect(expectWalletError(async () => { throw new Error(message) }, ['ERR_INVALID_HMAC', 3], ['HMAC is not valid'])).rejects.toThrow(message)
  })

  it('recognizes numeric transport errors and exact legacy messages', async () => {
    await expectWalletError(async () => { throw Object.assign(new Error('localized'), { code: 3 }) }, [3], [])
    await expectWalletError(async () => { throw new Error('HMAC is not valid') }, [3], ['HMAC is not valid'])
  })
})

function paginationWallet(ids: string[]) {
  return {
    listActions: vi.fn(async ({ offset, limit }: { offset: number; limit: number }) => ({ totalActions: ids.length, actions: ids.slice(offset, offset + limit).map(txid => ({ txid })) })),
    listOutputs: vi.fn(async () => ({ totalOutputs: 0, outputs: [] })),
  } as unknown as Parameters<typeof reliabilityPagination>[1]
}

describe('pagination', () => {
  it('checks populated pages and empty output responses', async () => {
    const target = paginationWallet(['a', 'b', 'c', 'd', 'e'])
    await reliabilityPagination(runner, target)
    expect(target.listActions).toHaveBeenCalledWith({ labels: ['conformance'], limit: 2, offset: 4 })
  })

  it('detects a wallet that ignores offset', async () => {
    const target = paginationWallet(['a', 'b', 'c', 'd'])
    vi.mocked(target.listActions).mockImplementation(async () => ({ totalActions: 4, actions: [{ txid: 'a' }, { txid: 'b' }] }) as never)
    await expect(reliabilityPagination(runner, target)).rejects.toThrow('duplicate records')
  })

  it('detects omitted records', async () => {
    const target = paginationWallet(['a', 'b', 'c'])
    vi.mocked(target.listActions).mockImplementation(async ({ offset }) => ({ totalActions: 3, actions: offset === 0 ? [{ txid: 'a' }] : [] }) as never)
    await expect(reliabilityPagination(runner, target)).rejects.toThrow('omitted records')
  })

  it('skips empty fixtures', async () => {
    await expect(reliabilityPagination(runner, paginationWallet([]))).rejects.toBeInstanceOf(ProbeSkipped)
  })

  it('skips a dataset that changes during the probe', async () => {
    const target = paginationWallet(['a', 'b'])
    vi.mocked(target.listActions).mockResolvedValueOnce({ totalActions: 1, actions: [{ txid: 'a' }] } as never)
    await expect(reliabilityPagination(runner, target)).rejects.toBeInstanceOf(ProbeSkipped)
  })
})
