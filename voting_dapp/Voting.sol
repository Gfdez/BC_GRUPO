// SPDX-License-Identifier: MIT
pragma solidity ^0.8.3;

contract Voting {
    // Estructura para almacenar información del votante
    struct Voter {
        bool registered;
        bool voted;
        uint256 vote;
    }

    // Estructura para almacenar información del candidato
    struct Candidate {
        string name;
        uint256 voteCount;
        string ipfsHash; // Hash de IPFS con información adicional
    }

    address public owner;
    mapping(address => Voter) public voters;
    Candidate[] public candidates;

    uint256 public startTime;
    uint256 public endTime;
    bool public votingEnded;
    uint256 public winningCandidateId;

    // Eventos
    event VoterRegistered(address voter);
    event CandidateAdded(string name);
    event VoteCast(address voter, uint256 candidateId);
    event VotingEnded(uint256 winningCandidateId, string winnerName);

    /**
     * @dev Constructor que inicializa el contrato con una duración de votación especificada en minutos.
     * @param _votingDurationInMinutes Duración de la votación en minutos.
     */
    constructor(uint256 _votingDurationInMinutes) {
        owner = msg.sender;
        startTime = block.timestamp;
        endTime = startTime + (_votingDurationInMinutes * 60);
        votingEnded = false;
    }

    // Modificador para funciones solo del propietario
    modifier onlyOwner() {
        require(msg.sender == owner, "Solo el propietario puede realizar esta accion");
        _;
    }

    // Modificador para verificar si la votacion aun esta activa
    modifier votingActive() {
        require(block.timestamp >= startTime, "La votacion no ha comenzado");
        require(block.timestamp <= endTime, "La votacion ha terminado");
        require(!votingEnded, "La votacion ya ha finalizado");
        _;
    }

    // Función para registrar un votante
    function registerVoter(address _voter) public onlyOwner {
        require(!voters[_voter].registered, "El votante ya esta registrado");
        voters[_voter].registered = true;
        emit VoterRegistered(_voter);
    }

    // Función para añadir un candidato
    function addCandidate(string memory _name, string memory _ipfsHash) public onlyOwner {
        candidates.push(Candidate({
            name: _name,
            voteCount: 0,
            ipfsHash: _ipfsHash
        }));
        emit CandidateAdded(_name);
    }

    // Función para votar
    function vote(uint256 _candidateId) public votingActive {
        Voter storage sender = voters[msg.sender];
        require(sender.registered, "No estas registrado para votar");
        require(!sender.voted, "Ya has votado");
        require(_candidateId < candidates.length, "Candidato no valido");

        sender.voted = true;
        sender.vote = _candidateId;
        candidates[_candidateId].voteCount += 1;
        emit VoteCast(msg.sender, _candidateId);
    }

    // Función para finalizar la votación y determinar al ganador
    function endVoting() public onlyOwner {
        require(block.timestamp > endTime, "La votacion aun esta activa");
        require(!votingEnded, "La votacion ya ha finalizado");

        votingEnded = true;
        uint256 highestVoteCount = 0;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > highestVoteCount) {
                highestVoteCount = candidates[i].voteCount;
                winningCandidateId = i;
            }
        }

        require(highestVoteCount > 0, "No hay votos para determinar un ganador");
        emit VotingEnded(winningCandidateId, candidates[winningCandidateId].name);
    }

    // Función para obtener el ganador
    function getWinner() public view returns (string memory name, uint256 voteCount, string memory ipfsHash) {
        require(votingEnded, "La votacion no ha finalizado");
        Candidate storage winner = candidates[winningCandidateId];
        return (winner.name, winner.voteCount, winner.ipfsHash);
    }

    // Función para obtener el número total de candidatos
    function getNumCandidates() public view returns (uint256) {
        return candidates.length;
    }

    // Función para obtener información de un candidato
    function getCandidate(uint256 _candidateId) public view returns (string memory, uint256, string memory) {
        require(_candidateId < candidates.length, "Candidato no valido");
        Candidate storage candidate = candidates[_candidateId];
        return (candidate.name, candidate.voteCount, candidate.ipfsHash);
    }

    // Función para obtener la dirección del propietario
    function getOwner() public view returns (address) {
        return owner;
    }
}