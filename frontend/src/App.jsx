// Importamos las herramientas necesarias
// para manejar las rutas de nuestra aplicación.
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Importamos las páginas principales.
import Inicio from "./pages/Inicio";
import Cartelera from "./pages/Cartelera";
import DetallePelicula from "./pages/DetallePelicula";
import SeleccionAsientos from "./pages/SeleccionAsientos";

// Importamos las páginas relacionadas
// con la autenticación.
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import CompraConfirmada from "./pages/CompraConfirmada";
import MisEntradas from "./pages/MisEntradas";
import CineWrapped from "./pages/CineWrapped";
import Perfil from "./pages/Perfil";

// Importamos el panel principal
// de administración.
import Admin from "./pages/Admin";
import AdminPeliculas from "./pages/AdminPeliculas";
import AdminFunciones from "./pages/AdminFunciones";

// Importamos la barra de navegación
// que estará disponible en toda la aplicación.
import Navbar from "./components/Navbar";

// Importamos los estilos generales.
import "./App.css";

// =====================================================
// APLICACIÓN PRINCIPAL
// =====================================================

function App() {
  return (
    // BrowserRouter habilita la navegación
    // mediante URLs dentro de React.
    <BrowserRouter>
      {/* La barra de navegación se encuentra
          fuera de Routes porque queremos que
          aparezca en todas las páginas. */}
      <Navbar />

      {/* Todas las rutas de nuestra aplicación
          deben encontrarse dentro de Routes. */}
      <Routes>
        {/* Página de inicio. */}
        <Route path="/" element={<Inicio />} />

        {/* Cartelera de películas. */}
        <Route path="/peliculas" element={<Cartelera />} />

        {/* Detalle de una película. */}
        <Route path="/peliculas/:id" element={<DetallePelicula />} />

        {/* Selección de asientos
            para una función determinada. */}
        <Route path="/funciones/:id/asientos" element={<SeleccionAsientos />} />

        {/* Página para iniciar sesión. */}
        <Route path="/login" element={<Login />} />

        {/* Página para registrar
            un nuevo usuario. */}
        <Route path="/registro" element={<Registro />} />

        {/* Página mostrada después de realizar
            correctamente una compra simulada. */}
        <Route path="/compra-confirmada" element={<CompraConfirmada />} />

        {/* Historial de entradas pertenecientes
            al usuario autenticado. */}
        <Route path="/mis-entradas" element={<MisEntradas />} />

        {/* Cine Wrapped del usuario autenticado. */}
        <Route path="/wrapped" element={<CineWrapped />} />
        {/* Panel principal disponible
    para administradores. */}
        <Route path="/admin" element={<Admin />} />
        {/* Gestión administrativa
    de las películas. */}
        <Route path="/admin/peliculas" element={<AdminPeliculas />} />
        {/* Gestión administrativa
    de las funciones. */}
        <Route path="/admin/funciones" element={<AdminFunciones />} />
        {/* Perfil del usuario autenticado. */}
        <Route path="/perfil" element={<Perfil />} />
      </Routes>
    </BrowserRouter>
  );
}

// Exportamos App para que pueda ser utilizado
// desde main.jsx.
export default App;
