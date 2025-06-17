import { WalletClient } from '@bsv/sdk'

export async function listTokens(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()

    // List the spendable tokens within this user's basket
    const response = await wallet.listOutputs({
      basket: 'event tickets'
    })

    return runner.log(response)
    
}