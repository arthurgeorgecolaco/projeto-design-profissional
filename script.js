// ===== Lembrete de Remédios =====
// Cada remédio é um objeto assim:
// { id: 123, nome: "Losartana", horario: "08:00", dose: "1 comprimido", tomadoEm: "2026-11-24" }
// "tomadoEm" guarda a DATA em que foi tomado. Assim, no dia seguinte ele volta a aparecer como pendente.

const formulario = document.getElementById("formulario");
const lista = document.getElementById("lista");
const vazio = document.getElementById("vazio");
const aviso = document.getElementById("aviso");

// --- Funções de apoio ---

// Data de hoje no formato "2026-11-24"
function hoje() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// Hora atual no formato "08:05" (dá para comparar com o horário do remédio como texto)
function agora() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

// Lê os remédios salvos no navegador (localStorage só guarda texto, por isso o JSON.parse)
function carregar() {
  return JSON.parse(localStorage.getItem("remedios")) || [];
}

// Salva a lista no navegador
function salvar(remedios) {
  localStorage.setItem("remedios", JSON.stringify(remedios));
}

function foiTomadoHoje(remedio) {
  return remedio.tomadoEm === hoje();
}

// --- Desenhar a tela ---

function mostrarLista() {
  const remedios = carregar();

  // Ordena por horário (do mais cedo para o mais tarde)
  remedios.sort((a, b) => a.horario.localeCompare(b.horario));

  lista.innerHTML = ""; // limpa a lista antes de desenhar de novo
  vazio.hidden = remedios.length > 0;

  remedios.forEach((remedio) => {
    const item = document.createElement("li");
    if (foiTomadoHoje(remedio)) item.classList.add("tomado");

    // Usamos textContent (e não innerHTML) para o texto digitado: é mais seguro.
    // Horário grande em cima, nome do remédio e dose embaixo
    const horario = document.createElement("p");
    horario.className = "horario";
    horario.textContent = remedio.horario;

    const nome = document.createElement("p");
    nome.className = "nome";
    nome.textContent = remedio.nome;

    const dose = document.createElement("p");
    dose.className = "dose";
    dose.textContent = remedio.dose;

    const botaoTomei = document.createElement("button");
    if (foiTomadoHoje(remedio)) {
      botaoTomei.textContent = "✔ Tomado";
      botaoTomei.disabled = true;
    } else {
      botaoTomei.textContent = "Já tomei";
      botaoTomei.addEventListener("click", () => marcarTomado(remedio.id));
    }

    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";
    botaoRemover.className = "remover";
    botaoRemover.setAttribute("aria-label", `Remover ${remedio.nome}`);
    botaoRemover.addEventListener("click", () => remover(remedio.id));

    item.append(horario, nome, dose, botaoTomei, botaoRemover);
    lista.append(item);
  });

  verificarAtrasados();
}

// Mostra o aviso se houver remédio com horário já passado e ainda não tomado hoje
function verificarAtrasados() {
  const atrasados = carregar().filter(
    (r) => r.horario <= agora() && !foiTomadoHoje(r)
  );

  if (atrasados.length === 0) {
    aviso.hidden = true;
    return;
  }

  const nomes = atrasados.map((r) => `${r.nome} (${r.horario})`).join(", ");
  aviso.textContent = `⚠ Atenção: você ainda não tomou: ${nomes}`;
  aviso.hidden = false;
}

// --- Ações do usuário ---

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault(); // impede a página de recarregar

  const remedios = carregar();
  remedios.push({
    id: Date.now(), // número único simples
    nome: document.getElementById("nome").value.trim(),
    horario: document.getElementById("horario").value,
    dose: document.getElementById("dose").value.trim(),
    tomadoEm: null,
  });
  salvar(remedios);

  formulario.reset();
  document.getElementById("nome").focus(); // volta o cursor para o primeiro campo
  mostrarLista();
});

function marcarTomado(id) {
  const remedios = carregar();
  const remedio = remedios.find((r) => r.id === id);
  remedio.tomadoEm = hoje();
  salvar(remedios);
  mostrarLista();
}

function remover(id) {
  if (!confirm("Remover este remédio?")) return;
  salvar(carregar().filter((r) => r.id !== id));
  mostrarLista();
}

// --- Início ---
mostrarLista();
setInterval(verificarAtrasados, 60 * 1000); // confere atrasos a cada 1 minuto
