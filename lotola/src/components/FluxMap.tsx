// src/components/FluxMap.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Commune {
  id: string;
  nom_commune: string;
  lat?: number;   // facultatif pour éviter crash si absent
  lng?: number;
}

interface Mouvement {
  id: string;
  origine_commune: string;
  destination_commune: string;
}

const FluxMap: React.FC<{ communes: Commune[]; mouvements: Mouvement[] }> = ({ communes, mouvements }) => {
  // Indexer les communes par nom pour retrouver leurs coordonnées
  const communeMap = Object.fromEntries(communes.map(c => [c.nom_commune, c]));

  return (
    <MapContainer
      // Kinshasa par défaut
      {...({ center: [-4.325, 15.322], zoom: 12, style: { height: "500px", width: "100%" } } as any)}
    >
      <TileLayer
        {...({ attribution: '&copy; OpenStreetMap', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' } as any)}
      />

      {/* Marqueurs des communes */}
      {communes.map(c => {
        if (typeof c.lat !== "number" || typeof c.lng !== "number") return null;
        return (
          <Marker key={c.id} position={[c.lat, c.lng]}>
            <Popup>{c.nom_commune}</Popup>
          </Marker>
        );
      })}

      {/* Flux entre communes */}
      {mouvements.map(m => {
        const origine = communeMap[m.origine_commune];
        const destination = communeMap[m.destination_commune];
        if (!origine || !destination) return null;
        if (typeof origine.lat !== "number" || typeof origine.lng !== "number") return null;
        if (typeof destination.lat !== "number" || typeof destination.lng !== "number") return null;

        return (
          <Polyline
            key={m.id}
            positions={[
              [origine.lat, origine.lng],
              [destination.lat, destination.lng]
            ]}
            pathOptions={{ color: "blue" }}
          >
            <Popup>
              Flux de {m.origine_commune} vers {m.destination_commune}
            </Popup>
          </Polyline>
        );
      })}
    </MapContainer>
  );
};

export default FluxMap;
