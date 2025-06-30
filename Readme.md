# Projeto React Faculdade - Aplicativo de Monitoramento e Conexão

## Descrição Geral

Este projeto foi desenvolvido para a faculdade e consiste na criação de um aplicativo web utilizando **React.js**. O app reúne diversas funcionalidades focadas em monitoramento de dados, conexão de dispositivos, interação via chat e suporte ao usuário, tudo em uma interface intuitiva e moderna.

---

## Funcionalidades do Projeto

### 1. Home

- **Gráficos Interativos:**
  A tela inicial apresenta três tipos de gráficos para exibir dados de forma visual e dinâmica:
  - Gráfico de linha
  - Gráfico de barra
  - Gráfico de pizza

- **Clima em Tempo Real:**
  Exibe informações meteorológicas atualizadas constantemente, permitindo que o usuário acompanhe as condições climáticas diretamente na aplicação.

---

### 2. Parte de Conexão

- O usuário pode conectar dispositivos a partir de um botão que oferece duas opções principais:

  - **Conexão via Bluetooth:**
    Ao escolher essa opção, o app automaticamente procura por dispositivos Bluetooth disponíveis para conexão direta.

  - **Conexão Manual:**
    Caso o usuário prefira, pode adicionar um dispositivo manualmente, preenchendo:
    - Nome do aparelho
    - Ícone que representa o dispositivo
    - Cor personalizada para facilitar a identificação

- Após conectar um dispositivo, o usuário pode gerenciar seus aparelhos conectados com as seguintes opções:
  - Remover dispositivo
  - Editar informações do dispositivo
  - Desconectar o dispositivo
  - Ampliar um QR Code gerado para conexão rápida e prática com o dispositivo

- Ao clicar em um aparelho conectado, uma área de detalhes é aberta mostrando:
  - Ícone do dispositivo
  - Nome do dispositivo
  - Status atual da conexão (conectado ou desconectado)
  - Data da conexão (dia e mês)
  - Tempo total que o dispositivo está conectado

---

### 3. Chat Interativo

- Chat integrado ao aplicativo que responde a perguntas aleatórias e a comandos específicos definidos na página.
- Utiliza uma **API de Inteligência Artificial** para gerar respostas inteligentes e contextuais, auxiliando o usuário com dúvidas ou ações específicas.

---

### 4. Contato

- Seção simples onde o usuário pode enviar mensagens e arquivos, como PDFs ou imagens, para suporte ou contato direto.
- Um botão abaixo permite acessar as **Perguntas Frequentes (FAQ)**, que pode ser aberto para consultar respostas sobre dúvidas comuns dos usuários.

---

### 5. Configurações

- A área de configurações conta com 5 botões principais:
  1. **Comandos:** Lista os comandos especiais disponíveis para usar no chat e outras áreas do app.
  2. **Suporte e Ajuda:** Para o usuário buscar assistência ou tirar dúvidas.
  3. **Leitor de Tela** Leitor de tela de todas as páginas para auxiliar pessoas nescessitadas
  4. **Tema Claro/Escuro:** Alterna entre os temas visual claro e escuro, melhorando a experiência
  5. **Login/Logout:** Para autenticar o usuário no sistema.
visual conforme a preferência do usuário.


---

## APIs Integradas

- **API de Inteligência Artificial:**
  Responsável por gerar respostas no chat, oferecendo interação mais natural e eficiente.


---

## Tecnologias Utilizadas

- **React.js** — Framework JavaScript para construção da interface.
- **Bluetooth Web API** — Para busca e conexão automática via Bluetooth.
- **QR Code** — Para conexão rápida e prática de dispositivos.
- **CSS** — Para estilização, incluindo suporte a temas claro e escuro.
- **APIs REST** — Para comunicação com o backend de IA e dados.
- **React Hooks** — Para gerenciamento do estado da aplicação.

---

## Como Usar o Projeto

1. **Home:** Visualize gráficos dinâmicos e o clima em tempo real.
2. **Conexão:** Clique no botão para conectar dispositivos via Bluetooth ou manualmente.
3. **Chat:** Faça perguntas ou envie comandos para obter respostas interativas.
4. **Contato:** Envie arquivos e consulte perguntas frequentes para suporte.
5. **Configurações:** Faça login, visualize comandos, solicite ajuda ou alterne o tema da interface.

---

## Rodando o Projeto Localmente

### Pré-requisitos

- **Node.js** e **npm** instalados na máquina. Você pode baixar em: [https://nodejs.org/](https://nodejs.org/)
- Navegador moderno (Chrome, Firefox, Edge, etc.) com suporte para Web Bluetooth (se desejar testar essa funcionalidade).

### Passos para rodar

1. Clone este repositório:
   ```bash
   git clone <URL_DO_REPOSITORIO>
