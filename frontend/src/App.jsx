import { useState } from 'react';

// ============================================================
// DADOS MOCKADOS
// ============================================================

const produtos = [
  { id: "p1", modelo: "Country",   numeracao: 40, genero: "Masculino", precoEmCentavos: 18900, estoque: 12 },
  { id: "p2", modelo: "Skinny",    numeracao: 38, genero: "Feminino",  precoEmCentavos: 22500, estoque: 7  },
  { id: "p3", modelo: "Reta",      numeracao: 42, genero: "Masculino", precoEmCentavos: 17900, estoque: 0  },
  { id: "p4", modelo: "Boyfriend", numeracao: 36, genero: "Feminino",  precoEmCentavos: 21000, estoque: 4  },
  { id: "p5", modelo: "Cargo",     numeracao: 44, genero: "Unissex",   precoEmCentavos: 19900, estoque: 9  }
];

const producoes = [
  { id: "pr1", idProduto: "p1", etapa: "Corte",      quantidade: 100, dataInicio: "01/05/2026", previsao: "20/05/2026" },
  { id: "pr2", idProduto: "p2", etapa: "Costura",    quantidade: 80,  dataInicio: "28/04/2026", previsao: "15/05/2026" },
  { id: "pr3", idProduto: "p3", etapa: "Lavanderia", quantidade: 150, dataInicio: "20/04/2026", previsao: "12/05/2026" },
  { id: "pr4", idProduto: "p5", etapa: "Acabamento", quantidade: 60,  dataInicio: "15/04/2026", previsao: "08/05/2026" }
];

// Util: formata centavos como "R$ 189,00"
function formatarPreco(centavos) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Util: calcula dias faltando até a previsão
// Retorna { dias, emAtraso } considerando a data atual como 11/05/2026
function calcularDias(dataPrevisaoStr) {
  // dataPrevisaoStr no format "DD/MM/YYYY"
  const [dia, mes, ano] = dataPrevisaoStr.split('/').map(Number);
  const dataPrevisao = new Date(ano, mes - 1, dia, 23, 59, 59);
  
  // Data atual (hardcoded conforme o contato: 11/05/2026)
  const dataAtual = new Date(2026, 4, 11, 0, 0, 0);
  
  const diferencaMs = dataPrevisao - dataAtual;
  const dias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
  
  return { dias, emAtraso: dias < 0 };
}

// ============================================================
// COMPONENTE: ProdutoCard
// Recebe um produto via props e exibe seus dados.
// ============================================================

function ProdutoCard({ produto }) {
  const semEstoque = produto.estoque === 0;
  return (
    <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-amber-900">{produto.modelo}</h3>
        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">nº {produto.numeracao}</span>
      </div>
      <p className="text-sm text-stone-600 mb-1">{produto.genero}</p>
      <p className="text-xl font-semibold text-stone-800 mb-2">{formatarPreco(produto.precoEmCentavos)}</p>
      <p className={`text-sm font-medium ${semEstoque ? 'text-red-600' : 'text-emerald-700'}`}>
        {semEstoque ? 'Sem estoque' : `${produto.estoque} em estoque`}
      </p>
    </div>
  );
}

// ============================================================
// COMPONENTE: ProducaoCard
// Recebe uma produção e o produto relacionado, ambos via props.
// Exibe etapa em destaque, quantidade e status de atraso.
// ============================================================

