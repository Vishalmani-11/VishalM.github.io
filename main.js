/**
 * Vishal Mani Portfolio - Main JavaScript
 * Handles data loading, rendering, and core functionality
 */

// DOM helpers
const $ = id => document.getElementById(id);
const create = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  el.append(...children.flat());
  return el;
};

// Constants
const LV = ['Easy', 'Medium', 'Hard', 'Insane'];
const DATA_PATH = 'data';

// ============================================
// Difficulty Bars
// ============================================
function difficultyBars(level) {
  const isHard = level > 2;
  return create('span', { class: `df ${isHard ? 'hd' : ''}` }, [
    create('span', { class: 'bars' }, 
      LV.map((_, i) => create('i', { class: i < level ? 'on' : '' }))
    ),
    LV[level - 1] || ''
  ]);
}

// ============================================
// Safe Render Wrapper
// ============================================
function safeRender(fn) {
  try { fn(); } catch (e) { console.error('Render error:', e.message); }
}

// ============================================
// Data Loading
// ============================================
let profileData, projectsData, writeupsData, achievementsData, githubData;

async function loadJSON(file) {
  try {
    const res = await fetch(`${DATA_PATH}/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Failed to load ${file}:`, e.message);
    return null;
  }
}

async function loadAllData() {
  const [p, pr, w, a, g] = await Promise.all([
    loadJSON('profile.json'),
    loadJSON('projects.json'),
    loadJSON('writeups.json'),
    loadJSON('achievements.json'),
    loadJSON('github.json')
  ]);
  profileData = p; projectsData = pr; writeupsData = w; achievementsData = a; githubData = g;
}

// ============================================
// Render Functions
// ============================================
function renderHero() {
  const tag = $('tagline');
  const footerTag = $('footer-tagline');
  if (tag && profileData?.tagline) tag.textContent = profileData.tagline;
  if (footerTag && profileData?.tagline) footerTag.textContent = profileData.tagline;
}

function renderAbout() {
  const bio = $('bio');
  if (bio && profileData?.bio) {
    const paragraphs = profileData.bio.split('\n').filter(p => p.trim());
    bio.replaceChildren(...paragraphs.map(p => {
      const el = create('p');
      el.textContent = p;
      return el;
    }));
  }

  const education = $('education');
  if (education && profileData?.education) {
    education.textContent = `${profileData.education.college || 'TODO'} | ${profileData.education.course || 'TODO'} | ${profileData.education.years || 'TODO'}`;
  }

  const location = $('location');
  if (location && profileData?.location) location.textContent = profileData.location;

  const languages = $('languages');
  if (languages && profileData?.languages?.length) languages.textContent = profileData.languages.join(', ');

  const interests = $('interests');
  if (interests && profileData?.interests?.length) interests.textContent = profileData.interests.join(', ');
}

function renderSkills() {
  const container = $('skills');
  if (!container || !profileData?.skills) return;

  container.replaceChildren(...Object.entries(profileData.skills).map(([group, items]) => {
    if (!items?.length) return null;
    return create('div', { class: 'skill-group' }, [
      create('h4', {}, group),
      create('div', { class: 'skill-chips' }, 
        items.map(item => create('span', { class: 'skill-chip' }, item))
      )
    ]);
  }).filter(Boolean));
}

function renderStats() {
  const container = $('stats');
  if (!container) return;

  const featuredCount = projectsData?.filter(p => p.featured && !p.sample).length || 0;
  const writeupCount = writeupsData?.filter(w => !w.sample)?.length || 0;
  const achievementCount = achievementsData?.filter(a => !a.sample)?.length || 0;
  const tech = new Set();
  projectsData?.filter(p => !p.sample).forEach(p => p.tags?.forEach(t => tech.add(t)));

  container.replaceChildren(...[
    [featuredCount, 'Featured projects'],
    [writeupCount, 'Writeups published'],
    [achievementCount, 'Achievements'],
    [tech.size, 'Technologies used']
  ].map(([n, l]) => create('div', {}, [
    create('b', {}, String(n)),
    create('span', {}, l)
  ])));

  const footerStats = $('footer-stats');
  if (footerStats) {
    footerStats.textContent = `${featuredCount} projects, ${writeupCount} writeups`;
  }
}

