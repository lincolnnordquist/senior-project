import React, { Component } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface SkiResort {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapProps {
  style?: React.CSSProperties;
  selectedResort?: string;
}

interface MapState {
  resorts: SkiResort[];
  zoom: number;
  center: { lat: number; lng: number };
}

class SkiResortsMap extends Component<MapProps, MapState> {
  constructor(props: MapProps) {
    super(props);
    this.state = {
      resorts: [],
      zoom: 7, 
      center: { lat: 39.5, lng: -111.5 },
    };
  }

  async componentDidMount() {
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

  componentDidUpdate(prevProps: MapProps) {
    if (prevProps.selectedResort !== this.props.selectedResort) {
      if (this.props.selectedResort) {
        const [lat, lng] = this.props.selectedResort.split(",").map(Number);
        this.setState({ center: { lat, lng }, zoom: 16 });
      } else {
        this.setState({ center: { lat: 39.5, lng: -111.5 }, zoom: 7 });
      }
    }
  }

  handleMarkerClick = (resort: SkiResort) => {
    this.setState({
      center: { lat: resort.latitude, lng: resort.longitude },
      zoom: 12,
    });
  };

  render() {
    return (
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <div
          className="rounded shadow"
          style={{
            width: "100%",
            height: "80vh",
            overflow: "hidden",
            ...this.props.style,
          }}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={this.state.center}
            zoom={this.state.zoom}
          >
            {this.state.resorts.map((resort) => (
              <Marker
                key={resort.id}
                position={{ lat: resort.latitude, lng: resort.longitude }}
                onClick={() => this.handleMarkerClick(resort)}
              />
            ))}
          </GoogleMap>
        </div>
      </LoadScript>
    );
  }
}

export default SkiResortsMap;