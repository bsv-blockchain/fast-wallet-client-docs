import branchCrypto from './branches/crypto.ts?raw';
import branchMetadata from './branches/metadata.ts?raw';
import branchLists from './branches/lists.ts?raw';
import branchActions from './branches/actions.ts?raw';
import branchInternalize from './branches/internalize.ts?raw';
import branchCertificates from './branches/certificates.ts?raw';
import type { LucideIcon } from 'lucide-react';
import reliabilityKeyStability from './reliability/key-stability.ts?raw';
import reliabilityEncryptionBoundaries from './reliability/encryption-boundaries.ts?raw';
import reliabilityHmacIntegrity from './reliability/hmac-integrity.ts?raw';
import reliabilitySignatureIntegrity from './reliability/signature-integrity.ts?raw';
import reliabilityPagination from './reliability/pagination.ts?raw';
import keyPermissions from './permissions/key-permissions.ts?raw';
import { ShoppingBag, FileArchive, MessageCircleIcon, Network, Stamp, CreditCard, IdCard, ListChecks, ShieldCheck, Activity } from "lucide-react";
import createToken from './basic-tokens/create-token.ts?raw';
import listTokens from './basic-tokens/list-tokens.ts?raw';
import redeemToken from './basic-tokens/redeem-token.ts?raw';
import upload from './distributed-data/upload.ts?raw';
import download from "./distributed-data/download.ts?raw";
import addTokenToOverlay from "./overlays/add-token-to-overlay.ts?raw";
import listHelloWorldTokens from "./overlays/list-hello-world-tokens.ts?raw";
import spendTokenFromOverlay from "./overlays/spend-token-from-overlay.ts?raw";
import resolveIdentityKey from "./identity/resolve-identity-key.ts?raw";
import payToIdentity from "./payments/pay-to-identity.ts?raw";
import createPaymentTransaction from "./payments/create-payment-transaction.ts?raw";
import internalizePayment from "./payments/internalize-payment.ts?raw";
import encryptDecrypt from "./messages/encrypt-decrypt.ts?raw";
import messageDelivery from "./messages/message-delivery.ts?raw";
import receiveMessage from "./messages/receive-message.ts?raw";
import acknowledgeMessage from "./messages/acknowledge-message.ts?raw";
import createCertificate from "./certificates/create-certificate.ts?raw";
import existingCertificate from "./certificates/existing-certificate.ts?raw";
import refundFromBob from "./payments/refund-from-bob.ts?raw";
import conformanceIsAuthenticated from "./conformance/is-authenticated.ts?raw";
import conformanceWaitForAuthentication from "./conformance/wait-for-authentication.ts?raw";
import conformanceGetVersion from "./conformance/get-version.ts?raw";
import conformanceGetNetwork from "./conformance/get-network.ts?raw";
import conformanceGetHeight from "./conformance/get-height.ts?raw";
import conformanceGetHeaderForHeight from "./conformance/get-header-for-height.ts?raw";
import conformanceGetPublicKey from "./conformance/get-public-key.ts?raw";
import conformanceRevealCounterpartyKeyLinkage from "./conformance/reveal-counterparty-key-linkage.ts?raw";
import conformanceRevealSpecificKeyLinkage from "./conformance/reveal-specific-key-linkage.ts?raw";
import conformanceEncrypt from "./conformance/encrypt.ts?raw";
import conformanceDecrypt from "./conformance/decrypt.ts?raw";
import conformanceCreateHmac from "./conformance/create-hmac.ts?raw";
import conformanceVerifyHmac from "./conformance/verify-hmac.ts?raw";
import conformanceCreateSignature from "./conformance/create-signature.ts?raw";
import conformanceVerifySignature from "./conformance/verify-signature.ts?raw";
import conformanceListActions from "./conformance/list-actions.ts?raw";
import conformanceListOutputs from "./conformance/list-outputs.ts?raw";
import conformanceCreateAction from "./conformance/create-action.ts?raw";
import conformanceSignAction from "./conformance/sign-action.ts?raw";
import conformanceAbortAction from "./conformance/abort-action.ts?raw";
import conformanceInternalizeAction from "./conformance/internalize-action.ts?raw";
import conformanceRelinquishOutput from "./conformance/relinquish-output.ts?raw";
import conformanceListCertificates from "./conformance/list-certificates.ts?raw";
import conformanceAcquireCertificate from "./conformance/acquire-certificate.ts?raw";
import conformanceProveCertificate from "./conformance/prove-certificate.ts?raw";
import conformanceRelinquishCertificate from "./conformance/relinquish-certificate.ts?raw";
import conformanceDiscoverByIdentityKey from "./conformance/discover-by-identity-key.ts?raw";
import conformanceDiscoverByAttributes from "./conformance/discover-by-attributes.ts?raw";

