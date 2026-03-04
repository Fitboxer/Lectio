use database lectioV;
CREATE TABLE roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  fecha_nac DATE,
  imagen TEXT,
  rol_id INT UNSIGNED,
  banned TINYINT(1) DEFAULT 0,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (rol_id),
  CONSTRAINT fk_usuarios_roles
    FOREIGN KEY (rol_id) REFERENCES roles(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

CREATE TABLE editorial (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  pais VARCHAR(60),
  sitio_web TEXT
);

CREATE TABLE autor (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  pais VARCHAR(60)
);

CREATE TABLE genero (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE formato (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE  -- 'Físico', 'eBook', 'Audiolibro'
);

CREATE TABLE publico_objetivo (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE  -- 'Infantil', 'Juvenil', 'Adulto'
);

CREATE TABLE libro (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titulo TEXT NOT NULL,
  subtitulo TEXT,
  sinopsis TEXT,
  isbn13 VARCHAR(13) UNIQUE,
  paginas INT CHECK (paginas IS NULL OR paginas > 0),
  imagen TEXT,
  anio_publicacion INT,
  idioma VARCHAR(30),
  editorial_id INT UNSIGNED,
  formato_id INT UNSIGNED,
  publico_id INT UNSIGNED,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (editorial_id),
  INDEX (formato_id),
  INDEX (publico_id),
  CONSTRAINT fk_libro_editorial
    FOREIGN KEY (editorial_id) REFERENCES editorial(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_libro_formato
    FOREIGN KEY (formato_id) REFERENCES formato(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_libro_publico
    FOREIGN KEY (publico_id) REFERENCES publico_objetivo(id)
    ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE libro_generos (
  libro_id INT UNSIGNED NOT NULL,
  genero_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (libro_id, genero_id),
  INDEX (genero_id),
  CONSTRAINT fk_lg_libro
    FOREIGN KEY (libro_id) REFERENCES libro(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_lg_genero
    FOREIGN KEY (genero_id) REFERENCES genero(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE libro_autores (
  libro_id INT UNSIGNED NOT NULL,
  autor_id INT UNSIGNED NOT NULL,
  rol_autoria ENUM('Autor','Coautor','Traductor') NOT NULL DEFAULT 'Autor',
  PRIMARY KEY (libro_id, autor_id, rol_autoria),
  INDEX (autor_id),
  CONSTRAINT fk_la_libro
    FOREIGN KEY (libro_id) REFERENCES libro(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_la_autor
    FOREIGN KEY (autor_id) REFERENCES autor(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE estado (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre ENUM('Leyendo','Pendiente','Abandonado','Terminado') NOT NULL UNIQUE
);

CREATE TABLE usuarios_libros (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  libro_id INT UNSIGNED NOT NULL,
  fecha_agregado DATE DEFAULT (CURRENT_DATE),
  UNIQUE KEY uq_usuario_libro (usuario_id, libro_id),
  INDEX (usuario_id),
  INDEX (libro_id),
  CONSTRAINT fk_ul_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ul_libro
    FOREIGN KEY (libro_id) REFERENCES libro(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE usuarios_libros_estados (
  usuario_libro_id INT UNSIGNED NOT NULL,
  estado_id INT UNSIGNED NOT NULL,
  fecha_estado TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  nota_personal TEXT,
  PRIMARY KEY (usuario_libro_id, fecha_estado),
  INDEX (estado_id),
  CONSTRAINT fk_ule_ul
    FOREIGN KEY (usuario_libro_id) REFERENCES usuarios_libros(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_ule_estado
    FOREIGN KEY (estado_id) REFERENCES estado(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE notas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    libro_id BIGINT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    fecha_actualizacion DATETIME,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libro(id) ON DELETE CASCADE,
    
    INDEX idx_usuario_libro (usuario_id, libro_id)
);

CREATE TABLE IF NOT EXISTS comentarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    libro_id BIGINT NOT NULL,
    contenido VARCHAR(500) NOT NULL,
    fecha_creacion DATETIME NOT NULL,
    editado BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (libro_id) REFERENCES libro(id) ON DELETE CASCADE,
    INDEX idx_libro_fecha (libro_id, fecha_creacion DESC)
);