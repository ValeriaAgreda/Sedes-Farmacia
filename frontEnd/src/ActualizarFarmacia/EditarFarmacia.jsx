import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import MapViewRegistro from './MapViewEdit';

const EditarFarmacia = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { id } = useParams(); // Obtener el ID de la farmacia de los parámetros de la URL

  // Estados del formulario
  const [nombreFarmacia, setNombreFarmacia] = useState('');
  const [categoriaEstablecimiento, setCategoriaEstablecimiento] = useState({});
  const [nroResolucion, setNroResolucion] = useState('');


  const [fechaResolucion, setFechaResolucion] = useState('');


  

  
  const [zona, setZona] = useState({});
  const [codigozona, setCodigoZona] = useState({});
  const [sector, setSector] = useState({});
  const [direccion, setDireccion] = useState('');
  const [latitud, setLatitud] = useState(null);
  const [longitud, setLongitud] = useState(null);
  const [nombre, setNombre] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [ci, setCi] = useState('');
  const [nit, setNit] = useState('');
  const [celular, setCelular] = useState('');
  const [gmail, setGmail] = useState('');
  const [horasFarmacia, setHorasFarmacia] = useState('8h');
  const [tipoFarmacia, setTipoFarmacia] = useState('Privada');
  const [observaciones, setObservaciones] = useState(''); 
  const [medicamentosControlados, setMedicamentosControlados] = useState('');
  const [sustancias, setSustancias] = useState([]);
  const [fileBase64, setFileBase64] = useState(null);

  // Estados para los datos de los pickers
  const [zonas, setZonas] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [categoriasEstablecimiento, setCategoriasEstablecimiento] = useState([]);
  const [codigosZona, setCodigosZona] = useState([]);

  // Cargar datos actuales de la farmacia
