import React, { Component } from "react";
import { GetServerSideProps } from "next";
import Logo from "../../public/images/logo.png";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";


interface LoginState {
  email: string;
  password: string;
  message: string;
}

class Login extends Component<{}, LoginState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      email: "",
      password: "",
      message: "",
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [e.target.name]: e.target.value } as Pick<LoginState, keyof LoginState>);
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    if (res.ok) {
      window.location.href = "/dashboard";
    }
  };

  render() {
    return (
      <div style={styles.container}>
        <img
        onClick={() => window.location.href = "/"}
          src={Logo.src}
          alt="Ski Scape Logo"
          style={{ width: "200px", cursor: "pointer" }}
        />
        <div style={styles.card}>
          <h1 style={styles.title}>Welcome</h1>
          <p style={styles.subtitle}>Log in or create an account.</p>

          <form onSubmit={this.handleSubmit} style={styles.form}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={this.handleChange}
              required
              style={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={this.handleChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Login</button>
          </form>

          {this.state.message && <p style={{color: "green", fontSize: "14px", marginTop: "10px",}}>{this.state.message}</p>}

          <p style={{marginTop: "20px", fontSize: "14px", color: "#666",}}>
            Don't have an account? <a href="/signup" style={styles.link}>Sign up here</a>
          </p>
        </div>
      </div>
    );
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    background: "linear-gradient(to bottom, #cce0ff, #ffffff)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Arial', sans-serif",
  },
  card: {
    background: "rgba(255, 255, 255, 0.95)",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
    width: "320px",
  },
  title: {
    margin: "0 0 10px 0",
    color: "#2a5f9e",
    fontSize: "24px",
  },
  subtitle: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: "10px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
    color: "#333",
  },
  button: {
    backgroundColor: "#1b4b8e",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonHover: {
    backgroundColor: "#154073",
  },
  link: {
    color: "#1b4b8e",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

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