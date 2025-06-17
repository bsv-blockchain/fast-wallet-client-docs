import { LookupResolver } from '@bsv/sdk'

export async function listHelloWorldTokens(runner) {

    const overlay = new LookupResolver()

    const response = await overlay.query({ service: 'ls_helloworld', query: {
        limit: 3,
        skip: 0,
        sortOrder: 'desc',
        message: 'Hello Overlay'
    } }, 10000);

    runner.log(response)
    
}