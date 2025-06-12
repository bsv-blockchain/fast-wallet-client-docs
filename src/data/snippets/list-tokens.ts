import { WalletClient } from '@bsv/sdk'

export async function listTokens(runner) {

    // Create a WalletClient instance, auto-find a wallet substrate, and declare the origin of the requests.
    const wallet = new WalletClient('auto', 'bsv-event-tickets.com')

    // Create a token which represents an event ticket
    const response = await wallet.listOutputs({
      basket: 'event tickets'
    })

    return runner.log(response)
    
}