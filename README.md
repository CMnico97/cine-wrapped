# Cine Wrapped

Plataforma web para **un solo cine** que permite consultar películas y funciones, seleccionar asientos, realizar compras simuladas de entradas y productos de confitería, y visualizar estadísticas personales mediante **Cine Wrapped**. Incluye un **programa de puntos y recompensas** para acumular puntos y canjearlos por descuentos en futuras compras.

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
- Historial de entradas con datos de la función, asientos, subtotal, descuento y total pagado (cuando están disponibles).
- Perfil personal.
- **Confitería:** catálogo público de popcorn y bebidas, carrito, cantidades y compra simulada para usuarios autenticados.
- **Historial de confitería:** compras realizadas, productos, cantidades, subtotales, puntos canjeados, descuentos y total pagado.
- **Programa de puntos:** acumulación y canje en entradas y confitería, consulta de saldo e historial de movimientos.
- **Cine Wrapped:** películas vistas, minutos acumulados, género más visto, mes más activo y última película; además, total gastado en confitería, cantidad de compras y producto favorito.

### Administrador

- Acceso a un panel administrativo según rol.
- Crear, editar y eliminar películas.
- Crear, editar y eliminar funciones, incluyendo la configuración del precio de entrada.
- Restricción de eliminación de funciones que ya tienen entradas asociadas, para preservar la integridad de los datos.
- **Administrar confitería:** listar productos activos e inactivos, agregar, editar, activar y desactivar productos.
- Utilizar las funcionalidades normales de usuario, incluida la compra de entradas y confitería y el programa de puntos.

## Sistema de puntos y recompensas

El programa de puntos está disponible para usuarios autenticados, incluidos los administradores. Los puntos se acumulan en **compras confirmadas** de entradas y confitería y pueden canjearse por descuentos en compras posteriores o en la misma operación si ya existe saldo suficiente.

| Regla | Valor |
| --- | --- |
| Acumulación | 1 punto por cada $100 CLP efectivamente pagados |
| Valor de canje | 1 punto equivale a $10 CLP de descuento |
| Descuento máximo | 50 % del subtotal de cada compra |
| Saldo mínimo | 0 puntos; no se permite saldo negativo |
| Operaciones compatibles | Entradas y confitería |
| Compras anteriores | No se otorgan puntos retroactivamente |

Los puntos ganados se calculan sobre el **total después del descuento**. El backend valida los puntos solicitados, el saldo disponible y el límite de descuento; los cálculos del frontend son solo informativos.

**Ejemplo de compra de confitería:**

| Concepto | Importe |
| --- | ---: |
| Subtotal | $6.000 |
| Puntos canjeados | 45 |
| Descuento | −$450 |
| Total pagado | $5.550 |
| Puntos ganados | +55 |

El saldo final se obtiene descontando los puntos canjeados y sumando los ganados.

### Registro de puntos y consistencia

- `billeteras_puntos` conserva el saldo actual por usuario.
- `movimientos_puntos` registra cada acumulación o canje, su origen (`entrada` o `confiteria`), la compra relacionada y la fecha.
- La compra, sus detalles y los movimientos de puntos se registran dentro de una **transacción MySQL**. Si falla alguna operación, se revierten los cambios.
- El servicio bloquea la billetera durante la operación para validar el saldo y evitar canjes concurrentes que lo dejen negativo.
- Los movimientos se consultan exclusivamente para el usuario identificado por el JWT.

### Pantalla «Mis puntos»

La ruta `/mis-puntos` permite consultar:

- Saldo disponible.
- Movimientos de **acumulación** (signo `+`) y **canje** (signo `−`).
- Origen de cada movimiento, número de compra y fecha.

La opción **Mis puntos** aparece en la barra de navegación cuando existe una sesión iniciada.

## Módulo de confitería

La confitería es un módulo **independiente de la compra de entradas**: no requiere seleccionar una película o función.

**Flujo de compra:**

