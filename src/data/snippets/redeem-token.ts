import { WalletClient, Script } from '@bsv/sdk'

export async function redeemToken(runner) {

    // Create a WalletClient instance, auto-find a wallet substrate, and declare the origin of the requests.
    const wallet = new WalletClient('auto', 'bsv-event-tickets.com')

    // List the spendable tokens within this user's basket
    const list = await wallet.listOutputs({
        basket: 'event tickets',
        include: 'entire transactions'
    })

    // Redeem a token which represents an event ticket
    const response = await wallet.createAction({
      description: 'redeem an event ticket',
      inputBEEF: list.BEEF,
      inputs: [{
        outpoint: list.outputs[0].outpoint,
        unlockingScript: Script.fromASM('OP_TRUE').toHex(),
        inputDescription: 'event ticket'
      }]
    })

    return runner.log(response)
    
}