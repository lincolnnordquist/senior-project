import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  // Hide navbar on login and signup pages
  const hideNavbar = ["/login", "/signup"].includes(router.pathname);

  useEffect(() => {
    // Fetch user data when the app loads
    fetch("/api/auth/user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
      });
  }, []);

  return (
    <>
      {!hideNavbar && <NavBar user={user} />}
      <Component {...pageProps} user={user} />
    </>
  );
}