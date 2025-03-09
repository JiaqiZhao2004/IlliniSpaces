"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


// Fix missing default marker icons in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41], // Default Leaflet size
  iconAnchor: [12, 41], // Ensures the icon is positioned correctly
  popupAnchor: [1, -34], // Adjusts popup position
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const CampusMap = () => {

  return (
    <MapContainer
      center={[40.10980366, -88.22723631]} // Replace with your campus coordinates
      zoom={17}
      style={{ height: "80vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[40.10980366, -88.22723631]} icon={customIcon}>
        <Popup>UIUC!</Popup>
      </Marker>
    </MapContainer>
  );
};

export default CampusMap;
