import React, { useState } from 'react';
import { addCandidate } from '../services/blockchain';
import { getRevertMessage } from '../utils/errorHandler';
import Message from './Message';

/**
 * Componente para añadir un nuevo candidato a la votación.
 */
const AddCandidate = () => {
  // Estado para el nombre del candidato
  const [name, setName] = useState('');
  // Estado para el archivo asociado al candidato (candidatura o panfletos)
  const [file, setFile] = useState(null);
  // Estado para manejar el estado de carga durante el proceso de adición
  const [loading, setLoading] = useState(false);
  // Estado para mostrar mensajes de éxito o error al usuario
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Maneja el envío del formulario para añadir un candidato.
   * @param {Event} e Evento de envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que ambos campos estén completos
    if (!name || !file) {
      setMessage({ type: 'error', text: 'Por favor, completa todos los campos.' });
      return;
    }

    // Iniciar estado de carga y limpiar mensajes previos
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Llamar al servicio blockchain para añadir el candidato
      await addCandidate(name, file);
      // Mostrar mensaje de éxito
      setMessage({ type: 'success', text: 'Candidato añadido exitosamente.' });
      // Resetear campos del formulario
      setName('');
      setFile(null);
    } catch (error) {
      console.error('Error al añadir candidato:', error);
      // Obtener mensaje de error detallado
      const errorMessage = getRevertMessage(error);
      // Mostrar mensaje de error al usuario
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      // Finalizar estado de carga
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 shadow-md rounded p-6 flex flex-col">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Añadir Candidato</h2>
      
      {/* Campo de entrada para el nombre del candidato */}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del candidato"
        required
        className="w-full p-3 border border-gray-700 rounded mb-4 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      
      {/* Campo de entrada para el archivo asociado al candidato */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        required
        className="w-full p-3 border border-gray-700 rounded mb-4 bg-gray-700 text-white focus:outline-none"
      />
      
      {/* Botón para enviar el formulario */}
      <button
        type="submit"
        className={`w-full bg-indigo-600 text-white px-4 py-3 rounded hover:bg-indigo-700 transition duration-300 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading} // Deshabilitar botón si está en estado de carga
      >
        {loading ? 'Añadiendo...' : 'Añadir Candidato'}
      </button>
      
      {/* Mostrar mensaje de éxito o error */}
      {message.text && <Message type={message.type}>{message.text}</Message>}
    </form>
  );
};

export default AddCandidate;