import { Code } from "lucide-react";
import createToken from './snippets/create-token.ts?raw';
import createTokenCode from './snippets/create-token.js?raw';

export const topicsData = [
  {
    id: "tokens",
    title: "Token Creation and Redemption",
    icon: Code,
    snippets: [
      {
        id: "createToken",
        title: "Create a Token",
        explanation: "Create a token which represents an event ticket.",
        code: createToken,
        compiledCode: createTokenCode,
        language: "typescript"
      }
    ]
  }
];
