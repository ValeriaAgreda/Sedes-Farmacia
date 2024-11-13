import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuAdmin.css';

export default function MenuAdmin() {
  const navigate = useNavigate();
  const [farmacias, setFarmacias] = useState([]); 
  const [filteredFarmacias, setFilteredFarmacias] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFarmacia, setSelectedFarmacia] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmacias = async () => {
      try {
        const response = await fetch('http://localhost:8082/farmacia/all');
        const data = await response.json();
        setFarmacias(data);
        setFilteredFarmacias(data);
      } catch (error) {
        console.error('Error fetching farmacias:', error);
      }
    };
    fetchFarmacias();
  }, []);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    const filtered = farmacias.filter(farmacia => 
      farmacia.nombre.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredFarmacias(filtered);
  };

  const handleMenu = () => {
    navigate('/Login');
  };

  const handleRegistro = () => {
    navigate('/RegistroFarmacia');
  };

  const handleUsuario = () => {
    navigate('/RegistroUsuario');
  };

  const handleTurno = () => {
    navigate('/Turno');
  };

  const handleEditar = () => {
    if (selectedFarmacia) {
      navigate(`/EditarFarmacia/${selectedFarmacia.id}`); // Redirige con el ID de la farmacia seleccionada
    }
  };

  const handleDeleteConfirmation = () => {
    setShowConfirm(true);
  };

  const handleDeleteFarmacia = async () => {
    if (selectedFarmacia) {
      try {
        const response = await fetch(`http://localhost:8082/farmacia/farmacia/eliminar/${selectedFarmacia.id}`, {
          method: 'PUT',
        });

        if (response.ok) {
          setDeleted(true);
          setShowConfirm(false);
          setFarmacias(farmacias.filter(f => f.id !== selectedFarmacia.id));
          setFilteredFarmacias(filteredFarmacias.filter(f => f.id !== selectedFarmacia.id));
          setSelectedFarmacia(null);
        } else {
          throw new Error('Error al eliminar la farmacia');
        }
      } catch (error) {
        console.error('Error al eliminar farmacia:', error);
        setError('Ocurrió un error al eliminar la farmacia.');
      }
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  const handleSelectFarmacia = (farmacia) => {
    setSelectedFarmacia(farmacia);
  };

  return (
    <div className="container2">
      <h1 className="title2">Menu</h1>

      <div className="buttonContainer2">
        <button
          className="button2"
          onClick={handleDeleteConfirmation}
          disabled={!selectedFarmacia}
        >
          <span className="buttonText2">Eliminar Farmacia</span>
        </button>
        <button
          className="button2"
          onClick={handleEditar}
          disabled={!selectedFarmacia}
        >
          <span className="buttonText2">Editar Datos</span>
        </button>
      </div>
      {/* Mensaje para seleccionar una farmacia */}
      {!selectedFarmacia && (
        <p className="errorMessage">Selecciona una farmacia primero.</p>
      )}
      {showConfirm && (
        <div className="confirmationBox">
          <p>¿Estás seguro de que deseas eliminar esta farmacia?</p>
          <button className="confirmButton" onClick={handleDeleteFarmacia}>
            Sí
          </button>
          <button className="cancelButton" onClick={handleCancelDelete}>
            No
          </button>
        </div>
      )}

      {deleted && <p className="successMessage">Farmacia eliminada correctamente.</p>}
      {error && <p className="errorMessage">{error}</p>}

      <label className="busquedaTitle">Lista Farmacias:</label>
      <input
        placeholder="Busca una Farmacia..."
        value={searchTerm}
        onChange={handleSearch}
        className="input1"
      />
      <div className="listContainer2">
        <div className="header2">
          <span className="headerText2">Nombre</span>
          <span className="headerText2">Razón Social</span>
        </div>

        <div className="list">
          {filteredFarmacias.map(farmacia => (
            <div
              key={farmacia.id}
              className={`listItem2 ${selectedFarmacia?.id === farmacia.id ? 'selected' : ''}`}
              onClick={() => handleSelectFarmacia(farmacia)}
            >
              <span className="listItemText2">{farmacia.nombre}</span>
              <span className="listItemText2">{farmacia.razon_social}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="bottomButton2" onClick={handleTurno}>
        <span className="buttonText2">Gestion de Turnos</span>
      </button>

      <button className="bottomButton2" onClick={handleRegistro}>
        <span className="buttonText2">Registrar Nueva Farmacia</span>
      </button>
      <button className="bottomButton2" onClick={handleUsuario}>
        <span className="buttonText2">Registrar Nuevo Usuario</span>
      </button>

      <button className="homeButton" onClick={handleMenu}>
        <span className="homeButtonText">Cerrar Sesión</span>
      </button>
    </div>
  );
}
