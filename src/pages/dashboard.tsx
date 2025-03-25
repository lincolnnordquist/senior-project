import React, { Component } from "react";
import SkiResortsMap from "../components/SkiResortsMap";
import Button from '@mui/material/Button';

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type SelectedResort = {
  id: string;
  name: string;
  state: string;
  website: string;
  latitude: number;
  longitude: number;
}

type SkiResort = {
  id: string;
  name: string;
  state: string;
  website: string;
  latitude: number;
  longitude: number;
  address: string;
};

type DashboardState = {
  user: User | null;
  resorts: SkiResort[];
  resortDetailPage: boolean;
  selectedResort: SelectedResort | null;

  errorOccurred: boolean;
  errorMessage: string;
  successOccurred: boolean;
  successMessage: string;

  reviewInput: string;
  ratingInput: number;
};

class Dashboard extends Component<{}, DashboardState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      user: null,
      resorts: [],
      resortDetailPage: false,
      selectedResort: null,

      reviewInput: "",
      ratingInput: 0,

      errorOccurred: false,
      errorMessage: "",
      successOccurred: false,
      successMessage: "",
    };
  }

  async fetchUser() {
    try {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        console.log("User authenticated:", data.user);
        this.setState({ user: data.user });
      } else {
        console.warn("User not authenticated. Redirecting to homepage.");
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error fetching user:", error);
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
          reviewInput: "",
          ratingInput: 0,
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

  componentDidMount() {
    this.fetchUser();
    this.fetchResorts();
  }

  render() {
    const { user, resorts } = this.state;

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
          overflowX: "hidden"
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
                maxHeight: "500px",
                overflowY: "auto"
              }}
            >
              {resorts.length > 0 ? (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {resorts.map((resort) => (
                    <div
                      key={resort.id}
                      onClick={() =>
                        this.setState({
                          resortDetailPage: true,
                          selectedResort: resort
                        })}
                      style={{
                        backgroundColor: "#f8f9fa",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        marginBottom: "1rem",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        cursor: "pointer",
                        transition: "transform 0.2s ease-in-out",
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
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <h2 style={{ color: "#0d6efd", marginBottom: "1rem" }}>
                {this.state.selectedResort?.name}
              </h2>

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
                onChange={(e) => this.setState({ reviewInput: e.target.value })}
              />

              <p style={{ alignSelf: "flex-start", fontWeight: "bold", marginBottom: "0.25rem" }}>
                Rating:
              </p>
              <input
                id="rating"
                type="number"
                min="1"
                max="5"
                placeholder="Enter a rating (1–5)"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  border: "1px solid #ccc",
                  borderRadius: "0.5rem",
                  marginBottom: "1.5rem",
                }}
                onChange={(e) => this.setState({ ratingInput: parseInt(e.target.value) })}
              />
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
                    this.setState({ resortDetailPage: false, selectedResort: null })
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