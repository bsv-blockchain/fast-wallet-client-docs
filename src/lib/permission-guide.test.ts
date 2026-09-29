import { PrivateKey } from '@bsv/sdk'
import { describe, expect, it, vi } from 'vitest'
import { evidenceStatus, peerA, permissionManifest, permissionScenarios, performPermissionStep } from './permission-guide'
import type { WalletInterface } from '@bsv/sdk'

describe('BRC-116 evidence rules', () => {
  it('requires human confirmation even when app evidence matches', () => {
    expect(evidenceStatus({ app: { status: 'passed', durationMs: 1 }, human: 'pending' })).toBe('pending')
    expect(evidenceStatus({ app: { status: 'passed', durationMs: 1 }, human: 'confirmed' })).toBe('passed')
    expect(evidenceStatus({ app: { status: 'passed', durationMs: 1 }, human: 'contradicted' })).toBe('failed')
  })

  it('human assertions cannot override an app failure', () => {
    expect(evidenceStatus({ app: { status: 'failed', durationMs: 1 }, human: 'confirmed' })).toBe('failed')
  })

  it('accepts only permission errors for denial steps', async () => {
    const step = permissionScenarios.find(scenario => scenario.id === 'group-deny').steps[0]
    const target = (error: Error) => ({ getPublicKey: vi.fn(async () => { throw error }) }) as unknown as WalletInterface
    expect((await performPermissionStep(target(Object.assign(new Error('denied'), { code: 'ERR_PERMISSION_DENIED' })), step)).status).toBe('passed')
    expect((await performPermissionStep(target(new Error('Wallet timed out')), step)).status).toBe('failed')
  })

  it('fails denial tests when the wallet returns a key', async () => {
    const step = permissionScenarios.find(scenario => scenario.id === 'group-deny').steps[0]
    const wallet = { getPublicKey: async () => ({ publicKey: new PrivateKey(42).toPublicKey().toString() }) } as unknown as WalletInterface
    expect((await performPermissionStep(wallet, step)).status).toBe('failed')
  })

  it('sends no-prompt retries with the same protocol scope', async () => {
    const steps = permissionScenarios.find(scenario => scenario.id === 'group-deny').steps
    const getPublicKey = vi.fn(async () => { throw Object.assign(new Error('denied'), { code: 'ERR_PERMISSION_DENIED' }) })
    const wallet = { getPublicKey } as unknown as WalletInterface
    await performPermissionStep(wallet, steps[0])
    await performPermissionStep(wallet, steps[1])
    const calls = getPublicKey.mock.calls as unknown as { protocolID: unknown; seekPermission: boolean; counterparty: string }[][]
    expect(calls[0][0].protocolID).toEqual(calls[1][0].protocolID)
    expect(calls[0][0].seekPermission).toBe(true)
    expect(calls[1][0].seekPermission).toBe(false)
  })

  it('waits for both concurrent requests before completing, even after rejection', async () => {
    const step = permissionScenarios.find(scenario => scenario.id === 'concurrent-group').steps[0]
    let finish: () => void
    const getPublicKey = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('denied'), { code: 'ERR_PERMISSION_DENIED' }))
      .mockImplementationOnce(() => new Promise(resolve => { finish = () => resolve({ publicKey: peerA }) }))
    let completed = false
    const pending = performPermissionStep({ getPublicKey } as unknown as WalletInterface, step).then(result => { completed = true; return result })
    await Promise.resolve()
    expect(getPublicKey).toHaveBeenCalledTimes(2)
    expect(completed).toBe(false)
    finish()
    expect((await pending).status).toBe('failed')
  })

  it('requires success from both grouped requests', async () => {
    const step = permissionScenarios.find(scenario => scenario.id === 'concurrent-group').steps[0]
    const getPublicKey = vi.fn(async () => ({ publicKey: peerA }))
    expect((await performPermissionStep({ getPublicKey } as unknown as WalletInterface, step)).status).toBe('passed')
    expect(getPublicKey.mock.calls).toHaveLength(2)
  })
})

describe('manifest and scenario consistency', () => {
  it('declares all four group types and a separate PACT set', () => {
    expect(permissionManifest.metanet.schemaVersion).toBe(1)
    const group = permissionManifest.metanet.groupPermissions
    expect(group.spendingAuthorization.amount).toBe(100)
    expect(group.spendingAuthorization.description).toContain('100 satoshi')
    expect(group.basketAccess).toHaveLength(1)
    expect(group.certificateAccess[0].fields).toEqual(['visible'])
    expect(group.protocolPermissions.filter(item => item.protocolID[0] === 2).every(item => 'counterparty' in item && item.counterparty === peerA)).toBe(true)
    expect(permissionManifest.metanet.counterpartyPermissions.protocols.map(item => item.protocolName)).toEqual(['fast pact alpha', 'fast pact beta'])
  })

  it('includes explicit preconditions and UI expectations for every unique step', () => {
    const ids = permissionScenarios.flatMap(scenario => scenario.steps.map(step => step.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(permissionScenarios.every(scenario => scenario.startingState.length > 30 && scenario.steps.every(step => step.instruction && step.expectedPrompt))).toBe(true)
    expect(permissionScenarios.map(scenario => scenario.id)).toContain('pact-partial')
    expect(permissionScenarios.map(scenario => scenario.id)).toContain('persist-revoke')
  })
})
