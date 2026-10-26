-- =====================================================
-- CINE WRAPPED - MÓDULO DE CONFITERÍA
-- =====================================================

-- Seleccionamos la base de datos existente.
USE cine_db;

-- =====================================================
-- TABLA: PRODUCTOS
-- =====================================================

-- Almacena los productos disponibles en confitería.
CREATE TABLE IF NOT EXISTS productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    nombre VARCHAR(150) NOT NULL,

    descripcion TEXT,

    categoria ENUM('popcorn', 'bebida') NOT NULL,

    precio DECIMAL(10,2) NOT NULL,

    imagen VARCHAR(500),

    disponible BOOLEAN NOT NULL DEFAULT TRUE,

    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Impedimos registrar precios negativos o iguales a cero.
    CONSTRAINT chk_producto_precio
        CHECK (precio > 0)
);

-- =====================================================
-- TABLA: COMPRAS DE CONFITERÍA
-- =====================================================

-- Registra quién realizó la compra y su total.
CREATE TABLE IF NOT EXISTS compras_confiteria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT UNSIGNED NOT NULL,

    fecha_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    total DECIMAL(10,2) NOT NULL,

    estado ENUM('confirmada', 'cancelada')
        NOT NULL DEFAULT 'confirmada',

    -- Cada compra pertenece a un usuario existente.
    CONSTRAINT fk_compra_confiteria_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    -- El total no puede ser negativo.
    CONSTRAINT chk_compra_confiteria_total
        CHECK (total >= 0),

    -- Facilita consultar las compras de cada usuario.
    INDEX idx_compras_confiteria_usuario (usuario_id)
);

-- =====================================================
-- TABLA: DETALLE DE COMPRA
-- =====================================================

-- Guarda cada producto incluido en una compra.
CREATE TABLE IF NOT EXISTS detalle_compra_confiteria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    compra_id INT UNSIGNED NOT NULL,

    producto_id INT UNSIGNED NOT NULL,

    cantidad INT UNSIGNED NOT NULL,

    -- Conservamos el precio al momento de la compra.
    -- Así, una modificación futura del catálogo
    -- no altera los registros históricos.
    precio_unitario DECIMAL(10,2) NOT NULL,

    subtotal DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_detalle_confiteria_compra
        FOREIGN KEY (compra_id)
        REFERENCES compras_confiteria(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_detalle_confiteria_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos(id)
        ON DELETE RESTRICT,

    -- Evita repetir el mismo producto en una compra.
    CONSTRAINT uq_compra_producto
        UNIQUE (compra_id, producto_id),

    -- Validaciones de cantidades e importes.
    CONSTRAINT chk_detalle_confiteria_cantidad
        CHECK (cantidad > 0),

    CONSTRAINT chk_detalle_confiteria_precio
        CHECK (precio_unitario > 0),

    CONSTRAINT chk_detalle_confiteria_subtotal
        CHECK (subtotal >= 0)
);

-- =====================================================
-- PRODUCTOS INICIALES DE CONFITERÍA
-- =====================================================

-- Insertamos productos para probar el catálogo.
-- Ejecutar este bloque una sola vez para evitar duplicados.

INSERT INTO productos
    (nombre, descripcion, categoria, precio)
VALUES
    (
        'Popcorn pequeño',
        'Palomitas de maíz tamaño pequeño.',
        'popcorn',
        2500
    ),
    (
        'Popcorn mediano',
        'Palomitas de maíz tamaño mediano.',
        'popcorn',
        3500
    ),
    (
        'Popcorn grande',
        'Palomitas de maíz tamaño grande.',
        'popcorn',
        4500
    ),
    (
        'Bebida pequeña',
        'Bebida de fantasía tamaño pequeño.',
        'bebida',
        1800
    ),
    (
        'Bebida mediana',
        'Bebida de fantasía tamaño mediano.',
        'bebida',
        2500
    ),
    (
        'Bebida grande',
        'Bebida de fantasía tamaño grande.',
        'bebida',
        3000
    );