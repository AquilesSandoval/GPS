-- =====================================================
-- SGPTI - Sistema de Gestión de Proyectos de Titulación
-- Migración: Crear tablas de revisión y asignación (RF03, RF05)
-- =====================================================

-- Asignación de revisores a proyectos (RF03)
CREATE TABLE IF NOT EXISTS project_reviewers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  reviewer_id INT NOT NULL COMMENT 'ID del docente/asesor asignado',
  assigned_by INT NOT NULL COMMENT 'ID del usuario del comité que asignó',
  role_type ENUM('asesor', 'revisor', 'sinodal') DEFAULT 'revisor',
  is_active BOOLEAN DEFAULT TRUE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_reviewer (project_id, reviewer_id, role_type),
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_project (project_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios y retroalimentación (RF05)
CREATE TABLE IF NOT EXISTS project_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  project_id INT NOT NULL,
  document_id INT DEFAULT NULL COMMENT 'Si el comentario es sobre un documento específico',
  user_id INT NOT NULL,
  parent_id INT DEFAULT NULL COMMENT 'Para respuestas a comentarios',
  content TEXT NOT NULL,
  comment_type ENUM('general', 'revision', 'correccion', 'aprobacion') DEFAULT 'general',
  page_number INT DEFAULT NULL COMMENT 'Número de página si aplica',
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by INT DEFAULT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES project_documents(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES project_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_project (project_id),
  INDEX idx_document (document_id),
  INDEX idx_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Historial de cambios de estado del proyecto (RF06)
CREATE TABLE IF NOT EXISTS project_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  from_status_id INT DEFAULT NULL,
  to_status_id INT NOT NULL,
  changed_by INT NOT NULL,
  reason TEXT COMMENT 'Razón del cambio de estado',
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (from_status_id) REFERENCES project_statuses(id) ON DELETE SET NULL,
  FOREIGN KEY (to_status_id) REFERENCES project_statuses(id) ON DELETE RESTRICT,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_project (project_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evaluaciones/dictámenes de revisores
CREATE TABLE IF NOT EXISTS project_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  document_id INT DEFAULT NULL COMMENT 'Documento evaluado',
  decision ENUM('aprobado', 'aprobado_con_cambios', 'rechazado', 'pendiente') DEFAULT 'pendiente',
  general_comments TEXT,
  score DECIMAL(4,2) DEFAULT NULL COMMENT 'Calificación si aplica',
  evaluated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES project_documents(id) ON DELETE SET NULL,
  UNIQUE KEY unique_evaluation (project_id, reviewer_id, document_id),
  INDEX idx_project (project_id),
  INDEX idx_decision (decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
