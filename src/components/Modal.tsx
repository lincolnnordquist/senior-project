import React from "react";


type PropsType = {
  show: boolean;
  style?: Object,
  id?: string,
  children?: React.ReactNode | React.ReactNode[]
}

type StatesType = {
    show: boolean
};



class Modal extends React.Component<PropsType,StatesType> {
    static defaultProps: PropsType = {
        show:true,
        style:{},
        id:"",
    };
  
    constructor(props: PropsType) {
        super(props);
        this.state = {  
            show: true,
        };
    }

  render() {
    const { show, children } = this.props;

    if (!show) return null;

    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
            {this.props.children}
        </div>
      </div>
    );
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "0.5rem",
    maxWidth: "90%",
    maxHeight: "90%",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    overflowY: "auto",
  },
};

export default Modal;
