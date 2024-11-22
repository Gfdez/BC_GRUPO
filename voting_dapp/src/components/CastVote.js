import React, { useState } from 'react';
import { castVote, getCandidates } from '../services/blockchain';
import { getRevertMessage } from '../utils/errorHandler';

/**
 * Componente para emitir un voto a un candidato seleccionado.
 * @param {Array} candidates - Lista de candidatos disponibles para votar.
 * @param {Function} setCandidates - Función para actualizar la lista de candidatos después de votar.
 */
const CastVote = ({ candidates = [], setCandidates }) => {
  // Estado para almacenar el ID del candidato seleccionado por el usuario
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  // Estado para mostrar mensajes de retroalimentación al usuario (éxito o error)
  const [message, setMessage] = useState('');
  // Estado para manejar el indicador de carga durante el proceso de votación
  const [loading, setLoading] = useState(false);

  /**
   * Maneja el evento de envío del formulario para emitir un voto.
   * @param {Event} e - Evento de envío del formulario.
   */
  const handleVote = async (e) => {
    e.preventDefault();

    // Validar que el usuario haya seleccionado un candidato antes de votar
    if (selectedCandidate === null) {
      setMessage('Por favor, selecciona un candidato.');
      return;
    }

    // Iniciar estado de carga y limpiar mensajes previos
    setLoading(true);
    setMessage('');

    try {
      // Llamar al servicio blockchain para emitir el voto al candidato seleccionado
      await castVote(selectedCandidate);
      // Mostrar mensaje de éxito al usuario
      setMessage('Voto emitido correctamente.');
      // Obtener la lista actualizada de candidatos con los nuevos recuentos de votos
      const updatedCandidates = await getCandidates();
      // Actualizar el estado de candidatos en el componente padre
      setCandidates(updatedCandidates);
      // Resetear la selección del candidato después de votar
      setSelectedCandidate(null);
    } catch (error) {
      console.error('Error al emitir el voto:', error);
      // Obtener el mensaje de error detallado desde el manejador de errores
      const errorMessage = getRevertMessage(error);
      // Mostrar mensaje de error al usuario
      setMessage(errorMessage);
    } finally {
      // Finalizar estado de carga independientemente del resultado
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 shadow-md rounded p-6">
      <h2 className="text-2xl font-bold mb-4 text-indigo-400">Emitir Voto</h2>
      <form onSubmit={handleVote}>
        {/* Renderizar una lista de radio buttons para cada candidato disponible */}
        {candidates.map((candidate) => (
          <div key={candidate.id} className="mb-2">
            <label className="flex items-center">
              {/* Radio button para seleccionar al candidato */}
              <input
                type="radio"
                name="candidate"
                value={candidate.id}
                onChange={() => setSelectedCandidate(candidate.id)}
                className="mr-2"
              />
              {/* Nombre del candidato y su recuento de votos actual */}
              <span className="text-white">{candidate.name} (Votos: {candidate.voteCount})</span>
            </label>
          </div>
        ))}
        {/* Botón para enviar el formulario de votación */}
        <button
          type="submit"
          className={`mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading} // Deshabilitar el botón si está en estado de carga
        >
          {loading ? 'Emitiendo Voto...' : 'Votar'}
        </button>
      </form>
      {/* Mostrar mensaje de error o éxito si existe */}
      {message && <p className="mt-2 text-sm text-red-400">{message}</p>}
    </div>
  );
};

export default CastVote;