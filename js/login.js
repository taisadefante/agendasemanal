// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
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

const loginBox = document.getElementById("login-box");
const cadastroBox = document.getElementById("cadastro-box");
const recuperarBox = document.getElementById("recuperar-box");

// Navegação entre telas
const linkCadastro = document.getElementById("link-cadastro");
const linkRecuperar = document.getElementById("link-recuperar");
const voltarLogin = document.getElementById("voltar-login");
const voltarLogin2 = document.getElementById("voltar-login2");

linkCadastro.onclick = () => {
  loginBox.style.display = "none";
  cadastroBox.style.display = "block";
};
linkRecuperar.onclick = () => {
  loginBox.style.display = "none";
  recuperarBox.style.display = "block";
};
voltarLogin.onclick = voltarLogin2.onclick = () => {
  cadastroBox.style.display = "none";
  recuperarBox.style.display = "none";
  loginBox.style.display = "block";
};

// Login
const loginForm = document.getElementById("login-form");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const senha = loginForm.password.value;
  signInWithEmailAndPassword(auth, email, senha)
    .then(() => {
      window.location.href = "tarefas.html";
    })
    .catch((error) => alert("Erro no login: " + error.message));
});

// Cadastro
const cadastroForm = document.getElementById("cadastro-form");
cadastroForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = cadastroForm.email.value;
  const senha = cadastroForm.senha.value;
  createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      alert("Conta criada com sucesso!");
      window.location.href = "tarefas.html";
    })
    .catch((error) => alert("Erro ao cadastrar: " + error.message));
});

// Recuperar senha
const recuperarForm = document.getElementById("recuperar-form");
recuperarForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = recuperarForm.email.value;
  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert("Link de recuperação enviado para o email.");
      recuperarForm.reset();
      loginBox.style.display = "block";
      recuperarBox.style.display = "none";
    })
    .catch((error) => alert("Erro ao enviar email: " + error.message));
});
