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
const API_URL = "http://localhost:3000";

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
  const respuesta = await fetch(`${API_URL}/peliculas`);

  // Si Express responde con un código de error,
  // lanzamos una excepción para que el componente
  // pueda manejarla.
  if (!respuesta.ok) {
    throw new Error("No fue posible obtener las películas");
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
  const respuesta = await fetch(`${API_URL}/peliculas/${id}`);

  // Si la película no existe o el servidor
  // devuelve otro error, detenemos la operación.
  if (!respuesta.ok) {
    throw new Error("No fue posible obtener la película");
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

// =====================================================
// OBTENER FUNCIONES DE UNA PELÍCULA
// =====================================================

// Esta función consulta las funciones disponibles
// para una película específica.
//
// Endpoint:
//
// GET /peliculas/:id/funciones
//
// Ejemplo:
//
// GET /peliculas/1/funciones
export const obtenerFuncionesPorPelicula = async (id) => {
  // Realizamos la petición al backend utilizando
  // el identificador de la película.
  const respuesta = await fetch(`${API_URL}/peliculas/${id}/funciones`);

  // Si Express devuelve un código HTTP de error,
  // lanzamos una excepción.
  if (!respuesta.ok) {
    throw new Error("No fue posible obtener las funciones");
  }

  // Convertimos la respuesta JSON
  // en un objeto JavaScript.
  const datos = await respuesta.json();

  // Nuestro backend devuelve:
  //
  // {
  //   ok: true,
  //   pelicula: {...},
  //   funciones: [...]
  // }
  //
  // Por ahora solamente necesitamos
  // el arreglo de funciones.
  return datos.funciones;
};

// =====================================================
// OBTENER ASIENTOS DE UNA FUNCIÓN
// =====================================================

// Esta función consulta todos los asientos
// correspondientes a una función.
//
// Endpoint:
//
// GET /funciones/:id/asientos
//
// Ejemplo:
//
// GET /funciones/1/asientos
export const obtenerAsientosPorFuncion = async (id) => {
  // Realizamos la petición al backend.
  const respuesta = await fetch(`${API_URL}/funciones/${id}/asientos`);

  // Si Express devuelve un código HTTP de error,
  // detenemos la operación.
  if (!respuesta.ok) {
    throw new Error("No fue posible obtener los asientos");
  }

  // Convertimos la respuesta JSON
  // en un objeto JavaScript.
  const datos = await respuesta.json();

  // Nuestro backend devuelve información de
  // la función junto con sus asientos.
  //
  // En este caso nos interesa conservar ambas cosas.
  return {
    funcion: datos.funcion,
    asientos: datos.asientos,
  };
};

// =====================================================
// INICIAR SESIÓN
// =====================================================

// Esta función envía las credenciales del usuario
// al backend.
//
// Endpoint:
//
// POST /auth/login
export const iniciarSesion = async (email, password) => {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: "POST",

    // Indicamos que enviaremos información JSON.
    headers: {
      "Content-Type": "application/json",
    },

    // Convertimos las credenciales
    // a formato JSON.
    body: JSON.stringify({
      email,
      password,
    }),
  });

  // Convertimos la respuesta antes de comprobar
  // el código HTTP para poder utilizar el mensaje
  // enviado por nuestro backend.
  const datos = await respuesta.json();

  // Si las credenciales son incorrectas,
  // lanzamos el mensaje entregado por Express.
  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible iniciar sesión");
  }

  // Nuestro backend devuelve algo parecido a:
  //
  // {
  //   ok: true,
  //   usuario: {...},
  //   token: "..."
  // }
  return datos;
};

// =====================================================
// REGISTRAR USUARIO
// =====================================================

// Esta función crea una nueva cuenta.
//
// Endpoint:
//
// POST /auth/register
export const registrarUsuario = async (nombre, email, password) => {
  const respuesta = await fetch(`${API_URL}/auth/register`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      nombre,
      email,
      password,
    }),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible crear la cuenta");
  }

  return datos;
};
// =====================================================
// CREAR ENTRADA / COMPRA SIMULADA
// =====================================================

