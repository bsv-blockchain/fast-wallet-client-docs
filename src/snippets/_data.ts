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
import conformanceSession from "./conformance/session.ts?raw";
import conformanceChain from "./conformance/chain.ts?raw";
import conformanceCrypto from "./conformance/crypto.ts?raw";
import conformanceLinkage from "./conformance/linkage.ts?raw";
import conformanceActions from "./conformance/actions.ts?raw";
import conformanceOutputs from "./conformance/outputs.ts?raw";
import conformanceCertificates from "./conformance/certificates.ts?raw";
import conformanceDiscovery from "./conformance/discovery.ts?raw";

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
    description: "BRC-100 wallet checks for the methods in the WalletInterface conformance suite. A run succeeds when @bsv/sdk accepts the wallet's response. Run all keeps going after a failure so each example reports on its own. Create, sign, and internalize actions stay on the other pages. Relinquish is left out because it deletes wallet state. The no-send action selects an input and then aborts, so a working wallet does not broadcast it.",
    snippets: [
      {
        id: "conformanceSession",
        title: "Session",
        explanation: "Checks isAuthenticated, waitForAuthentication, getVersion, and getNetwork. The version must look like vendor-major.minor.patch.",
        code: conformanceSession
      },
      {
        id: "conformanceChain",
        title: "Chain tip",
        explanation: "Checks getHeight and getHeaderForHeight. The header must be 80 bytes.",
        code: conformanceChain
      },
      {
        id: "conformanceCrypto",
        title: "Keys and cryptography",
        explanation: "Checks getPublicKey, then an encrypt/decrypt round trip, createHmac/verifyHmac, and createSignature/verifySignature.",
        code: conformanceCrypto
      },
      {
        id: "conformanceLinkage",
        title: "Key linkage",
        explanation: "Checks revealCounterpartyKeyLinkage and revealSpecificKeyLinkage against unrelated verifier keys.",
        code: conformanceLinkage
      },
      {
        id: "conformanceActions",
        title: "Actions",
        explanation: "Checks listActions, then createAction with noSend, then abortAction. The wallet needs a spendable output to build the probe. Aborting releases it without a broadcast.",
        code: conformanceActions
      },
      {
        id: "conformanceOutputs",
        title: "Outputs",
        explanation: "Checks listOutputs on the default basket. An empty basket is a valid response.",
        code: conformanceOutputs
      },
      {
        id: "conformanceCertificates",
        title: "Certificate queries",
        explanation: "Checks listCertificates with a 32-byte type. When a certificate exists, proveCertificate reveals one field. An empty list is a valid response.",
        code: conformanceCertificates
      },
      {
        id: "conformanceDiscovery",
        title: "Discovery",
        explanation: "Checks discoverByIdentityKey for this wallet and discoverByAttributes for a username. An empty certificate list is a valid response.",
        code: conformanceDiscovery
      }
    ]
  }
];
