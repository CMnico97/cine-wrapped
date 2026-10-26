# Cine Wrapped

Plataforma web para **un cine** que permite consultar películas y funciones, seleccionar asientos, realizar compras simuladas de entradas y productos de confitería, y visualizar estadísticas personales mediante **Cine Wrapped**.

> **Proyecto académico.** No procesa pagos reales ni se conecta a sistemas comerciales de cine.

## Tecnologías

- **Frontend:** React, Vite, React Router y CSS.
- **Backend:** Node.js, Express y API REST.
- **Base de datos:** MySQL mediante `mysql2`.
- **Seguridad:** autenticación JWT, contraseñas protegidas con `bcrypt` y permisos según rol.

## Funcionalidades

### Usuario

- Registro, inicio y cierre de sesión.
- Consulta de cartelera, detalles de películas y funciones.
- Consulta y selección de asientos disponibles.
- Confirmación de compras simuladas de entradas y generación de entradas con código único.
- Historial de entradas y perfil personal.
- **Confitería:** catálogo público de popcorn y bebidas, carrito de compras, selección de cantidades y compra simulada para usuarios autenticados.
- **Historial de confitería:** consulta de compras realizadas, productos, cantidades, subtotales y total.
- **Cine Wrapped:** películas vistas, minutos acumulados, género más visto, mes más activo y última película; además, total gastado en confitería, cantidad de compras y producto favorito.

### Administrador

- Acceso a un panel administrativo según rol.
- Crear, editar y eliminar películas.
- Crear, editar y eliminar funciones.
- Restricción de eliminación de funciones que ya tienen entradas asociadas, para preservar la integridad de datos.
- **Administrar confitería:** listar todos los productos (incluidos los desactivados), agregar, editar, activar y desactivar productos.
- El administrador también puede utilizar las funcionalidades normales de usuario, incluida la compra de entradas y confitería.

## Módulo de confitería

La confitería es un módulo **independiente de la compra de entradas**. No requiere seleccionar una película o función para comprar productos.

**Flujo de compra:**

1. Consultar el catálogo de popcorn y bebidas disponibles.
2. Agregar productos al carrito y ajustar cantidades.
3. Revisar el total de la compra.
4. Iniciar sesión si aún no se ha hecho.
5. Confirmar la compra simulada, sin cobro real.
6. Consultar el comprobante de confirmación y el historial de compras.

**Reglas principales:**

- El catálogo público muestra solamente productos activos (`disponible = 1`).
- Solo los usuarios autenticados pueden registrar compras y consultar su historial.
- Cada historial pertenece al usuario identificado por el JWT; el cliente no decide el `usuario_id`.
- El backend valida productos, cantidades y disponibilidad, y calcula los importes utilizando los precios almacenados en MySQL.
- Las compras se registran mediante una transacción que incluye la compra y su detalle.
- Los productos se desactivan sin eliminarlos físicamente para conservar las referencias del historial.
- Solo los administradores pueden modificar el catálogo de confitería.

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
│   ├── schema.sql
│   └── tienda.sql
└── README.md
```

> La carpeta `database/` debe incluir los scripts necesarios para reproducir **todas** las tablas. Comprueba que `schema.sql` y `tienda.sql` estén actualizados antes de subirlos. Si `tienda.sql` es un script incremental, ejecútalo después del esquema principal y evita duplicar tablas ya creadas.

## Requisitos previos

- Node.js y npm instalados.
- MySQL Server en funcionamiento.
- Git para clonar el repositorio.
- Una herramienta para ejecutar SQL, como MySQL Workbench o DBeaver.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd cine-wrapped
```

### 2. Preparar la base de datos

Crea la base de datos MySQL `cine_db`:

