import React, { Component } from 'react';
import Link from 'next/link';
import { withRouter } from 'next/router';
import Icon from '@mdi/react';
import { mdiSnowflake, mdiMenu, mdiClose } from '@mdi/js';
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
  isMobileMenuOpen: boolean;

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
      screenSize: typeof window !== 'undefined' ? window.innerWidth : 0,
      accountModal: false,
      isMobileMenuOpen: false,
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

  handleResize = () => {
    this.setState({ screenSize: window.innerWidth });
  };

  isMobileView = () => this.state.screenSize < 768;

  toggleMobileMenu = () => {
    this.setState(prevState => ({ isMobileMenuOpen: !prevState.isMobileMenuOpen }));
  };

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


    // window resize
    this.setState({ screenSize: window.innerWidth });
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const { user, isMobileMenuOpen } = this.state;
    const isMobile = this.isMobileView();

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

    const navLinks = (
        <>
          <NavLink href="/" active={this.isActive('/')}>Home</NavLink>
          <NavLink href="/dashboard" active={this.isActive('/dashboard')}>Dashboard</NavLink>
          {user?.is_admin && (
            <NavLink href="/admin" active={this.isActive('/admin')}>Admin Portal</NavLink>
          )}
          {user ? (
            <>
              <button
                onClick={() => this.setState({ accountModal: true })}
                style={{
                  backgroundColor: isMobile ? 'transparent' : '#f6f9fc',
                  color: isMobile ? '#16435d' : '#2a5f9e',
                  border: isMobile ? 'none' : '1px solid #d4e3f0',
                  padding: isMobile ? '1rem' : '0.5rem',
                  borderRadius: isMobile ? '0' : '8px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '1rem' : '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  width: isMobile ? '100%' : 'auto',
                  textAlign: isMobile ? 'left' : 'center',
                }}
                onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  } else {
                     e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                   if (!isMobile) {
                    e.currentTarget.style.backgroundColor = '#f6f9fc';
                    e.currentTarget.style.transform = 'translateY(0)';
                   } else {
                     e.currentTarget.style.backgroundColor = 'transparent';
                   }
                }}
              >
                Account
              </button>
              <button
                onClick={() => {
                  window.location.href = "/logout";
                }}
                style={{
                  backgroundColor: isMobile ? 'transparent' : '#f6f9fc',
                  color: isMobile ? '#16435d' : '#2a5f9e',
                  border: isMobile ? 'none' : '1px solid #d4e3f0',
                  padding: isMobile ? '1rem' : '0.5rem',
                  borderRadius: isMobile ? '0' : '8px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '1rem' : '0.9rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  width: isMobile ? '100%' : 'auto',
                  textAlign: isMobile ? 'left' : 'center',
                }}
                 onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  } else {
                     e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                   if (!isMobile) {
                    e.currentTarget.style.backgroundColor = '#f6f9fc';
                    e.currentTarget.style.transform = 'translateY(0)';
                   } else {
                     e.currentTarget.style.backgroundColor = 'transparent';
                   }
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={{
                 backgroundColor: isMobile ? 'transparent' : '#f6f9fc',
                  color: isMobile ? '#16435d' : '#2a5f9e',
                  border: isMobile ? 'none' : '1px solid #d4e3f0',
                  padding: isMobile ? '1rem' : '0.5rem',
                  borderRadius: isMobile ? '0' : '8px',
                textDecoration: 'none',
                fontSize: isMobile ? '1rem' : '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                 width: isMobile ? '100%' : 'auto',
                 textAlign: isMobile ? 'left' : 'center',
                 display: 'block'
              }}
               onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  } else {
                     e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                   if (!isMobile) {
                    e.currentTarget.style.backgroundColor = '#f6f9fc';
                    e.currentTarget.style.transform = 'translateY(0)';
                   } else {
                     e.currentTarget.style.backgroundColor = 'transparent';
                   }
                }}
              >
                Login
              </Link>
              <Link href="/signup" style={{
                backgroundColor: isMobile ? 'transparent' : '#2196f3',
                color: isMobile ? '#16435d' : 'white',
                border: isMobile ? 'none' : '',
                padding: isMobile ? '1rem' : '0.5rem',
                borderRadius: isMobile ? '0' : '8px',
                textDecoration: 'none',
                fontSize: isMobile ? '1rem' : '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: isMobile ? 'none' : '0 2px 4px rgba(33, 150, 243, 0.2)',
                whiteSpace: 'nowrap',
                 width: isMobile ? '100%' : 'auto',
                 textAlign: isMobile ? 'left' : 'center',
                 display: 'block'
              }}
               onMouseEnter={(e) => {
                  if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.3)';
                  } else {
                     e.currentTarget.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                   if (!isMobile) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(33, 150, 243, 0.2)';
                   } else {
                     e.currentTarget.style.backgroundColor = 'transparent';
                   }
                }}
              >
                Sign Up
              </Link>
            </>
          )}
        </>
    );

    return (
      <nav style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Link href="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
          color: '#16435d',
          fontWeight: 600,
          fontSize: '1.25rem',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
          minWidth: 'fit-content'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Icon path={mdiSnowflake} size={1.25} color="#2196f3" />
          <span>SkiScape</span>
        </Link>

        {/* mobile hamburger menu icon */}
        {isMobile && (
          <button
            onClick={this.toggleMobileMenu}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
            aria-label="Toggle menu"
          >
            <Icon path={isMobileMenuOpen ? mdiClose : mdiMenu} size={1.5} color="#16435d" />
          </button>
        )}

        {/* desktop nav links here */}
        {!isMobile && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexShrink: 0,
             overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            margin: '0 0.5rem'
          }}>
            {navLinks}
          </div>
        )}

        {/* mobile menu */}
        {isMobile && isMobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(5px)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            zIndex: 999,
            padding: '1rem 0',
            borderTop: '1px solid #eee'
          }}>
            {navLinks}
          </div>
        )}

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


// navlinks component here
class NavLink extends Component<{ href: string, active: boolean, children: React.ReactNode }> {
  render() {
    const { href, active, children } = this.props;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
      <Link href={href} style={{
        color: active ? '#2196f3' : '#4a6b82',
        textDecoration: 'none',
        fontSize: isMobile ? '1rem' : '0.9rem',
        fontWeight: '500',
        padding: isMobile ? '1rem' : '0.5rem',
        borderBottom: !isMobile && active ? '2px solid #2196f3' : 'none',
        transition: 'all 0.2s ease',
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          if (!active) {
            e.currentTarget.style.color = '#2196f3';
            e.currentTarget.style.borderBottom = '2px solid #e3f2fd';
          }
        } else {
          // Remove mobile background hover effect
          // e.currentTarget.style.backgroundColor = '#f0f0f0';
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          if (!active) {
            e.currentTarget.style.color = '#4a6b82';
            e.currentTarget.style.borderBottom = '2px solid transparent';
          }
        } else {
          // Remove mobile background hover leave effect
          // e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      >
        {children}
      </Link>
    );
  }
}

export default withRouter(Navbar);