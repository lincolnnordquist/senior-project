import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import React, { Component } from "react";
import SkiResortsMap from "../components/SkiResortsMap";
import Button from '@mui/material/Button';
import Icon from '@mdi/react';
import { mdiStar, mdiStarOutline } from '@mdi/js';

type SelectedResort = {
  id: string;
  name: string;
  state: string;
  website: string;
  latitude: number;
  longitude: number;
  address: string;
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
  selectedResort: SelectedResort | null;

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
        this.setState({ myReviews: data.reviews }, () => {
          console.log("User reviews fetched:", this.state.myReviews);
        });
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

  async fetchEverything() {
    this.fetchResorts();
    this.fetchUserReviews();
  }

  componentDidMount() {
    this.fetchEverything();
    console.log("User from componentDidMount:", this.props.user);
  }

  render() {
    const { resorts } = this.state;
    const { user } = this.props;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(to bottom, #cce0ff, #ffffff)",
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

                        this.setState({
                          resortDetailPage: true,
                          selectedResort: resort,
                          reviewInput: existingReview?.review || "",
                          ratingInput: existingReview?.rating || 0,
                        });
                        this.fetchResortReviews(resort.id);
                      }}
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        marginBottom: "1rem",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        transition: "transform 0.2s ease-in-out",
                        textAlign: "left",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                    >
                      <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: "#0d6efd" }}>
                        {resort.name}
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
                backgroundColor: "white",
                borderRadius: "0.5rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                width: "52%",
                // maxHeight: "500px",
                height: "80vh",
                overflowY: "auto",
                alignItems: "center",
              }}
            >
              <h2 style={{ color: "#0d6efd", marginBottom: "1rem", fontWeight: "bold", fontSize: "32px" }}>
                {this.state.selectedResort?.name}
              </h2>
              <h2 style={{ color: "black", marginBottom: "1rem", fontWeight: "bold", fontSize: "18px" }}>
                {this.state.selectedResort?.address}
              </h2>


                <div style={{ 
                    textAlign: "left",
                }}>
                {this.state.resortReviews.length === 0 ? (
                  <p>No reviews for this resort yet.</p>
                ) : (
                  this.state.resortReviews.map((review) => (
                    <div key={review.id} style={{ marginBottom: "1rem", borderRadius: "8px",
                      backgroundColor: "#ededed",
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

              <p style={{ alignSelf: "flex-start", fontWeight: "bold", marginBottom: "0.25rem" }}>
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

              <p style={{ alignSelf: "flex-start", fontWeight: "bold", marginBottom: "0.25rem" }}>
                Rating:
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
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