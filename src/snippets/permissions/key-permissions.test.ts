import { PrivateKey, type GetPublicKeyArgs } from '@bsv/sdk'
import { describe, expect, it, vi } from 'vitest'
import { permissionAllowKey, permissionDenyKey } from './key-permissions'

const runner = { log: vi.fn() }
const publicKey = new PrivateKey(42).toPublicKey().toString()
const denied = () => Object.assign(new Error('Permission denied.'), { code: 'ERR_PERMISSION_DENIED' })

describe('interactive scoped permissions', () => {
  it('reuses an approved scope without requesting permission', async () => {
    const getPublicKey = vi.fn(async () => ({ publicKey }))
    await permissionAllowKey(runner, { getPublicKey })
    const [first, second] = getPublicKey.mock.calls as unknown as [GetPublicKeyArgs[], GetPublicKeyArgs[]]
    expect(first[0].seekPermission).toBe(true)
    expect(second[0]).toEqual({ ...first[0], seekPermission: false })
    expect(first[0].protocolID[0]).toBe(2)
  })

  it('checks denial and a no-prompt retry of the same scope', async () => {
    const getPublicKey = vi.fn(async () => { throw denied() })
    await permissionDenyKey(runner, { getPublicKey })
    expect(getPublicKey).toHaveBeenCalledTimes(2)
    const calls = getPublicKey.mock.calls as unknown as [GetPublicKeyArgs[], GetPublicKeyArgs[]]
    expect(calls[1][0]).toEqual({ ...calls[0][0], seekPermission: false })
  })

  it('fails when the denied scope remains accessible', async () => {
    const getPublicKey = vi.fn().mockRejectedValueOnce(denied()).mockResolvedValue({ publicKey })
    await expect(permissionDenyKey(runner, { getPublicKey })).rejects.toThrow('should have been rejected')
  })

  it('fails when approval does not persist', async () => {
    const getPublicKey = vi.fn().mockResolvedValueOnce({ publicKey }).mockRejectedValue(denied())
    await expect(permissionAllowKey(runner, { getPublicKey })).rejects.toThrow('Permission denied')
  })

  it('does not accept timeouts as denials', async () => {
    await expect(permissionDenyKey(runner, { getPublicKey: async () => { throw new Error('Timed out') } })).rejects.toThrow('Timed out')
  })

  it('uses a new key ID for each run', async () => {
    const getPublicKey = vi.fn(async () => ({ publicKey }))
    await permissionAllowKey(runner, { getPublicKey })
    await permissionAllowKey(runner, { getPublicKey })
    const calls = getPublicKey.mock.calls as unknown as GetPublicKeyArgs[][]
    expect(calls[0][0].keyID).not.toBe(calls[2][0].keyID)
  })
})
