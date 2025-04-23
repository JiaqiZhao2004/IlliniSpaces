"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default marker icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Different marker icon for nearest buildings
const highlightIcon = new L.Icon({
  iconUrl: "pin.png", // green variant
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

type NearestBuilding = {
  BuildingId: string;
  BuildingName: string;
  DistanceKm: number;
  FreeRoomCount: number;
  Latitude: string;
  Longitude: string;
};

const CampusMap = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestBuids, setNearestBuids] = useState<NearestBuilding[]>([]);
  const DEFAULT_CENTER: [number, number] = [40.10980366, -88.22723631];

  useEffect(() => {
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
      <div>
        <button
          onClick={async () => {
            if (!userLocation) return;

            const now = new Date();
            const timeString = now.toTimeString().slice(0, 5);
            const dateString = now.toISOString().slice(0, 10);

            const lat = Math.trunc(userLocation[0] * 1e7) / 1e7;
            const lng = Math.trunc(userLocation[1] * 1e7) / 1e7;

            const queryParams = new URLSearchParams({
              lat: lat.toString(),
              lng: lng.toString(),
              date: dateString,
              time: timeString,
            });

            try {
              const res = await fetch(`http://localhost:8080/nearestBuildings?${queryParams}`);
              const data = await res.json();
              setNearestBuids(data);
              console.log(data);
            } catch (err) {
              console.error("Error fetching nearest rooms:", err);
            }
          }}
          className="mt-4 p-2 bg-green-600 text-white rounded"
        >
          Find Nearby Available Rooms
        </button>

        {/* Show buttons for each nearby building */}
        {nearestBuids.length > 0 && (
          <div className="my-4 flex flex-wrap gap-2">
            {nearestBuids.map(nb => (
              <button
                key={nb.BuildingId}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                {nb.BuildingName} ({nb.FreeRoomCount} free)
              </button>
            ))}
          </div>
        )}

        <MapContainer center={userLocation} zoom={17} style={{ height: "80vh", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Render normal building markers */}
          {buildings
          .filter(b => b.Latitude !== null && b.Longitude !== null)
          .map(building => {
            const nearest = nearestBuids.find(nb => nb.BuildingId === building.BuildingId);
            return (
              <Marker
                key={building.BuildingId}
                position={[building.Latitude!, building.Longitude!]}
                icon={nearest ? highlightIcon : customIcon}
              >
                <Popup>
                  {building.BuildingName}
                  {nearest && (
                    <div className="mt-1 text-sm">
                      ({nearest.FreeRoomCount} free rooms)
                    </div>
                  )}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    )
  );
};

export default CampusMap;