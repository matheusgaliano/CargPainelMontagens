import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  query,
  deleteDoc,
  getDoc,
  where,
  getDocs,
  enableIndexedDbPersistence, // CORRIGIDO: Nome correto da função
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC6M_bmN2phEXnGc6Y1tpPcjb75cWAqSto",
  authDomain: "cargpainelmontagens.firebaseapp.com",
  projectId: "cargpainelmontagens",
  storageBucket: "cargpainelmontagens.firebasestorage.app",
  messagingSenderId: "1062203521818",
  appId: "1:106220L818:web:edcbb37a92d2e448674aa3",
};

let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);

  // SOLUÇÃO OFFLINE: Ativa a persistência
  enableIndexedDbPersistence(db)
    .then(() => {
      console.log("Persistência Offline habilitada com sucesso.");
    })
    .catch((err) => {
      console.warn(
        "A persistência offline não pôde ser ativada ou não é suportada.",
        err
      );
    });
} catch (error) {
  console.error("ERRO GRAVE: Não foi possível inicializar Firebase.", error);
}

let currentUserNome = null;
let currentUserFuncao = null;
let acaoConfirmadaCallback = null;

const quadroPrincipal = document.getElementById("quadro-principal");
const colunaAguardando = document.getElementById("coluna-aguardando");
const colunaProcesso = document.getElementById("coluna-processo");
const colunaPronta = document.getElementById("coluna-pronta");
const formCarreta = document.getElementById("form-adicionar");
const modalCarreta = document.getElementById("modal-adicionar");
const btnAbrirModalCarreta = document.getElementById("btn-abrir-modal");
const btnCancelarModalCarreta = document.getElementById("btn-cancelar-modal");
const modalLogin = document.getElementById("modal-login");
const formLogin = document.getElementById("form-login");
const inputNome = document.getElementById("input-nome");
const displayUsuario = document.getElementById("display-usuario");
const modalEditar = document.getElementById("modal-editar");
const formEditar = document.getElementById("form-editar");
const btnCancelarModalEditar = document.getElementById(
  "btn-cancelar-modal-editar"
);
const inputIdEditar = document.getElementById("input-id-editar");
const inputPlacaEditar = document.getElementById("input-placa-editar");
const inputDestinoEditar = document.getElementById("input-destino-editar");
const inputProdutosEditar = document.getElementById("input-produtos-editar");
const modalConfirmacao = document.getElementById("modal-confirmacao");
const btnCancelarConfirmacao = document.getElementById(
  "btn-cancelar-confirmacao"
);
const btnConfirmarConfirmacao = document.getElementById(
  "btn-confirmar-confirmacao"
);
const confirmacaoTexto = document.getElementById("confirmacao-texto");
const btnArquivar = document.getElementById("btn-arquivar");
const btnSair = document.getElementById("btn-sair");

btnAbrirModalCarreta.onclick = () => modalCarreta.classList.remove("hidden");
btnCancelarModalCarreta.onclick = () => {
  modalCarreta.classList.add("hidden");
  formCarreta.reset();
};
btnCancelarModalEditar.onclick = () => {
  modalEditar.classList.add("hidden");
  formEditar.reset();
};
btnCancelarConfirmacao.onclick = () => {
  modalConfirmacao.classList.add("hidden");
  acaoConfirmadaCallback = null;
};
btnConfirmarConfirmacao.onclick = () => {
  if (acaoConfirmadaCallback) acaoConfirmadaCallback();
  modalConfirmacao.classList.add("hidden");
  acaoConfirmadaCallback = null;
};
window.onclick = function (event) {
  if (event.target === modalCarreta) modalCarreta.classList.add("hidden");
  if (event.target === modalEditar) modalEditar.classList.add("hidden");
  if (event.target === modalConfirmacao)
    modalConfirmacao.classList.add("hidden");
};

btnSair.onclick = () => {
  localStorage.removeItem("cargPainelUserNome");
  localStorage.removeItem("cargPainelUserFuncao");
  location.reload();
};

function aplicarPermissoes(funcao) {
  if (funcao === "operacional") {
    btnAbrirModalCarreta.classList.remove("hidden");
    btnArquivar.classList.remove("hidden");
  } else if (funcao === "conferente") {
    btnAbrirModalCarreta.classList.add("hidden");
    btnArquivar.classList.add("hidden");
  }
}

