import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  43113: {
    SE2TokenTask3: {
      address: "0x77ae25df9535aeafcd401aba9a44a6c64ca2baaa",
      abi: [
        {
          inputs: [{ internalType: "address", name: "account", type: "address" }],
          name: "balanceOf",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [{ internalType: "uint256", name: "avaxAmount", type: "uint256" }],
          name: "quotePHTForAVAX",
          outputs: [{ internalType: "uint256", name: "phtAmount", type: "uint256" }],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            { internalType: "uint256", name: "minPHTOut", type: "uint256" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
          ],
          name: "buyPHTWithAVAX",
          outputs: [{ internalType: "uint256", name: "phtAmount", type: "uint256" }],
          stateMutability: "payable",
          type: "function",
        },
        {
          anonymous: false,
          inputs: [
            { indexed: true, internalType: "address", name: "buyer", type: "address" },
            { indexed: false, internalType: "uint256", name: "avaxAmount", type: "uint256" },
            { indexed: false, internalType: "uint256", name: "phtAmount", type: "uint256" },
          ],
          name: "PHTPurchased",
          type: "event",
        },
      ],
      deployedOnBlock: 58342255,
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
