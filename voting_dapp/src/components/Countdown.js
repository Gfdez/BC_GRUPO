// src/components/Countdown.js

import React, { useEffect, useState } from 'react';

/**
 * Componente para mostrar una cuenta regresiva hasta el fin de la votación.
 * @param {number} endTime - Tiempo final de la votación en formato de marca de tiempo Unix.
 */
const Countdown = ({ endTime }) => {
  /**
   * Calcula el tiempo restante hasta el final de la votación.
   * @returns {Object|null} Objeto con días, horas, minutos y segundos restantes o null si el tiempo ha terminado.
   */
  const calculateTimeLeft = () => {
    // Calcula la diferencia en milisegundos entre el tiempo final y el tiempo actual
    const difference = endTime * 1000 - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      // Calcula los días, horas, minutos y segundos restantes
      timeLeft = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    } else {
      // Si el tiempo ha terminado, retorna null
      timeLeft = null;
    }

    return timeLeft;
  };

  // Estado para almacenar el tiempo restante
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    /**
     * Establece un intervalo que actualiza el tiempo restante cada segundo.
     */
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Limpia el intervalo cuando el componente se desmonta o cuando cambia endTime
    return () => clearInterval(timer);
  }, [endTime]);

  // Array para almacenar los componentes de tiempo (días, horas, minutos, segundos)
  const timerComponents = [];

  // Si no hay tiempo restante, muestra un mensaje indicando que la votación ha finalizado
  if (!timeLeft) {
    return <span>La votación ha finalizado.</span>;
  }

  // Itera sobre cada intervalo de tiempo y crea un elemento <span> para mostrarlo
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval]) {
      return; // Omite intervalos con valor 0
    }

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });

  return (
    <div className="p-4 bg-gray-800 rounded text-center">
      <h2 className="text-xl font-semibold mb-2">Tiempo Restante</h2>
      <div className="text-2xl">
        {/* Muestra los componentes de tiempo o un mensaje si la votación ha finalizado */}
        {timerComponents.length ? timerComponents : <span>La votación ha finalizado.</span>}
      </div>
    </div>
  );
};

export default Countdown;