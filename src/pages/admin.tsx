import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import React, { Component } from "react";
import SkiResortsMap from "../components/SkiResortsMap";
import Button from '@mui/material/Button';
import Icon from '@mdi/react';
import { mdiStar, mdiStarOutline } from '@mdi/js';
import { mdiWeatherCloudy } from '@mdi/js';
import { mdiThermometer, mdiWeatherWindy, mdiCrown } from '@mdi/js';
import { Span } from "next/dist/trace";
import Modal from "../components/Modal";

type WeatherType = {
  temperature: number;
  description: string;
  windSpeed: number;
}

interface User {
  id: string;
  email?: string;
  first_name?: string;
  [key: string]: any;
  is_admin: boolean;
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
    user: User | null;
    resorts: SkiResort[];

    screenSize: number;

    errorOccurred: boolean;
    errorMessage: string;
    successOccurred: boolean;
    successMessage: string;
    successModal: boolean;

    resortReviews: ReviewType[];

    selectedSection: string;
    users: User[];
    resortNameInput: string;
    stateInput: string;
    websiteInput: string;
    latitudeInput: string;
    longitudeInput: string;
    addressInput: string;
    photoURLInput: string;

    confirmPromoteModal: boolean;
    selectedUser: User | null;
};

interface PropsType {
}

class Dashboard extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.state = {
        user: null,
        resorts: [],

        screenSize: typeof window !== "undefined" ? window.innerWidth : 0,

        errorOccurred: false,
        errorMessage: "",
        successOccurred: false,
        successMessage: "",
        successModal: false,

        resortReviews: [],

        selectedSection: "",
        users: [],

        resortNameInput: "",
        stateInput: "",
        websiteInput: "",
        latitudeInput: "",
        longitudeInput: "",
        addressInput: "",
        photoURLInput: "",

