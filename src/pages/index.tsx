import React, { Component } from "react";
import { GetServerSideProps } from "next";
import { Props } from "next/script";
import Home from "./test";
import Background from "../../public/images/home-page.png";
import Logo from "../../public/images/logo.png";
import Head from 'next/head';

type PropsType = {
}

type StatesType = {}

class HomePage extends React.Component<PropsType, StatesType> {
  constructor(props: PropsType) {
		super(props);

		this.state = {};
  }

componentDidMount(): void {
  
}

componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<StatesType>, snapshot?: any): void {
  
}

  render(): React.ReactNode {
    return (
      <div
        style={{
          backgroundImage: `url(${Background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          textAlign: "center",
          padding: "0 2rem 2rem 2rem",
          boxSizing: "border-box",
        }}>
          <Head>
          <title>SkiScape | Home</title>
        </Head>
        {/* <img
          src={Logo.src}
          alt="Ski Scape Logo"
          style={{ width: "200px" }}
        /> */}
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "2rem",
            borderRadius: "1rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "#ffffff" }}>
            Welcome to Ski Scape
          </h1>
          <p style={{ fontSize: "1.2rem", marginBottom: "2rem", color: "#f0f0f0" }}>
            Discover and review your favorite ski resorts
          </p>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <a
              href="/login"
              style={{
                backgroundColor: "#ffffff",
                color: "#16435d",
                padding: "0.75rem 1.5rem",
                marginRight: "1rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              Login
            </a>
            <a
              href="/signup"
              style={{
                backgroundColor: "#16435d",
                color: "#ffffff",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                textDecoration: "none",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              Sign Up
            </a>
          </div>
          <div>
            <p style={{marginBottom: '16px'}}>or</p>
            <a
              href="/dashboard"
              style={{
                backgroundColor: "#ffffff",
                color: "#16435d",
                padding: "12px",
                borderRadius: "0.5rem",
                textDecoration: "none",
                fontWeight: "bold",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              Continue as guest
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default HomePage;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
    },
  };
};