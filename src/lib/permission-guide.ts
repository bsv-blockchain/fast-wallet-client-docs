import { PrivateKey, ProtoWallet, Script, Transaction, VerifiableCertificate, type WalletCertificate, type WalletInterface, type WalletProtocol } from '@bsv/sdk'
import manifest from '../../public/manifest.json'
import { executeSnippet, type SnippetResult } from './snippet-runner'
import { check, checkPublicKey, expectWalletError } from '../snippets/reliability/support'
import { makeDirectCertificate } from '../snippets/branches/certificates'

export const permissionManifest = manifest
export const peerA = new PrivateKey(2).toPublicKey().toString()
export const peerB = new PrivateKey(3).toPublicKey().toString()
export const verifierA = new PrivateKey(4).toPublicKey().toString()
export const verifierB = new PrivateKey(5).toPublicKey().toString()
const certificateType = manifest.metanet.groupPermissions.certificateAccess[0].type

type Action =
  | { kind: 'key'; name: string; level?: 0 | 1 | 2; peer?: string; seek?: boolean; privileged?: boolean }
  | { kind: 'concurrentKeys' }
  | { kind: 'basket'; seek?: boolean }
  | { kind: 'certificate'; fields: string[]; verifier?: 'A' | 'B'; seek?: boolean }
  | { kind: 'spend'; noSend?: boolean }

export interface PermissionStep {
  id: string
  instruction: string
  expectedPrompt: string
  outcome: 'allowed' | 'denied'
  action: Action
}

export interface PermissionScenario {
  id: string
  title: string
  startingState: string
  needsCertificate?: boolean
  steps: PermissionStep[]
}

const key = (id: string, name: string, expectedPrompt: string, instruction: string, extra: Partial<Extract<Action, { kind: 'key' }>> = {}, outcome: PermissionStep['outcome'] = 'allowed'): PermissionStep => ({ id, instruction, expectedPrompt, outcome, action: { kind: 'key', name, seek: true, ...extra } })
const alpha = 'fast grouped alpha'
const beta = 'fast grouped beta'
const pactAlpha = 'fast pact alpha'
const pactBeta = 'fast pact beta'
const fresh = 'Clear this origin’s protocol, basket, certificate and spending grants, and PACT grants for test peers A and B in the wallet. Enable permission seeking, grouped prompts, peer grouping and PACT; disable blanket grants and whitelists. Confirm this origin’s manifest is reachable. Do not grant a broader scope than instructed.'

