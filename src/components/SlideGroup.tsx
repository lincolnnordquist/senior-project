import React, { Component } from 'react';
import Icon from '@mdi/react';
import { mdiWeatherCloudy, mdiWeatherSnowy, mdiWeatherSunny, mdiWeatherFog, mdiWeatherPartlyCloudy, mdiWeatherRainy } from '@mdi/js';

interface HourlyForecast {
  time: number;
  temp: number;
  feelsLike: number;
  weather: {
    main: string;
    description: string;
  };
  pop: number;
}

interface Props {
  hourlyForecast: HourlyForecast[];
}

interface State {
  scrollPosition: number;
}

const weatherIconMap: { [key: string]: string } = {
  // add more icons later
  "scattered clouds": mdiWeatherCloudy,
  "broken clouds": mdiWeatherCloudy,
  "light snow": mdiWeatherSnowy,
  "clear sky": mdiWeatherSunny,
  "snow": mdiWeatherSnowy,
  "overcast clouds": mdiWeatherPartlyCloudy,
  "few clouds": mdiWeatherPartlyCloudy,
  "light rain": mdiWeatherRainy,
  "mist": mdiWeatherFog
};

class HourlyForecastSlider extends Component<Props, State> {
  private sliderElement: HTMLDivElement | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      scrollPosition: 0
    };
  }

  handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    this.setState({ scrollPosition: event.currentTarget.scrollLeft });
  };

  scrollLeft = () => {
    if (this.sliderElement) {
      this.sliderElement.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  scrollRight = () => {
    if (this.sliderElement) {
      this.sliderElement.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  render() {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={this.scrollLeft}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          ←
        </button>

        <button
          onClick={this.scrollRight}
          style={{
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            cursor: 'pointer',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          →
        </button>

        <div
          ref={(el: HTMLDivElement | null) => { this.sliderElement = el; }}
          onScroll={this.handleScroll}
          style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '1rem',
            padding: '1rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {this.props.hourlyForecast.map((hour, index) => (
            <div
              key={index}
              style={{
                flex: '0 0 auto',
                textAlign: 'center',
                padding: '1rem',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                minWidth: '100px'
              }}
            >
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#6c757d', 
                marginBottom: '0.5rem' 
              }}>
                {new Date(hour.time * 1000).toLocaleTimeString([], { hour: 'numeric' })}
              </p>
              <Icon 
                path={weatherIconMap[hour.weather.description.toLowerCase()] || mdiWeatherCloudy}
                size={1.2}
                color="#2a5f9e"
              />
              <p style={{ 
                fontSize: '1.1rem', 
                color: '#2a5f9e', 
                fontWeight: 'bold', 
                margin: '0.5rem 0 0 0' 
              }}>
                {Math.round(hour.temp)}°F
              </p>
              {hour.pop > 0 && (
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: '#2196f3', 
                  margin: '0.25rem 0 0 0' 
                }}>
                  {Math.round(hour.pop * 100)}%
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default HourlyForecastSlider; 