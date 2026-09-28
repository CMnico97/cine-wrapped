// Importamos el pool de conexiones a MySQL.
//
// El servicio utilizará este pool para realizar
// consultas sobre la tabla usuarios.
const pool = require('../config/database');


// =====================================================
// BUSCAR USUARIO POR EMAIL
// =====================================================

// Esta función busca un usuario utilizando su correo.
//
// La utilizaremos antes de registrar una cuenta
// para comprobar que el email no esté registrado.
const buscarUsuarioPorEmail = async (email) => {
  // Ejecutamos una consulta parametrizada.
  //
  // El signo ? será reemplazado por el valor de email.
  //
  // Esto es importante porque evita concatenar directamente
  // información ingresada por el usuario dentro del SQL.
  const [rows] = await pool.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );

  // Si encontramos un usuario devolvemos el primero.
  //
  // Si no existe, devolvemos undefined.
  return rows[0];
};


// =====================================================
// CREAR USUARIO
// =====================================================

// Esta función inserta un nuevo usuario en MySQL.
//
// Recibe:
// - nombre
// - email
// - passwordHash
//
// passwordHash será la contraseña ya procesada con bcrypt.
const crearUsuario = async (nombre, email, passwordHash) => {
  // Insertamos el nuevo usuario.
  //
  // No enviamos el rol porque MySQL ya tiene definido
  // "usuario" como valor predeterminado.
  const [result] = await pool.query(
    `
      INSERT INTO usuarios (
        nombre,
        email,
        password
      )
      VALUES (?, ?, ?)
    `,
    [nombre, email, passwordHash]
  );

  // result.insertId contiene el ID generado automáticamente
  // por MySQL para el nuevo usuario.
  return result.insertId;
};


// Exportamos las funciones para que puedan ser utilizadas
// desde nuestro controlador.
module.exports = {
  buscarUsuarioPorEmail,
  crearUsuario
};