/**
 * Extrae y devuelve el mensaje de error específico de una excepción de contrato inteligente.
 * 
 * Esta función intenta obtener el mensaje de revert específico de diferentes estructuras de objetos de error
 * que pueden ser retornados por las interacciones con contratos inteligentes en Ethereum.
 * 
 * @param {Object} error - Objeto de error capturado durante una interacción con un contrato inteligente.
 * @returns {string} Mensaje de error detallado o un mensaje genérico si no se puede extraer uno específico.
 */
export const getRevertMessage = (error) => {
  // Si el error tiene una propiedad 'reason', devuelve su valor.
  if (error.reason) {
    return error.reason;
  }

  // Si el error tiene una propiedad 'error.message' extrae el mensaje de revert.
  if (error.error && error.error.message) {
    const message = error.error.message;
    const prefix = "execution reverted: ";
    const index = message.indexOf(prefix);
    if (index !== -1) {
      // Retorna la parte del mensaje después del prefijo "execution reverted: ".
      return message.substring(index + prefix.length);
    }
  }

  // Si el error tiene una propiedad 'message', usa una expresión regular para extraer el mensaje de revert.
  if (error.message) {
    const regex = /reverted:\s(.*)/;
    const match = error.message.match(regex);
    if (match && match[1]) {

      return match[1];
    }
  }

  // Si no se pudo extraer un mensaje específico, retorna un mensaje de error genérico.
  return "Ocurrió un error inesperado.";
};