import { PrivateKey, Random, Utils, type WalletInterface, type WalletProtocol } from '@bsv/sdk'
import type { SnippetRunner } from '../../lib/snippet-runner'
import { check, checkPublicKey, expectWalletError, reliabilityWallet } from '../reliability/support'

type KeyWallet = Pick<WalletInterface, 'getPublicKey'>

function freshRequest() {
  // Level 2 permissions are scoped per counterparty. Rotate the counterparty,
  // as changing only a key ID would reuse an existing protocol permission.
  return {
    protocolID: [2, 'fast permission probe'] as WalletProtocol,
    keyID: `probe ${Utils.toHex(Random(8))}`,
    counterparty: PrivateKey.fromRandom().toPublicKey().toString(),
    forSelf: true,
  }
}

export async function permissionAllowKey(runner: SnippetRunner, wallet: KeyWallet = reliabilityWallet()) {
  const request = freshRequest()
  runner.log('Approve the key request in your wallet. After approving, the same key must be available with seekPermission=false.')
  const allowed = await wallet.getPublicKey({ ...request, seekPermission: true })
  checkPublicKey(allowed.publicKey)
  const repeated = await wallet.getPublicKey({ ...request, seekPermission: false })
  check(allowed.publicKey === repeated.publicKey, 'Approved scope was not available without seeking permission again')
  runner.log({ approvedScopeReusable: true })
}

export async function permissionDenyKey(runner: SnippetRunner, wallet: KeyWallet = reliabilityWallet()) {
  const request = freshRequest()
  runner.log('Deny the key request in your wallet. Both the denial and the no-prompt retry must return a permission error.')
  const denied = () => wallet.getPublicKey({ ...request, seekPermission: true })
  const noPrompt = () => wallet.getPublicKey({ ...request, seekPermission: false })
  const codes = ['ERR_PERMISSION_DENIED']
  const messages = ['Permission denied.', 'The user has denied the request for permission.']
  await expectWalletError(denied, codes, messages)
  await expectWalletError(noPrompt, codes, messages)
  runner.log({ denied: true, noPromptRetryDenied: true })
}
