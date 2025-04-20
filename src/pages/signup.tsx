import React, { Component } from "react";
import Head from 'next/head';
import Icon from '@mdi/react';
import { mdiSnowflake } from '@mdi/js';

interface SignupState {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  message: string;
  zip_code: string;
}

class Signup extends Component<{}, SignupState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      zip_code: "",
      message: "",
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [e.target.name]: e.target.value } as Pick<SignupState, keyof SignupState>);
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password,
        first_name: this.state.first_name,
        last_name: this.state.last_name,
        phone_number: this.state.phone_number,
        zip_code: this.state.zip_code,
      }),
    });

    const data = await res.json();
    this.setState({ message: data.message });

    if (res.ok) {
      window.location.href = "/login";
    }
  };

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
          <title>SkiScape | Register</title>
        </Head>

        {/* Snowfall Effect */}
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
            <h1 style={{ 
              color: "#16435d",
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.5rem"
            }}>
              Create Account
            </h1>
          </div>

          <form onSubmit={this.handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                onChange={this.handleChange}
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
                type="text"
                name="last_name"
                placeholder="Last Name"
                onChange={this.handleChange}
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
                type="email"
                name="email"
                placeholder="Email"
                onChange={this.handleChange}
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
                type="text"
                name="phone_number"
                placeholder="Phone Number"
                onChange={this.handleChange}
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
                type="text"
                name="zip_code"
                placeholder="Zip Code"
                onChange={this.handleChange}
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
                name="password"
                placeholder="Password"
                onChange={this.handleChange}
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
            {this.state.message && (
              <p style={{ color: "#dc3545", fontSize: "0.9rem", textAlign: "center" }}>
                {this.state.message}
              </p>
            )}
            <button
              type="submit"
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
              Sign Up
            </button>
          </form>

          <div style={{ 
            textAlign: "center", 
            marginTop: "1.5rem",
            color: "#4a6b82"
          }}>
            <p>
              Already have an account?{" "}
              <a 
                href="/login" 
                style={{ 
                  color: "#2196f3",
                  textDecoration: "none",
                  fontWeight: "bold"
                }}
              >
                Log in
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

export default Signup;