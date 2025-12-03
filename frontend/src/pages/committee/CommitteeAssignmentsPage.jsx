import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService, userService } from '../../services/api';
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

const CommitteeAssignmentsPage = () => {
  const [projects, setProjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [selectedRoleType, setSelectedRoleType] = useState('revisor');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, teachersRes] = await Promise.all([
        projectService.getPendingReviewProjects(),
        userService.getTeachers(),
      ]);
      setProjects(projectsRes.data.data || []);
      setTeachers(teachersRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getTypeLabel = (type) => {
    switch (type) {
      case 'tesis': return 'Tesis';
      case 'tesina': return 'Tesina';
      case 'proyecto_investigacion': return 'Proyecto de Investigación';
      case 'memoria_profesional': return 'Memoria Profesional';
      case 'informe_practicas': return 'Informe de Prácticas';
      default: return type;
    }
  };

  const getRoleTypeLabel = (roleType) => {
    switch (roleType) {
      case 'revisor': return 'Revisor';
      case 'director': return 'Director';
      case 'codirector': return 'Co-Director';
      case 'asesor': return 'Asesor';
      default: return roleType;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const openAssignModal = (project) => {
    setSelectedProject(project);
    setSelectedReviewer('');
    setSelectedRoleType('revisor');
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedProject(null);
    setSelectedReviewer('');
    setSelectedRoleType('revisor');
  };

  const handleAssignReviewer = async () => {
    if (!selectedProject || !selectedReviewer) return;
    
    setActionLoading(true);
    try {
      await projectService.assignReviewer(selectedProject.uuid, selectedReviewer, selectedRoleType);
      await fetchData();
      closeAssignModal();
    } catch (error) {
      console.error('Error assigning reviewer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveReviewer = async (projectUuid, reviewerId) => {
    if (!window.confirm('¿Estás seguro de que deseas remover este revisor?')) return;
    
    setActionLoading(true);
    try {
      await projectService.removeReviewer(projectUuid, reviewerId);
      await fetchData();
    } catch (error) {
      console.error('Error removing reviewer:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getAvailableTeachers = () => {
    if (!selectedProject) return teachers;
    const assignedIds = (selectedProject.reviewers || []).map(r => r.id);
    return teachers.filter(t => !assignedIds.includes(t.id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Asignación de Revisores</h1>
        <p className="text-gray-500 mt-1">
          Gestiona las asignaciones de revisores para proyectos postulados
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ClipboardDocumentListIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay proyectos pendientes de asignación</h3>
          <p className="mt-2 text-gray-500">
            Todos los proyectos postulados ya tienen revisores asignados o no hay proyectos postulados en este momento
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Postulación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revisores Asignados
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.uuid} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {project.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {project.authors?.length > 0
                          ? project.authors.map(a => `${a.first_name} ${a.last_name}`).join(', ')
                          : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {getTypeLabel(project.type_name)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(project.submitted_at || project.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status_name)}`}>
                        {getStatusLabel(project.status_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {project.reviewers?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {project.reviewers.map((reviewer) => (
                            <div
                              key={reviewer.id}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                            >
                              <span>{reviewer.first_name} {reviewer.last_name}</span>
                              <span className="text-green-500">({getRoleTypeLabel(reviewer.role_type)})</span>
                              <button
                                onClick={() => handleRemoveReviewer(project.uuid, reviewer.id)}
                                disabled={actionLoading}
                                className="ml-1 text-green-600 hover:text-red-600 disabled:opacity-50"
                                title="Remover revisor"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Sin revisores</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAssignModal(project)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <UserPlusIcon className="h-4 w-4" />
                          Asignar Revisor
                        </button>
                        <Link
                          to={`/projects/${project.uuid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Ver Detalles
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAssignModal && selectedProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={closeAssignModal}></div>
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Asignar Revisor</h3>
                <button
                  onClick={closeAssignModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proyecto
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedProject.title}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar Docente
                  </label>
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Seleccionar docente --</option>
                    {getAvailableTeachers().map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol del Revisor
                  </label>
                  <select
                    value={selectedRoleType}
                    onChange={(e) => setSelectedRoleType(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="revisor">Revisor</option>
                    <option value="director">Director</option>
                    <option value="codirector">Co-Director</option>
                    <option value="asesor">Asesor</option>
                  </select>
                </div>

                {selectedProject.reviewers?.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Revisores Actuales
                    </label>
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      {selectedProject.reviewers.map((reviewer) => (
                        <div
                          key={reviewer.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-gray-600">
                            {reviewer.first_name} {reviewer.last_name}
                            <span className="text-gray-400 ml-1">({getRoleTypeLabel(reviewer.role_type)})</span>
                          </span>
                          <button
                            onClick={() => handleRemoveReviewer(selectedProject.uuid, reviewer.id)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            title="Remover revisor"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={closeAssignModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAssignReviewer}
                  disabled={!selectedReviewer || actionLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <UserPlusIcon className="h-4 w-4" />
                  )}
                  Asignar Revisor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitteeAssignmentsPage;
