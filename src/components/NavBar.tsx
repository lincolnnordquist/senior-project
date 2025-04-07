import React, { Component } from "react";
import Link from "next/link";

interface User {
  id: string;
  email?: string;
  first_name?: string;
  [key: string]: any;
}

interface NavBarProps {
  user?: User | null;
}

class NavBar extends Component<NavBarProps> {
  render() {
    const { user } = this.props;

    const navStyle = {
      backgroundColor: "#0d6efd",
      padding: "0.5rem 1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "60px",
    };

    const brandStyle = {
      fontWeight: "bold",
      fontSize: "1.5rem",
      color: "white",
      textDecoration: "none",
    };

    const navListStyle = {
      listStyleType: "none",
      display: "flex",
      margin: 0,
      padding: 0,
    };

    const navItemStyle = {
      marginLeft: "1rem",
    };

    const navLinkStyle = {
      color: "white",
      textDecoration: "none",
    };

    return (
      <nav style={navStyle}>
        <Link href="/dashboard" style={brandStyle}>
          Ski Scape
        </Link>
        <ul style={navListStyle}>
          <li style={navItemStyle}>
            <Link href="/dashboard" style={navLinkStyle} onMouseEnter={e => e.currentTarget.style.fontWeight = "bold"}
                                                        onMouseLeave={e => e.currentTarget.style.fontWeight = "normal"}>
              Dashboard
            </Link>
          </li>
          {user?.first_name && (
            <li style={{ ...navItemStyle, color: "white", display: "flex", alignItems: "center" }}>
              <span>Welcome, {user.first_name}</span>
            </li>
          )}
            <li style={navItemStyle}>
              <Link href="/logout" style={navLinkStyle} onMouseEnter={e => e.currentTarget.style.fontWeight = "bold"}
                                                  onMouseLeave={e => e.currentTarget.style.fontWeight = "normal"}>
                Logout
              </Link>
            </li>
            <li style={navItemStyle}>
              <Link href="/login" style={navLinkStyle} onMouseEnter={e => e.currentTarget.style.fontWeight = "bold"}
                                                  onMouseLeave={e => e.currentTarget.style.fontWeight = "normal"}>
                Login
              </Link>
            </li>
        </ul>
      </nav>
    );
  }
}

export default NavBar;