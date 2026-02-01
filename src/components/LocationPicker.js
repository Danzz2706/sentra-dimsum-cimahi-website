"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function LocationPicker({ storeLocation, onLocationSelect, selectedPosition }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const storeMarker = useRef(null);
    const customerMarker = useRef(null);
    const [distance, setDistance] = useState(0);

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    // Initialize Map
    useEffect(() => {
        if (map.current) return;

        const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
        if (!apiKey) {
            console.error("MapTiler API Key is missing");
            return;
        }

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${apiKey}`,
            center: [storeLocation.lng, storeLocation.lat],
            zoom: 14,
            attributionControl: true
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        // Add Click Listener
        map.current.on('click', (e) => {
            handleCustomerLocationChange(e.lngLat.lat, e.lngLat.lng);
        });

    }, []);

    // Handle Store Location Updates (Branch Switch)
    useEffect(() => {
        if (!map.current || !storeLocation) return;

        // Update Map Center
        map.current.flyTo({
            center: [storeLocation.lng, storeLocation.lat],
            zoom: 14,
            essential: true
        });

        // Update Store Marker
        if (storeMarker.current) storeMarker.current.remove();

        const el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)'; // Fallback or use CSS
        // Simple default marker is fine, but let's color it if possible or use default blue?
        // MapLibre default marker is blue. We can change color.

        storeMarker.current = new maplibregl.Marker({ color: "#ea580c" }) // Orange-600 (Primary)
            .setLngLat([storeLocation.lng, storeLocation.lat])
            .setPopup(new maplibregl.Popup().setHTML("<b>Lokasi Toko</b><br>Sentra Dimsum"))
            .addTo(map.current);

        // Recalculate distance if customer marker exists
        if (customerMarker.current) {
            const lngLat = customerMarker.current.getLngLat();
            updateDistance(storeLocation.lat, storeLocation.lng, lngLat.lat, lngLat.lng);
        }

    }, [storeLocation]);

    // Handle External Selected Position Updates (Search)
    useEffect(() => {
        if (selectedPosition && selectedPosition.lat && selectedPosition.lng) {
            handleCustomerLocationChange(selectedPosition.lat, selectedPosition.lng, false);
            // Fly to it
            if (map.current) {
                map.current.flyTo({
                    center: [selectedPosition.lng, selectedPosition.lat],
                    zoom: 15,
                    essential: true
                });
            }
        }
    }, [selectedPosition]);

    // Reverse Geocoding (Coords -> Address)
    const fetchAddress = async (lat, lng) => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;
            const response = await fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${apiKey}`);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                return data.features[0].place_name;
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        }
        return null;
    };

    const handleCustomerLocationChange = async (lat, lng, emit = true) => {
        if (!map.current) return;

        // Update/Create Marker
        if (customerMarker.current) {
            customerMarker.current.setLngLat([lng, lat]);
        } else {
            customerMarker.current = new maplibregl.Marker({ color: "#2563eb", draggable: true }) // Blue-600
                .setLngLat([lng, lat])
                .addTo(map.current);

            customerMarker.current.on('dragend', async () => {
                const newPos = customerMarker.current.getLngLat();
                await handleCustomerLocationChange(newPos.lat, newPos.lng);
            });
        }

        updateDistance(storeLocation.lat, storeLocation.lng, lat, lng);

        if (emit) {
            const dist = calculateDistance(storeLocation.lat, storeLocation.lng, lat, lng);
            const address = await fetchAddress(lat, lng);

            onLocationSelect({
                lat: lat,
                lng: lng,
                distance: dist,
                address: address // Pass address back to parent
            });
        }
    };

    const updateDistance = (lat1, lon1, lat2, lon2) => {
        const dist = calculateDistance(lat1, lon1, lat2, lon2);
        setDistance(dist);
    };

    return (
        <div className="space-y-2">
            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
                <div ref={mapContainer} className="h-full w-full" />
            </div>

            {distance > 0 ? (
                <div className="text-sm bg-blue-50 p-3 rounded-lg text-blue-800 flex justify-between items-center">
                    <span>Jarak pengiriman:</span>
                    <span className="font-bold">{distance.toFixed(2)} km</span>
                </div>
            ) : (
                <p className="text-xs text-gray-500 text-center italic">Klik pada peta untuk memilih lokasi pengantaran</p>
            )}
        </div>
    );
}
