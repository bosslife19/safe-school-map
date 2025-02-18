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
  const [zoom, setZoom] = useState(10)
  
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
    <div className="w-full h-full">
      {!isLoaded ? (
        <h1>Loading...</h1>
      ) : (
        <>
                <GoogleMap
          mapContainerClassName="map-container"
          center={center}
          zoom={zoom}
          onLoad={(map) => setMap(map)}
        >
          {/* <StandaloneSearchBox
            onLoad={(ref) => (inputRef.current = ref)}
            onPlacesChanged={handlePlaceChanged}
          > */}
            <div className="relative ml-48 mt-[10px] w-[500px]">
            <select
  className={`form-control text-black rounded-full bg-white ${style}`}
  value={address}
  onChange={(e) => setAddress(e.target.value)}
>
  <option value="">Select a zip code</option>
  {
    schools?.map((school)=>(
      <>
      <option value={`${school['ZIP Code']}`}>{school['ZIP Code']}</option>

      </>

    ))
  }

</select>

            </div>
            {/* <button onClick={searchZip} className="text-black font-bold z-50">Search zip</button> */}
          {/* </StandaloneSearchBox> */}
          
          <button onClick={searchZip} className="z-50 flex bg-black justify-center items-center p-6 h-[40px] text-white  transition duration-300 rounded-full hover:bg-stone-200 border-2  absolute left-[25%] top-[2%]">
            <span className="text-xs text-white">Search Zip Code</span>
          </button>
          

          {
            !schoolLat && zipCodes.length>0 && zipCodes.map(zipCode=>(
              
                <Marker draggable animation={google.maps.Animation.DROP} onDragEnd={chaangeCoordinate} position={{lat:searchedLat, lng:searchedLng}} />
              
            ))
          }
          {
            schoolLat && (
              <Marker draggable animation={google.maps.Animation.DROP} onDragEnd={chaangeCoordinate} position={{lat:schoolLat, lng:schoolLng}} />
            )
          }

          
          
          <Circle options={{fillColor:'#FF0000', strokeOpacity:0.8, strokeColor:'#FF0000',strokeWeight:2, fillOpacity:0.35}}/>
        </GoogleMap>
        <div className="container mx-auto p-4">
      {/* Grid layout for cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {zipCodes.length > 0 ? (
          zipCodes.map((school, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg border cursor-pointer hover:shadow-xl transition"
              onClick={() => {
                toggleExpand(index); // Toggle the expansion of the clicked card
                fetchLocation(school.Street); // Fetch the location based on the street address
              }}
            >
              {/* Main Card */}
              <div className="p-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {school["School Name"]}
                  </h2>
                  <p className="text-gray-600">{school.City}</p>
                </div>
                {/* Rating */}
                <div className="flex items-center mt-12">
                  {renderStars(school.rating || 0)} {/* Default rating to 0 if not available */}
                </div>
                {/* Expand/Collapse Icon */}
                <span className="text-gray-500 text-xl">
                  {expandedIndex === index ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded Section (Only One Opens at a Time) */}
              {expandedIndex === index && school.Administrator && ( // Check if there's valid data
                <div className="p-4 border-t text-gray-700">
                  <p><span className="font-medium">Administrator:</span> {school.Administrator}</p>
                  <p><span className="font-medium">State:</span> {school.State}</p>
                  <p><span className="font-medium">Street:</span> {school.Street}</p>
                  <p><span className="font-medium">ZIP Code:</span> {school["ZIP Code"]}</p>
                  <p><span className="font-medium">Phone:</span> {school.Phone}</p>
                  {school.Website && (
                    <p>
                      <span className="font-medium">Website:</span>{" "}
                      <a
                        href={school.Website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {school.Website}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No schools found.</p>
        )}
      </div>
    </div>

        </>

      )}
    </div>
  );
}

export default GoogleMaps;
