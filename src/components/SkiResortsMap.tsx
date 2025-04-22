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
  stateFilter?: string;

  zip?: string;
  isDarkMode: boolean;
}

interface MapState {
  resorts: SkiResort[];
  zoom: number;
  center: { lat: number; lng: number };
  mapInstance: google.maps.Map | null;
}

const darkTheme: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const lightTheme: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
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
];

const lightMapStyle = lightTheme;

class SkiResortsMap extends Component<MapProps, MapState> {
  constructor(props: MapProps) {
    super(props);
    this.state = {
      resorts: [],
      zoom: 6, 
      center: { lat: 39.5, lng: -108.5 },
      mapInstance: null,
    };
  }

  private initializeMap() {
    const zip = this.props.zip;
    const stateFilter = this.props.stateFilter;
    // -108.5: Utah + Colorado
    // -105.5: Colorado
    // -111.5: Utah
    // -119.5: California
    // -72.5: Vermont
    // -75.5: New York
    // -95.5: Default

      let zoom = 4;
      let center = { lat: 37.5, lng: -95.5 };

    // having a state filter overrides having a zip code
    if (stateFilter) {
      if (stateFilter === "UT") {
        center = { lat: 39.5, lng: -111.5 };
        zoom = 7;
      } else if (stateFilter === "CO") {
        center = { lat: 39.5, lng: -105.5 };
        zoom = 7;
      } else if (stateFilter === "CA") {
        center = { lat: 37.5, lng: -119.5 };
        zoom = 6;
      } else if (stateFilter === "VT") {
        center = { lat: 44.5, lng: -72.5 };
        zoom = 7;
      }
      else if (stateFilter === "NY") {
        center = { lat: 43.5, lng: -75.5 };
        zoom = 7;
      }
       
      this.setState({ center, zoom });
      return;
    } 
  //   else {

  //   if (zip === undefined) {
  //     zoom = 4;
  //     center = { lat: 37.5, lng: -95.5 };
  //     console.log("no zip provided")
  //   } else if (zip.startsWith("84")) {
  //     center = { lat: 39.5, lng: -111.5 };
  //     zoom = 7;
  //     console.log("utah zip")
  //   } else if (zip.startsWith("80") || zip.startsWith("81")) {
  //     zoom = 7;
  //     center = { lat: 39.5, lng: -105.5 };
  //     console.log("colorado zip")
  //   }
  // }

    this.setState({ center, zoom });
  }

  componentDidMount() {
    this.initializeMap();

    fetch("/api/ski_resorts")
      .then((res) => res.ok ? res.json() : Promise.reject("Failed to fetch"))
      .then((data) => this.setState({ resorts: data }))
      .catch((error) => console.error("Error fetching ski resorts:", error));
  }

  componentDidUpdate(prevProps: MapProps) {
    if (prevProps.selectedResort !== this.props.selectedResort) {
      if (this.props.selectedResort) {
        const [lat, lng] = this.props.selectedResort.split(",").map(Number);
        this.setState({ center: { lat, lng }, zoom: 13 });
      } else {
        this.initializeMap();
      }
    }
  
    if (this.props.zip !== prevProps.zip && this.props.zip) {
      this.initializeMap();
    }
  
    if (this.props.stateFilter !== prevProps.stateFilter) {
      this.initializeMap();
    }

    if (prevProps.isDarkMode !== this.props.isDarkMode && this.state.mapInstance) {
        const newStyles = this.props.isDarkMode ? darkTheme : lightMapStyle;
        this.state.mapInstance.setOptions({ styles: newStyles });
    }
  }

  handleMarkerClick = (resort: SkiResort) => {
    this.setState({
      center: { lat: resort.latitude, lng: resort.longitude },
      zoom: 12,
    });
  };

  onMapLoad = (map: google.maps.Map) => {
    this.setState({ mapInstance: map });
  };

  render() {
    const mapOptions: google.maps.MapOptions = {
        styles: this.props.isDarkMode ? darkTheme : lightMapStyle,
        disableDefaultUI: false,
    };

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
            options={mapOptions}
            onLoad={this.onMapLoad}
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