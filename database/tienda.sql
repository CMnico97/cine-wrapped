-- =====================================================
-- CINE WRAPPED - MÓDULO DE CONFITERÍA (ACTUALIZADO)
-- Instalación inicial: ejecutar DESPUÉS de schema.sql.
-- No ejecutar sobre tablas que ya contienen datos.
-- MySQL 8.0.16+
-- =====================================================
USE cine_db;

-- Productos del catálogo público y administración.
CREATE TABLE productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria ENUM('popcorn', 'bebida') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    imagen VARCHAR(500),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_producto_precio CHECK (precio > 0)
) ENGINE=InnoDB;

-- Compras simuladas; total = subtotal - descuento_puntos.
-- Los campos nuevos permiten guardar el canje de puntos.
CREATE TABLE compras_confiteria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    fecha_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    puntos_utilizados INT UNSIGNED NOT NULL DEFAULT 0,
    descuento_puntos DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('confirmada', 'cancelada') NOT NULL DEFAULT 'confirmada',
    CONSTRAINT fk_compra_confiteria_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_compra_confiteria_total CHECK (total >= 0),
    CONSTRAINT chk_compra_confiteria_subtotal CHECK (subtotal >= 0),
    CONSTRAINT chk_compra_confiteria_descuento CHECK (descuento_puntos >= 0),
    CONSTRAINT chk_compra_confiteria_importes CHECK (total = subtotal - descuento_puntos),
    INDEX idx_compras_confiteria_usuario (usuario_id)
) ENGINE=InnoDB;

-- Productos comprados: se conserva el precio unitario histórico.
CREATE TABLE detalle_compra_confiteria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    compra_id INT UNSIGNED NOT NULL,
    producto_id INT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_confiteria_compra
        FOREIGN KEY (compra_id) REFERENCES compras_confiteria(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_detalle_confiteria_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_compra_producto UNIQUE (compra_id, producto_id),
    CONSTRAINT chk_detalle_confiteria_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_detalle_confiteria_precio CHECK (precio_unitario > 0),
    CONSTRAINT chk_detalle_confiteria_subtotal CHECK (subtotal >= 0)
) ENGINE=InnoDB;

-- Datos de ejemplo. Ejecutar una sola vez para no duplicar productos.
INSERT INTO productos (nombre, descripcion, categoria, precio) VALUES
('Popcorn pequeño', 'Palomitas de maíz tamaño pequeño.', 'popcorn', 2500),
('Popcorn mediano', 'Palomitas de maíz tamaño mediano.', 'popcorn', 3500),
('Popcorn grande', 'Palomitas de maíz tamaño grande.', 'popcorn', 4500),
('Bebida pequeña', 'Bebida de fantasía tamaño pequeño.', 'bebida', 1800),
('Bebida mediana', 'Bebida de fantasía tamaño mediano.', 'bebida', 2500),
('Bebida grande', 'Bebida de fantasía tamaño grande.', 'bebida', 3000);
