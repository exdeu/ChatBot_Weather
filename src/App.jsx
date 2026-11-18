import ChatWindow from './components/chatWindow.jsx'
import Weather from './weather/components/weather.jsx'
import './App.css'

function App() {
  return (
    <main className="app-combined">
      <section className="app-panel weather-section">
        <h1 className="app-title">Weather</h1>
        <Weather />
      </section>

      <section className="app-panel chat-section">
        <ChatWindow />
      </section>
    </main>
  )
}

export default App