export const permissionScenarios: PermissionScenario[] = [
  { id: 'group-grant', title: 'Fresh grouped grant → reuse every declared type', startingState: fresh + ' Prepare the certificate fixture before clearing grants.', needsCertificate: true, steps: [
    key('group-approve', alpha, 'Grouped prompt with the missing manifest items: protocols, basket, certificate and 100-satoshi spending authorization.', 'Approve all declared items with persistent grants.'),
    key('group-reuse-protocol', beta, 'No prompt.', 'The other grouped protocol must already be usable with seekPermission=false.', { seek: false }),
    { id: 'group-reuse-basket', instruction: 'The declared basket must be accessible without a new prompt; an empty list is acceptable.', expectedPrompt: 'No prompt.', outcome: 'allowed', action: { kind: 'basket', seek: false } },
    { id: 'group-reuse-certificate', instruction: 'Reveal only the visible synthetic field to verifier A. The app independently decrypts the proof.', expectedPrompt: 'No prompt.', outcome: 'allowed', action: { kind: 'certificate', fields: ['visible'] } },
  ] },
  { id: 'group-deny', title: 'Fresh grouped denial → no-prompt denial', startingState: fresh, steps: [
    key('group-deny', alpha, 'Grouped prompt.', 'Deny the entire group. The operation must return ERR_PERMISSION_DENIED.', {}, 'denied'),
    key('group-deny-retry', alpha, 'No prompt.', 'A denied operation must remain denied with seekPermission=false.', { seek: false }, 'denied'),
  ] },
  { id: 'group-partial', title: 'Selective group grant → missing-only prompt', startingState: fresh, steps: [
    key('partial-alpha', alpha, 'Grouped prompt.', 'Approve alpha only. Leave beta and every other item unapproved.'),
    key('partial-beta-denied', beta, 'No prompt.', 'The unapproved beta protocol must remain unavailable.', { seek: false }, 'denied'),
    key('partial-beta-prompt', beta, 'Grouped prompt containing missing beta and other unapproved items; already-granted alpha must be absent.', 'Approve beta only.'),
    key('partial-alpha-retained', alpha, 'No prompt.', 'Alpha’s earlier grant must still work.', { seek: false }),
    key('partial-beta-retained', beta, 'No prompt.', 'Beta’s new grant must now work.', { seek: false }),
  ] },
  { id: 'old-group', title: 'Existing alpha grant → new beta grant', startingState: 'Alpha is already persistently granted for this origin. Beta and other manifest items are not granted. Grouping and permission seeking are enabled.', steps: [
    key('old-alpha', alpha, 'No prompt.', 'Confirm the existing grant before testing the missing item.', { seek: false }),
    key('new-beta', beta, 'Grouped prompt containing beta and the other missing items, with alpha absent.', 'Approve beta only.'),
  ] },
  { id: 'outside-group', title: 'Outside group → individual grant and reuse', startingState: fresh, steps: [
    key('outside-individual', 'fast outside group', 'Individual protocol prompt, without a grouped bundle.', 'Approve only this out-of-group protocol.'),
    key('outside-reuse', 'fast outside group', 'No prompt.', 'Confirm the individual grant is persistent.', { seek: false }),
  ] },
  { id: 'pact-new-old', title: 'New PACT peer → existing peer → different peer', startingState: fresh, steps: [
    key('pact-peer-a', pactAlpha, 'PACT prompt for peer A, listing both declared PACT protocols.', 'Approve alpha and beta for peer A only.', { level: 2, peer: peerA }),
    key('pact-peer-a-old', pactBeta, 'No prompt.', 'A’s second declared protocol must use the newly established trust.', { level: 2, peer: peerA, seek: false }),
    key('pact-peer-b-new', pactAlpha, 'New PACT prompt identifying peer B, not A.', 'Approve alpha and beta for peer B. A’s trust must not authorize B.', { level: 2, peer: peerB }),
    key('pact-peer-b-old', pactBeta, 'No prompt.', 'B’s second declared protocol must now be available.', { level: 2, peer: peerB, seek: false }),
  ] },
  { id: 'pact-deny', title: 'PACT denial → both protocols stay unavailable', startingState: fresh, steps: [
    key('pact-deny-a', pactAlpha, 'PACT prompt for peer A.', 'Deny the trust request.', { level: 2, peer: peerA }, 'denied'),
    key('pact-deny-alpha', pactAlpha, 'No prompt.', 'Alpha must remain unavailable for A.', { level: 2, peer: peerA, seek: false }, 'denied'),
    key('pact-deny-beta', pactBeta, 'No prompt.', 'Beta must also remain unavailable for A.', { level: 2, peer: peerA, seek: false }, 'denied'),
  ] },
  { id: 'pact-partial', title: 'Partial PACT → prompt only for missing protocol', startingState: fresh, steps: [
    key('pact-partial-alpha', pactAlpha, 'PACT prompt for peer A.', 'Approve alpha only; do not approve beta.', { level: 2, peer: peerA }),
    key('pact-partial-beta-denied', pactBeta, 'No prompt.', 'An incomplete trust set must not authorize beta.', { level: 2, peer: peerA, seek: false }, 'denied'),
    key('pact-partial-beta', pactBeta, 'PACT prompt for peer A listing missing beta, without already-granted alpha.', 'Approve beta.', { level: 2, peer: peerA }),
    key('pact-partial-reuse', pactBeta, 'No prompt.', 'The completed trust set must now authorize beta.', { level: 2, peer: peerA, seek: false }),
  ] },
  { id: 'outside-pact', title: 'Trusted peer → protocol outside PACT', startingState: 'Peer A has persistent grants for both declared PACT protocols for this origin. fast outside pact has not been granted. Permission seeking and grouping are enabled.', steps: [
    key('pact-existing', pactAlpha, 'No prompt.', 'Confirm the existing PACT state.', { level: 2, peer: peerA, seek: false }),
    key('pact-outside', 'fast outside pact', 'Individual protocol prompt for peer A. It must not silently inherit the declared PACT grants.', 'Deny this out-of-PACT protocol.', { level: 2, peer: peerA }, 'denied'),
  ] },
  { id: 'peer-group', title: 'Peer-grouped declarations → exact counterparty match', startingState: fresh, steps: [
    key('peer-group-a', 'fast peer grouped alpha', 'Peer-grouped prompt for A containing only its two declared Level-2 protocols; no basket, certificate or spending items.', 'Approve both peer-grouped protocols.', { level: 2, peer: peerA }),
    key('peer-group-a-reuse', 'fast peer grouped beta', 'No prompt.', 'Reuse A’s second peer-grouped grant.', { level: 2, peer: peerA, seek: false }),
    key('peer-group-b-outside', 'fast peer grouped alpha', 'Individual prompt for B: the manifest entries match A only.', 'Deny the same protocol for the different counterparty.', { level: 2, peer: peerB }, 'denied'),
  ] },
  { id: 'silent-privileged', title: 'Level 0 and privileged routing', startingState: fresh, steps: [
    key('silent-level-zero', 'fast silent probe', 'No prompt.', 'Level 0 is an open protocol.', { level: 0, seek: false }),
    key('privileged-group-excluded', alpha, 'Individual privileged protocol prompt; no grouped or PACT bundle.', 'Approve the privileged request only.', { privileged: true }),
    key('nonprivileged-still-missing', alpha, 'No prompt.', 'A privileged grant must not grant the ordinary protocol scope.', { seek: false }, 'denied'),
  ] },
  { id: 'persist-revoke', title: 'Persist across wallet restart → revoke → request again', startingState: 'Alpha has a persistent non-expiring grant for this origin. Permission seeking and grouping are enabled. Do not clear that grant before starting.', steps: [
    key('persist-before-restart', alpha, 'No prompt.', 'Confirm the existing grant.', { seek: false }),
    key('persist-after-restart', alpha, 'No permission prompt; wallet reconnection or authentication UI is allowed.', 'Restart your wallet now, reconnect/authenticate if needed, then run this step.', { seek: false }),
    key('revoked-no-prompt', alpha, 'No prompt.', 'Revoke alpha for this origin in the wallet now. Then run this step; it must be denied.', { seek: false }, 'denied'),
    key('revoked-new-grant', alpha, 'Grouped prompt containing missing alpha; other valid grants must be filtered out.', 'Approve alpha again.'),
  ] },
  { id: 'certificate-exact-scope', title: 'Certificate group field set / verifier boundaries', startingState: 'Prepare the synthetic certificate. Grant only its visible field to verifier A using the declared grouped permission. No grant exists for hidden or verifier B.', needsCertificate: true, steps: [
    { id: 'certificate-inside', instruction: 'Request the exact declared field set and verifier.', expectedPrompt: 'No prompt.', outcome: 'allowed', action: { kind: 'certificate', fields: ['visible'] } },
    { id: 'certificate-more-fields', instruction: 'Deny the broader visible+hidden field request.', expectedPrompt: 'Individual certificate prompt listing both fields, outside the exact manifest set.', outcome: 'denied', action: { kind: 'certificate', fields: ['visible', 'hidden'] } },
    { id: 'certificate-other-verifier', instruction: 'Deny disclosure to verifier B.', expectedPrompt: 'Individual certificate prompt identifying verifier B, outside the manifest verifier.', outcome: 'denied', action: { kind: 'certificate', fields: ['visible'], verifier: 'B' } },
  ] },
  { id: 'spending-persistent', title: 'Persistent grouped spending → remaining-budget reuse', startingState: fresh + ' Use a funded test wallet. Both 1-satoshi actions plus their fees must fit within the 100-satoshi unused monthly budget. These steps broadcast real transactions.', steps: [
    { id: 'spend-persistent-grant', instruction: 'Approve persistent spending authorization only, up to 100 satoshis. Review fees; deny if either request cannot fit the stated budget.', expectedPrompt: 'Grouped prompt containing the 100-satoshi spending authorization.', outcome: 'allowed', action: { kind: 'spend' } },
    { id: 'spend-persistent-reuse', instruction: 'Run a second 1-satoshi broadcast, still within the unused budget.', expectedPrompt: 'No permission prompt.', outcome: 'allowed', action: { kind: 'spend' } },
  ] },
  { id: 'spending-ephemeral', title: 'Ephemeral spending → new approval required', startingState: fresh + ' Use a funded test wallet. Both actions are noSend and are aborted. Your wallet must offer one-time/ephemeral spending approval.', steps: [
    { id: 'spend-ephemeral', instruction: 'Approve spending for this operation only. Do not create a persistent spending grant or approve other group items.', expectedPrompt: 'Grouped spending prompt with a one-time approval option.', outcome: 'allowed', action: { kind: 'spend', noSend: true } },
    { id: 'spend-ephemeral-again', instruction: 'Deny the next request. A one-time approval must not persist.', expectedPrompt: 'A new grouped spending prompt; the previous ephemeral approval must not silently authorize it.', outcome: 'denied', action: { kind: 'spend', noSend: true } },
  ] },
  { id: 'grouping-disabled', title: 'Grouping disabled → individual fallback', startingState: 'Clear this origin’s grants. Enable permission seeking, but disable grouped prompting. Do not use blanket grants or whitelists.', steps: [
    key('group-disabled', alpha, 'Individual protocol prompt, despite the matching group declaration.', 'Approve alpha only.'),
    key('pact-disabled-by-grouping', pactAlpha, 'Individual Level-2 protocol prompt for A; grouped prompting is required for PACT.', 'Deny the request.', { level: 2, peer: peerA }, 'denied'),
  ] },
  { id: 'pact-disabled', title: 'PACT disabled → individual / peer-grouped routes', startingState: 'Clear this origin’s grants and trust for A. Enable grouped permission seeking, but disable counterparty trust prompting (PACT). Do not use blanket grants or whitelists.', steps: [
    key('pact-policy-disabled', pactAlpha, 'Individual Level-2 protocol prompt for A because this protocol has no peer-grouped declaration.', 'Deny the request.', { level: 2, peer: peerA }, 'denied'),
    key('peer-group-policy-enabled', 'fast peer grouped alpha', 'Peer-grouped prompt for A listing its two declared peer-grouped protocols.', 'Approve both peer-grouped protocols.', { level: 2, peer: peerA }),
  ] },
  { id: 'concurrent-group', title: 'Concurrent group requests → one grant → both resolve', startingState: fresh, steps: [
    { id: 'concurrent-group-approve', instruction: 'The app requests alpha and beta concurrently. Approve every declared item in the first group prompt. Check that the wallet serializes permission decisions and reuses that grant without presenting a second redundant group prompt.', expectedPrompt: 'One grouped permission decision; after granting the group, both requests resolve without another permission prompt.', outcome: 'allowed', action: { kind: 'concurrentKeys' } },
    key('concurrent-group-reuse', beta, 'No prompt.', 'Confirm beta can still reuse the completed grant.', { seek: false }),
  ] },
  { id: 'origin-isolation', title: 'Grant at another hostname → this origin stays ungranted', startingState: 'First grant alpha to this app at a different hostname, using the same wallet. Then open this deployment at the current hostname, where no grants exist. Changing only localhost ports is insufficient. Enable grouped permission seeking; disable blanket grants and whitelists.', steps: [
    key('other-origin-not-inherited', alpha, 'No prompt.', 'The other hostname’s grant must not authorize this origin with seekPermission=false.', { seek: false }, 'denied'),
    key('this-origin-new-grant', alpha, 'A new grouped prompt for the current origin, containing its missing declarations.', 'Approve alpha for this origin.'),
    key('this-origin-reuse', alpha, 'No prompt.', 'Confirm this origin’s new grant works.', { seek: false }),
  ] },
]

