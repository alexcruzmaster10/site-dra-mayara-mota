// =====================================================================
// Biblioteca — animações de rolagem (origem: Gandra v3.0 - animado)
// Só roda com html.anim. No <head> do site, antes do CSS:
//   <script>document.documentElement.classList.add(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'sem-anim' : 'anim');</script>
// Cada efeito só liga se o bloco existir na página.
// =====================================================================

if (document.documentElement.classList.contains('anim')) {
  const limitar = (v) => Math.min(1, Math.max(0, v));

  // atraso dos itens que aparecem ao carregar (data-aparecer="0.45")
  document.querySelectorAll('[data-aparecer]').forEach((el) => {
    el.style.setProperty('--atraso-entrada', `${Number(el.dataset.aparecer) || 0}s`);
  });

  // Entradas suaves: blocos lado a lado entram um pouco depois do outro
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('revelado');
      observador.unobserve(e.target);
    });
  }, { threshold: 0.18 });

  document.querySelectorAll('[data-revelar]').forEach((el) => {
    const irmaos = [...el.parentElement.children].filter((f) => f.hasAttribute('data-revelar'));
    el.style.setProperty('--atraso', `${irmaos.indexOf(el) * 0.12}s`);
    observador.observe(el);
  });
  document.querySelectorAll('[data-cascata] li').forEach((li) => {
    li.style.setProperty('--i', [...li.parentElement.children].indexOf(li));
  });

  const abertura = document.querySelector('[data-rolagem="abertura"]');
  const trilhos = [...document.querySelectorAll('.trilho')].map((secao) => {
    const faixa = secao.querySelector('.trilho__faixa');
    return { secao, faixa, itens: [...faixa.children], distancia: 0 };
  });
  const mascaras = [...document.querySelectorAll('.mascara')];

  // progresso de uma seção "presa" na tela: 0 quando chega no topo, 1 quando vai soltar
  const progressoPreso = (secao) => {
    const r = secao.getBoundingClientRect();
    return limitar(-r.top / (r.height - window.innerHeight));
  };

  // a altura do trilho depende do tamanho da faixa: quanto mais fotos, mais rolagem
  function medir() {
    trilhos.forEach((t) => {
      t.distancia = Math.max(0, t.faixa.scrollWidth - window.innerWidth);
      t.secao.style.height = `${window.innerHeight + t.distancia}px`;
    });
  }

  function atualizar() {
    if (abertura) {
      abertura.style.setProperty('--p', limitar(window.scrollY / abertura.offsetHeight).toFixed(3));
    }

    trilhos.forEach((t) => {
      t.faixa.style.setProperty('--deslocamento', (progressoPreso(t.secao) * t.distancia).toFixed(1));
      const centro = window.innerWidth / 2;
      let maisPerto = null;
      let menor = Infinity;
      t.itens.forEach((f) => {
        const r = f.getBoundingClientRect();
        const d = Math.abs(r.left + r.width / 2 - centro);
        if (d < menor) { menor = d; maisPerto = f; }
      });
      const naTela = t.secao.getBoundingClientRect().top < window.innerHeight * 0.5;
      t.itens.forEach((f) => f.classList.toggle('em-foco', naTela && f === maisPerto));
    });

    mascaras.forEach((m) => m.style.setProperty('--p', progressoPreso(m).toFixed(3)));
  }

  let agendado = false;
  window.addEventListener('scroll', () => {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(() => { agendado = false; atualizar(); });
  }, { passive: true });
  window.addEventListener('resize', () => { medir(); atualizar(); });
  window.addEventListener('load', () => { medir(); atualizar(); });
  medir();
  atualizar();
}
