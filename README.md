# Cine Wrapped

Plataforma web para un cine que permite consultar películas y funciones, seleccionar asientos, realizar compras simuladas y visualizar estadísticas personales mediante **Cine Wrapped**.

> Proyecto académico. No procesa pagos reales ni se conecta a un sistema comercial de cine.

## Tecnologías

- **Frontend:** React, Vite, React Router y CSS.
- **Backend:** Node.js, Express y API REST.
- **Base de datos:** MySQL, mediante `mysql2`.
- **Seguridad:** autenticación JWT, contraseñas protegidas con `bcrypt` y permisos según rol.

## Funcionalidades

### Usuario
- Registro, inicio y cierre de sesión.
- Consulta de cartelera, detalles de películas y funciones.
- Consulta y selección de asientos disponibles.
- Confirmación de compras simuladas y generación de entradas con código único.
- Historial de entradas.
- Perfil personal.
- **Cine Wrapped:** cantidad de películas vistas, minutos acumulados, género más visto, mes más activo y última película.

### Administrador
- Acceso a panel administrativo según rol.
- Crear, editar y eliminar películas.
- Crear, editar y eliminar funciones.
- Restricción de eliminación de funciones que ya tienen entradas asociadas, para preservar la integridad de datos.

## Estructura general

```text
cine-wrapped/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── app.js
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
├── database/
│   └── schema.sql
└── README.md
```

## Requisitos previos

- Node.js y npm instalados.
- MySQL Server en funcionamiento.
- Git para clonar el repositorio.
- Una herramienta para ejecutar SQL, como MySQL Workbench o DBeaver.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
# Reemplaza la URL por la dirección real de tu repositorio.
git clone URL_DEL_REPOSITORIO

# Ingresa a la carpeta del proyecto.
cd cine-wrapped
```

### 2. Preparar la base de datos

Crea una base de datos MySQL llamada `cine_db` y ejecuta el script `database/schema.sql` **si ese archivo contiene el esquema actualizado**. Si el repositorio incluye un respaldo SQL de la base de datos, puedes importarlo en su lugar.

```sql
-- Crea la base de datos si todavía no existe.
CREATE DATABASE IF NOT EXISTS cine_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

> El esquema y los datos de ejemplo son distintos: crear las tablas no necesariamente agrega películas, funciones o asientos. Para probar el flujo de compra deben existir estos registros.

### 3. Configurar y ejecutar el backend

```bash
# Entra a la carpeta del servidor.
cd backend

# Instala las dependencias definidas en package.json.
npm install
```

Crea el archivo `backend/.env` con valores correspondientes a tu instalación local:

```dotenv
# Puerto del servidor Express.
PORT=3000

# Configuración de conexión a MySQL.
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_LOCAL
DB_NAME=cine_db

# Clave privada para firmar los tokens JWT.
JWT_SECRET=REEMPLAZAR_POR_UNA_CLAVE_LARGA_Y_ALEATORIA
JWT_EXPIRES_IN=2h
```

**Importante:** verifica los nombres exactos de las variables de conexión que utiliza `backend/src/config/database.js`; si difieren de este ejemplo, utiliza los del código. No subas `.env` a Git.

Inicia el servidor con el script disponible en `backend/package.json`:

```bash
# Usa este comando si el proyecto define el script "dev".
npm run dev
```

El backend utiliza normalmente `http://localhost:3000`.

### 4. Instalar y ejecutar el frontend

En **otra terminal**:

```bash
# Desde la raíz del repositorio, entra al frontend.
cd frontend

# Instala sus dependencias.
npm install

# Inicia el servidor de desarrollo Vite.
npm run dev
```

Abre la dirección que muestre Vite; normalmente es `http://localhost:5173`.

> Actualmente el cliente utiliza `http://localhost:3000` como dirección de la API en `frontend/src/services/api.js`. Si cambias el puerto del backend, actualiza también esa URL.

## Endpoints principales

| Método | Ruta | Función |
|---|---|---|
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Consultar perfil autenticado |
| GET | `/peliculas` | Listar películas |
| GET | `/peliculas/:id` | Consultar película |
| GET | `/peliculas/:id/funciones` | Listar funciones de una película |
| GET | `/funciones/:id/asientos` | Consultar disponibilidad de asientos |
| POST | `/entradas` | Confirmar compra simulada |
| GET | `/usuarios/me/entradas` | Consultar historial personal |
| GET | `/usuarios/me/wrapped` | Consultar estadísticas personales |
| POST | `/admin/peliculas` | Crear película |
| PUT | `/admin/peliculas/:id` | Editar película |
| DELETE | `/admin/peliculas/:id` | Eliminar película |
| POST | `/admin/funciones` | Crear función |
| PUT | `/admin/funciones/:id` | Editar función |
| DELETE | `/admin/funciones/:id` | Eliminar función |

Las rutas personales requieren un token JWT válido. Las rutas `/admin` requieren, además, rol `admin`.

## Modelo de datos

La base de datos utiliza seis tablas principales:

- `usuarios`: cuentas y roles.
- `peliculas`: catálogo cinematográfico.
- `funciones`: horarios y salas de exhibición.
- `asientos`: ubicación de asientos por sala.
- `entradas`: compras simuladas y estado de entradas.
- `entrada_asientos`: relación entre entradas y asientos.

La disponibilidad depende de cada función. La restricción única `(funcion_id, asiento_id)` en `entrada_asientos`, junto con validaciones y transacciones en el backend, evita asignar dos veces el mismo asiento para una función.

## Cine Wrapped

Las estadísticas se calculan a partir de las entradas **confirmadas** de cada usuario, consultando MySQL. No se almacena un resumen estático en una tabla independiente.

Métricas incluidas:
1. Películas vistas.
2. Minutos acumulados de películas.
3. Género más visto.
4. Mes con mayor actividad.
5. Última película vista según fecha y hora de función.

## Pruebas realizadas

- Flujos completos de usuario y administrador.
- Validación de asientos ocupados y códigos únicos de entradas.
- Comprobación de autenticación y restricciones de administrador.
- Pruebas de interfaz responsive.
- Verificación de funcionamiento en Google Chrome y Microsoft Edge.

**Resultado de la revisión del MVP:** 24 requisitos funcionales y 12 requisitos no funcionales verificados.

## Alcance y limitaciones

Este sistema representa **un solo cine**, con posibilidad de manejar distintas salas. Las compras son simuladas y no se solicita ni procesa información bancaria. La versión académica no incluye aplicación móvil nativa, integración con pasarelas de pago ni sistemas externos de cine.

## Notas para desarrollo colaborativo

- Cada integrante debe instalar las dependencias en `backend` y `frontend`.
- Cada integrante necesita su propia configuración local de `.env`.
- **Clonar el repositorio no copia automáticamente la base de datos MySQL**. Es necesario ejecutar el esquema e importar los datos requeridos.
- No incluir contraseñas, claves JWT ni archivos `.env` en los commits.
- Antes de subir cambios, verificar que frontend, backend y base de datos estén funcionando.
