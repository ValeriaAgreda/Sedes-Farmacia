import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Definición del ícono del marcador
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

// Componente que centra el mapa en una posición específica
const MapCenter = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            console.log('Centrando el mapa en:', position); // Para depuración
            map.setView(position, map.getZoom());
        }
    }, [position, map]);

    return null; // No renderiza nada
};

// Componente principal del mapa
const MapView = ({ filter, searchTerm, onSelectFarmacia, actualizarUbicacion }) => {
    const [farmacias, setFarmacias] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(null);

    // Función para obtener la fecha actual en el formato correcto
    const getFechaActual = () => {
        const fechaActual = new Date();
        const year = fechaActual.getFullYear();
        const month = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexed
        const day = String(fechaActual.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} 00:00:00`; // Formato YYYY-MM-DD 00:00:00
    };

    // Función para obtener farmacias desde la API
    useEffect(() => {
        const fetchFarmacias = async () => {
            try {
                let url = 'http://localhost:8082/farmacia/all';
                if (filter === 'sustancias') {
                    url = 'http://localhost:8082/farmacia/farmacias-con-sustancias'; 
                } else if (filter === 'turno') {
                    const fecha = getFechaActual(); // Obtener la fecha actual en el formato correcto
                    url = `http://localhost:8082/farmacia/turnosDia/${fecha}`; // Nueva ruta
                }

                const response = await fetch(url);
                const data = await response.json();
                if (response.status !== 200) {
                    console.error('Error en la respuesta:', data.error);
                    return;
                }

                // Convertir coordenadas a números válidos
                const farmaciasConCoordenadas = data.map(farmacia => ({
                    ...farmacia,
                    latitud: farmacia.latitud ? parseFloat(farmacia.latitud.replace(',', '.')) : null,
                    longitud: farmacia.longitud ? parseFloat(farmacia.longitud.replace(',', '.')) : null
                }));

                setFarmacias(farmaciasConCoordenadas);
            } catch (error) {
                console.error('Error al obtener farmacias:', error);
            }
        };

        fetchFarmacias();
    }, [filter, actualizarUbicacion]);

    // Filtrar farmacias según el término de búsqueda
    const filteredFarmacias = farmacias.filter(farmacia =>
        farmacia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        farmacia.latitud !== null && 
        farmacia.longitud !== null
    );

    // Función para cargar los detalles de la farmacia seleccionada y centrar el mapa
    const cargarFarmacia = async (id, position) => {
        try {
            const response = await fetch(`http://localhost:8082/farmacia/cargarfarmacia/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const farmacia = await response.json();
            onSelectFarmacia(farmacia.id); 
            setSelectedPosition(position); // Centra el mapa en la posición seleccionada
            console.log('Farmacia seleccionada:', farmacia); // Para depuración
        } catch (error) {
            console.error('Error al cargar los detalles de la farmacia:', error);
        }
    };

    return (
        <MapContainer 
            center={[-17.3895, -66.1568]} // Posición inicial del mapa
            zoom={13} 
            style={{ 
                height: '500px', 
                width: '100%', 
                borderRadius: '15px',
                overflow: 'hidden' 
            }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredFarmacias.map((farmacia, index) => (
                <Marker 
                    key={`${farmacia.id}-${index}`}  // clave única combinando id e índice
                    position={[farmacia.latitud, farmacia.longitud]} 
                    icon={defaultIcon}
                    eventHandlers={{
                        click: () => {
                            cargarFarmacia(farmacia.id, [farmacia.latitud, farmacia.longitud]);
                        },
                    }}
                >
                    <Popup>
                        <div>
                            <strong>{farmacia.nombre}</strong><br />
                            {farmacia.direccion}
                        </div>
                    </Popup>
                </Marker>
            ))}
            <MapCenter position={selectedPosition} />
        </MapContainer>
    );
}

export default MapView;
