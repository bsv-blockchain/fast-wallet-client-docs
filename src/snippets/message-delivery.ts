import { WalletClient, Utils, ProtoWallet } from '@bsv/sdk'
import { MessageBoxClient } from '@bsv/message-box-client'

export async function messageDelivery(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()
    const { publicKey } = await wallet.getPublicKey({
        identityKey: true
    })

    // fake counterparty encrypts a message for you.
    const proto = new ProtoWallet('anyone')
    const { ciphertext } = await proto.encrypt({
        plaintext: Utils.toArray('Something only we can know', 'utf8'),
        counterparty: publicKey,
        keyID: 'random string',
        protocolID: [0, 'secrets']
    })


    const mbc = new MessageBoxClient({
        host: 'https://message-box-us-1.bsvb.tech',
        walletClient: wallet
    })

    // send the encrypted message to the message box
    const response = await mbc.sendMessage({
        body: Utils.toBase64(ciphertext),
        recipient: publicKey,
        messageBox: 'secrets of utmost importance'
    }, 'https://message-box-us-1.bsvb.tech')

    runner.log(response)

}