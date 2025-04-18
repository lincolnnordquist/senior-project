import React, { Component } from 'react';
import Logo from "../../public/images/logo.png";

interface PropsType {
}

interface StateType {
}

class Footer extends Component<PropsType, StateType> {
  constructor(props: PropsType) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SkiScape. All rights reserved.</p>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer; 