function renderProjects() {
  const featured = $('featured-projects');
  const moreList = $('more-repos-list');
  if (!featured) return;

  if (!projectsData) {
    featured.replaceChildren(create('div', { class: 'error-message' }, 'Failed to load projects.'));
    return;
  }

  const featuredProjects = projectsData.filter(p => p.featured && !p.sample);
  const otherRepos = projectsData.filter(p => !p.featured && !p.sample);

  featured.replaceChildren(...featuredProjects.map((p, i) => {
    const statusClass = p.status === 'Live' ? '' : 'soon';
    const title = p.title || p.repo || 'Untitled';

    return create('a', { 
      class: 'card',
      href: p.demo || (p.repo ? `https://github.com/vishalmani-11/${p.repo}` : '#')
    }, [
      create('div', { class: 'ct' }, [
        create('span', { class: 'n' }, String(i + 1).padStart(2, '0')),
        create('span', { class: `live ${statusClass}` }, [
          create('i', { class: 'led' }),
          p.status || 'Live'
        ])
      ]),
      create('h3', {}, title),
      create('p', {}, p.summary || p.description || 'No description'),
      create('div', { class: 'tags' }, (p.tags || []).map(tag => create('i', {}, tag))),
      create('div', { class: 'stt' }, [
        difficultyBars(p.difficulty || 1),
        create('span', {}, 'View on GitHub')
      ])
    ]);
  }));

  if (moreList && otherRepos.length > 0) {
    moreList.replaceChildren(...otherRepos.map(repo => {
      const title = repo.title || repo.repo || repo.name || 'Untitled';
      const ghRepo = githubData?.repos?.find(r => r.name === (repo.repo || repo.name));
      const merged = { ...repo, ...ghRepo };

      return create('div', { class: 'repo-item' }, [
        create('h4', {}, title),
        create('p', {}, merged.summary || merged.description || 'No description'),
        create('div', { class: 'stt' }, [
          create('span', {}, merged.language || ''),
          create('span', {}, `${merged.stargazers_count || 0} stars`)
        ])
      ]);
    }));
  }
}

