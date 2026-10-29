// =====================================================================
// Clínica Dra. Mayara Mota — comportamento da página
// =====================================================================

// WhatsApp de cada unidade (o de Araçatuba é o mesmo do Google e da assistente)
const WHATSAPP = {
  aracatuba: '5518996304555',
  'rio-preto': '5517997024555',
};

// Todos os botões de agendar abrem o WhatsApp com uma mensagem pronta.
// data-unidade escolhe o número; data-assunto ou data-pessoa entram na mensagem.
document.querySelectorAll('.js-whats').forEach((link) => {
  const { unidade = 'aracatuba', assunto, pessoa } = link.dataset;
  let texto = 'Olá! Vim pelo site e quero agendar uma avaliação.';
  if (assunto) texto = `Olá! Vim pelo site e quero saber mais sobre ${assunto}.`;
  if (pessoa) texto = `Olá! Vim pelo site e quero agendar com ${pessoa}.`;
  if (unidade === 'rio-preto') texto = texto.replace('pelo site', 'pelo site (unidade Rio Preto)');
  link.href = `https://wa.me/${WHATSAPP[unidade]}?text=${encodeURIComponent(texto)}`;
  link.target = '_blank';
  link.rel = 'noopener';
});

// Menu do celular
const hamburguer = document.getElementById('hamburguer');
const menu = document.getElementById('menu');

function fecharMenu() {
  menu.classList.remove('aberto');
  hamburguer.setAttribute('aria-expanded', 'false');
  hamburguer.setAttribute('aria-label', 'Abrir menu');
}

hamburguer.addEventListener('click', () => {
  const abrir = !menu.classList.contains('aberto');
  menu.classList.toggle('aberto', abrir);
  hamburguer.setAttribute('aria-expanded', String(abrir));
  hamburguer.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
});

menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', fecharMenu));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fecharMenu(); });

// Item do menu acende (dourado) conforme a seção que está na tela
const linksMenu = [...document.querySelectorAll('.menu__link')];
const secoes = linksMenu.map((a) => document.querySelector(a.getAttribute('href')));

function marcarSecaoAtual() {
  // a seção "atual" é a última cujo topo já passou de 40% da tela
  const linha = window.innerHeight * 0.4;
  let atual = 0;
  secoes.forEach((secao, i) => {
    if (secao.getBoundingClientRect().top <= linha) atual = i;
  });
  // chegou no fim da página: marca a última seção
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
    atual = secoes.length - 1;
  }
  linksMenu.forEach((a, i) => a.classList.toggle('ativo', i === atual));
}

// Topo fica sólido e o botão flutuante aparece depois que rola
const topo = document.getElementById('topo');
const whatsFlutuante = document.querySelector('.whats-flutuante');

function aoRolar() {
  const rolou = window.scrollY > 40;
  topo.classList.toggle('rolou', rolou);
  whatsFlutuante.classList.toggle('visivel', window.scrollY > window.innerHeight * 0.6);
  marcarSecaoAtual();
}

window.addEventListener('scroll', aoRolar, { passive: true });
window.addEventListener('resize', marcarSecaoAtual);
aoRolar();

document.getElementById('ano').textContent = new Date().getFullYear();

// "Aberto agora" / "Fechado" pelo horário de Araçatuba (o do Google: seg a sáb, 07h30–20h30)
// dia da semana: 0 = domingo ... 6 = sábado; [abre, fecha] em horas
const HORARIOS = { 1: [7.5, 20.5], 2: [7.5, 20.5], 3: [7.5, 20.5], 4: [7.5, 20.5], 5: [7.5, 20.5], 6: [7.5, 20.5] };
const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function agoraEmAracatuba() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date());
  const valor = (tipo) => partes.find((p) => p.type === tipo).value;
  const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(valor('weekday'));
  return { dia, hora: Number(valor('hour')) + Number(valor('minute')) / 60 };
}

// 7.5 -> "07h30", 20 -> "20h"
const hh = (h) => {
  const min = Math.round((h % 1) * 60);
  return `${String(Math.floor(h)).padStart(2, '0')}h${min ? String(min).padStart(2, '0') : ''}`;
};

function atualizarStatus() {
  const el = document.getElementById('status');
  const { dia, hora } = agoraEmAracatuba();
  const hoje = HORARIOS[dia];
  let texto;
  let aberto = false;

  if (hoje && hora >= hoje[0] && hora < hoje[1]) {
    aberto = true;
    texto = `Aberto agora · fecha às ${hh(hoje[1])}`;
  } else if (hoje && hora < hoje[0]) {
    texto = `Fechado · abre hoje às ${hh(hoje[0])}`;
  } else {
    // procura o próximo dia com expediente
    let d = dia;
    let saltos = 0;
    do { d = (d + 1) % 7; saltos++; } while (!HORARIOS[d]);
    const quando = saltos === 1 ? 'amanhã' : DIAS[d];
    texto = `Fechado · abre ${quando} às ${hh(HORARIOS[d][0])}`;
  }

  el.querySelector('.status__texto').textContent = texto;
  el.classList.toggle('aberto', aberto);
  el.hidden = false;
}

atualizarStatus();
setInterval(atualizarStatus, 60 * 1000);
