from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import jwt

# ============================================================
# CONFIGURAÇÃO
# ============================================================

app = FastAPI(title="Laço e Couro — API")

SECRET_KEY = "segredo-inseguro-academico"
ALGORITHM = "HS256"
TOKEN_EXPIRA_MINUTOS = 60

security = HTTPBearer()

# ============================================================
# USUÁRIOS (hardcoded)
# ============================================================

USUARIOS = {
    "admin": {"senha": "admin", "role": "admin"},
    "colaborador": {"senha": "senha", "role": "colaborador"},
}

# ============================================================
# DADOS EM MEMÓRIA (mesmos mocks do front-end)
# ============================================================

produtos = [
    {"id": "p1", "modelo": "Country",   "numeracao": 40, "genero": "Masculino", "precoEmCentavos": 18900, "estoque": 12},
    {"id": "p2", "modelo": "Skinny",    "numeracao": 38, "genero": "Feminino",  "precoEmCentavos": 22500, "estoque": 7},
    {"id": "p3", "modelo": "Reta",      "numeracao": 42, "genero": "Masculino", "precoEmCentavos": 17900, "estoque": 0},
    {"id": "p4", "modelo": "Boyfriend", "numeracao": 36, "genero": "Feminino",  "precoEmCentavos": 21000, "estoque": 4},
    {"id": "p5", "modelo": "Cargo",     "numeracao": 44, "genero": "Unissex",   "precoEmCentavos": 19900, "estoque": 9},
]

producoes = [
    {"id": "pr1", "idProduto": "p1", "etapa": "Corte",      "quantidade": 100, "dataInicio": "01/05/2026", "previsao": "20/05/2026"},
    {"id": "pr2", "idProduto": "p2", "etapa": "Costura",    "quantidade": 80,  "dataInicio": "28/04/2026", "previsao": "15/05/2026"},
    {"id": "pr3", "idProduto": "p3", "etapa": "Lavanderia", "quantidade": 150, "dataInicio": "20/04/2026", "previsao": "12/05/2026"},
    {"id": "pr4", "idProduto": "p5", "etapa": "Acabamento", "quantidade": 60,  "dataInicio": "15/04/2026", "previsao": "08/05/2026"},
]

# ============================================================
# SCHEMAS PYDANTIC
# ============================================================

class LoginRequest(BaseModel):
    usuario: str
    senha: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ProdutoOut(BaseModel):
    id: str
    modelo: str
    numeracao: int
    genero: str
    precoEmCentavos: int
    estoque: int

class ProdutoCriar(BaseModel):
    modelo: str
    numeracao: int
    genero: str
    precoEmCentavos: int
    estoque: int

class ProducaoOut(BaseModel):
    id: str
    idProduto: str
    etapa: str
    quantidade: int
    dataInicio: str
    previsao: str

class ProducaoAtualizar(BaseModel):
    etapa: str

# ============================================================
# FUNÇÕES DE AUTENTICAÇÃO
# ============================================================

def criar_token(usuario: str, role: str) -> str:
    payload = {
        "sub": usuario,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRA_MINUTOS),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verificar_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")


def verificar_admin(payload: dict = Depends(verificar_token)) -> dict:
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acesso restrito ao administrador")
    return payload

# ============================================================
# ENDPOINTS
# ============================================================

# ---------- Login ----------

@app.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    """Recebe usuário e senha, retorna um JWT."""
    user = USUARIOS.get(body.usuario)
    if not user or user["senha"] != body.senha:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = criar_token(body.usuario, user["role"])
    return TokenResponse(access_token=token)


# ---------- Produto ----------

@app.get("/produto", response_model=list[ProdutoOut])
def listar_produtos():
    """Lista todos os produtos em estoque. Endpoint público."""
    return produtos


@app.get("/produto/filtroPorNumeracao/{numeracao}", response_model=list[ProdutoOut])
def filtrar_produtos_por_numeracao(numeracao: int):
    """Filtra produtos pela numeração informada. Endpoint público."""
    return [p for p in produtos if p["numeracao"] == numeracao]


@app.post("/produto", response_model=ProdutoOut, status_code=201)
def criar_produto(body: ProdutoCriar, _: dict = Depends(verificar_admin)):
    """Cadastra um novo produto. Somente admin."""
    novo = {"id": str(uuid4())[:8], **body.model_dump()}
    produtos.append(novo)
    return novo


# ---------- Producao ----------

@app.get("/producao", response_model=list[ProducaoOut], dependencies=[Depends(verificar_token)])
def listar_producoes():
    """Lista todos os lotes em produção. Requer autenticação."""
    return producoes


@app.patch("/producao/{id_producao}", response_model=ProducaoOut)
def atualizar_etapa(id_producao: str, body: ProducaoAtualizar, _: dict = Depends(verificar_token)):
    """Atualiza a etapa de um lote. Requer autenticação (qualquer role)."""
    for prod in producoes:
        if prod["id"] == id_producao:
            prod["etapa"] = body.etapa
            return prod
    raise HTTPException(status_code=404, detail="Produção não encontrada")