export interface PermissionEvidence {
  app: SnippetResult
  human: 'pending' | 'confirmed' | 'contradicted'
}

export function evidenceStatus(evidence: PermissionEvidence): 'pending' | 'passed' | 'failed' {
  if (evidence.app.status !== 'passed' || evidence.human === 'contradicted') return 'failed'
  return evidence.human === 'confirmed' ? 'passed' : 'pending'
}

export async function preparePermissionCertificate(wallet: WalletInterface) {
  const { args } = await makeDirectCertificate(wallet, 'certifier', certificateType)
  return await wallet.acquireCertificate(args)
}

export async function performPermissionStep(wallet: WalletInterface, step: PermissionStep, certificate?: WalletCertificate): Promise<SnippetResult> {
  return executeSnippet(async () => {
    const invoke = async () => {
      const action = step.action
      if (action.kind === 'concurrentKeys') {
        // Intentional concurrency inside this scenario only. Await every result
        // even after rejection so the tester never advances with a live request.
        const results = await Promise.allSettled([alpha, beta].map(name => wallet.getPublicKey({ protocolID: [1, name], keyID: 'guided probe', counterparty: 'self', forSelf: true, seekPermission: true })))
        for (const result of results) {
          if (result.status === 'rejected') throw result.reason
          checkPublicKey(result.value.publicKey)
        }
      } else if (action.kind === 'key') {
        const protocolID: WalletProtocol = [action.level ?? 1, action.name]
        const result = await wallet.getPublicKey({ protocolID, keyID: 'guided probe', counterparty: action.peer ?? 'self', forSelf: true, seekPermission: action.seek, privileged: action.privileged, ...(action.privileged ? { privilegedReason: 'Test individual privileged permission' } : {}) })
        checkPublicKey(result.publicKey)
      } else if (action.kind === 'basket') {
        const result = await wallet.listOutputs({ basket: manifest.metanet.groupPermissions.basketAccess[0].basket, limit: 1, seekPermission: action.seek })
        check(Array.isArray(result.outputs) && Number.isInteger(result.totalOutputs), 'Invalid basket response')
      } else if (action.kind === 'certificate') {
        check(certificate != null, 'Prepare the certificate fixture before starting')
        const verifier = new ProtoWallet(new PrivateKey(action.verifier === 'B' ? 5 : 4))
        const proof = await wallet.proveCertificate({ certificate, fieldsToReveal: action.fields, verifier: action.verifier === 'B' ? verifierB : verifierA })
        check(JSON.stringify(Object.keys(proof.keyringForVerifier).sort()) === JSON.stringify([...action.fields].sort()), 'Wrong certificate fields disclosed')
        const fields = await VerifiableCertificate.fromCertificate(certificate, proof.keyringForVerifier).decryptFields(verifier)
        check(fields.visible === 'branch fixture', 'Synthetic field did not decrypt')
      } else {
        let unsent: string | undefined
        let creationError: unknown
        let creationFailed = false
        try {
          const created = await wallet.createAction({ description: 'BRC116 spending probe', outputs: [{ satoshis: 1, lockingScript: Script.fromASM('OP_TRUE').toHex(), outputDescription: 'BRC116 one satoshi fixture' }], options: { noSend: action.noSend ?? false, acceptDelayedBroadcast: false } })
          if (action.noSend) unsent = created.signableTransaction?.reference ?? created.txid
          check(created.tx != null && created.txid != null, 'Spending result missing transaction evidence')
          check(Transaction.fromAtomicBEEF(Array.from(created.tx)).id('hex') === created.txid, 'Spending result TXID mismatch')
        } catch (error) { creationError = error; creationFailed = true }
        if (unsent) {
          try { check((await wallet.abortAction({ reference: unsent })).aborted === true, 'Unsent spending fixture cleanup failed') }
          catch (error) { throw new Error(`Cleanup after successful creation failed: ${error instanceof Error ? error.message : String(error)}`) }
        }
        if (creationFailed) throw creationError
      }
    }
    if (step.outcome === 'denied') {
      await expectWalletError(invoke, ['ERR_PERMISSION_DENIED'], ['Permission denied.', 'The user has denied the request for permission.'])
    } else await invoke()
  })
}
