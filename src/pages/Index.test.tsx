// @vitest-environment jsdom
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProbeSkipped } from '../lib/snippet-runner'
import Index from './Index'

const { first, second, third } = vi.hoisted(() => ({ first: vi.fn(), second: vi.fn(), third: vi.fn() }))
vi.mock('../snippets', () => ({ default: { first, second, third } }))
vi.mock('../snippets/_data', () => ({ topicsData: [
  { id: 'reliability', title: 'Reliability', snippets: ['first', 'second', 'third'].map(id => ({ id, title: id, explanation: '', code: '' })) },
  { id: 'permissions', title: 'Permissions', snippets: [{ id: 'first', title: 'Approve key', explanation: '', code: '' }] },
] }))
vi.mock('../components/ThemeProvider', () => ({ useTheme: () => ({ theme: 'light' }) }))
vi.mock('../components/ThemeToggle', () => ({ ThemeToggle: () => null }))
vi.mock('../components/ui/sidebar', () => ({ SidebarProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>, SidebarTrigger: () => null }))
vi.mock('../components/AppSidebar', () => ({ AppSidebar: ({ onTopicChange }: { onTopicChange: (id: string) => void }) => <button onClick={() => onTopicChange('permissions')}>Permissions category</button> }))
vi.mock('react-syntax-highlighter', () => ({ Prism: () => null }))

afterEach(() => { cleanup(); vi.restoreAllMocks(); first.mockReset(); second.mockReset(); third.mockReset() })

function show(topic = 'reliability') {
  render(<MemoryRouter initialEntries={[`/?topic=${topic}`]}><Index /></MemoryRouter>)
}

describe('suite orchestration', () => {
  it('continues after failure and reports skips separately', async () => {
    first.mockResolvedValue(undefined)
    second.mockRejectedValue(new Error('broken'))
    third.mockRejectedValue(new ProbeSkipped('missing fixtures'))
    show()
    fireEvent.click(screen.getByRole('button', { name: 'Run all' }))
    await screen.findByRole('region', { name: 'Results' })
    expect(screen.getByText('1 passed')).toBeDefined()
    expect(screen.getByText('1 failed')).toBeDefined()
    expect(screen.getByText('1 skipped')).toBeDefined()
    expect(first.mock.invocationCallOrder[0]).toBeLessThan(second.mock.invocationCallOrder[0])
    expect(second.mock.invocationCallOrder[0]).toBeLessThan(third.mock.invocationCallOrder[0])
  })

  it('waits for the current request when stopping and never starts the next one', async () => {
    let finish: () => void
    first.mockImplementation(() => new Promise<void>(resolve => { finish = resolve }))
    show()
    fireEvent.click(screen.getByRole('button', { name: 'Run all' }))
    await waitFor(() => expect(first).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'Stop after current' }))
    expect(screen.getByRole('button', { name: /Running first/ }).hasAttribute('disabled')).toBe(true)
    finish()
    await screen.findByRole('region', { name: 'Results' })
    expect(second).not.toHaveBeenCalled()
    expect(third).not.toHaveBeenCalled()
  })

  it('prevents bulk execution of permission prompts', () => {
    show('permissions')
    expect(screen.queryByRole('button', { name: 'Run all' })).toBeNull()
    expect(screen.getByRole('button', { name: /^Run$/ })).toBeDefined()
  })

  it('exports only summaries, omitting logs, keys and error messages', async () => {
    first.mockImplementation(async runner => { runner.log({ publicKey: 'private fixture', tx: [1] }); throw new Error('sensitive context') })
    second.mockResolvedValue(undefined)
    third.mockResolvedValue(undefined)
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:test')
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    show()
    fireEvent.click(screen.getByRole('button', { name: 'Run all' }))
    await screen.findByRole('region', { name: 'Results' })
    fireEvent.click(screen.getByRole('button', { name: 'Download results' }))
    const blob = createObjectURL.mock.calls[0][0] as Blob
    const content = await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob) })
    const summary = JSON.parse(content)
    expect(summary.results).toHaveLength(3)
    expect(summary.results[0]).toMatchObject({ id: 'first', status: 'failed' })
    expect(content).not.toMatch(/private fixture|sensitive context|publicKey|message|output/)
  })
})
