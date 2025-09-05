import { ShoppingBag, FileArchive, MessageCircleIcon, Network, Stamp, CreditCard, IdCard, PersonStanding } from "lucide-react";
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
        explanation: "Encapsulates a credential attesting to your plumbing skills.",
        code: createCertificate
      },
      {
        id: 'existingCertificate',
        title: "List Existing Certificates",
        explanation: "List existing certificates from your wallet.",
        code: existingCertificate
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
  }
];
