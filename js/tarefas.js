// tarefas.js
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
  getDoc,
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
  storageBucket: "todolist-e50c3.appspot.com",
  messagingSenderId: "790530819886",
  appId: "1:790530819886:web:d3922dcd87284d9d301cbf",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

const header = document.getElementById("header-grid");
const corpo = document.getElementById("corpo-grade");
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout");
const formTarefa = document.getElementById("form-tarefa");
const alerta = document.getElementById("alerta");
const modal = document.getElementById("modal-tarefa");
const modalTitulo = document.getElementById("modal-titulo");
const modalDescricao = document.getElementById("modal-descricao");

let dataBase = new Date();
let tarefaEditandoId = null;

const formatarData = (data) =>
  `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${data.getFullYear()}`;

const gerarSemana = () => {
  const hoje = new Date(dataBase);
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  return Array.from({ length: 7 }, (_, i) => {
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
  const horas = Array.from(
    { length: 16 },
    (_, i) => `${(7 + i).toString().padStart(2, "0")}:00`
  );
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
      linha.appendChild(celula);
    });

    corpo.appendChild(linha);
  });
};

const carregarTarefas = (dias, usuarioId) => {
  const inicio = dias[0].toISOString();
  const fim = new Date(dias[6]);
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
            <span>${t.nome}</span>
            <div class="tarefa-actions">
              <button class="concluir">✔</button>
              <button class="editar">✎</button>
              <button class="excluir">✕</button>
            </div>
          `;

          tarefaDiv.querySelector(".concluir").onclick = () => {
            const novoStatus =
              t.status === "concluida" ? "pendente" : "concluida";
            updateDoc(doc(db, "tarefas", docSnap.id), { status: novoStatus });
          };

          tarefaDiv.querySelector(".editar").onclick = () => {
            document.querySelector("[name='nome']").value = t.nome;
            document.querySelector("[name='data']").value =
              t.horario.split("T")[0];
            document.querySelector("[name='hora']").value = t.horario
              .split("T")[1]
              .substring(0, 5);
            document.querySelector("[name='descricao']").value =
              t.descricao || "";
            formTarefa.querySelector("button").textContent = "Atualizar";
            tarefaEditandoId = docSnap.id;
          };

          tarefaDiv.querySelector(".excluir").onclick = () => {
            if (confirm("Excluir tarefa?"))
              deleteDoc(doc(db, "tarefas", docSnap.id));
          };

          tarefaDiv.onclick = () => {
            modal.style.display = "flex";
            modalTitulo.textContent = t.nome;
            modalDescricao.textContent = t.descricao || "(Sem descrição)";
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

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => (window.location.href = "./login.html"));
});

formTarefa.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  const nome = formTarefa.nome.value;
  const data = formTarefa.data.value;
  const hora = formTarefa.hora.value;
  const descricao = formTarefa.descricao.value;

  const horario = `${data}T${hora}`;

  try {
    if (tarefaEditandoId) {
      await updateDoc(doc(db, "tarefas", tarefaEditandoId), {
        nome,
        descricao,
        horario,
      });
      tarefaEditandoId = null;
      formTarefa.querySelector("button").textContent = "Adicionar";
    } else {
      await addDoc(collection(db, "tarefas"), {
        nome,
        descricao,
        horario,
        usuario: user.uid,
        status: "pendente",
      });
    }

    formTarefa.reset();
    alerta.textContent = "✅ Tarefa adicionada com sucesso!";
    alerta.style.display = "block";
    setTimeout(() => (alerta.style.display = "none"), 3000);
    atualizarGrade(user);
  } catch (err) {
    alert("Erro ao cadastrar tarefa: " + err.message);
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) return (window.location.href = "./login.html");
  document.getElementById("logout-box").style.display = "flex";
  userEmail.textContent = user.email;
  atualizarGrade(user);
});
