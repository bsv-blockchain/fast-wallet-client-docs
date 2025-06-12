import { WalletClient } from '@bsv/sdk'

export async function listTokens(runner) {

    // Create a WalletClient instance
    const wallet = new WalletClient()

    // List the spendable tokens within this user's basket
    const response = await wallet.listOutputs({
      basket: 'event tickets'
    })

    return runner.log(response)
    
}