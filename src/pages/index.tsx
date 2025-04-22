import React, { Component } from "react";
import { GetServerSideProps } from "next";
import Background from "../../public/images/home-page.png";
import Logo from "../../public/images/logo.png";
import Head from 'next/head';
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import Icon from '@mdi/react';
import { mdiSki, mdiMapMarker, mdiSnowflake } from '@mdi/js';

type PropsType = {}

type StateType = {
  screenSize: number;
}

class HomePage extends Component<PropsType, StateType> {
  private features = [
    {
      title: "Resort Reviews",
      description: "Read and write detailed reviews of ski resorts worldwide",
      icon: mdiSki
    },
    {
      title: "Google Maps Integration",
      description: "View resort locations and get directions using Google Maps API",
      icon: mdiMapMarker
    },
    {
      title: "Weather Updates",
      description: "Get real-time weather and snow conditions",
      icon: mdiSnowflake
    }
  ];

  constructor(props: PropsType) {
    super(props);
    this.state = {
      screenSize: typeof window !== "undefined" ? window.innerWidth : 0,
    };
  }

  componentDidMount() {
    this.setState({ screenSize: window.innerWidth });
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({ screenSize: window.innerWidth });
  };

  isMobileView = () => this.state.screenSize < 768;

  render(): React.ReactNode {
    const isMobile = this.isMobileView();

    const heroSectionStyle: React.CSSProperties = {
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${Background.src})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      position: "relative",
      overflow: "hidden",
    };

    const logoStyle: React.CSSProperties = {
        width: isMobile ? "10rem" : "12rem",
        margin: "0 auto 2rem auto",
    };

    const headingStyle: React.CSSProperties = {
        fontSize: isMobile ? "2.25rem" : "3.75rem",
        fontWeight: "bold",
        marginBottom: "1.5rem",
    };

    const paragraphStyle: React.CSSProperties = {
        fontSize: isMobile ? "1.25rem" : "1.5rem",
        marginBottom: "2rem",
        color: "#e5e7eb",
        maxWidth: "42rem",
        margin: "0 auto 2rem auto"
    };

    const buttonContainerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "1rem",
      justifyContent: "center",
    };

    const baseButtonStyle: React.CSSProperties = {
      padding: "0.75rem 2rem",
      borderRadius: "0.5rem",
      fontWeight: 600,
      fontSize: "1.125rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: "all 0.3s ease",
      textDecoration: "none",
      cursor: "pointer",
      textAlign: "center",
    };

    const primaryButtonStyle: React.CSSProperties = {
      ...baseButtonStyle,
      backgroundColor: "#2563eb",
      color: "white",
    };

    const secondaryButtonStyle: React.CSSProperties = {
      ...baseButtonStyle,
      backgroundColor: "white",
      color: "#2563eb",
    };

    const guestLinkStyle: React.CSSProperties = {
        display: "inline-block",
        marginTop: "1.5rem",
        color: "#e5e7eb",
        transition: "color 0.3s ease",
        textDecoration: 'none'
    };

    const featuresSectionStyle: React.CSSProperties = {
        padding: "5rem 0",
        backgroundColor: "white",
    };

    const featuresContainerStyle: React.CSSProperties = {
        maxWidth: "72rem",
        margin: "0 auto",
        padding: "0 1rem",
    };

    const featuresHeadingStyle: React.CSSProperties = {
        fontSize: isMobile ? "1.875rem" : "2.25rem",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "4rem",
        color: "#111827",
    };

    const featuresGridStyle: React.CSSProperties = {
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: "2rem",
    };

    const featureCardStyle: React.CSSProperties = {
        backgroundColor: "#f9fafb",
        padding: "1.5rem",
        borderRadius: "0.75rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        transition: "box-shadow 0.3s ease",
    };

    const featureIconContainerStyle: React.CSSProperties = {
        display: "flex",
        marginBottom: "1rem",
    };

    const featureTitleStyle: React.CSSProperties = {
        fontSize: "1.25rem",
        fontWeight: 600,
        marginBottom: "0.5rem",
        color: "#111827",
    };

    const featureDescriptionStyle: React.CSSProperties = {
        color: "#4b5563",
    };

    return (
      <div style={{ minHeight: "100vh" }}>
        <Head>
          <title>SkiScape | Home</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </Head>

        <div
          style={heroSectionStyle}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: "center", zIndex: 10, padding: "0 1rem" }}
          >
            <img
              src={Logo.src}
              alt="Ski Scape Logo"
              style={logoStyle}
            />
            <h1 style={headingStyle}>
              Welcome to SkiScape
            </h1>
            <p style={paragraphStyle}>
              Your all-in-one platform for discovering and reviewing ski resorts
            </p>
            <div style={buttonContainerStyle}>
              <motion.a
                whileHover={{ scale: 1.05, backgroundColor: "#1d4ed8" }}
                whileTap={{ scale: 0.95 }}
                href="/signup"
                style={primaryButtonStyle}
              >
                Get Started
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                style={secondaryButtonStyle}
              >
                Login
              </motion.a>
            </div>
            <motion.a
              whileHover={{ scale: 1.05, color: "white" }}
              whileTap={{ scale: 0.95 }}
              href="/dashboard"
              style={guestLinkStyle}
              onMouseEnter={e => (e.target as HTMLAnchorElement).style.color = 'white'}
              onMouseLeave={e => (e.target as HTMLAnchorElement).style.color = '#e5e7eb'}
            >
              Continue as guest →
            </motion.a>
          </motion.div>

          {/* snowfall */}
          {!isMobile && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
                {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="animate-fall"
                    style={{
                    position: 'absolute',
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    opacity: Math.random() * 0.5 + 0.3
                    }}
                >
                    <Icon path={mdiSnowflake} size={1} color="white" />
                </div>
                ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <section style={featuresSectionStyle}>
          <div style={featuresContainerStyle}>
            <h2 style={featuresHeadingStyle}>
              Why Choose SkiScape?
            </h2>
            <div style={featuresGridStyle}>
              {this.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                  transition={{ delay: index * 0.2, duration: 0.3 }}
                  style={featureCardStyle}
                >
                  <div style={featureIconContainerStyle}>
                    <Icon path={feature.icon} size={2} color="#2196f3" />
                  </div>
                  <h3 style={featureTitleStyle}>
                    {feature.title}
                  </h3>
                  <p style={featureDescriptionStyle}>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />

        <style jsx>{`
          @keyframes fall {
            0% {
              transform: translateY(-10vh) rotate(0deg);
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
            }
          }
          .animate-fall {
            animation: fall 10s linear infinite;
          }
        `}</style>
      </div>
    );
  }
}

export default HomePage;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};