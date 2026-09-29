import { useState } from 'react'
import type { WalletCertificate } from '@bsv/sdk'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { createWalletClient } from '../snippets/wallet'
import { evidenceStatus, peerA, peerB, permissionScenarios, performPermissionStep, preparePermissionCertificate, type PermissionEvidence } from '../lib/permission-guide'

export function PermissionGuide({ onRunningChange }: { onRunningChange: (id: string | null) => void }) {
  const [selected, setSelected] = useState(permissionScenarios[0].id)
  const [confirmedStart, setConfirmedStart] = useState(false)
  const [startedAt, setStartedAt] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [evidence, setEvidence] = useState<Record<string, PermissionEvidence>>({})
  const [busy, setBusy] = useState(false)
  const [certificate, setCertificate] = useState<WalletCertificate | undefined>()
  const [fixtureMessage, setFixtureMessage] = useState('')
  const [walletBuild, setWalletBuild] = useState('')
  const scenario = permissionScenarios.find(item => item.id === selected)
  const step = scenario.steps[stepIndex]
  const currentEvidence = evidence[step?.id]
  const finished = stepIndex >= scenario.steps.length
  const passed = scenario.steps.filter(item => evidence[item.id] && evidenceStatus(evidence[item.id]) === 'passed').length
  const failed = scenario.steps.some(item => evidence[item.id] && evidenceStatus(evidence[item.id]) === 'failed')
  const overall = finished ? (failed ? 'FAILED' : 'PASSED') : 'INCOMPLETE'

  const reset = (id = selected) => {
    setSelected(id)
    setConfirmedStart(false)
    setStartedAt(null)
    setStepIndex(0)
    setEvidence({})
  }

  const runStep = async () => {
    if (busy || !step || currentEvidence) return
    setBusy(true)
    onRunningChange('BRC-116 guided test')
    try {
      const app = await performPermissionStep(createWalletClient(), step, certificate)
      setEvidence(previous => ({ ...previous, [step.id]: { app, human: 'pending' } }))
    } catch (error) {
      setEvidence(previous => ({ ...previous, [step.id]: { app: { status: 'failed', durationMs: 0, message: error instanceof Error ? error.message : String(error) }, human: 'pending' } }))
    } finally { setBusy(false); onRunningChange(null) }
  }

  const prepare = async () => {
    setBusy(true)
    onRunningChange('BRC-116 certificate fixture setup')
    try {
      setCertificate(await preparePermissionCertificate(createWalletClient()))
      setFixtureMessage('Synthetic certificate prepared. Now establish the selected scenario’s starting permission state in your wallet. Setup prompts do not count as test observations.')
    } catch (error) { setFixtureMessage(`Setup failed: ${error instanceof Error ? error.message : String(error)}`) }
    finally { setBusy(false); onRunningChange(null) }
  }

  const removeFixture = async () => {
    if (!certificate) return
    setBusy(true)
    onRunningChange('BRC-116 certificate fixture cleanup')
    try {
      const result = await createWalletClient().relinquishCertificate({ type: certificate.type, certifier: certificate.certifier, serialNumber: certificate.serialNumber })
      if (result.relinquished !== true) throw new Error('Wallet did not confirm removal')
      setCertificate(undefined)
      setFixtureMessage('Only the prepared synthetic certificate was removed.')
    } catch (error) { setFixtureMessage(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`) }
    finally { setBusy(false); onRunningChange(null) }
  }

  const download = () => {
    const report = {
      schemaVersion: 1, specification: 'BRC-116', scenario: selected,
      origin: window.location.origin, walletBuild, startedAt,
      startingState: scenario.startingState, testerConfirmedStartingState: confirmedStart,
      overall, passedSteps: passed, totalSteps: scenario.steps.length,
      steps: scenario.steps.map(item => {
        const observation = evidence[item.id]
        return { id: item.id, expectedOutcome: item.outcome, expectedPrompt: item.expectedPrompt,
          app: observation ? { status: observation.app.status, durationMs: observation.app.durationMs, errorCode: observation.app.errorCode } : null,
          testerAssertion: observation?.human ?? 'pending',
          status: observation ? evidenceStatus(observation) : 'pending',
        }
      }),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `fast-wallet-brc116-${selected}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <div className="space-y-6">
    <p className="text-sm leading-relaxed text-muted-foreground">
      The app can check wallet responses. You must confirm the wallet’s prompts, displayed scopes, and the grant or denial you chose. A response alone cannot pass these scenarios. The manifest is fetched by wallets at the origin root; deployment or manifest-cache changes may require a wallet restart.
      {' '}<a className="underline" href="/manifest.json" target="_blank" rel="noreferrer">View this origin’s manifest</a>
      {' · '}<a className="underline" href="https://github.com/bsv-blockchain/BRCs/blob/master/wallet/0116.md" target="_blank" rel="noreferrer">BRC-116 specification</a>
    </p>
    <details className="rounded border p-3 text-sm">
      <summary>Fixed synthetic test identities and origin</summary>
      <p className="mt-2 break-all">Origin: {window.location.origin}</p>
      <p className="mt-2 break-all">Peer A: {peerA}</p>
      <p className="mt-2 break-all">Peer B: {peerB}</p>
      <p className="mt-2">These are public test identities. PACT and group grants are scoped to this origin; localhost ports share the same hostname permission scope. Use a different hostname to test origin isolation.</p>
    </details>
    <div className="space-y-2">
      <label htmlFor="permission-scenario" className="text-sm font-medium">Permission scenario</label>
      <select id="permission-scenario" disabled={busy} value={selected} onChange={event => reset(event.target.value)} className="w-full rounded border bg-background p-2 text-sm">
        {permissionScenarios.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
      </select>
      <label htmlFor="wallet-build" className="block text-sm font-medium">Wallet name / build (optional, included in the report)</label>
      <input id="wallet-build" value={walletBuild} maxLength={100} onChange={event => setWalletBuild(event.target.value)} className="w-full rounded border bg-background p-2 text-sm" placeholder="e.g. BSV Desktop build …" />
    </div>
    {scenario.needsCertificate && <Card>
      <CardHeader><CardTitle className="text-base">Prepare a synthetic certificate fixture</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>Do this before setting or clearing the scenario’s permissions. Setup acquires one local test certificate with two synthetic fields. It may cause separate setup permission prompts. The wallet stores the fixture until you remove it; it is never an identity credential.</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={prepare} disabled={busy || !!certificate || !!startedAt}>Prepare certificate</Button>
          <Button size="sm" variant="outline" onClick={removeFixture} disabled={busy || !certificate || (!!startedAt && !finished)}>Remove test certificate</Button>
        </div>
        {fixtureMessage && <p role="status">{fixtureMessage}</p>}
      </CardContent>
    </Card>}
    <Card>
      <CardHeader><CardTitle className="text-base">Starting state — confirm in your wallet</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>{scenario.startingState}</p>
        <label className="flex items-start gap-2"><input type="checkbox" checked={confirmedStart} disabled={!!startedAt || busy} onChange={event => setConfirmedStart(event.target.checked)} className="mt-1" />
          <span>I verified this starting state and policy configuration in my wallet. I will make only the choices specified in each step.</span>
        </label>
        <Button size="sm" disabled={busy || !confirmedStart || !!startedAt || (scenario.needsCertificate && !certificate)} onClick={() => setStartedAt(new Date().toISOString())}>Start scenario</Button>
      </CardContent>
    </Card>
    {startedAt && !finished && <Card>
      <CardHeader><CardTitle className="text-base">Step {stepIndex + 1} of {scenario.steps.length}</CardTitle></CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p>{step.instruction}</p>
        <p><strong>Expected wallet UI:</strong> {step.expectedPrompt}</p>
        <p><strong>Expected app result:</strong> {step.outcome === 'allowed' ? 'Valid response accepted by the app.' : 'Permission-denied error; other errors are failures.'}</p>
        <Button size="sm" disabled={busy || !!currentEvidence} onClick={runStep}>{busy ? 'Waiting for wallet…' : 'Run wallet step'}</Button>
        {currentEvidence && <div className="space-y-3 rounded border p-3" aria-live="polite">
          <p>App evidence: {currentEvidence.app.status === 'passed' ? 'matches the expected result' : 'does not match the expected result'}.</p>
          {currentEvidence.app.status !== 'passed' && <p className="break-words text-destructive">{currentEvidence.app.message} {currentEvidence.app.errorCode ? `(${currentEvidence.app.errorCode})` : ''}</p>}
          <p>Confirm whether the expected prompt (or no prompt), displayed scopes and identities, filtering of old grants, and your requested grant/deny choice all matched the instructions.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={currentEvidence.human === 'confirmed' ? 'default' : 'outline'} onClick={() => setEvidence(previous => ({ ...previous, [step.id]: { ...currentEvidence, human: 'confirmed' } }))}>Matches expectations</Button>
            <Button size="sm" variant={currentEvidence.human === 'contradicted' ? 'destructive' : 'outline'} onClick={() => setEvidence(previous => ({ ...previous, [step.id]: { ...currentEvidence, human: 'contradicted' } }))}>Does not match</Button>
          </div>
          <p>Step: {evidenceStatus(currentEvidence).toUpperCase()}</p>
          <Button size="sm" disabled={currentEvidence.human === 'pending'} onClick={() => setStepIndex(index => index + 1)}>Next step</Button>
        </div>}
      </CardContent>
    </Card>}
    {startedAt && <section aria-label="Permission scenario results" className="space-y-3 rounded border p-4">
      <p className="font-semibold">Scenario: {overall} — {passed} / {scenario.steps.length} steps passed</p>
      <p className="text-sm text-muted-foreground">Only steps with matching app evidence and your explicit confirmation pass. Unrun or unconfirmed steps remain incomplete.</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={download} disabled={busy}>Download permission evidence</Button>
        <Button size="sm" variant="outline" onClick={() => reset()} disabled={busy}>Reset scenario</Button>
      </div>
    </section>}
  </div>
}
