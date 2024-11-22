import React, { useState } from 'react';
import { registerVoter } from '../services/blockchain';
import { ethers } from 'ethers';
import { getRevertMessage } from '../utils/errorHandler';
import Message from './Message';

/**
 * Componente para registrar una nueva dirección de votante en el sistema.
 * Solo puede ser utilizado por el Admin para autorizar a usuarios a participar en la votación.
 */
const RegisterVoter = () => {
  // Estado para almacenar la dirección Ethereum del votante a registrar
  const [voterAddress, setVoterAddress] = useState('');
  // Estado para gestionar el estado de carga durante el proceso de registro
  const [loading, setLoading] = useState(false);
  // Estado para mostrar mensajes de éxito o error al usuario
  const [message, setMessage] = useState({ type: '', text: '' });

  /**
   * Maneja el envío del formulario para registrar un nuevo votante.
   * @param {Event} e - Evento de envío del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setLoading(true); // Inicia el estado de carga
    setMessage({ type: '', text: '' }); // Limpia mensajes anteriores

    // Valida que la dirección Ethereum ingresada sea válida
    if (!ethers.utils.isAddress(voterAddress)) {
      setMessage({ type: 'error', text: 'Dirección Ethereum inválida.' });
      setLoading(false); // Finaliza el estado de carga
      return;
    }

    try {
      // Llama al servicio blockchain para registrar la dirección del votante
      await registerVoter(voterAddress);
      // Muestra mensaje de éxito al usuario
      setMessage({ type: 'success', text: 'Votante registrado exitosamente.' });
      // Resetea el campo de entrada después del registro exitoso
      setVoterAddress('');
    } catch (error) {
      console.error('Error al registrar votante:', error);
      // Obtiene el mensaje de error detallado desde el manejador de errores
      const errorMessage = getRevertMessage(error);
      // Muestra mensaje de error al usuario
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false); // Finaliza el estado de carga independientemente del resultado
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 shadow-md rounded p-6 flex flex-col flex-1"
    >
      {/* Título del formulario */}
      <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Registrar Votante</h2>
      
      {/* Campo de entrada para la dirección Ethereum del votante */}
      <input
        type="text"
        value={voterAddress}
        onChange={(e) => setVoterAddress(e.target.value)}
        placeholder="Dirección del votante"
        required
        className="w-full p-3 border border-gray-700 rounded mb-4 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      
      {/* Botón para enviar el formulario de registro */}
      <button
        type="submit"
        className={`mt-auto bg-indigo-600 text-white px-4 py-3 rounded hover:bg-indigo-700 transition duration-300 ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading} // Deshabilita el botón si está en estado de carga
      >
        {loading ? 'Registrando...' : 'Registrar'}
      </button>
      
      {/* Componente para mostrar mensajes de éxito o error */}
      {message.text && <Message type={message.type}>{message.text}</Message>}
    </form>
  );
};

export default RegisterVoter;