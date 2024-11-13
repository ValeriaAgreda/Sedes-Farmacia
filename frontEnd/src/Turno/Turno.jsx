import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import './Turno.css';

const Turno = () => {
  const navigate = useNavigate();
  const [farmacias, setFarmacias] = useState([]);
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroMes, setFiltroMes] = useState('');
  const [zonas, setZonas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [turnosExistentes, setTurnosExistentes] = useState(false);

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
  };

  const handleFiltroMesChange = (e) => {
    setFiltroMes(e.target.value);
  };

  const handleVolver = () => {
    navigate('/MenuAdmin'); // Navega a la página anterior
  };

  const handleEmails = async () => {
    try {
      const response = await fetch(`http://localhost:8082/horas/enviarturnos`);
      
      if (!response.ok) {
        throw new Error('Error al enviar los correos');
      }
  
      alert('Correos enviados con éxito');
    } catch (error) {
      console.error('Error enviando correos:', error);
      alert('Hubo un error al enviar los correos');
    }
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
      alert('Hubo un error al cargar los turnos.');
    }
  };

  const handleGenerarTurnos = async () => {
    if (!filtroZona) {
      alert('Por favor selecciona una zona');
      return;
    }
  
    const anioActual = new Date().getFullYear();
    const mesInicio = parseInt(filtroMes);

    try {
      const response = await fetch(`http://localhost:8082/codigo/codigofiltro/${filtroZona}`);
      const data = await response.json();
      const totalFarmacias = data.length;

      console.log(`Total de farmacias obtenidas: ${totalFarmacias}`);
  
      if (totalFarmacias === 0) {
        alert('No se encontraron farmacias para la zona seleccionada');
        return;
      }

      let asignacionFarmacias = [];
      let lastAssignedIndex = 0;
  
      const fetchLastAssignment = await fetch(`http://localhost:8082/horas/ultimaFarmaciaAsignada/${filtroZona}`);
      const lastAssignmentData = await fetchLastAssignment.json();

      let farmaciaOrdenada = [...data];
      if (lastAssignmentData && lastAssignmentData.lastId) {
        const lastFarmaciaId = lastAssignmentData.lastId;
        const lastFarmaciaIndex = farmaciaOrdenada.findIndex(farmacia => farmacia.id === lastFarmaciaId);

        if (lastFarmaciaIndex >= 0) {
          const startIdx = (lastFarmaciaIndex + 1) % farmaciaOrdenada.length;
          farmaciaOrdenada = [
            ...farmaciaOrdenada.slice(startIdx),
            ...farmaciaOrdenada.slice(0, startIdx)
          ];
        }
      } else {
        farmaciaOrdenada = farmaciaOrdenada.sort(() => Math.random() - 0.5);
      }

      const totalDiasMes = new Date(anioActual, mesInicio, 0).getDate();
      let esDivisible = false;
      let cociente = 1;

      if (totalFarmacias % totalDiasMes === 0) {
        esDivisible = true;
        cociente = totalFarmacias / totalDiasMes;
        console.log(`Divisible: Se asignarán ${cociente} farmacias por día.`);
      }

      for (let dia = 1; dia <= totalDiasMes; dia++) {
        if (esDivisible) {
          for (let i = 0; i < cociente; i++) {
            if (lastAssignedIndex >= farmaciaOrdenada.length) lastAssignedIndex = 0;
            const farmacia = farmaciaOrdenada[lastAssignedIndex];
  
            asignacionFarmacias.push({
              id: farmacia.id,
              nombre: `Turno ${dia}`,
              farmacia_nombre: farmacia.nombre,
              direccion: farmacia.direccion,
              dia_turno: `${anioActual}-${mesInicio.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`,
              hora_entrada: '08:00:00',
              hora_salida: '20:00:00',
              turno: true
            });
  
            lastAssignedIndex++;
          }
        } else {
          if (lastAssignedIndex >= farmaciaOrdenada.length) lastAssignedIndex = 0;
          const farmacia = farmaciaOrdenada[lastAssignedIndex];
  
          asignacionFarmacias.push({
            id: farmacia.id,
            nombre: `Turno ${dia}`,
            farmacia_nombre: farmacia.nombre,
            direccion: farmacia.direccion,
            dia_turno: `${anioActual}-${mesInicio.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`,
            hora_entrada: '08:00:00',
            hora_salida: '20:00:00',
            turno: true
          });
  
          lastAssignedIndex++;
        }
      }

      const saveResponse = await fetch('http://localhost:8082/horas/guardarTurnos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          farmacias: asignacionFarmacias,
          mesActual: mesInicio,
          anioActual,
          lastAssignedId: asignacionFarmacias[asignacionFarmacias.length - 1].id
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
      alert('Error al guardar turnos.');
    }
  };
  
  return (
    <div className="turno-container">
      <h1>Gestión Turnos</h1>
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
      <button className="cargar-turnos-btn" onClick={handleEmails}>Mandar Gmails</button>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Fecha de Turno</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno) => (
            <tr key={turno.id}>
              <td>{turno.farmacia_nombre}</td>
              <td>{turno.direccion}</td>
              <td>{new Date(turno.dia_turno).toLocaleDateString('es-ES')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="volver-btn" onClick={handleVolver}>Volver</button>
    </div>
  );
};

export default Turno;
