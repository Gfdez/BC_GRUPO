import React, { useState } from 'react';
import { castVote, getCandidates } from '../services/blockchain';
import { getRevertMessage } from '../utils/errorHandler';
import Message from './Message';

/**
 * Componente para listar los candidatos y permitir la votación.
 * @param {Array} candidates - Lista de candidatos.
 * @param {Function} setCandidates - Función para actualizar la lista de candidatos.
 * @param {boolean} isAdmin - Indica si el usuario es Admin.
 */
const CandidatesList = ({ candidates, setCandidates, isAdmin }) => {
  // Estado para mostrar mensajes de éxito o error al usuario
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Maneja la emisión de un voto para un candidato específico.
   * @param {number} id - ID del candidato.
   */
  const handleVote = async (id) => {
    try {
      // Llamar al servicio blockchain para emitir el voto
      await castVote(id);
      // Obtener la lista actualizada de candidatos tras el voto
      const updatedCandidates = await getCandidates();
      setCandidates(updatedCandidates);
      // Mostrar mensaje de éxito al usuario
      setMessage({ type: 'success', text: 'Voto emitido correctamente.' });
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      console.error('Error al emitir el voto:', error);
      // Obtener el mensaje de error detallado
      const errorMessage = getRevertMessage(error);
      // Mostrar mensaje de error al usuario
      setMessage({ type: 'error', text: errorMessage });
    }
  };

  return (
    <div className="bg-gray-800 shadow-md rounded p-6">
      <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Candidatos</h2>
      {/* Mostrar mensaje de éxito o error si existe */}
      {message.text && <Message type={message.type}>{message.text}</Message>}
      <ul>
        {/* Iterar sobre la lista de candidatos y renderizar cada uno */}
        {candidates && candidates.map((candidate) => (
          <li key={candidate.id} className="flex justify-between items-center mb-4 p-4 border border-gray-700 rounded">
            <div>
              {/* Mostrar el nombre del candidato */}
              <h3 className="text-lg font-medium text-white">{candidate.name}</h3>
              {/* Mostrar el número de votos del candidato */}
              <p className="text-gray-400">Votos: {candidate.voteCount}</p>
              {/* Enlace para ver más información del candidato en IPFS */}
              <a href={`https://ipfs.io/ipfs/${candidate.ipfsHash}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">
                [Ver más]
              </a>
            </div>
            {/* Botón para emitir voto al candidato */}
            <button
              onClick={() => handleVote(candidate.id)}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition duration-300"
            >
              Votar
            </button>
          </li>
        ))}
        {/* Mostrar mensaje si no hay candidatos registrados */}
        {candidates.length === 0 && <p className="text-center text-gray-500">No hay candidatos registrados.</p>}
      </ul>
    </div>
  );
};

export default CandidatesList;