/* ══════════════════════════════════════════════
   NgopiBE — Main JavaScript
   Author: NgopiBE Dev Team
══════════════════════════════════════════════ */

'use strict';

/* ── UTILITY ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ══════════════════════════════════════════════
   1. CURSOR GLOW & HERO PARALLAX
══════════════════════════════════════════════ */
const cursorGlow = $('#cursor-glow');
const heroCharWrap = $('#hero-char-wrap');
const heroTitleWrap = $('#hero-main-title');

document.addEventListener('mousemove', e => {
  if (cursorGlow) {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top  = e.clientY + 'px';
  }
  
  if (window.innerWidth > 768) {
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    
    if (heroCharWrap) heroCharWrap.style.transform = `translateX(-50%) translate(${x * -1}px, ${y * -1}px)`;
    if (heroTitleWrap) heroTitleWrap.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
  } else {
    if (heroCharWrap) heroCharWrap.style.transform = `translateX(-50%)`;
    if (heroTitleWrap) heroTitleWrap.style.transform = '';
  }
});

/* ══════════════════════════════════════════════
   2. PARTICLE SYSTEM
══════════════════════════════════════════════ */
function initParticles() {
  const container = $('#particles-container');
  if (!container) return;
  const PARTICLE_COUNT = 28;
  const colors = ['#34d399', '#10b981', '#f59e0b', '#6ee7b7', '#fbbf24'];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const delay = Math.random() * 18;
    const dur = Math.random() * 15 + 12;
    const left = Math.random() * 100;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      background:${color};
      left:${left}%;
      animation-duration:${dur}s;
      animation-delay:${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color};
    `;
    container.appendChild(p);
  }
}
initParticles();

/* ══════════════════════════════════════════════
   3. NAVBAR SCROLL EFFECT
══════════════════════════════════════════════ */
function initNavbar() {
  const nav = $('#navbar');
  const links = $$('.nav-link');
  const sections = $$('section[id]');
  const toggle = $('#nav-toggle-btn');
  const navLinksList = $('#nav-links-list');

  // Scrolled class
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);

    // Active link highlight
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
    });
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === '#' + current);
    });

    // Back to top
    const btn = $('#back-to-top');
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // Mobile toggle
  if (toggle && navLinksList) {
    toggle.addEventListener('click', () => {
      const open = navLinksList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    // Close on link click
    links.forEach(l => l.addEventListener('click', () => {
      navLinksList.classList.remove('open');
      toggle.setAttribute('aria-expanded', false);
    }));
  }
}
initNavbar();

/* ══════════════════════════════════════════════
   4. HERO COUNTER ANIMATION
══════════════════════════════════════════════ */
function animateCounters() {
  // Target both new hero bar counters and any legacy stat-number
  const counters = $$('.hbb-num[data-target], .stat-number[data-target]');
  counters.forEach(el => {
    const target = +el.dataset.target;
    if (!target) return;
    const duration = 1800;
    const step = target / (duration / 16);
    let current = 0;
    const update = () => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current);
      if (current < target) requestAnimationFrame(update);
      else el.textContent = target;
    };
    setTimeout(update, 1400);
  });
}

/* ══════════════════════════════════════════════
   5. SCROLL REVEAL
══════════════════════════════════════════════ */
function initScrollReveal() {
  const revealEls = [
    '.about-card', '.founder-card', '.member-card', '.gh-feature',
    '.sched-day', '.gallery-item', '.about-quote-block',
    '#gh-image-wrap', '#gh-info', '#about-title', '#founders-title',
    '#members-title', '#gh-title', '#schedule-title', '#gallery-title',
  ];

  revealEls.forEach(sel => {
    $$(sel).forEach((el, i) => {
      el.classList.add('reveal');
      if (i > 0 && i <= 3) el.classList.add(`reveal-delay-${i}`);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  $$('.reveal').forEach(el => observer.observe(el));
}
initScrollReveal();

/* ══════════════════════════════════════════════
   6. MEMBERS DATA & RENDER
══════════════════════════════════════════════ */
async function renderMembers() {
  const grid = $('#members-grid');
  
  try {
    const res = await fetch('assets/data/members.json');
    const data = await res.json();
    const membersData = data.members || [];

    // Update Hero Member Count dynamically
    const heroMemberCount = $('#hero-member-count');
    if (heroMemberCount) {
      heroMemberCount.dataset.target = membersData.length;
    }
    // Call animation after target is set
    animateCounters();

    if (!grid) return;
  grid.innerHTML = membersData.map((m, i) => `
    <div class="member-card reveal reveal-delay-${(i % 3) + 1}" id="member-card-${i + 1}" style="transition-delay:${i * 0.05}s">
      <div class="member-avatar">${m.emoji}</div>
      <div class="member-name">${m.name}</div>
      <div class="member-ign">${m.ign}</div>
      <div class="member-game">${m.game}</div>
      <span class="member-status ${m.online ? '' : 'offline'}" title="${m.online ? 'Online' : 'Offline'}"></span>
    </div>
  `).join('');
  // Re-observe new elements
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  $$('#members-grid .reveal').forEach(el => observer.observe(el));
  } catch (error) {
    console.error("Gagal load members data:", error);
    if (!grid) return;
    grid.innerHTML = '<div style="color:red;">Gagal memuat data member. Pastikan file members.json tersedia.</div>';
  }
}
renderMembers();

/* ══════════════════════════════════════════════
   7. SCHEDULE RENDER
══════════════════════════════════════════════ */
async function renderSchedule() {
  const container = $('#schedule-week');
  if (!container) return;

  try {
    const res = await fetch('assets/data/schedule.json');
    const data = await res.json();
    const scheduleData = data.schedule || [];

    const today = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  // Map our schedule order: index 0=Mon ... 5=Sat, 6=Sun
  const todayIdx = today === 0 ? 6 : today - 1;

  container.innerHTML = scheduleData.map((d, i) => `
    <div class="sched-day ${i === todayIdx ? 'today' : ''} reveal" id="sched-day-${i + 1}" style="transition-delay:${i * 0.08}s">
      <div class="sched-day-name">${d.short}</div>
      <div class="sched-events">
        ${d.events.map(ev => `
          <div class="sched-event ${ev.type}">
            <div class="sched-time">${ev.time}</div>
            ${ev.label}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.1 });
  $$('#schedule-week .reveal').forEach(el => observer.observe(el));
  } catch (error) {
    console.error("Gagal load schedule data:", error);
    container.innerHTML = '<div style="color:red;">Gagal memuat data jadwal. Pastikan file schedule.json tersedia.</div>';
  }
}
renderSchedule();

/* ══════════════════════════════════════════════
   8. GAMING HOUSE RENDER
══════════════════════════════════════════════ */
async function renderGamingHouse() {
  const ghName = $('#gh-name');
  const ghAddress = $('#gh-address');
  const featuresContainer = $('#gh-features-container');
  const hoursContainer = $('#gh-hours-container');

  if (!ghName || !ghAddress || !featuresContainer || !hoursContainer) return;

  try {
    const res = await fetch('assets/data/gaming_house.json');
    const ghData = await res.json();

    ghName.textContent = ghData.name || 'GH NgopiBE HQ';
    ghAddress.textContent = ghData.address || '';

    if (ghData.features) {
      featuresContainer.innerHTML = ghData.features.map((feat, i) => `
        <div class="gh-feature" id="gh-feat-${i + 1}">
          <span class="feature-icon">${feat.icon}</span>
          <div>
            <strong>${feat.title}</strong>
            <span>${feat.desc}</span>
          </div>
        </div>
      `).join('');
    }

    if (ghData.hours) {
      hoursContainer.innerHTML = ghData.hours.map(hour => `
        <div class="hours-item">
          <span>${hour.day}</span>
          <span class="hours-time">${hour.time}</span>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error("Gagal load gaming house data:", error);
  }
}
renderGamingHouse();

/* ══════════════════════════════════════════════
   9. GALLERY RENDER
══════════════════════════════════════════════ */
async function renderGallery() {
  const grid = $('#gallery-grid');
  if (!grid) return;

  try {
    const res = await fetch('assets/data/gallery.json');
    const data = await res.json();
    const galleryItems = data.gallery || [];

    grid.innerHTML = galleryItems.map((item, i) => `
      <div class="gallery-item ${item.cls || ''} reveal" id="gallery-item-${i + 1}" style="transition-delay:${i * 0.08}s">
        ${item.src
          ? `<img src="${item.src}" alt="${item.label}" class="gallery-img" loading="lazy" />`
          : `<div class="gallery-placeholder">${item.emoji || ''}<span style="font-size:0.75rem;color:#7b90a8;">${item.label}</span></div>`
        }
        <div class="gallery-overlay">
          <div class="gallery-label">${item.emoji || ''} ${item.label}</div>
          <div class="gallery-sub">${item.sub}</div>
        </div>
      </div>
    `).join('');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
    }, { threshold: 0.08 });
    $$('#gallery-grid .reveal').forEach(el => observer.observe(el));
  } catch (error) {
    console.error("Gagal load gallery data:", error);
  }
}
renderGallery();