1. Consultar el catálogo de popcorn y bebidas disponibles.
2. Agregar productos al carrito y ajustar cantidades.
3. Revisar el subtotal y, si hay una sesión iniciada, los puntos disponibles.
4. Elegir los puntos que se desean canjear, respetando el límite del 50 %.
5. Confirmar la compra simulada, sin cobro real.
6. Consultar el total pagado, los puntos utilizados y ganados, y el historial de compras.

**Reglas principales:**

- El catálogo público muestra solamente productos activos (`disponible = 1`).
- Solo los usuarios autenticados pueden registrar compras y consultar su historial.
- Cada historial pertenece al usuario identificado por el JWT; el cliente no decide el `usuario_id`.
- El backend valida productos, cantidades, disponibilidad y puntos, y calcula los importes con precios almacenados en MySQL.
- Las compras y sus movimientos de puntos se registran mediante una transacción.
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

> **Importante:** la estructura de `database/` corresponde a la documentada en el proyecto. Comprueba que los scripts realmente existan y estén actualizados. El esquema compartido debe incluir también las tablas y columnas del sistema de puntos; no basta con los scripts antiguos de cine y confitería.

## Requisitos previos

- Node.js y npm.
- MySQL Server.
- Git para clonar el repositorio.
- Una herramienta SQL, como DBeaver o MySQL Workbench.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone URL_DEL_REPOSITORIO
cd cine-wrapped
```

Sustituye `URL_DEL_REPOSITORIO` por la dirección real del repositorio.

### 2. Preparar la base de datos

Crea la base de datos MySQL `cine_db`:

```sql
CREATE DATABASE IF NOT EXISTS cine_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Ejecuta los scripts SQL actualizados del repositorio o importa un respaldo actualizado. Si `database/tienda.sql` es incremental, aplícalo después del esquema principal y evita duplicar tablas.

**Verifica que el esquema incluya:**

- Tablas de cine: `usuarios`, `peliculas`, `funciones`, `asientos`, `entradas` y `entrada_asientos`.
- Tablas de confitería: `productos`, `compras_confiteria` y `detalle_compra_confiteria`.
- Tablas de recompensas: `billeteras_puntos` y `movimientos_puntos`.
- Columnas de importes y canje en `entradas` y `compras_confiteria`.
- Precio de entrada en `funciones.precio_entrada`.

> Crear las tablas no necesariamente carga películas, funciones, asientos ni productos de ejemplo. Para probar las compras deben existir registros apropiados. **No se incluye aquí un script de migración completo**: verifica el esquema real antes de instalar desde cero.

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

**Importante:** verifica los nombres exactos de variables utilizados en `backend/src/config/database.js` y en la configuración JWT. Si difieren del ejemplo, utiliza los que espera el código. **Nunca subas `.env` a Git.**

Inicia el servidor con el script definido en `backend/package.json`:

```bash
npm run dev
```

El backend utiliza normalmente `http://localhost:3000`. Si el proyecto no define `dev`, revisa los scripts con `npm run`.

### 4. Instalar y ejecutar el frontend

En **otra terminal**, desde la raíz del repositorio:

```bash
cd frontend
npm install
npm run dev
```

Abre la dirección indicada por Vite, normalmente `http://localhost:5173`.

> El frontend utiliza `http://localhost:3000` como dirección de la API en `frontend/src/services/api.js`. Si cambias el puerto del backend, actualiza también esa URL.

## Endpoints principales

