import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41], // Ajusta el tamaño según tu imagen
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Función para convertir coordenadas al formato correcto
const convertCoordinates = (lat, lng) => {
  const formattedLat = lat.toString().replace(',', '.'); // Asegúrate de convertir a string
  const formattedLng = lng.toString().replace(',', '.'); // Asegúrate de convertir a string
  return [parseFloat(formattedLat), parseFloat(formattedLng)];
};

const MapView = ({ data, searchTerm, onLocationSelect, initialLat, initialLng }) => {
  const defaultPosition = [-17.3895, -66.1568]; // Coordenadas predeterminadas
  const [selectedPosition, setSelectedPosition] = useState(
    initialLat && initialLng ? convertCoordinates(initialLat, initialLng) : defaultPosition
  );

  // Componente para centrar el mapa cuando cambian las coordenadas iniciales
  const CenterMap = ({ lat, lng }) => {
    const map = useMap(); // Obtener el mapa actual
    useEffect(() => {
      if (lat && lng) {
        const [convertedLat, convertedLng] = convertCoordinates(lat, lng);
        map.setView([convertedLat, convertedLng], 13); // Centramos el mapa
      }
    }, [lat, lng, map]);
    return null;
  };

  // Hook para manejar el doble clic en el mapa y dejar un marcador
  const MapClickHandler = () => {
    useMapEvents({
      dblclick(event) {
        const { lat, lng } = event.latlng;
        setSelectedPosition([lat, lng]);

        // Pasar la ubicación seleccionada al componente padre
        if (onLocationSelect) {
          onLocationSelect(lat, lng);
        }
      },
    });

    return null;
  };

  useEffect(() => {
    // Actualizar el marcador si initialLat e initialLng cambian
    if (initialLat && initialLng) {
      setSelectedPosition(convertCoordinates(initialLat, initialLng));
    }
  }, [initialLat, initialLng]);

  // Filtrado de datos basado en el término de búsqueda
  const filteredData = data.filter(item => {
    const propertyToFilter = item.property; // Cambia esto a la propiedad que estás usando para filtrar
    return propertyToFilter && propertyToFilter.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <MapContainer
      center={selectedPosition} // Usar la posición seleccionada o la predeterminada
      zoom={13}
      style={{ 
        height: '500px', 
        width: '100%', 
        borderRadius: '15px', // Bordes redondeados
        overflow: 'hidden' // Para ocultar el contenido que sobresale
      }}
      doubleClickZoom={false} // Desactivar zoom con doble clic
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapClickHandler />

      {/* Centramos el mapa al recibir las coordenadas iniciales */}
      <CenterMap lat={initialLat} lng={initialLng} />

      {/* Mostrar el marcador si hay una posición seleccionada */}
      {selectedPosition && <Marker position={selectedPosition} icon={defaultIcon} />}

      {/* Mostrar marcadores para los datos filtrados */}
      {filteredData.map(item => (
        <Marker 
          key={item.id} 
          position={[item.latitude, item.longitude]} 
          icon={defaultIcon} 
        />
      ))}
    </MapContainer>
  );
};

export default MapView;
