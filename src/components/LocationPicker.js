"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Lokasi Pengiriman</Popup>
        </Marker>
    );
}

export default function LocationPicker({ storeLocation, onLocationSelect, selectedPosition }) {
    // Default to store location if no position selected yet
    const [position, setPosition] = useState(null);
    const [distance, setDistance] = useState(0);

    // Sync with external selectedPosition (e.g. from geocoding)
    useEffect(() => {
        if (selectedPosition && selectedPosition.lat && selectedPosition.lng) {
            setPosition(selectedPosition);
        }
    }, [selectedPosition]);

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    useEffect(() => {
        if (position && storeLocation) {
            const dist = calculateDistance(
                storeLocation.lat,
                storeLocation.lng,
                position.lat,
                position.lng
            );
            setDistance(dist);
            onLocationSelect({
                lat: position.lat,
                lng: position.lng,
                distance: dist
            });
        }
    }, [position, storeLocation]);

    // Center map on position or store initially
    const center = useMemo(() => {
        if (position) return [position.lat, position.lng];
        return [storeLocation.lat, storeLocation.lng];
    }, [storeLocation, position]);

    // Fly to position when it changes
    function MapUpdater({ center }) {
        const map = useMapEvents({});
        useEffect(() => {
            map.flyTo(center, map.getZoom());
        }, [center, map]);
        return null;
    }

    return (
        <div className="space-y-2">
            <div className="h-[300px] w-full rounded-lg overflow-hidden border border-gray-300 relative z-0">
                <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                    <MapUpdater center={center} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Store Marker */}
                    <Marker position={center}>
                        <Popup>Lokasi Toko (Sentra Dimsum)</Popup>
                    </Marker>

                    {/* Customer Marker */}
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>

            {position ? (
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
