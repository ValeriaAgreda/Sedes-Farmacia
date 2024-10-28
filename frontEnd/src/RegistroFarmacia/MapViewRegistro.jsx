import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icono personalizado para el marcador
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41], // Ajusta el tamaño según tu imagen
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],

});




const MapViewRegistro = ({ onLocationSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);

  // Hook para manejar el doble clic en el mapa y dejar un marcador
  const MapClickHandler = () => {
    const map = useMap(); // Obtener referencia al mapa

    useMapEvents({
      dblclick(event) {
        const { lat, lng } = event.latlng;
        setSelectedPosition([lat, lng]);

        // Centrar el mapa en la posición seleccionada
        map.setView([lat, lng], map.getZoom());

        // Pasar la ubicación seleccionada al componente padre (si es necesario)
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      },
    });

    return null;
  };

  return (
    <MapContainer
      center={[-17.3895, -66.1568]} // Centro inicial (por ejemplo, Cochabamba)
      zoom={13}
      style={{ 
        height: '500px', 
        width: '100%', 
        borderRadius: '15px', // Bordes redondeados
        overflow: 'hidden' // Para ocultar el contenido que sobresale
      }}
      doubleClickZoom={false} // Desactivar zoom con doble clic para habilitar el evento de doble clic
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Componente para manejar clics en el mapa */}
      <MapClickHandler />

      {/* Mostrar marcador si se ha seleccionado una ubicación */}
      {selectedPosition && (
        <Marker position={selectedPosition} icon={defaultIcon}>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapViewRegistro;
