import { Code } from "lucide-react";
import createToken from './snippets/create-token.ts?raw';
import listTokens from './snippets/list-tokens.ts?raw';

export const topicsData = [
  {
    id: "tokens",
    title: "Token Creation and Redemption",
    icon: Code,
    snippets: [
      {
        id: "createToken",
        title: "Create a token",
        explanation: "Create a token which represents an event ticket, and store it in a basket within the user's wallet.",
        code: createToken,
        language: "typescript"
      },
      {
        id: "listTokens",
        title: "List tokens",
        explanation: "Retrieve a list of tokens fromn the user within a specified basket.",
        code: listTokens,
        language: "typescript"
      }
    ]
  }
];