function checkUserLogin() {
  const nomeSalvo = localStorage.getItem("cargPainelUserNome");
  const funcaoSalva = localStorage.getItem("cargPainelUserFuncao");
  if (nomeSalvo && funcaoSalva) {
    currentUserNome = nomeSalvo;
    currentUserFuncao = funcaoSalva;
    displayUsuario.textContent = `Logado como: ${currentUserNome} (${currentUserFuncao})`;
    btnSair.classList.remove("hidden");
    modalLogin.classList.add("hidden");
    aplicarPermissoes(currentUserFuncao);
    iniciarMonitoramento();
  } else {
    modalLogin.classList.remove("hidden");
  }
}

formLogin.onsubmit = function (event) {
  event.preventDefault();
  const nome = inputNome.value.trim();
  const funcao = document.querySelector('input[name="funcao"]:checked');
  if (nome && funcao) {
    currentUserNome = nome;
    currentUserFuncao = funcao.value;
    localStorage.setItem("cargPainelUserNome", currentUserNome);
    localStorage.setItem("cargPainelUserFuncao", currentUserFuncao);
    displayUsuario.textContent = `Logado como: ${currentUserNome} (${currentUserFuncao})`;
    btnSair.classList.remove("hidden");
    modalLogin.classList.add("hidden");
    aplicarPermissoes(currentUserFuncao);
    iniciarMonitoramento();
  } else {
    alert("Por favor, preencha seu nome e selecione sua função.");
  }
};

function exibirStatus(mensagem, tipo) {
  const statusDiv = document.getElementById("mensagem-status");
  statusDiv.textContent = mensagem;
  statusDiv.classList.remove("hidden", "bg-red-500", "bg-green-500");
  statusDiv.classList.add(tipo === "sucesso" ? "bg-green-500" : "bg-red-500");
  setTimeout(() => statusDiv.classList.add("hidden"), 3000);
}

function abrirModalConfirmacao(mensagem, callback) {
  confirmacaoTexto.textContent = mensagem;
  acaoConfirmadaCallback = callback;
  modalConfirmacao.classList.remove("hidden");
  btnConfirmarConfirmacao.textContent = "Confirmar";
  btnConfirmarConfirmacao.classList.remove("bg-red-600", "hover:bg-red-700");
  btnConfirmarConfirmacao.classList.add("bg-blue-600", "hover:bg-blue-700");
}

function abrirModalExclusao(mensagem, callback) {
  confirmacaoTexto.textContent = mensagem;
  acaoConfirmadaCallback = callback;
  modalConfirmacao.classList.remove("hidden");
  btnConfirmarConfirmacao.textContent = "Excluir";
  btnConfirmarConfirmacao.classList.remove("bg-blue-600", "hover:bg-blue-700");
  btnConfirmarConfirmacao.classList.add("bg-red-600", "hover:bg-red-700");
}

