import React, { Component } from 'react';
import Link from 'next/link';
import { withRouter } from 'next/router';
import Icon from '@mdi/react';
import { mdiSnowflake } from '@mdi/js';
import Modal from './Modal';

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
  router: any;
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

class Navbar extends Component<NavBarProps, NavBarState> {
  constructor(props: NavBarProps) {
    super(props);
    this.state = {
      user: props.user || null,
      screenSize: 0,
      accountModal: false,
      errorOccurred: false,
      errorMessage: '',
      successOccurred: false,
      successMessage: '',
    };
  }

  private isActive = (path: string) => {
    // check to see if the path is the current path
    return this.props.router.pathname === path;
  }

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

    this.setState({ screenSize: window.innerWidth });
  }

  render() {
    const { user } = this.props;

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
      <nav style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          color: '#16435d',
          fontWeight: 600,
          fontSize: '1.5rem',
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Icon path={mdiSnowflake} size={1.5} color="#2196f3" />
          <span>SkiScape</span>
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <NavLink href="/" active={this.isActive('/')}>Home</NavLink>
          <NavLink href="/dashboard" active={this.isActive('/dashboard')}>Dashboard</NavLink>
          {user?.is_admin && (
            <NavLink href="/admin" active={this.isActive('/admin')}>Admin Portal</NavLink>
          )}
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <button
                onClick={() => this.setState({ accountModal: true })}
                style={{
                  backgroundColor: '#f6f9fc',
                  color: '#2a5f9e',
                  border: '1px solid #d4e3f0',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f6f9fc';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Account
              </button>
              <button
                onClick={() => {
                  window.location.href = "/logout";
                }}
                style={{
                  backgroundColor: '#f6f9fc',
                  color: '#2a5f9e',
                  border: '1px solid #d4e3f0',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f6f9fc';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link href="/login" style={{
                backgroundColor: '#f6f9fc',
                color: '#2a5f9e',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                border: '1px solid #d4e3f0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f6f9fc';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                Login
              </Link>
              <Link href="/signup" style={{
                backgroundColor: '#2196f3',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(33, 150, 243, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(33, 150, 243, 0.2)';
              }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
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

class NavLink extends Component<{ href: string, active: boolean, children: React.ReactNode }> {
  render() {
    const { href, active, children } = this.props;
    return (
      <Link href={href} style={{
        color: active ? '#2196f3' : '#4a6b82',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '500',
        padding: '0.5rem 0',
        borderBottom: active ? '2px solid #2196f3' : '2px solid transparent',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#2196f3';
          e.currentTarget.style.borderBottom = '2px solid #e3f2fd';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.color = '#4a6b82';
          e.currentTarget.style.borderBottom = '2px solid transparent';
        }
      }}
      >
        {children}
      </Link>
    );
  }
}

export default withRouter(Navbar);