import React, { Component } from "react";
import { GetServerSideProps } from "next";
import Logo from "../../public/images/logo.png";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import Head from 'next/head';
import Icon from '@mdi/react';
import { mdiSnowflake } from '@mdi/js';

interface PropsType {
}

type StateType = {
  email: string;
  password: string;
  message: string;
  errorOccurred: boolean;
  errorMessage: string;
  successOccurred: boolean;
  successMessage: string;
};

class Login extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
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

  async handleSubmit() {
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
    return (
      <div style={{
        minHeight: "100vh",
        backgroundImage: "url('/images/background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <Head>
          <title>SkiScape | Login</title>
        </Head>

        <div style={{ 
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1000
        }}>
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${Math.random() * 100}%`,
                top: "-10px",
                animation: `fall ${Math.random() * 5 + 5}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.3
              }}
            >
              <Icon path={mdiSnowflake} size={0.5} color="#2196f3" />
            </div>
          ))}
        </div>

        <div style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          width: "90%",
          maxWidth: "400px",
          backdropFilter: "blur(10px)"
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <img 
              src="/images/logo.png" 
              alt="SkiScape Logo" 
              style={{ 
                width: "150px", 
                height: "auto",
                margin: "auto"
              }} 
            />
            <h1 style={{ 
              color: "#16435d",
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.5rem"
            }}>
              Welcome Back
            </h1>
            <p style={{ 
              color: "#4a6b82",
              fontSize: "1rem"
            }}>
              Sign in to your account
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={this.state.email}
                onChange={(e) => this.setState({ email: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d4e3f0",
                  backgroundColor: "#f8fafd",
                  color: "#16435d",
                  fontSize: "1rem"
                }}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={this.state.password}
                onChange={(e) => this.setState({ password: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d4e3f0",
                  backgroundColor: "#f8fafd",
                  color: "#16435d",
                  fontSize: "1rem"
                }}
              />
            </div>
            {this.state.errorOccurred && (
              <p style={{ color: "#dc3545", fontSize: "0.9rem", textAlign: "center" }}>
                {this.state.errorMessage}
              </p>
            )}
            {this.state.successOccurred && (
              <p style={{ color: "#28a745", fontSize: "0.9rem", textAlign: "center" }}>
                {this.state.successMessage}
              </p>
            )}
            <button
              onClick={() => {this.handleSubmit();}}
              onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              style={{
                backgroundColor: "#16435d",
                color: "#ffffff",
                padding: "0.75rem",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                transition: "background-color 0.3s ease"
              }}
            >
              Login
            </button>
          </div>

          <div style={{ 
            textAlign: "center", 
            marginTop: "1.5rem",
            color: "#4a6b82"
          }}>
            <p>
              Don't have an account?{" "}
              <a 
                href="/signup" 
                style={{ 
                  color: "#2196f3",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        <style jsx global>{`
          @keyframes fall {
            0% {
              transform: translateY(0) rotate(0deg);
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }
}

export default Login;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createPagesServerClient(context);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
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