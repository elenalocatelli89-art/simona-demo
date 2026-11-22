// «Percorso»: titolo parola per parola, rami che si disegnano, fasi, cursore dei due sguardi,
// carte da girare, foto con leggero movimento, video di Instagram caricati solo al tocco.
(function () {
  var calmo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Titolo: ogni parola sale da sotto
  var h1 = document.querySelector('.titolo-parole');
  var k = 0;
  (function spezza(nodo) {
    Array.prototype.slice.call(nodo.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) { frag.appendChild(document.createTextNode(' ')); return; }
          var o = document.createElement('span'); o.className = 'parola';
          var i = document.createElement('span'); i.textContent = w; i.style.setProperty('--k', k++);
          o.appendChild(i); frag.appendChild(o);
        });
        n.parentNode.replaceChild(frag, n);
      } else if (n.nodeType === 1) spezza(n);
    });
  })(h1);
  requestAnimationFrame(function () { setTimeout(function () { h1.classList.add('vista'); }, 150); });

  // 2. Rami: si disegnano quando entrano nello schermo
  var io = new IntersectionObserver(function (v) {
    v.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('vista'); io.unobserve(x.target); } });
  }, { threshold: 0.3 });
  document.querySelectorAll('.ramo').forEach(function (r) { io.observe(r); });

  // 3. Dove sei adesso: cambia pannello
  var fasi = document.querySelectorAll('.fase');
  var pannelli = document.querySelectorAll('.pannello');
  fasi.forEach(function (f) {
    f.addEventListener('click', function () {
      fasi.forEach(function (x) { x.classList.toggle('attiva', x === f); x.setAttribute('aria-selected', x === f); });
      pannelli.forEach(function (p) { p.hidden = p.dataset.i !== f.dataset.i; });
      var pianta = document.querySelector('.fasi-pianta');
      pianta.className = 'fasi-pianta fase-' + f.dataset.i;
    });
  });

  // 4. Due sguardi: avvicinando i cerchi compare Simona
  var cur = document.querySelector('.sguardi-cursore');
  var scena = document.querySelector('.sguardi-scena');
  var testo = document.querySelector('.sguardi-testo');
  var stato = '';
  function aggiorna() {
    var v = Number(cur.value);
    var largo = scena.offsetWidth < 500 ? 95 : 130;
    var d = largo * (1 - v / 100) + 34 * (v / 100); // da lontani a quasi sovrapposti
    scena.style.setProperty('--d', d + 'px');
    scena.style.setProperty('--s', 1);
    scena.style.setProperty('--p', (v / 100).toFixed(3));
    scena.classList.toggle('unite', v > 70);
    var nuovo = v < 35 ? 'o' : (v > 70 ? 'i' : 'n');
    if (nuovo !== stato) {
      stato = nuovo;
      testo.style.opacity = 0;
      setTimeout(function () { testo.textContent = testo.dataset[nuovo]; testo.style.opacity = 1; }, 200);
    }
  }
  cur.addEventListener('input', aggiorna);
  aggiorna();
  // al primo arrivo fa vedere da solo come funziona, poi lascia fare a te
  if (!calmo) {
    var giaVisto = false;
    new IntersectionObserver(function (v, o) {
      if (!v[0].isIntersecting || giaVisto) return;
      giaVisto = true; o.disconnect();
      var start = null, da = Number(cur.value);
      function passo(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / 2600);
        cur.value = da + (100 - da) * (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
        aggiorna();
        if (p < 1) requestAnimationFrame(passo);
      }
      setTimeout(function () { requestAnimationFrame(passo); }, 500);
    }, { threshold: 0.6 }).observe(scena);
  }

  // 5. Carte da girare; sul retro il tocco porta alla prenotazione
  document.querySelectorAll('.carta').forEach(function (c) {
    c.addEventListener('click', function () {
      if (c.getAttribute('aria-pressed') === 'true') { document.getElementById('prenota').scrollIntoView({ behavior: 'smooth' }); return; }
      document.querySelectorAll('.carta[aria-pressed="true"]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      c.setAttribute('aria-pressed', 'true');
    });
  });

  // 6. Foto della galleria: si muovono appena, a velocità diverse, mentre scorri
  if (!calmo) {
    var foto = document.querySelectorAll('.galleria .foto');
    var attesa = false;
    function muovi() {
      attesa = false;
      foto.forEach(function (f, i) {
        var r = f.getBoundingClientRect();
        var c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        f.style.transform = 'translateY(' + (c * (i % 2 ? -40 : 30)) + 'px) rotate(' + (c * (i % 2 ? 3 : -3)) + 'deg)';
      });
    }
    addEventListener('scroll', function () { if (!attesa) { attesa = true; requestAnimationFrame(muovi); } }, { passive: true });
    muovi();
  }

  // 7. Pulsante "magnetico": segue un poco il mouse (solo computer)
  var mag = document.querySelector('.btn-magnete');
  if (mag && matchMedia('(hover: hover)').matches && !calmo) {
    mag.addEventListener('mousemove', function (e) {
      var r = mag.getBoundingClientRect();
      mag.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .25 + 'px,' + (e.clientY - r.top - r.height / 2) * .35 + 'px)';
    });
    mag.addEventListener('mouseleave', function () { mag.style.transform = ''; });
  }

  // 8. Video di Instagram: il lettore ufficiale si carica solo quando lo chiedi
  document.querySelectorAll('.ig-guarda').forEach(function (b) {
    b.addEventListener('click', function () {
      var box = document.createElement('div');
      box.className = 'ig-video';
      box.innerHTML = '<blockquote class="instagram-media" data-instgrm-permalink="' + b.dataset.url + '" data-instgrm-version="14" style="margin:0;width:100%"></blockquote>';
      b.replaceWith(box);
      if (window.instgrm) { window.instgrm.Embeds.process(); return; }
      var s = document.createElement('script');
      s.src = 'https://www.instagram.com/embed.js'; s.async = true;
      document.body.appendChild(s);
    });
  });
})();

// La pianta parte dal seme quando la sezione entra nello schermo
(function () {
  var p = document.querySelector('.fasi-pianta');
  new IntersectionObserver(function (v, o) {
    if (!v[0].isIntersecting) return;
    o.disconnect();
    if (!/fase-/.test(p.className)) setTimeout(function () { p.classList.add('fase-0'); }, 300);
  }, { threshold: 0.4 }).observe(p);
})();
