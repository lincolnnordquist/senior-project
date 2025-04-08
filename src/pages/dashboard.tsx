import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import React, { Component } from "react";
import SkiResortsMap from "../components/SkiResortsMap";
import Button from '@mui/material/Button';
import Icon from '@mdi/react';
import { mdiStar, mdiStarOutline } from '@mdi/js';
import { mdiWeatherCloudy } from '@mdi/js';
import { mdiThermometer, mdiWeatherWindy } from '@mdi/js';

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
  userId: string | null;
};

interface DashboardProps {
  user: {
    id: string;
    email?: string;
    first_name?: string;
  } | null;
}

class Dashboard extends Component<DashboardProps, StateType> {
  constructor(props: DashboardProps) {
    super(props);
    this.state = {
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
      userId: null,
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
        this.setState({ resorts: data });
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

  async fetchResortReviews(resortId: string) {
    try {
      const res = await fetch(`/api/reviews/resort?resort_id=${resortId}`);
      if (res.ok) {
        const data = await res.json();
        this.setState({ resortReviews: data.reviews }, () => {
          console.log("Resort reviews fetched:", this.state.resortReviews);
        });
      } else {
        console.error("Failed to fetch resort reviews");
      }
    } catch (error) {
      console.error("Error fetching resort reviews:", error);
    }
  }

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

  async fetchEverything() {
    await this.fetchResorts();
    await this.fetchUserReviews();
    await this.fetchWeatherForAllResorts();
    await console.log("Resorts after fetching everything:", this.state.resorts);
  }

  componentDidMount() {
    console.log("User from componentDidMount:", this.props.user);

    this.createSnowflakes();
    this.fetchEverything();
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
    const { resorts } = this.state;
    const { user } = this.props;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "#eaf4fb",
          minHeight: "100vh",
          width: "100%",
          margin: 0,
          padding: 0,
          boxSizing: "border-box",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
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
                width: "52%",
                height: "80vh",
                // maxHeight: "500px",
                overflowY: "auto"
              }}
            >
              {resorts.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {resorts.map((resort) => (
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
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
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
                      <div style={{ display: "flex", alignItems: "center", margin: "0.5rem 0" }}>
                        <Icon path={mdiWeatherCloudy} size={1} color="#6c757d" />
                        <span style={{ marginLeft: "0.5rem", color: "#6c757d" }}>
                          {resort.weather?.temperature !== undefined ? `${resort.weather.temperature}°F` : "N/A"}
                        </span>
                      </div>
                      <div style={{ color: "#6c757d", marginBottom: "0.5rem" }}>
                        {resort.address}
                      </div>
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
                      </div> : "No reviews yet"}
                        </div>
                      
                    </div>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "#6c757d" }}>No resorts available.</p>
              )}
            </div>
          ) : (
            // resort detail section
            <div
              style={{
                padding: "1rem",
                background: "#ffffff",
                border: "1px solid #d4e3f0",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                width: "52%",
                // maxHeight: "500px",
                height: "80vh",
                overflowY: "auto",
                alignItems: "center",
              }}
            >
              <img
                          src={this.state.selectedResort?.photoURL}
                          alt="resort photo"
                          style={{
                            width: "100px",
                            height: "100px",
                            borderRadius: "8px",
                            display: "block",
                            margin: "0 auto",
                          }}
                        />
              <h2 style={{ color: "#16435d", marginBottom: "0.25rem", fontWeight: "bold", fontSize: "32px" }}>
                {this.state.selectedResort?.name}
              </h2>
              <h2 style={{ color: "#4a6b82", marginBottom: "1rem", fontSize: "16px" }}>
                {this.state.selectedResort?.address}
              </h2>
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
                </div>
              )}


                <div style={{ 
                    textAlign: "left",
                }}>
                  <h3 style={{ fontWeight: "bold", color: "#2a5f9e", marginTop: "2rem", marginBottom: "1rem" }}>Reviews</h3>
                {this.state.resortReviews.length === 0 ? (
                  <p>No reviews for this resort yet.</p>
                ) : (
                  this.state.resortReviews.map((review) => (
                    <div key={review.id} style={{ marginBottom: "1rem", borderRadius: "8px",
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #cce0ff",
                    padding: "1rem",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    transition: "transform 0.2s ease-in-out",
                     }}>
                      <div>{review.users.first_name}</div>
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
              
              <p style={{ alignSelf: "flex-start", fontWeight: "bold", marginBottom: "0.25rem", color: "#2a5f9e" }}>
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
                }}
                value={this.state.reviewInput}
                onChange={(e) => this.setState({ reviewInput: e.target.value })}
              />

              <p style={{ alignSelf: "flex-start", fontWeight: "bold", marginBottom: "0.25rem", color: "#2a5f9e" }}>
                Rating:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", justifyContent: 'center' }}>
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
                this.state.errorOccurred ?  <span style={{ color: "red", marginBottom: '16px' }}>{this.state.errorMessage}</span> : null
              }
               {
                this.state.successOccurred ?  <span style={{ color: "darkgreen", marginBottom: '16px' }}>{this.state.successMessage}</span> : null
              }

              <div style={{ display: "flex", justifyContent: "space-around", width: "100%" }}>
                <Button
                  style={{
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
                    this.setState({ resortDetailPage: false, selectedResort: null, errorOccurred: false, successOccurred: false, errorMessage: "", successMessage: "" })
                  }
                >
                  Back
                </Button>
              </div>

            </div>
          )}

          {/* Right Column - Map */}
          <div style={{ width: "47%", overflow: "hidden", boxSizing: "border-box" }}>
            <SkiResortsMap
              selectedResort={
                this.state.selectedResort
                  ? `${this.state.selectedResort.latitude},${this.state.selectedResort.longitude}`
                  : ""
              }
            />
          </div>
        </div>


        <div className="snowfall-container"></div>

        <style>
          {`
            body {
              margin: 0;
              overflow: hidden;
              background-color: #eaf4fb;
              color: #16435d;
            }
            
            .main-container {
              position: relative;
              z-index: 1;
              /* Add your other styles for the main content container here */
            }
            
            .snowfall-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 0;
              pointer-events: none;
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
  const supabase = createPagesServerClient(context);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("User from getServerSideProps:", user);

  return {
    props: {
      user,
    },
  };
};