function criarCardHTML(carreta) {
  let corCard = "bg-gray-50 border-gray-300";
  if (carreta.status === "em_processo")
    corCard = "bg-yellow-100 border-yellow-400";
  if (carreta.status === "pronta") corCard = "bg-green-100 border-green-400";

  let botoesAcao = "";
  let botoesAdmin = "";

  if (currentUserFuncao === "conferente") {
    if (carreta.status === "aguardando") {
      botoesAcao = `<button data-id="${carreta.id}" data-acao="assumir" class="btn-acao w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Assumir Montagem</button>`;
    } else if (carreta.status === "em_processo") {
      if (carreta.conferente === currentUserNome) {
        botoesAcao = `
                <div class="space-y-2">
                    <button data-id="${carreta.id}" data-acao="finalizar" class="btn-acao w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">Finalizar Carreta</button>
                    <button data-id="${carreta.id}" data-acao="devolver-aguardando" class="btn-acao w-full bg-gray-400 hover:bg-gray-500 text-gray-800 font-bold py-1 px-3 rounded-lg transition duration-300 text-sm">
                        Devolver p/ Aguardando
                    </button>
                </div>`;
      } else {
        botoesAcao = `<p class="text-center text-sm font-medium text-yellow-800 mt-2 p-2 bg-yellow-200 rounded-lg">EM MONTAGEM POR: ${carreta.conferente}</p>`;
      }
    } else if (carreta.status === "pronta") {
      botoesAcao = `<p class="text-center text-sm font-semibold text-green-700 mt-2 p-2 bg-green-200 rounded-lg">MONTAGEM CONCLUÍDA</p>`;
      if (carreta.conferente === currentUserNome) {
        botoesAcao += `
                <button data-id="${carreta.id}" data-acao="devolver-processo" class="btn-acao w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-1 px-3 rounded-lg transition duration-300 text-sm mt-2">
                    Devolver p/ Em Processo
                </button>
            `;
      }
    }
  }

  if (currentUserFuncao === "operacional" && carreta.status === "pronta") {
    botoesAcao = `<p class="text-center text-sm font-semibold text-green-700 mt-2 p-2 bg-green-200 rounded-lg">MONTAGEM CONCLUÍDA</p>`;
  }

  if (currentUserFuncao === "operacional") {
    if (carreta.status === "em_processo") {
      botoesAcao = `
            <p class="text-center text-sm font-medium text-yellow-800 mt-2 p-2 bg-yellow-200 rounded-lg">EM MONTAGEM POR: ${carreta.conferente}</p>
            <button data-id="${carreta.id}" data-acao="forcar-devolucao" class="btn-admin w-full text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition duration-200 mt-2">
                FORÇAR DEVOLUÇÃO (Operacional)
            </button>
          `;
    }

    botoesAdmin = `
        <div class="flex space-x-2 mt-3 border-t pt-3">
            <button data-id="${carreta.id}" data-acao="editar" class="btn-admin flex-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-1 px-3 rounded-lg transition duration-200">
                Editar
            </button>
            <button data-id="${carreta.id}" data-acao="excluir" class="btn-admin flex-1 text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg transition duration-200">
                Excluir
            </button>
        </div>
      `;
  }

  return `
    <div id="card-${
      carreta.id
    }" class="card relative ${corCard} border rounded-lg shadow-sm p-4 space-y-3">
        <div class="flex justify-between items-center">
            <span class="font-bold text-lg text-gray-800">${
              carreta.placa
            }</span>
            <span class="text-sm font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">${
              carreta.destino
            }</span>
        </div>
        
        <div>
            <label class="text-xs font-semibold text-gray-500">PRODUTOS:</label>
            <p class="text-sm text-gray-700 p-2 bg-white rounded border border-gray-200 h-24 overflow-y-auto whitespace-pre-wrap">${
              carreta.produtos
            }</p>
        </div>
        <div>
            <label class="text-xs font-semibold text-gray-500">CONFERENTE:</label>
            <p class="text-sm font-medium text-gray-600">${
              carreta.conferente || "-- Ninguém --"
            }</p>
        </div>
         <div>
            <label class="text-xs font-semibold text-gray-500">CRIADO POR:</label>
            <p class="text-sm font-medium text-gray-500">${
              carreta.criadoPor || "--"
            }</p>
        </div>
        ${botoesAcao} 
        ${botoesAdmin}
    </div>
  `;
}

function renderizarCarretas(carretas) {
  colunaAguardando.innerHTML = "";
  colunaProcesso.innerHTML = "";
  colunaPronta.innerHTML = "";
  carretas.sort((a, b) => a.criadoEm - b.criadoEm);
  carretas.forEach((carreta) => {
    const cardHTML = criarCardHTML(carreta);
    if (carreta.status === "aguardando") colunaAguardando.innerHTML += cardHTML;
    else if (carreta.status === "em_processo")
      colunaProcesso.innerHTML += cardHTML;
    else if (carreta.status === "pronta") colunaPronta.innerHTML += cardHTML;
  });
}

function iniciarMonitoramento() {
  if (!db) return;
  const carretasCollectionRef = collection(db, "carretas");
  const q = query(carretasCollectionRef, where("status", "!=", "arquivada"));
  onSnapshot(
    q,
    (snapshot) => {
      const carretas = [];
      snapshot.forEach((doc) => carretas.push({ id: doc.id, ...doc.data() }));
      renderizarCarretas(carretas);
    },
    (error) => {
      console.error("Erro no listener (onSnapshot):", error);
      exibirStatus("Erro ao carregar dados.", "erro");
    }
  );
}

formCarreta.onsubmit = async function (event) {
  event.preventDefault();
  if (!db || !currentUserNome) return;
  const novaCarreta = {
    placa: document.getElementById("placa").value.toUpperCase(),
    destino: document.getElementById("destino").value,
    produtos: document.getElementById("produtos").value,
    status: "aguardando",
    conferente: "",
    criadoPor: currentUserNome,
    criadoEm: new Date().getTime(),
  };
  try {
    await addDoc(collection(db, "carretas"), novaCarreta);
    exibirStatus(`Carreta ${novaCarreta.placa} adicionada!`, "sucesso");
    modalCarreta.classList.add("hidden");
    formCarreta.reset();
  } catch (e) {
    console.error("Erro ao adicionar documento: ", e);
    exibirStatus("Erro ao adicionar carreta.", "erro");
  }
};

formEditar.onsubmit = async function (event) {
  event.preventDefault();
  if (!db) return;
  const id = inputIdEditar.value;
  const dadosAtualizados = {
    placa: inputPlacaEditar.value.toUpperCase(),
    destino: inputDestinoEditar.value,
    produtos: inputProdutosEditar.value,
  };
  try {
    const carretaRef = doc(db, "carretas", id);
    await updateDoc(carretaRef, dadosAtualizados);
    exibirStatus("Carreta atualizada com sucesso!", "successo");
    modalEditar.classList.add("hidden");
  } catch (e) {
    console.error("Erro ao atualizar carreta: ", e);
    exibirStatus("Erro ao atualizar carreta.", "erro");
  }
};

