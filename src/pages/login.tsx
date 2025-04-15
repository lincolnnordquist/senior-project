import React, { Component } from "react";
import { GetServerSideProps } from "next";
import Logo from "../../public/images/logo.png";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import Head from 'next/head';


interface StateType {
  email: string;
  password: string;
  message: string;

  errorOccurred: boolean;
  errorMessage: string;
  successOccurred: boolean;
  successMessage: string;
}

class Login extends Component<{}, StateType> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: "",
      password: "",
      message: "",

      errorOccurred: false,
      errorMessage: "",
      successOccurred: false,
      successMessage: "",
    };
  }

  async login() {
    if(!this.state.email || !this.state.password) {
      this.setState({
        errorOccurred: true,
        errorMessage: "Please fill in all fields.",
      });
      return;
    } else {    
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
      }),
      credentials: "include",
    });

    const data = await res.json();
    this.setState({ message: data.message });
    console.log("data", data)

    if (res.ok) {
      console.log("made it to res.ok")
      window.location.href = "/dashboard";

    } else {
      console.log("made it to else")
      this.setState({
        errorOccurred: true,
        errorMessage: data.message,
      });
    }

  }
  }


  render() {
    const container: React.CSSProperties =  {
      height: "100vh",
      background: "linear-gradient(to bottom, #cce0ff, #ffffff)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Arial', sans-serif",
    }
    const card: React.CSSProperties = {
      background: "rgba(255, 255, 255, 0.95)",
      padding: "20px",
      borderRadius: "12px",
      boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
      textAlign: "center",
      width: "320px",
    }
    const title: React.CSSProperties = {
      margin: "0 0 10px 0",
      color: "#2a5f9e",
      fontSize: "24px",
    }
    const subtitle: React.CSSProperties = {
      color: "#666",
      fontSize: "14px",
      marginBottom: "20px",
    }
    const form: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
    }
    const input: React.CSSProperties = {
      padding: "10px",
      marginBottom: "15px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontSize: "14px",
      color: "#333",
    }
    const button: React.CSSProperties = {
      backgroundColor: "#1b4b8e",
      color: "white",
      padding: "10px",
      border: "none",
      borderRadius: "5px",
      fontSize: "16px",
      cursor: "pointer",
      transition: "background 0.3s",
    }
    const buttonHover: React.CSSProperties = {
      backgroundColor: "#154073",
    }
    const link: React.CSSProperties = {
      color: "#1b4b8e",
      textDecoration: "none",
      fontWeight: "bold",
    }

    return (
      <div style={container}>
        <Head>
          <title>SkiScape | Login</title>
        </Head>
        <img
        onClick={() => window.location.href = "/"}
          src={Logo.src}
          alt="Ski Scape Logo"
          style={{ width: "200px", cursor: "pointer" }}
        />
        <div style={card}>
          <h1 style={title}>Welcome</h1>
          <p style={subtitle}>Log in or create an account.</p>

          <div style={form}>
            <input
              value={this.state.email}
              type="email"
              name="email"
              placeholder="Email"
              onChange={(e) => this.setState({ email: e.target.value })}
              required
              style={input}
            />
            <input
              value={this.state.password}
              type="password"
              name="password"
              placeholder="Password"
              onChange={(e) => this.setState({ password: e.target.value })}
              required
              style={input}
            />
            <button
              onClick={() => {this.login();}}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              style={button}
            >
              Login
            </button>
          </div>

          {this.state.errorOccurred && <p style={{color: "red", fontSize: "14px", marginTop: "10px",}}>{this.state.errorMessage}</p>}
          {this.state.successOccurred && <p style={{color: "green", fontSize: "14px", marginTop: "10px",}}>{this.state.successMessage}</p>}

          <p style={{marginTop: "20px", fontSize: "14px", color: "#666",}}>
            Don't have an account? <a href="/signup" style={link}>Sign up here</a>
          </p>
        </div>
      </div>
    );
  }
}

export default Login;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createPagesServerClient(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};