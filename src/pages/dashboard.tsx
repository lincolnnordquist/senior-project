import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import React, { Component } from "react";
import Head from 'next/head';
import Map from "../components/SkiResortsMap";
import Button from '@mui/material/Button';
import Icon from '@mdi/react';
import { mdiStar, mdiStarOutline } from '@mdi/js';
import { mdiWeatherCloudy, mdiWeatherSnowy, mdiWeatherSunny, mdiWeatherFog, mdiWeatherPartlyCloudy, mdiWeatherRainy, mdiThermometer, mdiWeatherWindy, mdiDelete, mdiOpenInNew, mdiMapMarker, mdiArrowLeft, mdiSnowflake } from '@mdi/js';
import { mdiCloseCircle } from '@mdi/js';
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";
import Footer from "../components/Footer";
import SlideGroup from '../components/SlideGroup';

type WeatherType = {
  temperature: number;
  description: string;
  windSpeed: number;
  feelsLike: number;
  humidity: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  sunrise: number;
  sunset: number;
  dailyForecast: {
    date: number;
    temp: {
      day: number;
      min: number;
      max: number;
    };
    weather: {
      main: string;
      description: string;
    };
    pop: number;
    snow?: number;
  }[];
  hourlyForecast: {
    time: number;
    temp: number;
    feelsLike: number;
    weather: {
      main: string;
      description: string;
    };
    pop: number;
  }[];
}

type SkiResort = {
  id: string;
  name: string;
  state: string;
  website: string;
  latitude: number;
  longitude: number;
  address: string;
  average_rating: number;
  weather: WeatherType | null;
  photoURL: string;
};

type ReviewType = {
  id: string;
  resort_id: string;
  rating: number;
  review: string;
  users: {
    first_name: string;
  };
}

type StateType = {
  screenSize: number;
  user: User | null;
  adminView: boolean;

  searchField: string;

  resorts: SkiResort[];
  resortDetailPage: boolean;
  selectedResort: SkiResort | null;

  errorOccurred: boolean;
  errorMessage: string;
  successOccurred: boolean;
  successMessage: string;

  reviewInput: string;
  ratingInput: number;

  myReviews: ReviewType[];
  resortReviews: ReviewType[];
  resortReviewsLoading: boolean;
  resortsLoading: boolean;

  confirmDeleteModal: boolean;
  successModal: boolean;
  selectedReview: ReviewType | null;
  confirmDeleteReviewModal: boolean;

  stateFilter: string;
  sortFilter: string;
};

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  zip_code: string;
  [key: string]: any;
  is_admin: boolean;
}

interface PropsType {
}

class Dashboard extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.state = {
      screenSize: typeof window !== "undefined" ? window.innerWidth : 851,
      user: null,
      adminView: false,

      searchField: "",

      resorts: [],
      resortDetailPage: false,
      selectedResort: null,
      resortsLoading: true,

      reviewInput: "",
      ratingInput: 0,

      errorOccurred: false,
      errorMessage: "",
      successOccurred: false,
      successMessage: "",

      myReviews: [],
      resortReviews: [],
      resortReviewsLoading: true,

      confirmDeleteModal: false,
      successModal: false,

      selectedReview: null,
      confirmDeleteReviewModal: false,