        confirmPromoteModal: false,
        selectedUser: null

    };
  }


   componentDidMount() {
    console.log("comeponentDidMount working on admin page")
    this.createSnowflakes();

    this.getCurrentUser();
    this.fetchResorts();
    this.fetchAllUsers();
    this.fetchAllReviews();

    window.addEventListener("resize", this.handleResize);
  this.setState({ screenSize: window.innerWidth });
  }

  isMobileView = () => this.state.screenSize < 850;

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  handleResize = () => {
    this.setState({ screenSize: window.innerWidth });
  };

  async getCurrentUser() {
    try {
      const res = await fetch("/api/au  th/user", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        this.setState({ user: data.user }, () => {
          if (this.state.user && !this.state.user.is_admin) {
            window.location.href = "/dashboard";
          }
        });
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  }

  async fetchResorts() {
    console.log("Fetching resorts...");
    try {
      const res = await fetch("/api/ski_resorts");
      if (res.ok) {
        const data = await res.json();
        this.setState({ resorts: data }, () => {
          console.log("Resorts fetched successfully:", this.state.resorts);
        });
      } else {
        console.error("Failed to fetch ski resorts");
      }
    } catch (error) {
      console.error("Error fetching ski resorts:", error);
    }
  }

  async fetchAllReviews() {
    console.log("Fetching all reviews...");
    try {
      const res = await fetch("/api/reviews/users");
      if (res.ok) {
        const data = await res.json();
        this.setState({ resortReviews: data.reviews }, () => {
          console.log("Reviews fetched successfully:", this.state.resortReviews);
        });
      } else {
        console.error("Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  async fetchAllUsers() {
    try {
          const res = await fetch("/api/users", {
            credentials: "include",
          });
      if (res.ok) {
        const data = await res.json();
        this.setState({ users: data.users }, () => {
          console.log("Users fetched successfully:", this.state.users);
        });
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }


  async createSnowflakes() {
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

  attemptToPostResort () {
    if (this.state.resortNameInput === "" ){
      this.setState({ errorOccurred: true, errorMessage: "Please enter a resort name"});
      return;
    } else if (this.state.stateInput === "" ){
      this.setState({ errorOccurred: true, errorMessage: "Please select a state"});
      return;
    }
    else if (this.state.websiteInput === "" ){
      this.setState({ errorOccurred: true, errorMessage: "Please enter a website"});
      return;
    }
    else if (this.state.latitudeInput === "" ){
      this.setState({ errorOccurred: true, errorMessage: "Please enter a latitude"});
      return;
    }
    else if (this.state.longitudeInput === "" ){
      this.setState({ errorOccurred: true, errorMessage: "Please enter a longitude"});
      return;
    }
    else if (this.state.addressInput === "" ){
      this.setState({ errorOccurred: true, errorMessage: "Please enter an address"});
      return;
    }
    else if (this.state.photoURLInput === "" ){
      this.setState({ errorOccurred: true, errorMessage: "Please enter a photo URL"});
      return;
    }

    fetch("/api/ski_resorts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.state.resortNameInput,
        state: this.state.stateInput,
        website: this.state.websiteInput,
        latitude: this.state.latitudeInput,
        longitude: this.state.longitudeInput,
        address: this.state.addressInput,
        photoURL: this.state.photoURLInput,
      }),
    })
      .then((response) => {
        if (response.ok) {
          this.setState({ successOccurred: true, successMessage: "Resort added successfully!" });
          this.fetchResorts();
          setTimeout(() => {
            this.setState({ successOccurred: false, successMessage: "", resortNameInput: "", stateInput: "", websiteInput: "", latitudeInput: "", longitudeInput: "", addressInput: "", photoURLInput: "" }); 
          }, 3000);
        } else {
          console.log("Failed to add resort");
        }
      })
      .catch((error) => {
        console.error("Error adding resort:", error);
      });
  }

  promoteUser() {
    fetch("/api/promote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: this.state.selectedUser?.id,
      }),
    })
      .then((response) => {
        if (response.ok) {
          this.setState({ confirmPromoteModal: false, successModal: true, successOccurred: true, successMessage: "User promoted successfully!" });
          this.fetchAllUsers();
          this.getCurrentUser();
        } else {
          console.log("Failed to promote user");
        }
      })
      .catch((error) => {
        console.error("Error promoting user:", error);
      });
  }

  render() {

    const inputStyle: React.CSSProperties = {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: "1px solid #d4e3f0",
      backgroundColor: "#f8fafd",
      color: "#16435d",
      fontSize: "1rem"
    }

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      background: "#eaf4fb",
      minHeight: "100vh",
      width: "100%",
      margin: 0,
      padding: 0,
      boxSizing: "border-box",
      overflowX: "hidden",
    }

    const tabStyle: React.CSSProperties = {
      backgroundColor: "#ffffff",
      border: "1px solid #d4e3f0",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      color: "#4a6b82",
      cursor: "pointer",
      transition: "transform 0.2s ease-in-out",
      textAlign: "left",
      fontSize: "1.2rem"
    };

    return (
      <div
        style={containerStyle}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "stretch",
            textAlign: "center",
            padding: "2rem",
            width: "100%",
            boxSizing: "border-box",
            minHeight: "80vh",
          }}
        >
          {/* left column - options */}
            <div
              style={{
                padding: "1.5rem",
                backgroundColor: "white",
                borderRadius: "0.5rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                width: "32%",
                height: "fit-content",
                maxHeight: "600px",
                overflowY: "auto",
                margin: "0 1rem",
              }}
            >
                <ul style={{ listStyleType: "none", padding: 0 }}>
                    <div
                      style={tabStyle}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      onClick={() => 
                        this.state.selectedSection === "manage_resorts" ?
                        this.setState({ selectedSection: "", successOccurred: false, successMessage: "" }) :
                        this.setState({ selectedSection: "manage_resorts", successOccurred: false, successMessage: "" })}
                    >
                      <div style={{ color: "#6c757d", marginBottom: "0.5rem" }}>
                        Add Resort
                      </div>


                    </div>


                    <div
                      style={tabStyle}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      onClick={() => 
                        this.state.selectedSection === "manage_users" ?
                        this.setState({ selectedSection: "" }) :
                        this.setState({ selectedSection: "manage_users" })
                      }
                    >
                      <div style={{ color: "#6c757d", marginBottom: "0.5rem" }}>
                        Manage Users
                      </div>
                    </div>
                    <div
                      style={tabStyle}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      onClick={() => 
                        this.state.selectedSection === "admin_analytics" ?
                        this.setState({ selectedSection: "" }) :
                        this.setState({ selectedSection: "admin_analytics" })}
                    >
                      <div style={{ color: "#6c757d", marginBottom: "0.5rem" }}>
                        Admin Analytics
                      </div>
                    </div>


                </ul>


            </div>
         

          <div
  style={{
    width: "55%",
    minHeight: "80vh",
    overflowY: "auto",
    boxSizing: "border-box",
    transition: "all 0.3s ease-in-out",
  }}
>
            {
              this.state.selectedSection === "manage_resorts" ?
              <div style={{ ...tabStyle, overflowY: "auto", maxHeight: "80vh" }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  <h2 style={{ color: "#6c757d", marginBottom: "0.5rem", textAlign: "center" }}>
                  Add Resort
                  </h2>
                  <div style={tabStyle}>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <input required value={this.state.resortNameInput} type="text" name="Resort Name" placeholder="Resort Name" style={inputStyle} onChange={(e) => {this.setState({resortNameInput: e.target.value})}}/>
    <select value={this.state.stateInput} onChange={(e) => this.setState({ stateInput: e.target.value })} style={inputStyle}>
      <option value="">Select State</option>
      <option value="AL">Alabama</option>
      <option value="AK">Alaska</option>
      <option value="AZ">Arizona</option>
      <option value="AR">Arkansas</option>
      <option value="CA">California</option>
      <option value="CO">Colorado</option>
      <option value="CT">Connecticut</option>
      <option value="DE">Delaware</option>
      <option value="FL">Florida</option>
      <option value="GA">Georgia</option>
      <option value="HI">Hawaii</option>
      <option value="ID">Idaho</option>
      <option value="IL">Illinois</option>
      <option value="IN">Indiana</option>
      <option value="IA">Iowa</option>
      <option value="KS">Kansas</option>
      <option value="KY">Kentucky</option>
      <option value="LA">Louisiana</option>
      <option value="ME">Maine</option>
      <option value="MD">Maryland</option>
      <option value="MA">Massachusetts</option>
      <option value="MI">Michigan</option>
      <option value="MN">Minnesota</option>
      <option value="MS">Mississippi</option>
      <option value="MO">Missouri</option>
      <option value="MT">Montana</option>
      <option value="NE">Nebraska</option>
      <option value="NV">Nevada</option>
      <option value="NH">New Hampshire</option>
      <option value="NJ">New Jersey</option>
      <option value="NM">New Mexico</option>
      <option value="NY">New York</option>
      <option value="NC">North Carolina</option>
      <option value="ND">North Dakota</option>
      <option value="OH">Ohio</option>
      <option value="OK">Oklahoma</option>
      <option value="OR">Oregon</option>
      <option value="PA">Pennsylvania</option>
      <option value="RI">Rhode Island</option>
      <option value="SC">South Carolina</option>
      <option value="SD">South Dakota</option>
      <option value="TN">Tennessee</option>
      <option value="TX">Texas</option>
      <option value="UT">Utah</option>
      <option value="VT">Vermont</option>
      <option value="VA">Virginia</option>
      <option value="WA">Washington</option>
      <option value="WV">West Virginia</option>
      <option value="WI">Wisconsin</option>
      <option value="WY">Wyoming</option>
    </select>
    <input required value={this.state.websiteInput} type="text" name="Website URL" placeholder="Website URL" style={inputStyle} onChange={(e) => {this.setState({websiteInput: e.target.value})}}/>
    <input required value={this.state.latitudeInput} type="text" name="Latitude" placeholder="Latitude" style={inputStyle} onChange={(e) => {this.setState({latitudeInput: e.target.value})}}/>
    <input required value={this.state.longitudeInput} type="text" name="Longitude" placeholder="Longitude" style={inputStyle} onChange={(e) => {this.setState({longitudeInput: e.target.value})}}/>
    <input required value={this.state.addressInput} type="text" name="Address" placeholder="Address" style={inputStyle} onChange={(e) => {this.setState({addressInput: e.target.value})}}/>
    <input required value={this.state.photoURLInput} type="text" name="Photo URL" placeholder="Photo URL" style={inputStyle} onChange={(e) => {this.setState({photoURLInput: e.target.value})}} />

    {this.state.errorOccurred ? 
      <p style={{ color: "red", fontSize: "14px", marginTop: "10px", margin: 'auto' }}>{this.state.errorMessage}</p>
   : this.state.successOccurred ?
      <p style={{ color: "green", fontSize: "14px", marginTop: "10px", margin: 'auto' }}>{this.state.successMessage}</p>
   : null
    }
   
     <button
       style={{
         backgroundColor: "#16435d",
         color: "#ffffff",
         padding: "0.5rem",
         border: "none",
         borderRadius: "0.5rem",
         fontSize: "1rem",
         cursor: "pointer",
         boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
         transition: "background-color 0.3s ease",
         width: "100px",  
         margin: "auto",       
       }}
       onClick={() => {
          this.attemptToPostResort();
       }}
     >
       Submit
     </button>
   
  </div>
</div>
                    </div>
                   
                </div>
                :
                this.state.selectedSection === "manage_users" ?
               <div style={{ ...tabStyle, overflowY: "auto", maxHeight: "80vh" }}>
                 <h2 style={{ textAlign: "center", color: "#6c757d", marginBottom: "1rem" }}>All Users</h2>
                 <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                   {this.state.users.map((user) => (
                     <li
                       key={user.id}
                       style={{
                         display: "flex",
                         justifyContent: "space-between",
                         alignItems: "center",
                         padding: "0.75rem 1rem",
                         borderBottom: "1px solid #e0e6ed",
                       }}
                     >
                       <div>
                         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                           <p style={{ margin: 0, fontWeight: "bold" }}>{user.first_name} {user.last_name}</p>
                           {user.is_admin && (
                             <Icon path={mdiCrown} size={0.8} color="#ffc107" title="Admin" />
                           )}
                         </div>
                         <p style={{ margin: 0, fontSize: "0.9rem", color: "#6c757d" }}>{user.email}</p>
                       </div>
                       <button
                         style={{
                          display: user.is_admin === true ? "none" : "",
                           backgroundColor: "#16435d",
                           color: "#ffffff",
                           padding: "0.4rem 0.75rem",
                           border: "none",
                           borderRadius: "4px",
                           cursor: "pointer",
                           fontSize: "0.9rem"
                         }}
                         onClick={() => {this.setState({ confirmPromoteModal: true, selectedUser: user })}}
                       >
                         Promote
                       </button>
                     </li>
                   ))}
                 </ul>
               </div>
                :
                this.state.selectedSection === "admin_analytics" ?
                <div style={tabStyle}>
                  <h2 style={{ textAlign: "center", color: "#16435d" }}>Admin Analytics</h2>
 
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                    <div style={{ flex: "1", minWidth: "200px", backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
                      <h3 style={{ color: "#16435d" }}>Total Users</h3>
                      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{this.state.users.length}</p>
                    </div>
 
                    <div style={{ flex: "1", minWidth: "200px", backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
                      <h3 style={{ color: "#16435d" }}>Total Resorts</h3>
                      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{this.state.resorts.length}</p>
                    </div>
 
                    <div style={{ flex: "1", minWidth: "200px", backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
                      <h3 style={{ color: "#16435d" }}>Total Reviews</h3>
                      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{this.state.resortReviews.length}</p>
                    </div>
                   <div style={{ flex: "1", minWidth: "200px", backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
                     <h3 style={{ color: "#16435d" }}>Highest Rated Resort</h3>
                     <p style={{ fontSize: "1rem", fontWeight: "bold" }}>
                       {this.state.resorts.length > 0 ? this.state.resorts.reduce((prev, curr) => prev.average_rating > curr.average_rating ? prev : curr).name : "N/A"}
                     </p>
                   </div>
 
                   <div style={{ flex: "1", minWidth: "200px", backgroundColor: "#f8f9fa", padding: "1rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}>
                     <h3 style={{ color: "#16435d" }}>Lowest Rated Resort</h3>
                     <p style={{ fontSize: "1rem", fontWeight: "bold" }}>
                       {this.state.resorts.length > 0 ? this.state.resorts.reduce((prev, curr) => prev.average_rating < curr.average_rating ? prev : curr).name : "N/A"}
                     </p>
                   </div>
                  </div>
 
                </div>
                :
                null
            }
          </div>
        </div>

        <Modal show={this.state.confirmPromoteModal}>
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
    <h3 style={{ color: "#16435d", marginBottom: "1rem" }}>Confirm Promotion</h3>
    <p style={{ color: "#4a6b82", marginBottom: "2rem" }}>
      Are you sure you want to promote {this.state.selectedUser?.first_name} {this.state.selectedUser?.last_name} to admin?
    </p>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <button
        onClick={() => this.setState({ confirmPromoteModal: false })}
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
          this.promoteUser();
        }}
        style={{
          backgroundColor: "#28a745",
          color: "#fff",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Confirm
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
      onClick={() => this.setState({ successModal: false })}
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

  return {
    props: {
    },
  };
};