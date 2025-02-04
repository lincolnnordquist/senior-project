import React, { Component } from "react";
import { GetServerSideProps } from "next";
import { Props } from "next/script";
import Home from "./test";

type PropsType = {
  message: string;
}

type StatesType = {}

class HomePage extends React.Component<PropsType, StatesType> {
  constructor(props: PropsType) {
		super(props);

		this.state = {};
  }

componentDidMount(): void {
  
}

componentDidUpdate(prevProps: Readonly<PropsType>, prevState: Readonly<StatesType>, snapshot?: any): void {
  
}

  render(): React.ReactNode {
    return (
      <div>
        <h1>Welcome to the Ski Web App! 🎿</h1>
        <p>Server-Side Message: {this.props.message}</p>
      </div>
    );
  }
}

export default HomePage;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
    },
  };
};