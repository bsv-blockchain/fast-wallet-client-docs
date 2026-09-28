import { createWalletClient } from '../wallet'

export async function conformanceDiscovery(runner) {
  const wallet = createWalletClient()

  const { publicKey } = await wallet.getPublicKey({ identityKey: true })

  const byKey = await wallet.discoverByIdentityKey({
    identityKey: publicKey,
    limit: 5
  })
  const byAttributes = await wallet.discoverByAttributes({
    attributes: { userName: 'deggen' },
    limit: 5
  })

  if (!Array.isArray(byKey.certificates) || !Array.isArray(byAttributes.certificates)) {
    throw new Error('Discovery did not return certificate lists')
  }

  runner.log({
    identityKey: publicKey,
    byIdentityKey: byKey.totalCertificates,
    byAttributes: byAttributes.totalCertificates
  })
}
