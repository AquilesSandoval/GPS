-- =====================================================
-- SGPTI - Sistema de Gestión de Proyectos de Titulación
-- Migración: Crear tablas de proyectos (RF02, RF04, RF06)
-- =====================================================

-- Estados de proyecto
CREATE TABLE IF NOT EXISTS project_statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  color VARCHAR(7) DEFAULT '#6B7280' COMMENT 'Color hexadecimal para UI',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar estados predefinidos
INSERT INTO project_statuses (name, description, color, sort_order) VALUES
  ('borrador', 'Proyecto en borrador, no enviado', '#9CA3AF', 1),
  ('postulado', 'Proyecto enviado para revisión inicial', '#3B82F6', 2),
  ('en_revision', 'Proyecto siendo revisado por docentes asignados', '#F59E0B', 3),
  ('requiere_cambios', 'El proyecto necesita modificaciones', '#EF4444', 4),
  ('aprobado', 'Proyecto aprobado por el comité', '#10B981', 5),
  ('rechazado', 'Proyecto rechazado definitivamente', '#DC2626', 6),
  ('archivado', 'Proyecto finalizado y archivado en biblioteca', '#6366F1', 7);

-- Tipos de proyecto
CREATE TABLE IF NOT EXISTS project_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar tipos de proyecto
INSERT INTO project_types (name, description) VALUES
  ('tesis', 'Trabajo de investigación para obtener título'),
  ('tesina', 'Trabajo de investigación menor'),
  ('proyecto_investigacion', 'Proyecto de investigación académica'),
  ('memoria_profesional', 'Memoria de experiencia profesional'),
  ('informe_practicas', 'Informe de prácticas profesionales');

-- Tabla principal de proyectos
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  abstract TEXT COMMENT 'Resumen del proyecto',
  keywords VARCHAR(500) COMMENT 'Palabras clave separadas por coma',
  type_id INT NOT NULL,
  status_id INT NOT NULL DEFAULT 1,
  submitted_at TIMESTAMP NULL COMMENT 'Fecha de postulación',
  approved_at TIMESTAMP NULL COMMENT 'Fecha de aprobación',
  archived_at TIMESTAMP NULL COMMENT 'Fecha de archivo en biblioteca',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (type_id) REFERENCES project_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (status_id) REFERENCES project_statuses(id) ON DELETE RESTRICT,
  INDEX idx_status (status_id),
  INDEX idx_type (type_id),
  INDEX idx_title (title(100)),
  FULLTEXT INDEX idx_fulltext_search (title, abstract, keywords)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Autores del proyecto (relación muchos a muchos con estudiantes)
CREATE TABLE IF NOT EXISTS project_authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  user_id INT NOT NULL,
  is_main_author BOOLEAN DEFAULT FALSE COMMENT 'Indica si es el autor principal',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_author (project_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Etapas de entregables
CREATE TABLE IF NOT EXISTS deliverable_stages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar etapas predefinidas
INSERT INTO deliverable_stages (name, description, sort_order) VALUES
  ('propuesta', 'Propuesta inicial del proyecto', 1),
  ('anteproyecto', 'Documento de anteproyecto', 2),
  ('avance_1', 'Primer avance del proyecto', 3),
  ('avance_2', 'Segundo avance del proyecto', 4),
  ('borrador_final', 'Borrador de versión final', 5),
  ('version_final', 'Versión final aprobada', 6),
  ('correccion_formato', 'Correcciones de formato biblioteca', 7);

-- Documentos/entregables del proyecto (RF04)
CREATE TABLE IF NOT EXISTS project_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  project_id INT NOT NULL,
  stage_id INT NOT NULL,
  uploaded_by INT NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(255) NOT NULL COMMENT 'Nombre en el servidor',
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL COMMENT 'Tamaño en bytes',
  mime_type VARCHAR(100) NOT NULL,
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE COMMENT 'Indica si es la versión actual',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (stage_id) REFERENCES deliverable_stages(id) ON DELETE RESTRICT,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_project (project_id),
  INDEX idx_stage (stage_id),
  INDEX idx_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
