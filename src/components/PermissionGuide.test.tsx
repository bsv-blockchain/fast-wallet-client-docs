// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PermissionGuide } from './PermissionGuide'

const { perform } = vi.hoisted(() => ({ perform: vi.fn() }))
vi.mock('../snippets/wallet', () => ({ createWalletClient: () => ({}) }))
vi.mock('../lib/permission-guide', async importOriginal => {
  const original = await importOriginal<typeof import('../lib/permission-guide')>()
  return { ...original, permissionScenarios: [{ id: 'test', title: 'Test', startingState: 'Clear grants for this origin.', steps: [{ id: 'step', instruction: 'Deny the request.', expectedPrompt: 'Grouped prompt.', outcome: 'denied', action: { kind: 'key', name: 'fast grouped alpha' } }] }], performPermissionStep: perform }
})
afterEach(() => { cleanup(); perform.mockReset() })

function start() {
  render(<PermissionGuide onRunningChange={() => {}} />)
  const start = screen.getByRole('button', { name: 'Start scenario' }) as HTMLButtonElement
  expect(start.disabled).toBe(true)
  expect(perform).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('checkbox'))
  fireEvent.click(start)
  fireEvent.click(screen.getByRole('button', { name: 'Run wallet step' }))
}

describe('guided permission UI', () => {
  it('requires verified starting state and a post-request human assertion before passing', async () => {
    perform.mockResolvedValue({ status: 'passed', durationMs: 1 })
    start()
    await screen.findByText('Step: PENDING')
    expect((screen.getByRole('button', { name: 'Next step' }) as HTMLButtonElement).disabled).toBe(true)
    expect(screen.getByText(/Scenario: INCOMPLETE/)).toBeDefined()
    fireEvent.click(screen.getByRole('button', { name: 'Matches expectations' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByText(/Scenario: PASSED/)).toBeDefined()
  })

  it('fails the scenario when the wallet UI contradicts a matching API response', async () => {
    perform.mockResolvedValue({ status: 'passed', durationMs: 1 })
    start()
    await screen.findByText('Step: PENDING')
    fireEvent.click(screen.getByRole('button', { name: 'Does not match' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByText(/Scenario: FAILED/)).toBeDefined()
  })

  it('does not let the tester turn an API failure into a pass', async () => {
    perform.mockResolvedValue({ status: 'failed', durationMs: 1, message: 'Wallet disconnected' })
    start()
    await waitFor(() => expect(screen.getByText('Wallet disconnected')).toBeDefined())
    fireEvent.click(screen.getByRole('button', { name: 'Matches expectations' }))
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByText(/Scenario: FAILED/)).toBeDefined()
  })
})