interface TopicData {
  id: string;
  title: string;
  icon: LucideIcon;
  description?: string;
  runIndividually?: boolean;
  snippets: { id: string; title: string; explanation: string; code: string }[];
}

const testingTopics: TopicData[] = [
  { id: "brc116", title: "BRC-116 Guided Permissions", icon: ShieldCheck, runIndividually: true, description: "Manifest-driven grouped, individual, peer-grouped and PACT workflows with app-side evidence plus tester assertions. Set the requested wallet state first, follow each grant/deny instruction, and confirm what the wallet actually displayed. Permission grants may mint on-chain tokens and incur wallet fees. Spending scenarios explicitly identify real broadcasts. Nothing runs until you start a scenario and run a step.", snippets: [] },
  {
    id: "branch-matrices", title: "BRC-100 Branch Matrices", icon: ListChecks, runIndividually: true,
    description: "Run cards individually. Every case is recorded and the matrix continues after failures. Crypto and linkage matrices include privileged=true and may request privileged permission: review each prompt. Counterparties and verifiers are page-created test keys. List matrices need fixtures from the funded workflows; missing data is skipped. These are bounded option matrices, not proof of every wallet-internal code path.",
    snippets: [
      { id: "branchMetadataSequence", title: "Authentication and chain metadata sequences", explanation: "Check authentication before and after waiting, repeat version and network calls, and compare headers at height 1 and the current tip. Run while the wallet is locked to exercise the authentication prompt path.", code: branchMetadata },
      { id: "branchCryptoMatrix", title: "Crypto option matrix", explanation: "24 combinations of security level 0/1/2, omitted/self/anyone/peer counterparty, and privileged false/true. Exercise forSelf omitted/false/true, encryption reciprocity, HMAC rejection, both data and direct-hash signing/verification, and counterparty signatures verified independently with a page-owned peer.", code: branchCrypto },
      { id: "branchLinkageMatrix", title: "Key-linkage option matrix", explanation: "20 cases cover counterparty linkage and specific linkage at each security level, symbolic versus explicit counterparties, and privileged access. Validate the returned identities, scope, encrypted bytes, and timestamp. Linkage is revealed only to a throwaway verifier created by this page.", code: branchCrypto },
      { id: "branchActionLists", title: "listActions return and query options", explanation: "67 requests cover all valid combinations of input/output detail flags, script inclusion, label inclusion, any/all query modes, empty labels, limit 1/10000, and offset 1, permission seeking on/off, and any/all queries with one absent label. Run a funded workflow first for nonempty action fixtures.", code: branchLists },
      { id: "branchOutputLists", title: "listOutputs return and query options", explanation: "55 requests cover omitted/locking scripts/entire transactions, all combinations of tags/labels/custom instructions, any/all tag queries, aggregate BEEF membership, positive and negative offsets, and limit 1/10000, permission seeking on/off, and any/all queries with one absent tag. Run the broadcast option matrix first to populate the dedicated fixture basket.", code: branchLists },
      { id: "branchCertificateDiscovery", title: "Certificate discovery options", explanation: "16 identity/attribute queries combine limit 1/10000, offset 0/1, and seekPermission true/false. These call the wallet's discovery services; unavailable services and denied permission are recorded as failures.", code: branchCertificates },
    ],
  },
  {
    id: "funded-workflows", title: "Funded BRC-100 Workflows", icon: CreditCard, runIndividually: true,
    description: "Use a funded test wallet and run one card at a time. Broadcast cases spend real funds: the broadcast matrix creates 16 one-satoshi outputs, batching creates 10, and internalization creates 6, plus wallet-selected transaction and permission fees. Outputs are intentionally anyone-can-spend test fixtures. NoSend cards reserve inputs temporarily and attempt reverse-order cleanup. A broadcast attempt is never treated as cancellable; inspect the wallet after any network failure. No funds are spent by opening this page.",
    snippets: [
      { id: "branchNoSendActions", title: "create → sign → abort option matrix", explanation: "16 noSend cases combine signAndProcess, returnTXIDOnly, randomizeOutputs, and acceptDelayedBroadcast. Parse AtomicBEEF and check returned TXIDs. Abort each fixture in finally, including after an assertion failure.", code: branchActions },
      { id: "branchExplicitInputs", title: "Explicit input and deferred signing sequences", explanation: "16 noSend parent/child sequences cover a supplied unlocking script versus unlockingScriptLength/signAction, input sequence 0/max, transaction version 1/2, and lockTime 0/1. Supply inputBEEF, knownTxids, trustSelf, and noSendChange; check final script/sequence/version/lockTime and abort both actions.", code: branchActions },
      { id: "branchBroadcastActions", title: "Broadcast option matrix — spends funds", explanation: "Creates 16 one-satoshi fixture outputs plus transaction fees. Cover immediate/delayed broadcast, automatic/deferred signing, transaction bytes/TXID-only, and randomized/fixed output order. Keep these tagged outputs for the listOutputs matrix.", code: branchActions },
      { id: "branchSendWithBatches", title: "noSend → noSendChange → sendWith — spends funds", explanation: "Four chained batches use prior noSendChange and knownTxids/trustSelf, then flush through createAction or signAction in immediate/delayed mode. Creates 10 one-satoshi outputs plus fees. Check every batch member's result; cleanup runs only before a broadcast attempt.", code: branchActions },
      { id: "branchInternalizeProtocols", title: "Internalize payment / insertion / mixed — spends funds", explanation: "Broadcasts three two-output fixture transactions: 6 satoshis plus fees. Exercise wallet payment and basket insertion separately and together, repeat internalization with seekPermission=false, verify no duplicate output, then relinquish only the newly inserted fixture. Payment outputs are recoverable only when their payment branch is internalized.", code: branchInternalize },
    ],
  },
  {
    id: "certificate-workflows", title: "Certificate BRC-100 Workflows", icon: Stamp, runIndividually: true,
    description: "These cards acquire certificates, prove selected synthetic fields to page-owned verifier keys, and remove only their exact new serial numbers. Direct certificates use a throwaway local certifier and placeholder revocation outpoints for test purposes. Issuance contacts certify.bsvb.tech and may incur provider or permission fees. Privileged false/true branches request the corresponding wallet authorization.",
    snippets: [
      { id: "branchDirectCertificates", title: "Direct acquisition → list → prove → relinquish", explanation: "Four cases combine keyringRevealer=certifier/subject with privileged false/true. Independently sign and encrypt direct certificates. Check certificate filters and pagination, full versus partial certificate descriptors, zero/one/all disclosed fields, verifier decryption, and exact-serial cleanup.", code: branchCertificates },
      { id: "branchIssuedCertificates", title: "Certifier issuance → list → prove → relinquish", explanation: "Two cases request synthetic certificates from the configured certifier with privileged false/true, exercise the same listing/disclosure branches, and relinquish only the certificate acquired in that case. Server or wallet errors are recorded without assuming they are conformance defects.", code: branchCertificates },
    ],
  },
  {
    id: "reliability",
    title: "Reliability",
    icon: Activity,
    description: "Deterministic BRC-100 checks for key isolation, byte boundaries, cryptographic integrity, and pagination. Calls run sequentially and may request wallet permission. These probes do not create transactions or certificates. Keep the wallet idle for pagination; an empty or changing dataset is reported as skipped. A transport failure is always a failure, including in negative tests.",
    snippets: [
      { id: "reliabilityKeyStability", title: "Stable and isolated keys", explanation: "Repeat identity and derived-key requests, then change the key ID and protocol. Identical requests must return identical valid keys; different scopes must produce different keys.", code: reliabilityKeyStability },
      { id: "reliabilityEncryptionBoundaries", title: "Byte boundary round trips", explanation: "Encrypt and decrypt seven fixed payloads: empty, 1, 16, 255, 256, and 1024 bytes, plus Unicode and a null byte. Compare every recovered byte.", code: reliabilityEncryptionBoundaries },
      { id: "reliabilityHmacIntegrity", title: "HMAC integrity and isolation", explanation: "Verify a fresh HMAC and its determinism, then require invalid-HMAC errors for changed data, a changed HMAC, and a different key. Generic wallet failures do not count as rejection.", code: reliabilityHmacIntegrity },
      { id: "reliabilitySignatureIntegrity", title: "Data and direct-hash signatures", explanation: "Cross-check both signing modes against both verification modes. Changed data and a different key must return invalid-signature errors.", code: reliabilitySignatureIntegrity },
      { id: "reliabilityPagination", title: "Stable pagination", explanation: "Read up to three two-record pages of conformance actions and random-basket outputs, then recheck the first page. Check limits, totals, omitted records, and duplicates. Skips when no fixtures exist or records change during the run.", code: reliabilityPagination },
    ],
  },
  {
    id: "permissions",
    title: "Permissions",
    icon: ShieldCheck,
    description: "Interactive permission checks: run each card individually and make the stated choice in your wallet. Each run uses a fresh level-2 counterparty and key ID. Reset any origin-wide or blanket grants for this site first and use a wallet that enforces permissions. Approval may persist a grant for the protocol/counterparty; remove it in wallet settings afterward if desired. Wallet permission-token fees may apply. The requested key is derived for this test scope.",
    snippets: [
      { id: "permissionAllowKey", title: "Approve a scoped key request", explanation: "Click Run, then approve the request in your wallet. The same scoped key must be available on a second call with seekPermission=false. Use an approval that grants this scope, rather than a one-time grant.", code: keyPermissions },
      { id: "permissionDenyKey", title: "Deny a scoped key request", explanation: "Click Run, then deny the request in your wallet. Require a permission-denied error, then verify a seekPermission=false retry is also denied. A successful response fails this check; connection failures do not count as denials.", code: keyPermissions },
    ],
  },
]

