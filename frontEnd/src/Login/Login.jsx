import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Cambia useHistory por useNavigate
import axios from 'axios'; // Importa Axios
import './Login.css';
 
export default function Login() {
  const navigate = useNavigate(); // Inicializa useNavigate
  const [user, setUser] = useState(''); // Estado para el usuario
  const [password, setPassword] = useState(''); // Estado para la contraseña
  const [error, setError] = useState(''); // Estado para manejar errores
 
  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:8082/usuario/login', { user, password });
      console.log(response.data);
      // Si el inicio de sesión es exitoso, redirige al menú de administración
      navigate('/MenuAdmin');
    } catch (error) {
      if (error.response) {
        // Si la respuesta de error es del servidor
        setError(error.response.data.error);
      } else {
        // Otros errores
        setError('Error al intentar iniciar sesión');
      }
    }
  };

  const handleVolver = () => {
    navigate('/'); // Navega a la página anterior
  };
 
  // Función para redirigir a la página de recuperación de contraseña
  const handleForgotPassword = () => {
    navigate('/Contrasenia'); // Redirige a la ventana de recuperación de contraseña
  };
 
  return (
    <div className="container">
      <h1 className="title">Inicio de Sesión</h1>
 
      <label className="label">Usuario</label>
      <input
        className="input"
        placeholder=""
        value={user}
        onChange={(e) => setUser(e.target.value)} // Actualiza el estado del usuario
      />
 
      <label className="label">Contraseña</label>
      <input
        className="input"
        placeholder=""
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)} // Actualiza el estado de la contraseña
      />
 
      {error && <div className="error-message">{error}</div>} {/* Muestra mensaje de error si hay */}
 
      {/* Añadir redirección a la página de recuperación de contraseña */}
      <button className="forgotPassword" onClick={handleForgotPassword}>
        ¿Olvidaste tu contraseña?
      </button>
 
      <button className="loginButton" onClick={handleLogin}>
        <span className="loginButtonText">Iniciar sesión</span>
      </button>

      <button className="volver-btn" onClick={handleVolver}>Volver</button>

    </div>
  );
}
 