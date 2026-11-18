import { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(city);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <input
        className="search-input"
        type="text"
        placeholder="Enter City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button className="search-button" type="submit">Search</button>
    </form>
  );
};

export default SearchBar;