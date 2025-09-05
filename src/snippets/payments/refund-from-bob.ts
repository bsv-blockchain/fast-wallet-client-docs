import { PrivateKey, WalletClient, Utils, KeyDeriver, Transaction, P2PKH } from '@bsv/sdk'
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client'

export async function refundFromBob(runner) {

  // Create a Bob wallet for demonstration purposes only.
  const bob = PrivateKey.fromWif('KzJZf4P8KmdHQcZ7KpRu3eqp75qn8wh2eotaomCStB9XGv5b7ENS')
  const keyDeriver = new KeyDeriver(bob)
  
  // Using localStorage for this demo only, in real world you'd get this p2p or via message box.
  const payments = JSON.parse(localStorage.getItem('payments') || '[]')
  const payment = payments.shift()
  if (!payment) throw new Error('You must run the createPaymentTransaction snippet first')
  const keyID = `${payment.paymentData.derivationPrefix} ${payment.paymentData.derivationSuffix}`
  
  // This is how we get the corresponding private key when not using the wallet-toolbox, 
  // but in real world use this is calculated automatically by wallet-toolbox internals.
  const privateKey = keyDeriver.derivePrivateKey(brc29ProtocolID, keyID, payment.paymentData.senderIdentityKey)
  const transaction = Transaction.fromBEEF(payment.response.tx)
  let bobsOutput = -1
  const target = privateKey.toPublicKey().toHash('hex')
  transaction.outputs.forEach((output, vout) => {
    if (Utils.toHex(output.lockingScript.chunks[2].data) === target) {
      bobsOutput = vout
    }
  })
  
  const wallet = new WalletClient()

  // Create a draft unsigned transaction really to define outputs                               for ourselves automatically.
  const response = await wallet.createAction({
    description: 'Bob sending his money back',
    inputBEEF: payment.response.tx,
    inputs: [{
      outpoint: `${payment.response.txid}.${bobsOutput}`,
      unlockingScriptLength: 108,
      inputDescription: 'refund from Bob'
    }]
  })

  const refundTx = Transaction.fromBEEF(response.signableTransaction.tx)

  // We imagine that Bob signs it
  refundTx.inputs[0].unlockingScriptTemplate = new P2PKH().unlock(privateKey)
  await refundTx.fee()
  await refundTx.sign()

  // apply the signature to the draft and broadcast it
  const finalResponse = await wallet.signAction({
    reference: response.signableTransaction.reference,
    spends: {
      [0]: {
        unlockingScript: refundTx.inputs[0].unlockingScript.toHex()
      }
    }
  })

  runner.log(finalResponse)

  if (finalResponse.txid) {
    // remove the payment from localStorage
    localStorage.setItem('payments', JSON.stringify(payments))
  }

}
