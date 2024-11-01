import React, { useState, useEffect } from 'react';
import MapView from './MapView';
import { Container, Row, Col, Button, Form } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para almacenar los detalles de la farmacia
  const [farmacia, setFarmacia] = useState(null);
  const [fileBase64, setFileBase64] = useState('');
  const [selectedFarmaciaId, setSelectedFarmaciaId] = useState(null); // ID por defecto

  const handleHome = () => {
    navigate('/login');
  };

  // Función para manejar el cambio en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Función para actualizar la ubicación
  const handleActualizarUbicacion = () => {
    setSelectedFarmaciaId(null); // Resetear la selección de farmacia
  };

  // Efecto para cargar los detalles de la farmacia seleccionada
  useEffect(() => {
    const fetchFarmacia = async () => {
      try {
        const response = await fetch(`http://localhost:8082/farmacia/cargarfarmacia/${selectedFarmaciaId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFarmacia(data);

        // Convertir imagen desde binario a base64
        if (data.imagen) {
          const base64String = btoa(
            new Uint8Array(data.imagen.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
          );
          setFileBase64(`data:image/jpeg;base64,${base64String}`);
        } else {
          // Si no hay imagen, limpiar fileBase64
          setFileBase64('');
        }
      } catch (error) {
        console.error('Error al cargar los detalles de la farmacia:', error);
      }
    };

    if (selectedFarmaciaId) { // Solo llamar a la API si hay un ID de farmacia seleccionado
      fetchFarmacia();
    }
  }, [selectedFarmaciaId]); // Se ejecuta cuando selectedFarmaciaId cambia

  return (
    <div className="container1">
      <div className='tituloContainer'>
        <h6>Sedes - Cochabamba</h6>
        <h2>Farmacias Cercanas a Usted</h2>
        <h6>Estamos a tu disposición para ayudarte.</h6>
      </div>

      <input
        placeholder="Buscar Farmacia por nombre"
        value={searchTerm}
        onChange={handleSearchChange}
        className="input1"
      />

      <button className="bottomButton3" onClick={() => setFilter('abiertas')}>
        <span className="buttonText2">Farmacias Legalmente Autorizadas</span>
      </button>

      <button className="bottomButton3" onClick={() => setFilter('sustancias')}>
        <span className="buttonText2">Farmacias Autorizadas para Dispensar Medicamentos Controlados</span>
      </button>

      <button className="bottomButton3" onClick={() => setFilter('turno')}>
        <span className="buttonText2">Farmacias de Turno</span>
      </button>

      <div className='container12'></div>

      <MapView 
        filter={filter} 
        searchTerm={searchTerm} 
        onSelectFarmacia={setSelectedFarmaciaId} // Pasar la función
      />

      <div className='container12'></div>
        
      <button className="loginButton" onClick={handleActualizarUbicacion}>
        <span className="loginButtonText">Actualizar Ubicación</span>
      </button>
      
      {farmacia && (
  <div className="listContainer2" style={{ padding: '20px', width: "550px" }}>
    <h3 style={{ fontSize: "25px", fontWeight: 'bold', margin: '20px' }}>
      {farmacia.nombre} -{' '}
      <span className="text-success">Legal</span>{' '}
    </h3>
    <p className="subtitle1" style={{ fontSize: "20px" }}>Fotografia Referencia:</p>
    {fileBase64 ? (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '30px' }}>
        <img src={fileBase64} alt="Farmacia" style={{ width: '250px', height: '300px', borderRadius: '10px' }} />
      </div>
    ) : (
      <p>No hay imagen disponible para esta farmacia.</p>
    )}
    <p className="subtitle1" style={{ fontSize: "20px" }}>Horarios de Atención:</p>
    <ul className="centered-list">
      {(() => {
        // Definimos el horario base
        const openingTime = 8; // 8 AM

        // Dependiendo del tipo de horario, generamos las horas
        if (farmacia.horario_atencion === '12h') {
          return (
            <>
              <li>Lunes: {openingTime}:00 am - {openingTime}:00 pm</li>
              <li>Martes: {openingTime}:00 am - {openingTime}:00 pm</li>
              <li>Miércoles: {openingTime}:00 am - {openingTime}:00 pm</li>
              <li>Jueves: {openingTime}:00 am - {openingTime}:00 pm</li>
              <li>Viernes: {openingTime}:00 am - {openingTime}:00 pm</li>
              <li>Sábado: {openingTime}:00 am - {openingTime}:00 pm</li>
              <li>Domingo: Cerrado</li>
            </>
          );
        } else if (farmacia.horario_atencion === '24h') {
          return (
            <>
              <li>Lunes: Abierto 24 horas</li>
              <li>Martes: Abierto 24 horas</li>
              <li>Miércoles: Abierto 24 horas</li>
              <li>Jueves: Abierto 24 horas</li>
              <li>Viernes: Abierto 24 horas</li>
              <li>Sábado: Abierto 24 horas</li>
              <li>Domingo: Abierto 24 horas</li>
            </>
          );
        } else {
          // Horario por defecto de 8 horas
          return (
            <>
              <li>Lunes: {openingTime}:00 am - {3}:00 pm</li>
              <li>Martes: {openingTime}:00 am - {3}:00 pm</li>
              <li>Miércoles: {openingTime}:00 am - {3}:00 pm</li>
              <li>Jueves: {openingTime}:00 am - {3}:00 pm</li>
              <li>Viernes: {openingTime}:00 am - {3}:00 pm</li>
              <li>Sábado: {openingTime}:00 am - {3}:00 pm</li>
              <li>Domingo: Cerrado</li>
            </>
          );
        }
      })()}
    </ul>
    <a
      style={{ fontSize: "20px", fontWeight: 'bold', margin: '10px' }}
      href={`https://www.google.com/maps?q=${farmacia.latitud.toString().replace(',', '.')},${farmacia.longitud.toString().replace(',', '.')}`} 
      target="_blank" 
      rel="noopener noreferrer" 
    >
      Abrir Ubicación en Maps
    </a>
  </div>
)}



      <div className="container1">
        <p>¿Tienes una Cuenta?</p>
        <button className="loginButton" onClick={handleHome} style={{ width: "200px" }}>
          <span className="loginButtonText">Iniciar Sesión</span>
        </button>
      </div>
    </div>
  );
}

export default Home;
