// Comune alle tre proposte: comparsa scorrendo, pulsante fisso, prenotazione finta.
(function () {
  // 1. Comparsa dolce degli elementi quando entrano nello schermo
  var els = document.querySelectorAll('.rivela');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add('vista'); io.unobserve(v.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('vista'); });
  }

  // 2. Pulsante "Prenota" fisso in basso, sul telefono, dopo l'apertura
  var fisso = document.querySelector('.btn-fisso');
  var prenota = document.getElementById('prenota');
  function aggiornaFisso() {
    var sotto = window.scrollY > window.innerHeight * 0.7;
    var r = prenota.getBoundingClientRect();
    var inVista = r.top < window.innerHeight && r.bottom > 0;
    fisso.classList.toggle('visibile', sotto && !inVista);
  }
  window.addEventListener('scroll', aggiornaFisso, { passive: true });
  aggiornaFisso();

  // 3. Prenotazione finta in tre passi
  var scheda = document.querySelector('.prenota-scheda');
  var scelta = {};
  var GIORNI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

  function vai(n) {
    scheda.dataset.passo = n;
    scheda.querySelectorAll('.passo').forEach(function (p) { p.hidden = p.dataset.n != n; });
    if (n > 1) scheda.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // le porte in alto portano alla prenotazione
  document.querySelectorAll('.porta').forEach(function (p) {
    p.addEventListener('click', function () { vai(1); });
  });

  scheda.querySelectorAll('.scelta').forEach(function (b) {
    b.addEventListener('click', function () {
      scelta.tipo = b.querySelector('span').textContent;
      disegnaGiorni();
      vai(2);
    });
  });

  // orari di esempio: niente domenica, qualche giorno "pieno"
  function disegnaGiorni() {
    var box = scheda.querySelector('.giorni');
    box.innerHTML = '';
    scheda.querySelector('.ore').innerHTML = '';
    var oggi = new Date();
    for (var i = 1; i <= 14; i++) {
      var d = new Date(oggi); d.setDate(oggi.getDate() + i);
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'giorno';
      b.innerHTML = '<small>' + GIORNI[d.getDay()] + '</small><b>' + d.getDate() + '</b>';
      if (d.getDay() === 0 || i % 5 === 0) b.disabled = true;
      (function (d, b) {
        b.addEventListener('click', function () {
          box.querySelectorAll('.giorno').forEach(function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          scelta.giorno = GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()];
          disegnaOre(d);
        });
      })(d, b);
      box.appendChild(b);
    }
  }

  function disegnaOre(d) {
    var box = scheda.querySelector('.ore');
    box.innerHTML = '';
    var ore = d.getDay() === 6 ? ['9:00', '10:30', '12:00'] : ['9:30', '11:00', '14:30', '16:00', '17:30', '19:00'];
    ore.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'ora'; b.textContent = o;
      b.style.animation = 'entra .35s ' + (i * 50) + 'ms ease both';
      if ((d.getDate() + i) % 4 === 0) { b.disabled = true; b.style.opacity = .35; }
      b.addEventListener('click', function () {
        scelta.ora = o;
        scheda.querySelector('.riepilogo').textContent = scelta.tipo + ' · ' + scelta.giorno + ' alle ' + o;
        vai(3);
      });
      box.appendChild(b);
    });
  }

  scheda.querySelectorAll('.indietro').forEach(function (b) {
    b.addEventListener('click', function () { vai(Number(scheda.dataset.passo) - 1); });
  });

  // la conferma non invia niente: è una demo
  scheda.querySelector('.modulo').addEventListener('submit', function (ev) {
    ev.preventDefault();
    vai(4);
    document.dispatchEvent(new CustomEvent('prenotato'));
  });
})();
