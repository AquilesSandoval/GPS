-- =====================================================
-- SGPTI - Sistema de Gestión de Proyectos de Titulación
-- Migración: Crear tablas para búsqueda y archivo (RF08)
-- =====================================================

-- Registro de archivo en biblioteca
CREATE TABLE IF NOT EXISTS library_archives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL UNIQUE,
  archived_by INT NOT NULL COMMENT 'Usuario de biblioteca que archivó',
  catalog_number VARCHAR(100) UNIQUE COMMENT 'Número de catálogo en biblioteca',
  physical_location VARCHAR(255) COMMENT 'Ubicación física si aplica',
  digital_location VARCHAR(500) COMMENT 'URL o path del archivo digital',
  format_validated BOOLEAN DEFAULT FALSE,
  format_validated_at TIMESTAMP NULL,
  format_validated_by INT DEFAULT NULL,
  notes TEXT,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (archived_by) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (format_validated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_catalog (catalog_number),
  INDEX idx_archived_at (archived_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Etiquetas/Tags para proyectos (mejora búsqueda)
CREATE TABLE IF NOT EXISTS tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relación proyectos-tags
CREATE TABLE IF NOT EXISTS project_tags (
  project_id INT NOT NULL,
  tag_id INT NOT NULL,
  
  PRIMARY KEY (project_id, tag_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log de búsquedas (para analytics)
CREATE TABLE IF NOT EXISTS search_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT DEFAULT NULL,
  search_query VARCHAR(500) NOT NULL,
  filters JSON DEFAULT NULL,
  results_count INT DEFAULT 0,
  searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_searched_at (searched_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vista para búsqueda optimizada de proyectos
CREATE OR REPLACE VIEW v_project_search AS
SELECT 
  p.id,
  p.uuid,
  p.title,
  p.abstract,
  p.keywords,
  pt.name as project_type,
  ps.name as status,
  ps.color as status_color,
  GROUP_CONCAT(DISTINCT CONCAT(u.first_name, ' ', u.last_name) SEPARATOR ', ') as authors,
  GROUP_CONCAT(DISTINCT CONCAT(r.first_name, ' ', r.last_name) SEPARATOR ', ') as reviewers,
  GROUP_CONCAT(DISTINCT t.name SEPARATOR ', ') as tags,
  p.submitted_at,
  p.approved_at,
  p.created_at
FROM projects p
JOIN project_types pt ON p.type_id = pt.id
JOIN project_statuses ps ON p.status_id = ps.id
LEFT JOIN project_authors pa ON p.id = pa.project_id
LEFT JOIN users u ON pa.user_id = u.id
LEFT JOIN project_reviewers pr ON p.id = pr.project_id AND pr.is_active = TRUE
LEFT JOIN users r ON pr.reviewer_id = r.id
LEFT JOIN project_tags ptag ON p.id = ptag.project_id
LEFT JOIN tags t ON ptag.tag_id = t.id
GROUP BY p.id;
