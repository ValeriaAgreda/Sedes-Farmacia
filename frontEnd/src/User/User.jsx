import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate

import axios from 'axios';
import './User.css'; // Importar el archivo CSS
 
const Usuarios = () => {
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState([]);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [gmail, setGmail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [message, setMessage] = useState('');
 
  // Obtener todos los usuarios
  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:8082/usuario/all');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };
 
  const handleVolver = () => {
    navigate('/MenuAdmin'); // Navega a la página anterior
  };
  useEffect(() => {
    fetchUsuarios();
  }, []);
 
  // Crear nuevo usuario
  const createUsuario = async () => {
    try {
      await axios.post('http://localhost:8082/usuario', { user, password, gmail });
      setMessage('Usuario creado exitosamente');
      fetchUsuarios(); // Actualiza la lista de usuarios
    } catch (error) {
      console.error('Error creando usuario:', error);
      setMessage('Error creando usuario');
    }
  };
 
  // Actualizar un usuario existente
  const updateUsuario = async () => {
    try {
      await axios.put(`http://localhost:8082/usuario/${selectedUserId}`, { user, password, gmail });
      setMessage('Usuario actualizado exitosamente');
      fetchUsuarios(); // Actualiza la lista de usuarios
      setSelectedUserId(null);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      setMessage('Error actualizando usuario');
    }
  };
 
  // Eliminar un usuario (marcar como inactivo)
  const deleteUsuario = async (id) => {
    try {
      await axios.delete(`http://localhost:8082/usuario/${id}`);
      setMessage('Usuario eliminado');
      fetchUsuarios(); // Actualiza la lista de usuarios
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      setMessage('Error eliminando usuario');
    }
  };
 
  // Manejar la selección de usuario para editar
  const handleEdit = (usuario) => {
    setUser(usuario.user);
    setPassword(usuario.password);
    setGmail(usuario.gmail);
    setSelectedUserId(usuario.id);
  };
 
  return (
    <div className="usuarios-container">
      <h1 className="usuarios-title">Gestión de Usuarios</h1>
 
      <div className="usuarios-form">
        <label className="label">Usuario</label>
        <input
          className="input"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Usuario"
        />
 
        <label className="label">Contraseña</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
        />
 
        <label className="label">Correo Electrónico</label>
        <input
          className="input"
          type="email"
          value={gmail}
          onChange={(e) => setGmail(e.target.value)}
          placeholder="Correo"
        />
 
        <button
          className="usuarios-button"
          onClick={selectedUserId ? updateUsuario : createUsuario}
        >
          {selectedUserId ? 'Actualizar Usuario' : 'Crear Usuario'}
        </button>
      </div>
 
      {message && <p className="usuarios-message">{message}</p>}
 
      <h2 className="usuarios-subtitle">Lista de Usuarios</h2>
      <ul className="usuarios-list">
        {usuarios.map((usuario) => (
          <li key={usuario.id} className="usuarios-item">
            <p>{usuario.user} - {usuario.gmail} - {usuario.rol}</p>
            <button className="usuarios-edit-button" onClick={() => handleEdit(usuario)}>
              Editar
            </button>
            <button className="usuarios-delete-button" onClick={() => deleteUsuario(usuario.id)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <button className="volver-btn" onClick={handleVolver}>Volver</button>

    </div>
  );
};
 
export default Usuarios;