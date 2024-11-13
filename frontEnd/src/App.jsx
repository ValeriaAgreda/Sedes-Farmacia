import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home/Home'; 
import Turno from './Turno/Turno'; 
import Login from './Login/Login'; 
import MenuAdmin from './MenuAdmin/MenuAdmin'; 
import RegistroFarmacia from './RegistroFarmacia/RegistroFarmacia'; 
import Contrasenia from './Contrasenia'; 
import User from './User/User'; 
import EditarFarmacia from './ActualizarFarmacia/EditarFarmacia'; 


import './App.css';

function App() {
  const [farmacias, setFarmacias] = useState([]);  
  const [horas, setHoras] = useState([]);          
  const [selectedFarmacia, setSelectedFarmacia] = useState(null); 

  useEffect(() => {
    fetch('http://localhost:8082/farmacia/all')
      .then((response) => response.json())
      .then((data) => {
        console.log('Farmacias:', data);
        setFarmacias(data);
      })
      .catch((error) => console.error('Error fetching farmacias:', error));
  }, []);

  const fetchHoras = (id) => {
    console.log('Fetching horas for farmacia ID:', id);
    fetch(`http://localhost:8082/farmacia/${id}/horas`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Horas obtenidas:', data);
        setHoras(data);
      })
      .catch((error) => console.error('Error fetching horas:', error));
  };

  const handleFarmaciaClick = (id) => {
    setSelectedFarmacia(id);
    fetchHoras(id);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Turno" element={<Turno />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/MenuAdmin" element={<MenuAdmin />} />
        <Route path="/RegistroFarmacia" element={<RegistroFarmacia />} />
        <Route path="/Contrasenia" element={<Contrasenia />} />
        <Route path="/RegistroUsuario" element={<User />} />
        <Route path="/EditarFarmacia/:id" element={<EditarFarmacia />} /> {/* Ruta con parámetro id */}
      </Routes>
    </Router>
  );
}

export default App;
