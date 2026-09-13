import { SwitchTheme } from "~~/components/SwitchTheme";

const PHT_ADDRESS = "0x77ae25df9535aeafcd401aba9a44a6c64ca2baaa";

export const Footer = () => {
  return (
    <footer className="relative flex min-h-16 items-center justify-center border-t border-base-300 bg-base-100 px-16 py-4 text-center text-xs text-base-content/55">
      <p className="!m-0">
        PHTPSN Token · Avalanche Fuji ·{" "}
        <a
          className="link font-medium"
          href={`https://testnet.snowtrace.io/address/${PHT_ADDRESS}`}
          target="_blank"
          rel="noreferrer"
        >
          {PHT_ADDRESS.slice(0, 6)}…{PHT_ADDRESS.slice(-4)}
        </a>
      </p>
      <SwitchTheme className="absolute right-4" />
    </footer>
  );
};
