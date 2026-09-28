import { Script } from '@bsv/sdk'
import { createWalletClient } from '../wallet'

export async function conformanceActions(runner) {
  const wallet = createWalletClient()

  const before = await wallet.listActions({
    labels: ['conformance'],
    labelQueryMode: 'any',
    includeLabels: true,
    limit: 5
  })
  runner.log({ listedBefore: before.totalActions })

  // noSend keeps the probe off the network. abortAction releases the inputs.
  const created = await wallet.createAction({
    description: 'conformance no-send probe',
    labels: ['conformance'],
    outputs: [{
      satoshis: 1,
      lockingScript: Script.fromASM('OP_NOP').toHex(),
      outputDescription: 'conformance probe output'
    }],
    options: {
      noSend: true,
      acceptDelayedBroadcast: false
    }
  })

  const reference = created.signableTransaction?.reference ?? created.txid
  if (!reference) {
    throw new Error('createAction returned neither a reference nor a txid to abort')
  }

  const aborted = await wallet.abortAction({ reference })
  if (aborted.aborted !== true) {
    throw new Error('abortAction did not release the no-send action')
  }

  runner.log({
    txid: created.txid,
    aborted: aborted.aborted
  })
}
