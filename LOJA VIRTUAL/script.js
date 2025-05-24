// Variáveis globais
let produtos = [];
let vendas = 0;
let totalVendido = 0;
let vendasPorTipo = {};
let usuarioLogado = false;
let ofertas = [];
let ofertaAtual = 0;
let intervaloOfertas;

// Mostrar modal login
function mostrarLogin() {
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('login-erro').style.display = 'none';
  document.getElementById('login-user').value = '';
  document.getElementById('login-password').value = '';
}

// Verificar login
function verificarLogin() {
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-password').value;
  const erro = document.getElementById('login-erro');

  if (user === 'Lumynus Black' && pass === 'chave mestra') {
    document.getElementById('login-overlay').classList.add('hidden');
    const protegidos = document.querySelectorAll('.protegido');
    protegidos.forEach(el => el.classList.remove('hidden'));
    erro.style.display = 'none';
    usuarioLogado = true;
    atualizarIconeLoginLogout();
  } else {
    erro.style.display = 'block';
  }
}

// Atualiza ícone e tooltip de login/logout
function atualizarIconeLoginLogout() {
  const icone = document.getElementById('login-icon');
  if (usuarioLogado) {
    icone.title = 'Logout';
    icone.textContent = '👤';
  } else {
    icone.title = 'Login';
    icone.textContent = '👤';
  }
}

// Logout
function logout() {
  const confirmar = confirm("Deseja realmente sair do modo administrador?");
  if (!confirmar) return;

  usuarioLogado = false;

  // Ocultar conteúdos protegidos
  const protegidos = document.querySelectorAll('.protegido');
  protegidos.forEach(el => el.classList.add('hidden'));

  // Esconder dashboard se aberto
  document.getElementById('dashboard').classList.add('hidden');

  // Atualizar ícone
  atualizarIconeLoginLogout();
}

// Controla clique no ícone login/logout
function iconeLoginLogout() {
  if (usuarioLogado) {
    logout();
  } else {
    mostrarLogin();
  }
}

// Fechar modal login
function fecharLogin() {
  document.getElementById('login-overlay').classList.add('hidden');
}

// Adicionar produto
function adicionarProduto() {
  const nome = document.getElementById("nome").value;
  const preco = parseFloat(document.getElementById("preco").value);
  const tipo = document.getElementById("tipo").value;
  const imagemInput = document.getElementById("imagem");
  const estoque = parseInt(document.getElementById("estoque").value);

  if (!nome || isNaN(preco) || preco <= 0 || !imagemInput.files[0] || !tipo || isNaN(estoque) || estoque < 1) {
    alert("Preencha todos os campos corretamente.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const imagem = e.target.result;
    produtos.push({ nome, preco, imagem, tipo, estoque });
    renderizarProdutos();
    atualizarBannerOfertas();

    // Limpar formulário
    document.getElementById("nome").value = "";
    document.getElementById("preco").value = "";
    document.getElementById("imagem").value = "";
    document.getElementById("tipo").value = "";
    document.getElementById("estoque").value = "";
  };

  reader.readAsDataURL(imagemInput.files[0]);
}

// Renderizar produtos na tela
function renderizarProdutos() {
  const lista = document.getElementById("lista-produtos");
  lista.innerHTML = "";

  produtos.forEach((produto, index) => {
    const div = document.createElement("div");
    div.className = "produto";
    const estoqueTexto = produto.estoque > 0 ? `Estoque: ${produto.estoque}` : `<span style="color:red;">Esgotado</span>`;
    const botaoCompra = produto.estoque > 0
      ? `<button onclick="comprar(${index})">Comprar</button>`
      : `<button disabled>Esgotado</button>`;

    div.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2)}</p>
      <p><strong>Tipo:</strong> ${produto.tipo}</p>
      <p>${estoqueTexto}</p>
      ${botaoCompra}
    `;
    lista.appendChild(div);
  });
}

// Comprar produto
function comprar(index) {
  const produto = produtos[index];

  if (produto.estoque <= 0) {
    alert("Este produto está esgotado.");
    return;
  }

  produto.estoque--;
  vendas++;
  totalVendido += produto.preco;

  if (!vendasPorTipo[produto.tipo]) {
    vendasPorTipo[produto.tipo] = { quantidade: 0, valor: 0 };
  }

  vendasPorTipo[produto.tipo].quantidade++;
  vendasPorTipo[produto.tipo].valor += produto.preco;

  atualizarDashboard();
  renderizarProdutos();
  atualizarBannerOfertas();

  alert(`Você comprou: ${produto.nome} por R$ ${produto.preco.toFixed(2)}`);
}

// Atualizar painel de vendas
function atualizarDashboard() {
  document.getElementById('total-vendas').innerText = `R$ ${totalVendido.toFixed(2)}`;
  document.getElementById('itens-vendidos').innerText = vendas;

  const tipoContainer = document.getElementById('vendas-por-tipo');
  tipoContainer.innerHTML = '<h3>Vendas por Tipo:</h3>';

  for (const tipo in vendasPorTipo) {
    const { quantidade, valor } = vendasPorTipo[tipo];
    tipoContainer.innerHTML += `<p><strong>${tipo}</strong>: ${quantidade} itens – R$ ${valor.toFixed(2)}</p>`;
  }
}

// Mostrar/esconder dashboard
function toggleDashboard() {
  const dash = document.getElementById('dashboard');
  dash.classList.toggle('hidden');
}

// Filtrar produtos por categoria
function filtrarCategoria(categoria) {
  const lista = document.getElementById('lista-produtos');
  lista.innerHTML = "";

  const filtrados = categoria === "Todos"
    ? produtos
    : produtos.filter(produto => produto.tipo === categoria);

  filtrados.forEach((produto) => {
    const index = produtos.indexOf(produto);
    const div = document.createElement('div');
    div.className = 'produto';

    const estoqueTexto = produto.estoque > 0 ? `Estoque: ${produto.estoque}` : `<span style="color:red;">Esgotado</span>`;
    const botaoCompra = produto.estoque > 0
      ? `<button onclick="comprar(${index})">Comprar</button>`
      : `<button disabled>Esgotado</button>`;

    div.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}" />
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2)}</p>
      <p><strong>Tipo:</strong> ${produto.tipo}</p>
      <p>${estoqueTexto}</p>
      ${botaoCompra}
    `;
    lista.appendChild(div);
  });
}

// Atualizar banner de ofertas com os 3 produtos mais baratos disponíveis
function atualizarBannerOfertas() {
  const disponiveis = produtos.filter(p => p.estoque > 0);
  disponiveis.sort((a, b) => a.preco - b.preco);
  ofertas = disponiveis.slice(0, 3);
  ofertaAtual = 0;

  if (ofertas.length > 0) {
    exibirOferta();
    clearInterval(intervaloOfertas);
    intervaloOfertas = setInterval(() => {
      ofertaAtual = (ofertaAtual + 1) % ofertas.length;
      exibirOferta();
    }, 4000);
  } else {
    document.getElementById("oferta-produto").innerHTML = "<p>Nenhuma oferta disponível.</p>";
    clearInterval(intervaloOfertas);
  }
}

function exibirOferta() {
  const oferta = ofertas[ofertaAtual];
  document.getElementById("oferta-produto").innerHTML = `
    <img src="${oferta.imagem}" alt="${oferta.nome}">
    <h3>${oferta.nome}</h3>
    <p>R$ ${oferta.preco.toFixed(2)}</p>
  `;
}

// Inicializar funções ao carregar a página
window.onload = () => {
  atualizarBannerOfertas();
  atualizarIconeLoginLogout();
  renderizarProdutos();
};