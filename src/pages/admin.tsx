import { GetServerSideProps } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import React, { Component } from "react";
import SkiResortsMap from "../components/SkiResortsMap";
import Button from '@mui/material/Button';
import Icon from '@mdi/react';
import { mdiStar, mdiStarOutline } from '@mdi/js';
import { mdiWeatherCloudy } from '@mdi/js';
import { mdiThermometer, mdiWeatherWindy, mdiCrown, mdiSnowflake } from '@mdi/js';
import { Span } from "next/dist/trace";
import Modal from "../components/Modal";
import Head from 'next/head';

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
  isDarkMode: boolean;
  user?: User | null;
}

class AdminPage extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.state = {
        user: props.user || null,
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
    this.getCurrentUser();
    this.fetchResorts();
    this.fetchAllUsers();
    this.fetchAllReviews();

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

  async getCurrentUser() {
    try {
      const res = await fetch("/api/auth/user", {
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
          }, 1000);
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
    const { isDarkMode } = this.props;
    const isMobile = this.isMobileView();

    const theme = {
      pageBackground: isDarkMode ? '#1a202c' : '#f4f7fc',
      cardBackground: isDarkMode ? '#2d3748' : 'white',
      textColor: isDarkMode ? '#e2e8f0' : '#16435d',
      secondaryTextColor: isDarkMode ? '#a0aec0' : '#4a6b82',
      borderColor: isDarkMode ? '#4a5568' : '#e0eaf5',
      inputBg: isDarkMode ? '#4a5568' : '#f8fafd',
      inputColor: isDarkMode ? '#e2e8f0' : '#16435d',
      buttonBg: isDarkMode ? '#4a5568' : '#f6f9fc',
      buttonColor: isDarkMode ? '#e2e8f0' : '#2a5f9e',
      buttonHoverBg: isDarkMode ? '#718096' : '#ffffff',
      activeButtonBg: isDarkMode ? '#4a5568' : '#e3f2fd',
      activeButtonColor: isDarkMode ? '#ffffff' : '#16435d',
      tableHeaderBg: isDarkMode ? '#4a5568' : '#f6f9fc',
      tableRowHoverBg: isDarkMode ? '#4a5568' : '#f6f9fc',
      snowColor: isDarkMode ? '#bee3f8' : '#2196f3',
      successColor: isDarkMode ? '#68d391' : 'green',
      errorColor: isDarkMode ? '#fc8181' : 'red',
      modalBg: isDarkMode ? '#2d3748' : '#fff',
      confirmButtonBg: isDarkMode ? '#38a169' : '#28a745',
    };

    const inputStyle: React.CSSProperties = {
      padding: "0.75rem",
      borderRadius: "0.5rem",
      border: `1px solid ${theme.borderColor}`,
      backgroundColor: theme.inputBg,
      color: theme.inputColor,
      fontSize: "1rem",
      width: '100%',
    };

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
      position: "relative"
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

    const cardStyle: React.CSSProperties = {
      backgroundColor: theme.cardBackground,
      color: theme.textColor,
      borderRadius: "12px",
      padding: isMobile ? "1rem" : "2rem",
      boxShadow: isDarkMode ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 4px 12px rgba(0, 0, 0, 0.08)",
      flex: 1,
      minWidth: isMobile ? "100%" : "300px",
      marginBottom: isMobile ? "1rem" : "0",
    };

    return (
      <div style={{
        minHeight: "100vh",
        backgroundColor: theme.pageBackground,
        padding: isMobile ? "1rem" : "2rem",
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Head>
          <title>SkiScape | Admin</title>
        </Head>
        
        {!isMobile && (
           <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
               {[...Array(20)].map((_, i) => (
               <div
                   key={i}
                   style={{
                   position: 'absolute',
                   left: `${Math.random() * 100}%`,
                   animation: `fall ${Math.random() * 5 + 5}s linear infinite`,
                   animationDelay: `${Math.random() * 5}s`,
                   opacity: Math.random() * 0.5 + 0.3,
                   }}
               >
                   <Icon path={mdiSnowflake} size={0.5} color={theme.snowColor} />
               </div>
               ))}
           </div>
        )}

        <div style={{ maxWidth: "1400px", margin: "0 auto", position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontSize: isMobile ? "1.8rem" : "2.5rem",
            color: theme.textColor,
            marginBottom: "2rem",
            textAlign: "center",
            fontWeight: "bold",
          }}>
            Admin Portal
          </h1>

          <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "1rem" : "2rem",
            alignItems: isMobile ? "stretch" : "flex-start",
          }}>
            <div style={{
              ...cardStyle,
              flex: isMobile ? 'none' : 1,
              maxWidth: isMobile ? '100%' : '300px',
              padding: isMobile ? '1rem' : '1.5rem'
            }}>
              <h2 style={{ 
                fontSize: isMobile ? '1.2rem' : '1.5rem', 
                color: theme.textColor, 
                marginBottom: '1.5rem',
                borderBottom: `1px solid ${theme.borderColor}`,
                paddingBottom: '0.75rem'
              }}>Admin Menu</h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                 {['Add Resort', 'Manage Users', 'Admin Analytics'].map(section => (
                   <li key={section} style={{ marginBottom: '0.75rem' }}>
                     <button
                       onClick={() => this.setState({ selectedSection: section })}
                       style={{
                         width: '100%',
                         padding: '0.75rem 1rem',
                         border: 'none',
                         borderRadius: '8px',
                         backgroundColor: this.state.selectedSection === section ? theme.activeButtonBg : 'transparent',
                         color: this.state.selectedSection === section ? theme.activeButtonColor : theme.secondaryTextColor,
                         textAlign: 'left',
                         fontWeight: this.state.selectedSection === section ? '600' : '500',
                         cursor: 'pointer',
                         transition: 'background-color 0.2s ease'
                       }}
                        onMouseEnter={(e) => { if (this.state.selectedSection !== section) e.currentTarget.style.backgroundColor = isDarkMode ? '#4a5568' : '#f6f9fc'; }}
                        onMouseLeave={(e) => { if (this.state.selectedSection !== section) e.currentTarget.style.backgroundColor = 'transparent'; }}
                     >
                       {section}
                     </button>
                   </li>
                 ))}
              </ul>
            </div>

            <div style={{
              ...cardStyle,
              flex: 3,
              width: isMobile ? '100%' : 'auto'
            }}>
              {this.state.selectedSection === "Add Resort" && (
                <div>
                  <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', color: theme.textColor, marginBottom: '1.5rem' }}>Add New Resort</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <input 
                          required 
                          value={this.state.resortNameInput} 
                          type="text" 
                          name="Resort Name" 
                          placeholder="Resort Name" 
                          style={{...inputStyle, width: '100%'}}
                          onChange={(e) => {this.setState({resortNameInput: e.target.value})}}
                      />
                      <select 
                          value={this.state.stateInput} 
                          onChange={(e) => this.setState({ stateInput: e.target.value })} 
                          style={{...inputStyle, width: '100%'}}
                      >
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
                      <input 
                          required 
                          value={this.state.websiteInput} 
                          type="text" 
                          name="Website URL" 
                          placeholder="Website URL" 
                          style={{...inputStyle, width: '100%'}}
                          onChange={(e) => {this.setState({websiteInput: e.target.value})}}
                      />
                       <input 
                          required 
                          value={this.state.latitudeInput} 
                          type="text" 
                          name="Latitude" 
                          placeholder="Latitude" 
                          style={{...inputStyle, width: '100%'}}
                          onChange={(e) => {this.setState({latitudeInput: e.target.value})}}
                      />
                       <input 
                          required 
                          value={this.state.longitudeInput} 
                          type="text" 
                          name="Longitude" 
                          placeholder="Longitude" 
                          style={{...inputStyle, width: '100%'}}
                          onChange={(e) => {this.setState({longitudeInput: e.target.value})}}
                      />
                      <input 
                          required 
                          value={this.state.addressInput} 
                          type="text" 
                          name="Address" 
                          placeholder="Address" 
                          style={{...inputStyle, width: '100%'}}
                          onChange={(e) => {this.setState({addressInput: e.target.value})}}
                      />
                      <input 
                          required 
                          value={this.state.photoURLInput} 
                          type="text" 
                          name="Photo URL" 
                          placeholder="Photo URL" 
                          style={{...inputStyle, width: '100%'}}
                          onChange={(e) => {this.setState({photoURLInput: e.target.value})}} 
                      />
                  </div>
                     
                  <div style={{ marginTop: '1.5rem', textAlign: 'center' }}> 
                       {this.state.errorOccurred ? 
                        <p style={{ color: theme.errorColor, fontSize: "14px", marginBottom: "1rem" }}>{this.state.errorMessage}</p>
                       : this.state.successOccurred ?
                        <p style={{ color: theme.successColor, fontSize: "14px", marginBottom: "1rem" }}>{this.state.successMessage}</p>
                       : null
                      }
                      <button
                        style={{
                          backgroundColor: theme.textColor,
                          color: theme.cardBackground,
                          padding: "0.75rem 1.5rem",
                          border: "none",
                          borderRadius: "0.5rem",
                          fontSize: "1rem",
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                          transition: "background-color 0.3s ease",
                          width: "auto",
                          minWidth: "120px"
                        }}
                        onClick={() => {
                            this.attemptToPostResort();
                        }}
                      >
                        Submit
                      </button>
                   </div>
                </div>
              )}

              {this.state.selectedSection === "Manage Users" && (
                <div>
                  <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', color: theme.textColor, marginBottom: '1.5rem' }}>Manage Users</h2>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
                            <th style={{ backgroundColor: theme.tableHeaderBg, color: theme.textColor }}>Name</th>
                            <th style={{ backgroundColor: theme.tableHeaderBg, color: theme.textColor }}>Email</th>
                            <th style={{ backgroundColor: theme.tableHeaderBg, color: theme.textColor }}>Promote</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.users.map((user) => (
                            <tr 
                              key={user.id} 
                              className="table-row-hover" 
                              style={{
                                borderBottom: `1px solid ${theme.borderColor}`,
                                backgroundColor: theme.cardBackground
                              }}
                            >
                              <td style={{ color: theme.textColor }}>{user.first_name} {user.last_name}</td>
                              <td style={{ color: theme.textColor }}>{user.email}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  style={{
                                    backgroundColor: user.is_admin === true ? "transparent" : theme.textColor,
                                    color: user.is_admin === true ? theme.secondaryTextColor : theme.cardBackground,
                                    padding: "0.4rem 0.75rem",
                                    border: user.is_admin ? `1px solid ${theme.secondaryTextColor}` : "none",
                                    borderRadius: "4px",
                                    cursor: user.is_admin ? "not-allowed" : "pointer",
                                    fontSize: "0.9rem",
                                    minWidth: '70px'
                                  }}
                                  onClick={() => {this.setState({ confirmPromoteModal: true, selectedUser: user })}}
                                  disabled={user.is_admin}
                                >
                                  {user.is_admin ? "Admin" : "Promote"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                    </table>
                  </div>
                </div>
              )}

              {this.state.selectedSection === "Admin Analytics" && (
                <div>
                   <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', color: theme.textColor, marginBottom: '1.5rem' }}>Admin Analytics</h2>
                   <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '1.5rem'
                  }}>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Total Users</h3>
                         <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: theme.textColor }}>{this.state.users.length}</p>
                       </div>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Total Resorts</h3>
                         <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: theme.textColor }}>{this.state.resorts.length}</p>
                       </div>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Total Reviews</h3>
                         <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: theme.textColor }}>{this.state.resortReviews.length}</p>
                       </div>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Average Rating</h3>
                         <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: theme.textColor }}>
                           {this.state.resorts.length > 0 
                             ? (this.state.resorts.reduce((sum, resort) => sum + resort.average_rating, 0) / this.state.resorts.length).toFixed(1)
                             : "N/A"}
                         </p>
                       </div>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Most Reviewed Resort</h3>
                         <p style={{ fontSize: "1rem", fontWeight: "bold", color: theme.textColor }}>
                           {(() => {
                             const resortReviewCounts = this.state.resortReviews.reduce((acc, review) => {
                               acc[review.resort_id] = (acc[review.resort_id] || 0) + 1;
                               return acc;
                             }, {} as { [key: string]: number });
                             
                             const mostReviewedId = Object.entries(resortReviewCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0];
                             const resort = this.state.resorts.find(r => r.id === mostReviewedId);
                             return resort ? `${resort.name} (${resortReviewCounts[mostReviewedId]} reviews)` : "N/A";
                           })()}
                         </p>
                       </div>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Highest Rated Resort</h3>
                         <p style={{ fontSize: "1rem", fontWeight: "bold", color: theme.textColor }}>
                           {this.state.resorts.length > 0 
                             ? `${this.state.resorts.reduce((prev, curr) => prev.average_rating > curr.average_rating ? prev : curr).name} (${this.state.resorts.reduce((prev, curr) => prev.average_rating > curr.average_rating ? prev : curr).average_rating.toFixed(1)})`
                             : "N/A"}
                         </p>
                       </div>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Lowest Rated Resort</h3>
                         <p style={{ fontSize: "1rem", fontWeight: "bold", color: theme.textColor }}>
                           {this.state.resorts.length > 0 
                             ? `${this.state.resorts.reduce((prev, curr) => prev.average_rating < curr.average_rating ? prev : curr).name} (${this.state.resorts.reduce((prev, curr) => prev.average_rating < curr.average_rating ? prev : curr).average_rating.toFixed(1)})`
                             : "N/A"}
                         </p>
                       </div>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Review Distribution</h3>
                         <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                           {[5, 4, 3, 2, 1].map((rating) => {
                             const count = this.state.resortReviews.filter(r => r.rating === rating).length;
                             const percentage = (count / this.state.resortReviews.length * 100).toFixed(1);
                             return (
                               <div key={rating} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                 <div style={{ width: "60px" }}>{rating} Stars</div>
                                 <div style={{ flex: 1, height: "20px", backgroundColor: "#e9ecef", borderRadius: "10px", overflow: "hidden" }}>
                                   <div style={{ 
                                     width: `${percentage}%`, 
                                     height: "100%", 
                                     backgroundColor: rating >= 4 ? "#28a745" : rating >= 3 ? "#ffc107" : "#dc3545",
                                     transition: "width 0.5s ease"
                                   }} />
                                 </div>
                                 <div style={{ width: "50px", textAlign: "right" }}>{percentage}%</div>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                       <div style={{ ...cardStyle, padding: '1rem', backgroundColor: theme.inputBg }}>
                         <h3 style={{ color: theme.textColor, fontSize: "1.1rem" }}>Resorts by State</h3>
                         <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                           {(() => {
                             const stateCounts = this.state.resorts.reduce((acc, resort) => {
                               acc[resort.state] = (acc[resort.state] || 0) + 1;
                               return acc;
                             }, {} as { [key: string]: number });
                             
                             return Object.entries(stateCounts)
                               .sort((a, b) => b[1] - a[1])
                               .map(([state, count]) => (
                                 <div key={state} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                   <div style={{ width: "60px" }}>{state}</div>
                                   <div style={{ flex: 1, height: "20px", backgroundColor: "#e9ecef", borderRadius: "10px", overflow: "hidden" }}>
                                     <div style={{ 
                                       width: `${(count / this.state.resorts.length * 100).toFixed(1)}%`, 
                                       height: "100%", 
                                       backgroundColor: "#2196f3",
                                       transition: "width 0.5s ease"
                                     }} />
                                   </div>
                                   <div style={{ width: "50px", textAlign: "right" }}>{count}</div>
                                 </div>
                               ));
                           })()}
                         </div>
                       </div>
                   </div>
                </div>
              )}
               {!this.state.selectedSection && (
                  <div style={{ textAlign: 'center', padding: '2rem', color: theme.secondaryTextColor }}>
                    <p>Select a section from the left to get started.</p>
                  </div>
               )}
            </div>
          </div>
        </div>

        <Modal show={this.state.confirmPromoteModal} isDarkMode={isDarkMode}>
          <div style={{
            textAlign: "center",
            backgroundColor: theme.modalBg,
            padding: "2rem",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            maxWidth: "400px",
            margin: "0 auto"
          }}>
            <h3 style={{ color: theme.textColor, marginBottom: "1rem" }}>Confirm Promotion</h3>
            <p style={{ color: theme.secondaryTextColor, marginBottom: "2rem" }}>
              Are you sure you want to promote {this.state.selectedUser?.first_name} {this.state.selectedUser?.last_name} to admin?
            </p>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button
                onClick={() => this.setState({ confirmPromoteModal: false })}
                style={{
                  backgroundColor: theme.secondaryTextColor,
                  color: theme.pageBackground,
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
                  backgroundColor: theme.confirmButtonBg,
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

        <Modal show={this.state.successModal} isDarkMode={isDarkMode}>
          <div
            style={{
              position: "relative",
              textAlign: "center",
              backgroundColor: isDarkMode ? '#2d3748' : '#eafaf1',
              padding: "2rem",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              maxWidth: "400px",
              margin: "0 auto",
              color: isDarkMode ? theme.successColor : '#155724',
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
                color: isDarkMode ? theme.successColor : '#155724'
              }}
            >
              &times;
            </button>
            {this.state.successMessage}
          </div>
        </Modal>

        <style jsx>{`
            @keyframes fall {
              0% { transform: translateY(-10vh) rotate(0deg); }
              100% { transform: translateY(100vh) rotate(360deg); }
            }
            td, th {
              padding: ${isMobile ? '0.5rem' : '0.75rem'};
              text-align: left;
              border-bottom: 1px solid ${theme.borderColor};
            }
            th {
              background-color: ${theme.tableHeaderBg};
              color: ${theme.textColor};
              font-weight: 600;
            }
            .table-row-hover:hover {
              background-color: ${theme.tableRowHoverBg} !important;
            }
          `}</style>
      </div>
    );
  }
}

export default AdminPage;

export const getServerSideProps: GetServerSideProps = async (context) => {

  return {
    props: {
    },
  };
};