```sql
CREATE DATABASE IF NOT EXISTS cine_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Ejecuta `database/schema.sql` si contiene el esquema actualizado y, cuando corresponda, `database/tienda.sql` para incorporar las tablas de confitería. Alternativamente, importa un respaldo SQL actualizado. **Verifica el contenido real de los scripts antes de ejecutarlos** y evita aplicar dos veces instrucciones de creación incompatibles.

Las tablas de confitería necesarias son `productos`, `compras_confiteria` y `detalle_compra_confiteria`.

> Crear las tablas no necesariamente carga películas, funciones, asientos ni productos de ejemplo. Para probar las compras deben existir registros apropiados.

### 3. Configurar y ejecutar el backend

```bash
cd backend
npm install
```

Crea `backend/.env` con los valores de tu instalación local:

```dotenv
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_LOCAL
DB_NAME=cine_db

JWT_SECRET=REEMPLAZAR_POR_UNA_CLAVE_LARGA_Y_ALEATORIA
JWT_EXPIRES_IN=2h
```

**Importante:** verifica los nombres exactos de variables utilizados en `backend/src/config/database.js` y en la configuración de JWT. Si difieren del ejemplo, utiliza los que espera tu código. **Nunca subas `.env` a Git.**

Inicia el servidor con el script definido en `backend/package.json`:

```bash
npm run dev
```

El backend utiliza normalmente `http://localhost:3000`.

### 4. Instalar y ejecutar el frontend

En **otra terminal**, desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

Abre la dirección indicada por Vite, normalmente `http://localhost:5173`.

> Actualmente, el frontend utiliza `http://localhost:3000` como dirección de la API en `frontend/src/services/api.js`. Si cambias el puerto del backend, actualiza también esa URL.

## Endpoints principales

### Autenticación, películas y entradas

| Método | Ruta                       | Función                                     |
| ------ | -------------------------- | ------------------------------------------- |
| POST   | `/auth/register`           | Registrar usuario                           |
| POST   | `/auth/login`              | Iniciar sesión                              |
| GET    | `/auth/me`                 | Consultar perfil autenticado                |
| GET    | `/peliculas`               | Listar películas                            |
| GET    | `/peliculas/:id`           | Consultar película                          |
| GET    | `/peliculas/:id/funciones` | Listar funciones de una película            |
| GET    | `/funciones/:id/asientos`  | Consultar disponibilidad de asientos        |
| POST   | `/entradas`                | Confirmar compra simulada de entradas       |
| GET    | `/usuarios/me/entradas`    | Consultar historial de entradas             |
| GET    | `/usuarios/me/wrapped`     | Consultar estadísticas de cine y confitería |

### Confitería

| Método | Ruta                                  | Función                       | Acceso        |
| ------ | ------------------------------------- | ----------------------------- | ------------- |
| GET    | `/productos`                          | Listar productos disponibles  | Público       |
| POST   | `/compras-confiteria`                 | Confirmar compra simulada     | Autenticado   |
| GET    | `/compras-confiteria/mis-compras`     | Consultar historial propio    | Autenticado   |
| GET    | `/admin/productos`                    | Listar todos los productos    | Administrador |
| POST   | `/admin/productos`                    | Crear producto                | Administrador |
| PUT    | `/admin/productos/:id`                | Editar producto               | Administrador |
| PATCH  | `/admin/productos/:id/disponibilidad` | Activar o desactivar producto | Administrador |

### Administración de películas y funciones

| Método | Ruta                   | Función           |
| ------ | ---------------------- | ----------------- |
| POST   | `/admin/peliculas`     | Crear película    |
| PUT    | `/admin/peliculas/:id` | Editar película   |
| DELETE | `/admin/peliculas/:id` | Eliminar película |
| POST   | `/admin/funciones`     | Crear función     |
| PUT    | `/admin/funciones/:id` | Editar función    |
| DELETE | `/admin/funciones/:id` | Eliminar función  |

Las rutas personales requieren un token JWT válido. Las rutas administrativas requieren, además, rol `admin`. El control de permisos se aplica en el backend mediante `verificarToken` y `verificarAdmin`.

## Modelo de datos

### Cine y entradas

- `usuarios`: cuentas y roles.
- `peliculas`: catálogo cinematográfico.
- `funciones`: horarios y salas de exhibición.
- `asientos`: ubicación de asientos por sala.
- `entradas`: compras simuladas y estado de entradas.
- `entrada_asientos`: relación entre entradas y asientos.

