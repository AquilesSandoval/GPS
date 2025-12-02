const Project = require('../models/Project');
const NotificationService = require('../services/notificationService');

/**
 * Create new project (RF02)
 */
const createProject = async (req, res, next) => {
  try {
    const { title, abstract, keywords, typeId } = req.body;

    const result = await Project.create({
      title,
      abstract,
      keywords,
      typeId,
      authorId: req.user.id,
    });

    const project = await Project.findById(result.id);

    res.status(201).json({
      success: true,
      message: 'Proyecto creado exitosamente',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by UUID
 */
const getProject = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const project = await Project.findByUuid(uuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Check access permissions
    const hasAccess = await checkProjectAccess(req.user, project);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a este proyecto',
      });
    }

    // Get status history
    const statusHistory = await Project.getStatusHistory(project.id);

    res.json({
      success: true,
      data: { ...project, statusHistory },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project (RF02)
 */
const updateProject = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const { title, abstract, keywords, typeId } = req.body;

    const project = await Project.findByUuid(uuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Only allow updates if project is in draft or requires changes
    if (!['borrador', 'requiere_cambios'].includes(project.status_name)) {
      return res.status(400).json({
        success: false,
        message: 'El proyecto no puede ser modificado en su estado actual',
      });
    }

    // Check if user is author
    const isAuthor = project.authors.some(a => a.id === req.user.id);
    if (!isAuthor && !['comite'].includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este proyecto',
      });
    }

    const updatedProject = await Project.update(project.id, {
      title,
      abstract,
      keywords,
      typeId,
    });

    res.json({
      success: true,
      message: 'Proyecto actualizado exitosamente',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit project for review (RF02)
 */
const submitProject = async (req, res, next) => {
  try {
    const { uuid } = req.params;

    const project = await Project.findByUuid(uuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Only allow submission from draft
    if (project.status_name !== 'borrador') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden enviar proyectos en estado borrador',
      });
    }

    // Update status to submitted
    await Project.updateStatus(project.id, 2, req.user.id, 'Proyecto enviado para revisión');

    // Notify authors
    await NotificationService.notifyProjectSubmitted(project.id);

    const updatedProject = await Project.findById(project.id);

    res.json({
      success: true,
      message: 'Proyecto enviado exitosamente para revisión',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update project status (RF06)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const { statusId, reason } = req.body;

    const project = await Project.findByUuid(uuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Get status name for notification
    const statuses = await Project.getStatuses();
    const newStatus = statuses.find(s => s.id === statusId);

    await Project.updateStatus(project.id, statusId, req.user.id, reason);

    // Send notifications
    if (newStatus) {
      await NotificationService.notifyStatusChange(project.id, newStatus.name, reason);
    }

    const updatedProject = await Project.findById(project.id);

    res.json({
      success: true,
      message: 'Estado del proyecto actualizado exitosamente',
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign reviewer to project (RF03)
 */
const assignReviewer = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const { reviewerId, roleType } = req.body;

    const project = await Project.findByUuid(uuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    const reviewers = await Project.assignReviewer(
      project.id,
      reviewerId,
      req.user.id,
      roleType || 'revisor',
    );

    // Notify the reviewer
    await NotificationService.notifyReviewerAssigned(reviewerId, project.id);

    // If it's the first reviewer, change status to "en_revision"
    if (project.status_name === 'postulado') {
      await Project.updateStatus(project.id, 3, req.user.id, 'Revisores asignados');
    }

    res.json({
      success: true,
      message: 'Revisor asignado exitosamente',
      data: reviewers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove reviewer from project
 */
const removeReviewer = async (req, res, next) => {
  try {
    const { uuid, reviewerId } = req.params;

    const project = await Project.findByUuid(uuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    const reviewers = await Project.removeReviewer(project.id, parseInt(reviewerId, 10));

    res.json({
      success: true,
      message: 'Revisor removido exitosamente',
      data: reviewers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search projects (RF08)
 */
const searchProjects = async (req, res, next) => {
  try {
    const { query, statusId, typeId, authorId, reviewerId, fromDate, toDate, page, limit } = req.query;

    const filters = {
      query,
      statusId: statusId ? parseInt(statusId, 10) : null,
      typeId: typeId ? parseInt(typeId, 10) : null,
      authorId: authorId ? parseInt(authorId, 10) : null,
      reviewerId: reviewerId ? parseInt(reviewerId, 10) : null,
      fromDate,
      toDate,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: page ? (parseInt(page, 10) - 1) * (parseInt(limit, 10) || 20) : 0,
    };

    const projects = await Project.search(filters);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: parseInt(page, 10) || 1,
        limit: filters.limit,
        count: projects.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's projects
 */
const getMyProjects = async (req, res, next) => {
  try {
    const projects = await Project.findByUser(req.user.id, req.user.role_name);

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project types
 */
const getProjectTypes = async (req, res, next) => {
  try {
    const types = await Project.getTypes();

    res.json({
      success: true,
      data: types,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project statuses
 */
const getProjectStatuses = async (req, res, next) => {
  try {
    const statuses = await Project.getStatuses();

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add author to project
 */
const addAuthor = async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const { userId, isMainAuthor } = req.body;

    const project = await Project.findByUuid(uuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    const authors = await Project.addAuthor(project.id, userId, isMainAuthor);

    res.json({
      success: true,
      message: 'Autor agregado exitosamente',
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove author from project
 */
const removeAuthor = async (req, res, next) => {
  try {
    const { uuid, userId } = req.params;

    const project = await Project.findByUuid(uuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Prevent removing the last author
    if (project.authors.length <= 1) {
      return res.status(400).json({
        success: false,
        message: 'El proyecto debe tener al menos un autor',
      });
    }

    const authors = await Project.removeAuthor(project.id, parseInt(userId, 10));

    res.json({
      success: true,
      message: 'Autor removido exitosamente',
      data: authors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to check project access
 */
const checkProjectAccess = async (user, project) => {
  // Comité and Biblioteca can access all projects
  if (['comite', 'biblioteca'].includes(user.role_name)) {
    return true;
  }

  // Authors can access their own projects
  if (project.authors.some(a => a.id === user.id)) {
    return true;
  }

  // Reviewers can access projects assigned to them
  if (project.reviewers.some(r => r.id === user.id && r.is_active)) {
    return true;
  }

  return false;
};

module.exports = {
  createProject,
  getProject,
  updateProject,
  submitProject,
  updateStatus,
  assignReviewer,
  removeReviewer,
  searchProjects,
  getMyProjects,
  getProjectTypes,
  getProjectStatuses,
  addAuthor,
  removeAuthor,
};
