import { Component } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

class Logout extends Component {
  async componentDidMount() {
    const supabase = createClientComponentClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  render() {
    return <p>Logging out...</p>;
  }
}

export default Logout;