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
        <span>Partager</span>
      </button>
      <RouterLink to="/admin" class="action-btn admin-btn">
        <span>⚙</span>
        <span>Admin</span>
      </RouterLink>
      <button class="action-btn reset-btn" @click="confirmReset">
        <span>↺</span>
        <span>Reset</span>
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
  background: rgba(8, 6, 18, 0.88);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(124, 58, 237, 0.12);
  position: sticky;
  top: 0;
  z-index: 100;
  height: 58px;
}

/* Ligne dégradée en bas du header */
.build-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--accent) 35%,
    var(--accent-2) 65%,
    transparent 100%);
  opacity: 0.5;
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
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 0.06em;
  text-shadow: 0 0 24px rgba(124, 58, 237, 0.7), 0 0 48px rgba(124, 58, 237, 0.3);
}

.logo-sub {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--accent-2);
  letter-spacing: 0.06em;
  text-shadow: 0 0 24px rgba(6, 182, 212, 0.7), 0 0 48px rgba(6, 182, 212, 0.3);
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
  padding: 0.38rem 0.9rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.2s;
  white-space: nowrap;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--text);
  transform: translateY(-1px);
}

.share-btn:hover {
  border-color: var(--accent-dim);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  box-shadow: 0 0 16px rgba(124, 58, 237, 0.2);
}

.admin-btn { text-decoration: none; }

.admin-btn:hover {
  border-color: rgba(6, 182, 212, 0.4);
  color: var(--accent-2);
  background: color-mix(in srgb, var(--accent-2) 8%, transparent);
}

.reset-btn:hover {
  border-color: rgba(224, 92, 92, 0.4);
  color: #e05c5c;
  background: rgba(224, 92, 92, 0.08);
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
