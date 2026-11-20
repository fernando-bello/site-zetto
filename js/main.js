(() => {
  'use strict';

  /* ================================================================
   * CONFIGURAÇÃO
   * Número do WhatsApp com código do país e DDD, só dígitos.
   * Exemplo: "5554991234567" (55 = Brasil, 54 = DDD de Passo Fundo)
   * ================================================================ */
  const WHATSAPP_NUMBER = '';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  document.documentElement.classList.add('js');

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toastEl.hidden = true), 4500);
  }

  /* ---------- WhatsApp ---------- */
  const waReady = /^\d{12,13}$/.test(WHATSAPP_NUMBER);
  const waUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

  function openWhatsApp(text) {
    if (!waReady) {
      toast('O WhatsApp ainda não foi configurado neste site.');
      return false;
    }
    window.open(waUrl(text), '_blank', 'noopener');
    return true;
  }

  $$('[data-wa]').forEach((el) => {
    const msg = el.dataset.msg || 'Olá, Matheus! Vim pelo site.';
    if (waReady) {
      el.href = waUrl(msg);
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    } else {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        toast('O WhatsApp ainda não foi configurado neste site.');
      });
    }
  });

  /* ---------- Formulário de orçamento ---------- */
  const form = $('#quote-form');
  const errorEl = $('#form-error');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const nome = (d.get('nome') || '').toString().trim();
    const tipo = (d.get('tipo') || '').toString();
    const data = (d.get('data') || '').toString().trim();
    const msg = (d.get('msg') || '').toString().trim();

    $$('.is-invalid', form).forEach((n) => n.classList.remove('is-invalid'));
    const missing = [];
    if (!nome) missing.push(form.nome);
    if (!tipo) missing.push(form.tipo);
    if (missing.length) {
      missing.forEach((n) => n.classList.add('is-invalid'));
      errorEl.textContent = 'Preencha seu nome e o tipo de trabalho.';
      errorEl.hidden = false;
      missing[0].focus();
      return;
    }
    errorEl.hidden = true;

    const linhas = [
      `Olá, Matheus! Meu nome é ${nome}.`,
      `Gostaria de um orçamento para: ${tipo}.`,
    ];
    if (data) linhas.push(`Data prevista: ${data}.`);
    if (msg) linhas.push(`Detalhes: ${msg}`);
    openWhatsApp(linhas.join('\n'));
  });

  /* ---------- Menu mobile ---------- */
  const burger = $('#burger');
  const nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

  /* ---------- Topbar ao rolar ---------- */
  const topbar = $('.topbar');
  const onScroll = () => topbar.classList.toggle('is-solid', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Filtro do portfólio ---------- */
  const shots = $$('.shot');
  $$('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      $$('.chip').forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', String(on));
      });
      shots.forEach((s) => {
        s.hidden = !(f === 'todos' || s.dataset.cat.split(' ').includes(f));
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCap = $('#lb-cap');
  let current = 0;
  const visible = () => shots.filter((s) => !s.hidden);

  function show(i) {
    const list = visible();
    if (!list.length) return;
    current = (i + list.length) % list.length;
    const img = $('img', list[current]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
  }

  shots.forEach((s) => {
    $('button', s).addEventListener('click', () => {
      show(visible().indexOf(s));
      if (!lb.open) lb.showModal();
    });
  });
  $('#lb-close').addEventListener('click', () => lb.close());
  $('#lb-prev').addEventListener('click', () => show(current - 1));
  $('#lb-next').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  $('#year').textContent = new Date().getFullYear();
})();
