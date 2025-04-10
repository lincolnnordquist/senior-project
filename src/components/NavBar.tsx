import React, { Component } from "react";
import Link from "next/link";
import Logo from "../../public/images/logo.png";
import Image from "next/image";

interface User {
  id: string;
  email?: string;
  first_name?: string;
  [key: string]: any;
}

interface NavBarProps {
  user?: User | null;
}

interface NavBarState {
  user: User | null;
}

class NavBar extends Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props);
    this.state = {
      user: null,
    };
  }

  async componentDidMount() {
    try {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        this.setState({ user: data.user }, () => {
          console.log("User data on navvv:", this.state.user);
        });
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }

  render() {
    const { user } = this.state;

    const navStyle = {
      background: "linear-gradient(to right, #0d6efd, #4ab4f4)",
      padding: "0.5rem 1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "75px",
    };

    const titleStyle = {
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
      color: "#eaf4fb",
      textDecoration: "none",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.15)",
      transition: "all 0.2s ease",
    };

    return (
      <nav style={navStyle}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image src={Logo} alt="Ski Scape Logo" width={90} height={90} />
          <span style={titleStyle}>Ski Scape</span>
        </Link>
        {user?.first_name && (
            <li style={{ ...navItemStyle, color: "white", display: "flex", alignItems: "center" }}>
              <span>Welcome, {user.first_name}</span>
            </li>
          )}
        <ul style={navListStyle}>

          <li style={navItemStyle}>
            <Link href="/dashboard" style={navLinkStyle} onMouseEnter={e => {
              e.currentTarget.style.fontWeight = "bold";
              e.currentTarget.style.textDecoration = "underline";
            }} onMouseLeave={e => {
              e.currentTarget.style.fontWeight = "normal";
              e.currentTarget.style.textDecoration = "none";
            }}>
              Dashboard
            </Link>
          </li>
            
             {
              this.state.user ? 
              <li style={navItemStyle}>
            <Link href="/logout" style={navLinkStyle} onMouseEnter={e => {
              e.currentTarget.style.fontWeight = "bold";
              e.currentTarget.style.textDecoration = "underline";
            }} onMouseLeave={e => {
              e.currentTarget.style.fontWeight = "normal";
              e.currentTarget.style.textDecoration = "none";
            }}>
              Logout
            </Link>
          </li>
              :
              <li style={navItemStyle}>
              <Link href="/login" style={navLinkStyle} onMouseEnter={e => {
                e.currentTarget.style.fontWeight = "bold";
                e.currentTarget.style.textDecoration = "underline";
              }} onMouseLeave={e => {
                e.currentTarget.style.fontWeight = "normal";
                e.currentTarget.style.textDecoration = "none";
              }}>
                Login
              </Link>
            </li>
             }
         
        </ul>
      </nav>
    );
  }
}

export default NavBar;