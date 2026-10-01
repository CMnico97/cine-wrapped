// Importamos las herramientas de React Router
// necesarias para definir las páginas
// de nuestra aplicación.
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';

// Importamos nuestras páginas.
import Inicio from './pages/Inicio';
import Cartelera from './pages/Cartelera';
import DetallePelicula from './pages/DetallePelicula';

// Importamos los estilos generales
// de nuestra aplicación.
import './App.css';


// =====================================================
// APLICACIÓN PRINCIPAL
// =====================================================

function App() {
  return (
    // BrowserRouter habilita la navegación
    // mediante URLs dentro de React.
    <BrowserRouter>

      {/* Routes contiene todas las rutas
          disponibles en nuestra aplicación. */}
      <Routes>

        {/* Página de inicio. */}
        <Route
          path="/"
          element={<Inicio />}
        />

        {/* Página de cartelera. */}
        <Route
          path="/peliculas"
          element={<Cartelera />}
        />

        {/* Página de detalle.

            :id es un parámetro dinámico.

            Ejemplo:

            /peliculas/1 */}
        <Route
          path="/peliculas/:id"
          element={<DetallePelicula />}
        />

      </Routes>
    </BrowserRouter>
  );
}


export default App;