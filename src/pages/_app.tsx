import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const showNavbar = router.pathname === "/dashboard" || router.pathname === "/admin";

  return (
    <>
      {showNavbar && <NavBar />}
      <Component {...pageProps} />
    </>
  );
}