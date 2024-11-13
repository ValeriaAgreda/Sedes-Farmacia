import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegistroFarmacia.css';
import MapViewRegistro from './MapViewRegistro';

const RegistroFarmacia = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleMenu = () => {
    navigate('/MenuAdmin');
  };

  // Estados para los datos de los pickers
  const [zonas, setZonas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [categoriasEstablecimiento, setCategoriasEstablecimiento] = useState([]);
  const [codigosZona, setCodigosZona] = useState([]);

  // Estados del formulario
  const [nombreFarmacia, setNombreFarmacia] = useState('');
  const [categoriaEstablecimiento, setCategoriaEstablecimiento] = useState('');
  const [nroResolucion, setNroResolucion] = useState('');

  const hoy = new Date().toISOString().split('T')[0];
  const [fechaResolucion, setFechaResolucion] = useState(hoy);

  const [departamento, setDepartamento] = useState('Cochabamba');
  const [municipio, setMunicipio] = useState('Sacaba');
  const [zona, setZona] = useState('');
  const [codigozona, setCodigoZona] = useState('');
  const [red, setRed] = useState('');
  const [sector, setSector] = useState('');
  const [direccion, setDireccion] = useState('');
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);

  const handleLocationSelect = (lat, lng) => {
    setLatitud(lat);
    setLongitud(lng);
  };

  const [nombre, setNombre] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [ci, setCi] = useState('');
  const [nit, setNit] = useState('');
  const [celular, setCelular] = useState('');
  const [gmail, setGmail] = useState('');

  const [horasFarmacia, setHorasFarmacia] = useState('8h');
  const [tipoFarmacia, setTipoFarmacia] = useState('Privada');
  const [obs, setObs] = useState('');
  const [medicamentosControlados, setMedicamentosControlados] = useState('');
  const [fileBase64, setFileBase64] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxFileSize = 5 * 1024 * 1024; // 5 MB
  
    if (file && file.size <= maxFileSize) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 1000; // Ancho máximo para la imagen redimensionada
          const maxHeight = 1000; // Alto máximo para la imagen redimensionada
          let width = img.width;
          let height = img.height;
  
          // Redimensionar si es necesario
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
  
          // Redibujar la imagen en el canvas redimensionado
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
  
          // Convertir el canvas a base64
          const base64Image = canvas.toDataURL('image/jpeg', 0.8); // Calidad de compresión de 80%
          setFileBase64(base64Image);
        };
      };
      reader.readAsDataURL(file);
    } else {
      alert('El archivo es demasiado grande. Por favor selecciona una imagen de hasta 5 MB.');
    }
  };
  

  // Cargar datos para los pickers al montar el componente
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [zonasRes, sectoresRes, categoriasRes, codigosRes] = await Promise.all([
          fetch('http://localhost:8082/farmacia/zonas'),
          fetch('http://localhost:8082/farmacia/sectores'),
          fetch('http://localhost:8082/farmacia/categorias'),
          fetch('http://localhost:8082/farmacia/codigoszonas')
        ]);

        const zonasData = await zonasRes.json();
        const sectoresData = await sectoresRes.json();
        const categoriasData = await categoriasRes.json();
        const codigosData = await codigosRes.json();

        setZonas(zonasData);
        setSectores(sectoresData);
        setCategoriasEstablecimiento(categoriasData);
        setCodigosZona(codigosData);
      } catch (error) {
        console.error('Error fetching data for pickers:', error);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async () => {
    // Validaciones

    console.log('Valor de horasFarmacia:', horasFarmacia);
    const missingFields = [];
    
    if (!nombreFarmacia) missingFields.push('Nombre Farmacia');
    if (!nroResolucion) missingFields.push('Nro Resolución');
    if (!direccion) missingFields.push('Dirección');
    if (!nombre) missingFields.push('Nombre Propietario');
    if (!apellidoPaterno) missingFields.push('Apellido Paterno');
    if (!apellidoMaterno) missingFields.push('Apellido Materno');
    if (!ci) missingFields.push('Carnet de Identidad');
    if (!nit) missingFields.push('NIT');
    
    if (!celular) missingFields.push('Celular');

    if (!gmail) missingFields.push('Gmail');
    if (!medicamentosControlados) missingFields.push('Selecciona Medicamentos Controlados');
    if (!fileBase64) missingFields.push('Imagen (debe cargarse un archivo)');
    if (latitud === null || longitud === null) missingFields.push('Ubicación (debe hacer doble clic en el mapa)');
    
    if (missingFields.length > 0) {
      setError(`Por favor, complete los siguientes campos: ${missingFields.join(', ')}`);
      return;
    } else {
      setError(''); // Limpia el error si todas las validaciones pasan
    }

    const farmaciaData = {
      nombre: nombreFarmacia,
      numero_registro: nroResolucion,
      direccion: direccion,
      latitud: latitud,
      longitud: longitud,
      fecha_registro: fechaResolucion,
      razon_social: nombre,
      nit: nit,
      zona_id: zona.id || 1,
      
      tipo: tipoFarmacia,
      
      codigo_id: codigozona.id || 1,
      imagen: fileBase64,
      nombreDueno: nombre,
      primer_apellido: apellidoPaterno,
      segundo_apellido: apellidoMaterno,
      carnet_identidad: ci,
      celular: celular,
      horario_atencion: horasFarmacia,
      gmail: gmail,
    };

    console.log("Datos enviados al backend:", farmaciaData);

    try {
      const response = await fetch('http://localhost:8082/farmacia/nuevafarmacia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(farmaciaData)
      });

      console.log('Response status:', response.status);
      const responseData = await response.text();
      console.log('Response data:', responseData);

      if (response.ok) {
        const result = JSON.parse(responseData);
        const farmaciaId = result.id;

        if (medicamentosControlados === 'Estupefacientes') {
          const sustanciasData = {
            farmacia_id: farmaciaId,
            sustancia_id: 1
          };

          const sustanciasResponse = await fetch('http://localhost:8082/farmacia/farmacia_sustancias', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(sustanciasData)
          });

          if (sustanciasResponse.ok) {
            console.log('Relación de farmacia con sustancias controladas registrada');
          } else {
            console.error('Error al registrar la relación en farmacia_sustancias');
          }
        }
        if (medicamentosControlados === 'Psicotrópicos') {
          const sustanciasData = {
            farmacia_id: farmaciaId,
            sustancia_id: 2
          };

          const sustanciasResponse = await fetch('http://localhost:8082/farmacia/farmacia_sustancias', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(sustanciasData)
          });

          if (sustanciasResponse.ok) {
            console.log('Relación de farmacia con sustancias controladas registrada');
          } else {
            console.error('Error al registrar la relación en farmacia_sustancias');
          }
        }
        if (medicamentosControlados === 'Ambos') {
          const sustanciasData = {
            farmacia_id: farmaciaId,
            sustancia_id: 3
          };

          const sustanciasResponse = await fetch('http://localhost:8082/farmacia/farmacia_sustancias', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(sustanciasData)
          });

          if (sustanciasResponse.ok) {
            console.log('Relación de farmacia con sustancias controladas registrada');
          } else {
            console.error('Error al registrar la relación en farmacia_sustancias');
          }
        }

        alert('Farmacia registrada exitosamente con ID: ' + farmaciaId);
        navigate('/MenuAdmin');
      } else {
        alert('Error al registrar la farmacia');
      }
    } catch (error) {
      console.error('Error en la solicitud de registro de farmacia:', error);
      alert('Ocurrió un error al registrar la farmacia.');
    }
  };

  
  
  
  

  return (
    <div className="container1">
      <h1 className="title1">Registro Farmacia</h1>

      <h2 className="subtitle1">Datos Farmacia:</h2>
      
      <label className="label1">Nombre Farmacia:</label>
      <input
        placeholder="Nombre Farmacia"
        value={nombreFarmacia}
        onChange={(e) => setNombreFarmacia(e.target.value)}
        className="input1"
      />
      
      
      
      <label className="label1">Nro Resolución:</label>
      <input
        placeholder="Nro Resolución"
        value={nroResolucion}
        onChange={(e) => setNroResolucion(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Fecha Resolución:</label>
      <input
        type="date"
        value={fechaResolucion}
        onChange={(e) => setFechaResolucion(e.target.value)}
        className="input1"
      />

      
      <h2 className="subtitle1">Dirección Farmacia:</h2>
      
      
      
      <label className="label1">Zona:</label>
<select
  value={zona.id} // Aquí seleccionas por id
  onChange={(e) => {
    const selectedZona = zonas.find(z => z.id === parseInt(e.target.value));
    setZona(selectedZona); // Guardas el objeto completo con el id y nombre
  }}
  className="picker1"
>
  {zonas.map((zona) => (
    <option key={zona.id} value={zona.id}>{zona.nombre}</option> // El valor es el id, pero se muestra el nombre
  ))}
</select>

<label className="label1">Codigo Zona:</label>
<select
  value={codigozona.id} // Seleccionas por id
  onChange={(e) => {
    const selectedCodigo = codigosZona.find(c => c.id === parseInt(e.target.value));
    setCodigoZona(selectedCodigo); // Guardas el objeto completo
  }}
  className="picker1"
>
  {codigosZona.map((codigo) => (
    <option key={codigo.id} value={codigo.id}>{codigo.nombre}</option> // El valor es el id, pero se muestra el nombre
  ))}
</select>

      
      
      
      
      <label className="label1">Dirección:</label>
      <input
        placeholder="Dirección"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        className="input1"
      />

      <h2 className="subtitle1">Seleccionar Ubicación:</h2>
      <MapViewRegistro onLocationSelect={handleLocationSelect} />



      

      <h2 className="subtitle1">Cargar Imagen</h2>

      {fileBase64 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <img src={fileBase64} alt="Archivo Cargado" style={{ width: '200px', height: '200px', borderRadius: '10px' }} />
        </div>
      )}

      <div className="button-group" style={{ display: 'flex', justifyContent: 'center' }}>
        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} id="file-input" />
        <label htmlFor="file-input" className="bottomButton2" style={{ textAlign: 'center' }}>
          <span className="buttonText2">Abrir Galería</span>
        </label>
      </div>

      <h2 className="subtitle1">Datos Propietario:</h2>
      
      <label className="label1">Nombre:</label>
      <input
        placeholder="Nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Apellido Materno:</label>
      <input
        placeholder="Apellido Materno"
        value={apellidoMaterno}
        onChange={(e) => setApellidoMaterno(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Apellido Paterno:</label>
      <input
        placeholder="Apellido Paterno"
        value={apellidoPaterno}
        onChange={(e) => setApellidoPaterno(e.target.value)}
        className="input1"
      />
      
      <label className="label1">CI:</label>
      <input
        placeholder="CI"
        value={ci}
        onChange={(e) => setCi(e.target.value)}
        className="input1"
      />
      
      <label className="label1">NIT:</label>
      <input
        placeholder="NIT"
        value={nit}
        onChange={(e) => setNit(e.target.value)}
        className="input1"
      />
      
      <label className="label1">Celular:</label>
      <input
        placeholder="Celular"
        value={celular}
        onChange={(e) => setCelular(e.target.value)}
        className="input1"
      />

      <label className="label1">Gmail:</label>
      <input
        placeholder="Gmail"
        value={gmail}
        onChange={(e) => setGmail(e.target.value)}
        className="input1"
      />
      
      <h2 className="subtitle1">Datos Farmacia:</h2>
      <label className="label1">Horas de Farmacia:</label>
      <select
        value={horasFarmacia}
        onChange={(e) => setHorasFarmacia(e.target.value)}
        className="picker1"
      >
        <option value="8h">8h</option>
        <option value="12h">12h</option>
        <option value="24h">24h</option>
      </select>
      
      <label className="label1">Tipo de Farmacia:</label>
      <select
        value={tipoFarmacia}
        onChange={(e) => setTipoFarmacia(e.target.value)}
        className="picker1"
      >
        <option value="Privada">Privada</option>
        <option value="Pública">Pública</option>
        <option value="Seguridad Social">Seguridad Social</option>
        <option value="Distribuidora de Medicamentos">Distribuidora de Medicamentos</option>
      </select>
      
      

      <div className="checkboxContainer11">
  <div className="checkboxContainer1">
    <label className="label1">Medicamentos Controlados</label>
    <div className="checkboxWrapper1">
      <input
        type="checkbox"
        checked={medicamentosControlados === 'Estupefacientes'}
        onChange={() => setMedicamentosControlados(medicamentosControlados === 'Estupefacientes' ? '' : 'Estupefacientes')}
        className="checkbox1"
      />
      <span className="checkboxLabel1">Estupefacientes</span>
    </div>
    <div className="checkboxWrapper1">
      <input
        type="checkbox"
        checked={medicamentosControlados === 'Psicotrópicos'}
        onChange={() => setMedicamentosControlados(medicamentosControlados === 'Psicotrópicos' ? '' : 'Psicotrópicos')}
        className="checkbox1"
      />
      <span className="checkboxLabel1">Psicotrópicos</span>
    </div>
    
    
    <div className="checkboxWrapper1">
      <input
        type="checkbox"
        checked={medicamentosControlados === 'Ambos'}
        onChange={() => setMedicamentosControlados(medicamentosControlados === 'Ambos' ? '' : 'Ambos')}
        className="checkbox1"
      />
      <span className="checkboxLabel1">Ambos</span>
    </div>
    <div className="checkboxWrapper1">
      <input
        type="checkbox"
        checked={medicamentosControlados === 'Ninguno'}
        onChange={() => setMedicamentosControlados(medicamentosControlados === 'Ninguno' ? '' : 'Ninguno')}
        className="checkbox1"
      />
      <span className="checkboxLabel1">Ninguno</span>
    </div>
  </div>
</div>


      <div className="errorContainer">
      <label className="error">{error}</label>
      </div>
      <div className="buttonContainer1">
        <button className="homeButton" onClick={handleMenu}>
          <span className="homeButtonText">Cancelar</span>
        </button>
        <button className="loginButton" onClick={handleSubmit}>
          <span className="loginButtonText">Registrar</span>
        </button>
      </div>
    </div>
  );
};

export default RegistroFarmacia;
