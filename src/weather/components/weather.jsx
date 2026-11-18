import { useState } from 'react'
import Weathercard from './Weathercard.jsx'
import SearchBar from './Searchbar.jsx'
import { getWeather } from '../services/Weatherapi.js'

function Weather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (city) => {
    const query = city.trim()
    if (!query) return

    setLoading(true)
    setError('')

    try {
      const data = await getWeather(query)
      setWeather(data)
    } catch (err) {
      setWeather(null)
      setError('Unable to fetch weather. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="weather-panel">
      <SearchBar onSearch={handleSearch} />
      {loading && <p className="weather-status">Loading weather...</p>}
      {error && <p className="weather-status weather-error">{error}</p>}
      <Weathercard weather={weather} />
    </section>
  )
}

export default Weather
