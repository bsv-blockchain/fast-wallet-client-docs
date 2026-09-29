import { Utils } from '@bsv/sdk'
import type { SnippetRunner } from '../../lib/snippet-runner'
import { check, checkBytes, reliabilityWallet, sameBytes, scope, type CryptoWallet } from './support'

export async function reliabilityEncryptionBoundaries(runner: SnippetRunner, wallet: CryptoWallet = reliabilityWallet()) {
  const cases = [
    ...[0, 1, 16, 255, 256, 1024].map(length => Array.from({ length }, (_, index) => index % 256)),
    Utils.toArray('Wallet round trip: café 🧪 日本語\u0000', 'utf8'),
  ]
  for (const plaintext of cases) {
    const encrypted = await wallet.encrypt({ ...scope, plaintext })
    checkBytes(encrypted.ciphertext, 'ciphertext')
    check(encrypted.ciphertext.length > 0, 'encrypt returned empty ciphertext')
    const decrypted = await wallet.decrypt({ ...scope, ciphertext: encrypted.ciphertext })
    checkBytes(decrypted.plaintext, 'plaintext')
    check(sameBytes(plaintext, decrypted.plaintext), `Round trip changed ${plaintext.length} bytes`)
    runner.log({ plaintextBytes: plaintext.length, roundTrip: true })
  }
}
