-- =====================================================
-- CINE WRAPPED
-- Script de creación de la base de datos
-- =====================================================

CREATE DATABASE IF NOT EXISTS cine_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cine_db;


-- =====================================================
-- TABLA: usuarios
-- =====================================================

CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('usuario', 'admin') NOT NULL DEFAULT 'usuario',
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_usuarios_email UNIQUE (email)
) ENGINE=InnoDB;


-- =====================================================
-- TABLA: peliculas
-- =====================================================

CREATE TABLE peliculas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    sinopsis TEXT NOT NULL,
    duracion SMALLINT UNSIGNED NOT NULL,
    genero VARCHAR(50) NOT NULL,
    director VARCHAR(150) NOT NULL,
    poster VARCHAR(500),
    fecha_estreno DATE,

    CONSTRAINT chk_peliculas_duracion
        CHECK (duracion > 0)
) ENGINE=InnoDB;


-- =====================================================
-- TABLA: funciones
-- =====================================================

CREATE TABLE funciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pelicula_id INT UNSIGNED NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    sala INT UNSIGNED NOT NULL,

    CONSTRAINT fk_funciones_pelicula
        FOREIGN KEY (pelicula_id)
        REFERENCES peliculas(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT chk_funciones_sala
        CHECK (sala > 0),

    INDEX idx_funciones_pelicula_fecha (pelicula_id, fecha)
) ENGINE=InnoDB;


-- =====================================================
-- TABLA: asientos
-- =====================================================

CREATE TABLE asientos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sala INT UNSIGNED NOT NULL,
    fila VARCHAR(5) NOT NULL,
    numero INT UNSIGNED NOT NULL,

    CONSTRAINT uq_asientos_sala_fila_numero
        UNIQUE (sala, fila, numero),

    CONSTRAINT chk_asientos_sala
        CHECK (sala > 0),

    CONSTRAINT chk_asientos_numero
        CHECK (numero > 0)
) ENGINE=InnoDB;


-- =====================================================
-- TABLA: entradas
-- =====================================================

CREATE TABLE entradas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    funcion_id INT UNSIGNED NOT NULL,
    fecha_compra DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    codigo VARCHAR(50) NOT NULL,
    estado ENUM('confirmada', 'cancelada')
        NOT NULL DEFAULT 'confirmada',

    CONSTRAINT uq_entradas_codigo
        UNIQUE (codigo),

    -- Necesario para la FK compuesta de entrada_asientos.
    -- También garantiza que entrada_id y funcion_id puedan
    -- validarse conjuntamente.
    CONSTRAINT uq_entrada_funcion
        UNIQUE (id, funcion_id),

    CONSTRAINT fk_entradas_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_entradas_funcion
        FOREIGN KEY (funcion_id)
        REFERENCES funciones(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_entradas_usuario (usuario_id),
    INDEX idx_entradas_funcion (funcion_id)
) ENGINE=InnoDB;


-- =====================================================
-- TABLA: entrada_asientos
-- =====================================================

CREATE TABLE entrada_asientos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entrada_id INT UNSIGNED NOT NULL,
    funcion_id INT UNSIGNED NOT NULL,
    asiento_id INT UNSIGNED NOT NULL,

    -- Garantiza que la función indicada aquí sea realmente
    -- la función asociada a la entrada.
    CONSTRAINT fk_entrada_asientos_entrada_funcion
        FOREIGN KEY (entrada_id, funcion_id)
        REFERENCES entradas(id, funcion_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_entrada_asientos_asiento
        FOREIGN KEY (asiento_id)
        REFERENCES asientos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    -- Impide que un mismo asiento sea asignado dos veces
    -- para una misma función.
    CONSTRAINT uq_funcion_asiento
        UNIQUE (funcion_id, asiento_id),

    INDEX idx_entrada_asientos_entrada (entrada_id),
    INDEX idx_entrada_asientos_funcion (funcion_id)
) ENGINE=InnoDB;