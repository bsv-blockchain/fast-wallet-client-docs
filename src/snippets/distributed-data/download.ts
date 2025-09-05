import { WalletClient, StorageUploader, StorageDownloader, Utils } from '@bsv/sdk'

export async function download(runner) {

    // Connect to user's wallet
    const wallet = new WalletClient()

    // Setup a client for downloading, note a storageURL is not needed, the overlay will resolve that.
    const uhrp = new StorageDownloader()
    
    // This will download one we uploaded earlier.
    const response = await uhrp.download('XUSzUkfq8SSqLQEn2LL98gcxBF6MwTCzuxPrnuYwiRQpi6fp7W6U')

    const text = Utils.toUTF8(response.data)

    runner.log(text)

}