import React, { useState, useEffect } from 'react';
import './Turno.css';
 
const Turno = () => {
  const [farmacias, setFarmacias] = useState([]);
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroMes, setFiltroMes] = useState(''); // Filtro para el mes
  const [zonas, setZonas] = useState([]);
  const [turnos, setTurnos] = useState([]); // Para guardar los turnos generados
  const [turnosExistentes, setTurnosExistentes] = useState(false); // Para verificar si ya hay turnos generados
 
  // Redirigir a la ruta de menú de administración
  const handleMenu = () => {
    navigate('/MenuAdmin');
  };
 
  // Obtener los códigos de zona desde el backend
  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await fetch('http://localhost:8082/codigo/all');
        const data = await response.json();
        setZonas(data);
      } catch (error) {
        console.error('Error fetching zonas:', error);
      }
    };
 
    fetchZonas();
  }, []);
 
  const handleFiltroZonaChange = (e) => {
    setFiltroZona(e.target.value);
    console.log("Zona seleccionada:", e.target.value);  // Verificar valor de zona
  };
 
  const handleFiltroMesChange = (e) => {
    setFiltroMes(e.target.value);
  };
 
  const handleCargarTurnos = async () => {
    if (!filtroZona || !filtroMes) {
      alert('Por favor selecciona una zona y un mes');
      return;
    }
 
    const anioActual = new Date().getFullYear();
 
    try {
      const response = await fetch(`http://localhost:8082/horas/turnosZonaMes/${filtroZona}/${filtroMes}/${anioActual}`);
      const data = await response.json();
 
      if (data.length > 0) {
        setTurnos(data);
        setTurnosExistentes(true);
      } else {
        setTurnos([]);
        setTurnosExistentes(false);
        alert('No se encontraron turnos para la zona y mes seleccionados.');
      }
    } catch (error) {
      console.error('Error verificando turnos existentes:', error);
      alert('Hubo un error al cargar los turnos. Verifica la conexión o la ruta.');
    }
  };
 
  const handleGenerarTurnos = async () => {
    if (!filtroZona) {
        alert('Por favor selecciona una zona');
        return;
    }

    if (turnosExistentes) {
        const confirmar = window.confirm('Ya existen turnos generados para esta zona este mes. ¿Deseas sobrescribirlos?');
        if (!confirmar) return;
    }

    const mesActual = new Date().getMonth() + 1; // Obtener el mes actual (de 1 a 12)

    try {
        const response = await fetch(`http://localhost:8082/codigo/codigofiltro/${filtroZona}`);
        if (!response.ok) {
            throw new Error('Error en la respuesta de red');
        }
        const data = await response.json();
        console.log("Farmacias obtenidas:", data);
        const totalFarmacias = data.length;

        if (totalFarmacias === 0) {
            alert('No se encontraron farmacias para la zona seleccionada');
            return;
        }

        const totalDiasMes = new Date(new Date().getFullYear(), mesActual, 0).getDate();
        let asignacionFarmacias = [];

        // Función para mezclar las farmacias de forma aleatoria y convertirlas en una cola
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        // Crear una cola de farmacias en orden aleatorio
        let colaFarmacias = shuffleArray([...data]);

        // Recorremos cada día del mes y asignamos farmacias de la cola
        for (let dia = 1; dia <= totalDiasMes; dia++) {
            // Si llegamos al final de la cola, volvemos a recorrerla desde el principio
            if (colaFarmacias.length === 0) {
                colaFarmacias = shuffleArray([...data]);  // Reseteamos la cola si ya la hemos recorrido toda
            }

            const farmacia = colaFarmacias.shift();  // Sacamos la primera farmacia de la cola
            asignacionFarmacias.push({
                id: farmacia.id,
                farmacia_nombre: farmacia.farmacia_nombre,
                direccion: farmacia.direccion,
                fecha_turno: `${new Date().getFullYear()}-${mesActual.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`,
                hora_entrada: '08:00:00',
                hora_salida: '20:00:00',
                turno: true
            });
        }

        // Verificar que se generaron turnos
        console.log("Turnos a guardar antes de enviar:", asignacionFarmacias);
        if (asignacionFarmacias.length === 0) {
            alert('No hay turnos para guardar');
            return;
        }

        // Envío de turnos a la API
        const saveResponse = await fetch('http://localhost:8082/horas/guardarTurnos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                farmacias: asignacionFarmacias,
                mesActual: mesActual,
                anioActual: new Date().getFullYear() // Añadir el año actual
            }),
        });

        if (!saveResponse.ok) {
            const text = await saveResponse.text();
            throw new Error(`Error en la respuesta: ${saveResponse.status}, ${text}`);
        }

        const result = await saveResponse.json();
        console.log('Turnos guardados:', result);
        alert('Turnos generados y guardados exitosamente');
    } catch (error) {
        console.error('Error guardando turnos:', error);
        alert('Error al guardar turnos, verifica la conexión o la ruta.');
    }
};




 
  const handleToggleTurno = (index) => {
    const updatedTurnos = [...turnos];
    updatedTurnos[index].turno = !updatedTurnos[index].turno;
    setTurnos(updatedTurnos);
  };
 
  return (
    <div className="turno-container">
      <h1>Gestión Turnos</h1>
      <div className="usuario">Usuario: <span>Ejemplo Nombre</span></div>
 
      <div className="filtro-zona">
        <label htmlFor="filtroZona">Filtrar por Zona:</label>
        <select id="filtroZona" value={filtroZona} onChange={handleFiltroZonaChange}>
          <option value="">Selecciona una zona</option>
          {zonas.map((zona) => (
            <option key={zona.id} value={zona.id}>{zona.nombre}</option>
          ))}
        </select>
      </div>
 
      <div className="filtro-mes">
        <label htmlFor="filtroMes">Filtrar por Mes:</label>
        <select id="filtroMes" value={filtroMes} onChange={handleFiltroMesChange}>
          <option value="">Selecciona un mes</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('es-ES', { month: 'long' })}
            </option>
          ))}
        </select>
      </div>
 
      <button className="cargar-turnos-btn" onClick={handleCargarTurnos}>Cargar Turnos</button>
      <button className="generar-turnos-btn" onClick={handleGenerarTurnos}>Generar Turnos</button>
          
      <h2>Lista Farmacias de Turno</h2>
 
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código Zona</th>
            <th>Dirección</th>
            <th>Fecha Turno</th>
            <th>Turno</th>
          </tr>
        </thead>
        <tbody>
          {turnos.length > 0 ? (
            turnos.map((turno, index) => (
              <tr key={index}>
                <td>{turno.farmacia_nombre}</td>
                <td>{turno.codigo_zona}</td>
                <td>{turno.direccion}</td>
                <td>{turno.dia_turno ? new Date(turno.dia_turno).toLocaleDateString() : 'Fecha no válida'}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={turno.turno}
                    onChange={() => handleToggleTurno(index)}
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No se generaron turnos</td>
            </tr>
          )}
        </tbody>
      </table>
 
      <button className="volver-btn" onClick={handleMenu}>
        <span className="homeButtonText">Volver</span>
      </button>
    </div>
  );
};
 
export default Turno;
 