/* ══════════════════════════════════════════════
   9. BACK TO TOP
══════════════════════════════════════════════ */
const backBtn = $('#back-to-top');
if (backBtn) {
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ══════════════════════════════════════════════
   10. JOIN TOAST
══════════════════════════════════════════════ */
function showToast(message) {
  const toast = $('#toast-notification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

const joinBtn = $('#join-submit-btn');
const joinInput = $('#join-name-input');
if (joinBtn && joinInput) {
  joinBtn.addEventListener('click', () => {
    const name = joinInput.value.trim();
    if (!name) {
      showToast('⚠️ Masukkan username kamu dulu bro!');
      return;
    }
    showToast(`✅ ${name} berhasil daftar ke NgopiBE! Siap nongkrong 🔥`);
    joinInput.value = '';
  });
  joinInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') joinBtn.click();
  });
}

/* ══════════════════════════════════════════════
   11. SMOOTH HOVER TILT (founder cards)
══════════════════════════════════════════════ */
function initTilt() {
  $$('.founder-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
initTilt();

/* ══════════════════════════════════════════════
   12. ACTIVE NAV LINK ON CLICK
══════════════════════════════════════════════ */
$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    $$('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

/* ══════════════════════════════════════════════
   13. GALLERY ITEM CLICK (LIGHTBOX)
══════════════════════════════════════════════ */
const lightbox = $('#lightbox-modal');
const lightboxImg = $('#lightbox-img');
const lightboxClose = $('.lightbox-close');

if (lightbox && lightboxImg && lightboxClose) {
  // Show lightbox when clicking a gallery item
  document.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;

    // Check if the item contains an actual image
    const img = item.querySelector('img.gallery-img');
    if (img) {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || 'Gallery Image';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    } else {
      // If no image (just emoji), just show toast like before
      const label = item.querySelector('.gallery-label');
      if (label) showToast(`📸 ${label.textContent.trim()}`);
    }
  });

  // Close lightbox when clicking the X button
  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    // Clear image source after animation to prevent flashing old image next time
    setTimeout(() => { lightboxImg.src = ''; }, 300);
  });

  // Close lightbox when clicking outside the image
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 300);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 300);
    }
  });
}

