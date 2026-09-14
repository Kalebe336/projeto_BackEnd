- Coffe House

Eu mudei algumas coisas do html e css, como:

-HTML-
- Mudei onome e todas as partes que teriam esse nome.
- Eu coloquei a imagem da logo.

-CSS-
- Troquei as cores de fundo e dos textos.
--dark: #4b2c25;
--white: #ffffff;
--text: #2b1008;
--active: #6f493d;
--bg: #f3e7d8;
--card: #fff8dc;
--border: #b89b85;
--danger: #a94442;

- Dei um espaçamento maior entre os botoes na barra de cima.
- Deixei a moldura da logo mais redonda.

-Linguagens utilizadas-
- Html
- Css
- Js
- Json
- db (Banco de Dados em sql)

-Estrutura de pastas (Coffe House)-

├── 📁 data/
│   ├── atividades.csv      # Dados brutos de atividades
│   └── usuarios.csv        # Dados brutos de usuários
├── 📁 public/
│   ├── 📁 img/
│   │   └── fc876b62777505.5a9b740221756.png  # Imagem do frontend
│   ├── app.js             # Lógica e interatividade do frontend (JavaScript)
│   ├── index.html         # Estrutura da página HTML (Interface)
│   └── styles.css         # Estilização visual (CSS)
├── db.js                  # Conexão e configuração do banco de dados (PostgreSQL)
├── package-lock.json      # Mapeamento exato da árvore de dependências
├── package.json           # Configurações do Node.js, dependências e scripts
├── README.md              # Documentação e instruções do projeto
└── server.js              # Servidor backend principal (API Express)