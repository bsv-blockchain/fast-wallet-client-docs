// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createWalletClient, decideWalletBridgeMessage } from './wallet'

afterEach(() => vi.unstubAllGlobals())

describe('React Native bridge errors', () => {
  it.each(['ERR_PERMISSION_DENIED', 3, 4])('preserves code %s', code => {
    expect(decideWalletBridgeMessage(JSON.stringify({ type: 'CWI', id: 'probe', status: 'error', description: 'denied', code }), 'probe')).toEqual({ type: 'error', message: 'denied', code })
  })

  it('ignores unrelated and malformed messages', () => {
    expect(decideWalletBridgeMessage('invalid JSON', 'probe').type).toBe('ignore')
    expect(decideWalletBridgeMessage({ type: 'CWI', id: 'other', status: 'ok' }, 'probe').type).toBe('ignore')
  })

  it('propagates the error code to WalletClient callers', async () => {
    const postMessage = vi.fn((raw: string) => {
      const { id } = JSON.parse(raw)
      window.dispatchEvent(new MessageEvent('message', { data: { type: 'CWI', id, status: 'error', description: 'Permission denied.', code: 'ERR_PERMISSION_DENIED' } }))
    })
    vi.stubGlobal('ReactNativeWebView', { postMessage })
    const wallet = createWalletClient()
    await expect(wallet.getPublicKey({ protocolID: [2, 'fast permission probe'], keyID: 'probe', counterparty: 'self' })).rejects.toMatchObject({ code: 'ERR_PERMISSION_DENIED' })
    expect(postMessage).toHaveBeenCalledTimes(1)
  })
})