/* ══════════════════════════════════════════════
   14. GLITCH EFFECT ON LOGO
══════════════════════════════════════════════ */
const logo = $('#nav-logo-link');
if (logo) {
  logo.addEventListener('mouseenter', () => {
    logo.style.textShadow = '2px 0 #34d399, -2px 0 #f59e0b';
    setTimeout(() => logo.style.textShadow = '', 300);
  });
}

/* ══════════════════════════════════════════════
   15. PAGE LOAD ANIMATION
══════════════════════════════════════════════ */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

console.log('%c☕ NgopiBE — Ngopi, Gaming, Nongkrong! 🔥', 'background:#080c10;color:#34d399;font-size:16px;font-weight:bold;padding:8px 16px;border-radius:8px;border:1px solid #34d399;');

/* ══════════════════════════════════════════════
   16. DISCORD REAL-TIME STATS
══════════════════════════════════════════════ */
async function fetchDiscordStats() {
  const memberEl = $('#dc-members');
  const onlineEl = $('#dc-online');
  if (!memberEl || !onlineEl) return;

  try {
    // Discord invite code from your link
    const inviteCode = 'YMsmjPGB'; 
    const response = await fetch(`https://discord.com/api/invites/${inviteCode}?with_counts=true`);
    const data = await response.json();

    if (data.approximate_member_count !== undefined) {
      memberEl.textContent = data.approximate_member_count;
    }
    if (data.approximate_presence_count !== undefined) {
      onlineEl.innerHTML = `🟢 ${data.approximate_presence_count}`;
    }
  } catch (error) {
    console.error("Gagal mengambil data Discord:", error);
  }
}

document.addEventListener('DOMContentLoaded', fetchDiscordStats);
