/* ================================================================
   НАСТРОЙКИ — поменяй под себя ❤
   ================================================================ */
const CONFIG = {
  // Имя любимой (показывается на главном экране)
  name: 'Любимая',

  // Дата начала ваших отношений: год, месяц (1-12), день
  relationshipStart: new Date(2025, 5, 11),

  // Фразы, которые печатаются на главном экране
  typedPhrases: [
    'Ты — лучшее, что случилось со мной ❤',
    'С тобой каждый день — праздник',
    'Сегодня твой день, и он особенный ✨',
    'Я так счастлив, что ты есть',
  ],

  // Текст письма
  letterText: `Моя дорогая!

С днём рождения тебя! 🎂

Каждый день рядом с тобой — это подарок. Ты наполняешь мою жизнь смыслом, теплом и светом. Твоя улыбка лечит любую усталость, а твой голос — самая любимая мелодия.

Я хочу, чтобы в этот день ты знала: ты самая красивая, самая добрая и самая невероятная. Пусть все твои мечты сбываются, а я всегда буду рядом, чтобы помогать им сбываться.

Спасибо, что ты есть. Спасибо, что ты со мной.`,
};

/* ================================================================
   ПРЕЛОАДЕР + АВТОЗАПУСК МУЗЫКИ
   ================================================================ */
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  const preloaderText = document.getElementById('preloader-text');

  setTimeout(() => {
    // Пробуем запустить музыку сразу при заходе
    music.start().then((started) => {
      if (started) {
        preloader.classList.add('done');
      } else {
        // Автозапуск заблокирован браузером — просим один тап
        preloader.classList.add('ready');
        preloaderText.textContent = 'Нажми на сердечко ❤';
        preloader.addEventListener('click', () => {
          music.start();
          preloader.classList.add('done');
        }, { once: true });
      }
    });
  }, 900);
});

/* ================================================================
   ИМЯ И ГОД
   ================================================================ */
document.getElementById('hero-name').textContent = CONFIG.name;
document.getElementById('year').textContent = new Date().getFullYear();

/* ================================================================
   ПЕЧАТАЮЩИЙСЯ ТЕКСТ
   ================================================================ */
(function typewriter() {
  const el = document.getElementById('typed-text');
  let phraseIdx = 0, charIdx = 0, deleting = false;

  function tick() {
    const phrase = CONFIG.typedPhrases[phraseIdx];
    if (!deleting) {
      charIdx++;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === phrase.length) {
        deleting = true;
        setTimeout(tick, 2200);
        return;
      }
      setTimeout(tick, 65);
    } else {
      charIdx--;
      el.textContent = phrase.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % CONFIG.typedPhrases.length;
        setTimeout(tick, 500);
        return;
      }
      setTimeout(tick, 30);
    }
  }
  setTimeout(tick, 1500);
})();

/* ================================================================
   СЧЁТЧИК ВРЕМЕНИ ВМЕСТЕ
   ================================================================ */
(function counter() {
  const days = document.getElementById('cnt-days');
  const hours = document.getElementById('cnt-hours');
  const minutes = document.getElementById('cnt-minutes');
  const seconds = document.getElementById('cnt-seconds');

  function update() {
    let diff = Math.max(0, Date.now() - CONFIG.relationshipStart.getTime());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;
    days.textContent = d.toLocaleString('ru-RU');
    hours.textContent = h;
    minutes.textContent = m;
    seconds.textContent = s;
  }
  update();
  setInterval(update, 1000);
})();

/* ================================================================
   ПОЯВЛЕНИЕ СЕКЦИЙ ПРИ СКРОЛЛЕ
   ================================================================ */
const observer = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

/* ================================================================
   ЛЕТАЮЩИЕ СЕРДЕЧКИ (фон)
   ================================================================ */
