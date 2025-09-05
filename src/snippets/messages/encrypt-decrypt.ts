import { WalletClient, Utils, Random, WalletProtocol } from '@bsv/sdk'

export async function encryptDecrypt(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()

    const message = 'This is a secret message.'
    const keyID = Utils.toBase64(Random(8))
    const protocolID = [1, 'secrets of unbounded importance'] as WalletProtocol
    const counterparty = '02fad5aee3b44846719c74832c33477adf6eeb1778901245c7bc0eb66687082e74'
    
    // Encrypt the plaintext using a derived key shared between the current user and the counterparty
    const response = await wallet.encrypt({
        plaintext: Utils.toArray(message, 'utf8'),
        counterparty,
        keyID,
        protocolID
    })

    const encrypted = Utils.toBase64(response.ciphertext)

    runner.log({ encrypted })

    const { plaintext } = await wallet.decrypt({
        ciphertext: response.ciphertext,    
        counterparty,
        keyID,
        protocolID
    })

    const checkMessage = Utils.toUTF8(plaintext)

    runner.log({ checkMessage })

}