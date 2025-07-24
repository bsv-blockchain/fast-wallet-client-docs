import { WalletClient, Utils, Random, WalletProtocol, MasterCertificate, VerifiableCertificate } from '@bsv/sdk'

export async function existingCertificate(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()

    const type = Utils.toBase64(Utils.toArray('internet plumbing', 'utf8'))

    const response = await wallet.listCertificates({
        certifiers: ['03c644fe2fd97673a5d86555a58587e7936390be6582ece262bc387014bcff6fe4'],
        types: [type],
        limit: 1
    })

    const certificate = response.certificates[0]
    const fields = await MasterCertificate.decryptFields(wallet, certificate.keyring, certificate.fields, certificate.certifier)

    const partialRevelation = { moustache: certificate.keyring.moustache }
    
    const moustacheCredential = VerifiableCertificate.fromCertificate(certificate, partialRevelation)
    
    runner.log({ moustacheCredential })

}