(function heartsBackground() {
  const canvas = document.getElementById('hearts-canvas');
  const ctx = canvas.getContext('2d');
  let hearts = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function spawn() {
    hearts.push({
      x: Math.random() * canvas.width,
      y: canvas.height + 30,
      size: 8 + Math.random() * 16,
      speed: 0.4 + Math.random() * 1.1,
      drift: (Math.random() - 0.5) * 0.6,
      alpha: 0.15 + Math.random() * 0.4,
      wobble: Math.random() * Math.PI * 2,
    });
  }

  function drawHeart(x, y, size, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 30, size / 30);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ff6b9d';
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-15, -8, -8, -20, 0, -10);
    ctx.bezierCurveTo(8, -20, 15, -8, 0, 10);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (hearts.length < 26 && Math.random() < 0.12) spawn();
    hearts.forEach((h) => {
      h.y -= h.speed;
      h.wobble += 0.02;
      h.x += h.drift + Math.sin(h.wobble) * 0.4;
      drawHeart(h.x, h.y, h.size, h.alpha);
    });
    hearts = hearts.filter((h) => h.y > -40);
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ================================================================
   ФОНОВАЯ МУЗЫКА
   ================================================================ */
const music = (function () {
  const audio = document.getElementById('bg-music');
  const btn = document.getElementById('music-btn');
  audio.volume = 0.6;
  let userPaused = false;

  function updateBtn() {
    btn.classList.toggle('playing', !audio.paused);
    btn.classList.toggle('paused', audio.paused);
  }

  function play() {
    return audio.play().then(() => { updateBtn(); return true; }).catch(() => false);
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (audio.paused) {
      userPaused = false;
      play();
    } else {
      userPaused = true;
      audio.pause();
      updateBtn();
    }
  });

  // Браузеры блокируют автозапуск звука — стартуем при первом клике по странице
  function firstInteraction(e) {
    // Не стартуем музыку, если первый клик открыл видео
    if (e.target.closest('.gallery-item[data-type="video"], .lightbox')) return;
    if (audio.paused && !userPaused) play();
    document.removeEventListener('click', firstInteraction);
  }
  document.addEventListener('click', firstInteraction);

  audio.addEventListener('play', updateBtn);
  audio.addEventListener('pause', updateBtn);
  updateBtn();

  return {
    // Приглушаем на время просмотра видео и возвращаем обратно
    duck() { if (!audio.paused) audio.pause(); },
    unduck() { if (!userPaused) play(); },
    start: play, // возвращает Promise<boolean> — удалось ли запустить
  };
})();

/* ================================================================
   ГАЛЕРЕЯ + ЛАЙТБОКС
   ================================================================ */
(function gallery() {
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightbox-content');
  const closeBtn = document.getElementById('lightbox-close');

  document.querySelectorAll('.gallery-item').forEach((item) => {
    const media = item.querySelector('img, video');

    // Превью видео проигрывается при наведении
    if (item.dataset.type === 'video') {
      item.addEventListener('mouseenter', () => media.play().catch(() => {}));
      item.addEventListener('mouseleave', () => { media.pause(); media.currentTime = 0; });
    }

    item.addEventListener('click', () => {
      content.innerHTML = '';
      if (item.dataset.type === 'video') {
        music.duck();
        const v = document.createElement('video');
        v.src = media.src;
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        content.appendChild(v);
      } else {
        const img = document.createElement('img');
        img.src = media.src;
        img.alt = media.alt || '';
        content.appendChild(img);
      }
      lightbox.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  });

  function close() {
    const hadVideo = content.querySelector('video');
    lightbox.classList.add('hidden');
    content.innerHTML = '';
    document.body.style.overflow = '';
    if (hadVideo) music.unduck();
  }
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

/* ================================================================
   ПИСЬМО В КОНВЕРТЕ
   ================================================================ */
(function letter() {
  const envelope = document.getElementById('envelope');
  const letterEl = document.getElementById('letter');
  const textEl = document.getElementById('letter-text');
  let opened = false;

  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    envelope.classList.add('open');

    setTimeout(() => {
      letterEl.classList.remove('hidden');
      // Печатаем письмо по буквам
      let i = 0;
      (function type() {
        if (i <= CONFIG.letterText.length) {
          textEl.textContent = CONFIG.letterText.slice(0, i);
          i += 2;
          setTimeout(type, 18);
        }
      })();
      letterEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 650);
  });
})();

/* ================================================================
   КОНФЕТТИ
   ================================================================ */
const confetti = (function () {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let running = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#ff6b9d', '#ffd166', '#c86bff', '#6bd5ff', '#ff8fb3', '#fff'];

  function burst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 5 + Math.random() * 7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        life: 1,
        decay: 0.006 + Math.random() * 0.008,
        isHeart: Math.random() < 0.25,
      });
    }
    if (!running) { running = true; loop(); }
  }

  function drawHeart(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(p.size / 24, p.size / 24);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-12, -6, -6, -16, 0, -8);
    ctx.bezierCurveTo(6, -16, 12, -6, 0, 8);
    ctx.fill();
    ctx.restore();
  }

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.18;         // гравитация
      p.vx *= 0.99;
      p.rotation += p.rotSpeed;
      p.life -= p.decay;
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.isHeart) {
        drawHeart(p);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
    });
    ctx.globalAlpha = 1;
    particles = particles.filter((p) => p.life > 0 && p.y < canvas.height + 60);
    if (particles.length > 0) {
      requestAnimationFrame(loop);
    } else {
      running = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { burst };
})();

/* ================================================================
   ФИНАЛЬНАЯ КНОПКА
   ================================================================ */
(function finale() {
  const btn = document.getElementById('celebrate-btn');
  const msg = document.getElementById('final-msg');

  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    confetti.burst(x, y, 140);
    setTimeout(() => confetti.burst(window.innerWidth * 0.25, window.innerHeight * 0.3, 90), 250);
    setTimeout(() => confetti.burst(window.innerWidth * 0.75, window.innerHeight * 0.3, 90), 500);

    msg.classList.remove('hidden');
    btn.textContent = 'Ещё раз! 🎉';
  });
})();
