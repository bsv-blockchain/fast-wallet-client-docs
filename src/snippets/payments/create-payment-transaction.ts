import { WalletClient,  PublicKey, P2PKH } from '@bsv/sdk'
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client'

export async function createPaymentTransaction(runner) {
  const wallet = new WalletClient('auto', 'deggen')

  const amount = 10
  const bobIdentityKey = '02ec9b58db65002d0971c3abe2eef3403d23602d8de2af51445d84e1b64c11a646'
  const { publicKey: senderIdentityKey } = await wallet.getPublicKey({
    identityKey: true
  })

  const paymentData = {
    senderIdentityKey,
    derivationPrefix: "efM69kM/9YZ9X4QV",
    derivationSuffix: "LgdVITVQAU7LNB/xbaBRRDjDcBaoG/vGBpzLDd328EoeHVzylxNE9SpW/p/kgCbbBPbW4I4R9d/xsOARzIxuCQ=="
  }

  const keyID = `${paymentData.derivationPrefix} ${paymentData.derivationSuffix}`
  const { publicKey: paymentPublicKey } = await wallet.getPublicKey({
    protocolID: brc29ProtocolID,
    keyID,
    counterparty: bobIdentityKey
  })

  const script = new P2PKH().lock(PublicKey.fromString(paymentPublicKey).toAddress())

  const response = await wallet.createAction({
    description: 'Create Payment Transaction',
    outputs: [{
      satoshis: amount,
      lockingScript: script.toHex(),
      outputDescription: `payment to Bob of ${amount} satoshis`,
      customInstructions: JSON.stringify(paymentData)
    }]
  })

  return runner.log(response)
}
