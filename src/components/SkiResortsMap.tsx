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
            options={{
              styles: [
                {
                  elementType: "geometry",
                  stylers: [{ color: "#f5f5f5" }],
                },
                {
                  elementType: "labels.icon",
                  stylers: [{ visibility: "off" }],
                },
                {
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#616161" }],
                },
                {
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#f5f5f5" }],
                },
                {
                  featureType: "administrative.land_parcel",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#bdbdbd" }],
                },
                {
                  featureType: "poi",
                  elementType: "geometry",
                  stylers: [{ color: "#eeeeee" }],
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#757575" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#e5e5e5" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9e9e9e" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#ffffff" }],
                },
                {
                  featureType: "road.arterial",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#757575" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#dadada" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#616161" }],
                },
                {
                  featureType: "road.local",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9e9e9e" }],
                },
                {
                  featureType: "transit.line",
                  elementType: "geometry",
                  stylers: [{ color: "#e5e5e5" }],
                },
                {
                  featureType: "transit.station",
                  elementType: "geometry",
                  stylers: [{ color: "#eeeeee" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#c9c9c9" }],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9e9e9e" }],
                },
              ],
            }}
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