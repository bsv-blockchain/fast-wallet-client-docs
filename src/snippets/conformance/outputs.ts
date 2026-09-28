import { createWalletClient } from '../wallet'

export async function conformanceOutputs(runner) {
  const wallet = createWalletClient()

  const listed = await wallet.listOutputs({
    basket: 'default',
    limit: 5,
    include: 'locking scripts'
  })

  if (!Number.isInteger(listed.totalOutputs) || listed.totalOutputs < 0) {
    throw new Error('listOutputs did not return a total')
  }
  if (!Array.isArray(listed.outputs)) {
    throw new Error('listOutputs did not return an outputs array')
  }

  runner.log({
    totalOutputs: listed.totalOutputs,
    returned: listed.outputs.length
  })
}
