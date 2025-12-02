const nodemailer = require('nodemailer');
const config = require('../config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize the email transporter
   */
  init() {
    if (!config.email.host || !config.email.user) {
      console.log('⚠️  Email service not configured - emails will be logged to console');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });

    this.initialized = true;
    console.log('✅ Email service initialized');
  }

  /**
   * Send an email
   */
  async send(to, subject, html, text = null) {
    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
      text: text || this.stripHtml(html),
    };

    if (!this.initialized) {
      // Log email in development
      console.log('\n📧 Email (not sent - no SMTP configured):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Content: ${text || this.stripHtml(html).substring(0, 100)}...`);
      return { messageId: 'dev-' + Date.now() };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      throw error;
    }
  }

  /**
   * Send notification email using template
   */
  async sendNotification(to, templateCode, data) {
    const templates = {
      PROJECT_SUBMITTED: {
        subject: 'Tu proyecto ha sido enviado para revisión',
        html: `
          <h2>¡Hola ${data.userName}!</h2>
          <p>Tu proyecto "<strong>${data.projectTitle}</strong>" ha sido enviado exitosamente y está pendiente de revisión.</p>
          <p>Te notificaremos cuando haya novedades.</p>
          <br>
          <p>Saludos,<br>Equipo SGPTI</p>
        `,
      },
      REVIEWER_ASSIGNED: {
        subject: 'Se te ha asignado un proyecto para revisar',
        html: `
          <h2>¡Hola ${data.userName}!</h2>
          <p>Se te ha asignado el proyecto "<strong>${data.projectTitle}</strong>" para revisión.</p>
          <p>Por favor ingresa al sistema para ver los detalles y realizar tu evaluación.</p>
          <br>
          <p>Saludos,<br>Equipo SGPTI</p>
        `,
      },
      STATUS_CHANGED: {
        subject: `El estado de tu proyecto ha cambiado a: ${data.newStatus}`,
        html: `
          <h2>¡Hola ${data.userName}!</h2>
          <p>El proyecto "<strong>${data.projectTitle}</strong>" ha cambiado de estado.</p>
          <p><strong>Nuevo estado:</strong> ${data.newStatus}</p>
          ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
          <br>
          <p>Saludos,<br>Equipo SGPTI</p>
        `,
      },
      NEW_COMMENT: {
        subject: 'Nuevo comentario en tu proyecto',
        html: `
          <h2>¡Hola ${data.userName}!</h2>
          <p>Se ha agregado un nuevo comentario en el proyecto "<strong>${data.projectTitle}</strong>":</p>
          <blockquote style="border-left: 3px solid #ccc; padding-left: 10px; color: #666;">
            ${data.commentPreview}
          </blockquote>
          <p>Ingresa al sistema para ver el comentario completo y responder.</p>
          <br>
          <p>Saludos,<br>Equipo SGPTI</p>
        `,
      },
      PROJECT_APPROVED: {
        subject: '¡Felicidades! Tu proyecto ha sido aprobado',
        html: `
          <h2>¡Felicidades ${data.userName}!</h2>
          <p>Tu proyecto "<strong>${data.projectTitle}</strong>" ha sido <span style="color: green;">APROBADO</span>.</p>
          <p>El siguiente paso es subir la versión final para archivo en biblioteca.</p>
          <br>
          <p>Saludos,<br>Equipo SGPTI</p>
        `,
      },
      PROJECT_REJECTED: {
        subject: 'Tu proyecto ha sido rechazado',
        html: `
          <h2>Hola ${data.userName}</h2>
          <p>Lamentamos informarte que el proyecto "<strong>${data.projectTitle}</strong>" ha sido <span style="color: red;">rechazado</span>.</p>
          ${data.reason ? `<p><strong>Motivo:</strong> ${data.reason}</p>` : ''}
          <p>Puedes contactar al comité para más información.</p>
          <br>
          <p>Saludos,<br>Equipo SGPTI</p>
        `,
      },
    };

    const template = templates[templateCode];
    if (!template) {
      console.error(`Email template not found: ${templateCode}`);
      return null;
    }

    return this.send(to, template.subject, template.html);
  }

  /**
   * Strip HTML tags for plain text version
   */
  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Verify SMTP connection
   */
  async verify() {
    if (!this.initialized) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ SMTP verification failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
