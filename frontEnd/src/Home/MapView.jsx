import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

const MapCenter = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);

    return null; // No renderiza nada
};

const MapView = ({ filter, searchTerm, onSelectFarmacia }) => {
    const [farmacias, setFarmacias] = useState([]);
    const [selectedPosition, setSelectedPosition] = useState(null);

    useEffect(() => {
        const fetchFarmacias = async () => {
            try {
                let url = 'http://localhost:8082/farmacia/all';

                if (filter === 'sustancias') {
                    url = 'http://localhost:8082/farmacia/farmacias-con-sustancias'; 
                }

                const response = await fetch(url);
                const data = await response.json();

                if (response.status !== 200) {
                    console.error('Error en la respuesta:', data.error);
                    return;
                }

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
    }, [filter]);

    // Filtra las farmacias según el término de búsqueda
    const filteredFarmacias = farmacias.filter(farmacia =>
        farmacia.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
        farmacia.latitud !== null && 
        farmacia.longitud !== null
    );

    const cargarFarmacia = async (id, position) => {
        try {
            const response = await fetch(`http://localhost:8082/farmacia/cargarfarmacia/${id}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const farmacia = await response.json();
            onSelectFarmacia(farmacia.id); 
            setSelectedPosition(position); // Actualiza la posición seleccionada para centrar el mapa

        } catch (error) {
            console.error('Error al cargar los detalles de la farmacia:', error);
        }
    };

    return (
        <MapContainer center={[-17.3895, -66.1568]} zoom={13} style={{ 
            height: '500px', 
            width: '100%', 
            borderRadius: '15px',
            overflow: 'hidden' 
        }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredFarmacias.map((farmacia) => (
                <Marker 
                    key={farmacia.id} 
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
                            {farmacia.direccion} {/* Asegúrate de que la dirección también esté disponible */}
                        </div>
                    </Popup>
                </Marker>
            ))}
            <MapCenter position={selectedPosition} />
        </MapContainer>
    );
}

export default MapView;
