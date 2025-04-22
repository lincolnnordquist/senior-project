import React, { Component } from 'react';
import Link from 'next/link';
import { withRouter } from 'next/router';
import Icon from '@mdi/react';
import { mdiSnowflake, mdiMenu, mdiClose, mdiWeatherSunny, mdiWeatherNight } from '@mdi/js';
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
  isDarkMode: boolean;
  toggleDarkMode: () => void;
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
    const { isDarkMode, toggleDarkMode } = this.props;
    const isMobile = this.isMobileView();

    const theme = {
      navBackground: isDarkMode ? '#1a202c' : 'rgba(255, 255, 255, 0.95)',
      textColor: isDarkMode ? '#e2e8f0' : '#16435d',
      linkColor: isDarkMode ? '#a0aec0' : '#4a6b82',
      linkActiveColor: isDarkMode ? '#63b3ed' : '#2196f3',
      borderColor: isDarkMode ? '#4a5568' : '#d4e3f0',
      buttonBg: isDarkMode ? '#2d3748' : '#f6f9fc',
      buttonHoverBg: isDarkMode ? '#4a5568' : '#ffffff',
      buttonColor: isDarkMode ? '#e2e8f0' : '#2a5f9e',
      modalBg: isDarkMode ? '#2d3748' : '#fff',
      inputBg: isDarkMode ? '#4a5568' : '#f8fafd',
      inputColor: isDarkMode ? '#e2e8f0' : '#16435d',
    };

    const inputStyle: React.CSSProperties = {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: `1px solid ${theme.borderColor}`,
      backgroundColor: theme.inputBg,
      color: theme.inputColor,
      fontSize: "1rem",
      width: "100%",
      margin: "0.5rem 0",
    }

    const switchWidth = 50;
    const switchHeight = 24;
    const circleSize = 18;
    const padding = 3;

    const switchStyle: React.CSSProperties = {
        position: 'relative',
        display: 'inline-block',
        width: `${switchWidth}px`,
        height: `${switchHeight}px`,
    };
    const sliderStyle: React.CSSProperties = {
        position: 'absolute',
        cursor: 'pointer',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isDarkMode ? theme.linkActiveColor : '#ccc',
        transition: '.4s',
        borderRadius: '34px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: `${padding + 2}px`,
        paddingRight: `${padding + 2}px`,
    };
    const sliderBeforeStyle: React.CSSProperties = {
        position: 'absolute',
        content: '""',
        height: `${circleSize}px`,
        width: `${circleSize}px`,
        left: `${padding}px`,
        bottom: `${padding}px`,
        backgroundColor: 'white',
        transition: '.4s',
        borderRadius: '50%',
        transform: isDarkMode ? `translateX(${switchWidth - circleSize - (padding * 2)}px)` : 'translateX(0)',
        zIndex: 2
    };

    const navLinks = (
        <>
          <NavLink href="/" active={this.isActive('/')} isDarkMode={isDarkMode}>Home</NavLink>
          <NavLink href="/dashboard" active={this.isActive('/dashboard')} isDarkMode={isDarkMode}>Dashboard</NavLink>
          {user?.is_admin && (
            <NavLink href="/admin" active={this.isActive('/admin')} isDarkMode={isDarkMode}>Admin Portal</NavLink>
          )}
          {user ? (
            <>
              <button
                onClick={() => this.setState({ accountModal: true })}
                style={{
                  backgroundColor: isMobile ? 'transparent' : theme.buttonBg,
                  color: isMobile ? theme.textColor : theme.buttonColor,
                  border: isMobile ? 'none' : `1px solid ${theme.borderColor}`,
                  padding: isMobile ? '1rem 1.5rem' : '0.5rem',
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
                    e.currentTarget.style.backgroundColor = theme.buttonHoverBg;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  } else {
                     e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                   if (!isMobile) {
                    e.currentTarget.style.backgroundColor = theme.buttonBg;
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
                  backgroundColor: isMobile ? 'transparent' : theme.buttonBg,
                  color: isMobile ? theme.textColor : theme.buttonColor,
                  border: isMobile ? 'none' : `1px solid ${theme.borderColor}`,
                  padding: isMobile ? '1rem 1.5rem' : '0.5rem',
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
                    e.currentTarget.style.backgroundColor = theme.buttonHoverBg;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  } else {
                     e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                   if (!isMobile) {
                    e.currentTarget.style.backgroundColor = theme.buttonBg;
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
                 backgroundColor: isMobile ? 'transparent' : theme.buttonBg,
                  color: isMobile ? theme.textColor : theme.buttonColor,
                  border: isMobile ? 'none' : `1px solid ${theme.borderColor}`,
                  padding: isMobile ? '1rem 1.5rem' : '0.5rem',
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
                    e.currentTarget.style.backgroundColor = theme.buttonHoverBg;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  } else {
                     e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                   if (!isMobile) {
                    e.currentTarget.style.backgroundColor = theme.buttonBg;
                    e.currentTarget.style.transform = 'translateY(0)';
                   } else {
                     e.currentTarget.style.backgroundColor = 'transparent';
                   }
                }}
              >
                Login
              </Link>
              <Link href="/signup" style={{
                backgroundColor: isMobile ? 'transparent' : theme.linkActiveColor,
                color: isMobile ? theme.textColor : 'white',
                border: isMobile ? 'none' : '',
                padding: isMobile ? '1rem 1.5rem' : '0.5rem',
                borderRadius: isMobile ? '0' : '8px',
                textDecoration: 'none',
                fontSize: isMobile ? '1rem' : '0.9rem',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: isMobile ? 'none' : (isDarkMode ? 'none' : '0 2px 4px rgba(33, 150, 243, 0.2)'),
                whiteSpace: 'nowrap',
                 width: isMobile ? '100%' : 'auto',
                 textAlign: isMobile ? 'left' : 'center',
                 display: 'block'
              }}
               onMouseEnter={(e) => {
                  if (!isMobile) {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#4299e1' : '#1c6cb7';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                  } else {
                      e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0';
                  }
              }}
                onMouseLeave={(e) => {
                      if (!isMobile) {
                           e.currentTarget.style.backgroundColor = theme.linkActiveColor;
                           e.currentTarget.style.transform = 'translateY(0)';
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

    const darkModeToggle = (
        <label style={switchStyle} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
             <input 
                type="checkbox" 
                checked={isDarkMode} 
                onChange={toggleDarkMode}
                style={{ opacity: 0, width: 0, height: 0 }}
            />
             <span style={sliderStyle}>
                 <Icon path={mdiWeatherSunny} size={0.7} color="#f6e05e" style={{ opacity: isDarkMode ? 0.5 : 1, transition: 'opacity 0.4s' }}/>
                 <Icon path={mdiWeatherNight} size={0.7} color="#e2e8f0" style={{ opacity: isDarkMode ? 1 : 0.5, transition: 'opacity 0.4s' }}/>
                <span style={sliderBeforeStyle}></span>
            </span>
        </label>
    );

    return (
      <nav style={{
        backgroundColor: theme.navBackground,
        backdropFilter: 'blur(8px)',
        padding: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: isDarkMode ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 10px rgba(0,0,0,0.1)',
        borderBottom: isDarkMode ? `1px solid ${theme.borderColor}` : 'none',
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
          color: theme.textColor,
          fontWeight: 600,
          fontSize: '1.25rem',
          transition: 'transform 0.2s ease',
          flexShrink: 0,
          minWidth: 'fit-content'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Icon path={mdiSnowflake} size={1.25} color={theme.linkActiveColor} />
          <span style={{ color: theme.textColor }}>SkiScape</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!isMobile && darkModeToggle}
             
             {isMobile && (
                <button
                    onClick={this.toggleMobileMenu}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                    aria-label="Toggle menu"
                >
                    <Icon path={isMobileMenuOpen ? mdiClose : mdiMenu} size={1.5} color={theme.textColor} />
                </button>
            )}

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
                    marginLeft: '1rem'
                }}>
                    {navLinks}
                </div>
            )}
        </div>

        {isMobile && isMobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: theme.navBackground,
            backdropFilter: 'blur(5px)',
            boxShadow: isDarkMode ? '0 4px 10px rgba(0,0,0,0.5)' : '0 4px 10px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            zIndex: 999,
            padding: '0.5rem 0',
            borderTop: `1px solid ${theme.borderColor}`
          }}>
            <div style={{ display: window.location.pathname === "/dashboard" || window.location.pathname === "/admin" ? "flex" : "none", alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.5rem 1.5rem' }}>
                 {darkModeToggle}
            </div>
            <hr style={{ width: '100%', border: 'none', borderTop: `1px solid ${theme.borderColor}` , margin: '0.5rem 0'}} />
            {navLinks}
          </div>
        )}


        <Modal show={this.state.accountModal} isDarkMode={isDarkMode}>
           <div
            style={{
              textAlign: "center",
              backgroundColor: theme.modalBg,
              padding: "2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              maxWidth: "400px",
              margin: "0 auto"
            }}
          >
            <h3 style={{ color: theme.textColor, marginBottom: "1rem" }}>Account Settings</h3>
            <p style={{ color: theme.linkColor, marginBottom: "1rem" }}>
              Edit your account information below.
            </p>
            <input required value={this.state.user?.first_name || ''} type="text" name="First Name" placeholder="First Name" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, first_name: e.target.value } }))} />
            <input required value={this.state.user?.last_name || ''} type="text" name="Last Name" placeholder="Last Name" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, last_name: e.target.value } }))} />
            <input required value={this.state.user?.email || ''} type="email" name="Email" placeholder="Email" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, email: e.target.value } }))} />
            <input required value={this.state.user?.zip_code || ''} type="text" name="Zip Code" placeholder="Zip Code" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, zip_code: e.target.value } }))} />
            <input required value={this.state.user?.phone_number || ''} type="text" name="Phone Number" placeholder="Phone Number" style={inputStyle} onChange={(e) => this.setState(prev => ({ user: { ...prev.user!, phone_number: e.target.value } }))} />
            {this.state.errorOccurred ? <p style={{ color: isDarkMode ? '#f56565' : "red", marginTop: '0.5rem' }}>{this.state.errorMessage}</p> 
             : this.state.successOccurred ? <p style={{ color: isDarkMode ? '#68d391' : "green", marginTop: '0.5rem' }}>{this.state.successMessage}</p> 
             : null}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: '1rem' }}>
              <button
                onClick={() => this.setState({ accountModal: false, errorOccurred: false, errorMessage: "", successOccurred: false, successMessage: "" })}
                style={{
                  backgroundColor: theme.linkColor,
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
                onClick={() => { this.updateAccount(); }}
                style={{
                  backgroundColor: isDarkMode ? '#38a169' : "green",
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

class NavLink extends Component<{ href: string, active: boolean, children: React.ReactNode, isDarkMode: boolean }> {
  render() {
    const { href, active, children, isDarkMode } = this.props;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

     const theme = {
      textColor: isDarkMode ? '#e2e8f0' : '#16435d',
      linkColor: isDarkMode ? '#a0aec0' : '#4a6b82',
      linkActiveColor: isDarkMode ? '#63b3ed' : '#2196f3',
      linkHoverBg: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f0f0',
      desktopBorderHoverColor: isDarkMode ? '#4a5568' : '#e3f2fd',
    };

    return (
      <Link href={href} style={{
        color: active ? theme.linkActiveColor : theme.linkColor,
        textDecoration: 'none',
        fontSize: isMobile ? '1rem' : '0.9rem',
        fontWeight: '500',
        padding: isMobile ? '1rem 1.5rem' : '0.5rem 0',
        borderBottom: !isMobile && active ? `2px solid ${theme.linkActiveColor}` : 'none',
        transition: 'all 0.2s ease',
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!isMobile) {
          if (!active) {
            e.currentTarget.style.color = theme.linkActiveColor;
            e.currentTarget.style.borderBottom = `2px solid ${theme.desktopBorderHoverColor}`;
          }
        } else {
          e.currentTarget.style.backgroundColor = theme.linkHoverBg;
        }
      }}
      onMouseLeave={(e) => {
        if (!isMobile) {
          if (!active) {
            e.currentTarget.style.color = theme.linkColor;
            e.currentTarget.style.borderBottom = '2px solid transparent';
          }
        } else {
           e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      >
        {children}
      </Link>
    );
  }
}

export default withRouter(Navbar);