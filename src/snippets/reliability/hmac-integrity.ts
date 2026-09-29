import type { SnippetRunner } from '../../lib/snippet-runner'
import { check, checkBytes, expectWalletError, reliabilityWallet, sameBytes, scope, type CryptoWallet } from './support'

export async function reliabilityHmacIntegrity(runner: SnippetRunner, wallet: CryptoWallet = reliabilityWallet()) {
  const data = [0, 1, 127, 128, 255]
  const signed = await wallet.createHmac({ ...scope, data })
  checkBytes(signed.hmac, 'HMAC')
  check(signed.hmac.length === 32, 'HMAC must contain 32 bytes')
  const repeated = await wallet.createHmac({ ...scope, data })
  check(sameBytes(signed.hmac, repeated.hmac), 'HMAC changed for identical inputs')
  const verified = await wallet.verifyHmac({ ...scope, data, hmac: signed.hmac })
  check(verified.valid === true, 'Fresh HMAC failed verification')
  const changedHmac = signed.hmac.map((byte, index) => index === 0 ? byte ^ 1 : byte)
  for (const args of [
    { ...scope, data: [1, ...data.slice(1)], hmac: signed.hmac },
    { ...scope, data, hmac: changedHmac },
    { ...scope, keyID: 'other probe', data, hmac: signed.hmac },
  ]) {
    await expectWalletError(() => wallet.verifyHmac(args), ['ERR_INVALID_HMAC', 3], ['HMAC is not valid'])
  }
  runner.log({ stableHmac: true, positiveChecks: 1, rejectedChanges: 3 })
}
