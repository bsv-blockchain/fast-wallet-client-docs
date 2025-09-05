import { IdentityClient } from '@bsv/sdk'

export async function resolveIdentityKey(runner) {
  const identityClient = new IdentityClient()

  const response = await identityClient.resolveByAttributes({
    attributes: {
      userName: 'deggen' // X handle
    }
  })

  return runner.log(response[0])
}
