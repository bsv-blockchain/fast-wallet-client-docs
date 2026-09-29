import { Hash, P2PKH, PublicKey, Random, Transaction, Utils } from '@bsv/sdk'
import { brc29ProtocolID } from '@bsv/wallet-toolbox-client'
import { conformanceWallet } from './support'

export async function conformanceInternalizeAction(runner) {
  const wallet = conformanceWallet()
  const { publicKey: identityKey } = await wallet.getPublicKey({ identityKey: true })
  const prefixBytes = Random(12)
  const derivationPrefix = Utils.toBase64(prefixBytes)
  const derivationSuffix = Utils.toBase64(Hash.sha512hmac(prefixBytes, 'output_0'))
  const keyID = `${derivationPrefix} ${derivationSuffix}`
  const { publicKey } = await wallet.getPublicKey({
    protocolID: brc29ProtocolID,
    keyID,
    counterparty: identityKey
  })
  const lockingScript = new P2PKH().lock(PublicKey.fromString(publicKey).toAddress()).toHex()

  // Broadcasts a 1-satoshi payment back to this wallet, then internalizes it.
  const created = await wallet.createAction({
    description: 'conformance self payment',
    outputs: [{
      satoshis: 1,
      lockingScript,
      outputDescription: 'conformance self payment'
    }],
    options: {
      acceptDelayedBroadcast: false,
      randomizeOutputs: false
    }
  })
  if (created.tx == null) throw new Error('createAction did not return the payment transaction')

  const tx = Array.from(created.tx)
  const transaction = Transaction.fromAtomicBEEF(tx)
  const target = PublicKey.fromString(publicKey).toHash('hex')
  let outputIndex = -1
  transaction.outputs.forEach((output, vout) => {
    if (Utils.toHex(output.lockingScript.chunks[2].data) === target) outputIndex = vout
  })
  if (outputIndex < 0) throw new Error('Could not find the conformance payment output')

  const response = await wallet.internalizeAction({
    description: 'conformance internalize',
    tx,
    outputs: [{
      outputIndex,
      protocol: 'wallet payment',
      paymentRemittance: {
        derivationPrefix,
        derivationSuffix,
        senderIdentityKey: identityKey
      }
    }]
  })
  if (response.accepted !== true) {
    throw new Error('internalizeAction did not accept the payment')
  }
  runner.log({ txid: created.txid, outputIndex, accepted: true })
}
