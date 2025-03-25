import React from "react";
import Link from "next/link";

const NavBar: React.FC = () => {
  const navStyle = {
    backgroundColor: "#0d6efd",
    padding: "0.5rem 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
          <Link href="/dashboard" style={navLinkStyle}>
            Dashboard
          </Link>
        </li>
        <li style={navItemStyle}>
          <Link href="/map" style={navLinkStyle}>
            Map
          </Link>
        </li>
        <li style={navItemStyle}>
          <Link href="/logout" style={navLinkStyle}>
            Logout
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;