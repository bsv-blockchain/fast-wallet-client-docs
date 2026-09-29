// @vitest-environment jsdom
import { StrictMode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ProbeSkipped } from '../lib/snippet-runner'
import { CodeSnippet } from './CodeSnippet'

const { probe } = vi.hoisted(() => ({ probe: vi.fn() }))
vi.mock('../snippets', () => ({ default: { probe } }))
vi.mock('./ThemeProvider', () => ({ useTheme: () => ({ theme: 'light' }) }))
vi.mock('react-syntax-highlighter', () => ({ Prism: () => null }))

afterEach(() => { cleanup(); probe.mockReset() })

function show(autoRun: boolean) {
  const onRunComplete = vi.fn()
  render(<StrictMode><MemoryRouter><CodeSnippet
    snippet={{ id: 'probe', title: 'Probe', explanation: 'Test', code: '' }}
    index={0} showCode={false} autoRun={autoRun} runToken={1}
    runAllActive={autoRun} anySnippetRunning={false} onRunningChange={() => {}}
    onRunComplete={onRunComplete}
  /></MemoryRouter></StrictMode>)
  return onRunComplete
}

describe('snippet cards', () => {
  it('executes once and completes the queue under StrictMode', async () => {
    probe.mockResolvedValue(undefined)
    const complete = show(true)
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1))
    expect(probe).toHaveBeenCalledTimes(1)
    expect(complete).toHaveBeenCalledWith('probe', expect.objectContaining({ status: 'passed' }), 1)
  })

  it('reports a failure after logging as failed', async () => {
    probe.mockImplementation(async runner => { runner.log('precondition'); throw new Error('broken') })
    const complete = show(false)
    fireEvent.click(screen.getByRole('button', { name: /^Run$/ }))
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1))
    expect(screen.getByText('Failed')).toBeDefined()
    expect(screen.getByText(/precondition\s+Error: broken/)).toBeDefined()
  })

  it('shows missing fixtures as skipped', async () => {
    probe.mockRejectedValue(new ProbeSkipped('No fixtures'))
    const complete = show(true)
    await waitFor(() => expect(complete).toHaveBeenCalledTimes(1))
    expect(screen.getByText('Skipped')).toBeDefined()
    expect(complete.mock.calls[0][1].status).toBe('skipped')
  })
})
