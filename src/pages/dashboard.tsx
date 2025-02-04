import React, { Component } from "react";

interface User {
  id: string;
  email: string;
}

interface DashboardState {
  user: User | null;
}

class Dashboard extends Component<{}, DashboardState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      user: null,
    };
  }

  async fetchUser() {
    try {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        this.setState({ user: data.user });
      } else {
        console.warn("User not authenticated. Redirecting to login.");
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  componentDidMount() {
    this.fetchUser();
  }

  render() {
    const { user } = this.state;

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Ski Resort Dashboard</h1>
        </div>

        <div style={styles.content}>
          {user ? (
            <>
              <h2 style={styles.welcomeText}>Welcome, {user.email}!</h2>
              <p style={styles.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in 
                eros elementum tristique. 
              </p>

              <p style={styles.description}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in 
                eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, 
                ut commodo diam libero vitae erat.
              </p>

              <button style={styles.logoutButton} onClick={() => (window.location.href = "/logout")}>
                Logout
              </button>
            </>
          ) : (
            <p style={styles.loadingText}>Loading user data...</p>
          )}
        </div>
      </div>
    );
  }
}

// Styles for a ski resort theme
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: "100vh",
    background: "linear-gradient(to bottom, #cce0ff, #ffffff)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Arial', sans-serif",
  },
  header: {
    background: "rgba(255, 255, 255, 0.8)",
    padding: "15px",
    borderRadius: "10px",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
    width: "80%",
  },
  title: {
    margin: 0,
    color: "#2a5f9e",
  },
  content: {
    background: "rgba(255, 255, 255, 0.9)",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.15)",
    textAlign: "center",
    width: "60%",
    marginTop: "20px",
  },
  welcomeText: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#1b4b8e",
  },
  description: {
    fontSize: "16px",
    color: "#444",
    margin: "10px 0",
  },
  loadingText: {
    fontSize: "18px",
    color: "#666",
  },
  logoutButton: {
    marginTop: "20px",
    backgroundColor: "#1b4b8e",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  logoutButtonHover: {
    backgroundColor: "#154073",
  },
};

export default Dashboard;