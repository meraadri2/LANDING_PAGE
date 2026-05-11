// Cursor Personalizado 
const cursor = document.getElementById('cursor');

document.addEventListener('mousemove', function(e) {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button, .tick, .gnav-item, .game-card').forEach(function(el) {
  el.addEventListener('mouseenter', function() { cursor.classList.add('hover'); });
  el.addEventListener('mouseleave', function() { cursor.classList.remove('hover'); });
});

// Se pausa la animación del ticker al hacer hover sobre un tick para facilitar la lectura
var tickerTrack = document.getElementById('tickerTrack');
var ticks = tickerTrack.querySelectorAll('.tick');

ticks.forEach(function(tick) {
  tick.addEventListener('mouseenter', function() {
    tickerTrack.style.animationPlayState = 'paused';
  });
  tick.addEventListener('mouseleave', function() {
    tickerTrack.style.animationPlayState = 'running';
  });
});

// Barra de navegacion de movil
var navToggle = document.getElementById('navToggle');
var navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', function() {
  navLinks.classList.toggle('open');
});

// Movil: al hacer click en un enlace, se cierra el menu
navLinks.querySelectorAll('a').forEach(function(link) {
  link.addEventListener('click', function() {
    navLinks.classList.remove('open');
  });
});

// Efecto de scroll en la barra de navegación
window.addEventListener('scroll', function() {
  var navbar = document.getElementById('navbar');
  if (window.scrollY > 60) {
    navbar.style.background = 'rgba(13,13,20,0.98)';
  } else {
    navbar.style.background = 'rgba(13,13,20,0.9)';
  }
});

// Scroll reveal para secciones
var revealEls = document.querySelectorAll('.reveal');

var revealObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(function(el) {
  revealObs.observe(el);
});

// Secciones de juegos SYNC
var gameCards = document.querySelectorAll('.game-card');
var gnavItems = document.querySelectorAll('.gnav-item');
var progressFill = document.getElementById('progressFill');

var syncObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(entry) {
    if (entry.isIntersecting) {
      var game = entry.target.dataset.game;

      gnavItems.forEach(function(n) { n.classList.remove('active'); });

      var activeNav = document.querySelector('.gnav-item[data-game="' + game + '"]');
      if (activeNav) activeNav.classList.add('active');

      var cards = Array.from(gameCards);
      var idx = cards.indexOf(entry.target);
      var pct = ((idx + 1) / cards.length) * 100;
      progressFill.style.height = pct + '%';
    }
  });
}, { threshold: 0.4, rootMargin: '-10% 0px -10% 0px' });

gameCards.forEach(function(card) {
  syncObs.observe(card);
});

// Al hacer click en un enlace de la barra de navegación, se hace scroll suave a la sección correspondiente
gnavItems.forEach(function(item) {
  item.addEventListener('click', function() {
    var game = item.dataset.game;
    var target = document.querySelector('.game-card[data-game="' + game + '"]');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});

// Carga de torneos desde API
function loadTournaments() {
  fetch('/api/tournaments')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var grid = document.getElementById('tournamentsGrid');
      var select = document.getElementById('tournamentSelect');

      grid.innerHTML = '';

      // Mantener solo la primera opción del select
      while (select.options.length > 1) {
        select.remove(1);
      }

      data.forEach(function(t) {
        var pct = Math.round((t.registered / t.slots) * 100);

        var card = document.createElement('div');
        card.className = 't-card';
        card.innerHTML = '<div class="t-card-game">' + t.game + '</div>' +
          '<div class="t-card-name">' + t.name + '</div>' +
          '<div class="t-card-info">' +
            '<span>📅 ' + t.date + '</span>' +
            '<span>👥 ' + t.registered + '/' + t.slots + ' plazas</span>' +
          '</div>' +
          '<div class="t-card-slots"><div class="t-card-slots-fill" style="width:' + pct + '%"></div></div>' +
          '<div class="t-card-prize">' + t.prize + '</div>';
        grid.appendChild(card);

        if (t.registered < t.slots) {
          var option = document.createElement('option');
          option.value = t.id;
          option.textContent = t.game + ' — ' + t.name + ' (' + t.prize + ')';
          select.appendChild(option);
        }
      });
    })
    .catch(function() {
      document.getElementById('tournamentsGrid').innerHTML = '<p class="loading-text">Error al cargar torneos.</p>';
    });
}

loadTournaments();

// Registro a torneos
document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var name = document.getElementById('playerName').value.trim();
  var email = document.getElementById('playerEmail').value.trim();
  var tournamentId = document.getElementById('tournamentSelect').value;
  var msgEl = document.getElementById('formMsg');

  if (!name || !email || !tournamentId) {
    msgEl.className = 'form-msg error';
    msgEl.textContent = 'Por favor, rellena todos los campos.';
    return;
  }

  fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: name, email: email, tournamentId: parseInt(tournamentId) })
  })
    .then(function(res) {
      return res.json().then(function(data) {
        return { ok: res.ok, data: data };
      });
    })
    .then(function(result) {
      if (result.ok) {
        msgEl.className = 'form-msg success';
        msgEl.textContent = '✅ ' + result.data.message;
        document.getElementById('registerForm').reset();
        loadTournaments();
      } else {
        msgEl.className = 'form-msg error';
        msgEl.textContent = '❌ ' + result.data.error;
      }
    })
    .catch(function() {
      msgEl.className = 'form-msg error';
      msgEl.textContent = '❌ Error de conexión. Inténtalo de nuevo.';
    });
});