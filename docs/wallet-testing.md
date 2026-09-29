# Wallet testing coverage and operation

The existing Conformance category covers all 28 BRC-100 methods through the SDK response boundary. The added categories test bounded option combinations and sequences, with named case results. They cover the public conditional axes described below; they do not establish exhaustive coverage of a wallet's internal implementation, arbitrary data, or every possible network and permission history.

## Run order

1. Record the wallet name/build, browser or mobile shell, operating system, network, and this app's Git commit. Use a dedicated funded test wallet for transaction cases.
2. Run Reliability and the authentication/crypto/linkage matrices. To exercise authentication, run the metadata card once unlocked and once locked. A valid `isAuthenticated=false` before waiting is accepted; authentication must be true after `waitForAuthentication` completes.
3. Run funded workflows individually, reviewing their descriptions and wallet-estimated fees. The broadcast matrix creates the dedicated basket/tag/label fixtures used by list matrices. Run action/output list matrices after that. Missing fixtures are skipped, never credited as passes.
4. Run direct and external issuance certificate cards separately. Run discovery separately; empty discovery results validate the response shape, not the existence of an indexed certificate.
5. Run each BRC-116 scenario after establishing its specified wallet state. Prepare certificate fixtures **before** clearing permission grants. Confirm the state checkbox, run each step, observe the wallet, and answer whether the prompt, scope, identities, filtering, and chosen decision match. Download the evidence report before resetting or navigating away.

Only one card runs at a time. Matrices continue after a failed case, so all outcomes are retained. **Stop after current case** lets the current case finish (including cleanup) and records the remaining cases as skipped. It does not dismiss or cancel a wallet prompt. **Stop after current** on a bulk run prevents the next card from starting. React StrictMode subscribers share execution, avoiding duplicate calls.

## Public BRC-100 method map

All methods retain their original Conformance card. Additional coverage is mapped here.

| Method | Added branches and evidence |
| --- | --- |
| `isAuthenticated` | Locked/unlocked starting state; boolean evidence before waiting and authenticated state afterward. |
| `waitForAuthentication` | Wait followed by a fresh authentication check; manually exercise reconnection/unlock UI. |
| `getVersion` | Repeated, stable nonempty version. |
| `getNetwork` | Repeated, stable mainnet/testnet value. |
| `getHeight` | Integer current height used for header requests. |
| `getHeaderForHeight` | Height 1/current height; 80-byte header and repeatability at each fixed height. |
| `getPublicKey` | Identity repetition and curve validity; derived security levels 0/1/2; omitted/self/anyone/specific peer; privileged false/true; `forSelf` omitted/false/true; permission grant/deny/reuse and BRC-116 routes. |
| `revealCounterpartyKeyLinkage` | Privileged false/true, throwaway verifier and counterparty, returned identity/scope, nonempty encrypted linkage/proof and timestamp. No real third-party peer is used. |
| `revealSpecificKeyLinkage` | Levels 0/1/2 × self/anyone/throwaway peer × privileged false/true; exact returned scope and linkage/proof bytes. |
| `encrypt` | Same crypto scope matrix; lengths 0/1/16/255/256/1024, Unicode and zero bytes; independent peer decryption for peer/anyone cases. |
| `decrypt` | Exact plaintext recovery across those scopes and sizes. |
| `createHmac` | Same scope matrix; deterministic repeated HMAC; independent peer verification. |
| `verifyHmac` | Positive results; modified data, HMAC, and key ID rejection. Only recognized invalid-HMAC errors count as expected rejection. |
| `createSignature` | Same scope matrix; data vs. `hashToDirectlySign`; direct hashes cross-checked against data verification. Omitted signing counterparty defaults to anyone. |
| `verifySignature` | Data vs. `hashToDirectlyVerify`, local/peer orientations and `forSelf` modes; modified payload/hash rejection. Only recognized invalid-signature errors count as expected rejection. |
| `listActions` | 67 requests: all valid input/output detail and script flag combinations, labels, any/all modes, empty filters, limit 1/10000, offset, explicit permission seeking false/true. Mixed existing/absent labels distinguish any from all. Requested fields are checked. |
| `listOutputs` | 55 requests: omitted/locking scripts/entire transactions; all tag/label/custom-instruction flags; any/all including an absent tag; positive/negative offsets and limit boundaries; permission seeking false/true. Aggregate BEEF must contain each returned fixture outpoint and amount. SDK calls this return selector `include`. |
| `createAction` | 16 noSend and 16 broadcast combinations of sign-and-process, TXID-only, output randomization, delayed broadcast; 16 explicit-input sequences (immediate/deferred unlocking, sequence 0/max, version 1/2, lock time 0/1); parent/child noSend change chaining, known TXIDs/trustSelf, and createAction-only batch flushing. |
| `signAction` | Deferred templates, empty wallet-managed spends, explicit input unlocking/sequence, noSend vs. send, TXID-only/full bytes, delayed broadcasting, and `sendWith` flushes. AtomicBEEF/TXID and final input/version/lock-time evidence are checked. |
| `abortAction` | Cleanup of unsent actions, reversing child/parent order; affirmative abort required. Already-submitted or ambiguously submitted actions are never aborted by these workflows. |
| `internalizeAction` | Wallet payment, basket insertion, mixed remittances; fresh BRC-29 derivation material; seeking true then false on repeated internalization; inserted outpoint must be tracked exactly once. |
| `relinquishOutput` | Remove only the exact inserted fixture outpoint; verify it is absent afterward. This stops tracking; it does not recover the funds. |
| `listCertificates` | Exact certifier/type, either/both empty filters, limits 1/10000 and offsets 0/1; acquired fixture present and removed fixture absent. |
| `acquireCertificate` | Direct local issuance with certifier- and subject-revealed keyrings × privileged false/true; external certifier issuance × privileged false/true. Signed synthetic certificates use visible/hidden test fields. |
| `proveCertificate` | Full/minimal certificate descriptor × empty/one/all fields; exact disclosure key set and independent verifier decryption; BRC-116 field-set/verifier boundaries. |
| `relinquishCertificate` | Cleanup names the acquired type, certifier and serial only; direct fixtures are checked absent afterward. |
| `discoverByIdentityKey` | Own identity with limits 1/10000 × offsets 0/1 × permission seeking false/true. Empty responses are valid. |
| `discoverByAttributes` | Synthetic attribute with the same limit/offset/permission axes. Empty responses are valid. |

