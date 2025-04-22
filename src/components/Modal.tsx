import React from "react";


type PropsType = {
  show: boolean;
  style?: Object,
  id?: string,
  children?: React.ReactNode | React.ReactNode[]
  isDarkMode: boolean;
}

type StatesType = {
    show: boolean
};



class Modal extends React.Component<PropsType,StatesType> {
    static defaultProps: PropsType = {
        show:true,
        style:{},
        id:"",
        isDarkMode: false,
    };
  
    constructor(props: PropsType) {
        super(props);
        this.state = {  
            show: true,
        };
    }

  render() {
    const { show, children, isDarkMode } = this.props;

    if (!show) return null;

    const styles: { [key: string]: React.CSSProperties } = {
      overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      },
      modalContainer: {
          padding: "0",
          borderRadius: "0.5rem",
          maxWidth: "90%",
          maxHeight: "90%",
          boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
          overflow: "hidden",
          zIndex: 1001,
      },
    };

    return (
      <div style={styles.overlay}>
        <div style={styles.modalContainer}>
            {this.props.children}
        </div>
      </div>
    );
  }
}

export default Modal;
