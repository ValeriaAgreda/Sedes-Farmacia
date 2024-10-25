import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuAdmin.css'; // Importa el archivo CSS

export default function MenuAdmin() {
  const navigate = useNavigate();
  const [farmacias, setFarmacias] = useState([]); // Estado para almacenar las farmacias
  const [filteredFarmacias, setFilteredFarmacias] = useState([]); // Estado para las farmacias filtradas
  const [searchTerm, setSearchTerm] = useState(''); // Estado para la entrada de búsqueda
  const [selectedFarmacia, setSelectedFarmacia] = useState(null); // Estado para manejar la farmacia seleccionada
  const [showConfirm, setShowConfirm] = useState(false); // Estado para mostrar la confirmación de eliminación
  const [deleted, setDeleted] = useState(false); // Estado para saber si se eliminó la farmacia
  const [error, setError] = useState(null); // Estado para manejar errores

  useEffect(() => {
    // Cargar las farmacias al montar el componente
    const fetchFarmacias = async () => {
      try {
        const response = await fetch('http://localhost:8082/farmacia/all');
        const data = await response.json();
        setFarmacias(data); // Guardar farmacias en el estado
        setFilteredFarmacias(data); // Inicialmente, las farmacias filtradas son las mismas que todas las farmacias
      } catch (error) {
        console.error('Error fetching farmacias:', error);
      }
    };

    fetchFarmacias();
  }, []);

  // Función para manejar la búsqueda de farmacias
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value); // Actualiza el término de búsqueda

    // Filtrar farmacias según el término de búsqueda
    const filtered = farmacias.filter(farmacia => 
      farmacia.nombre.toLowerCase().includes(value.toLowerCase()) // Compara sin distinción de mayúsculas
    );

    setFilteredFarmacias(filtered); // Actualiza la lista filtrada
  };

  const handleMenu = () => {
    navigate('/Login');
  };

  const handleRegistro = () => {
    navigate('/registro-farmacia');
  };

  const handleEditar = () => {
    if (selectedFarmacia) {
      navigate(`/editar-farmacia/${selectedFarmacia.id}`); // Redirige con la ID de la farmacia seleccionada
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
          setFarmacias(farmacias.filter(f => f.id !== selectedFarmacia.id)); // Eliminar la farmacia de la lista
          setFilteredFarmacias(filteredFarmacias.filter(f => f.id !== selectedFarmacia.id)); // Eliminar de la lista filtrada
          setSelectedFarmacia(null); // Resetear la selección
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

  // Función para seleccionar una farmacia
  const handleSelectFarmacia = (farmacia) => {
    setSelectedFarmacia(farmacia);
  };

  return (
    <div className="container2">
      <h1 className="title2">Menu</h1>

      <label className="nameLabel2">Nombre:</label>
      <div className="userName2">Ejemplo Nombre</div>

      



      <div className="buttonContainer2">
        <button
          className="button2"
          onClick={handleDeleteConfirmation}
          disabled={!selectedFarmacia} // Deshabilita si no hay farmacia seleccionada
        >
          <span className="buttonText2">Eliminar Farmacia</span>
        </button>
        <button
          className="button2"
          onClick={handleEditar}
          disabled={!selectedFarmacia} // Deshabilita si no hay farmacia seleccionada
        >
          <span className="buttonText2">Editar Datos</span>
        </button>
      </div>

      {/* Confirmación de eliminación lógica */}
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

      {/* Mostrar mensaje de éxito o error */}
      {deleted && <p className="successMessage">Farmacia eliminada correctamente.</p>}
      {error && <p className="errorMessage">{error}</p>}



      <label className="busquedaTitle">Lista Farmacias:</label>
      <input
        placeholder="Busca una Farmacia..."
        value={searchTerm}
        onChange={handleSearch} // Actualiza la búsqueda
        className="input1" // Agrega una clase para estilos
      />
      <div className="listContainer2">
        {/* Encabezado */}
        <div className="header2">
          <span className="headerText2">Nombre</span>
          <span className="headerText2">Razón Social</span>
        </div>

        {/* Lista filtrada */}
        <div className="list">
          {filteredFarmacias.map(farmacia => (
            <div
              key={farmacia.id}
              className={`listItem2 ${selectedFarmacia?.id === farmacia.id ? 'selected' : ''}`}
              onClick={() => handleSelectFarmacia(farmacia)} // Seleccionar farmacia
            >
              <span className="listItemText2">{farmacia.nombre}</span>
              <span className="listItemText2">{farmacia.razon_social}</span>
            </div>
          ))}
        </div>
      </div>

      <button className="bottomButton2">
        <span className="buttonText2">Gestion de Turnos</span>
      </button>
      <button className="bottomButton2" onClick={handleRegistro}>
        <span className="buttonText2">Registrar Nueva Farmacia</span>
      </button>
      <button className="bottomButton2">
        <span className="buttonText2">Registrar Nuevo Usuario</span>
      </button>

      <button className="homeButton" onClick={handleMenu}>
        <span className="homeButtonText">Cerrar Sesión</span>
      </button>
    </div>
  );
}
