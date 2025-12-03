import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projectService, documentService } from '../../services/api';
import {
  MagnifyingGlassIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';

const LibraryArchivePage = () => {
  const [projects, setProjects] = useState([]);
  const [projectDocuments, setProjectDocuments] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [archivingProject, setArchivingProject] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projectsRes, statusesRes] = await Promise.all([
        projectService.getArchiveReadyProjects(),
        projectService.getStatuses(),
      ]);
      const projectsData = projectsRes.data.data || [];
      setProjects(projectsData);
      setStatuses(statusesRes.data.data || []);

      const docsPromises = projectsData.map(async (project) => {
        try {
          const docsRes = await documentService.getByProject(project.uuid);
          return { uuid: project.uuid, documents: docsRes.data.data || [] };
        } catch {
          return { uuid: project.uuid, documents: [] };
        }
      });

      const docsResults = await Promise.all(docsPromises);
      const docsMap = {};
      docsResults.forEach((result) => {
        docsMap[result.uuid] = result.documents;
      });
      setProjectDocuments(docsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const getFileFormat = (filename) => {
    if (!filename) return 'UNKNOWN';
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'PDF';
      case 'doc': return 'DOC';
      case 'docx': return 'DOCX';
      default: return ext?.toUpperCase() || 'UNKNOWN';
    }
  };

  const isPdfFormat = (filename) => {
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.pdf');
  };

  const getArchivoStatusId = () => {
    const archivoStatus = statuses.find(s => s.name === 'archivado');
    return archivoStatus ? archivoStatus.id : 7;
  };

  const handleArchive = async (project) => {
    if (!window.confirm(`¿Estás seguro de que deseas archivar el proyecto "${project.title}"?`)) {
      return;
    }

    setArchivingProject(project.uuid);
    try {
      const statusId = getArchivoStatusId();
      await projectService.updateStatus(project.uuid, statusId, 'Archivado por biblioteca');
      await fetchData();
    } catch (error) {
      console.error('Error archiving project:', error);
      alert('Error al archivar el proyecto. Por favor intente nuevamente.');
    } finally {
      setArchivingProject(null);
    }
  };

  const toggleProjectExpansion = (uuid) => {
    setExpandedProject(expandedProject === uuid ? null : uuid);
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;

    const query = searchQuery.toLowerCase();
    return projects.filter((project) => {
      const titleMatch = project.title?.toLowerCase().includes(query);
      const keywordsMatch = project.keywords?.toLowerCase().includes(query);
      const authorsMatch = project.authors?.some(
        (author) =>
          `${author.first_name} ${author.last_name}`.toLowerCase().includes(query)
      );
      return titleMatch || keywordsMatch || authorsMatch;
    });
  }, [projects, searchQuery]);

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
        <h1 className="text-2xl font-bold text-gray-900">Archivo y Validación de Documentos</h1>
        <p className="text-gray-500 mt-1">
          Gestiona el archivo de proyectos aprobados y valida sus documentos
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por título, autor o palabras clave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FolderIcon className="h-16 w-16 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {searchQuery
              ? 'No se encontraron proyectos'
              : 'No hay proyectos listos para archivar'}
          </h3>
          <p className="mt-2 text-gray-500">
            {searchQuery
              ? 'Intenta con otros términos de búsqueda'
              : 'Los proyectos aparecerán aquí cuando sean aprobados'}
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
                    Fecha Aprobación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documentos
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.map((project) => {
                  const documents = projectDocuments[project.uuid] || [];
                  const isExpanded = expandedProject === project.uuid;

                  return (
                    <>
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
                            {formatDate(project.approved_at || project.updated_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleProjectExpansion(project.uuid)}
                            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            <DocumentTextIcon className="h-4 w-4" />
                            <span>{documents.length} documento{documents.length !== 1 ? 's' : ''}</span>
                            {documents.length > 0 && (
                              <span className="text-xs">
                                {isExpanded ? '▲' : '▼'}
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleArchive(project)}
                              disabled={archivingProject === project.uuid}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {archivingProject === project.uuid ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              ) : (
                                <ArchiveBoxIcon className="h-4 w-4" />
                              )}
                              Archivar
                            </button>
                            <Link
                              to={`/projects/${project.uuid}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                              Ver Proyecto
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && documents.length > 0 && (
                        <tr key={`${project.uuid}-docs`}>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Nombre
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Formato
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Tamaño
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Versión
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Fecha Subida
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                      Validación
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {documents.map((doc) => {
                                    const isPdf = isPdfFormat(doc.original_name);
                                    return (
                                      <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                          <div className="flex items-center gap-2">
                                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-900">
                                              {doc.original_name}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-4 py-3">
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                            isPdf
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {getFileFormat(doc.original_name)}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                          {formatFileSize(doc.file_size)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                          v{doc.version || 1}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                          {formatDate(doc.uploaded_at || doc.created_at)}
                                        </td>
                                        <td className="px-4 py-3">
                                          {isPdf ? (
                                            <div className="flex items-center gap-1 text-green-600">
                                              <CheckCircleIcon className="h-5 w-5" />
                                              <span className="text-xs">Formato válido</span>
                                            </div>
                                          ) : (
                                            <div className="flex items-center gap-1 text-yellow-600">
                                              <ExclamationTriangleIcon className="h-5 w-5" />
                                              <span className="text-xs">Requiere PDF</span>
                                            </div>
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryArchivePage;