### Autenticación, películas y entradas

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/auth/register` | Registrar usuario |
| POST | `/auth/login` | Iniciar sesión |
| GET | `/auth/me` | Consultar perfil autenticado |
| GET | `/peliculas` | Listar películas |
| GET | `/peliculas/:id` | Consultar película |
| GET | `/peliculas/:id/funciones` | Listar funciones de una película |
| GET | `/funciones/:id/asientos` | Consultar disponibilidad de asientos |
| POST | `/entradas` | Confirmar compra simulada; admite `puntos_utilizados` |
| GET | `/usuarios/me/entradas` | Consultar historial de entradas |
| GET | `/usuarios/me/wrapped` | Consultar estadísticas de cine y confitería |

### Confitería

| Método | Ruta | Función | Acceso |
| --- | --- | --- | --- |
| GET | `/productos` | Listar productos disponibles | Público |
| POST | `/compras-confiteria` | Confirmar compra simulada; admite `puntos_utilizados` | Autenticado |
| GET | `/compras-confiteria/mis-compras` | Consultar historial propio | Autenticado |
| GET | `/admin/productos` | Listar todos los productos | Administrador |
| POST | `/admin/productos` | Crear producto | Administrador |
| PUT | `/admin/productos/:id` | Editar producto | Administrador |
| PATCH | `/admin/productos/:id/disponibilidad` | Activar o desactivar producto | Administrador |

### Puntos y recompensas

| Método | Ruta | Función | Acceso |
| --- | --- | --- | --- |
| GET | `/usuarios/me/puntos` | Consultar saldo y reglas de puntos | Autenticado |
| GET | `/usuarios/me/puntos/movimientos` | Consultar acumulaciones y canjes | Autenticado |

**Ejemplo de respuesta de saldo:**

```json
{
  "ok": true,
  "puntos": {
    "saldo": 55,
    "valor_por_punto": 10,
    "pesos_por_punto_ganado": 100,
    "descuento_maximo_porcentaje": 50
  }
}
```

**Ejemplo de movimiento:**

```json
{
  "id": 5,
  "tipo": "acumulacion",
  "origen": "confiteria",
  "compra_id": 5,
  "puntos": 55,
  "fecha_movimiento": "2026-10-27T22:12:35.000Z"
}
```

Los valores son ilustrativos. Las rutas personales requieren un JWT válido mediante el encabezado `Authorization: Bearer TOKEN`.

### Administración de películas y funciones

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/admin/peliculas` | Crear película |
| PUT | `/admin/peliculas/:id` | Editar película |
| DELETE | `/admin/peliculas/:id` | Eliminar película |
| POST | `/admin/funciones` | Crear función |
| PUT | `/admin/funciones/:id` | Editar función |
| DELETE | `/admin/funciones/:id` | Eliminar función |

Las rutas administrativas requieren rol `admin`; los permisos se comprueban en el backend mediante los middlewares correspondientes.

## Modelo de datos

### Cine y entradas

- `usuarios`: cuentas y roles.
- `peliculas`: catálogo cinematográfico.
- `funciones`: horarios, salas y `precio_entrada`.
- `asientos`: ubicación de asientos por sala.
- `entradas`: compras simuladas, código, estado, `subtotal`, `puntos_utilizados`, `descuento_puntos` y `total`.
- `entrada_asientos`: relación entre entradas y asientos.

La disponibilidad depende de cada función. El backend valida y registra los asientos mediante transacciones para impedir su asignación doble en una misma función.

### Confitería

- `productos`: nombre, descripción, categoría (`popcorn` o `bebida`), precio, imagen y disponibilidad.
- `compras_confiteria`: usuario, fecha, estado, `subtotal`, `puntos_utilizados`, `descuento_puntos` y `total`.
- `detalle_compra_confiteria`: productos comprados, cantidad, precio unitario y subtotal.

Un usuario puede tener muchas compras de confitería; cada compra tiene uno o más detalles. El detalle conserva el precio unitario registrado para que el historial no dependa de cambios posteriores del catálogo.

### Puntos

- `billeteras_puntos`: una billetera por usuario, con saldo actual y fecha de actualización.
- `movimientos_puntos`: historial de acumulaciones y canjes, con tipo, origen, compra relacionada, puntos y fecha.

