import { useState } from 'react';
import PropTypes from 'prop-types';
import useMapStore from '../hooks/useMapState';

const MapControls = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const { setSelectedZip, setMapCenter } = useMapStore();

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 5) {
      setInputValue(value);
      setInputError('');
    }
  };

  const handleSearch = () => {
    if (inputValue.length === 5) {
      setSelectedZip(inputValue);
      // Reset map center to default when searching new zip
      setMapCenter([39.8283, -98.5795]);
    } else {
      setInputError('Please enter a valid 5-digit zip code');
    }
  };

  return (
    <div className="controls">
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter Zip Code"
          value={inputValue}
          onChange={handleInputChange}
          maxLength={5}
          pattern="\d*"
          aria-label="Enter zip code to search for schools"
          className={inputError ? 'error' : ''}
        />
        {inputError && <span className="error-message">{inputError}</span>}
      </div>
      <button 
        onClick={handleSearch} 
        aria-label="Search schools"
        disabled={inputValue.length !== 5}
      >
        Search
      </button>
    </div>
  );
};

MapControls.propTypes = {
  onSearch: PropTypes.func,
};

export default MapControls;
