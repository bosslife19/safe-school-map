import { useState, useEffect } from 'react';

// Cache object to store API responses
const schoolCache = {};

const useSchools = (zipCode) => {
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!zipCode || zipCode.length !== 5) return;

    // Check cache first
    if (schoolCache[zipCode]) {
      setSchools(schoolCache[zipCode]);
      return;
    }

    const fetchSchools = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.schooldata.com/v1/schools?zip=${zipCode}&api_key=YOUR_API_KEY`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch school data');
        }

        const data = await response.json();
        
        // Transform and validate data
        const validSchools = data
          .filter(school => school.latitude && school.longitude)
          .map(school => ({
            id: school.id,
            name: school.name,
            lat: parseFloat(school.latitude),
            lng: parseFloat(school.longitude),
            address: school.address,
            phone: school.phone,
            website: school.website
          }));

        // Update cache
        schoolCache[zipCode] = validSchools;
        setSchools(validSchools);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching schools:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, [zipCode]);

  return { data: schools, isLoading, error };
};

export default useSchools;
