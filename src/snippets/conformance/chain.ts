import { WalletClient } from '@bsv/sdk'

export async function conformanceChain(runner) {
  const wallet = new WalletClient()

  const { height } = await wallet.getHeight({})
  if (!Number.isInteger(height) || height < 1) {
    throw new Error('getHeight did not return a positive integer')
  }

  const { header } = await wallet.getHeaderForHeight({ height })
  if (!/^[0-9a-fA-F]{160}$/.test(header)) {
    throw new Error('getHeaderForHeight did not return 80 bytes of hex')
  }

  runner.log({ height, headerBytes: header.length / 2 })
}
