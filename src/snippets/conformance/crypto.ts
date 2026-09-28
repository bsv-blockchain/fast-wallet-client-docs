import { Utils, WalletProtocol } from '@bsv/sdk'
import { createWalletClient } from '../wallet'

export async function conformanceCrypto(runner) {
  const wallet = createWalletClient()
  const protocolID = [1, 'conformance'] as WalletProtocol
  const keyID = 'round trip'
  const counterparty = 'self'
  const message = 'conformance probe'

  const { publicKey } = await wallet.getPublicKey({ identityKey: true })
  if (!/^[0-9a-fA-F]{66}$/.test(publicKey)) {
    throw new Error('getPublicKey did not return a compressed public key')
  }

  const encrypted = await wallet.encrypt({
    plaintext: Utils.toArray(message, 'utf8'),
    protocolID,
    keyID,
    counterparty
  })
  const decrypted = await wallet.decrypt({
    ciphertext: encrypted.ciphertext,
    protocolID,
    keyID,
    counterparty
  })
  if (Utils.toUTF8(decrypted.plaintext) !== message) {
    throw new Error('decrypt did not return the encrypted plaintext')
  }

  const data = Utils.toArray(message, 'utf8')
  const hmac = await wallet.createHmac({ data, protocolID, keyID, counterparty })
  if (hmac.hmac.length !== 32) {
    throw new Error('createHmac did not return 32 bytes')
  }
  const hmacCheck = await wallet.verifyHmac({ data, hmac: hmac.hmac, protocolID, keyID, counterparty })
  if (hmacCheck.valid !== true) {
    throw new Error('verifyHmac rejected a freshly created HMAC')
  }

  const signed = await wallet.createSignature({ data, protocolID, keyID, counterparty })
  const signatureCheck = await wallet.verifySignature({
    data,
    signature: signed.signature,
    protocolID,
    keyID,
    counterparty,
    forSelf: true
  })
  if (signatureCheck.valid !== true) {
    throw new Error('verifySignature rejected a freshly created signature')
  }

  runner.log({
    identityKey: publicKey,
    encryptDecrypt: 'matched',
    hmacBytes: hmac.hmac.length,
    hmacValid: true,
    signatureValid: true
  })
}