function ProducaoCard({ producao, produto }) {
  const { dias, emAtraso } = calcularDias(producao.previsao);
  
  return (
    <div className={`border rounded-lg p-4 shadow-sm transition ${
      emAtraso 
        ? 'bg-red-50 border-red-300' 
        : dias <= 5 
        ? 'bg-yellow-50 border-yellow-300' 
        : 'bg-white border-stone-200'
    }`}>
      {/* Cabeçalho: modelo/número + Etapa em destaque */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-stone-800 text-base">
            {produto ? produto.modelo : 'Produto removido'}
            {produto && <span className="text-stone-500 font-normal text-sm"> · nº {produto.numeracao}</span>}
          </h4>
          <p className="text-xs text-stone-500 mt-1">Rastreio: <strong>{producao.id}</strong></p>
        </div>
        {/* Etapa em badge chamativo */}
        <span className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full font-semibold whitespace-nowrap ml-2">
          {producao.etapa}
        </span>
      </div>

      {/* Quantidade */}
      <p className="text-sm text-stone-600 mb-2">Lote: <strong>{producao.quantidade}</strong> peças</p>

      {/* Datas e status de atraso */}
      <div className="flex justify-between text-xs text-stone-600 mb-3">
        <span>Início: {producao.dataInicio}</span>
        <span>Previsão: {producao.previsao}</span>
      </div>

      {/* Status visual: dias faltando ou em atraso */}
      <div className={`text-sm font-semibold px-3 py-2 rounded ${
        emAtraso
          ? 'bg-red-200 text-red-900'
          : dias <= 5
          ? 'bg-yellow-200 text-yellow-900'
          : 'bg-emerald-200 text-emerald-900'
      }`}>
        {emAtraso 
          ? `⚠️ Em atraso há ${Math.abs(dias)} dia(s)` 
          : `${dias <= 0 ? 'Entrega hoje!' : `${dias} dia(s) restante${dias === 1 ? '' : 's'}`}`
        }
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE: FormularioProduto
// Formulário de cadastro de novo modelo. Não persiste de fato,
// apenas exibe feedback visual após o envio.
// ============================================================

function FormularioProduto({ onSubmit }) {
  const [modelo, setModelo] = useState('');
  const [genero, setGenero] = useState('Masculino');
  const [sucesso, setSucesso] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!modelo.trim()) return;
    onSubmit({ modelo, genero });
    setModelo('');
    setGenero('Masculino');
    setSucesso(true);
    setTimeout(() => setSucesso(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-amber-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-bold text-amber-900 mb-4">Cadastrar novo modelo</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium text-stone-700 mb-1">Modelo</label>
        <input
          type="text"
          value={modelo}
          onChange={(e) => setModelo(e.target.value)}
          placeholder="Ex: Country"
          className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-stone-700 mb-1">Gênero</label>
        <select
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          className="w-full px-3 py-2 border border-stone-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option>Masculino</option>
          <option>Feminino</option>
          <option>Unissex</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 rounded transition"
      >
        Cadastrar
      </button>

      {sucesso && (
        <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
          ✓ Modelo cadastrado com sucesso!
        </p>
      )}
    </form>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL: App
// ============================================================

function App() {
  // useState para filtro por numeração
  const [filtroNumeracao, setFiltroNumeracao] = useState('todas');

  // Numerações distintas, em ordem, para popular o select de filtro
  const numeracoesDisponiveis = [...new Set(produtos.map(p => p.numeracao))].sort((a, b) => a - b);

  const produtosFiltrados = filtroNumeracao === 'todas'
    ? produtos
    : produtos.filter(p => p.numeracao === Number(filtroNumeracao));

  function handleCadastro(novoProduto) {
    // O enunciado permite não persistir; o feedback fica no próprio formulário.
    console.log('Novo cadastro:', novoProduto);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-amber-900 text-amber-50 py-6 px-8 shadow-md">
        <h1 className="text-3xl font-bold tracking-wide">Laço e Couro</h1>
        <p className="text-sm text-amber-200 mt-1">Gestão de estoque e produção</p>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-10">

        {/* ESTOQUE — listagem de produtos */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="text-2xl font-semibold text-stone-800">Estoque</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-stone-600">Filtrar por numeração:</label>
              <select
                value={filtroNumeracao}
                onChange={(e) => setFiltroNumeracao(e.target.value)}
                className="px-3 py-1 border border-stone-300 rounded text-sm"
              >
                <option value="todas">Todas</option>
                {numeracoesDisponiveis.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {produtosFiltrados.length === 0 ? (
            <p className="text-stone-500">Nenhum produto encontrado para essa numeração.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtosFiltrados.map(p => <ProdutoCard key={p.id} produto={p} />)}
            </div>
          )}
        </section>

        {/* PRODUÇÃO — listagem de lotes em produção */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-4">Em produção</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {producoes.map(prod => {
              const produto = produtos.find(p => p.id === prod.idProduto);
              return <ProducaoCard key={prod.id} producao={prod} produto={produto} />;
            })}
          </div>
        </section>

        {/* FORMULÁRIO — cadastro de novo modelo */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-800 mb-4">Novo cadastro</h2>
          <div className="max-w-md">
            <FormularioProduto onSubmit={handleCadastro} />
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;