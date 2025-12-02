const fs = require('fs').promises;
const multer = require('multer');
const Document = require('../models/Document');
const Project = require('../models/Project');
const config = require('../config');
const NotificationService = require('../services/notificationService');

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = config.upload.path;
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const storedName = Document.generateStoredName(file.originalname);
    cb(null, storedName);
  },
});

// Configure multer
const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize,
  },
  fileFilter: (req, file, cb) => {
    if (!Document.isValidFileType(file.mimetype, file.originalname)) {
      return cb(new Error('Tipo de archivo no permitido. Solo se permiten PDF, DOC y DOCX.'));
    }
    cb(null, true);
  },
}).single('file');

/**
 * Upload document (RF04)
 */
const uploadDocument = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'El archivo excede el tamaño máximo permitido (20MB)',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo',
        });
      }

      const { projectUuid, stageId } = req.body;

      // Find project
      const project = await Project.findByUuid(projectUuid);
      if (!project) {
        // Delete uploaded file
        await fs.unlink(req.file.path);
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado',
        });
      }

      // Check if user is author
      const isAuthor = project.authors.some(a => a.id === req.user.id);
      if (!isAuthor && !['comite'].includes(req.user.role_name)) {
        await fs.unlink(req.file.path);
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para subir documentos a este proyecto',
        });
      }

      // Create document record
      const document = await Document.create({
        projectId: project.id,
        stageId: parseInt(stageId, 10),
        uploadedBy: req.user.id,
        originalName: req.file.originalname,
        storedName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      // Notify reviewers
      const stages = await Document.getStages();
      const stage = stages.find(s => s.id === parseInt(stageId, 10));
      
      await NotificationService.notifyProjectReviewers(project.id, 'DOCUMENT_UPLOADED', {
        documentName: req.file.originalname,
        stageName: stage?.name || '',
      });

      const fullDocument = await Document.findById(document.id);

      res.status(201).json({
        success: true,
        message: 'Documento subido exitosamente',
        data: fullDocument,
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch {
          // Ignore unlink errors
        }
      }
      next(error);
    }
  });
};

/**
 * Get document by UUID
 */
const getDocument = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const document = await Document.findByUuid(uuid);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado',
      });
    }

    res.json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download document
 */
const downloadDocument = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const document = await Document.findByUuid(uuid);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado',
      });
    }

    // Check if file exists
    try {
      await fs.access(document.file_path);
    } catch {
      return res.status(404).json({
        success: false,
        message: 'El archivo no existe en el servidor',
      });
    }

    res.download(document.file_path, document.original_name);
  } catch (error) {
    next(error);
  }
};

/**
 * Get documents by project
 */
const getProjectDocuments = async (req, res, next) => {
  try {
    const { projectUuid } = req.params;
    const { stageId } = req.query;

    const project = await Project.findByUuid(projectUuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    const documents = await Document.findByProject(
      project.id,
      stageId ? parseInt(stageId, 10) : null,
    );

    res.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 */
const deleteDocument = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const document = await Document.findByUuid(uuid);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado',
      });
    }

    // Only uploader or comité can delete
    if (document.uploaded_by !== req.user.id && !['comite'].includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este documento',
      });
    }

    await Document.delete(document.id);

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get deliverable stages
 */
const getStages = async (req, res, next) => {
  try {
    const stages = await Document.getStages();

    res.json({
      success: true,
      data: stages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  getDocument,
  downloadDocument,
  getProjectDocuments,
  deleteDocument,
  getStages,
};
