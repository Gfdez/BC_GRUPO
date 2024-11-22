import React, { useEffect, useState } from 'react';
import { initBlockchain, getOwner, getCandidates, listenToEvents, getVotingTimes } from './services/blockchain';
import RegisterVoter from './components/RegisterVoter';
import AddCandidate from './components/AddCandidate';
import CandidatesList from './components/CandidatesList';
import Countdown from './components/Countdown';

/**
 * Componente principal
 */
function App() {
  // Estado para almacenar la instancia del contrato inteligente
  const [contract, setContract] = useState(null);
  // Estado para almacenar la lista de candidatos
  const [candidates, setCandidates] = useState([]);
  // Estado para mostrar mensajes al usuario
  const [message, setMessage] = useState('');
  // Estado para almacenar la cuenta Ethereum conectada
  const [currentAccount, setCurrentAccount] = useState('');
  // Estado para determinar si el usuario actual es el Admin
  const [isAdmin, setIsAdmin] = useState(false);
  // Estado para almacenar los tiempos de inicio y fin de la votación, y si ha finalizado
  const [votingTimes, setVotingTimes] = useState({ startTime: 0, endTime: 0, votingEnded: false });
  // Estado para almacenar el resultado de la votación
  const [votingResult, setVotingResult] = useState(null);

  /**
   * Configura la conexión con la blockchain y obtiene los datos iniciales.
   */
  const setupBlockchain = async () => {
    try {
      // Inicializa la conexión con la blockchain
      const instance = await initBlockchain();
      if (instance) {
        setContract(instance);
        // Obtiene la lista inicial de candidatos
        const initialCandidates = await getCandidates();
        setCandidates(initialCandidates);

        // Obtiene la dirección de la cuenta conectada
        const account = await instance.signer.getAddress();
        setCurrentAccount(account);

        // Obtiene la dirección del propietario del contrato
        const owner = await getOwner();
        // Determina si la cuenta conectada es el Admin
        setIsAdmin(account.toLowerCase() === owner.toLowerCase());

        // Obtiene los tiempos de inicio y fin de la votación
        const times = await getVotingTimes();
        setVotingTimes(times);

        // Escucha los eventos emitidos por el contrato inteligente
        listenToEvents({
          onVoterRegistered: (voter) => {
            setMessage(`Votante registrado: ${voter}`);
          },
          onCandidateAdded: (name) => {
            setMessage(`Candidato añadido: ${name}`);
            // Actualiza la lista de candidatos tras añadir uno nuevo
            fetchCandidates();
          },
          onVoteCast: (voter, candidateId) => {
            setMessage(`Voto emitido por ${voter} para el candidato ID ${candidateId}`);
            // Actualiza la lista de candidatos tras emitir un voto
            fetchCandidates();
          },
          onVotingEnded: (winningCandidateId, winnerName) => {
            setMessage(`Votación finalizada. Ganador: ${winnerName} (ID: ${winningCandidateId})`);
            // Marca la votación como finalizada
            setVotingTimes((prev) => ({ ...prev, votingEnded: true }));
            // Almacena el resultado de la votación
            setVotingResult({ id: winningCandidateId, name: winnerName });
            // Actualiza la lista de candidatos tras finalizar la votación
            fetchCandidates();
          },
        });
      } else {
        setMessage('Conexión con la blockchain fallida.');
      }
    } catch (error) {
      console.error('Error al configurar la blockchain:', error);
      setMessage('Error al configurar la blockchain.');
    }
  };

  /**
   * Obtiene la lista actualizada de candidatos desde la blockchain.
   */
  const fetchCandidates = async () => {
    try {
      const updatedCandidates = await getCandidates();
      setCandidates(updatedCandidates);
    } catch (error) {
      console.error('Error al actualizar candidatos:', error);
    }
  };

  /**
   * Hook que se ejecuta al montar el componente.
   * Configura la blockchain y maneja cambios en cuentas o redes.
   */
  useEffect(() => {
    setupBlockchain();

    /**
     * Maneja el cambio de cuentas en MetaMask.
     * @param {Array} accounts - Array de cuentas Ethereum conectadas.
     */
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        setupBlockchain();
      } else {
        console.log('Por favor, conecta tu cuenta en MetaMask.');
        setCurrentAccount('');
        setContract(null);
      }
    };

    /**
     * Maneja el cambio de red en MetaMask.
     * @param {string} chainId - ID de la nueva cadena.
     */
    const handleChainChanged = (chainId) => {
      console.log('Red cambiada a', chainId);
      // Recarga la página para reconfigurar la conexión con la nueva red
      window.location.reload();
    };

    if (window.ethereum) {
      // Escucha cambios en las cuentas conectadas
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      // Escucha cambios en la red seleccionada
      window.ethereum.on('chainChanged', handleChainChanged);

      // Limpia los listeners al desmontar el componente
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  /**
   * Conecta la wallet del usuario y configura la blockchain.
   */
  const connectWallet = async () => {
    try {
      await setupBlockchain();
    } catch (error) {
      console.error('Error al conectar la wallet:', error);
    }
  };

  return (
    <div className="App min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Título principal de la aplicación */}
        <h1 className="text-4xl font-bold mb-6 text-center text-indigo-400">Sistema de Votaciones</h1>
        
        {/* Muestra un mensaje de retroalimentación si existe */}
        {message && (
          <div className="mb-4 p-4 bg-red-700 text-red-200 rounded">
            {message}
          </div>
        )}
        
        {/* Botón para conectar la wallet si no está conectada */}
        {!currentAccount ? (
          <div className="flex justify-center">
            <button 
              onClick={connectWallet} 
              className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300"
            >
              Conectar Wallet
            </button>
          </div>
        ) : (
          <>
            {/* Contenido principal si la wallet está conectada */}
            {contract ? (
              <div className="space-y-6">
                {/* Mostrar el countdown si la votación no ha finalizado */}
                {!votingTimes.votingEnded && (
                  <Countdown endTime={votingTimes.endTime} />
                )}
                
                {/* Panel de Admin si el usuario es administrador */}
                {isAdmin && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Panel de Admin</h2>
                    <div className="flex space-x-6">
                      {/* Componente para registrar votantes */}
                      <div className="flex-1 flex">
                        <RegisterVoter />
                      </div>
                      {/* Componente para añadir candidatos */}
                      <div className="flex-1 flex">
                        <AddCandidate />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Panel de Usuario si el usuario no es administrador */}
                {!isAdmin && (
                  <h2 className="text-2xl font-semibold mb-4 text-indigo-400">Panel de Usuario</h2>
                )}
                
                {/* Lista de candidatos */}
                <div>
                  <CandidatesList 
                    candidates={candidates} 
                    setCandidates={setCandidates} 
                    isAdmin={isAdmin} 
                  />
                </div>
              </div>
            ) : (
              // Mensaje mientras se conecta con la blockchain
              <p className="text-center text-gray-400">Conectando con la blockchain...</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;