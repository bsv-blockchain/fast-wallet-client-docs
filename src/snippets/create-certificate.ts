import { WalletClient, ProtoWallet } from '@bsv/sdk'

export async function createCertificate(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()

    const certifier = new ProtoWallet('anyone')
    const { publicKey } = await certifier.getPublicKey({
      identityKey: true
    })

    // Create a token which represents an event ticket
    const response = await wallet.acquireCertificate({
      acquisitionProtocol: 'issuance',
      certifier: publicKey,
      certifierUrl: 'https://certify.brc.dev',
      type: 'plumbing skills',
      fields: {
        'soldering': 'veteran',
        'pipe fitting': 'expert',
        'customer service': 'delightful',
        'leaks': 'none whatsoever',
        'moustache': 'impressive',
      }
    })

    return runner.log(response)
    
}