// Importamos las herramientas necesarias
// para manejar las rutas de nuestra aplicación.
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";

// Importamos las páginas principales.
import Inicio from "./pages/Inicio";
import Cartelera from "./pages/Cartelera";
import DetallePelicula from "./pages/DetallePelicula";
import SeleccionAsientos from "./pages/SeleccionAsientos";

// Página del saldo e historial de puntos.
import MisPuntos from "./pages/MisPuntos";

// Páginas relacionadas con la autenticación.
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import CompraConfirmada from "./pages/CompraConfirmada";
import MisEntradas from "./pages/MisEntradas";
import CineWrapped from "./pages/CineWrapped";
import Perfil from "./pages/Perfil";

// Panel de administración.
import Admin from "./pages/Admin";
import AdminPeliculas from "./pages/AdminPeliculas";
import AdminFunciones from "./pages/AdminFunciones";

// Barra de navegación disponible en toda la aplicación.
import Navbar from "./components/Navbar";

// NUEVO: pie de página.
import Footer from "./components/Footer";

// NUEVO: focos de la sala y efectos.
import Focos from "./components/Focos";
import { sonidos } from "./utils/sonido";
import { lanzarConfeti } from "./utils/confeti";

// Estilos generales y NUEVO tema (siempre después de App.css).
import "./App.css";
import "./estilos/tema.css";

// Página de productos de confitería.
import Confiteria from "./pages/Confiteria";

// Página de historial de compras de confitería.
import MisComprasConfiteria from "./pages/misComprasConfiteria";

// Página de administración de confitería.
import AdminConfiteria from "./pages/adminConfiteria";

// =====================================================
// DISEÑO GENERAL (lobby, sala, transiciones y sonidos)
// =====================================================

// "Sala" = páginas con la luz baja y los focos a los lados:
// el detalle de una película y la elección de asientos.
// Todo lo demás es "lobby".
const esRutaDeSala = (ruta) =>
  /^\/peliculas\/[^/]+$/.test(ruta) || /^\/funciones\/[^/]+\/asientos/.test(ruta);

function Disenio() {
  const location = useLocation();
  const esSala = esRutaDeSala(location.pathname);

  // ---------- Luces que bajan al entrar a la sala ----------
  const [salaAnterior, setSalaAnterior] = useState(esSala);
  const [luces, setLuces] = useState(null);

  // Si cambió el tipo de página, avisamos qué animación mostrar.
  if (esSala !== salaAnterior) {
    setSalaAnterior(esSala);
    setLuces(esSala ? "bajan" : "suben");
  }

  useEffect(() => {
    if (!luces) return undefined;

    if (luces === "bajan") sonidos.luces();

    const temporizador = setTimeout(() => setLuces(null), 1400);
    return () => clearTimeout(temporizador);
  }, [luces]);

  // ---------- Sonidos al hacer clic y pasar el mouse ----------
  const ultimoHover = useRef(null);

  useEffect(() => {
    const alHacerClic = (evento) => {
      const elemento = evento.target.closest?.("button, a, .asiento");
      if (!elemento || elemento.disabled) return;

      if (elemento.classList.contains("asiento-ocupado")) {
        sonidos.error();
      } else if (elemento.classList.contains("asiento")) {
        sonidos.seleccion();
      } else {
        sonidos.click();
      }
    };

    const alPasarMouse = (evento) => {
      const elemento = evento.target.closest?.(
        ".funcion, .asiento-disponible, .pelicula, .boton",
      );

      if (elemento && elemento !== ultimoHover.current) {
        ultimoHover.current = elemento;
        sonidos.hover();
      } else if (!elemento) {
        ultimoHover.current = null;
      }
    };

    document.addEventListener("click", alHacerClic);
    document.addEventListener("mouseover", alPasarMouse);

    return () => {
      document.removeEventListener("click", alHacerClic);
      document.removeEventListener("mouseover", alPasarMouse);
    };
  }, []);

  // ---------- Confeti y sonido de éxito ----------
  useEffect(() => {
    let temporizador;

    if (location.pathname === "/compra-confirmada") {
      temporizador = setTimeout(() => {
        sonidos.exito();
        lanzarConfeti();
      }, 350);
    }

    if (location.pathname === "/wrapped") {
      temporizador = setTimeout(() => {
        sonidos.exito();
        lanzarConfeti(120);
      }, 1000);
    }

    return () => clearTimeout(temporizador);
  }, [location.pathname]);

  return (
    <div className={`app ${esSala ? "tema-sala" : "tema-lobby"}`}>
      {/* Focos: solo en las páginas de sala. */}
      {esSala && <Focos />}

      {/* Capa negra que se desvanece al cambiar entre lobby y sala. */}
      {luces && <div key={luces} className={`luces-${luces}`} aria-hidden="true" />}

      <Navbar />

      {/* "key" hace que la página se anime cada vez que cambia la ruta. */}
      <main key={location.pathname} className="pagina-transicion">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/peliculas" element={<Cartelera />} />
          <Route path="/peliculas/:id" element={<DetallePelicula />} />
          <Route path="/funciones/:id/asientos" element={<SeleccionAsientos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/compra-confirmada" element={<CompraConfirmada />} />
          <Route path="/mis-entradas" element={<MisEntradas />} />
          <Route path="/wrapped" element={<CineWrapped />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/peliculas" element={<AdminPeliculas />} />
          <Route path="/admin/funciones" element={<AdminFunciones />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/confiteria" element={<Confiteria />} />
          <Route path="/mis-compras-confiteria" element={<MisComprasConfiteria />} />
          <Route path="/admin/confiteria" element={<AdminConfiteria />} />
          <Route path="/mis-puntos" element={<MisPuntos />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

// =====================================================
// APLICACIÓN PRINCIPAL
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <Disenio />
    </BrowserRouter>
  );
}

export default App;
