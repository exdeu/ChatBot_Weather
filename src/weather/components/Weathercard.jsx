import './weathercard.css';
const Weathercard = ({ weather }) => {
  if (!weather) return null;

  const metrics = [
    {
      icon: "🌡️",
      label: "FEELS LIKE",
      value: `${Math.round(weather.main?.feels_like)}°C`,
    },
    {
      icon: "💧",
      label: "HUMIDITY",
      value: `${weather.main?.humidity}%`,
    },
    {
      icon: "🍃",
      label: "WIND SPEED",
      value: `${
        typeof weather.wind?.speed === "number"
          ? weather.wind.speed.toFixed(1)
          : weather.wind?.speed ?? 0
      } m/s`,
    },
    {
      icon: "☁️",
      label: "CLOUDINESS",
      value: `${weather.clouds?.all}%`,
    },
    {
      icon: "📈",
      label: "PRESSURE",
      value: `${weather.main?.pressure} hPa`,
    },
    {
      icon: "👁️",
      label: "VISIBILITY",
      value: `${weather.visibility ? weather.visibility / 1000 : 0} km`,
    },
    {
      icon: "📍",
      label: "COORDINATES",
      value: `${weather.coord?.lat}, ${weather.coord?.lon}`,
    },
  ];

  return (
    <div className="weather-card">
      <h2 className="city-title">
        {weather.name}, {weather.sys?.country}
      </h2>

      <img
        className="weather-icon"
        src={`https://openweathermap.org/img/wn/${weather.weather?.[0]?.icon}@2x.png`}
        alt={weather.weather?.[0]?.description}
      />

      <div className="temperature">
        {Math.round(weather.main?.temp)}°C
      </div>

      <p className="weather-main">{weather.weather?.[0]?.main}</p>
      <p className="weather-description">{weather.weather?.[0]?.description}</p>

      {/* Horizontal Carousel */}
      <div className="weather-carousel">
        {metrics.map((item, index) => (
          <div className="metric-card" key={index}>
            <span className="metric-icon">{item.icon}</span>
            <span className="metric-label">{item.label}</span>
            <span className="metric-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Weathercard;