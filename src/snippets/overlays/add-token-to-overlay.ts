import { WalletClient, PushDrop, Utils, SecurityLevels, WalletProtocol, TopicBroadcaster, Transaction } from '@bsv/sdk'

export async function addTokenToOverlay(runner) {

    // Connect to user's wallet 
    const wallet = new WalletClient()

    const token = new PushDrop(wallet)

    const fields = []
    fields.push(Utils.toArray('Hello Overlay', 'utf8'))

    const protocolID: WalletProtocol = [SecurityLevels.Silent, 'hello world']
    const keyID = Date.now().toString()
    const counterparty = 'self'

    const script = await token.lock(fields, protocolID, keyID, counterparty)

    // Create a token containing some data
    const response = await wallet.createAction({
      description: 'Create Hello World Token',
      outputs: [{
        satoshis: 1,
        lockingScript: script.toHex(),
        basket: 'hello world',
        outputDescription: 'hello world token',
        customInstructions: keyID
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