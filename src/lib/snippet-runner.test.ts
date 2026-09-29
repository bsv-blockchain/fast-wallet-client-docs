import { describe, expect, it, vi } from 'vitest'
import { executeSnippet, ProbeSkipped, runSnippetOnce } from './snippet-runner'

describe('snippet execution', () => {
  it('distinguishes success, skips, and coded failures', async () => {
    expect((await executeSnippet(async () => {})).status).toBe('passed')
    expect((await executeSnippet(async () => { throw new ProbeSkipped('No fixtures') })).status).toBe('skipped')
    expect(await executeSnippet(async () => { throw Object.assign(new Error('denied'), { code: 'ERR_PERMISSION_DENIED' }) })).toMatchObject({ status: 'failed', errorCode: 'ERR_PERMISSION_DENIED', message: 'denied' })
  })

  it('shares pending work but permits a new run after settlement', async () => {
    let finish: () => void
    const wait = new Promise<void>(resolve => { finish = resolve })
    const run = vi.fn(() => executeSnippet(() => wait))
    const first = runSnippetOnce('same', run)
    const second = runSnippetOnce('same', run)
    expect(first).toBe(second)
    finish()
    await first
    expect(run).toHaveBeenCalledTimes(1)
    await runSnippetOnce('same', run)
    expect(run).toHaveBeenCalledTimes(2)
  })
})
