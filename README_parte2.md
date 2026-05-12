# Parte 2 — Desenvolvimento Back-End

## 2.1 — Modelagem da API e Alinhamento com o Front-End

### Endpoints

| Método | Path | Descrição | Acesso |
|--------|------|-----------|--------|
| POST | `/login` | Recebe credenciais e retorna um JWT | Público |
| GET | `/produto` | Lista todos os produtos em estoque | Público |
| GET | `/produto/filtroPorNumeracao/{numeracao}` | Filtra produtos por numeração (tamanho) | Público |
| POST | `/produto` | Cadastra um novo produto | Protegido (admin) |
| GET | `/producao` | Lista todos os lotes em produção | Protegido (autenticado) |
| PATCH | `/producao/{id_producao}` | Atualiza a etapa de um lote | Protegido (autenticado) |

### Justificativa dos endpoints protegidos

**POST /produto** — Cadastrar um produto altera o catálogo da empresa. Apenas o administrador deve ter essa permissão; um colaborador consulta o estoque, mas não o modifica.

**PATCH /producao/{id_producao}** — Alterar a etapa de produção de um lote impacta o planejamento da fábrica. Exige autenticação para garantir rastreabilidade, mas qualquer usuário autenticado (admin ou colaborador) pode realizar a operação, pois o colaborador na linha de produção precisa atualizar o status.

### Alinhamento entre os modelos da API e os objetos JSON do front-end

**Produto** — Os campos do schema `ProdutoOut` coincidem integralmente com os do objeto mockado no front-end: `id`, `modelo`, `numeracao`, `genero`, `precoEmCentavos` e `estoque`. Nenhum campo foi omitido ou adicionado. O schema de entrada `ProdutoCriar` omite o campo `id`, que é gerado pelo servidor.

**Producao** — Os campos do schema `ProducaoOut` coincidem integralmente com os do objeto mockado no front-end: `id`, `idProduto`, `etapa`, `quantidade`, `dataInicio` e `previsao`. O schema de entrada `ProducaoAtualizar` contém apenas o campo `etapa`, pois o PATCH altera somente o estado atual do lote.

**Campos adicionados na API (sem equivalente no front-end):** `LoginRequest` (usuario, senha) e `TokenResponse` (access_token, token_type) existem exclusivamente para o fluxo de autenticação.

---

## 2.2 — Documentação dos Endpoints Implementados

Arquivo: `backend/main.py`

---

### POST /login

**Função:** `login`

Requisição:

```json
POST /login
Content-Type: application/json

{
  "usuario": "admin",
  "senha": "admin"
}
```

Resposta (200):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

Resposta (401):

```json
{
  "detail": "Credenciais inválidas"
}
```

---

### GET /produto

**Função:** `listar_produtos`

Requisição:

```
GET /produto
```

Resposta (200):

```json
[
  {
    "id": "p1",
    "modelo": "Country",
    "numeracao": 40,
    "genero": "Masculino",
    "precoEmCentavos": 18900,
    "estoque": 12
  },
  ...
]
```

---

### GET /produto/filtroPorNumeracao/{numeracao}

**Função:** `filtrar_produtos_por_numeracao`

Requisição:

```
GET /produto/filtroPorNumeracao/42
```

Resposta (200):

```json
[
  {
    "id": "p3",
    "modelo": "Reta",
    "numeracao": 42,
    "genero": "Masculino",
    "precoEmCentavos": 17900,
    "estoque": 0
  }
]
```

---

### POST /produto

**Função:** `criar_produto`

Requisição (requer token de admin no header):

```json
POST /produto
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "modelo": "Flare",
  "numeracao": 40,
  "genero": "Feminino",
  "precoEmCentavos": 23900,
  "estoque": 5
}
```

Resposta (201):

```json
{
  "id": "a3f1b2c4",
  "modelo": "Flare",
  "numeracao": 40,
  "genero": "Feminino",
  "precoEmCentavos": 23900,
  "estoque": 5
}
```

Resposta (403, se não for admin):

```json
{
  "detail": "Acesso restrito ao administrador"
}
```

---

### GET /producao

**Função:** `listar_producoes`

Requisição (requer token de qualquer usuário autenticado):

```
GET /producao
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Resposta (200):

```json
[
  {
    "id": "pr1",
    "idProduto": "p1",
    "etapa": "Corte",
    "quantidade": 100,
    "dataInicio": "01/05/2026",
    "previsao": "20/05/2026"
  },
  ...
]
```

---

### PATCH /producao/{id_producao}

**Função:** `atualizar_etapa`

Requisição (requer token de qualquer usuário autenticado):

```json
PATCH /producao/pr1
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "etapa": "Costura"
}
```

Resposta (200):

```json
{
  "id": "pr1",
  "idProduto": "p1",
  "etapa": "Costura",
  "quantidade": 100,
  "dataInicio": "01/05/2026",
  "previsao": "20/05/2026"
}
```

Resposta (404):

```json
{
  "detail": "Produção não encontrada"
}
```



# Conclusão

Todos os endpoints foram feitos com ajuda do Claude. Testei tudo, estão funcionando perfeitamente, para as requisições com token, em um parte em /docs que deixa adicionar.

Os comando pra rodar são:
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

O Claude é bom de mais, então foi bem suave de fazer, eng de prompt tá em dia, e a parte 1 já tava no contexto.

