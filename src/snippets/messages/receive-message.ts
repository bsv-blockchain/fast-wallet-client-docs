import { ProtoWallet, Utils } from '@bsv/sdk'
import { createWalletClient } from '../wallet'
import { MessageBoxClient } from '@bsv/message-box-client'

export async function receiveMessage(runner) {

    // Connect to user's wallet
    const wallet = createWalletClient()

    const mbc = new MessageBoxClient({
        host: 'https://message-box-us-1.bsvb.tech',
        walletClient: wallet
    })

    // grab any encrypted messages which are for you
    const list = await mbc.listMessages({
        messageBox: 'secrets of utmost importance',
        host: 'https://message-box-us-1.bsvb.tech'
    })

    runner.log({ list })
    if (list.length === 0) {
        runner.log('No messages yet. Run Delivering Messages Securely first.')
        return
    }

    // use fake counterparty for demo
    const proto = new ProtoWallet('anyone')
    const { publicKey } = await proto.getPublicKey({
        identityKey: true
    })

    // decrypt to reveal the message
    const { plaintext } = await wallet.decrypt({
        ciphertext: Utils.toArray(list[0].body, 'base64'),
        counterparty: publicKey,
        keyID: 'random string',
        protocolID: [0, 'secrets']
    })
    
    const message = Utils.toUTF8(plaintext)

    runner.log({ message })

}