La disponibilidad depende de cada función. La restricción única `(funcion_id, asiento_id)` en `entrada_asientos`, junto con validaciones y transacciones en el backend, evita asignar dos veces el mismo asiento para una función.

### Confitería

- `productos`: nombre, descripción, categoría (`popcorn` o `bebida`), precio, imagen y disponibilidad.
- `compras_confiteria`: usuario, fecha, total y estado de la compra (`confirmada` o `cancelada`).
- `detalle_compra_confiteria`: productos comprados, cantidad, precio unitario y subtotal.

**Relaciones:** un usuario puede tener muchas compras de confitería; cada compra tiene uno o más detalles; cada detalle referencia un producto. El detalle conserva el precio unitario pagado para que las compras históricas no dependan de cambios posteriores en el precio del catálogo.

## Cine Wrapped

Las estadísticas se calculan desde MySQL para el usuario autenticado; no se almacena un resumen estático en una tabla independiente.

### Estadísticas de películas

1. Películas vistas, calculadas desde entradas confirmadas.
2. Minutos acumulados de películas.
3. Género más visto.
4. Mes con mayor actividad.
5. Última película según fecha y hora de la función.

### Estadísticas de confitería

1. **Cantidad de compras:** número de compras confirmadas.
2. **Total gastado:** suma de los importes de las compras confirmadas, presentada en pesos chilenos (CLP).
3. **Producto favorito:** producto con mayor cantidad total de unidades compradas. En caso de empate, se utiliza el ID menor como criterio de desempate.

Estas métricas se devuelven dentro de `wrapped.confiteria` en `GET /usuarios/me/wrapped`:

```json
{
  "confiteria": {
    "cantidadCompras": 4,
    "totalGastado": 17200,
    "productoFavorito": {
      "nombre": "Bebida pequeña",
      "cantidad": 4
    }
  }
}
```

> Valores ilustrativos del formato de respuesta. El endpoint también devuelve las estadísticas de películas.

Si el usuario no tiene compras confirmadas, el total y la cantidad son `0`, y el producto favorito es `null`.

## Pruebas y validaciones

Se han trabajado y probado durante el desarrollo:

- Registro e inicio de sesión y acceso por rol.
- Compra simulada de entradas y consulta de historial.
- Visualización del catálogo de confitería y funcionamiento del carrito.
- Confirmación de compras de confitería y consulta del historial personal.
- Creación de productos por un administrador.
- Gestión de productos desde el panel administrativo.
- Integración y visualización de estadísticas de confitería en Cine Wrapped.
- Comprobaciones de permisos, productos desactivados y acceso al historial propio.

Para una entrega académica, conviene conservar capturas, resultados de consultas y casos de prueba reproducibles. El README describe funcionalidades, pero no sustituye la evidencia formal de pruebas.

> En la revisión anterior del MVP se reportaron **24 requisitos funcionales y 12 no funcionales**. El módulo de confitería amplía ese alcance; si se actualiza la matriz de requisitos, debe revisarse también el conteo total.

## Alcance y limitaciones

El sistema representa **un solo cine** con varias salas. Las compras de entradas y confitería son simuladas: no se solicita ni procesa información bancaria. La confitería funciona de manera independiente de la compra de entradas. Esta versión académica no incluye aplicación móvil nativa, pasarela de pagos ni integración con sistemas externos de cine.

## Notas para desarrollo colaborativo

- Cada integrante debe instalar las dependencias de `backend` y `frontend`.
- Cada integrante necesita su propio archivo `.env` con la configuración local.
- **Clonar el repositorio no copia automáticamente la base de datos MySQL.** Es necesario ejecutar los scripts actualizados o importar un respaldo.
- Antes de compartir el proyecto, comprueba que el esquema incluya las tablas de confitería y que existan datos de prueba cuando se necesiten.
- No incluyas contraseñas, claves JWT, tokens ni archivos `.env` en los commits.
- Antes de subir cambios, verifica que frontend, backend y base de datos estén funcionando.