export const topicsData: TopicData[] = [
  {
    id: "tokens",
    title: "Token Creation and Redemption",
    icon: ShoppingBag,
    snippets: [
      {
        id: "createToken",
        title: "Create a token",
        explanation: "Create a token which represents an event ticket, and store it in a basket within the user's wallet.",
        code: createToken
      },
      {
        id: "listTokens",
        title: "List tokens",
        explanation: "Retrieve a list of tokens fromn the user within a specified basket.",
        code: listTokens
      },
      {
        id: "redeemToken",
        title: "Redeem a Token",
        explanation: "Grab the first token of this type in the user's wallet, and spend it.",
        code: redeemToken
      }
    ]
  },
  {
    id: "identity",
    title: "Identity",
    icon: IdCard,
    snippets: [
      {
        id: 'resolveIdentityKey',
        title: "Resolve Identity Key",
        explanation: "Resolve an identity key for a counterparty.",
        code: resolveIdentityKey
      },
    ]
  },
  {
    id: "payments",
    title: "Payments",
    icon: CreditCard,
    snippets: [
      {
        id: 'payToIdentity',
        title: "Pay to Identity",
        explanation: "Calculate an address associated with an identity key.",
        code: payToIdentity
      },
      {
        id: 'createPaymentTransaction',
        title: "Create Payment Transaction",
        explanation: "Create a payment transaction.",
        code: createPaymentTransaction
      },
      {
        id: 'internalizePayment',
        title: "Internalize Payment",
        explanation: "Internalize a payment.",
        code: internalizePayment
      },
      {
        id: 'refundFromBob',
        title: "Refund from Bob",
        explanation: "Refund a payment from Bob.",
        code: refundFromBob
      }
    ]
  },
  { 
    id: "data",
    title: "Distributed Data Storage",
    icon: FileArchive,
    snippets: [
      {
        id: "upload",
        title: "Upload a file",
        explanation: "Upload a file to a distributed data server and advertise it's availability using UHRP (Universal Hash Resolution Protocol).",
        code: upload
      },
      {
        id: "download",
        title: "Download a file",
        explanation: "Download a file from the UHRP Distributed Storage Network. First a lookup resolver will discover which URL(s) the file is stored at, then it will download the file and return the data.",
        code: download
      }
    ]
  },
  {
    id: "overlay",
    title: "Using Overlays",
    icon: Network,
    snippets: [
      {
        id: "addTokenToOverlay",
        title: "Add a token to the hello world overlay",
        explanation: "Making use of the Topic Broadcaster to add a token to a general purpose message board overlay which will accept any push drop token with a single UTF-8 data field.",
        code: addTokenToOverlay
      },
      {
        id: "listHelloWorldTokens",
        title: "List hello world tokens",
        explanation: "Making use of the Lookup Resolver to list tokens from the hello world overlay.",
        code: listHelloWorldTokens
      },
      {
        id: "spendTokenFromOverlay",
        title: "Spend a token from the hello world overlay",
        explanation: "Listing hello world tokens from user's wallet, spending one of them, and broadcasting the transaction to the hello world overlay.",
        code: spendTokenFromOverlay
      }
    ]
  },
  {
    id: "messages",
    title: "Sending Messages",
    icon: MessageCircleIcon,
    snippets: [
      {
        id: 'encryptDecrypt',
        title: "Encrypt and Decrypt a Message Between Peers",
        explanation: "Making use of AES256 encryption with a shared key to encrypt messages intended for a specific counterparty.",
        code: encryptDecrypt
      },
      {
        id: 'messageDelivery',
        title: 'Delivering Messages Securely',
        explanation: 'To deliver messages to counterparties securely we host servers which either route messages between client via web sockets or store and forward messages to the intended recipient.',
        code: messageDelivery
      },
      {
        id: 'receiveMessage',
        title: 'Receiving Messages Securely',
        explanation: 'To receive messages from counterparties we listMessages for a given message box and host.',
        code: receiveMessage
      },
      {
        id: 'acknowledgeMessage',
        title: 'Acknowledging Messages',
        explanation: 'To acknowledge messages we list messages to get messageIds and then acknowledge them in a separate call, removing them from the message box.',
        code: acknowledgeMessage
      }
    ]
  },
  {
    id: "certificates",
    title: "Certificates",
    icon: Stamp,
    snippets: [
      {
        id: 'createCertificate',
        title: "Create a Certificate",
        explanation: "Asks the certifier for an internet-plumbing credential. The type is the SHA-256 of that name, because a certificate type must be exactly 32 bytes.",
        code: createCertificate
      },
      {
        id: 'existingCertificate',
        title: "List Existing Certificates",
        explanation: "Lists certificates of that same 32-byte type. When one is present, decrypts its fields and builds a verifiable certificate.",
        code: existingCertificate
      }   
    ]
  },
  {
    id: "conformance",
    title: "Conformance",
    icon: ListChecks,
    description: "All 28 BRC-100 WalletInterface methods. Run conformance calls them one at a time and continues after a failure. A card passes when @bsv/sdk accepts the wallet's response. createAction, signAction, and abortAction use noSend and then abort, so they do not broadcast. internalizeAction has this page pay the wallet 1 satoshi from a throwaway key, then internalizes that payment. relinquishOutput broadcasts 1 satoshi into the conformance basket and then stops tracking it. acquireCertificate requests a conformance-probe certificate, and relinquishCertificate removes only that certificate.",
    snippets: [
      {
        id: "conformanceIsAuthenticated",
        title: "isAuthenticated",
        explanation: "Checks that the wallet reports an authenticated session.",
        code: conformanceIsAuthenticated
      },
      {
        id: "conformanceWaitForAuthentication",
        title: "waitForAuthentication",
        explanation: "Waits until the wallet reports an authenticated session.",
        code: conformanceWaitForAuthentication
      },
      {
        id: "conformanceGetVersion",
        title: "getVersion",
        explanation: "Checks that the version looks like vendor-major.minor.patch and is 7 to 30 bytes.",
        code: conformanceGetVersion
      },
      {
        id: "conformanceGetNetwork",
        title: "getNetwork",
        explanation: "Checks that the wallet reports mainnet or testnet.",
        code: conformanceGetNetwork
      },
      {
        id: "conformanceGetHeight",
        title: "getHeight",
        explanation: "Checks that the chain height is a positive integer.",
        code: conformanceGetHeight
      },
      {
        id: "conformanceGetHeaderForHeight",
        title: "getHeaderForHeight",
        explanation: "Requests the header at the wallet's current height. The header must be 80 bytes.",
        code: conformanceGetHeaderForHeight
      },
      {
        id: "conformanceGetPublicKey",
        title: "getPublicKey",
        explanation: "Checks that the identity key is a compressed public key.",
        code: conformanceGetPublicKey
      },
      {
        id: "conformanceRevealCounterpartyKeyLinkage",
        title: "revealCounterpartyKeyLinkage",
        explanation: "Reveals linkage for an unrelated counterparty and verifier.",
        code: conformanceRevealCounterpartyKeyLinkage
      },
      {
        id: "conformanceRevealSpecificKeyLinkage",
        title: "revealSpecificKeyLinkage",
        explanation: "Reveals linkage for this wallet's own conformance key to an unrelated verifier.",
        code: conformanceRevealSpecificKeyLinkage
      },
      {
        id: "conformanceEncrypt",
        title: "encrypt",
        explanation: "Encrypts a short message to this wallet and checks that ciphertext comes back.",
        code: conformanceEncrypt
      },
      {
        id: "conformanceDecrypt",
        title: "decrypt",
        explanation: "Encrypts a short message and checks that decrypt returns the same plaintext.",
        code: conformanceDecrypt
      },
      {
        id: "conformanceCreateHmac",
        title: "createHmac",
        explanation: "Creates an HMAC over a short message. The result must be 32 bytes.",
        code: conformanceCreateHmac
      },
      {
        id: "conformanceVerifyHmac",
        title: "verifyHmac",
        explanation: "Creates an HMAC and checks that verifyHmac accepts it.",
        code: conformanceVerifyHmac
      },
      {
        id: "conformanceCreateSignature",
        title: "createSignature",
        explanation: "Signs a short message and checks that a signature comes back.",
        code: conformanceCreateSignature
      },
      {
        id: "conformanceVerifySignature",
        title: "verifySignature",
        explanation: "Signs a short message and checks that verifySignature accepts it.",
        code: conformanceVerifySignature
      },
      {
        id: "conformanceListActions",
        title: "listActions",
        explanation: "Lists actions labeled conformance. An empty list is a valid response.",
        code: conformanceListActions
      },
      {
        id: "conformanceListOutputs",
        title: "listOutputs",
        explanation: "Lists the random basket. An empty basket is a valid response.",
        code: conformanceListOutputs
      },
      {
        id: "conformanceCreateAction",
        title: "createAction",
        explanation: "Creates a 1-satoshi noSend output, checks that a transaction or reference comes back, then aborts it. The wallet needs a spendable output. Nothing is broadcast.",
        code: conformanceCreateAction
      },
      {
        id: "conformanceSignAction",
        title: "signAction",
        explanation: "Creates a signable noSend action, signs it without spending inputs, then aborts it. Nothing is broadcast.",
        code: conformanceSignAction
      },
      {
        id: "conformanceAbortAction",
        title: "abortAction",
        explanation: "Creates a noSend action and checks that abortAction releases it. Nothing is broadcast.",
        code: conformanceAbortAction
      },
      {
        id: "conformanceInternalizeAction",
        title: "internalizeAction",
        explanation: "A throwaway key on this page pays the wallet 1 satoshi. The wallet internalizes that payment. The network fee is spent, and the satoshi returns to the balance when internalization succeeds.",
        code: conformanceInternalizeAction
      },
      {
        id: "conformanceRelinquishOutput",
        title: "relinquishOutput",
        explanation: "Broadcasts 1 satoshi into the conformance basket, then stops tracking that output. The satoshi is no longer spendable by the wallet.",
        code: conformanceRelinquishOutput
      },
      {
        id: "conformanceListCertificates",
        title: "listCertificates",
        explanation: "Lists conformance-probe certificates. An empty list is a valid response.",
        code: conformanceListCertificates
      },
      {
        id: "conformanceAcquireCertificate",
        title: "acquireCertificate",
        explanation: "Asks the certifier for a conformance-probe certificate. The type is the SHA-256 of that name, because a certificate type must be exactly 32 bytes.",
        code: conformanceAcquireCertificate
      },
      {
        id: "conformanceProveCertificate",
        title: "proveCertificate",
        explanation: "Reveals one field of a conformance-probe certificate to an unrelated verifier. Run acquireCertificate first when this card is started on its own.",
        code: conformanceProveCertificate
      },
      {
        id: "conformanceRelinquishCertificate",
        title: "relinquishCertificate",
        explanation: "Removes one conformance-probe certificate. Other certificates stay in the wallet. When none exists yet, this card acquires one and then removes it.",
        code: conformanceRelinquishCertificate
      },
      {
        id: "conformanceDiscoverByIdentityKey",
        title: "discoverByIdentityKey",
        explanation: "Discovers certificates for this wallet's identity key. An empty list is a valid response.",
        code: conformanceDiscoverByIdentityKey
      },
      {
        id: "conformanceDiscoverByAttributes",
        title: "discoverByAttributes",
        explanation: "Discovers certificates with the username deggen. An empty list is a valid response.",
        code: conformanceDiscoverByAttributes
      }
    ]
  },
  ...testingTopics,
];
