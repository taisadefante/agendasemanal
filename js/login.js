import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// ✅ Firebase config real
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

// 🔑 Login com email/senha
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "tarefas.html"; // ✅ redireciona sem alert
    })
    .catch((error) => {
      alert("Erro no login: " + error.message);
    });
});

// 🔐 Login com Google (sem alert)
const provider = new GoogleAuthProvider();

document.getElementById("btn-google").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      window.location.href = "tarefas.html"; // ✅ redireciona direto
    })
    .catch((error) => {
      console.error("Erro no login com Google:", error);
      alert("Erro ao fazer login com Google.");
    });
});

// ✍️ Cadastro
document.getElementById("cadastro-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const senha = e.target.senha.value;

  createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert("Conta criada com sucesso! Faça login.");
      document.getElementById("cadastro-box").style.display = "none";
      document.getElementById("login-box").style.display = "block";
    })
    .catch((error) => {
      alert("Erro ao cadastrar: " + error.message);
    });
});

// 📧 Recuperar senha
document.getElementById("recuperar-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = e.target.email.value;

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Link de recuperação enviado para o seu e-mail.");
    })
    .catch((error) => {
      alert("Erro ao enviar email: " + error.message);
    });
});

// 🧭 Alternar entre telas
document.getElementById("link-cadastro").addEventListener("click", () => {
  document.getElementById("login-box").style.display = "none";
  document.getElementById("cadastro-box").style.display = "block";
});

document.getElementById("link-recuperar").addEventListener("click", () => {
  document.getElementById("login-box").style.display = "none";
  document.getElementById("recuperar-box").style.display = "block";
});

document.getElementById("voltar-login").addEventListener("click", () => {
  document.getElementById("cadastro-box").style.display = "none";
  document.getElementById("login-box").style.display = "block";
});

document.getElementById("voltar-login2").addEventListener("click", () => {
  document.getElementById("recuperar-box").style.display = "none";
  document.getElementById("login-box").style.display = "block";
});
