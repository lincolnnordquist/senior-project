import React, { Component } from "react";
import Logo from "../../public/images/logo.png";
import Head from 'next/head';


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
      <div style={styles.container}>
        <Head>
          <title>SkiScape | Register</title>
        </Head>
        <img
        onClick={() => window.location.href = "/"}
          src={Logo.src}
          alt="Ski Scape Logo"
          style={{ width: "200px", cursor: "pointer" }}
        />
        <div style={styles.card}>
          <h1 style={styles.title}>Register</h1>
          {/* <p style={styles.subtitle}>Sign up to access the best ski resort experience!</p> */}

          <form onSubmit={this.handleSubmit} style={styles.form}>
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              onChange={this.handleChange}
              required
              style={styles.input}
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              onChange={this.handleChange}
              required
              style={styles.input}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={this.handleChange}
              required
              style={styles.input}
            />
            <input
              type="text"
              name="phone_number"
              placeholder="Phone Number"
              onChange={this.handleChange}
              style={styles.input}
            />
            <input
              type="text"
              name="zip_code"
              placeholder="Zip Code"
              onChange={this.handleChange}
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
            <button type="submit" style={styles.button}>Sign Up</button>
          </form>

          {this.state.message && <p style={styles.message}>{this.state.message}</p>}

          <p style={styles.footerText}>
            Already have an account? <a href="/login" style={styles.link}>Log in here</a>
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
    width: "350px",
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
  message: {
    color: "red",
    fontSize: "14px",
    marginTop: "10px",
  },
  footerText: {
    marginTop: "20px",
    fontSize: "14px",
    color: "#666",
  },
  link: {
    color: "#1b4b8e",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Signup;