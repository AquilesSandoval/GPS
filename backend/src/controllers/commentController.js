const Comment = require('../models/Comment');
const Project = require('../models/Project');
const NotificationService = require('../services/notificationService');

/**
 * Create comment (RF05)
 */
const createComment = async (req, res, next) => {
  try {
    const { projectUuid, documentId, parentId, content, commentType, pageNumber } = req.body;

    // Find project
    const project = await Project.findByUuid(projectUuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    // Create comment
    const comment = await Comment.create({
      projectId: project.id,
      documentId: documentId || null,
      userId: req.user.id,
      parentId: parentId || null,
      content,
      commentType: commentType || 'general',
      pageNumber: pageNumber || null,
    });

    // Notify project participants
    const commentPreview = content.length > 100 ? content.substring(0, 100) + '...' : content;
    await NotificationService.notifyNewComment(project.id, commentPreview, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comments by project
 */
const getProjectComments = async (req, res, next) => {
  try {
    const { projectUuid } = req.params;
    const { documentId, isResolved, commentType } = req.query;

    const project = await Project.findByUuid(projectUuid);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Proyecto no encontrado',
      });
    }

    const filters = {
      documentId: documentId ? parseInt(documentId, 10) : null,
      isResolved: isResolved !== undefined ? isResolved === 'true' : undefined,
      commentType,
    };

    const comments = await Comment.findByProject(project.id, filters);

    res.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update comment
 */
const updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado',
      });
    }

    // Only allow author to update
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar este comentario',
      });
    }

    const updatedComment = await Comment.update(parseInt(id, 10), content);

    res.json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: updatedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comment
 */
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado',
      });
    }

    // Only allow author or comité to delete
    if (comment.user_id !== req.user.id && !['comite'].includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este comentario',
      });
    }

    await Comment.delete(parseInt(id, 10));

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve comment
 */
const resolveComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado',
      });
    }

    const resolvedComment = await Comment.resolve(parseInt(id, 10), req.user.id);

    res.json({
      success: true,
      message: 'Comentario marcado como resuelto',
      data: resolvedComment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Unresolve comment
 */
const unresolveComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado',
      });
    }

    const unresolvedComment = await Comment.unresolve(parseInt(id, 10));

    res.json({
      success: true,
      message: 'Comentario marcado como no resuelto',
      data: unresolvedComment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComment,
  getProjectComments,
  updateComment,
  deleteComment,
  resolveComment,
  unresolveComment,
};