      stateFilter: "",
      sortFilter: "",
    };
  }

  async fetchUserReviews() {
    try {
      const res = await fetch("/api/reviews/user", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        this.setState({ myReviews: data.reviews });
      } else {
        console.error("Failed to fetch user reviews");
      }
    } catch (error) {
      console.error("Error fetching user reviews:", error);
    }
  }

  async fetchResorts() {
    try {
      const res = await fetch("/api/ski_resorts");
      if (res.ok) {
        const data = await res.json();
        const sortedResorts = data.sort((a: SkiResort, b: SkiResort) =>
          a.name.localeCompare(b.name)
        );
        this.setState({ resorts: sortedResorts }, () => {
          console.log("Resorts fetched and sorted:", this.state.resorts);
        });
      } else {
        console.error("Failed to fetch ski resorts");
      }
    } catch (error) {
      console.error("Error fetching ski resorts:", error);
    }
  }

  async attemptToSubmitReview() {
    if (!this.state.selectedResort) {
      this.setState({
        errorOccurred: true,
        errorMessage: "No resort selected.",
      });
      return;
    }

    if (!this.state.ratingInput) {
      this.setState({
        errorOccurred: true,
        errorMessage: "You must provide a rating.",
      });
      return;
    }

    if (this.state.ratingInput < 1 || this.state.ratingInput > 5) {
      this.setState({
        errorOccurred: true,
        errorMessage: "Rating must be between 1 and 5.",
      });
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          resort_id: this.state.selectedResort.id,
          rating: this.state.ratingInput,
          review: this.state.reviewInput,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        this.setState({
          successOccurred: true,
          successMessage: "Review submitted successfully.",
          errorOccurred: false,
        }, () => {
          this.fetchEverything();
          if (this.state.selectedResort) {
            this.fetchResortReviews(this.state.selectedResort.id);
          }
          // success message disappears after 3 seconds
          setTimeout(() => {
            this.setState({ successOccurred: false, successMessage: "" });
          }
          , 3000);
        });
      } else {
        const error = await res.json();
        console.error("Error posting review:", error);
        this.setState({
          errorOccurred: true,
          errorMessage: "Error posting review.",
          successOccurred: false,
        });
      }
    } catch (err) {
      this.setState({
        errorOccurred: true,
        errorMessage: "Network error while submitting review.",
        successOccurred: false,
      });
    }
  }

  deleteReview() {
    
    if (!this.state.selectedReview) {
      console.error("No review selected for deletion.");
      return;
    }

    fetch("/api/reviews/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id: this.state.selectedReview.id }),
    })
      .then((res) => {
        if (res.ok) {
          this.setState({
            confirmDeleteReviewModal: false,
            successModal: true,
            successOccurred: true,
            successMessage: "Review deleted successfully.",
          }, () => {
            this.fetchEverything();
            if (this.state.selectedResort) {
              this.fetchResortReviews(this.state.selectedResort.id);
            }
          });
        } else {
          console.log("Failed to delete review");
        }
      })
      .catch((error) => {
        console.error("Error deleting review:", error);
        this.setState({
          confirmDeleteReviewModal: false,
          errorOccurred: true,
          errorMessage: "Error deleting review.",
        });
      });
  }

  async fetchResortReviews(resortId: string) {
    try {
      const res = await fetch(`/api/reviews/resort?resort_id=${resortId}`);
      if (res.ok) {
        const data = await res.json();
        this.setState({ resortReviews: data.reviews, resortReviewsLoading: false }, () => {
          console.log("Resort reviews fetched:", this.state.resortReviews);
        });
      } else {
        console.error("Failed to fetch resort reviews");
      }
    } catch (error) {
      console.error("Error fetching resort reviews:", error);
    }
  }

  handleResize = () => {
    this.setState({ screenSize: window.innerWidth });
  };

  async fetchWeatherForAllResorts() {
    const updatedResorts = await Promise.all(
      this.state.resorts.map(async (resort) => {
        try {
          const res = await fetch(`/api/weather?lat=${resort.latitude}&lon=${resort.longitude}`);
          if (!res.ok) {
            console.warn(`Failed to fetch weather for resort ${resort.name}`);
            return { ...resort, weather: null };
          }

          const weatherData = await res.json();
          console.log("Weather data:", weatherData);
          return {
            ...resort,
            weather: weatherData,
          };
        } catch (error) {
          console.error(`Error fetching weather for ${resort.name}:`, error);
          return { ...resort, weather: null };
        }
      })
    );

    this.setState({ resorts: updatedResorts, resortsLoading: false });
  }

  async fetchWeatherForOneResort() {
    if (!this.state.selectedResort) {
      console.error("No resort selected for weather fetch.");
      return;
    }

    try {
      const res = await fetch(
        `/api/weather?lat=${this.state.selectedResort.latitude}&lon=${this.state.selectedResort.longitude}`
      );
      if (res.ok) {
        const weatherData = await res.json();
        this.setState((prevState) => ({
          resorts: prevState.resorts.map((resort) =>
            resort.id === this.state.selectedResort?.id ? { ...resort, weather: weatherData } : resort
          ),
        }));
      } else {
        console.error("Failed to fetch weather for selected resort");
      }
    } catch (error) {
      console.error("Error fetching weather for selected resort:", error);
    }
  }

  deleteResort() {
    if (!this.state.selectedResort) {
      console.error("No resort selected for deletion.");
      return;
    }

    fetch("/api/ski_resorts", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ id: this.state.selectedResort.id }),
    })
      .then((res) => {
        if (res.ok) {
          this.setState({
            confirmDeleteModal: false,
            successOccurred: true,
            successMessage: "Resort deleted successfully.",
          }, () => {
            this.fetchEverything();
          });
        } else {
          throw new Error("Failed to delete resort");
        }
      })
      .catch((error) => {
        console.error("Error deleting resort:", error);
        this.setState({
          confirmDeleteModal: false,
          errorOccurred: true,
          errorMessage: "Error deleting resort.",
        });
      });
  }

  async fetchEverything() {
    await this.getCurrentUser();
    await this.fetchResorts();
    await this.fetchUserReviews();
    await this.fetchWeatherForAllResorts();
  }

  componentDidMount() {
    this.fetchEverything();

    window.addEventListener("resize", this.handleResize);
    setTimeout(() => {
      this.setState({ screenSize: window.innerWidth });
    }, 1000);

  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  isMobileView = () => this.state.screenSize < 850;

  async getCurrentUser() {
    try {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        this.setState({ user: data.user }, () => {
          console.log("User data on dashboard:", this.state.user);
          if (this.state.user && this.state.user.is_admin === true) {
            this.setState({ adminView: true });
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }

  render() {
    const { resorts, screenSize } = this.state;
    const loggedIn = this.state.user !== null;
    const isMobile = this.isMobileView();
    const weatherIconMap: { [key: string]: string } = {
      "scattered clouds": mdiWeatherCloudy,
      "broken clouds": mdiWeatherCloudy,
      "light snow": mdiWeatherSnowy,
      "clear sky": mdiWeatherSunny,
      "snow": mdiWeatherSnowy,
      "overcast clouds": mdiWeatherPartlyCloudy,
      "few clouds": mdiWeatherPartlyCloudy,
      "light rain": mdiWeatherRainy,
      "mist": mdiWeatherFog
    };

    const inputStyle: React.CSSProperties = {
          padding: "0.75rem",
          borderRadius: "0.5rem",
          border: "1px solid #d4e3f0",
          backgroundColor: "#f8fafd",
          color: "#16435d",
          fontSize: "1rem",
          width: "48%",
        }

    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>SkiScape | Dashboard</title>
        </Head>

        {/* Snowfall Effect */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
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
              <Icon path={mdiSnowflake} size={0.5} color="#2196f3" />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative" style={{ zIndex: 10 }}>
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              textAlign: "center",
              padding: isMobile ? "1rem" : "2rem",
              width: "100%",
              boxSizing: "border-box",
              gap: isMobile ? "1rem" : "0"
            }}
          >
            {/* Left Column - Resort List or Detail Page */}
            {!this.state.resortDetailPage ? (
              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                  width: isMobile ? "100%" : "54%",
                  height: isMobile ? "auto" : "80vh",
                  overflowY: "auto"
                }}
              >
                  {/* ADD SEARCH HERE */}
                  <div style={{ position: "relative", marginBottom: "1rem" }}>
                    <input 
                      placeholder="Search resorts..."
                      style={{
                        width: "100%",
                        padding: "0.5rem 2.5rem 0.5rem 0.5rem", // right padding for icon space
                        border: "1px solid #ccc",
                        borderRadius: "0.5rem",
                      }}
                      value={this.state.searchField}
                      onChange={(e) => {
                        this.setState({
                          searchField: e.target.value,
                        })
                      }}
                    />
                  
                    <div 
                      style={{
                        position: "absolute",
                        right: "0.5rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        transition: "transform 0.1s ease-in-out"
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = "translateY(-50%) scale(0.9)"}
                      onMouseUp={e => e.currentTarget.style.transform = "translateY(-50%)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "translateY(-50%)"}
                      // clear all filters
                      onClick={() => this.setState({ searchField: "", sortFilter: "", stateFilter: "", myReviews: [] })}
                    >
                      <Icon path={mdiCloseCircle} size={1} color="#6c757d" />
                    </div>
                   
                  </div>

                  <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', margin: '1rem 0'}}>
                    <select value={this.state.stateFilter} onChange={(e) => this.setState({ stateFilter: e.target.value })} style={inputStyle}>
                      <option value="">Filter by State</option>
                      <option value="UT">Utah</option>
                      <option value="CO">Colorado</option>
                      <option value="CA">California</option>
                      <option value="NY">New York</option>
                      <option value="VT">Vermont</option>

                    </select>

                    <select value={this.state.sortFilter} onChange={(e) => this.setState({ sortFilter: e.target.value })} style={inputStyle}>
                      <option value="">Sort by</option>
                      <option value="highest">Rating (high)</option>
                      <option value="lowest">Rating (low)</option>
                      {/* temperature */}
                      <option value="temperatureHighest">Temperature (high)</option>
                      <option value="temperatureLowest">Temperature (low)</option>
                      {/* <option value="nearest">Nearest to Me</option> */}
                    </select>



                  </div>


                {/* <p style={{position: "sticky"}}>hi</p> */}
                {!this.state.resortsLoading ? (
                  <ul style={{ listStyleType: "none", padding: 0 }}>
                    {resorts
                      .filter((resort) => {
                        const matchesSearch = resort.name.toLowerCase().includes(this.state.searchField.toLowerCase());
                        const matchesState = this.state.stateFilter === "" || resort.state === this.state.stateFilter;
                        return matchesSearch && matchesState;
                      })
                      .sort((a, b) => {
                        if (this.state.sortFilter === "highest") {
                          return b.average_rating - a.average_rating;
                        } else if (this.state.sortFilter === "lowest") {
                          return a.average_rating - b.average_rating;
                        } else if (this.state.sortFilter === "temperatureHighest") {
                          return (b.weather?.temperature || 0) - (a.weather?.temperature || 0);
                        } else if (this.state.sortFilter === "temperatureLowest") {
                          return (a.weather?.temperature || 0) - (b.weather?.temperature || 0);
                        } else if (this.state.sortFilter === "nearest" && this.state.user?.zip_code) {
                          // placeholder for now
                        }
                        return 0;
                      })
                      .map((resort) => (
                        <div
                          key={resort.id}
                          onClick={() => {
                            const existingReview = this.state.myReviews.find(
                              (review) => review.resort_id === resort.id
                            );

                            const updatedResort = this.state.resorts.find(r => r.id === resort.id) || resort;

                            this.setState({
                              resortDetailPage: true,
                              selectedResort: updatedResort,
                              reviewInput: existingReview?.review || "",
                              ratingInput: existingReview?.rating || 0,
                            });
                            this.fetchResortReviews(resort.id);
                          }}
                          style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #d4e3f0",
                            padding: "1rem",
                            marginBottom: "1rem",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                            color: "#4a6b82",
                            cursor: "pointer",
                            transition: "transform 0.2s ease-in-out",
                            textAlign: "left",
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        >
                          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", justifyContent: "space-between" }}>
                            <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                              <img
                                src={resort.photoURL}
                                alt="resort photo"
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  borderRadius: "8px",
                                }}
                              />
                              <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#16435d", justifyContent: "center", marginLeft: "0.5rem" }}>
                                {resort.name}
                              </div>
                            </div>
                            <div
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.2)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                              style={{
                                transition: "transform 0.2s ease-in-out",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center"
                              }}
                            >
                              <div style={{display: this.state.adminView ? '' : 'none'}} onClick={(e) => {
                                e.stopPropagation();
                                this.setState({ confirmDeleteModal: true, selectedResort: resort });
                              }}><Icon path={mdiDelete} size={1} color="#dc3545"/></div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", margin: "0.5rem 0", color: "#6c757d" }}>
                            <Icon path={mdiThermometer} size={1} color="#6c757d" />
                            <span style={{ marginLeft: "0.5rem" }}>
                              {resort.weather?.temperature !== undefined ? `${resort.weather.temperature}°F` : "N/A"}
                            </span>
                            {resort.weather?.description && (
                              <>
                                <span style={{ margin: "0 0.5rem" }}>|</span>
                                <Icon
                                  path={weatherIconMap[(resort.weather.description || "").toLowerCase()] || mdiWeatherCloudy}
                                  size={1}
                                  color="#6c757d"
                                />
                                <span style={{ marginLeft: "0.5rem" }}>
                                  {resort.weather.description.charAt(0).toUpperCase() + resort.weather.description.slice(1)}
                                </span>
                              </>
                            )}
                          </div>
                          <div style={{ color: "#6c757d" }}></div>
                        <hr style={{margin: '10px 0'}}/>
                        <div style={{ color: "#6c757d" }}>
                          {resort.average_rating != 0 ? <div style={{ display: "flex", gap: "0.25rem" }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Icon
                              key={star}
                              path={resort.average_rating >= star ? mdiStar : mdiStarOutline}
                              size={1}
                              color="#FFD700"
                            />
                          ))}
                        </div> :  "No reviews yet"
                        }
                          </div>
                        
                      </div>
                    ))}
                  </ul>
                ) : (
                  <SkeletonLoader />
                )}
              </div>
            ) : (
              // resort detail section
              <div
                style={{
                  position: "relative",
                  padding: "1rem",
                  background: "#ffffff",
                  border: "1px solid #d4e3f0",
                  borderRadius: "0.5rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  width: isMobile ? "100%" : "52%",
                  height: isMobile ? "auto" : "80vh",
                  overflowY: "auto",
                  alignItems: "center",
                }}
              >
               {/* close button */}
                <div
                  style={{
                    position: "absolute",
                    top: "1rem",
                    right: "1rem",
                    cursor: "pointer",
                    zIndex: 1
                  }}
                  onClick={() =>
                    this.setState({
                      resortDetailPage: false,
                      selectedResort: null,
                      errorOccurred: false,
                      successOccurred: false,
                      errorMessage: "",
                      successMessage: ""
                    })
                  }
                >
                  <Icon path={mdiCloseCircle} size={1.5} color="#6c757d" />
                </div>
                <div
                  style={{
                    background: 'linear-gradient(145deg, #f6f9fc, #ffffff)',
                    borderRadius: '12px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                    position: 'relative'
                  }}
                >
                  <img
                    src={this.state.selectedResort?.photoURL}
                    alt="resort logo"
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '12px',
                      marginBottom: '1rem',
                      objectFit: 'contain',
                      backgroundColor: 'white',
                      padding: '0.5rem',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  <h2 style={{ 
                    fontSize: '2.5rem',
                    marginBottom: '0.75rem',
                    color: '#16435d',
                    fontWeight: 'bold'
                  }}>{this.state.selectedResort?.name}</h2>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.state.selectedResort?.address || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      color: '#4a6b82',
                      fontSize: '1.1rem',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = "#2a5f9e";
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = "#4a6b82";
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    <Icon path={mdiMapMarker} size={1} />
                    {this.state.selectedResort?.address}
                  </a>
                </div>
                {/* add website here */}
                  <p style={{ display: 'flex', color: "#6c757d", marginBottom: "0.5rem", alignItems: "center", fontSize: "16px", justifyContent: "center" }} onMouseEnter={e => {
                    e.currentTarget.style.fontWeight = "bold";
                    e.currentTarget.style.cursor = "pointer";
                    e.currentTarget.style.textDecoration = "underline";
                    }} onMouseLeave={e => {
                    e.currentTarget.style.fontWeight = "normal";
                    e.currentTarget.style.textDecoration = "none";
                    e.currentTarget.style.cursor = "default";
                    }}>
                  <a
                    href={this.state.selectedResort?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: 'white',
                      color: '#2a5f9e',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '500',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                      border: '1px solid #d4e3f0',
                      margin: '0.5rem 0 0.5rem 0'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#f6f9fc';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                  >
                    Visit Resort Website
                    <Icon
                      path={mdiOpenInNew}
                      size={0.9}
                      color="#2a5f9e"
                    />
                  </a>
                  </p>
                {this.state.selectedResort?.weather && (
                  <>
                    {/* Current Weather Section */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '1rem',
                      padding: '1.5rem',
                      background: 'linear-gradient(145deg, #f6f9fc, #ffffff)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      marginBottom: '2rem'
                    }}>
                      <div style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Icon path={mdiThermometer} size={1.2} color="#2a5f9e" />
                        <h4 style={{ margin: '0.5rem 0', color: '#16435d', fontSize: '0.9rem' }}>Temperature</h4>
                        <p style={{ fontSize: '1.25rem', color: '#2a5f9e', fontWeight: 'bold', margin: 0 }}>
                          {this.state.selectedResort.weather.temperature}°F
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: '0.25rem 0 0 0' }}>
                          Feels like {this.state.selectedResort.weather.feelsLike}°F
                        </p>
                      </div>

                      <div style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Icon path={mdiWeatherWindy} size={1.2} color="#2a5f9e" />
                        <h4 style={{ margin: '0.5rem 0', color: '#16435d', fontSize: '0.9rem' }}>Wind & Humidity</h4>
                        <p style={{ fontSize: '1.25rem', color: '#2a5f9e', fontWeight: 'bold', margin: 0 }}>
                          {this.state.selectedResort.weather.windSpeed} mph
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: '0.25rem 0 0 0' }}>
                          Humidity: {this.state.selectedResort.weather.humidity}%
                        </p>
                      </div>

                      <div style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Icon 
                          path={weatherIconMap[this.state.selectedResort.weather.description.toLowerCase()] || mdiWeatherCloudy}
                          size={1.2}
                          color="#2a5f9e"
                        />
                        <h4 style={{ margin: '0.5rem 0', color: '#16435d', fontSize: '0.9rem' }}>Conditions</h4>
                        <p style={{ fontSize: '1.25rem', color: '#2a5f9e', fontWeight: 'bold', margin: 0 }}>
                          {this.state.selectedResort.weather.description.charAt(0).toUpperCase() + 
                           this.state.selectedResort.weather.description.slice(1)}
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: '0.25rem 0 0 0' }}>
                          Visibility: {Math.round(this.state.selectedResort.weather.visibility / 1609)} mi
                        </p>
                      </div>

                      <div style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Icon path={mdiSnowflake} size={1.2} color="#2a5f9e" />
                        <h4 style={{ margin: '0.5rem 0', color: '#16435d', fontSize: '0.9rem' }}>UV Index</h4>
                        <p style={{ fontSize: '1.25rem', color: '#2a5f9e', fontWeight: 'bold', margin: 0 }}>
                          {this.state.selectedResort.weather.uvIndex}
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#6c757d', margin: '0.25rem 0 0 0' }}>
                          Pressure: {this.state.selectedResort.weather.pressure} hPa
                        </p>
                      </div>

                      <div style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Icon path={mdiWeatherSunny} size={1.2} color="#2a5f9e" />
                        <h4 style={{ margin: '0.5rem 0', color: '#16435d', fontSize: '0.9rem' }}>Sunrise</h4>
                        <p style={{ fontSize: '1.25rem', color: '#2a5f9e', fontWeight: 'bold', margin: 0 }}>
                          {new Date(this.state.selectedResort.weather.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div style={{ 
                        textAlign: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}>
                        <Icon path={mdiWeatherSunny} size={1.2} color="#2a5f9e" />
                        <h4 style={{ margin: '0.5rem 0', color: '#16435d', fontSize: '0.9rem' }}>Sunset</h4>
                        <p style={{ fontSize: '1.25rem', color: '#2a5f9e', fontWeight: 'bold', margin: 0 }}>
                          {new Date(this.state.selectedResort.weather.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {/* Daily Forecast Section */}
                    <div style={{
                      padding: '1.5rem',
                      background: 'linear-gradient(145deg, #f6f9fc, #ffffff)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      marginBottom: '2rem'
                    }}>
                      <h3 style={{ color: '#16435d', marginBottom: '1rem' }}>8-Day Forecast</h3>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '1rem',
                        overflowX: 'auto'
                      }}>
                        {this.state.selectedResort.weather.dailyForecast.map((day, index) => (
                          <div key={index} style={{
                            textAlign: 'center',
                            padding: '1rem',
                            borderRadius: '8px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                          }}>
                            <p style={{ 
                              fontSize: '0.9rem', 
                              color: '#6c757d', 
                              marginBottom: '0.5rem' 
                            }}>
                              {new Date(day.date * 1000).toLocaleDateString([], { weekday: 'short' })}
                            </p>
                            <Icon 
                              path={weatherIconMap[day.weather.description.toLowerCase()] || mdiWeatherCloudy}
                              size={1.2}
                              color="#2a5f9e"
                            />
                            <div style={{ marginTop: '0.5rem' }}>
                              <p style={{ 
                                fontSize: '1.1rem', 
                                color: '#2a5f9e', 
                                fontWeight: 'bold', 
                                margin: 0 
                              }}>
                                {Math.round(day.temp.max)}°F
                              </p>
                              <p style={{ 
                                fontSize: '0.9rem', 
                                color: '#6c757d', 
                                margin: '0.25rem 0 0 0' 
                              }}>
                                {Math.round(day.temp.min)}°F
                              </p>
                            </div>
                            {day.snow && (
                              <p style={{ 
                                fontSize: '0.8rem', 
                                color: '#2196f3', 
                                margin: '0.25rem 0 0 0' 
                              }}>
                                {day.snow} in
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* forecast section */}
                    <div style={{
                      padding: '1.5rem',
                      background: 'linear-gradient(145deg, #f6f9fc, #ffffff)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                      marginBottom: '2rem'
                    }}>
                      <h3 style={{ color: '#16435d', marginBottom: '1rem' }}>24-Hour Forecast</h3>
                      <SlideGroup hourlyForecast={this.state.selectedResort.weather.hourlyForecast} />
                    </div>
                  </>
                )}


                  <div style={{ 
                      textAlign: "left",
                      marginTop: '1.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem'
                    }}>
                      <h3 style={{ 
                        fontWeight: "bold", 
                        color: "#16435d", 
                        margin: 0,
                        fontSize: '1.5rem'
                      }}>Reviews</h3>
                      {this.state.resortReviews.length > 0 && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: '#f6f9fc',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          color: '#2a5f9e'
                        }}>
                          <div style={{ display: "flex", gap: "0.25rem" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Icon
                                key={star}
                                path={this.state.selectedResort?.average_rating || 0 >= star ? mdiStar : mdiStarOutline}
                                size={0.8}
                                color="#FFD700"
                              />
                            ))}
                          </div>
                          <span style={{ fontWeight: '500' }}>
                            {this.state.resortReviews.length} {this.state.resortReviews.length === 1 ? 'Review' : 'Reviews'}
                          </span>
                        </div>
                      )}
                    </div>

                    {this.state.resortReviewsLoading ? (
                      <SkeletonLoader />
                    ) : 
                    this.state.resortReviews.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '2rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        color: '#6c757d'
                      }}>
                        No reviews yet
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                      }}>
                        {this.state.resortReviews.map((review) => (
                          <div 
                            key={review.id} 
                            style={{ 
                              borderRadius: "8px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #e0eaf5",
                              padding: "1.25rem",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                            }}
                          >
                            <div style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              marginBottom: "0.75rem", 
                              justifyContent: "space-between" 
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                              }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  backgroundColor: '#2a5f9e',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: '500',
                                  fontSize: '0.9rem'
                                }}>
                                  {review.users.first_name[0].toUpperCase()}
                                </div>
                                <span style={{
                                  color: '#16435d',
                                  fontWeight: '500'
                                }}>{review.users.first_name}</span>
                              </div>
                              {this.state.adminView && (
                                <div 
                                  style={{
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s ease'
                                  }}
                                  onMouseEnter={e => {
                                    (e.target as HTMLElement).style.transform = "scale(1.2)";
                                  }}
                                  onMouseLeave={e => {
                                    (e.target as HTMLElement).style.transform = "scale(1)";
                                  }}
                                  onClick={() => {
                                    this.setState({ confirmDeleteReviewModal: true, selectedReview: review });
                                  }}
                                >
                                  <Icon 
                                    path={mdiDelete} 
                                    size={1} 
                                    color="#dc3545"
                                  />
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: "0.25rem", marginBottom: '0.75rem' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Icon
                                  key={star}
                                  path={review.rating >= star ? mdiStar : mdiStarOutline}
                                  size={0.9}
                                  color="#FFD700"
                                />
                              ))}
                            </div>
                            <div style={{
                              color: '#4a6b82',
                              lineHeight: '1.5'
                            }}>{review.review}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                
                {loggedIn && (
                  <div style={{
                    backgroundColor: '#f6f9fc',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginTop: '2rem',
                    border: '1px solid #e0eaf5'
                  }}>
                    <h3 style={{
                      color: '#16435d',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      marginTop: 0,
                      marginBottom: '1rem'
                    }}>
                      Write a Review
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem'
                    }}>
                      <div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginBottom: '0.5rem'
                        }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              style={{
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease'
                              }}
                              onMouseEnter={() => {
                                // Highlight all stars up to this one
                                const stars = document.querySelectorAll('.rating-star');
                                stars.forEach((s, index) => {
                                  if (index < star) {
                                    (s as HTMLElement).style.transform = 'scale(1.2)';
                                  }
                                });
                              }}
                              onMouseLeave={() => {
                                // Reset all stars
                                const stars = document.querySelectorAll('.rating-star');
                                stars.forEach((s) => {
                                  (s as HTMLElement).style.transform = 'scale(1)';
                                });
                              }}
                              onClick={() => this.setState({ ratingInput: star })}
                            >
                              <Icon
                                className="rating-star"
                                path={this.state.ratingInput >= star ? mdiStar : mdiStarOutline}
                                size={1.5}
                                color="#FFD700"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ position: 'relative' }}>
                        <textarea
                          placeholder="Share your experience with this resort..."
                          value={this.state.reviewInput}
                          onChange={(e) => this.setState({ reviewInput: e.target.value })}
                          style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #d4e3f0',
                            backgroundColor: 'white',
                            fontSize: '1rem',
                            color: '#16435d',
                            resize: 'vertical',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.2s ease',
                            outline: 'none'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2a5f9e';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#d4e3f0';
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '0.5rem',
                          right: '0.5rem',
                          color: '#6c757d',
                          fontSize: '0.875rem'
                        }}>
                          {this.state.reviewInput.length}/500
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '0.5rem'
                      }}>
                        <Button
                          style={{
                            backgroundColor: "#0d6efd",
                            color: "white",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            border: 'none',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(13, 110, 253, 0.2)'
                          }}
                          onClick={() => {
                            this.attemptToSubmitReview();
                          }}
                        >
                          Submit Review
                        </Button>

                        {(this.state.errorOccurred || this.state.successOccurred) && (
                          <div style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            backgroundColor: this.state.errorOccurred ? '#fff5f5' : '#f0fff4',
                            color: this.state.errorOccurred ? '#dc3545' : '#2f855a',
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {this.state.errorOccurred ? this.state.errorMessage : this.state.successMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add back button at the bottom */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '2rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid #e0eaf5'
                }}>
                  <button
                    onClick={() => this.setState({ 
                      resortDetailPage: false, 
                      selectedResort: null, 
                      errorOccurred: false, 
                      successOccurred: false, 
                      errorMessage: "", 
                      successMessage: "", 
                      myReviews: [] 
                    })}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 2rem',
                      backgroundColor: '#f6f9fc',
                      color: '#2a5f9e',
                      border: '1px solid #d4e3f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f6f9fc';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                    }}
                  >
                    <Icon path={mdiArrowLeft} size={1} color="#2a5f9e" />
                    Back to Resorts
                  </button>
                </div>
              </div>
            )}

            {/* Right Column - Map */}
            <div style={{ 
              width: isMobile ? "100%" : "45%",
              height: isMobile ? "50vh" : "80vh",
              overflow: "hidden", 
              boxSizing: "border-box"
            }}>
              <Map
                zip={this.state.user?.zip_code}
                stateFilter={this.state.stateFilter}
                selectedResort={
                  this.state.selectedResort
                    ? `${this.state.selectedResort.latitude},${this.state.selectedResort.longitude}`
                    : ""
                }
              />  
            </div>
          </div>

          {/* Modals */}
          <Modal show={this.state.confirmDeleteModal}>
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
              <h3 style={{ color: "#16435d", marginBottom: "1rem" }}>Confirm Delete</h3>
              <p style={{ color: "#4a6b82", marginBottom: "2rem" }}>
                Are you sure you want to delete this resort?
              </p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => this.setState({ confirmDeleteModal: false })}
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
                    this.deleteResort();
                  }}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </Modal>

          <Modal show={this.state.confirmDeleteReviewModal}>
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
              <h3 style={{ color: "#16435d", marginBottom: "1rem" }}>Confirm Deletion</h3>
              <p style={{ color: "#4a6b82", marginBottom: "2rem" }}>
                Are you sure you want to delete this review?
              </p>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => this.setState({ confirmDeleteReviewModal: false })}
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
                    this.deleteReview();
                  }}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>

          <Modal show={this.state.successModal}>
            <div
              style={{
                position: "relative",
                textAlign: "center",
                backgroundColor: "#eafaf1",
                padding: "2rem",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                maxWidth: "400px",
                margin: "0 auto",
                color: "#155724",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              <button
                onClick={() => this.setState({ successModal: false, successOccurred: false, successMessage: "" })}
                style={{
                  position: "absolute",
                  top: "0.5rem",
                  right: "0.75rem",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.25rem",
                  cursor: "pointer",
                  color: "#155724"
                }}
              >
                &times;
              </button>
              {this.state.successMessage}
            </div>
          </Modal>
        </div>

        <Footer />

        <div className="snowfall-container"></div>

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

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  };
};