import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService, documentService, commentService, userService } from '../../services/api';
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  PaperClipIcon,
  PlusIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';

const ProjectDetailPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { user, isStudent, isTeacher, isCommittee, isLibrary } = useAuth();
  
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [comments, setComments] = useState([]);
  const [stages, setStages] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReviewerModal, setShowReviewerModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusReason, setStatusReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, stagesRes, statusesRes] = await Promise.all([
          projectService.getById(uuid),
          documentService.getStages(),
          projectService.getStatuses(),
        ]);
        
        setProject(projectRes.data.data);
        setStages(stagesRes.data.data || []);
        setStatuses(statusesRes.data.data || []);

        // Fetch documents and comments
        const [docsRes, commentsRes] = await Promise.all([
          documentService.getByProject(uuid),
          commentService.getByProject(uuid),
        ]);
        setDocuments(docsRes.data.data || []);
        setComments(commentsRes.data.data || []);

        // Fetch teachers for reviewer assignment
        if (isCommittee) {
          const teachersRes = await userService.getTeachers();
          setTeachers(teachersRes.data.data || []);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid, navigate, isCommittee]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'borrador': return 'bg-gray-100 text-gray-800';
      case 'postulado': return 'bg-blue-100 text-blue-800';
      case 'en_revision': return 'bg-yellow-100 text-yellow-800';
      case 'requiere_cambios': return 'bg-red-100 text-red-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'archivado': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'borrador': return 'Borrador';
      case 'postulado': return 'Postulado';
      case 'en_revision': return 'En Revisión';
      case 'requiere_cambios': return 'Requiere Cambios';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      case 'archivado': return 'Archivado';
      default: return status;
    }
  };

  const handleSubmitProject = async () => {
    setActionLoading(true);
    try {
      await projectService.submit(uuid);
      const res = await projectService.getById(uuid);
      setProject(res.data.data);
    } catch (error) {
      console.error('Error submitting project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setActionLoading(true);
    try {
      await projectService.updateStatus(uuid, selectedStatus, statusReason);
      const res = await projectService.getById(uuid);
      setProject(res.data.data);
      setShowStatusModal(false);
      setSelectedStatus('');
      setStatusReason('');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedReviewer) return;
    setActionLoading(true);
    try {
      await projectService.assignReviewer(uuid, selectedReviewer, 'revisor');
      const res = await projectService.getById(uuid);
      setProject(res.data.data);
      setShowReviewerModal(false);
      setSelectedReviewer('');
    } catch (error) {
      console.error('Error assigning reviewer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!selectedFile || !selectedStage) return;
    setActionLoading(true);
    try {
      await documentService.upload(uuid, selectedStage, selectedFile);
      const res = await documentService.getByProject(uuid);
      setDocuments(res.data.data || []);
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedStage('');
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setActionLoading(true);
    try {
      await commentService.create({
        projectId: project.id,
        userId: user.id,
        content: newComment,
        commentType: 'general',
      });
      const res = await commentService.getByProject(uuid);
      setComments(res.data.data || []);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveComment = async (commentId) => {
    try {
      await commentService.resolve(commentId);
      const res = await commentService.getByProject(uuid);
      setComments(res.data.data || []);
    } catch (error) {
      console.error('Error resolving comment:', error);
    }
  };

  const canEdit = isStudent && project?.status_name === 'borrador';
  const canSubmit = isStudent && project?.status_name === 'borrador';
  const canChangeStatus = isCommittee || isTeacher;
  const canAssignReviewer = isCommittee && ['postulado', 'en_revision'].includes(project?.status_name);
  const canUpload = isStudent && ['borrador', 'requiere_cambios'].includes(project?.status_name);
  const canComment = isTeacher || isCommittee;
  const canArchive = isLibrary && project?.status_name === 'aprobado';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Volver a proyectos
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status_name)}`}>
              {getStatusLabel(project.status_name)}
            </span>
          </div>
          <p className="text-gray-500 mt-1">{project.type_name}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link
              to={`/projects/${uuid}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              <PencilIcon className="h-4 w-4" />
              Editar
            </Link>
          )}
          {canSubmit && (
            <button
              onClick={handleSubmitProject}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Postular Proyecto
            </button>
          )}
          {canChangeStatus && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Cambiar Estado
            </button>
          )}
          {canAssignReviewer && (
            <button
              onClick={() => setShowReviewerModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50"
            >
              <UserGroupIcon className="h-4 w-4" />
              Asignar Revisor
            </button>
          )}
          {canArchive && (
            <button
              onClick={() => {
                setSelectedStatus('7');
                setShowStatusModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Archivar
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'info', label: 'Información', icon: DocumentTextIcon },
            { id: 'documents', label: 'Documentos', icon: PaperClipIcon },
            { id: 'comments', label: 'Comentarios', icon: ChatBubbleLeftRightIcon },
            { id: 'history', label: 'Historial', icon: ClockIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resumen</h3>
              <p className="text-gray-600 whitespace-pre-wrap">
                {project.abstract || 'Sin resumen disponible'}
              </p>
            </div>
            {project.keywords && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Palabras Clave</h3>
                <div className="flex flex-wrap gap-2">
                  {project.keywords.split(',').map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {keyword.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Autores</h3>
              <div className="space-y-3">
                {project.authors?.map((author) => (
                  <div key={author.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {author.first_name[0]}{author.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {author.first_name} {author.last_name}
                        {author.is_main_author && (
                          <span className="ml-2 text-xs text-indigo-600">(Principal)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{author.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {project.reviewers?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Revisores</h3>
                <div className="space-y-3">
                  {project.reviewers.map((reviewer) => (
                    <div key={reviewer.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {reviewer.first_name[0]}{reviewer.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {reviewer.first_name} {reviewer.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{reviewer.role_type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Fechas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Creado:</span>
                  <span className="text-gray-900">
                    {new Date(project.created_at).toLocaleDateString('es-MX')}
                  </span>
                </div>
                {project.submitted_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Postulado:</span>
                    <span className="text-gray-900">
                      {new Date(project.submitted_at).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                )}
                {project.approved_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Aprobado:</span>
                    <span className="text-gray-900">
                      {new Date(project.approved_at).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-6">
          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ArrowUpTrayIcon className="h-5 w-5" />
              Subir Documento
            </button>
          )}

          {documents.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <PaperClipIcon className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No hay documentos</h3>
              <p className="mt-2 text-gray-500">
                {canUpload ? 'Sube tu primer documento para este proyecto' : 'Aún no se han subido documentos'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Etapa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Versión</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <DocumentTextIcon className="h-8 w-8 text-gray-400" />
                          <span className="font-medium text-gray-900">{doc.original_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{doc.stage_name}</td>
                      <td className="px-6 py-4 text-gray-500">v{doc.version}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(doc.uploaded_at).toLocaleDateString('es-MX')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={async () => {
                            const res = await documentService.download(doc.uuid);
                            const url = window.URL.createObjectURL(new Blob([res.data]));
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', doc.original_name);
                            document.body.appendChild(link);
                            link.click();
                            link.remove();
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Descargar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-6">
          {canComment && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Agregar Comentario</h3>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Escribe tu comentario o retroalimentación..."
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAddComment}
                  disabled={actionLoading || !newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  Enviar Comentario
                </button>
              </div>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No hay comentarios</h3>
              <p className="mt-2 text-gray-500">Aún no hay retroalimentación para este proyecto</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`bg-white rounded-xl border p-6 ${
                    comment.is_resolved ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium">
                          {comment.first_name[0]}{comment.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {comment.first_name} {comment.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    {!comment.is_resolved && canComment && (
                      <button
                        onClick={() => handleResolveComment(comment.id)}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-4 text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  {comment.is_resolved && (
                    <p className="mt-2 text-sm text-green-600">
                      ✓ Resuelto por {comment.resolved_by_first_name} {comment.resolved_by_last_name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-6">Historial de Estados</h3>
          <div className="space-y-4">
            {/* Timeline would go here - simplified for now */}
            <p className="text-gray-500">El historial de cambios de estado se mostrará aquí.</p>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Estado</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar estado</option>
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {getStatusLabel(status.name)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón (opcional)</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Describe el motivo del cambio..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={actionLoading || !selectedStatus}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviewer Modal */}
      {showReviewerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asignar Revisor</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Docente</label>
              <select
                value={selectedReviewer}
                onChange={(e) => setSelectedReviewer(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Seleccionar docente</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowReviewerModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignReviewer}
                disabled={actionLoading || !selectedReviewer}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Asignar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Documento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Seleccionar etapa</option>
                  {stages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                <p className="mt-1 text-xs text-gray-500">PDF, DOC o DOCX (máx. 20MB)</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadDocument}
                disabled={actionLoading || !selectedFile || !selectedStage}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Subir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailPage;
