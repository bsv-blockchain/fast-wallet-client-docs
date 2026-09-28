import { WalletClient } from '@bsv/sdk'

export async function conformanceSession(runner) {
  const wallet = new WalletClient()

  const authenticated = await wallet.isAuthenticated({})
  const waited = await wallet.waitForAuthentication({})
  const version = await wallet.getVersion({})
  const network = await wallet.getNetwork({})

  if (authenticated.authenticated !== true || waited.authenticated !== true) {
    throw new Error('Wallet did not report an authenticated session')
  }

  const versionText = version.version
  const versionOk = versionText.length >= 7
    && versionText.length <= 30
    && /^[^\s]+-\d+\.\d+\.\d+$/.test(versionText)
  if (!versionOk) {
    throw new Error(`Version "${versionText}" is not vendor-major.minor.patch within 7-30 bytes`)
  }

  if (network.network !== 'mainnet' && network.network !== 'testnet') {
    throw new Error(`Network "${String(network.network)}" is not mainnet or testnet`)
  }

  runner.log({
    authenticated: true,
    waited: true,
    version: versionText,
    network: network.network
  })
}
