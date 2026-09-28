import { IdentityClient } from '@bsv/sdk'
import { createWalletClient } from '../wallet'

export async function resolveIdentityKey(runner) {

  const identityClient = new IdentityClient(createWalletClient())

  const response = await identityClient.resolveByAttributes({
    attributes: {
      userName: 'deggen' // X handle
    }
  })

  return runner.log(response[0])
  
}
