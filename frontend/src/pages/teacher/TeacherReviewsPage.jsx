import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService, documentService } from '../../services/api';
import {
  ClipboardDocumentCheckIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const TeacherReviewsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedProjects = async () => {
      setLoading(true);
      try {
        const response = await projectService.getAssignedProjects();
        setProjects(response.data.data || []);
      } catch (error) {
        console.error('Error fetching assigned projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedProjects();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'postulado': return 'bg-blue-100 text-blue-800';
      case 'en_revision': return 'bg-yellow-100 text-yellow-800';
      case 'requiere_cambios': return 'bg-red-100 text-red-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'postulado': return 'Postulado';
      case 'en_revision': return 'En Revisión';
      case 'requiere_cambios': return 'Requiere Cambios';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
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

  const handleDownloadDocument = async (documentUuid, fileName) => {
    try {
      const response = await documentService.download(documentUuid);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'documento');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Revisiones Pendientes</h1>
        <p className="text-gray-500 mt-1">
          Proyectos asignados para tu revisión
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ClipboardDocumentCheckIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No hay revisiones pendientes</h3>
          <p className="mt-2 text-gray-500">
            No tienes proyectos asignados para revisar en este momento
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
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Asignación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Documento
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
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status_name)}`}>
                        {getStatusLabel(project.status_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(project.assigned_at || project.submitted_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {project.latest_document ? (
                        <button
                          onClick={() => handleDownloadDocument(project.latest_document.uuid, project.latest_document.original_name)}
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-500"
                        >
                          <DocumentArrowDownIcon className="h-4 w-4" />
                          <span className="truncate max-w-[120px]">
                            {project.latest_document.original_name}
                          </span>
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">Sin documento</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/projects/${project.uuid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Aprobar
                        </Link>
                        <Link
                          to={`/projects/${project.uuid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Rechazar
                        </Link>
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
    </div>
  );
};

export default TeacherReviewsPage;
