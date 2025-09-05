import { WalletClient, Random, Utils, Hash, PublicKey } from '@bsv/sdk'
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client'

export async function payToIdentity(runner) {

  const bobIdentityKey = '025706528f0f6894b2ba505007267ccff1133e004452a1f6b72ac716f246216366'

  const wallet = new WalletClient()

  // Consider this like a payment id
  const derivationPrefix = Utils.toBase64(Random(12))
  // This must be unique for every key
  const derivationSuffix = Utils.toBase64(Hash.sha512hmac(derivationPrefix,'output_0'))

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