The 247 outer branch cases comprise metadata (4), crypto (24), linkage (20), action queries (67), output queries (55), discovery (16), noSend (16), explicit inputs (16), broadcasts (16), batches (4), internalization (3), direct certificates (4), and external issuance (2). Many cases contain multiple sequential calls or inner assertions. Reliability and guided permissions are additional checks.

## BRC-116 manifest and interactive evidence

`public/manifest.json` is served at `/manifest.json` and linked from the HTML. It declares `metanet.schemaVersion=1`, a 100-satoshi monthly spending authorization, two Level-1 protocols, two Level-2 protocols for fixed peer A, one basket, one certificate type/visible field/verifier A, and a separate two-protocol PACT declaration. Peer/verifier private keys are deliberately public fixture constants; do not use them for valuable assets or identity credentials.

The 19 guided scenarios cover fresh and existing grants; full, selective, and denied groups; outside-group protocols; new/existing/different PACT peers; partial and denied PACT; outside-PACT protocols; exact peer-group matching; Level-0/privileged routing; wallet restart, revocation, and regrant; certificate field/verifier boundaries; persistent/ephemeral spending; disabled grouping/PACT policies; concurrent grouped requests; and origin isolation at different hostnames. Grouped concurrency waits for both requests to settle even if one rejects.

The app cannot see permission tokens, wallet settings, or wallet UI. It records starting-state confirmation, expected prompt/result, app validation status/error code/timing, and a separate tester assertion. A step passes only if the app matches the expected result **and** the tester confirms every expected UI behavior. The tester cannot override an app failure. Incomplete or unconfirmed scenarios never pass. Permission-denial steps accept `ERR_PERMISSION_DENIED` (or the exact canonical message for transports lacking a code); timeouts, unavailable services, and other errors fail the step rather than masquerading as denials. The React Native bridge preserves wallet error codes.

Wallets normalize originators by hostname under BRC-116, so changing only a localhost port is insufficient for isolation. Test the same deployment at distinct hostnames with the same wallet. Missing manifests, legacy/unsupported schemas, stale manifest caches, expired/on-chain permission-token details, transport outages, and additional wallet policy combinations need separate deployments or wallet-side fixtures; this manifest alone cannot reproduce all of them.

References: [BRC-116](https://github.com/bsv-blockchain/BRCs/blob/master/wallet/0116.md), [BRC-73](https://github.com/bsv-blockchain/BRCs/blob/master/wallet/0073.md).

## Funds, certificates and cleanup

No funded card starts automatically or through Run all. Each has its own Run button and spending description. The broadcast option matrix spends 16 satoshis plus fees; batch scenarios spend 10 satoshis plus fees; internalization scenarios create 6 satoshis of outputs plus fees. Broadcast fixtures use `OP_TRUE` and anyone can spend them. Uninternalized outputs and relinquished basket outputs may not be recoverable through the wallet. noSend/explicit-input cards require funding even though their completed fixtures are aborted. Permission token issuance and external certifiers may impose additional wallet/service fees.

The persistent-spending guide broadcasts two 1-satoshi actions plus fees, conditioned on both fitting the unused 100-satoshi budget. Its ephemeral-spending counterpart constructs and aborts noSend actions. Review amounts/fees in the wallet. A delayed `sending` result is evidence of acceptance, not confirmation that mining or network propagation succeeded.

Direct certificate fixtures use an ephemeral local issuer and a placeholder revocation outpoint of 64 zero bytes at output 0 (`txid.0`). They are synthetic test records, not identity evidence or proof of revocation status. External issuance uses the existing conformance certifier endpoint and unique synthetic certificate types. Workflows remove only the exact fixture they acquired. Guided certificate fixtures remain until the tester clicks Remove test certificate; finish or reset the scenario before removing them.

## Regression checks and reporting

`npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, and `npm run build:snippets` are run by CI on Node 22. Automated tests use real SDK crypto, independent peers, signed certificates and AtomicBEEF fixtures, with offline wallet models for lifecycle/storage and UI mocks for tester evidence. They perform no network broadcasts and do not establish SPV validity, external certifier availability, actual wallet UI correctness, or real permission-token behavior.

Downloadable reports contain summaries and case IDs, status, duration, and error codes. Guided reports additionally include origin, manually entered wallet build, preconditions and human assertions. Wallet payloads, transaction bytes, certificate field/keyring contents, logs, and error messages are excluded. Reports remain in memory until downloaded; navigating away or resetting loses them. Attach the exported report plus environment details when reporting a problem, and reproduce the smallest failing case before classifying it as a wallet defect. A failed API request can also reflect fixtures, user decisions, SDK/wallet version mismatch, or service/network state.
