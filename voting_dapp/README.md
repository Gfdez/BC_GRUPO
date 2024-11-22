# Voting DApp

Este proyecto es una aplicación descentralizada (DApp) de votación construida con React y Solidity. Permite a los usuarios registrar votantes, añadir candidatos y emitir votos en una blockchain. La aplicación garantiza transparencia y seguridad en el proceso de votación mediante el uso de contratos inteligentes desplegados en la red de prueba de Sepolia y almacenamiento descentralizado a través de IPFS.

## Tabla de Contenidos

- [Características](#características)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos](#requisitos)
- [Configuración](#configuración)
- [Despliegue de Contratos](#despliegue-de-contratos)
- [Uso de la Aplicación](#uso-de-la-aplicación)
  - [Interfaz de Usuario](#interfaz-de-usuario)
  - [Roles](#roles)
- [Servicios](#servicios)
- [Contratos Inteligentes](#contratos-inteligentes)
- [Dificultades y Problemas](#dificultadesproblemas)

## Características

- **Autenticación con Wallet:** Los usuarios inician sesión utilizando sus billeteras Ethereum a través de MetaMask.
- **Roles Diferenciados:** 
  - **Admin:** Puede registrar votantes y candidatos, y gestionar el proceso de votación.
  - **Usuario:** Puede emitir un voto una vez registrado por el Admin.
- **Despliegue en Sepolia:** Contratos inteligentes desplegados en la red de prueba de Sepolia usando Remix.
- **Almacenamiento Descentralizado:** Uso de IPFS para almacenar archivos asociados a cada candidato, como sus candidaturas o panfletos.
- **Tiempo Limitado de Votación:** Las votaciones tienen un tiempo límite establecido al desplegar el contrato. Una vez finalizado, ya no se pueden emitir votos.
- **Una Votación por Contrato:** Cada contrato inteligente está diseñado para manejar una única votación.
- **Uso de TailwindCSS:** Para el diseño de la interfaz de usuario se ha utilizado el framework TailwindCSS, permitiendo estilos rápidos y responsivos.


## Estructura del Proyecto

- `.gitignore`
- `package.json`
- `postcss.config.js`
- `public/`: Archivos estáticos
  - `index.html`
  - `manifest.json`
  - `robots.txt`
- `README.md`
- `src/`: Código fuente de la aplicación
  - `App.css`
  - `App.js`
  - `App.test.js`
  - `components/`: Componentes React
    - `AddCandidate.js`
    - `CandidatesList.js`
    - `CastVote.js`
    - `Countdown.js`
    - `Message.js`
    - `RegisterVoter.js`
  - `contracts/`: Contratos inteligentes y direcciones
    - `addresses.js`
    - `Voting.json`
  - `index.css`
  - `index.js`
  - `reportWebVitals.js`
  - `services/`: Servicio para interactuar con la blockchain
    - `blockchain.js`
  - `setupTests.js`
  - `utils/`: Utilidades y funciones auxiliares
    - `errorHandler.js`
- `tailwind.config.js`
- `Voting.sol`: Contrato inteligente escrito en Solidity

## Requisitos

- **Node.js** y **npm**
- **MetaMask** instalado en el navegador
- **Remix IDE** para desplegar contratos inteligentes
- **Nodo IPFS** ejecutándose localmente en tu equipo

## Configuración

1. **Clona el Repositorio:**
   ```sh
   git clone https://github.com/tu-usuario/voting_dapp.git
   cd voting_dapp
   ```

2. **Instala las Dependencias:**
   ```sh
   npm install
   ```

3. **Configura IPFS:**
   - Asegúrate de tener un nodo IPFS ejecutándose localmente.
   - Puedes instalar IPFS siguiendo las instrucciones en [IPFS Docs](https://docs.ipfs.io/).

4. **Configura MetaMask:**
   - Conéctate a la red de prueba de Sepolia.
   - Asegúrate de tener fondos de prueba en tu cuenta de Sepolia.

## Despliegue de Contratos

1. **Abre Remix IDE:**
   - Ve a [Remix](https://remix.ethereum.org/).

2. **Carga Voting.sol:**
   - Navega hasta el archivo `Voting.sol`.

3. **Compila el Contrato:**
   - Selecciona la versión de Solidity `^0.8.3`.
   - Compila el contrato.

4. **Despliega el Contrato:**
   - En la sección de despliegue, selecciona la cuenta de MetaMask.
   - Establece el parámetro `_votingDurationInMinutes` según la duración deseada de la votación.
   - Despliega el contrato en la red de Sepolia.

5. **Actualiza `addresses.js`:**
   - Después de desplegar, copia la dirección del contrato y actualízala en `src/contracts/addresses.js`:

## Uso de la Aplicación

### Interfaz de Usuario

Al visitar la página web de la aplicación, los usuarios deben conectar su billetera Ethereum utilizando MetaMask. Dependiendo de su rol (Admin o Usuario), verán interfaces diferentes:

**Admin:**
- Acceso a componentes para registrar votantes (`RegisterVoter.js`) y candidatos (`AddCandidate.js`).
- Capacidad para iniciar y finalizar la votación.

**Usuario:**
- Visualización de la lista de candidatos (`CandidatesList.js`).
- Capacidad para emitir un voto una vez registrado.

### Roles

**Admin:**
- **Registro de Votantes:** Sólo el Admin puede registrar direcciones de votantes autorizados.
- **Registro de Candidatos:** Añade candidatos a la votación, incluyendo la subida de archivos a IPFS.
- **Gestión de Votación:** Controla el inicio y fin del periodo de votación.

**Usuario:**
- **Participación en Votación:** Los usuarios registrados pueden emitir un voto.
- **Visualización de Candidatos:** Pueden ver la lista de candidatos disponibles para votar.

## Servicios

**Blockchain Service (`blockchain.js`):**
- Inicializa la conexión con MetaMask y la red de Sepolia.
- Interactúa con el contrato inteligente para registrar votantes, añadir candidatos, emitir votos y obtener información de la votación.
- Escucha eventos emitidos por el contrato para actualizar la interfaz en tiempo real.

**IPFS Integration:**
- Utiliza un nodo IPFS local para subir archivos asociados a cada candidato.
- Los hash de IPFS se almacenan en el contrato inteligente para referenciar los archivos.

## Contratos Inteligentes

**Voting.sol:**
- Gestiona el registro de votantes y candidatos.
- Controla el proceso de votación, incluyendo la emisión de votos y la determinación del ganador.
- Emite eventos para cada acción relevante, facilitando la actualización de la interfaz de usuario.

## Dificultades/Problemas
**Gestión de las redes y cuentas**

Debido a que la aplicación presenta diferencias de comportamiento y aspectos de UI dependiendo de si el usuario es Admin o no, fue necesario probarla completamente utilizando múltiples cuentas. 

El problema ocurrió al iniciar sesión por primera vez con la cuenta del cliente, se seleccionó accidentalmente una red distinta a Sepolia, lo que impidió obtener el contrato y poder interactuar con él. 

Para resolver este inconveniente, desarrollamos el código necesario para detectar la red del usuario y, si esta no es Sepolia, permitir que seleccione la red correcta. Aunque la solución era sencilla, llevó bastante tiempo entender que era lo que ocurría y solucionar el problema.
