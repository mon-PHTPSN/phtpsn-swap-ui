"use client";

import { useMemo, useState } from "react";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { avalancheFuji } from "viem/chains";
import { useAccount, useBalance, useSwitchChain } from "wagmi";
import { ArrowDownIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon, WalletIcon } from "@heroicons/react/24/outline";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const PHT_ADDRESS = "0x77ae25df9535aeafcd401aba9a44a6c64ca2baaa";
const PAIR_ADDRESS = "0x45F3576b09F0e2a45d7eEc8Ff6CfB7D7FDc14Eaf";
const FUJI_EXPLORER = "https://testnet.snowtrace.io";
const SLIPPAGE_BPS = 100n;
const BPS_DENOMINATOR = 10_000n;

type WatchAssetProvider = {
  request: (request: {
    method: "wallet_watchAsset";
    params: {
      type: "ERC20";
      options: { address: string; symbol: string; decimals: number };
    };
  }) => Promise<boolean>;
};

const formatTokenAmount = (value?: bigint, maximumFractionDigits = 6) => {
  if (value === undefined) return "—";

  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(Number(formatEther(value)));
};

const Home: NextPage = () => {
  const { address, chainId, connector, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitchingNetwork } = useSwitchChain();
  const [avaxAmount, setAvaxAmount] = useState("0.01");
  const [actionMessage, setActionMessage] = useState<string>();

  const parsedAvaxAmount = useMemo(() => {
    try {
      const value = parseEther(avaxAmount);
      return value > 0n ? value : undefined;
    } catch {
      return undefined;
    }
  }, [avaxAmount]);

  const { data: avaxBalance, refetch: refetchAvaxBalance } = useBalance({
    address,
    chainId: avalancheFuji.id,
    query: { enabled: Boolean(address) },
  });

  const { data: phtBalance, refetch: refetchPhtBalance } = useScaffoldReadContract({
    contractName: "SE2TokenTask3",
    functionName: "balanceOf",
    args: [address],
    chainId: avalancheFuji.id,
  });

  const {
    data: quotedPht,
    isFetching: isQuoteLoading,
    refetch: refetchQuote,
  } = useScaffoldReadContract({
    contractName: "SE2TokenTask3",
    functionName: "quotePHTForAVAX",
    args: [parsedAvaxAmount],
    chainId: avalancheFuji.id,
    query: { enabled: parsedAvaxAmount !== undefined },
  });

  const { writeContractAsync: buyPht, isMining } = useScaffoldWriteContract({
    contractName: "SE2TokenTask3",
    chainId: avalancheFuji.id,
  });

  const minimumPht =
    typeof quotedPht === "bigint" ? (quotedPht * (BPS_DENOMINATOR - SLIPPAGE_BPS)) / BPS_DENOMINATOR : undefined;
  const hasEnoughAvax =
    parsedAvaxAmount !== undefined && avaxBalance?.value !== undefined && parsedAvaxAmount < avaxBalance.value;
  const isOnFuji = chainId === avalancheFuji.id;

  const handleBuy = async () => {
    if (parsedAvaxAmount === undefined || minimumPht === undefined) return;

    setActionMessage(undefined);
    try {
      const transactionHash = await buyPht({
        functionName: "buyPHTWithAVAX",
        args: [minimumPht, BigInt(Math.floor(Date.now() / 1000) + 20 * 60)],
        value: parsedAvaxAmount,
      });

      if (transactionHash) {
        setActionMessage("Purchase confirmed. Your PHT balance has been updated.");
        await Promise.all([refetchAvaxBalance(), refetchPhtBalance(), refetchQuote()]);
      }
    } catch (error) {
      console.error("PHT purchase failed", error);
    }
  };

  const handleAddToken = async () => {
    setActionMessage(undefined);
    try {
      const provider = (await connector?.getProvider()) as WatchAssetProvider | undefined;
      if (!provider) {
        setActionMessage("Connect MetaMask before adding PHT.");
        return;
      }

      const accepted = await provider.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: { address: PHT_ADDRESS, symbol: "PHT", decimals: 18 },
        },
      });
      setActionMessage(accepted ? "PHT was added to your wallet." : "The token import was cancelled.");
    } catch (error) {
      console.error("Unable to add PHT to wallet", error);
      setActionMessage("Your wallet could not add the token automatically. Use the PHT address shown below.");
    }
  };

  const renderPrimaryAction = () => {
    if (!isConnected) {
      return (
        <div className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 [&_.btn]:w-full [&_.btn]:border-0 [&_.btn]:bg-transparent [&_.btn]:text-base [&_.btn]:text-primary-content">
          <RainbowKitCustomConnectButton />
        </div>
      );
    }

    if (!isOnFuji) {
      return (
        <button
          type="button"
          className="btn btn-primary h-12 w-full rounded-xl text-base"
          disabled={isSwitchingNetwork}
          onClick={() => switchChainAsync({ chainId: avalancheFuji.id })}
        >
          {isSwitchingNetwork ? <span className="loading loading-spinner loading-sm" /> : null}
          Switch to Avalanche Fuji
        </button>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-primary h-12 w-full rounded-xl text-base"
        disabled={!parsedAvaxAmount || !minimumPht || !hasEnoughAvax || isMining || isQuoteLoading}
        onClick={handleBuy}
      >
        {isMining ? <span className="loading loading-spinner loading-sm" /> : null}
        {isMining ? "Buying PHT…" : hasEnoughAvax ? "Buy PHT" : "Insufficient AVAX balance"}
      </button>
    );
  };

  return (
    <main className="relative isolate flex grow overflow-x-hidden bg-base-200">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-70 [background:radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--color-primary)_28%,transparent),transparent_30%),radial-gradient(circle_at_80%_10%,color-mix(in_oklab,var(--color-accent)_22%,transparent),transparent_28%)]" />

      <div className="mx-auto grid min-w-0 w-full max-w-6xl items-center gap-12 px-5 py-12 lg:grid-cols-[1fr_460px] lg:px-8 lg:py-20">
        <section className="min-w-0 max-w-2xl">
          <div className="badge badge-outline mb-5 h-auto gap-2 rounded-full border-primary/40 px-4 py-2 text-sm">
            <span className="size-2 rounded-full bg-success" />
            Live on Avalanche Fuji
          </div>
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
            Buy PHT directly with <span className="text-primary">AVAX.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-base-content/70">
            No deployment wallet and no debug console. Connect your own wallet and trade against the live PHT/WAVAX pool
            on Pangolin V2.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Connect wallet"],
              ["2", "Confirm the quote"],
              ["3", "Receive PHT"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100/70 p-4"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-content">
                  {number}
                </span>
                <span className="text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <a
              className="link inline-flex items-center gap-1 font-semibold"
              href={`${FUJI_EXPLORER}/address/${PHT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              View PHT contract <ArrowTopRightOnSquareIcon className="size-4" />
            </a>
            <a
              className="link inline-flex items-center gap-1 font-semibold"
              href={`${FUJI_EXPLORER}/address/${PAIR_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
            >
              View liquidity pool <ArrowTopRightOnSquareIcon className="size-4" />
            </a>
          </div>
        </section>

        <section className="min-w-0 rounded-3xl border border-base-300 bg-base-100 p-5 shadow-2xl shadow-primary/10 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Buy PHT</h2>
              <p className="!my-1 text-sm text-base-content/60">Pangolin V2 · Fuji testnet</p>
            </div>
            <span className="badge badge-success badge-soft gap-1 rounded-full">
              <CheckCircleIcon className="size-4" /> Pool live
            </span>
          </div>

          <div className="rounded-2xl bg-base-200 p-4">
            <div className="mb-3 flex justify-between text-sm text-base-content/60">
              <label htmlFor="avax-amount">You pay</label>
              <span>Balance: {formatTokenAmount(avaxBalance?.value, 4)} AVAX</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="avax-amount"
                className="min-w-0 grow bg-transparent text-3xl font-semibold outline-none placeholder:text-base-content/25"
                inputMode="decimal"
                value={avaxAmount}
                onChange={event => setAvaxAmount(event.target.value.replace(",", "."))}
                placeholder="0.0"
                aria-label="AVAX amount"
              />
              <span className="badge h-10 shrink-0 rounded-full border-0 bg-base-100 px-4 font-bold">AVAX</span>
            </div>
          </div>

          <div className="relative z-10 -my-2 flex justify-center">
            <span className="flex size-10 items-center justify-center rounded-xl border-4 border-base-100 bg-base-300">
              <ArrowDownIcon className="size-5" />
            </span>
          </div>

          <div className="rounded-2xl bg-base-200 p-4">
            <div className="mb-3 flex justify-between text-sm text-base-content/60">
              <span>You receive (estimated)</span>
              <span>Balance: {formatTokenAmount(phtBalance, 4)} PHT</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="min-w-0 grow truncate text-3xl font-semibold">
                {isQuoteLoading ? <span className="loading loading-dots loading-md" /> : formatTokenAmount(quotedPht)}
              </div>
              <span className="badge h-10 shrink-0 rounded-full border-0 bg-base-100 px-4 font-bold">PHT</span>
            </div>
          </div>

          <div className="my-5 space-y-2 rounded-xl border border-base-300 px-4 py-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-base-content/60">Slippage protection</span>
              <span className="font-medium">1%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-base-content/60">Minimum received</span>
              <span className="text-right font-medium">{formatTokenAmount(minimumPht)} PHT</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-base-content/60">Route</span>
              <span className="font-medium">AVAX → WAVAX → PHT</span>
            </div>
          </div>

          {renderPrimaryAction()}

          <button
            type="button"
            className="btn btn-ghost mt-3 h-11 w-full rounded-xl text-sm"
            disabled={!isConnected}
            onClick={handleAddToken}
          >
            <WalletIcon className="size-5" /> Add PHT to MetaMask
          </button>

          {actionMessage ? (
            <div role="status" className="alert alert-info mt-4 rounded-xl py-3 text-sm">
              <span>{actionMessage}</span>
            </div>
          ) : null}

          <p className="!mb-0 !mt-4 text-center text-xs leading-5 text-base-content/50">
            Fuji assets have no real-world value. Keep a small amount of AVAX for gas fees.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Home;
