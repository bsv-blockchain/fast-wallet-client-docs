import { WalletClient, Script, PushDrop, SecurityLevels, WalletProtocol, Transaction, TopicBroadcaster } from '@bsv/sdk'

export async function spendTokenFromOverlay(runner) {

    // Connect to user's wallet 
    const wallet = new WalletClient()

    // List the spendable tokens within this user's basket
    const list = await wallet.listOutputs({
        basket: 'hello world',
        include: 'entire transactions',
        includeCustomInstructions: true
    })

    const token = new PushDrop(wallet)

    const protocolID: WalletProtocol = [SecurityLevels.Silent, 'hello world']
    const keyID = list.outputs[0].customInstructions
    const counterparty = 'self'
    const sighash = 'none'
    const anyoneCanPay = true
    const satoshis = 1

    const [txid, vout] = list.outputs[0].outpoint.split('.')
    const sourceTransaction = Transaction.fromBEEF(list.BEEF, txid)
    const placeholdingTx = new Transaction()
    placeholdingTx.addInput({
        sourceTransaction,
        sourceOutputIndex: Number(vout),
        unlockingScriptTemplate: token.unlock(protocolID, keyID, counterparty, sighash, anyoneCanPay, satoshis)
    })
    placeholdingTx.addOutput({
        satoshis,
        lockingScript: Script.fromASM('OP_TRUE')
    })
    await placeholdingTx.sign()

    // Redeem a token which represents an event ticket
    const response = await wallet.createAction({
      description: 'spend hello world token',
      inputBEEF: list.BEEF,
      inputs: [{
        outpoint: list.outputs[0].outpoint,
        unlockingScript: placeholdingTx.inputs[0].unlockingScript.toHex(),
        inputDescription: 'hello world token'
      }]
    })

    // Capture the resulting transaction
    const tx = Transaction.fromBEEF(response.tx)

    runner.log(response)

    // Lookup a service which accepts this type of token
    const overlay = new TopicBroadcaster(['tm_helloworld'])
    
    // Send the tx to that overlay.
    const overlayResponse = await tx.broadcast(overlay)
    
    runner.log(overlayResponse)
    
}