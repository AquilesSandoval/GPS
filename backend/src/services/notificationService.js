const Notification = require('../models/Notification');
const emailService = require('./emailService');
const User = require('../models/User');
const Project = require('../models/Project');

class NotificationService {
  /**
   * Create and send notification (RF07)
   */
  static async notify(userId, typeCode, projectId, data = {}) {
    try {
      // Get notification type
      const type = await Notification.getTypeByCode(typeCode);
      if (!type) {
        console.error(`Notification type not found: ${typeCode}`);
        return null;
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        console.error(`User not found for notification: ${userId}`);
        return null;
      }

      // Get project if provided
      let projectTitle = '';
      if (projectId) {
        const project = await Project.findById(projectId);
        projectTitle = project?.title || '';
      }

      // Replace template variables
      let title = type.template_subject;
      let message = type.template_body;

      const replacements = {
        '{{user_name}}': `${user.first_name} ${user.last_name}`,
        '{{project_title}}': projectTitle,
        '{{new_status}}': data.newStatus || '',
        '{{reason}}': data.reason || '',
        '{{comment_preview}}': data.commentPreview || '',
        '{{document_name}}': data.documentName || '',
        '{{stage_name}}': data.stageName || '',
      };

      for (const [key, value] of Object.entries(replacements)) {
        title = title.replace(new RegExp(key, 'g'), value);
        message = message.replace(new RegExp(key, 'g'), value);
      }

      // Create notification in database
      const notification = await Notification.create({
        userId,
        typeId: type.id,
        projectId,
        title,
        message,
        data,
      });

      // Send email notification
      try {
        await emailService.sendNotification(user.email, typeCode, {
          userName: `${user.first_name} ${user.last_name}`,
          projectTitle,
          ...data,
        });
        await Notification.markEmailSent(notification.id);
      } catch (emailError) {
        console.error('Error sending notification email:', emailError.message);
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  /**
   * Notify all authors of a project
   */
  static async notifyProjectAuthors(projectId, typeCode, data = {}) {
    const authors = await Project.getAuthors(projectId);
    const notifications = [];

    for (const author of authors) {
      const notification = await this.notify(author.id, typeCode, projectId, data);
      if (notification) {
        notifications.push(notification);
      }
    }

    return notifications;
  }

  /**
   * Notify all reviewers of a project
   */
  static async notifyProjectReviewers(projectId, typeCode, data = {}) {
    const reviewers = await Project.getReviewers(projectId);
    const notifications = [];

    for (const reviewer of reviewers) {
      if (reviewer.is_active) {
        const notification = await this.notify(reviewer.id, typeCode, projectId, data);
        if (notification) {
          notifications.push(notification);
        }
      }
    }

    return notifications;
  }

  /**
   * Notify on project submission
   */
  static async notifyProjectSubmitted(projectId) {
    return this.notifyProjectAuthors(projectId, 'PROJECT_SUBMITTED');
  }

  /**
   * Notify when reviewer is assigned
   */
  static async notifyReviewerAssigned(reviewerId, projectId) {
    return this.notify(reviewerId, 'REVIEWER_ASSIGNED', projectId);
  }

  /**
   * Notify on status change
   */
  static async notifyStatusChange(projectId, newStatus, reason = null) {
    const data = { newStatus, reason };
    
    if (newStatus === 'aprobado') {
      return this.notifyProjectAuthors(projectId, 'PROJECT_APPROVED', data);
    } else if (newStatus === 'rechazado') {
      return this.notifyProjectAuthors(projectId, 'PROJECT_REJECTED', data);
    } else {
      return this.notifyProjectAuthors(projectId, 'STATUS_CHANGED', data);
    }
  }

  /**
   * Notify on new comment
   */
  static async notifyNewComment(projectId, commentPreview, commenterId) {
    const authors = await Project.getAuthors(projectId);
    const reviewers = await Project.getReviewers(projectId);
    const data = { commentPreview };
    const notifications = [];

    // Notify all except the commenter
    const usersToNotify = [...authors, ...reviewers.filter(r => r.is_active)]
      .filter(u => u.id !== commenterId);

    // Remove duplicates
    const uniqueUsers = [...new Map(usersToNotify.map(u => [u.id, u])).values()];

    for (const user of uniqueUsers) {
      const notification = await this.notify(user.id, 'NEW_COMMENT', projectId, data);
      if (notification) {
        notifications.push(notification);
      }
    }

    return notifications;
  }
}

module.exports = NotificationService;
