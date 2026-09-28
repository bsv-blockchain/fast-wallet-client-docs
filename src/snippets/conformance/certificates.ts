import { Hash, Utils } from '@bsv/sdk'
import { createWalletClient } from '../wallet'

export async function conformanceCertificates(runner) {
  const wallet = createWalletClient()

  // Same 32-byte type as the Certificates examples.
  const type = Utils.toBase64(Hash.sha256('internet plumbing', 'utf8'))
  const certifier = '03c644fe2fd97673a5d86555a58587e7936390be6582ece262bc387014bcff6fe4'
  const verifier = '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'

  const listed = await wallet.listCertificates({
    certifiers: [certifier],
    types: [type],
    limit: 5
  })

  if (!Number.isInteger(listed.totalCertificates) || !Array.isArray(listed.certificates)) {
    throw new Error('listCertificates did not return a certificate list')
  }

  const certificate = listed.certificates[0]
  if (!certificate) {
    runner.log({
      totalCertificates: listed.totalCertificates,
      proveCertificate: 'skipped, wallet has no certificate of this type'
    })
    return
  }

  const fieldName = Object.keys(certificate.fields)[0]
  if (!fieldName) {
    runner.log({
      totalCertificates: listed.totalCertificates,
      proveCertificate: 'skipped, certificate has no fields'
    })
    return
  }

  const proof = await wallet.proveCertificate({
    certificate: {
      type: certificate.type,
      serialNumber: certificate.serialNumber,
      certifier: certificate.certifier,
      subject: certificate.subject,
      revocationOutpoint: certificate.revocationOutpoint,
      signature: certificate.signature,
      fields: certificate.fields
    },
    fieldsToReveal: [fieldName],
    verifier
  })

  if (!Object.prototype.hasOwnProperty.call(proof.keyringForVerifier, fieldName)) {
    throw new Error('proveCertificate did not reveal the requested field')
  }

  runner.log({
    totalCertificates: listed.totalCertificates,
    provedField: fieldName
  })
}
