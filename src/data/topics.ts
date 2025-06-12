import { ShoppingBag, FileArchive } from "lucide-react";
import createToken from './snippets/create-token.ts?raw';
import listTokens from './snippets/list-tokens.ts?raw';
import redeemToken from './snippets/redeem-token.ts?raw';
import upload from './snippets/upload.ts?raw';
import download from "./snippets/download.ts?raw";

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
  }
];
