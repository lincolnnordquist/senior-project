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
};

type DashboardState = {
  user: User | null;
  resorts: SkiResort[];
  resortDetailPage: boolean;
  selectedResort: SelectedResort | null;
};

class Dashboard extends Component<{}, DashboardState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      user: null,
      resorts: [],
      resortDetailPage: false,
      selectedResort: null,
    };
  }

  async fetchUser() {
    try {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
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

  componentDidMount() {
    this.fetchUser();
    this.fetchResorts();
  }

  render() {
    const { user, resorts } = this.state;

    return (
      <div className="d-flex flex-column align-items-center" style={{ background: "linear-gradient(to bottom, #cce0ff, #ffffff)", minHeight: "100vh" }}>
        <div className="container text-center mt-5">
          {/* <div className="bg-white p-4 rounded shadow" style={{ maxWidth: "600px", margin: "0 auto" }}>
            {user ? (
              <>
                <h2 className="text-secondary">Welcome, {user.email}!</h2>
                <Button className="btn btn-primary mt-3" onClick={() => (window.location.href = "/logout")}>
                  Logout
                </Button>
              </>
            ) : (
              <p className="text-muted">Loading user data...</p>
            )}
          </div> */}

          <div className="container text-center py-5 d-flex justify-content-center" style={{ width: "100%" }}>
            {/* Left Column - Resort List */}
            { !this.state.resortDetailPage ? (
              <div className="p-3 bg-white rounded shadow" style={{ width: "50%", maxHeight: "500px", overflowY: "auto" }}>
                <h2 className="text-primary">Resorts</h2>
                {resorts.length > 0 ? (
                  <ul className="list-group">
                    {resorts.map((resort) => (
                      <li 
                        key={resort.id} 
                        className="list-group-item d-flex justify-content-between align-items-center" 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => this.setState({ resortDetailPage: true, selectedResort: resort })}
                      >
                        {resort.name}, {resort.state}
                        <span className="badge bg-primary">{resort.latitude.toFixed(2)}, {resort.longitude.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">No resorts available.</p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-white rounded shadow" style={{ width: "50%", maxHeight: "500px", overflowY: "auto", display: "flex", flexDirection: "column", alignItems: 'center' }}>
                <h2 className="text-primary">{this.state.selectedResort?.name}</h2>
                {/* <button className='btn btn-secondary' onClick={() => {window.open(`https://www.google.com/maps/search/?api=1&query=${this.state.selectedResort?.latitude},${this.state.selectedResort?.longitude}`);}}>Website</button> */}
                <Button style={{width: '100px'}} className='btn btn-secondary self-center' onClick={() => {
                  window.open(this.state.selectedResort?.website);
                }}>Website</Button>


                <Button style={{width: '100px', marginTop: '200px'}} className="btn btn-primary" onClick={() => this.setState({ resortDetailPage: false, selectedResort: null })}>Back</Button>
              </div>
            )}

            {/* Right Column - Map */}
            <div style={{ width: "50%", marginLeft: "5%" }}>
              <SkiResortsMap selectedResort={this.state.selectedResort ? `${this.state.selectedResort.latitude},${this.state.selectedResort.longitude}` : ""}/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Dashboard;