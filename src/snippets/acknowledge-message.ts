import { WalletClient, Utils, ProtoWallet } from '@bsv/sdk'
import { MessageBoxClient } from '@bsv/message-box-client'

export async function acknowledgeMessage(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()

    const mbc = new MessageBoxClient({
        host: 'https://message-box-us-1.bsvb.tech',
        walletClient: wallet
    })

    // grab any encrypted messages which are for you
    const list = await mbc.listMessages({
        messageBox: 'secrets of utmost importance',
        host: 'https://message-box-us-1.bsvb.tech'
    })

    const response = await mbc.acknowledgeMessage({
        messageIds: list.map(item => item.messageId),
        host: 'https://message-box-us-1.bsvb.tech'
    })

    runner.log(response)

}