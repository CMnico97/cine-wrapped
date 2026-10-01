// Importamos StrictMode desde React.
import { StrictMode } from 'react';

// Importamos la función que permite
// montar nuestra aplicación en el DOM.
import { createRoot } from 'react-dom/client';

// Importamos los estilos globales.
import './index.css';

// Importamos nuestro componente principal.
import App from './App.jsx';


// Buscamos el elemento #root de index.html
// y renderizamos nuestra aplicación dentro.
createRoot(
  document.getElementById('root')
).render(
  <StrictMode>
    <App />
  </StrictMode>
);