// Esta función realiza la compra simulada
// enviando la función y los asientos seleccionados.
//
// Endpoint:
//
// POST /entradas
//
// Este endpoint está protegido, por lo que debemos
// enviar el JWT mediante Authorization.
export const crearEntrada = async (funcionId, asientosIds, token) => {
  // Enviamos la petición al backend.
  const respuesta = await fetch(`${API_URL}/entradas`, {
    method: "POST",

    headers: {
      // Indicamos que el cuerpo será JSON.
      "Content-Type": "application/json",

      // Enviamos el JWT utilizando el formato
      // esperado por nuestro middleware:
      //
      // Authorization: Bearer <token>
      Authorization: `Bearer ${token}`,
    },

    // El backend espera:
    //
    // {
    //   funcion_id: 1,
    //   asientos: [4, 5]
    // }
    body: JSON.stringify({
      funcion_id: funcionId,
      asientos: asientosIds,
    }),
  });

  // Convertimos la respuesta del backend
  // a un objeto JavaScript.
  const datos = await respuesta.json();

  // Si la compra falla, utilizamos el mensaje
  // enviado por Express.
  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible realizar la compra");
  }

  // Si todo funciona, devolvemos la respuesta.
  return datos;
};

// =====================================================
// OBTENER MIS ENTRADAS
// =====================================================

// Esta función obtiene el historial de entradas
// pertenecientes al usuario que inició sesión.
//
// Endpoint:
//
// GET /usuarios/me/entradas
//
// Como es una ruta protegida, debemos enviar
// el JWT mediante el encabezado Authorization.
export const obtenerMisEntradas = async (token) => {
  // Realizamos la petición al backend.
  const respuesta = await fetch(`${API_URL}/usuarios/me/entradas`, {
    method: "GET",

    headers: {
      // Enviamos el JWT utilizando el formato
      // esperado por nuestro middleware.
      Authorization: `Bearer ${token}`,
    },
  });

  // Convertimos la respuesta JSON
  // en un objeto JavaScript.
  const datos = await respuesta.json();

  // Si el backend devuelve un error,
  // mostramos el mensaje correspondiente.
  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible obtener tus entradas");
  }

  // Devolvemos la respuesta completa
  // recibida desde Express.
  return datos;
};

// =====================================================
// OBTENER CINE WRAPPED
// =====================================================

// Esta función obtiene las estadísticas personales
// del usuario actualmente autenticado.
//
// Endpoint:
//
// GET /usuarios/me/wrapped
//
// Como esta ruta está protegida, debemos enviar
// el JWT mediante Authorization.
export const obtenerWrapped = async (token) => {
  // Realizamos la petición al backend.
  const respuesta = await fetch(`${API_URL}/usuarios/me/wrapped`, {
    method: "GET",

    headers: {
      // Enviamos el JWT utilizando el formato
      // esperado por nuestro middleware.
      Authorization: `Bearer ${token}`,
    },
  });

  // Convertimos la respuesta del backend
  // en un objeto JavaScript.
  const datos = await respuesta.json();

  // Si ocurre algún error, utilizamos primero
  // el mensaje enviado por Express.
  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible obtener tu Cine Wrapped");
  }

  // Devolvemos la respuesta completa.
  return datos;
};

// =====================================================
// ADMINISTRACIÓN DE PELÍCULAS
// =====================================================

// =====================================================
// CREAR PELÍCULA
// =====================================================

