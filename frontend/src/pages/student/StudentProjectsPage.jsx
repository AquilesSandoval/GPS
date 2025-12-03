import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/api';
import {
  PlusIcon,
  FolderIcon,
  EyeIcon,
  PencilIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const StudentProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await projectService.getMyProjects();
        setProjects(response.data.data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Error al cargar los proyectos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const canEdit = (status) => {
    return ['borrador', 'requiere_cambios'].includes(status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-indigo-600 hover:text-indigo-500"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Proyectos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona tus proyectos de titulación
          </p>
        </div>
        <Link
          to="/projects/new"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Postulación
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No tienes proyectos</h3>
          <p className="mt-2 text-gray-500">
            Comienza creando tu primer proyecto de titulación
          </p>
          <Link
            to="/projects/new"
            className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            Crear mi primer proyecto
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Creación
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.uuid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/projects/${project.uuid}`}
                        className="text-gray-900 font-medium hover:text-indigo-600 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <span className="line-clamp-1">{project.title}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {getTypeLabel(project.type_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status_name)}`}>
                        {getStatusLabel(project.status_name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4" />
                        {formatDate(project.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/projects/${project.uuid}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <EyeIcon className="h-4 w-4" />
                          Ver
                        </Link>
                        {canEdit(project.status_name) && (
                          <Link
                            to={`/projects/${project.uuid}/edit`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar proyecto"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Editar
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="text-sm text-gray-500 text-center">
          Mostrando {projects.length} proyecto{projects.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default StudentProjectsPage;
