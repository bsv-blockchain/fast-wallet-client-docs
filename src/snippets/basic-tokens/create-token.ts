import { WalletClient, Script } from '@bsv/sdk'

export async function createToken(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()

    // Create a token which represents an event ticket
    const response = await wallet.createAction({
      description: 'create an event ticket',
      outputs: [{
        satoshis: 1,
        lockingScript: Script.fromASM('OP_NOP').toHex(),
        basket: 'event tickets',
        outputDescription: 'event ticket'
      }]
    })

    return runner.log(response)
    
}