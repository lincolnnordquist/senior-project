import { Component } from "react";

class Logout extends Component {
  async componentDidMount() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  }

  render() {
    return <p>Logging out...</p>;
  }
}

export default Logout;