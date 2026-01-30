### Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Backend SPS rodando (test-sps-server)

### Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/username/sps-frontend.git
   cd sps-frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env`:
   ```env
   REACT_APP_SERVER_URL=http://localhost:3001
   REACT_APP_ENV=development
   ```

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm start
   # ou
   yarn start
   ```

5. **Acesse a aplicação**
   
   Abra [http://localhost:3001](http://localhost:3001) no seu navegador.

