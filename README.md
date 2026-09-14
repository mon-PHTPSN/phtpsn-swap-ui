# PHT Exchange

PHT Exchange is a public, client-side interface for buying **PHTPSN Token (PHT)** with **AVAX** on the Avalanche Fuji testnet. Trades use the live PHT/WAVAX liquidity pool on Pangolin V2.

- Live site: <https://mon-phtpsn.github.io/phtpsn-swap-ui/>
- Network: Avalanche Fuji C-Chain (chain ID `43113`)
- PHT token: [`0x77Ae25df9535AeaFcd401Aba9a44a6c64ca2BAAA`](https://testnet.snowtrace.io/address/0x77Ae25df9535AeaFcd401Aba9a44a6c64ca2BAAA)
- PHT/WAVAX pair: [`0x45F3576b09F0e2a45d7eEc8Ff6CfB7D7FDc14Eaf`](https://testnet.snowtrace.io/address/0x45F3576b09F0e2a45d7eEc8Ff6CfB7D7FDc14Eaf)

> Fuji AVAX and PHT are testnet assets and have no real-world value.

## Use the exchange

1. Open the [live site](https://mon-phtpsn.github.io/phtpsn-swap-ui/).
2. Connect MetaMask or another supported wallet.
3. Switch the wallet to Avalanche Fuji when prompted.
4. Enter the amount of AVAX to spend and review the live PHT estimate.
5. Select **Buy PHT** and confirm the transaction in the wallet.
6. Select **Add PHT to MetaMask** if the token balance is not already visible.

Keep a small amount of Fuji AVAX in the wallet for the network transaction fee (gas).

## What the application depends on

The deployed site is a static frontend. It does **not** require a local Hardhat node, the deployment account, a private server, or the original monorepo to remain online.

At runtime, the browser uses:

- the connected user's wallet to authorize and pay for the transaction;
- Avalanche's public Fuji RPC endpoint to read and submit blockchain data;
- the deployed Task 3 PHT smart contract to request quotes and execute purchases; and
- Pangolin V2's Fuji Router and PHT/WAVAX pool to perform the exchange.

The flow is:

```text
User wallet → PHT Exchange → Task 3 PHT contract → Pangolin V2 Router → PHT/WAVAX pool
```

The PHT contract sends purchased tokens to the wallet that submitted the transaction. The deployment account is not involved in user trades.

## Contract configuration

| Component | Fuji address |
| --- | --- |
| Task 3 PHT token | `0x77Ae25df9535AeaFcd401Aba9a44a6c64ca2BAAA` |
| PHT/WAVAX pair | `0x45F3576b09F0e2a45d7eEc8Ff6CfB7D7FDc14Eaf` |
| Pangolin V2 Router | `0x2D99ABD9008Dc933ff5c0CD271B88309593aB921` |
| Pangolin V2 Factory | `0xE4A575550C2b460d2307b82dCd7aFe84AD1484dd` |
| WAVAX | `0xd00ae08403B9bbb9124bB305C09058E32C39A48c` |

Pangolin's published addresses are documented in its [Avalanche V2 contract reference](https://docs.pangolin.exchange/developers/contracts-and-integration-reference/avalanche-v2).

## Run locally

Requirements: Node.js 22 and Corepack.

```bash
corepack enable
yarn install
yarn dev
```

Open <http://localhost:3000>. Local development still talks to the public Fuji network; no local blockchain process is needed.

## Validate a production build

```bash
yarn lint
yarn check-types
yarn build
```

The static site is generated in `out/`. The public instance is served by GitHub Pages from the repository's `gh-pages` branch.

## Optional environment variables

Copy values into `.env.local` only when you need custom providers:

```dotenv
NEXT_PUBLIC_ALCHEMY_API_KEY=your_key
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

The default configuration includes a public Fuji RPC endpoint, so MetaMask use does not require either variable. Never put seed phrases or private keys in this repository.

## Technology

Next.js, React, TypeScript, wagmi, viem, RainbowKit, Tailwind CSS, and Scaffold-ETH 2 components.

## License

MIT. See [LICENSE](./LICENSE).
