import { Hash, PublicKey, Random, Utils } from '@bsv/sdk'
import { createWalletClient } from '../wallet'
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client'

export async function payToIdentity(runner) {

  const bobIdentityKey = '025706528f0f6894b2ba505007267ccff1133e004452a1f6b72ac716f246216366'

  const wallet = createWalletClient()

  // Consider this like a payment id. The other payment snippets share these
  // values as base64. Hash.sha512hmac accepts the key as bytes or hex.
  const derivationPrefixBytes = Random(12)
  const derivationPrefix = Utils.toBase64(derivationPrefixBytes)
  // This must be unique for every key
  const derivationSuffix = Utils.toBase64(Hash.sha512hmac(derivationPrefixBytes, 'output_0'))

  // repeat for as many outputs as you want
  const keyID = `${derivationPrefix} ${derivationSuffix}`

  const { publicKey } = await wallet.getPublicKey({
    protocolID: brc29ProtocolID,
    keyID,
    counterparty: bobIdentityKey
  })
  const address = PublicKey.fromString(publicKey).toAddress()

  return runner.log({ address })
  
}
