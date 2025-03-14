import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzL7cIuTaMQKfzxopGV4eLcbKAnNYjDNE",
  authDomain: "todolist-e50c3.firebaseapp.com",
  projectId: "todolist-e50c3",
  storageBucket: "todolist-e50c3.firebasestorage.app",
  messagingSenderId: "790530819886",
  appId: "1:790530819886:web:d3922dcd87284d9d301cbf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const header = document.getElementById("header-grid");
const corpo = document.getElementById("corpo-grade");
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout");
const formModal = document.getElementById("form-modal");
const modal = document.getElementById("modal-form");
const modalTarefa = document.getElementById("modal-tarefa");
const modalTitulo = document.getElementById("modal-titulo");
const modalDescricao = document.getElementById("modal-descricao");
const tituloFormulario = document.getElementById("titulo-formulario");
const botaoSalvar = document.getElementById("botao-salvar");

let dataBase = new Date();

const formatarData = (data) =>
  `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${data.getFullYear()}`;

const gerarSemana = () => {
  const hoje = new Date(dataBase);
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());

  const diasVisiveis = window.innerWidth < 768 ? 3 : 7;
  return Array.from({ length: diasVisiveis }, (_, i) => {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + i);
    return dia;
  });
};

const atualizarCabecalho = (dias) => {
  header.innerHTML = '<div class="hora-coluna">Hora</div>';
  dias.forEach((data) => {
    const diaNome = data.toLocaleDateString("pt-BR", { weekday: "short" });
    header.innerHTML += `<div><span class="data-dia">${formatarData(
      data
    )}</span><span class="dia-semana">${diaNome}</span></div>`;
  });
};

const gerarGradeHorario = (dias) => {
  corpo.innerHTML = "";
  const horas = Array.from({ length: 16 }, (_, i) => {
    const hora = `${(7 + i).toString().padStart(2, "0")}:00`;
    return hora;
  });

  horas.forEach((hora) => {
    const linha = document.createElement("div");
    linha.className = "linha-horario";

    const horaCol = document.createElement("div");
    horaCol.className = "hora-coluna";
    horaCol.textContent = hora;
    linha.appendChild(horaCol);

    dias.forEach((data) => {
      const celula = document.createElement("div");
      celula.className = "celula-dia";
      celula.dataset.dia = data.toISOString().split("T")[0];
      celula.dataset.hora = hora;
      celula.style.minHeight = window.innerWidth < 768 ? "auto" : "40px";
      linha.appendChild(celula);
    });

    corpo.appendChild(linha);
  });
};

const carregarTarefas = (dias, usuarioId) => {
  const inicio = dias[0].toISOString();
  const fim = new Date(dias[dias.length - 1]);
  fim.setHours(23, 59, 59, 999);

  const q = query(
    collection(db, "tarefas"),
    where("usuario", "==", usuarioId),
    orderBy("horario", "asc")
  );

  onSnapshot(q, (snapshot) => {
    document.querySelectorAll(".tarefa").forEach((e) => e.remove());
    snapshot.forEach((docSnap) => {
      const t = docSnap.data();
      const data = new Date(t.horario);
      if (data >= new Date(inicio) && data <= fim) {
        const dia = data.toISOString().split("T")[0];
        const hora = data.toTimeString().substring(0, 5);
        const celula = document.querySelector(
          `.celula-dia[data-dia='${dia}'][data-hora='${hora}']`
        );

        if (celula) {
          const tarefaDiv = document.createElement("div");
          tarefaDiv.className = "tarefa";
          if (t.status === "concluida") tarefaDiv.classList.add("concluida");
          tarefaDiv.innerHTML = `
            <span class="nome" style="flex: 1; cursor: pointer;">${t.nome}</span>
            <div class="tarefa-actions">
              <button class="concluir">✔</button>
              <button class="editar">✎</button>
              <button class="excluir">✕</button>
            </div>
          `;

          tarefaDiv.querySelector(".nome").onclick = () => {
            modalTitulo.textContent = `${t.nome} - ${formatarData(
              data
            )} ${hora}`;
            modalDescricao.textContent = t.descricao || "(Sem descrição)";
            modalTarefa.style.display = "flex";
          };

          tarefaDiv.querySelector(".concluir").onclick = () => {
            const novoStatus =
              t.status === "concluida" ? "pendente" : "concluida";
            updateDoc(doc(db, "tarefas", docSnap.id), { status: novoStatus });
          };

          tarefaDiv.querySelector(".editar").onclick = () => {
            formModal.nome.value = t.nome;
            formModal.data.value = data.toISOString().split("T")[0];
            formModal.hora.value = hora;
            formModal.descricao.value = t.descricao;
            formModal.setAttribute("data-id", docSnap.id);
            tituloFormulario.textContent = "Editar Tarefa";
            botaoSalvar.textContent = "Atualizar";
            modal.style.display = "flex";
          };

          tarefaDiv.querySelector(".excluir").onclick = () => {
            if (confirm("Excluir tarefa?")) {
              deleteDoc(doc(db, "tarefas", docSnap.id));
            }
          };

          celula.appendChild(tarefaDiv);
        }
      }
    });
  });
};

const atualizarGrade = (usuario) => {
  const dias = gerarSemana();
  atualizarCabecalho(dias);
  gerarGradeHorario(dias);
  carregarTarefas(dias, usuario.uid);
};

document.getElementById("semana-anterior").onclick = () => {
  dataBase.setDate(dataBase.getDate() - 7);
  atualizarGrade(auth.currentUser);
};
document.getElementById("semana-proxima").onclick = () => {
  dataBase.setDate(dataBase.getDate() + 7);
  atualizarGrade(auth.currentUser);
};
document.getElementById("semana-hoje").onclick = () => {
  dataBase = new Date();
  atualizarGrade(auth.currentUser);
};

document.getElementById("btn-abrir-modal").onclick = () => {
  modal.style.display = "flex";
};
document.getElementById("btn-fechar-modal").onclick = () => {
  modal.style.display = "none";
  formModal.reset();
  formModal.removeAttribute("data-id");
  tituloFormulario.textContent = "Nova Tarefa";
  botaoSalvar.textContent = "Adicionar";
};

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => (window.location.href = "./index.html"));
});

formModal.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = formModal.nome.value;
  const data = formModal.data.value;
  const hora = formModal.hora.value;
  const descricao = formModal.descricao.value;
  const user = auth.currentUser;
  if (!user) return;
  const horario = `${data}T${hora}`;
  const id = formModal.getAttribute("data-id");

  try {
    if (id) {
      await updateDoc(doc(db, "tarefas", id), {
        nome,
        descricao,
        horario,
      });
    } else {
      await addDoc(collection(db, "tarefas"), {
        nome,
        descricao,
        horario,
        usuario: user.uid,
        status: "pendente",
      });
    }
    formModal.reset();
    modal.style.display = "none";
    formModal.removeAttribute("data-id");
    tituloFormulario.textContent = "Nova Tarefa";
    botaoSalvar.textContent = "Adicionar";
  } catch (err) {
    alert("Erro ao salvar tarefa: " + err.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) return (window.location.href = "./index.html");
  document.getElementById("logout-box").style.display = "flex";
  userEmail.textContent = user.email;
  atualizarGrade(user);
});

window.addEventListener("resize", () => {
  if (auth.currentUser) {
    atualizarGrade(auth.currentUser);
  }
});
