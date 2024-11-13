import { createRoot } from 'react-dom/client';
import App from './App.jsx'; // Asegúrate de que este sea el componente principal
import './index.css';

createRoot(document.getElementById('root')).render(
  <App /> // Renderiza el componente App aquí directamente
);
