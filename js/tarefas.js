import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
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

let dataBase = new Date();

function formatarData(data) {
  return `${data.getDate().toString().padStart(2, "0")}/${(data.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${data.getFullYear()}`;
}

function gerarSemana() {
  const hoje = new Date(dataBase);
  const inicioSemana = new Date(hoje);
  inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const dia = new Date(inicioSemana);
    dia.setDate(inicioSemana.getDate() + i);
    return dia;
  });
}

function atualizarCabecalho(dias) {
  header.innerHTML = '<div class="hora-coluna">Hora</div>';
  dias.forEach((data) => {
    const diaNome = data.toLocaleDateString("pt-BR", { weekday: "short" });
    header.innerHTML += `<div><span class="data-dia">${formatarData(
      data
    )}</span><span class="dia-semana">${diaNome}</span></div>`;
  });
}

function gerarGradeHorario(dias) {
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
}

function carregarTarefas(dias, usuarioId) {
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
            <span>${t.descricao}</span>
            <div class="tarefa-actions">
              <button class="concluir">✔</button>
              <button class="editar">✎</button>
              <button class="excluir">✕</button>
            </div>
          `;

          tarefaDiv.querySelector(".concluir").onclick = () =>
            updateDoc(doc(db, "tarefas", docSnap.id), { status: "concluida" });

          tarefaDiv.querySelector(".editar").onclick = () => {
            const novaDesc = prompt("Descrição:", t.descricao);
            const novaData = prompt("Nova data/hora:", t.horario);
            if (novaDesc && novaData) {
              updateDoc(doc(db, "tarefas", docSnap.id), {
                descricao: novaDesc,
                horario: novaData,
              });
            }
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
}

function atualizarGrade(usuario) {
  const dias = gerarSemana();
  atualizarCabecalho(dias);
  gerarGradeHorario(dias);
  carregarTarefas(dias, usuario.uid);
}

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
  const descricao = formTarefa.descricao.value;
  const horario = formTarefa.horario.value;
  const user = auth.currentUser;
  if (!user) return;

  try {
    const date = new Date(horario);
    date.setMinutes(0, 0, 0); // 🔁 arredondar para hora cheia

    await addDoc(collection(db, "tarefas"), {
      descricao,
      horario: date.toISOString(),
      usuario: user.uid,
      status: "pendente",
    });

    formTarefa.reset();
    atualizarGrade(user);
    window.showToast("Tarefa adicionada com sucesso!");
  } catch (err) {
    console.error(err);
    window.showToast("Erro ao cadastrar tarefa", "error");
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) return (window.location.href = "./login.html");
  document.getElementById("logout-box").style.display = "flex";
  userEmail.textContent = user.email;
  atualizarGrade(user);
});
