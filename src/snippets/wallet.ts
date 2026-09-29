import { Random, Utils, WalletClient, type WalletInterface } from '@bsv/sdk'

type CWIHost = {
  getVersion?: unknown
}

type ReactNativeHost = Window & {
  CWI?: CWIHost
  ReactNativeWebView?: { postMessage?: (message: string) => void }
}

export type WalletBridgeDecision =
  | { type: 'ignore' }
  | { type: 'result'; result: unknown }
  | { type: 'error'; message: string; code?: string | number }

const MOBILE_WALLET_TIMEOUT_MS = 60_000

/**
 * @bsv/sdk 2.8 auto-discovery waits one second and accepts only a React Native
 * response status of "success". Mobile shells answer "ok" and often take longer
 * than that, so discovery reports that no wallet exists. An injected window.CWI
 * is bound directly. A bare ReactNativeWebView bridge accepts "ok" and "success".
 */
export function createWalletClient(originator?: string): WalletClient {
  const win = typeof window === 'object' ? (window as ReactNativeHost) : undefined
  if (win && isInjectedCWI(win.CWI)) {
    return new WalletClient('window.CWI', originator)
  }
  if (win && typeof win.ReactNativeWebView?.postMessage === 'function') {
    return new WalletClient(reactNativeWallet(win), originator)
  }
  return new WalletClient('auto', originator)
}

function isInjectedCWI(value: CWIHost | undefined): value is CWIHost {
  return value != null && typeof value.getVersion === 'function'
}

export function decideWalletBridgeMessage(raw: unknown, id: string): WalletBridgeDecision {
  let data = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      return { type: 'ignore' }
    }
  }
  if (data == null || typeof data !== 'object') return { type: 'ignore' }
  const message = data as Record<string, unknown>
  if (message.type !== 'CWI' || message.id !== id || message.isInvocation === true) {
    return { type: 'ignore' }
  }
  if (message.status === 'error') {
    return {
      type: 'error',
      message: typeof message.description === 'string' ? message.description : 'Wallet request failed',
      ...(typeof message.code === 'string' || typeof message.code === 'number' ? { code: message.code } : {})
    }
  }
  if (message.status != null && message.status !== 'ok' && message.status !== 'success') {
    return { type: 'ignore' }
  }
  return { type: 'result', result: message.result }
}

function reactNativeWallet(win: ReactNativeHost): WalletInterface {
  const post = win.ReactNativeWebView?.postMessage
  if (typeof post !== 'function') {
    throw new Error('The window object does not have a ReactNativeWebView property.')
  }
  const invoke = (call: string, args: unknown) =>
    new Promise((resolve, reject) => {
      const id = Utils.toBase64(Random(12))
      let settled = false
      const finish = (action: () => void) => {
        if (settled) return
        settled = true
        win.removeEventListener('message', onMessage)
        clearTimeout(timer)
        action()
      }
      const onMessage = (event: MessageEvent) => {
        const decision = decideWalletBridgeMessage(event.data, id)
        if (decision.type === 'ignore') return
        if (decision.type === 'error') {
          finish(() => reject(Object.assign(new Error(decision.message), { code: decision.code })))
          return
        }
        finish(() => resolve(decision.result))
      }
      const timer = setTimeout(() => {
        finish(() => reject(new Error('React Native wallet response timed out.')))
      }, MOBILE_WALLET_TIMEOUT_MS)
      win.addEventListener('message', onMessage)
      try {
        post(JSON.stringify({
          type: 'CWI',
          isInvocation: true,
          id,
          call,
          args: args ?? {}
        }))
      } catch (error) {
        finish(() => reject(error instanceof Error ? error : new Error('Failed to reach the React Native wallet.')))
      }
    })

  return new Proxy({} as WalletInterface, {
    get(_target, property) {
      if (typeof property !== 'string' || property === 'then') return undefined
      return (args?: unknown) => invoke(property, args ?? {})
    }
  })
}