// Crea una nueva película.
//
// Endpoint:
//
// POST /admin/peliculas
//
// Esta ruta requiere un JWT perteneciente
// a un usuario administrador.
export const crearPeliculaAdmin = async (pelicula, token) => {
  const respuesta = await fetch(`${API_URL}/admin/peliculas`, {
    method: "POST",

    headers: {
      // Indicamos que enviaremos JSON.
      "Content-Type": "application/json",

      // Enviamos el JWT del administrador.
      Authorization: `Bearer ${token}`,
    },

    // Convertimos los datos de la película
    // a formato JSON.
    body: JSON.stringify(pelicula),
  });

  const datos = await respuesta.json();

  // Si Express rechaza la operación,
  // mostramos su mensaje.
  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible crear la película");
  }

  return datos;
};

// =====================================================
// ACTUALIZAR PELÍCULA
// =====================================================

// Modifica una película existente.
//
// Endpoint:
//
// PUT /admin/peliculas/:id
export const actualizarPeliculaAdmin = async (id, pelicula, token) => {
  const respuesta = await fetch(`${API_URL}/admin/peliculas/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(pelicula),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible actualizar la película");
  }

  return datos;
};

// =====================================================
// ELIMINAR PELÍCULA
// =====================================================

// Elimina una película existente.
//
// Endpoint:
//
// DELETE /admin/peliculas/:id
export const eliminarPeliculaAdmin = async (id, token) => {
  const respuesta = await fetch(`${API_URL}/admin/peliculas/${id}`, {
    method: "DELETE",

    headers: {
      // Aunque DELETE no envía body,
      // igualmente debemos enviar el JWT.
      Authorization: `Bearer ${token}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible eliminar la película");
  }

  return datos;
};
// =====================================================
// ADMINISTRACIÓN DE FUNCIONES
// =====================================================

// =====================================================
// CREAR FUNCIÓN
// =====================================================

// Crea una nueva función para una película.
//
// Endpoint:
//
// POST /admin/funciones
//
// Requiere JWT de administrador.
export const crearFuncionAdmin = async (funcion, token) => {
  const respuesta = await fetch(`${API_URL}/admin/funciones`, {
    method: "POST",

    headers: {
      // Indicamos que enviaremos JSON.
      "Content-Type": "application/json",

      // Enviamos el JWT del administrador.
      Authorization: `Bearer ${token}`,
    },

    // Convertimos los datos de la función
    // a formato JSON.
    body: JSON.stringify(funcion),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible crear la función");
  }

  return datos;
};

// =====================================================
// ACTUALIZAR FUNCIÓN
// =====================================================

// Modifica una función existente.
//
// Endpoint:
//
// PUT /admin/funciones/:id
export const actualizarFuncionAdmin = async (id, funcion, token) => {
  const respuesta = await fetch(`${API_URL}/admin/funciones/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(funcion),
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible actualizar la función");
  }

  return datos;
};

// =====================================================
// ELIMINAR FUNCIÓN
// =====================================================

// Elimina una función existente.
//
// Endpoint:
//
// DELETE /admin/funciones/:id
export const eliminarFuncionAdmin = async (id, token) => {
  const respuesta = await fetch(`${API_URL}/admin/funciones/${id}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible eliminar la función");
  }

  return datos;
};
// =====================================================
// OBTENER PERFIL DEL USUARIO
// =====================================================

// Obtiene los datos del usuario que actualmente
// tiene una sesión iniciada.
//
// Endpoint:
//
// GET /auth/me
//
// Como es una ruta protegida, debemos enviar
// el JWT mediante Authorization.
export const obtenerPerfil = async (token) => {
  // Realizamos la petición al backend.
  const respuesta = await fetch(`${API_URL}/auth/me`, {
    method: "GET",

    headers: {
      // Enviamos el JWT utilizando el formato
      // esperado por verificarToken.
      Authorization: `Bearer ${token}`,
    },
  });

  // Convertimos la respuesta JSON
  // en un objeto JavaScript.
  const datos = await respuesta.json();

  // Si Express devuelve un error,
  // mostramos el mensaje recibido.
  if (!respuesta.ok) {
    throw new Error(datos.message || "No fue posible obtener el perfil");
  }

  // Devolvemos directamente el usuario
  // para simplificar su uso en React.
  return datos.usuario;
};
