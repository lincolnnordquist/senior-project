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
  screenSize: number; // Add screen size to state
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

    return (
      <div className="min-h-screen">
        <Head>
          <title>SkiScape | Home</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </Head>

        {/* Hero Section */}
        <div
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${Background.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
          className="min-h-screen flex flex-col items-center justify-center text-white relative overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center z-10 px-4"
          >
            <img
              src={Logo.src}
              alt="Ski Scape Logo"
              className="w-40 md:w-48 mx-auto mb-8"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to SkiScape
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Your all-in-one platform for discovering and reviewing ski resorts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-blue-700 transition duration-300"
              >
                Get Started
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg shadow-lg hover:bg-gray-100 transition duration-300"
              >
                Login
              </motion.a>
            </div>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/dashboard"
              className="inline-block mt-6 text-gray-200 hover:text-white transition duration-300"
            >
              Continue as guest →
            </motion.a>
          </motion.div>

          {/* snowfall */}
          {!isMobile && (
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-fall"
                    style={{
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
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900">
              Why Choose SkiScape?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {this.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300"
                >
                  <div className="flex mb-4">
                    <Icon path={feature.icon} size={2} color="#2196f3" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
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