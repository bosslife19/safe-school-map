import React from "react";

import {
  Marker,
  GoogleMap,
  useLoadScript,
  Circle,
  StandaloneSearchBox,
} from "@react-google-maps/api";

import { useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";

function GoogleMaps({
  radius,
  setLatitude,
  style,
  address,
  setAddress,
  latitude,
  longitude,
  setLongitude,
  schools,
}) {
  const [map, setMap] = useState(null);
  const [label, setLabel] = useState('');
  const [searchedLat, setSearchedLat] = useState('');
  const [searchedLng, setSearchedLng] = useState('')
  const [zipCodes, setZipCodes] = useState([])
  const [zoom, setZoom] = useState(5)
  
  const [schoolLat, setSchoolLat] = useState();
  const [schoolLng, setSchoolLng] = useState();

  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index); // Only toggle the clicked card
  };

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries: ["places"],
  });
  const [center,setCenter] = useState({lat:latitude, lng:longitude})
  // const center = useMemo(
  //   () => ({ lat: latitude, lng: longitude }),
  //   [latitude, longitude]
  // );
  const chaangeCoordinate = (coord, index) => {
    const { latLng } = coord;
    const lat = latLng.lat();
    const lng = latLng.lng();
    setLatitude(lat);
    setLongitude(lng);
  };

  useEffect(() => {
    if(searchedLat||searchedLng){
      map?.panTo({lat:searchedLat, lng:searchedLng})
    }else{
      map?.panTo({ lat: latitude, lng: longitude });
    }

  }, [latitude, longitude, searchedLat, searchedLng]);

  const inputRef = useRef();
  const handlePlaceChanged = () => {
    const [place] = inputRef.current.getPlaces();

    if (place) {
      setAddress(place.formatted_address);
      setLatitude(place.geometry.location.lat());
      setLongitude(place.geometry.location.lng());
    }
  };
  const fetchLocation = async (street) => {
    
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: street,
            key: import.meta.env.VITE_GOOGLE_MAP_API_KEY, // Replace with your API key
          },
        }
      );
      const location = response.data.results[0].geometry.location;
      // console.log(location); // Logs the latitude and longitude
      setSchoolLat(location.lat);
      setSchoolLng(location.lng);
      setCenter({lat:location.lat, lng:location.lng});
     
       setZoom(30);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };
  
  const searchZip = async () => {
    if (!address) {
      return alert('Please input a zip code');
    }
  
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}`
      );
      
  
      setSearchedLat(res.data.results[0]?.geometry?.location?.lat);
      setSearchedLng(res.data.results[0]?.geometry?.location?.lng);
  
      // Check if the address is in 'number-number' format
      const isHyphenatedZip = /^\d+-\d+$/.test(address);
  
      const zipcode = schools?.filter((school) => {
        const schoolZip = school['ZIP Code'];
        if (!schoolZip) return false;
  
        // If the school ZIP code is also in 'number-number' format, apply split matching
        if (isHyphenatedZip && /^\d+-\d+$/.test(schoolZip)) {
          const [firstPart, secondPart] = address.split('-');
          const [schoolFirst, schoolSecond] = schoolZip.split('-');
  
          return schoolFirst === firstPart || schoolSecond === firstPart || schoolFirst === secondPart || schoolSecond === secondPart;
        }
  
        // Normal matching if ZIP is not in the 'number-number' format
        return schoolZip === address;
      });
      setZipCodes(zipcode);
      
      if (zipcode.length > 0 && zipcode[0]['School Name']) {
        setLabel(zipcode[0]['School Name']);

      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch location. Please try again.');
    }
  };
  const renderStars = (rating) => {
    const maxRating = 5;
    let stars = [];
    for (let i = 0; i < maxRating; i++) {
      stars.push(
        <span
          key={i}
          className={`text-xl ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };
  
  return (
<div className="w-full h-full flex flex-col items-center bg-gray-100 p-4">
      {!isLoaded ? (
        <h1 className="text-xl font-semibold">Loading...</h1>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row w-full max-w-4xl p-4 gap-2 bg-white shadow-md rounded-lg">
            <select
              className="p-3 border rounded w-full sm:w-auto text-gray-700 focus:ring-2 focus:ring-blue-400"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            >
              <option value="">Select a zip code</option>
              {schools?.map((school) => (
                <option key={school["ZIP Code"]} value={school["ZIP Code"]}>
                  {school["ZIP Code"]}
                </option>
              ))}
            </select>
            <button
              onClick={searchZip}
              className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
            >
              Search
            </button>
          </div>
          <div className="w-full h-[500px] mt-4 rounded-lg overflow-hidden shadow-lg">
            <GoogleMap
              mapContainerClassName="w-full h-full"
              center={center}
              zoom={zoom}
              onLoad={(map) => setMap(map)}
            >
              {searchedLat && searchedLng && (
                <Marker position={{ lat: searchedLat, lng: searchedLng }} />
              )}
              <Circle options={{ fillColor: "#4285F4", strokeColor: "#4285F4", radius: radius }} />
            </GoogleMap>
          </div>
          <div className="container mx-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {zipCodes.length > 0 ? (
                zipCodes.map((school, index) => (
                  <div
                    key={index}
                    className="bg-white shadow-lg rounded-lg border p-4 cursor-pointer transition-transform transform hover:scale-105"
                    onClick={() => {
                      toggleExpand(index); // Toggle the expansion of the clicked card
                      fetchLocation(school.Street); // Fetch the location based on the street address
                    }}
                  >
                    <h2 className="text-lg font-bold text-blue-800">{school["School Name"]}</h2>
                    <p className="text-gray-600">{school.City}</p>
                    {expandedIndex === index &&(
                      <div className="border-t mt-2 pt-2 text-gray-700">
                        <p><strong>State:</strong> {school.State}</p>
                        <p><strong>Street:</strong> {school.Street}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No schools found.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GoogleMaps;
