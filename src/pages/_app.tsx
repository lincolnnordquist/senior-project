import App, { AppContext, AppInitialProps, AppProps } from "next/app";
import React from "react";
import { withRouter, Router } from "next/router";
import NavBar from "../components/NavBar";
import "../styles/globals.css";

interface MyAppProps extends AppProps {
  router: Router;
}

interface MyAppState {
  user: any | null;
  isDarkMode: boolean;
}

class MyApp extends React.Component<MyAppProps, MyAppState> {
  state: MyAppState = {
    user: null,
    isDarkMode: false,
  };

  componentDidMount() {
    fetch("/api/auth/user", {
      credentials: "include",
    })
      .then((res) => res.ok ? res.json() : Promise.reject('Failed to fetch user'))
      .then((data) => {
        if (data && data.user) {
          this.setState({ user: data.user });
        } else {
          this.setState({ user: null });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user:", error);
        this.setState({ user: null });
      });
  }

  toggleDarkMode = () => {
    this.setState(prevState => {
        const newIsDarkMode = !prevState.isDarkMode;
        this.applyDarkModeStyles(newIsDarkMode);
        return { isDarkMode: newIsDarkMode };
    });
  };

  applyDarkModeStyles = (isDark: boolean) => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark-mode', isDark); 
        document.body.style.backgroundColor = isDark ? '#1a202c' : '#ffffff'; 
      }
  }

  render() {
    const { Component, pageProps, router } = this.props;
    const { user, isDarkMode } = this.state;

    const hideNavbar = ["/login", "/signup"].includes(router.pathname);

    return (
      <>
        {!hideNavbar && (
          <NavBar
            user={user}
            isDarkMode={isDarkMode}
            toggleDarkMode={this.toggleDarkMode}
          />
        )}
        <Component
          {...pageProps}
          user={user}
          isDarkMode={isDarkMode}
        />
      </>
    );
  }
}

export default withRouter(MyApp);