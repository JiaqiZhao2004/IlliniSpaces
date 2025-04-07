"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export function Favorites() {
  const { getToken } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:8080/favorites", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch favorites");

        const data = await res.json();
        setFavorites(data.favorites);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [getToken]);

  return (
    <div className="max-w-2xl mx-auto flex flex-col mt-10">
      <h1 className="text-3xl font-bold mb-8 text-left">Favorites</h1>

      {loading ? (
        <p>Loading...</p>
      ) : favorites.length === 0 ? (
        <p>No favorite buildings yet.</p>
      ) : (
        <ul className="space-y-4">
          {favorites.map((buildingId) => (
            <li key={buildingId} className="p-4 border rounded shadow-sm">
              <p className="text-lg font-semibold">Building ID: {buildingId}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
