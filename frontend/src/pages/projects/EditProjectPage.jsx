import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../services/api';
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const EditProjectPage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    keywords: '',
    typeId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectRes, typesRes] = await Promise.all([
          projectService.getById(uuid),
          projectService.getTypes(),
        ]);
        
        const project = projectRes.data.data;
        setFormData({
          title: project.title || '',
          abstract: project.abstract || '',
          keywords: project.keywords || '',
          typeId: project.type_id?.toString() || '',
        });
        setTypes(typesRes.data.data || []);
      } catch (err) {
        console.error('Error fetching project:', err);
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uuid, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.typeId) {
      setError('Por favor selecciona un tipo de proyecto');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await projectService.update(uuid, formData);
      navigate(`/projects/${uuid}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el proyecto');
    } finally {
      setSaving(false);
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

  const getTypeDescription = (type) => {
    switch (type) {
      case 'tesis': return 'Trabajo de investigación extenso para obtener título profesional';
      case 'tesina': return 'Trabajo de investigación de menor extensión';
      case 'proyecto_investigacion': return 'Proyecto de investigación académica';
      case 'memoria_profesional': return 'Documentación de experiencia profesional';
      case 'informe_practicas': return 'Informe de prácticas profesionales realizadas';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/projects/${uuid}`)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Volver al proyecto
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Editar Proyecto</h1>
        <p className="text-gray-500 mt-1">
          Modifica la información de tu proyecto
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Proyecto <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {types.map((type) => (
                <label
                  key={type.id}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all ${
                    formData.typeId === type.id.toString()
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="typeId"
                    value={type.id}
                    checked={formData.typeId === type.id.toString()}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex flex-col">
                    <span className={`block text-sm font-medium ${
                      formData.typeId === type.id.toString() ? 'text-indigo-900' : 'text-gray-900'
                    }`}>
                      {getTypeLabel(type.name)}
                    </span>
                    <span className="mt-1 text-xs text-gray-500">
                      {getTypeDescription(type.name)}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Título del Proyecto <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: Desarrollo de un sistema de gestión..."
            />
          </div>

          {/* Abstract */}
          <div>
            <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-1">
              Resumen
            </label>
            <textarea
              id="abstract"
              name="abstract"
              rows={5}
              value={formData.abstract}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              placeholder="Describe brevemente tu proyecto, sus objetivos y alcance..."
            />
          </div>

          {/* Keywords */}
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
              Palabras Clave
            </label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              value={formData.keywords}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej: inteligencia artificial, machine learning, educación"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separa las palabras clave con comas
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(`/projects/${uuid}`)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;
