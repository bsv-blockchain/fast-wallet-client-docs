import { PrivateKey, WalletClient, WalletProtocol } from '@bsv/sdk'

export async function conformanceLinkage(runner) {
  const wallet = new WalletClient()

  // Unrelated compressed keys, so the probe does not depend on another wallet.
  const verifier = PrivateKey.fromHex('11'.repeat(32)).toPublicKey().toDER('hex') as string
  const counterparty = PrivateKey.fromHex('22'.repeat(32)).toPublicKey().toDER('hex') as string
  const protocolID = [1, 'conformance'] as WalletProtocol
  const keyID = 'linkage probe'

  const counterpartyLinkage = await wallet.revealCounterpartyKeyLinkage({
    counterparty,
    verifier
  })
  if (counterpartyLinkage.verifier.toLowerCase() !== verifier.toLowerCase()) {
    throw new Error('revealCounterpartyKeyLinkage returned a different verifier')
  }
  if (counterpartyLinkage.counterparty.toLowerCase() !== counterparty.toLowerCase()) {
    throw new Error('revealCounterpartyKeyLinkage returned a different counterparty')
  }

  const specificLinkage = await wallet.revealSpecificKeyLinkage({
    counterparty: 'self',
    verifier,
    protocolID,
    keyID
  })
  if (specificLinkage.verifier.toLowerCase() !== verifier.toLowerCase()) {
    throw new Error('revealSpecificKeyLinkage returned a different verifier')
  }
  if (specificLinkage.protocolID[0] !== protocolID[0] || specificLinkage.protocolID[1] !== protocolID[1]) {
    throw new Error('revealSpecificKeyLinkage returned a different protocol')
  }
  if (specificLinkage.keyID !== keyID) {
    throw new Error('revealSpecificKeyLinkage returned a different key ID')
  }

  runner.log({
    counterpartyLinkage: {
      prover: counterpartyLinkage.prover,
      verifier: counterpartyLinkage.verifier,
      counterparty: counterpartyLinkage.counterparty,
      revelationTime: counterpartyLinkage.revelationTime
    },
    specificLinkage: {
      prover: specificLinkage.prover,
      counterparty: specificLinkage.counterparty,
      protocolID: specificLinkage.protocolID,
      keyID: specificLinkage.keyID,
      proofType: specificLinkage.proofType
    }
  })
}
