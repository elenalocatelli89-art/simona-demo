// Percorso: comparsa scorrendo, pulsante fisso, richiesta di contatto.
(function () {
  // 1. Comparsa dolce degli elementi quando entrano nello schermo
  var els = document.querySelectorAll('.rivela');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (voci) {
      voci.forEach(function (v) {
        if (v.isIntersecting) { v.target.classList.add('vista'); io.unobserve(v.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('vista'); });
  }

  // 2. Pulsante fisso in basso, sul telefono, dopo l'apertura
  var fisso = document.querySelector('.btn-fisso');
  var contatto = document.getElementById('contatto');
  function aggiornaFisso() {
    var sotto = window.scrollY > window.innerHeight * 0.7;
    var r = contatto.getBoundingClientRect();
    var inVista = r.top < window.innerHeight && r.bottom > 0;
    fisso.classList.toggle('visibile', sotto && !inVista);
  }
  window.addEventListener('scroll', aggiornaFisso, { passive: true });
  aggiornaFisso();

  // 3. Richiesta di contatto: prepara il messaggio nell'app di posta di chi scrive
  var modulo = document.querySelector('.modulo');
  var fatto = document.querySelector('.fatto');
  modulo.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var d = new FormData(modulo);
    var righe = [
      'Ciao Simona, vorrei un incontro.', '',
      'Nome: ' + d.get('nome'),
      'Telefono: ' + d.get('tel'),
      'Per: ' + (d.getAll('motivo').join(', ') || 'da definire'),
      'Dove preferisco: ' + (d.get('modo') || 'da definire'),
      'Quando richiamarmi: ' + (d.get('quando') || 'quando vuoi')
    ];
    var link = document.createElement('a');
    link.href = 'mailto:' + modulo.dataset.email +
      '?subject=' + encodeURIComponent('Richiesta di incontro dal sito') +
      '&body=' + encodeURIComponent(righe.join('\r\n'));
    document.body.appendChild(link);
    link.click();
    link.remove();
    modulo.hidden = true;
    fatto.hidden = false;
    fatto.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  document.querySelector('.indietro').addEventListener('click', function () { fatto.hidden = true; modulo.hidden = false; });

  // 4. Bio: aperta scorre intera, il "Chiudi" sta in fondo
  var storia = document.querySelector('.storia');
  storia.querySelector('.storia-chiudi').addEventListener('click', function () {
    storia.open = false;
    document.querySelector('.chi-testo').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
