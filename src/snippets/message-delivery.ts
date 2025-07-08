import { WalletClient, Utils } from '@bsv/sdk'
import { MessageBoxClient } from '@bsv/message-box-client'

export async function encryptDecrypt(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()

    const ciphertext = 'lSGqYAvSqCYIn49oKYOAsyVF7DsXPdp0wvQFmRTv72tEMJ3iEGw/OQOEkupDPV2uDCxeldiI6H6Sn+UAhGtx4RurQ++Je3xPHQ=='

    const { plaintext } = await wallet.decrypt({
        ciphertext: response.ciphertext,    
        counterparty,
        keyID,
        protocolID
    })

    const checkMessage = Utils.toUTF8(plaintext)

    runner.log({ checkMessage })

}