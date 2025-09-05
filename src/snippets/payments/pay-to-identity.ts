import { WalletClient, Random, Utils, Hash, PublicKey } from '@bsv/sdk'
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client'

export async function payToIdentity(runner) {
  const bobIdentityKey = '02ec9b58db65002d0971c3abe2eef3403d23602d8de2af51445d84e1b64c11a646'

  const wallet = new WalletClient('auto', 'deggen')

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
