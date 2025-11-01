'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

const API_URL = 'https://prueba-tecnica-mindora.vercel.app/api';

interface Task {
  _id: string;
  titulo: string;
  descripcion?: string;
  prioridad: number;
  fechaVencimiento?: string;
  etiquetas?: string[];
  completada: boolean;
  creadoEn: string;
  actualizadoEn: string;
  completadaEn?: string | null;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completadas' | 'incompletas'>('all');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 5,
    fechaVencimiento: '',
    etiquetas: ''
  });

  // Cargar tareas
  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/tasks`;
      
      if (filter === 'completadas' || filter === 'incompletas') {
        url = `${API_URL}/tasks/estado/${filter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setTasks(data.data || []);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
      alert('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  // Crear tarea
  const createTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const taskData: any = {
      titulo: formData.titulo,
      prioridad: formData.prioridad
    };
    
    if (formData.descripcion) taskData.descripcion = formData.descripcion;
    if (formData.fechaVencimiento) taskData.fechaVencimiento = new Date(formData.fechaVencimiento).toISOString();
    if (formData.etiquetas) taskData.etiquetas = formData.etiquetas.split(',').map(e => e.trim());
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      
      if (response.ok) {
        setFormData({ titulo: '', descripcion: '', prioridad: 5, fechaVencimiento: '', etiquetas: '' });
        setShowForm(false);
        fetchTasks();
      } else {
        alert('Error al crear la tarea');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la tarea');
    }
  };

  // Completar tarea
  const toggleComplete = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${id}/completar`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Eliminar tarea
  const deleteTask = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;
    
    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Función para obtener color según prioridad
  const getPriorityColor = (prioridad: number) => {
    if (prioridad >= 8) return 'bg-red-100 text-red-800 border-red-300';
    if (prioridad >= 5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Todo List - Mindora</h1>
          <p className="text-gray-600">Sistema de gestión de tareas</p>
        </div>

        {/* Filtros y botón crear */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Todas ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('incompletas')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'incompletas'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pendientes
              </button>
              <button
                type="button"
                onClick={() => setFilter('completadas')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'completadas'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Completadas
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              {showForm ? '✕ Cancelar' : '+ Nueva Tarea'}
            </button>
          </div>
        </div>

        {/* Formulario de creación */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nueva Tarea</h2>
            <form onSubmit={createTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  required
                  value={formData.titulo}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, titulo: e.target.value })}
                  className="text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: Comprar leche"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                  placeholder="Detalles adicionales..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.prioridad}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, prioridad: parseInt(e.target.value) })}
                    className="text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fechaVencimiento}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                    className="text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={formData.etiquetas}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, etiquetas: e.target.value })}
                  className="text-gray-800 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ej: trabajo, urgente, importante"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Crear Tarea
              </button>
            </form>
          </div>
        )}

        {/* Lista de tareas */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500">Cargando tareas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <p className="text-gray-500">No hay tareas {filter !== 'all' ? filter : ''}</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task._id}
                className={`bg-white rounded-lg shadow-lg p-6 transition hover:shadow-xl ${
                  task.completada ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => !task.completada && toggleComplete(task._id)}
                    className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                      task.completada
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-indigo-500'
                    }`}
                  >
                    {task.completada && <span className="text-white text-sm">✓</span>}
                  </button>

                  {/* Contenido */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`text-lg font-semibold ${
                        task.completada ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}>
                        {task.titulo}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        getPriorityColor(task.prioridad)
                      }`}>
                        Prioridad: {task.prioridad}
                      </span>
                    </div>

                    {task.descripcion && (
                      <p className="text-gray-600 mb-3">{task.descripcion}</p>
                    )}

                    {/* Etiquetas */}
                    {task.etiquetas && task.etiquetas.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {task.etiquetas.map((etiqueta, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs"
                          >
                            #{etiqueta}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                      <div className="flex gap-4">
                        {task.fechaVencimiento && (
                          <span>
                            Fecha: {new Date(task.fechaVencimiento).toLocaleDateString('es-ES')}
                          </span>
                        )}
                        <span>
                          Creada: {new Date(task.creadoEn).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTask(task._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}