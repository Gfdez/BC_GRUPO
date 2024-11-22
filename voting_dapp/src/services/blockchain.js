import { ethers } from 'ethers';
import VotingABI from '../contracts/Voting.json';
import { CONTRACT_ADDRESS } from '../contracts/addresses';
import { create } from 'kubo-rpc-client';
import { Buffer } from 'buffer';

// Variable para la instancia del contrato inteligente
let contract;
// Variable para el proveedor de Ethereum
let provider;

// Crear un cliente IPFS apuntando al nodo local
const client = create('/ip4/127.0.0.1/tcp/5001');

/**
 * Inicializa la conexión con la blockchain y configura el contrato inteligente.
 * @returns {ethers.Contract|null} Instancia del contrato inteligente o null si falla.
 */
export const initBlockchain = async () => {
  if (window.ethereum) {
    // Crear un proveedor Web3 usando MetaMask
    provider = new ethers.providers.Web3Provider(window.ethereum);
    // Solicitar acceso a las cuentas de MetaMask
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Obtener el ID de la red actual
    const { chainId } = await provider.getNetwork();
    const expectedChainId = 11155111; // ID de cadena de Sepolia

    // Verificar si la red actual es Sepolia
    if (chainId !== expectedChainId) {
      // Intentar cambiar a la red Sepolia
      await switchToSepolia();
      // Re-inicializar el proveedor después del cambio de red
      provider = new ethers.providers.Web3Provider(window.ethereum);
    }

    // Obtener el usuario conectado actualmente
    const signer = provider.getSigner();

    console.log('ABI del contrato:', VotingABI);
    console.log('Dirección del contrato:', CONTRACT_ADDRESS);

    // Validar la ABI del contrato
    if (!VotingABI || !Array.isArray(VotingABI)) {
      console.error('La ABI del contrato es inválida.');
      return null;
    }

    try {
      // Crear una instancia del contrato inteligente
      contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI, signer);
      return contract;
    } catch (error) {
      console.error('Error al crear la instancia del contrato:', error);
      return null;
    }
  } else {
    console.error('MetaMask no está instalado');
    return null;
  }
};

/**
 * Cambia la red de MetaMask a Sepolia.
 * Si Sepolia no está agregada, la añade a MetaMask.
 */
export const switchToSepolia = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // 0xaa36a7 es el hexadecimal de 11155111
    });
  } catch (switchError) {
    // Error 4902: La red no ha sido agregada a MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia Test Network',
              rpcUrls: ['https://sepolia.infura.io/v3/'], // URL del proveedor RPC
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'ETH',
                decimals: 18,
              },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } catch (addError) {
        console.error('Error al agregar la red Sepolia:', addError);
      }
    } else {
      console.error('Error al cambiar a la red Sepolia:', switchError);
    }
  }
};

/**
 * Obtiene la dirección del propietario del contrato inteligente.
 * @returns {string|null} Dirección del propietario o null si falla.
 */
export const getOwner = async () => {
  try {
    if (!contract) {
      console.error('Contrato no está inicializado');
      return null;
    }
    // Llamar a la función getOwner del contrato
    const owner = await contract.getOwner();
    console.log('Dirección del propietario:', owner);
    return owner;
  } catch (error) {
    console.error('Error al obtener el propietario:', error);
    throw error;
  }
};

/**
 * Obtiene la lista de candidatos registrados en la votación.
 * @returns {Array} Array de objetos de candidatos.
 */
export const getCandidates = async () => {
  try {
    console.log('Llamando a getNumCandidates()');
    // Obtener el número total de candidatos
    const numCandidates = await contract.getNumCandidates();
    console.log('Número de candidatos:', numCandidates.toString());

    const candidatesArray = [];
    // Iterar sobre cada candidato para obtener sus detalles
    for (let i = 0; i < numCandidates; i++) {
      const candidate = await contract.getCandidate(i);
      candidatesArray.push({
        id: i,
        name: candidate[0],
        voteCount: candidate[1].toNumber(),
        ipfsHash: candidate[2],
      });
    }
    return candidatesArray;
  } catch (error) {
    console.error('Error al obtener candidatos:', error);
    return [];
  }
};