async function abrirModalEditar(id) {
  if (!db) return;
  try {
    const carretaRef = doc(db, "carretas", id);
    const docSnap = await getDoc(carretaRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      inputIdEditar.value = id;
      inputPlacaEditar.value = data.placa;
      inputDestinoEditar.value = data.destino;
      inputProdutosEditar.value = data.produtos;
      modalEditar.classList.remove("hidden");
    } else {
      exibirStatus("Erro: Documento não encontrado.", "erro");
    }
  } catch (e) {
    console.error("Erro ao buscar documento para editar:", e);
    exibirStatus("Erro ao carregar dados para edição.", "erro");
  }
}

async function excluirCarreta(id) {
  if (!db) return;
  try {
    await deleteDoc(doc(db, "carretas", id));
    exibirStatus("Carreta excluída com sucesso.", "sucesso");
  } catch (e) {
    console.error("Erro ao excluir carreta:", e);
    exibirStatus("Erro ao excluir carreta.", "erro");
  }
}

async function devolverCarretaParaAguardando(id) {
  if (!db) return;
  try {
    const carretaRef = doc(db, "carretas", id);
    await updateDoc(carretaRef, {
      status: "aguardando",
      conferente: "",
    });
    exibirStatus(`Carreta devolvida para Aguardando (Coluna 1).`, "successo");
  } catch (e) {
    console.error("Erro ao forçar devolução: ", e);
    exibirStatus("Erro ao forçar devolução.", "erro");
  }
}

async function moverCarreta(id, acao) {
  if (!db || !currentUserNome) return;
  let novoStatus = "";
  let conferenteAtual = currentUserNome;

  if (acao === "assumir") {
    novoStatus = "em_processo";
  } else if (acao === "finalizar") {
    novoStatus = "pronta";
  } else if (acao === "devolver-aguardando") {
    novoStatus = "aguardando";
    conferenteAtual = "";
  } else if (acao === "devolver-processo") {
    novoStatus = "em_processo";
  } else if (acao === "forcar-devolucao") {
    await devolverCarretaParaAguardando(id);
    return;
  } else {
    return;
  }

  try {
    const carretaRef = doc(db, "carretas", id);
    await updateDoc(carretaRef, {
      status: novoStatus,
      conferente: conferenteAtual,
    });
    exibirStatus(`Status da carreta atualizado!`, "successo");
  } catch (e) {
    console.error("Erro ao mover carreta: ", e);
    exibirStatus("Erro ao atualizar status.", "erro");
  }
}

async function arquivarCarretasProntas() {
  if (!db) return;
  exibirStatus("Buscando carretas para arquivar...", "successo");
  try {
    const q = query(
      collection(db, "carretas"),
      where("status", "==", "pronta")
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      exibirStatus("Nenhuma carreta pronta para arquivar.", "successo");
      return;
    }
    const promessas = [];
    querySnapshot.forEach((documento) => {
      promessas.push(updateDoc(documento.ref, { status: "arquivada" }));
    });
    await Promise.all(promessas);
    exibirStatus(
      `${querySnapshot.size} carretas foram arquivadas com sucesso!`,
      "successo"
    );
  } catch (e) {
    console.error("Erro ao arquivar carretas:", e);
    exibirStatus("Erro ao arquivar carretas.", "erro");
  }
}

btnArquivar.onclick = () => {
  abrirModalConfirmacao(
    "Tem certeza que deseja arquivar todas as carretas na coluna 'Pronta'? Elas desaparecerão do painel.",
    () => {
      arquivarCarretasProntas();
    }
  );
};

quadroPrincipal.addEventListener("click", (e) => {
  const botao = e.target.closest("button[data-acao]");
  if (!botao) return;

  const id = botao.dataset.id;
  const acao = botao.dataset.acao;

  if (
    acao === "assumir" ||
    acao === "finalizar" ||
    acao === "devolver-aguardando" ||
    acao === "devolver-processo" ||
    acao === "forcar-devolucao"
  ) {
    moverCarreta(id, acao);
  } else if (acao === "editar") {
    abrirModalEditar(id);
  } else if (acao === "excluir") {
    abrirModalExclusao(
      `Tem certeza que deseja excluir esta carreta? Esta ação não pode ser desfeita.`,
      () => {
        excluirCarreta(id);
      }
    );
  }
});

checkUserLogin();