La consulta de movimientos se filtra por `usuario_id` obtenido del JWT. El saldo y los movimientos se actualizan dentro de la transacción de cada compra.

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
2. **Total gastado:** suma de importes de compras confirmadas, en CLP.
3. **Producto favorito:** producto con mayor cantidad total de unidades compradas; ante empate, ID menor.

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

Valores ilustrativos del formato de respuesta; el endpoint también devuelve las estadísticas de películas. Si no hay compras confirmadas, la cantidad y el total son `0`, y el producto favorito es `null`.

> **Nota:** el saldo y el historial de puntos ya están disponibles en **Mis puntos**. Su incorporación como nuevas métricas dentro del resumen principal de Cine Wrapped queda como posible mejora futura.

## Pruebas y validaciones

Se han trabajado y probado durante el desarrollo:

- Registro, inicio de sesión y acceso según rol.
- Compra simulada de entradas y consulta de historial.
- Catálogo de confitería, carrito, confirmación de compras e historial personal.
- Gestión de productos desde el panel administrativo.
- Estadísticas de cine y confitería en Cine Wrapped.
- Acumulación y canje de puntos en entradas y confitería.
- Visualización del saldo y movimientos desde `/mis-puntos`.
- Registro de descuentos, puntos utilizados y totales pagados en los historiales.

**Casos funcionales comprobados el 27 de octubre de 2026:**

| Caso | Subtotal | Canje | Descuento | Total | Puntos ganados |
| --- | ---: | ---: | ---: | ---: | ---: |
| Entrada #15 | $5.000 | 48 | $480 | $4.520 | 45 |
| Confitería #5 | $6.000 | 45 | $450 | $5.550 | 55 |

Se comprobó que el saldo posterior era de **55 puntos** y que el historial de movimientos se consultaba correctamente desde Express y React.

**Pruebas adicionales recomendadas:** intentos de canje con saldo insuficiente, superación del límite del 50 %, puntos negativos o decimales, tokens inválidos, compras simultáneas y doble reserva de asientos. Estas pruebas deben documentarse por separado; no se presentan aquí como verificadas.

Para una entrega académica conviene conservar capturas, resultados de consultas y casos de prueba reproducibles. El README no sustituye la evidencia formal de pruebas.

> En una revisión anterior del MVP se reportaron **24 requisitos funcionales y 12 no funcionales**. La incorporación de confitería y puntos amplía el alcance; el conteo debe actualizarse en la matriz de requisitos si corresponde.

## Alcance y limitaciones

El sistema representa **un solo cine** con varias salas. Las compras de entradas y confitería son simuladas: no se solicita ni procesa información bancaria. La confitería funciona de forma independiente de la compra de entradas. Esta versión académica no incluye aplicación móvil nativa, pasarela de pagos ni integración con sistemas externos de cine.

## Notas para desarrollo colaborativo

- Cada integrante debe instalar las dependencias de `backend` y `frontend`.
- Cada integrante necesita su propio archivo `.env` con la configuración local.
- **Clonar el repositorio no copia automáticamente la base de datos MySQL.** Deben ejecutarse los scripts actualizados o importarse un respaldo.
- Antes de compartir el proyecto, comprueba que el esquema incluya cine, confitería y **puntos**, y que existan datos de prueba cuando se necesiten.
- No incluyas contraseñas, claves JWT, tokens ni archivos `.env` en los commits.
- Antes de subir cambios, verifica que frontend, backend y base de datos estén funcionando.

## Registro de cambios

### 27 de octubre de 2026 — Sistema de puntos

- Integración de puntos en compras simuladas de entradas y confitería.
- Registro transaccional de billeteras y movimientos de acumulación/canje.
- Descuentos limitados al 50 % y puntos ganados según el importe pagado.
- Resúmenes económicos en historiales de entradas y confitería.
- Nueva página **Mis puntos**, con saldo e historial de movimientos.
- Nueva ruta protegida de consulta de movimientos y enlace en la barra de navegación.
- Correcciones visuales y de cálculo en las pantallas de confitería e historial de entradas.
