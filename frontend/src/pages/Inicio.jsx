// Importamos Link para poder navegar entre
// páginas sin recargar completamente el navegador.
import { Link } from "react-router-dom";

// NUEVO: carrusel con películas de la cartelera.
import CarruselPeliculas from "../components/CarruselPeliculas";

// =====================================================
// PÁGINA DE INICIO
// =====================================================

function Inicio() {
  return (
    <main className="contenedor">
      <section className="inicio">
        <p className="etiqueta">Cine Wrapped</p>

        <h1>Tu experiencia de cine en un solo lugar</h1>

        <p className="inicio-descripcion">
          Consulta la cartelera, selecciona tus funciones, elige tus asientos y
          descubre tus estadísticas personales con Cine Wrapped.
        </p>

        <Link className="boton" to="/peliculas">
          Ver cartelera
        </Link>
      </section>

      {/* NUEVO: carrusel debajo del botón. */}
      <CarruselPeliculas />
    </main>
  );
}

export default Inicio;
