import { WalletClient, Script } from '@bsv/sdk'

export async function createToken(runner) {

    // Create a WalletClient instance, auto-find a wallet substrate, and declare the origin of the requests.
    const wallet = new WalletClient('auto', 'bsv-event-tickets.com')

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