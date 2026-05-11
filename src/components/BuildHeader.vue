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
  padding: 0.6rem 1.5rem;
  background: rgba(12, 10, 26, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 60px;
}

/* Ligne violette en bas du header */
.build-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), var(--accent-2), var(--accent), transparent);
  opacity: 0.6;
}

.header-left { flex: 1; }
.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* ── Logo ── */
.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgba(124, 58, 237, 0.5));
}

.logo-fallback {
  font-size: 1.8rem;
  filter: drop-shadow(0 0 8px rgba(124, 58, 237, 0.6));
}

.logo-text {
  display: flex;
  align-items: baseline;
  gap: 0.1rem;
  flex-wrap: nowrap;
}

.logo-main {
  font-size: 1.35rem;
  font-weight: 900;
  color: var(--accent);
  letter-spacing: 0.08em;
  text-shadow: 0 0 20px rgba(124, 58, 237, 0.5);
}

.logo-sub {
  font-size: 1.35rem;
  font-weight: 900;
  color: var(--accent-2);
  letter-spacing: 0.08em;
  text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
}

.logo-tag {
  margin-left: 0.3rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: 4px;
}

/* ── Nom du build ── */
.build-name-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
  outline: none;
  padding: 0.2rem 0.5rem;
  width: 220px;
  transition: border-color 0.2s;
}

.build-name-input:focus { border-bottom-color: var(--accent); }
.build-name-input::placeholder { color: var(--text-muted); }

/* ── Boutons ── */
.action-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.38rem 0.85rem;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
}

.share-btn:hover {
  border-color: var(--accent-dim);
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 8%, var(--surface-2));
}

.admin-btn {
  text-decoration: none;
}

.reset-btn:hover {
  border-color: rgba(224, 92, 92, 0.35);
  color: #e05c5c;
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--surface-1);
  border: 1px solid var(--accent);
  color: var(--text);
  border-radius: 8px;
  padding: 0.6rem 1.25rem;
  font-size: 0.875rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(124, 58, 237, 0.2);
  z-index: 9999;
}

.toast-anim-enter-active, .toast-anim-leave-active { transition: all 0.25s ease; }
.toast-anim-enter-from, .toast-anim-leave-to { opacity: 0; transform: translateX(-50%) translateY(10px); }
</style>
