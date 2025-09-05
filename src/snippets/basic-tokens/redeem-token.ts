import { WalletClient, Script } from '@bsv/sdk'

export async function redeemToken(runner) {

    // Connect to user's wallet 
    const wallet = new WalletClient()

    // List the spendable tokens within this user's basket
    const list = await wallet.listOutputs({
        basket: 'event tickets',
        include: 'entire transactions',
        limit: 1
    })

    runner.log({ list })
    if (list.outputs.length === 0) return

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

    return runner.log({ response })
    
}