import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Switch, FormControlLabel } from "@material-ui/core";
import debounce from "lodash/debounce";
import moment from "moment";

interface WeatherData {
  current: {
    dt: number;
    temp: number;
    humidity: number;
    wind_speed: number;
    weather: {
      description: string | undefined;
      icon: string;
    }[];
  };
  daily: {
    dt: number;
    temp: {
      day: number;
    };
    weather: {
      description: string | undefined;
      icon: string;
    }[];
  }[];
}

interface City {
  id: number;
  name: string;
  state: string;
  country: string;
  coord: {
    lon: number;
    lat: number;
  };
}

const API_KEY = "1dc7e91e696aed14e03189435fece075";
const API_URL = `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric`;
const ONE_CALL_API_URL = `https://api.openweathermap.org/data/2.5/onecall?appid=${API_KEY}&units=metric`;
const FIND_API_URL = `https://api.openweathermap.org/data/2.5/find?appid=${API_KEY}&units=metric&type=like&sort=population`;

const WeatherApp: React.FC = () => {
  const [city, setCity] = useState("");
  const [cityName, setCityName] = useState("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState("");
  const [celsius, setCelsius] = useState(true);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const response = await axios.get(
          `${ONE_CALL_API_URL}&lat=${latitude}&lon=${longitude}`
        );
        setWeatherData(response.data);
        setCityName(response.data.timezone.split("/")[1]);
      });
    }
  }, []);

  const fetchWeatherData = async (cityName: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}&q=${cityName}`);
      const { coord } = response.data;
      const oneCallResponse = await axios.get(
        `${ONE_CALL_API_URL}&lat=${coord.lat}&lon=${coord.lon}`
      );
      setWeatherData(oneCallResponse.data);
      setCityName(response.data.name);
      setSelectedCity(response.data);
      setError("");
    } catch (error) {
      setError("City not found");
      setWeatherData(null);
      setSelectedCity(null);
    } finally {
      setLoading(false);
    }
  };

  const debounceFetch = debounce(fetchWeatherData, 500);

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value);
    debounceFetch(event.target.value);
  };

  const handleToggle = () => {
    setCelsius(!celsius);
  };

  const handleSelectCity = async (selected: City) => {
    setCity(selected.name);
    fetchWeatherData(selected.name);
  };

  const handleFindCity = async (cityName: string) => {
    const response = await axios.get(`${FIND_API_URL}&q=${cityName}`);
    setCities(response.data.list);
  };

  const handleCityInput = debounce(handleFindCity, 500);

  const formatDate = (dt: number) => {
    const date = new Date(dt * 1000);
    return moment(date).format("MMM D, YYYY");
  };

  return (
    <div className="container">
      <h1>Weather App</h1>
      <div className="search">
        <TextField
          label="City Name"
          variant="outlined"
          value={city}
          onChange={handleCityChange}
        />
        {cities.length > 0 && (
          <ul className="cities-list">
            {cities.map((city) => (
              <li key={city.id} onClick={() => handleSelectCity(city)}>
                {city.name}, {city.country}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="toggle">
        <FormControlLabel
          control={<Switch checked={celsius} onChange={handleToggle} />}
          label={celsius ? "Celsius" : "Fahrenheit"}
        />
      </div>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {weatherData && (
        <div className="weather-data">
          <div className="current-weather">
            <h2>
              {cityName} {formatDate(weatherData.current.dt)}
            </h2>
            <div className="weather-icon">
              <img
                src={`http://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}.png`}
                alt={weatherData.current.weather[0].description}
              />
            </div>
            <div className="temperature">
              {celsius ? (
                <p>{Math.round(weatherData.current.temp)}&#176;C</p>
              ) : (
                <p>{Math.round(weatherData.current.temp * 1.8 + 32)}&#176;F</p>
              )}
            </div>
            <div className="weather-description">
              <p>{weatherData.current.weather[0].description}</p>
            </div>
          </div>
          <div className="daily-weather">
            {weatherData.daily.map((day, index) => (
              <div key={index} className="day">
                <div className="date">{formatDate(day.dt)}</div>
                <div className="weather-icon">
                  <img
                    src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                    alt={day.weather[0].description}
                  />
                </div>
                <div className="temperature">
                  {celsius ? (
                    <p>{Math.round(day.temp.day)}&#176;C</p>
                  ) : (
                    <p>{Math.round(day.temp.day * 1.8 + 32)}&#176;F</p>
                  )}
                </div>
                <div className="weather-description">
                  <p>{day.weather[0].description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default WeatherApp;
