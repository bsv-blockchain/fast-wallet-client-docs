import type { WalletInterface } from '@bsv/sdk'
import { ProbeSkipped, type SnippetRunner } from '../../lib/snippet-runner'
import { check, reliabilityWallet } from './support'

export async function reliabilityPagination(runner: SnippetRunner, wallet: Pick<WalletInterface, 'listActions' | 'listOutputs'> = reliabilityWallet()) {
  let checkedRecords = 0
  for (const kind of ['actions', 'outputs'] as const) {
    const read = async (offset: number) => {
      if (kind === 'actions') {
        const result = await wallet.listActions({ labels: ['conformance'], limit: 2, offset })
        return { total: result.totalActions, ids: result.actions.map(action => action.txid) }
      }
      const result = await wallet.listOutputs({ basket: 'random', limit: 2, offset })
      return { total: result.totalOutputs, ids: result.outputs.map(output => output.outpoint) }
    }
    const pages = []
    for (const offset of [0, 2, 4]) {
      const page = await read(offset)
      check(Number.isInteger(page.total) && page.total >= 0, `${kind}: invalid total`)
      check(page.ids.length <= 2 && page.ids.length <= page.total, `${kind}: page exceeds limit or total`)
      check(page.ids.every(id => typeof id === 'string' && id.length > 0), `${kind}: missing record ID`)
      pages.push(page)
    }
    const repeated = await read(0)
    if (pages.some(page => page.total !== repeated.total) || JSON.stringify(pages[0].ids) !== JSON.stringify(repeated.ids)) {
      throw new ProbeSkipped(`${kind} changed during pagination. Retry with an idle wallet.`)
    }
    const ids = pages.flatMap(page => page.ids)
    check(new Set(ids).size === ids.length, `${kind}: duplicate records across offsets`)
    check(ids.length === Math.min(repeated.total, 6), `${kind}: pagination omitted records`)
    checkedRecords += ids.length
    runner.log({ kind, total: repeated.total, checkedRecords: ids.length })
  }
  if (checkedRecords === 0) throw new ProbeSkipped('No conformance actions or random-basket outputs to exercise pagination. Run against a wallet with fixtures.')
}