/**
 * Emite un voto para un candidato específico.
 * @param {number} candidateId - ID del candidato al que se va a votar.
 */
export const castVote = async (candidateId) => {
  try {
    // Llamar a la función vote del contrato inteligente
    const tx = await contract.vote(candidateId);
    // Esperar a que la transacción sea confirmada
    await tx.wait();
    console.log('Voto emitido para el candidato:', candidateId);
  } catch (error) {
    console.error('Error al emitir voto:', error);
    throw error;
  }
};

/**
 * Registra una nueva dirección de votante en el sistema.
 * @param {string} voterAddress - Dirección Ethereum del votante a registrar.
 */
export const registerVoter = async (voterAddress) => {
  try {
    // Validar que la dirección Ethereum sea válida
    if (!ethers.utils.isAddress(voterAddress)) {
      throw new Error('Dirección Ethereum inválida.');
    }
    // Llamar a la función registerVoter del contrato inteligente
    const tx = await contract.registerVoter(voterAddress);
    // Esperar a que la transacción sea confirmada
    await tx.wait();
    console.log('Votante registrado:', voterAddress);
  } catch (error) {
    console.error('Error al registrar votante:', error);
    throw error;
  }
};

/**
 * Añade un nuevo candidato a la votación.
 * Sube el archivo asociado a IPFS y almacena el hash en el contrato.
 * @param {string} name - Nombre del candidato.
 * @param {File} file - Archivo asociado al candidato (candidatura o panfletos).
 */
export const addCandidate = async (name, file) => {
  try {
    // Leer el archivo como ArrayBuffer
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    const arrayBuffer = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
    });

    // Subir el archivo a IPFS
    const result = await client.add(Buffer.from(arrayBuffer));
    const ipfsHash = result.cid.toString();

    // Llamar a la función addCandidate del contrato inteligente con el nombre y el hash de IPFS
    const tx = await contract.addCandidate(name, ipfsHash);
    // Esperar a que la transacción sea confirmada
    await tx.wait();
    console.log('Candidato añadido:', name);
  } catch (error) {
    console.error('Error al añadir candidato:', error);
    throw error;
  }
};

/**
 * Obtiene los tiempos de inicio y fin de la votación, así como si ha finalizado.
 * @returns {Object|null} Objeto con startTime, endTime y votingEnded o null si falla.
 */
export const getVotingTimes = async () => {
  try {
    if (!contract) {
      console.error('Contrato no está inicializado');
      return null;
    }
    // Obtener los tiempos de inicio y fin de la votación desde el contrato
    const startTime = await contract.startTime();
    const endTime = await contract.endTime();
    const votingEnded = await contract.votingEnded();
    return { startTime: startTime.toNumber(), endTime: endTime.toNumber(), votingEnded };
  } catch (error) {
    console.error('Error al obtener los tiempos de votación:', error);
    throw error;
  }
};

/**
 * Escucha los eventos emitidos por el contrato inteligente y ejecuta callbacks correspondientes.
 * @param {Object} callbacks - Objeto con funciones callback para cada evento.
 */
export const listenToEvents = (callbacks) => {
  if (!contract) {
    console.error('Contrato no está inicializado');
    return;
  }

  // Evento emitido cuando se registra un votante
  contract.on('VoterRegistered', (voter) => {
    callbacks.onVoterRegistered && callbacks.onVoterRegistered(voter);
  });

  // Evento emitido cuando se añade un candidato
  contract.on('CandidateAdded', (name) => {
    callbacks.onCandidateAdded && callbacks.onCandidateAdded(name);
  });

  // Evento emitido cuando se emite un voto
  contract.on('VoteCast', (voter, candidateId) => {
    callbacks.onVoteCast && callbacks.onVoteCast(voter, candidateId);
  });

  // Evento emitido cuando la votación ha finalizado
  contract.on('VotingEnded', (winningCandidateId, winnerName) => {
    callbacks.onVotingEnded && callbacks.onVotingEnded(winningCandidateId, winnerName);
  });
};