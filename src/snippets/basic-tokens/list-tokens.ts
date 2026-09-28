import { createWalletClient } from '../wallet'

export async function listTokens(runner) {

    // Connect to user's wallet
    const wallet = createWalletClient()

    // List the spendable tokens within this user's basket
    const response = await wallet.listOutputs({
      basket: 'event tickets'
    })

    return runner.log(response)
    
}