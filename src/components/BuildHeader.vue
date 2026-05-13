<template>
  <header class="build-header">
    <div class="header-left">
      <div class="logo">
        <!-- Essaie logo.png en priorité, fallback sur logo.svg -->
        <img
          :src="logoSrc"
          alt="Logo guilde"
          class="logo-img"
          @error="onLogoError"
          v-if="!logoFailed"
        />
        <!-- Fallback texte si logo absent -->
        <div v-else class="logo-fallback">
          <span class="logo-wolf">🐺</span>
        </div>
        <div class="logo-text">
          <span class="logo-main">SAO</span><span class="logo-sub">MC</span>
          <span class="logo-tag">Builder</span>
        </div>
      </div>
    </div>

    <div class="header-center">
      <input
        v-model="buildStore.buildName"
        class="build-name-input"
        maxlength="40"
        placeholder="Nom du build..."
      />
    </div>

    <div class="header-right">
      <button class="action-btn share-btn" @click="shareBuild">
        <span>🔗</span>
        <span class="btn-label">Partager</span>
      </button>
      <RouterLink to="/admin" class="action-btn admin-btn">
        <span>⚙</span>
        <span class="btn-label">Admin</span>
      </RouterLink>
      <button class="action-btn theme-btn" @click="toggleTheme" :title="isDark ? 'Thème clair' : 'Thème sombre'">
        <span>{{ isDark ? '☀️' : '🌙' }}</span>
        <span class="btn-label">{{ isDark ? 'Clair' : 'Sombre' }}</span>
      </button>
      <button class="action-btn reset-btn" @click="confirmReset">
        <span>↺</span>
        <span class="btn-label">Reset</span>
      </button>
    </div>

    <Transition name="toast-anim">
      <div v-if="shareToast" class="toast">✅ Lien copié dans le presse-papier !</div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useBuildStore } from '@/stores/buildStore'

const buildStore = useBuildStore()
const shareToast = ref(false)
const logoFailed = ref(false)
const logoSrc = ref('/logo.png')
const isDark = ref(document.documentElement.getAttribute('data-theme') !== 'light')

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

function onLogoError() {
  if (logoSrc.value === '/logo.png') {
    logoSrc.value = '/logo.svg'
  } else {
    logoFailed.value = true
  }
}

function shareBuild() {
  const code = buildStore.exportBuild()
  // Hash history : l'URL correcte est /#/?build=xxx (pas /?build=xxx)
  const url = `${window.location.origin}${window.location.pathname}#/?build=${code}`
  copyToClipboard(url)
}

function copyToClipboard(text) {
  // Méthode moderne (HTTPS requis)
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast())
      .catch(() => fallbackCopy(text))
    return
  }
  fallbackCopy(text)
}

function fallbackCopy(text) {
  // Fallback DOM pour HTTP / anciens navigateurs
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  try {
    document.execCommand('copy')
    showToast()
  } catch {
    // Dernier recours : prompt
    window.prompt('Copie ce lien :', text)
  } finally {
    document.body.removeChild(ta)
  }
}

function showToast() {
  shareToast.value = true
  setTimeout(() => { shareToast.value = false }, 2500)
}

function confirmReset() {
  if (confirm('Réinitialiser tout le build ?')) buildStore.resetBuild()
}
</script>

<style scoped>
.build-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.75rem;
  background: var(--header-bg);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
}

/* Ligne dégradée en bas du header */
.build-header::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent) 40%, var(--cyan) 60%, transparent);
  opacity: 0.55;
}

.header-left { flex: 1; }
.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 0.45rem;
}

/* ── Logo ── */
.logo {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.logo-img {
  height: 36px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 12px rgba(124, 58, 237, 0.6));
}

.logo-fallback {
  font-size: 1.7rem;
  filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.7));
}

.logo-text {
  display: flex;
  align-items: baseline;
  gap: 0;
  flex-wrap: nowrap;
  line-height: 1;
}

.logo-main {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--accent-hi);
  letter-spacing: 0.06em;
  text-shadow: 0 0 20px rgba(124,58,237,0.8);
}

.logo-sub {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--cyan);
  letter-spacing: 0.06em;
  text-shadow: 0 0 20px rgba(34,211,238,0.8);
}

.logo-tag {
  margin-left: 0.5rem;
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 0.12rem 0.45rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: rgba(124, 58, 237, 0.06);
}

/* ── Nom du build ── */
.build-name-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(124, 58, 237, 0.2);
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 600;
  font-family: var(--font);
  text-align: center;
  outline: none;
  padding: 0.25rem 0.6rem;
  width: 220px;
  transition: border-color 0.25s, text-shadow 0.25s;
  letter-spacing: 0.02em;
}

.build-name-input:focus {
  border-bottom-color: var(--accent);
  text-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
}
.build-name-input::placeholder { color: var(--text-muted); opacity: 0.5; }

/* ── Boutons action ── */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 1rem;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-2);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.18s;
  white-space: nowrap;
  text-decoration: none;
}

.action-btn:hover { transform: translateY(-1px); color: var(--text); }

.share-btn:hover {
  border-color: var(--accent-dim);
  color: var(--accent-hi);
  background: color-mix(in srgb, var(--accent) 14%, var(--surface-3));
  box-shadow: 0 4px 16px rgba(124,58,237,0.25);
}

.admin-btn:hover {
  border-color: var(--cyan-dim);
  color: var(--cyan);
  background: color-mix(in srgb, var(--cyan) 10%, var(--surface-3));
}

.reset-btn:hover {
  border-color: rgba(239,68,68,0.4);
  color: #f87171;
  background: rgba(239,68,68,0.1);
}

.theme-btn:hover {
  border-color: var(--gold, #f59e0b);
  color: var(--gold, #f59e0b);
  background: rgba(245,158,11,0.1);
}

/* ── Responsive mobile ── */
@media (max-width: 640px) {
  .build-header {
    padding: 0 0.75rem;
    gap: 0.5rem;
  }
  .header-left { flex: 0 0 auto; }
  .header-center { flex: 1; min-width: 0; }
  .build-name-input {
    width: 100%;
    font-size: 0.8rem;
  }
  .logo-tag { display: none; }
  .logo-main, .logo-sub { font-size: 1rem; }
  .logo-img { height: 28px; }
  .btn-label { display: none; }
  .action-btn {
    padding: 0.4rem 0.55rem;
    gap: 0;
    font-size: 0.9rem;
  }
  .header-right { gap: 0.3rem; flex: 0 0 auto; }
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--surface-2), var(--surface-1));
  border: 1px solid var(--accent-dim);
  color: var(--text);
  border-radius: 10px;
  padding: 0.65rem 1.4rem;
  font-size: 0.84rem;
  font-weight: 500;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.6),
    0 0 24px rgba(124, 58, 237, 0.25);
  z-index: 9999;
  white-space: nowrap;
}

.toast-anim-enter-active, .toast-anim-leave-active { transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1); }
.toast-anim-enter-from, .toast-anim-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
</style>