useEffect(() => {
  const fetchFarmacia = async () => {
    try {
      const response = await fetch(`http://localhost:8082/farmacia/cargarfarmacia/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const farmacia = await response.json();

      // Asignar datos de la farmacia con valores por defecto
      setNombreFarmacia(farmacia.nombre || '');
      setNroResolucion(farmacia.numero_registro || '');
      setHorasFarmacia(farmacia.horario_atencion || '8h'); // Cargar horas de atención
      setTipoFarmacia(farmacia.tipo || 'Privada');

      // Obtener la fecha actual en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];

      // Asignar la fecha de resolución o la fecha de hoy si no existe
      setFechaResolucion(farmacia.fecha_registro ? farmacia.fecha_registro.split('T')[0] : today);


      const zonaEncontrada = zonas.find((z) => z.id === farmacia.zona_id) || {};
      const sectorEncontrado = sectores.find((s) => s.id === farmacia.sector_id) || {};
      const categoriaEncontrada = categoriasEstablecimiento.find((c) => c.id === farmacia.tipo_id) || {};
      const codigoZonaEncontrado = codigosZona.find((c) => c.id === farmacia.codigo_id) || {};
      
      // Establecer los valores de los pickers
      setZona(zonaEncontrada);
      setSector(sectorEncontrado);
      setCategoriaEstablecimiento(categoriaEncontrada);
      setCodigoZona(codigoZonaEncontrado);

      setDireccion(farmacia.direccion || '');
      setLatitud(farmacia.latitud || null);
      setLongitud(farmacia.longitud || null);
      setNit(farmacia.nit || '');
      setObservaciones(farmacia.observaciones || ''); // Observaciones

      // Verificar si la farmacia tiene sustancias controladas
      const sustanciasResponse = await fetch(`http://localhost:8082/farmacia/farmacia_sustancias/${id}`);
      const sustanciasData = await sustanciasResponse.json();
      //setMedicamentosControlados(sustanciasData.tiene_sustancias ? 'Ambos' : 'Ninguno');


      const response1 = await fetch(`http://localhost:8082/farmacia/farmacia_sustancias/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response1.status}`);
        }
        const data = await response1.json();
        const sustanciaId = data.sustancia_id;

        // Asigna el valor a `medicamentosControlados` basado en `sustancia_id`
        switch (sustanciaId) {
          case 1:
            setMedicamentosControlados('Estupefacientes');
            break;
          case 2:
            setMedicamentosControlados('Psicotrópicos');
            break;
          case 3:
            setMedicamentosControlados('Ambos');
            break;
          default:
            setMedicamentosControlados('Ninguno');
            break;
        }



      // Convertir imagen desde binario a base64
      if (farmacia.imagen) {
        const base64String = btoa(
          new Uint8Array(farmacia.imagen.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        setFileBase64(`data:image/jpeg;base64,${base64String}`);
      }
      
      // Verificar si el dueno_id es el correcto y cargar los datos del dueño
      if (farmacia.dueno_id) {
        console.log(`Cargando datos del dueño con ID: ${farmacia.dueno_id}`);
        fetchDueno(farmacia.dueno_id); // Llamada a la función para cargar el dueño
      }
    } catch (error) {
      console.error('Error fetching farmacia:', error);
    }
  };

  // Función para cargar los datos del dueño
  const fetchDueno = async (duenoId) => {
    try {
      const response = await fetch(`http://localhost:8082/farmacia/duenofarmacia/${duenoId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const dueno = await response.json();

      // Asignar los datos del dueño con valores por defecto
      setNombre(dueno.nombre || '');
      setApellidoPaterno(dueno.primer_apellido || '');
      setApellidoMaterno(dueno.segundo_apellido || '');
      setCi(dueno.carnet_identidad || '');
      setCelular(dueno.celular || '');
      setGmail(dueno.gmail || '');
    } catch (error) {
      console.error('Error fetching dueno:', error);
    }
  };

  // Llamar a la función una vez que los datos de los pickers estén cargados
  if (zonas.length > 0 && sectores.length > 0 && categoriasEstablecimiento.length > 0 && codigosZona.length > 0) {
    fetchFarmacia();
  }
}, [id, zonas, sectores, categoriasEstablecimiento, codigosZona]);

  // Cargar datos para los pickers al montar el componente
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [zonasRes, sectoresRes, categoriasRes, codigosRes] = await Promise.all([
          fetch('http://localhost:8082/farmacia/zonas'),
          fetch('http://localhost:8082/farmacia/sectores'),
          fetch('http://localhost:8082/farmacia/categorias'),
          fetch('http://localhost:8082/farmacia/codigoszonas'),
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

  // Manejar la carga de archivos y convertir a base64
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


  const handleLocationSelect = (lat, lng) => {
    setLatitud(lat);
    setLongitud(lng);
  };

  const handleSubmit = async () => {
    // Validaciones
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
    if (medicamentosControlados === '') missingFields.push('Selecciona Medicamentos Controlados');
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
      direccion,
      latitud,
      longitud,
      fecha_registro: fechaResolucion,
      horario_atencion: horasFarmacia,
      razon_social: nombre,
      nit,
      zona_id: zona.id,
      
      tipo: tipoFarmacia, // Puedes agregar un campo de observaciones si es necesario
      
      codigo_id: codigozona.id,
      imagen: fileBase64,
      nombreDueno: nombre,
      primer_apellido: apellidoPaterno,
      segundo_apellido: apellidoMaterno,
      carnet_identidad: ci,
      celular,
      gmail,
      medicamentosControlados
    };

    try {
      const response = await fetch(`http://localhost:8082/farmacia/actualizarfarmacia/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(farmaciaData),
      });

      if (response.ok) {
        alert('Farmacia actualizada exitosamente');
        navigate('/MenuAdmin');
      } else {
        alert('Error al actualizar la farmacia');
      }
    } catch (error) {
      console.error('Error en la solicitud de actualización de farmacia:', error);
      alert('Ocurrió un error al actualizar la farmacia.');
    }
  };
  
  return (
    <div className="container1">
      <h1 className="title1">Editar Farmacia</h1>

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
        value={zona.id}
        onChange={(e) => {
          const selectedZona = zonas.find((z) => z.id === parseInt(e.target.value));
          setZona(selectedZona);
        }}
        className="picker1"
      >
        {zonas.map((zona) => (
          <option key={zona.id} value={zona.id}>
            {zona.nombre}
          </option>
        ))}
      </select>

      <label className="label1">Código Zona:</label>
      <select
        value={codigozona.id}
        onChange={(e) => {
          const selectedCodigo = codigosZona.find((c) => c.id === parseInt(e.target.value));
          setCodigoZona(selectedCodigo);
        }}
        className="picker1"
      >
        {codigosZona.map((codigo) => (
          <option key={codigo.id} value={codigo.id}>
            {codigo.nombre}
          </option>
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
      <MapViewRegistro 
  onLocationSelect={handleLocationSelect} 
  initialLat={latitud} 
  initialLng={longitud} 
/>

      
        
      

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
      onChange={() => setMedicamentosControlados('Estupefacientes')}
      className="checkbox1"
    />
    <span className="checkboxLabel1">Estupefacientes</span>
  </div>
  <div className="checkboxWrapper1">
    <input
      type="checkbox"
      checked={medicamentosControlados === 'Psicotrópicos'}
      onChange={() => setMedicamentosControlados('Psicotrópicos')}
      className="checkbox1"
    />
    <span className="checkboxLabel1">Psicotrópicos</span>
  </div>
  <div className="checkboxWrapper1">
    <input
      type="checkbox"
      checked={medicamentosControlados === 'Ambos'}
      onChange={() => setMedicamentosControlados('Ambos')}
      className="checkbox1"
    />
    <span className="checkboxLabel1">Ambos</span>
  </div>
  <div className="checkboxWrapper1">
    <input
      type="checkbox"
      checked={medicamentosControlados === 'Ninguno'}
      onChange={() => setMedicamentosControlados('Ninguno')}
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
        <button className="homeButton" onClick={() => navigate('/MenuAdmin')}>
          <span className="homeButtonText">Cancelar</span>
        </button>
        <button className="loginButton" onClick={handleSubmit}>
          <span className="loginButtonText">Actualizar</span>
        </button>
      </div>
    </div>
  );
};

export default EditarFarmacia;
