import React, { Component } from 'react';
import Icon from '@mdi/react';
import { mdiWeatherCloudy, mdiWeatherSnowy, mdiWeatherSunny, mdiWeatherFog, mdiWeatherPartlyCloudy, mdiWeatherRainy, mdiWeatherLightning } from '@mdi/js';

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
  isDarkMode: boolean;
}

interface State {
  scrollPosition: number;
}

const weatherIconMap: { [key: string]: string } = {
  "scattered clouds": mdiWeatherCloudy,
  "broken clouds": mdiWeatherCloudy,
  "light snow": mdiWeatherSnowy,
  "clear sky": mdiWeatherSunny,
  "snow": mdiWeatherSnowy,
  "overcast clouds": mdiWeatherPartlyCloudy,
  "few clouds": mdiWeatherPartlyCloudy,
  "light rain": mdiWeatherRainy,
  "mist": mdiWeatherFog,
  "thunderstorm": mdiWeatherLightning,
  "rain": mdiWeatherRainy,
  "clear": mdiWeatherSunny,
  "clouds": mdiWeatherCloudy,
  "haze": mdiWeatherFog,
  "fog": mdiWeatherFog,
  // add more later
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
    const { isDarkMode } = this.props;

    // Theme colors for SlideGroup
    const theme = {
      itemBg: isDarkMode ? '#4a5568' : 'white',
      textColor: isDarkMode ? '#e2e8f0' : '#2a5f9e',
      secondaryTextColor: isDarkMode ? '#a0aec0' : '#6c757d',
      iconColor: isDarkMode ? '#63b3ed' : '#2a5f9e',
      precipColor: isDarkMode ? '#90cdf4' : '#2196f3', // Pop % color
      buttonBg: isDarkMode ? 'rgba(45, 55, 72, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      buttonColor: isDarkMode ? '#e2e8f0' : '#000',
      boxShadow: isDarkMode ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)',
    };

    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={this.scrollLeft}
          style={{
            position: 'absolute',
            left: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.buttonBg,
            color: theme.buttonColor,
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
            right: -10,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: theme.buttonBg,
            color: theme.buttonColor,
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
            padding: '1rem 10px',
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
                backgroundColor: theme.itemBg,
                boxShadow: theme.boxShadow,
                minWidth: '100px'
              }}
            >
              <p style={{ 
                fontSize: '0.9rem', 
                color: theme.secondaryTextColor,
                marginBottom: '0.5rem' 
              }}>
                {new Date(hour.time * 1000).toLocaleTimeString([], { hour: 'numeric' })}
              </p>
              <Icon 
                path={weatherIconMap[hour.weather.description.toLowerCase()] || mdiWeatherCloudy}
                size={1.2}
                color={theme.iconColor}
              />
              <p style={{ 
                fontSize: '1.1rem', 
                color: theme.textColor,
                fontWeight: 'bold', 
                margin: '0.5rem 0 0 0' 
              }}>
                {Math.round(hour.temp)}°F
              </p>
              {hour.pop > 0 && (
                <p style={{ 
                  fontSize: '0.8rem', 
                  color: theme.precipColor,
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