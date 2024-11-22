import React from 'react';

/**
 * Componente para mostrar mensajes de retroalimentación al usuario.
 * @param {string} type - Tipo de mensaje ('error', 'success', 'info', 'warning').
 * @param {React.ReactNode} children - Contenido del mensaje.
 */
const Message = ({ type, children }) => {
  let bgColor, textColor;

  // Determina los colores de fondo y texto según el tipo de mensaje
  switch (type) {
    case 'error':
      bgColor = 'bg-red-100';
      textColor = 'text-red-600';
      break;
    case 'success':
      bgColor = 'bg-green-100';
      textColor = 'text-green-600';
      break;
    case 'info':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-600';
      break;
    case 'warning':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-600';
      break;
    default:
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-600';
  }

  return (
    // Contenedor del mensaje con estilos dinámicos
    <div className={`p-4 rounded ${bgColor}`}>
      {/* Texto del mensaje con color dinámico */}
      <p className={`text-sm ${textColor}`}>{children}</p>
    </div>
  );
};

export default Message;