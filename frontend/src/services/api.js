// =====================================================
// CONFIGURACIÓN DE LA API
// =====================================================

// Dirección base de nuestro backend.
//
// Durante el desarrollo:
//
// React   → localhost:5173
// Express → localhost:3000
//
// Más adelante podremos mover esta dirección
// a una variable de entorno.
const API_URL = 'http://localhost:3000';


// =====================================================
// OBTENER PELÍCULAS
// =====================================================

// Esta función consulta la cartelera desde
// nuestro backend.
//
// Endpoint:
//
// GET /peliculas
export const obtenerPeliculas = async () => {
  // Realizamos la petición HTTP utilizando fetch.
  const respuesta = await fetch(
    `${API_URL}/peliculas`
  );

  // Si Express responde con un código de error,
  // lanzamos una excepción para que el componente
  // pueda manejarla.
  if (!respuesta.ok) {
    throw new Error(
      'No fue posible obtener las películas'
    );
  }

  // Convertimos la respuesta JSON en un
  // objeto JavaScript.
  const datos = await respuesta.json();

  // Nuestro backend devuelve:
  //
  // {
  //   ok: true,
  //   peliculas: [...]
  // }
  //
  // Por eso devolvemos solamente el arreglo.
  return datos.peliculas;
};

// =====================================================
// OBTENER DETALLE DE UNA PELÍCULA
// =====================================================

// Consulta:
//
// GET /peliculas/:id
//
// Recibe el identificador de la película
// que queremos visualizar.
export const obtenerPeliculaPorId = async (id) => {
  const respuesta = await fetch(
    `${API_URL}/peliculas/${id}`
  );

  // Si la película no existe o el servidor
  // devuelve otro error, detenemos la operación.
  if (!respuesta.ok) {
    throw new Error(
      'No fue posible obtener la película'
    );
  }

  // Convertimos la respuesta a JSON.
  const datos = await respuesta.json();

  // Nuestro backend devuelve:
  //
  // {
  //   ok: true,
  //   pelicula: {...}
  // }
  return datos.pelicula;
};