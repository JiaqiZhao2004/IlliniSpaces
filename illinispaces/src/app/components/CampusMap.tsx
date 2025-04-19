"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix missing default marker icons in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

type Building = {
  BuildingId: string;
  BuildingName: string;
  Latitude: number | null;
  Longitude: number | null;
};

const CampusMap = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const DEFAULT_CENTER: [number, number] = [40.10980366, -88.22723631];

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        error => {
          console.warn("Geolocation not available or denied:", error);
          setUserLocation(DEFAULT_CENTER);
        }
      );
    } else {
      setUserLocation(DEFAULT_CENTER);
    }
  }, []);

  useEffect(() => {
    const fetchBuildings = async () => {
      try {
        const res = await fetch("http://localhost:8080/buildings");
        const data = await res.json();
        if (data.buildings) {
          setBuildings(data.buildings);
        }
      } catch (error) {
        console.error("Failed to fetch buildings:", error);
      }
    };

    fetchBuildings();
  }, []);

  return (
    userLocation && (
    <MapContainer
      center={userLocation}
      zoom={17}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {buildings
        .filter(b => b.Latitude !== null && b.Longitude !== null)
        .map(building => (
          <Marker
            key={building.BuildingId}
            position={[building.Latitude!, building.Longitude!]}
            icon={customIcon}
          >
            <Popup>{building.BuildingName}</Popup>
          </Marker>
        ))}
    </MapContainer>
    )
  );
};

export default CampusMap;