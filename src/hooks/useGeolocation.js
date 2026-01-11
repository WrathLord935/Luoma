import { useState, useEffect } from 'react';

export default function useGeolocation() {
    const [location, setLocation] = useState({
        city: null,
        country: null,
        latitude: null,
        longitude: null,
        timestamp: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Use free reverse geocoding API (BigDataCloud - client side free tier)
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const data = await response.json();

                    setLocation({
                        city: data.city || data.locality || 'Unknown Location',
                        country: data.countryCode || data.countryName,
                        latitude,
                        longitude,
                        timestamp: Date.now()
                    });
                    setError(null);
                } catch (err) {
                    setError('Failed to fetch location name');
                    // Fallback to coordinates if API fails
                    setLocation(prev => ({ ...prev, latitude, longitude }));
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            }
        );
    };

    return { location, loading, error, getLocation };
}
