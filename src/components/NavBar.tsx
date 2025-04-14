import React, { Component } from "react";
import Link from "next/link";
import Logo from "../../public/images/logo.png";
import Image from "next/image";
import Modal from "../components/Modal";

interface User {
  id: string;
  email?: string;
  first_name: string;
  last_name: string;
  [key: string]: any;
  is_admin?: boolean;
  zip_code: string;
  phone_number: string;
}

interface NavBarProps {
  user?: User | null;
}

interface NavBarState {
  user: User | null;
  screenSize: number;
  accountModal: boolean;

  errorOccurred: boolean;
  errorMessage: string;
  successOccurred: boolean;
  successMessage: string;
}

class NavBar extends Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props);
    this.state = {
      user: null,
      screenSize: typeof window !== "undefined" ? window.innerWidth : 851,
      accountModal: false,

      errorOccurred: false,
      errorMessage: "",
      successOccurred: false,
      successMessage: "",
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

    window.addEventListener("resize", this.handleResize);
    this.setState({ screenSize: window.innerWidth });
  }

  isMobileView = () => this.state.screenSize < 850;

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({ screenSize: window.innerWidth });
  };

  updateAccount() {
    if (!this.state.user) {
      console.error("User not found");
      return;
    } else if (this.state.user.first_name === '') {
      this.setState({errorOccurred: true, errorMessage: "You must enter a first name."});
      return;
    } else if (this.state.user.last_name === '') {
      this.setState({errorOccurred: true, errorMessage: "You must enter a last name."});
      return;
    } else if (this.state.user.email === '') {
      this.setState({errorOccurred: true, errorMessage: "You must enter an email."});
      return;
    } else if (this.state.user.zip_code === '') {
      this.setState({errorOccurred: true, errorMessage: "You must enter a zip code."});
      return;
    } else if (this.state.user.phone_number === '') {
      this.setState({errorOccurred: true, errorMessage: "You must enter a phone number."});
      return;
    } else {
      fetch("/api/auth/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: this.state.user.first_name,
          last_name: this.state.user.last_name,
          email: this.state.user.email,
          zip_code: this.state.user.zip_code,
          phone_number: this.state.user.phone_number,
        }),
      })
        .then((res) => {
          if (res.ok) {
            this.setState({ accountModal: false, successOccurred: true, successMessage: "User updated successfully." }, () => {
              setTimeout(() => {
                window.location.reload();
                }
                , 2000);
            });
          } else {
            console.error("Failed to update user");
            this.setState({errorOccurred: true, errorMessage: "Failed to update user."});
          }
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          this.setState({errorOccurred: true, errorMessage: "Error updating user."});
        });
    }
  }

  render() {
    const { user } = this.state;

    const navStyle: React.CSSProperties = {
      background: "linear-gradient(to right, #0d6efd, #4ab4f4)",
      padding: "0.5rem 1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: "75px",
    };

    const titleStyle: React.CSSProperties = {
      display: this.isMobileView() ? "none" : "block",
      fontWeight: "bold",
      fontSize: "1.5rem",
      color: "white",
      textDecoration: "none",
    };

    const navListStyle: React.CSSProperties = {
      listStyleType: "none",
      display: "flex",
      justifyContent: "space-between",
      margin: 0,
      padding: 0,
    };

    const navItemStyle: React.CSSProperties = {
      marginLeft: this.isMobileView() ? "8px" : "16px",
    };

    const navLinkStyle: React.CSSProperties = {
      color: "#eaf4fb",
      textDecoration: "none",
      textShadow: "0 1px 2px rgba(0, 0, 0, 0.15)",
      transition: "all 0.2s ease",
      cursor: "pointer",
    };

    const inputStyle: React.CSSProperties = {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #d4e3f0",
      backgroundColor: "#f8fafd",
      color: "#16435d",
      fontSize: "1rem",
      width: "100%",
      margin: "0.5rem 0",
    }

    return (
      <nav style={navStyle}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Image src={Logo} alt="Ski Scape Logo" width={90} height={90} />
          <span style={titleStyle}>Ski Scape</span>
        </Link>
        <ul style={navListStyle}>

          <li style={navItemStyle}>
            <Link href="/" style={navLinkStyle} onMouseEnter={e => {
              e.currentTarget.style.fontWeight = "bold";
              e.currentTarget.style.textDecoration = "underline";
            }} onMouseLeave={e => {
              e.currentTarget.style.fontWeight = "normal";
              e.currentTarget.style.textDecoration = "none";
            }}>
              Home
            </Link>
          </li>

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

          {this.state.user?.is_admin ? 
            <li style={navItemStyle}>
            <Link href="/admin" style={navLinkStyle} onMouseEnter={e => {
              e.currentTarget.style.fontWeight = "bold";
              e.currentTarget.style.textDecoration = "underline";
            }} onMouseLeave={e => {
              e.currentTarget.style.fontWeight = "normal";
              e.currentTarget.style.textDecoration = "none";
            }}>
              Admin Portal
            </Link>
          </li>
          : 
          null
}

{this.state.user ? 
<li style={navItemStyle} onClick={() => this.state.accountModal ? this.setState({ accountModal: false }) : this.setState({ accountModal: true })}>
            <span style={navLinkStyle} onMouseEnter={e => {
              e.currentTarget.style.fontWeight = "bold";
              e.currentTarget.style.textDecoration = "underline";
            }} onMouseLeave={e => {
              e.currentTarget.style.fontWeight = "normal";
              e.currentTarget.style.textDecoration = "none";
            }}>
              Account
            </span>
          </li>
          : null}
          
            
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
        <Modal show={this.state.accountModal}>
  <div
    style={{
      textAlign: "center",
      backgroundColor: "#fff",
      padding: "2rem",
      borderRadius: "0.5rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      maxWidth: "400px",
      margin: "0 auto"
    }}
  >
    <h3 style={{ color: "#16435d", marginBottom: "1rem" }}>Account Settings</h3>
    <p style={{ color: "#4a6b82", marginBottom: "1rem" }}>
      Edit your account information below.
    </p>
    <input required value={this.state.user?.first_name || ''} type="text" name="First Name" placeholder="First Name" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, first_name: e.target.value } }))} />
    <input required value={this.state.user?.last_name || ''} type="text" name="Last Name" placeholder="Last Name" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, last_name: e.target.value } }))} />
    <input required value={this.state.user?.email || ''} type="email" name="Email" placeholder="Email" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, email: e.target.value } }))} />
    <input required value={this.state.user?.zip_code || ''} type="text" name="Zip Code" placeholder="Zip Code" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, zip_code: e.target.value } }))} />
    <input required value={this.state.user?.phone_number || ''} type="text" name="Phone Number" placeholder="Phone Number" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, phone_number: e.target.value } }))} />
    {this.state.errorOccurred ? <p style={{ color: "red", marginTop: '0.5rem' }}>{this.state.errorMessage}</p> : this.state.successOccurred ? <p style={{ color: "green", marginTop: '0.5rem' }}>{this.state.successMessage}</p> : null}
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: '1rem' }}>
      <button
        onClick={() => this.setState({ accountModal: false, errorOccurred: false, errorMessage: "", successOccurred: false, successMessage: "" })}
        style={{
          backgroundColor: "#6c757d",
          color: "#fff",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
      <button
        onClick={() => {
          this.updateAccount();
        }}
        style={{
          backgroundColor: "green",
          color: "#fff",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Save
      </button>
    </div>
  </div>
</Modal>
      </nav>
    );
  }
}

export default NavBar;