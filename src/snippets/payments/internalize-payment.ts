import { PrivateKey, PublicKey, Utils, KeyDeriver, Transaction, P2PKH, WalletClient } from '@bsv/sdk'
import { brc29ProtocolID, WalletStorageManager, WalletSigner, Services, StorageClient, Wallet } from '@bsv/wallet-toolbox-client'

export async function internalizePayment(runner) {
  
  // Create a Bob wallet for demonstration purposes only.
  const bob = PrivateKey.fromWif('KzJZf4P8KmdHQcZ7KpRu3eqp75qn8wh2eotaomCStB9XGv5b7ENS')
  const keyDeriver = new KeyDeriver(bob)
  const storageManager = new WalletStorageManager(keyDeriver.identityKey)
  const signer = new WalletSigner('main', keyDeriver, storageManager)
  const services = new Services('main')
  const w = new Wallet(signer, services)
  const client = new StorageClient(
    w,
    'https://store-us-1.bsvb.tech'
  )
  await client.makeAvailable()
  await storageManager.addWalletStorageProvider(client)

  // Imagine this was a regular WalletClient - the w just means we're doing this for Bob not the local user.
  const wallet = new WalletClient(w)

  // Using localStorage for this demo only, in real world you'd get this p2p or via message box.
  const payments = JSON.parse(localStorage.getItem('payments') || '[]')
  const payment = payments.shift()
  if (!payment) throw new Error('You must run the Create Payment Transaction snippet first')
  const keyID = `${payment.paymentData.derivationPrefix} ${payment.paymentData.derivationSuffix}`

  const { publicKey: paymentPublicKey } = await wallet.getPublicKey({
    protocolID: brc29ProtocolID,
    keyID,
    counterparty: payment.paymentData.senderIdentityKey,
    forSelf: true
  })
  
  const transaction = Transaction.fromBEEF(payment.response.tx)
  let bobsOutput = -1
  const target = PublicKey.fromString(paymentPublicKey).toHash('hex')
  transaction.outputs.map((output, vout) => {
    console.log(Utils.toHex(output.lockingScript.chunks[2].data) , target)
    if (Utils.toHex(output.lockingScript.chunks[2].data) === target) {
      bobsOutput = vout
    }
    return null
  })

  // Really all this does is store the details of the utxo we control so that we can use it.
  // This will add funds to our default basket.
  const response = await wallet.internalizeAction({
    description: 'Payment from demo user',
    tx: payment.response.tx,
    outputs: [{
      outputIndex: bobsOutput,
      protocol: 'wallet payment',
      paymentRemittance: {
        derivationPrefix: payment.paymentData.derivationPrefix,
        derivationSuffix: payment.paymentData.derivationSuffix,
        senderIdentityKey: payment.paymentData.senderIdentityKey
      }
    }]
  })

  runner.log(response)

}
