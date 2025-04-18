import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import React, { Component } from "react";
import Head from 'next/head';
import Map from "../components/SkiResortsMap";
import Button from '@mui/material/Button';
import Icon from '@mdi/react';
import { mdiStar, mdiStarOutline } from '@mdi/js';
import { mdiWeatherCloudy, mdiWeatherSnowy, mdiWeatherSunny, mdiWeatherFog, mdiWeatherPartlyCloudy, mdiWeatherRainy, mdiThermometer, mdiWeatherWindy, mdiDelete, mdiOpenInNew } from '@mdi/js';
import { mdiCloseCircle } from '@mdi/js';
import Modal from "../components/Modal";
import SkeletonLoader from "../components/SkeletonLoader";

type WeatherType = {
  temperature: number;
  description: string;
  windSpeed: number;
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

    this.setState({ resorts: updatedResorts });
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
    this.createSnowflakes();
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

  createSnowflakes() {
    const snowflakeContainer = document.querySelector('.snowfall-container');

    if (snowflakeContainer) {
      for (let i = 0; i < 100; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.style.left = `${Math.random() * 100}%`;
        snowflake.style.animationDuration = `${Math.random() * 25 + 25}s`;
        snowflake.style.animationDelay = `-${Math.random() * 25}s`;
        snowflakeContainer.appendChild(snowflake);
      }
    }
  }

  render() {
    const { resorts, screenSize } = this.state;
    const loggedIn = this.state.user !== null;
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "#eaf4fb",
          height: this.isMobileView() ? "auto" : "100vh",
          width: "100%",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          overflow: this.isMobileView() ? "visible" : "hidden",
        }}
      >
        <Head>
          <title>SkiScape | Dashboard</title>
        </Head>
        <div
          style={{
            display: "flex",
            flexDirection: this.isMobileView() ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "center",
            padding: this.isMobileView() ? "1rem" : "2rem",
            width: "100%",
            boxSizing: "border-box"
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
                // width: screenSize < 850 ? "100%" : "52%",
                width: this.isMobileView() ? "100%" : "52%",
                height: "80vh",
                // maxHeight: "500px",
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
              {resorts.length > 0 ? (
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
                width: this.isMobileView() ? "100%" : "52%",
                // maxHeight: "500px",
                height: "80vh",
                overflowY: "auto",
                alignItems: "center",
              }}
            >
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
              <img
                          src={this.state.selectedResort?.photoURL}
                          alt="resort photo"
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "8px",
                            display: "block",
                            margin: "0.5rem auto",
                          }}
                        />
              <h2 style={{ color: "#16435d", marginBottom: "0.25rem", fontWeight: "bold", fontSize: "32px" }}>
                {this.state.selectedResort?.name}
              </h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.state.selectedResort?.address || "")}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#4a6b82", marginBottom: "1rem", fontSize: "16px", display: "block" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.fontWeight = "bold";
                    e.currentTarget.style.textDecoration = "underline";
                  }} onMouseLeave={e => {
                    e.currentTarget.style.fontWeight = "normal";
                    e.currentTarget.style.textDecoration = "none";
                  }}
              >
                {this.state.selectedResort?.address}
              </a>
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
                  style={{ color: "#4a6b82", textDecoration: "none" }}
                  onMouseEnter={e => {
                  e.currentTarget.style.fontWeight = "bold";
                  e.currentTarget.style.textDecoration = "underline";
                  }} onMouseLeave={e => {
                  e.currentTarget.style.fontWeight = "normal";
                  e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  Website 
                </a>
                <Icon
                  path={mdiOpenInNew}
                  size={0.9}
                  color="#6c757d"
                  style={{ marginLeft: "0.25rem", verticalAlign: "middle" }}
                />
                </p>
              {this.state.selectedResort?.weather && (
                <div style={{ display: "flex", flexDirection: "column", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", color: "#6c757d", marginBottom: "0.5rem" }}>
                    <Icon path={mdiWeatherCloudy} size={1} color="#6c757d" />
                    <span style={{ marginLeft: "0.5rem" }}>
                      {this.state.selectedResort.weather.temperature}°F
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", color: "#6c757d" }}>
                    <Icon path={mdiWeatherWindy} size={1} color="#6c757d" />
                    <span style={{ marginLeft: "0.5rem" }}>
                      Wind Speed: {this.state.selectedResort.weather.windSpeed} mph
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", color: "#6c757d", marginTop: "0.5rem" }}>
                    <Icon path={mdiWeatherCloudy} size={1} color="#6c757d" />
                    <span style={{ marginLeft: "0.5rem" }}>
                      {this.state.selectedResort.weather.description.charAt(0).toUpperCase() + this.state.selectedResort.weather.description.slice(1)}
                    </span>
                  </div>
                </div>
              )}


                <div style={{ 
                    textAlign: "left",
                }}>
                  <h3 style={{ fontWeight: "bold", color: "#2a5f9e", marginTop: "1rem", marginBottom: "1rem" }}>Reviews</h3>
                {this.state.resortReviewsLoading ? (
                  <SkeletonLoader />
                ) : 
                this.state.resortReviews.length === 0 ? (
                  <span style={{color: "#6c757d"}}>No reviews yet</span>
                ) :
                (
                  this.state.resortReviews.map((review) => (
                    <div key={review.id} style={{ marginBottom: "1rem", borderRadius: "8px",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #cce0ff",
                    padding: "1rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s ease-in-out",
                     }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem", justifyContent: "space-between" }}>
                        <span>{review.users.first_name}</span>
                        <span style={{ color: "#6c757d", fontSize: "0.9rem", transition: "transform 0.2s ease-in-out", cursor: "pointer", display: this.state.adminView ? '' : 'none' }}  onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.2)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onClick={() => {
                            this.setState({ confirmDeleteReviewModal: true, selectedReview: review });
                          }}
                          >
                          <Icon path={mdiDelete} size={1} color="#dc3545"/>
                        </span>
                          
                        </div>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Icon
                            key={star}
                            path={review.rating >= star ? mdiStar : mdiStarOutline}
                            size={1}
                            color="#FFD700"
                          />
                        ))}
                      </div>
                      <div>{review.review}</div>
                    </div>
                  ))
                )}
              </div>
              
              <p style={{ alignSelf: "flex-start", fontWeight: "bold", marginBottom: "0.25rem", color: "#2a5f9e", display: loggedIn ? '' : 'none' }}>
                Write a Review:
              </p>
              <textarea
                id="review"
                placeholder="Share your experience..."
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                  resize: "vertical",
                  display: loggedIn ? '' : 'none'
                }}
                value={this.state.reviewInput}
                onChange={(e) => this.setState({ reviewInput: e.target.value })}
              />

              <p style={{ alignSelf: "flex-start", fontWeight: "bold", marginBottom: "0.25rem", color: "#2a5f9e", display: loggedIn ? '' : 'none' }}>
                Rating:
              </p>
              <div style={{ display: loggedIn ? 'flex' : 'none', gap: "0.5rem", marginBottom: "1rem", justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    style={{ cursor: "pointer" }}
                    onClick={() => this.setState({ ratingInput: star })}
                  >
                    <Icon
                      path={this.state.ratingInput >= star ? mdiStar : mdiStarOutline}
                      size={1.5}
                      color="#FFD700"
                    />
                  </div>
                ))}
              </div>
              {
                this.state.errorOccurred ?  <span style={{ color: "red"}}>{this.state.errorMessage}</span> : null
              }
               {
                this.state.successOccurred ?  <span style={{ color: "darkgreen" }}>{this.state.successMessage}</span> : null
              }

              <div style={{ display: "flex", justifyContent: "space-around", width: "100%", marginTop: '1rem' }}>
                <Button
                  style={{
                    display: loggedIn ? '' : 'none',
                    backgroundColor: "#0d6efd",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    marginBottom: "1rem",
                  }}
                  onClick={() => {
                    this.attemptToSubmitReview();
                  }}
                >
                  Submit Review
                </Button>

                <Button
                  style={{
                    width: "100px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    height: '40px'
                  }}
                  onClick={() =>
                    this.setState({ resortDetailPage: false, selectedResort: null, errorOccurred: false, successOccurred: false, errorMessage: "", successMessage: "", myReviews: [] })
                  }
                >
                  Back
                </Button>
              </div>

            </div>
          )}

          {/* Right Column - Map */}
          <div style={{ 
            // width: screenSize < 850 ? "100%" : "47%",
            width: this.isMobileView() ? "100%" : "47%",
             overflow: "hidden", boxSizing: "border-box", 
            //  marginTop: screenSize < 850 ? "1rem" : "0"
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


        <div className="snowfall-container"></div>

        <style>
          {`
            body {
              margin: 0;
              overflow-x: hidden;
              overflow-y: auto;
              background-color: #eaf4fb;
              color: #16435d;
            }
            
            .main-container {
              position: relative;
              z-index: 1;
            }
            
            .snowfall-container {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100vh;
              z-index: 0;
              pointer-events: none;
              overflow: hidden;
            }
            
            .snowflake {
              position: absolute;
              width: 10px;
              height: 10px;
              background-color: #ffffff;
              border-radius: 50%;
              opacity: 1;
              box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
              animation: snowfall linear infinite;
              pointer-events: none;
            }
            
            @keyframes snowfall {
              0% {
                top: -10px;
                transform: translateY(0);
              }
              100% {
                top: 100vh;
                transform: translateY(200vh);
              }
            }
          `}
        </style>
      </div>
    );
  }
}

export default Dashboard;

export const getServerSideProps: GetServerSideProps = async (context) => {

  return {
    props: {
    },
  };
};