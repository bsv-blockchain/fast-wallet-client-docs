import { WalletClient, Utils, ProtoWallet } from '@bsv/sdk'
import { MessageBoxClient } from '@bsv/message-box-client'

export async function receiveMessage(runner) {

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

    runner.log({ list })

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