function renderWriteups() {
  const container = $('writeups-list');
  if (!container) return;

  if (!writeupsData) {
    container.replaceChildren(create('div', { class: 'error-message' }, 'Failed to load writeups.'));
    return;
  }

  const latest = writeupsData.data?.filter(w => !w.sample)?.slice(0, 5) || [];
  if (latest.length === 0) {
    container.replaceChildren(create('div', { class: 'empty-state' }, [
      create('h3', {}, 'No writeups yet'),
      create('p', {}, 'Writeups will appear here')
    ]));
    return;
  }

  container.replaceChildren(...latest.map(w => {
    const date = w.date ? new Date(w.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown';
    const title = w.title || 'Untitled';

    return create('a', { 
      class: 'row',
      href: `writeup.html?slug=${w.slug}`
    }, [
      create('span', { class: 'd' }, date),
      create('div', {}, [
        create('b', {}, title),
        create('small', {}, w.summary || '')
      ]),
      create('span', { class: 'c' }, w.platform || w.category || 'Uncategorized'),
      difficultyBars(w.difficulty || 1)
    ]);
  }));
}

function renderRecentActivity() {
  const container = $('recent-activity');
  if (!container) return;

  if (!githubData?.recent?.length) {
    container.replaceChildren(create('div', { class: 'empty-state' }, [
      create('h3', {}, 'No recent activity'),
      create('p', {}, 'Activity will appear here after GitHub data is fetched')
    ]));
    return;
  }

  container.replaceChildren(...githubData.recent.map(a => {
    const date = a.date ? new Date(a.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown';
    return create('div', { class: 'row' }, [
      create('span', { class: 'd' }, date),
      create('div', {}, [
        create('b', {}, a.message || a.type || 'Activity'),
        create('small', {}, a.repo || '')
      ])
    ]);
  }));
}

function renderAchievements() {
  const container = $('achievements-list');
  if (!container) return;

  if (!achievementsData) {
    container.replaceChildren(create('div', { class: 'error-message' }, 'Failed to load achievements.'));
    return;
  }

  const validAchievements = achievementsData.filter(a => !a.sample);
  if (validAchievements.length === 0) {
    container.replaceChildren(create('div', { class: 'empty-state' }, [
      create('h3', {}, 'No achievements yet'),
      create('p', {}, 'Achievements will appear here')
    ]));
    return;
  }

  container.replaceChildren(...validAchievements.map(a => {
    const link = a.link ? create('a', { href: a.link, target: '_blank', rel: 'noopener noreferrer' }, a.title) : create('b', {}, a.title);
    return create('div', { class: 'op' }, [
      create('span', { class: 'y' }, a.year || '???'),
      link,
      create('span', {}, a.detail || '')
    ]);
  }));
}

function renderContact() {
  const emailBtn = $('email-btn');
  const linkedinBtn = $('linkedin-btn');
  const resumeBtn = $('resume-btn');
  const footerGithub = $('footer-github');
  const footerLinkedin = $('footer-linkedin');
  const footerEmail = $('footer-email');

  if (emailBtn && profileData?.email) {
    emailBtn.href = `mailto:${profileData.email}`;
    emailBtn.textContent = 'Email me';
  } else if (emailBtn) {
    emailBtn.href = '#';
    emailBtn.textContent = 'Email';
  }

  if (linkedinBtn && profileData?.linkedin) {
    linkedinBtn.href = profileData.linkedin;
    linkedinBtn.textContent = 'LinkedIn';
  } else if (linkedinBtn) {
    linkedinBtn.href = '#';
    linkedinBtn.textContent = 'LinkedIn';
  }

  if (resumeBtn && profileData?.resume) {
    resumeBtn.href = profileData.resume;
    resumeBtn.hidden = false;
  }

  if (footerGithub) {
    footerGithub.href = profileData?.github || 'https://github.com/vishalmani-11';
    footerGithub.textContent = 'GitHub';
  }

  if (footerLinkedin) {
    footerLinkedin.href = profileData?.linkedin || '#';
    footerLinkedin.textContent = 'LinkedIn';
  }

  if (footerEmail) {
    footerEmail.href = profileData?.email ? `mailto:${profileData.email}` : '#';
    footerEmail.textContent = 'Email';
  }
}

function toggleMoreRepos() {
  const list = $('more-repos-list');
  const btn = list?.previousElementSibling;
  if (list) {
    list.hidden = !list.hidden;
    if (btn) btn.textContent = list.hidden ? 'More repositories' : 'Hide repositories';
  }
}

// ============================================
// Network Canvas
// ============================================
function initNetworkCanvas() {
  const canvas = document.getElementById('net');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W = canvas.width, H = canvas.height, points = [];
  let rafId = null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    points = Array.from({ length: Math.min(70, Math.floor(W / 16)) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    points.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    });

    const cg = getComputedStyle(document.documentElement).getPropertyValue('--g').trim();
    const cr = getComputedStyle(document.documentElement).getPropertyValue('--r').trim();

    points.forEach((a, i) => {
      for (let j = i + 1; j < points.length; j++) {
        const b = points[j], d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d < 15000) {
          ctx.globalAlpha = 0.25 * (1 - d / 15000);
          ctx.strokeStyle = cg;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = i % 9 ? 0.7 : 1;
      ctx.fillStyle = i % 9 ? cg : cr;
      const s = i % 9 ? 2 : 3;
      ctx.fillRect(a.x - s/2, a.y - s/2, s, s);
    });

    if (!reducedMotion) rafId = requestAnimationFrame(draw);
  }

  window.redraw = () => {
    if (rafId) cancelAnimationFrame(rafId);
    draw();
  };

  resize(); draw();
  window.addEventListener('resize', () => { resize(); if (reducedMotion) redraw(); });
}

// ============================================
// Scroll Spy
// ============================================
function initScrollSpy() {
  const sections = ['top', 'about', 'projects', 'writeups', 'activity', 'achievements', 'contact'];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        document.querySelectorAll('.item[data-s]').forEach(item => {
          item.classList.toggle('on', item.dataset.s === e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(id => {
    const el = $(id);
    if (el) io.observe(el);
  });
}

// ============================================
// Initialize
// ============================================
async function init() {
  try {
    await loadAllData();
    safeRender(renderHero);
    safeRender(renderAbout);
    safeRender(renderSkills);
    safeRender(renderStats);
    safeRender(renderProjects);
    safeRender(renderWriteups);
    safeRender(renderRecentActivity);
    safeRender(renderAchievements);
    safeRender(renderContact);
    initScrollSpy();
    initNetworkCanvas();
  } catch (e) {
    console.error('Initialization error:', e.message);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
