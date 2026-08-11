import './slides.css';
import {
  createIcons,
  ArrowRight,
  Award,
  Bot,
  Cpu,
  GitCommitHorizontal,
  Layers,
  ShieldCheck,
  Terminal,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from 'lucide';

// Icons referenced by data-lucide in the slide fragments. Add new ones here
// when a slide starts using an icon that isn't listed yet.
const icons = {
  ArrowRight,
  Award,
  Bot,
  Cpu,
  GitCommitHorizontal,
  Layers,
  ShieldCheck,
  Terminal,
  TrendingUp,
  Users,
  Wrench,
  Zap,
};

// Slides are plain HTML fragments in src/slides/, ordered by filename.
const modules = import.meta.glob('./slides/*.html', { query: '?raw', import: 'default', eager: true });
const deck = Object.keys(modules)
  .sort()
  .map((path) => modules[path]);

const slideEl = document.getElementById('slide');
const counterEl = document.getElementById('counter');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let current = Math.min(Math.max(Number(location.hash.slice(1)) || 1, 1), deck.length) - 1;

function render() {
  slideEl.innerHTML = deck[current];
  slideEl.classList.remove('slide-enter');
  void slideEl.offsetWidth; // restart the enter animation
  slideEl.classList.add('slide-enter');

  createIcons({ icons });

  const label = `Slide ${current + 1} / ${deck.length}`;
  slideEl.querySelectorAll('[data-slide-counter]').forEach((el) => {
    el.textContent = label;
  });

  counterEl.textContent = `${current + 1} / ${deck.length}`;
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === deck.length - 1;
  history.replaceState(null, '', `#${current + 1}`);
}

function go(delta) {
  const next = current + delta;
  if (next < 0 || next >= deck.length) return;
  current = next;
  render();
}

prevBtn.addEventListener('click', () => go(-1));
nextBtn.addEventListener('click', () => go(1));

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
    e.preventDefault();
    go(1);
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    go(-1);
  } else if (e.key === 'f' || e.key === 'F') {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  }
});

render();
