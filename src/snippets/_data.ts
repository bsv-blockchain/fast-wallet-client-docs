import { ShoppingBag, FileArchive, MessageCircleIcon, Network, Stamp, CreditCard, IdCard, ListChecks } from "lucide-react";
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

export const topicsData = [
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
  }
];
