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

    const c = response.certificates[0]
    const fields = await MasterCertificate.decryptFields(wallet, c.keyring, c.fields, c.certifier)

    runner.log({ fields })

    // Create a verifiable certificate
    const fieldsToReveal = ['moustache'] // revealing this field only
    const verifier = '02ec9b58db65002d0971c3abe2eef3403d23602d8de2af51445d84e1b64c11a646' // to this identity

    const verifierKeyring = await MasterCertificate.createKeyringForVerifier(
        wallet,
        c.certifier,
        verifier,
        c.fields,
        fieldsToReveal,
        c.keyring,
        c.serialNumber
    )

    const verifiableCertificate = VerifiableCertificate.fromCertificate(c, verifierKeyring)
    
    runner.log({ verifiableCertificate })

}