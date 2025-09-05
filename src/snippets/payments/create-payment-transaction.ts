import { PrivateKey, WalletClient,  PublicKey, P2PKH, ProtoWallet, WalletInterface } from '@bsv/sdk'
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client'

export async function createPaymentTransaction(runner) {
  
  const wallet = new WalletClient()

  // Create a Bob wallet for demonstration purposes only.
  const bob = PrivateKey.fromWif('KzJZf4P8KmdHQcZ7KpRu3eqp75qn8wh2eotaomCStB9XGv5b7ENS')
  const bobWallet = new WalletClient(new ProtoWallet(bob) as WalletInterface)
  const { publicKey: bobIdentityKey } = await bobWallet.getPublicKey({
    identityKey: true
  })

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
    description: 'Pay Bob',
    outputs: [{
      satoshis: 14,
      lockingScript: script.toHex(),
      outputDescription: `Payment to Bob of 14 satoshis`,
      customInstructions: JSON.stringify(paymentData)
    }]
  })

  // store the payment for use in other snippets
  const payments = JSON.parse(localStorage.getItem('payments') || '[]')
  payments.push({ response, paymentData })
  localStorage.setItem('payments', JSON.stringify(payments))

  return runner.log(response)

}
