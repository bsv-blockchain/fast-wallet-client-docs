import { WalletClient, Utils } from '@bsv/sdk'

export async function createCertificate(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient('auto', 'deggen')
    
    // Server key at our certifier endpoint
    const certifier = '03c644fe2fd97673a5d86555a58587e7936390be6582ece262bc387014bcff6fe4'
    
    const type = Utils.toBase64(Utils.toArray('internet plumbing', 'utf8'))

    // Create a certificate of anything you need
    const response = await wallet.acquireCertificate({
      type,
      acquisitionProtocol: 'issuance',
      certifier,
      certifierUrl: 'https://certify.bsvb.tech',
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