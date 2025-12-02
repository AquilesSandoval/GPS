import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { projectService, notificationService } from '../../services/api';
import {
  FolderIcon,
  BellIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { user, isStudent, isTeacher, isCommittee, isLibrary } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, notificationsRes] = await Promise.all([
          projectService.getAll({ limit: 5 }),
          notificationService.getAll({ limit: 5 }),
        ]);

        const projects = projectsRes.data.data || [];
        setRecentProjects(projects);

        // Calculate stats
        setStats({
          total: projects.length,
          pending: projects.filter(p => ['postulado', 'en_revision'].includes(p.status_name)).length,
          approved: projects.filter(p => p.status_name === 'aprobado').length,
          rejected: projects.filter(p => p.status_name === 'rechazado').length,
        });

        setNotifications(notificationsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getRoleActions = () => {
    if (isStudent) {
      return [
        { name: 'Nuevo Proyecto', href: '/projects/new', icon: PlusIcon, description: 'Crear una nueva propuesta de proyecto' },
        { name: 'Mis Proyectos', href: '/projects', icon: FolderIcon, description: 'Ver todos tus proyectos' },
      ];
    }
    if (isTeacher) {
      return [
        { name: 'Proyectos Asignados', href: '/projects', icon: FolderIcon, description: 'Ver proyectos para revisar' },
      ];
    }
    if (isCommittee) {
      return [
        { name: 'Todos los Proyectos', href: '/projects', icon: FolderIcon, description: 'Gestionar proyectos del sistema' },
        { name: 'Búsqueda Avanzada', href: '/search', icon: DocumentTextIcon, description: 'Buscar proyectos y documentos' },
      ];
    }
    if (isLibrary) {
      return [
        { name: 'Proyectos Aprobados', href: '/projects', icon: FolderIcon, description: 'Ver proyectos para archivar' },
        { name: 'Búsqueda', href: '/search', icon: DocumentTextIcon, description: 'Buscar en el archivo' },
      ];
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold">
          {getWelcomeMessage()}, {user?.first_name}
        </h1>
        <p className="mt-2 text-indigo-100">
          Bienvenido al Sistema de Gestión de Proyectos de Titulación e Investigación
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getRoleActions().map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 rounded-lg p-3 group-hover:bg-indigo-200 transition-colors">
                  <action.icon className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{action.description}</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <FolderIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-500">Total Proyectos</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 rounded-lg p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-500">Pendientes</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 rounded-lg p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                <p className="text-sm text-gray-500">Aprobados</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-100 rounded-lg p-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                <p className="text-sm text-gray-500">Rechazados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Proyectos Recientes</h3>
            <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-500">
              Ver todos
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentProjects.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <FolderIcon className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2">No hay proyectos aún</p>
                {isStudent && (
                  <Link
                    to="/projects/new"
                    className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Crear tu primer proyecto
                  </Link>
                )}
              </div>
            ) : (
              recentProjects.map((project) => (
                <Link
                  key={project.uuid}
                  to={`/projects/${project.uuid}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{project.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{project.type_name}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(project.status_name)}`}>
                      {getStatusLabel(project.status_name)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            <Link to="/notifications" className="text-sm text-indigo-600 hover:text-indigo-500">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2">No hay notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 ${!notification.is_read ? 'bg-indigo-50' : ''}`}
                >
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.created_at).toLocaleDateString('es-MX', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
