# Parte 1 — Desenvolvimento Front-End

## 1.1 — Proposta de Aplicação

A aplicação é um sistema de gestão de estoque para uma marca de calças jeans que fabrica os próprios produtos. O problema resolvido é a falta de visibilidade conjunta entre o que já está em estoque e o que ainda está sendo produzido, o que dificulta o planejamento de vendas e reposições.

Os usuários principais são o **administrador**, que cadastra produtos e acompanha as produções, e o **colaborador**, que consulta a listagem do estoque para atender pedidos.

As duas entidades centrais são **Produto** (a calça em si, com seus atributos comerciais) e **Producao** (um lote em fabricação, vinculado a um Produto e em alguma etapa do processo produtivo).

## 1.2 — Modelagem dos Dados Mockados

### Entidade Produto

```js
const produto = {
  id: "string",           // UUID, identificador único do produto
  modelo: "string",       // nome do modelo da calça, ex: "Country"
  numeracao: 0,           // tamanho da peça, ex: 42
  genero: "string",       // público-alvo: "Masculino", "Feminino" ou "Unissex"
  precoEmCentavos: 0,     // preço em centavos para evitar imprecisão de float, ex: 18900 = R$ 189,00
  estoque: 0              // quantidade disponível para venda
};
```

Registros mockados:

```js
const produtos = [
  { id: "p1", modelo: "Country",   numeracao: 40, genero: "Masculino", precoEmCentavos: 18900, estoque: 12 },
  { id: "p2", modelo: "Skinny",    numeracao: 38, genero: "Feminino",  precoEmCentavos: 22500, estoque: 7  },
  { id: "p3", modelo: "Reta",      numeracao: 42, genero: "Masculino", precoEmCentavos: 17900, estoque: 0  },
  { id: "p4", modelo: "Boyfriend", numeracao: 36, genero: "Feminino",  precoEmCentavos: 21000, estoque: 4  },
  { id: "p5", modelo: "Cargo",     numeracao: 44, genero: "Unissex",   precoEmCentavos: 19900, estoque: 9  }
];
```

### Entidade Producao

```js
const producao = {
  id: "string",           // UUID, identificador único do lote em produção
  idProduto: "string",    // chave estrangeira: id do Produto sendo fabricado
  etapa: "string",        // etapa atual do lote: "Corte", "Costura", "Lavanderia", "Acabamento"
  quantidade: 0,          // número de peças no lote, ex: 100
  dataInicio: "string",   // data em que a produção começou, ex: "25/01/2026"
  previsao: "string"      // data prevista de finalização, ex: "25/02/2026"
};
```

Registros mockados:

```js
const producoes = [
  { id: "pr1", idProduto: "p1", etapa: "Corte",      quantidade: 100, dataInicio: "01/05/2026", previsao: "20/05/2026" },
  { id: "pr2", idProduto: "p2", etapa: "Costura",    quantidade: 80,  dataInicio: "28/04/2026", previsao: "15/05/2026" },
  { id: "pr3", idProduto: "p3", etapa: "Lavanderia", quantidade: 150, dataInicio: "20/04/2026", previsao: "12/05/2026" },
  { id: "pr4", idProduto: "p5", etapa: "Acabamento", quantidade: 60,  dataInicio: "15/04/2026", previsao: "08/05/2026" }
];
```

## 1.3 — Implementação da Interface em React

A interface foi implementada em um único arquivo `App.jsx` utilizando componentes funcionais React com hooks (useState) para gerenciamento de estado. A aplicação segue uma arquitetura simples com componentes reutilizáveis que recebem dados via props, sem acesso direto aos dados mockados.

### Componentes Criados

#### 1. **ProdutoCard** — Exibição de Produto Individual
- **Responsabilidade**: Renderizar um card de um produto com destaque visual em numeração e gênero.
- **Props**: `{ produto }`
- **Dados consumidos**: id (como SKU), modelo, numeracao, genero, precoEmCentavos, estoque.
- **Destaque visual**: A numeração aparece como um badge discreto no topo direito; o gênero é exibido em texto destacado abaixo do modelo. O estoque indica disponibilidade com cor verde (em estoque) ou vermelha (sem estoque).

#### 2. **ProducaoCard** — Exibição de Produção Individual
- **Responsabilidade**: Renderizar um card de um lote em produção com foco na etapa e rastreabilidade.
- **Props**: `{ producao, produto }`
- **Dados consumidos**: id (como "Rastreio"), idProduto, etapa, quantidade, dataInicio, previsao.
- **Destaque visual**: A etapa é exibida em um badge azul-índigo e chamativo no topo. O componente calcula automaticamente **quantos dias faltam** até a previsão e indica se está **em atraso** (com aviso visual em vermelho). O rastreio (ID do lote) fica visível para consulta.

#### 3. **FormularioProduto** — Formulário de Cadastro
- **Responsabilidade**: Permitir que o usuário cadastre um novo modelo de calça com feedback visual.
- **Estados locais**: `modelo` (texto), `genero` (select), `sucesso` (feedback).
- **Campos**: 
  - Campo de texto para "Modelo" (ex: Country)
  - Campo select para "Gênero" (Masculino, Feminino, Unissex)
  - Botão de submissão
- **Feedback**: Após o envio, exibe uma mensagem verde de sucesso por 3 segundos e limpa os campos. O formulário não persiste dados no backend, apenas exibe feedback conforme requisitado.

#### 4. **App** — Componente Principal
- **Responsabilidade**: Orquestrar a interface, gerenciar o estado global de filtro e renderizar as seções.
- **Estado com useState**: `filtroNumeracao` — permite filtrar produtos por tamanho ou visualizar todos.
- **Seções da tela**:
  - **Estoque**: Exibe lista de produtos em grid (1, 2 ou 3 colunas conforme tela). Inclui select de filtro por numeração, atendendo o requisito de interação com useState.
  - **Em produção**: Exibe grid de produções com todos os lotes em andamento.
  - **Novo cadastro**: Formulário para adicionar novos modelos.

### Estrutura de Dados e Props
- Todos os componentes recebem dados via props, não acessam arrays mockados diretamente.
- Dados mockados (`produtos` e `producoes`) ficam no topo do arquivo e alimentam a lógica do componente App.
- Relação produto-producão é estabelecida via `idProduto`, simplificando a ligação entre entidades.

### Justificativa da Escolha: Tailwind CSS via CDN

Tailwind foi escolhido porque eu já tinha o mínimo de experiencia, e por que foi facil de instalar.

## 1.4 — Como Rodar o Projeto

Para executar a aplicação localmente, siga estes passos:

1. Abra o terminal na pasta do projeto.
2. Entre na pasta do front-end:

```bash
cd frontend
```

3. Instale as dependências, caso ainda não tenha feito isso:

```bash
npm install
```

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

5. Abra o endereço exibido no terminal, geralmente `http://localhost:5173`.