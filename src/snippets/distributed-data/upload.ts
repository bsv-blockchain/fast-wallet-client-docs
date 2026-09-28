import { StorageUploader, Utils } from '@bsv/sdk'
import { createWalletClient } from '../wallet'

export async function upload(runner) {

    // Connect to user's wallet
    const wallet = createWalletClient()

    // Setup a client for uploading documents
    const uploader = new StorageUploader({
        wallet,
        storageURL: 'https://go-uhrp-us-1.bsvblockchain.tech'
    })

    const data = Utils.toArray('This can be any file buffer', 'utf8')

    const response = await uploader.publishFile({ 
        file: { 
            data, 
            type: 'text/plain' 
        }, 
        retentionPeriod: 180 // minutes
    })

    runner.log(response)
    
}