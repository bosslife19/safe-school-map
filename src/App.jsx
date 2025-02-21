import React, { useEffect } from "react";
import GoogleMaps from "./components/GoogleMap";
import { useState } from "react";
import "./index.css";
import axios from "axios";
import logo from "../src/assets/safelogo.png";
function App() {
  const [form, setForm] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    radius: 500,
  });
  const [latitude, setLatitude] = useState(37.0902);
  const [longitude, setLongitude] = useState(-95.7129);
  const [address, setAddress] = useState();
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    const getSchools = async () => {
      const res = await axios.get("/data/schooldata.json");
      setSchools(res.data);
    };

    getSchools();
  }, []);
  return (
    <>
    <div className="relative">
    <div className="z-50 absolute left-[50%] top-[-1%] hidden md:block">
    <img src={logo} alt="" className="w-[180px] h-[100px] object-contain" />
    </div>
     <div className="flex flex-col">
     <div className="w-[100%] h-screen">
        <GoogleMaps
          style="w-[50%] px-4 py-2 border-b-[1px] border-[#E5E5E3]"
          address={address}
          setAddress={setAddress}
          radius={form.radius}
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          schools={schools}
        />
      </div>
    
     </div>

    </div>
    
    </>
  );
}

export default App;
