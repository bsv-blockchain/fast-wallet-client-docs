import { Hash } from '@bsv/sdk'
import type { SnippetRunner } from '../../lib/snippet-runner'
import { check, checkBytes, expectWalletError, reliabilityWallet, scope, type CryptoWallet } from './support'

export async function reliabilitySignatureIntegrity(runner: SnippetRunner, wallet: CryptoWallet = reliabilityWallet()) {
  const data = [0, 1, 127, 128, 255]
  const hash = Hash.sha256(data)
  const signed = await wallet.createSignature({ ...scope, data })
  const direct = await wallet.createSignature({ ...scope, hashToDirectlySign: hash })
  for (const signature of [signed.signature, direct.signature]) {
    checkBytes(signature, 'signature')
    check(signature.length > 0, 'createSignature returned an empty signature')
    check((await wallet.verifySignature({ ...scope, data, signature, forSelf: true })).valid === true, 'Data verification failed')
    check((await wallet.verifySignature({ ...scope, hashToDirectlyVerify: hash, signature, forSelf: true })).valid === true, 'Direct hash verification failed')
  }
  for (const args of [
    { ...scope, data: [1, ...data.slice(1)], signature: signed.signature, forSelf: true },
    { ...scope, keyID: 'other probe', data, signature: signed.signature, forSelf: true },
  ]) {
    await expectWalletError(() => wallet.verifySignature(args), ['ERR_INVALID_SIGNATURE', 4], ['Signature is not valid'])
  }
  runner.log({ positiveChecks: 4, rejectedChanges: 2 })
}
