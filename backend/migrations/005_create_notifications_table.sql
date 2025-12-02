-- =====================================================
-- SGPTI - Sistema de Gestión de Proyectos de Titulación
-- Migración: Crear tabla de notificaciones (RF07)
-- =====================================================

-- Tipos de notificación
CREATE TABLE IF NOT EXISTS notification_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  template_subject VARCHAR(255) NOT NULL,
  template_body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar tipos de notificación predefinidos
INSERT INTO notification_types (code, name, template_subject, template_body) VALUES
  ('PROJECT_SUBMITTED', 'Proyecto Postulado', 
   'Tu proyecto ha sido enviado para revisión', 
   'Hola {{user_name}},\n\nTu proyecto "{{project_title}}" ha sido enviado exitosamente y está pendiente de revisión.\n\nSaludos,\nEquipo SGPTI'),
  
  ('REVIEWER_ASSIGNED', 'Revisor Asignado',
   'Se te ha asignado un proyecto para revisar',
   'Hola {{user_name}},\n\nSe te ha asignado el proyecto "{{project_title}}" para revisión.\n\nPor favor ingresa al sistema para ver los detalles.\n\nSaludos,\nEquipo SGPTI'),
  
  ('STATUS_CHANGED', 'Cambio de Estado',
   'El estado de tu proyecto ha cambiado',
   'Hola {{user_name}},\n\nEl proyecto "{{project_title}}" ha cambiado de estado a: {{new_status}}.\n\n{{reason}}\n\nSaludos,\nEquipo SGPTI'),
  
  ('NEW_COMMENT', 'Nuevo Comentario',
   'Nuevo comentario en tu proyecto',
   'Hola {{user_name}},\n\nSe ha agregado un nuevo comentario en el proyecto "{{project_title}}":\n\n"{{comment_preview}}"\n\nSaludos,\nEquipo SGPTI'),
  
  ('PROJECT_APPROVED', 'Proyecto Aprobado',
   '¡Felicidades! Tu proyecto ha sido aprobado',
   'Hola {{user_name}},\n\n¡Felicidades! Tu proyecto "{{project_title}}" ha sido aprobado.\n\nEl siguiente paso es subir la versión final para archivo en biblioteca.\n\nSaludos,\nEquipo SGPTI'),
  
  ('PROJECT_REJECTED', 'Proyecto Rechazado',
   'Tu proyecto ha sido rechazado',
   'Hola {{user_name}},\n\nLamentamos informarte que el proyecto "{{project_title}}" ha sido rechazado.\n\nMotivo: {{reason}}\n\nPuedes contactar al comité para más información.\n\nSaludos,\nEquipo SGPTI'),
  
  ('DOCUMENT_UPLOADED', 'Documento Subido',
   'Nuevo documento subido al proyecto',
   'Hola {{user_name}},\n\nSe ha subido un nuevo documento al proyecto "{{project_title}}".\n\nDocumento: {{document_name}}\nEtapa: {{stage_name}}\n\nSaludos,\nEquipo SGPTI'),
  
  ('REVIEW_REQUIRED', 'Revisión Pendiente',
   'Tienes una revisión pendiente',
   'Hola {{user_name}},\n\nEl proyecto "{{project_title}}" está esperando tu revisión.\n\nPor favor completa tu evaluación lo antes posible.\n\nSaludos,\nEquipo SGPTI');

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  uuid VARCHAR(36) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  type_id INT NOT NULL,
  project_id INT DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSON DEFAULT NULL COMMENT 'Datos adicionales en formato JSON',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES notification_types(id) ON DELETE RESTRICT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_read (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preferencias de notificación por usuario
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type_id INT NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (type_id) REFERENCES notification_types(id) ON DELETE CASCADE,
  UNIQUE KEY unique_preference (user_id, type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
