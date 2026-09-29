import type { SnippetRunner } from '../../lib/snippet-runner'
import { check, checkPublicKey, reliabilityWallet, scope, type CryptoWallet } from './support'

export async function reliabilityKeyStability(runner: SnippetRunner, wallet: CryptoWallet = reliabilityWallet()) {
  const identity = await wallet.getPublicKey({ identityKey: true })
  const identityAgain = await wallet.getPublicKey({ identityKey: true })
  checkPublicKey(identity.publicKey)
  check(identity.publicKey === identityAgain.publicKey, 'Identity key changed between calls')
  const request = { ...scope, forSelf: true }
  const first = await wallet.getPublicKey(request)
  const repeated = await wallet.getPublicKey(request)
  const otherKey = await wallet.getPublicKey({ ...request, keyID: 'other probe' })
  const otherProtocol = await wallet.getPublicKey({ ...request, protocolID: [1, 'fast reliability other'] })
  for (const result of [first, repeated, otherKey, otherProtocol]) checkPublicKey(result.publicKey)
  check(first.publicKey === repeated.publicKey, 'Identical derivation requests returned different keys')
  check(new Set([first.publicKey, otherKey.publicKey, otherProtocol.publicKey]).size === 3, 'Protocol and key IDs must isolate derived keys')
  runner.log({ identityStable: true, derivationStable: true, isolatedScopes: 3 })
}
