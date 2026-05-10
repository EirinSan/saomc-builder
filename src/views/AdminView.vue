<template>
  <!-- Login -->
  <div v-if="!authenticated" class="login-wrap">
    <div class="login-box">
      <img src="/logo.svg" class="login-logo" />
      <h2>Accès Administrateur</h2>
      <form @submit.prevent="tryLogin">
        <input v-model="passwordInput" type="password" placeholder="Mot de passe admin..." class="login-input" autofocus />
        <button type="submit" class="btn-login">Connexion</button>
      </form>
      <p v-if="loginError" class="login-error">{{ loginError }}</p>
      <p class="login-hint">Défini dans <code>VITE_ADMIN_PASSWORD</code></p>
    </div>
  </div>

  <!-- Panel admin -->
  <div v-else class="admin-view">

    <!-- Header -->
    <div class="admin-header">
      <div class="admin-title">
        <span class="admin-badge">ADMIN</span>
        <h2>Gestion du Builder</h2>
        <span class="source-badge" :class="itemsStore.source">
          {{ itemsStore.source === 'supabase' ? '🟢 Supabase' : '🟡 Mode local (Supabase non configuré)' }}
        </span>
      </div>
      <div class="admin-actions">
        <RouterLink to="/" class="btn-back">← Builder</RouterLink>
        <button class="btn-logout" @click="authenticated = false">Déconnexion</button>
      </div>
    </div>

    <!-- Onglets -->
    <div class="tabs">
      <button
        v-for="tab in TABS" :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.icon }} {{ tab.label }}
        <span class="tab-count">{{ tab.count() }}</span>
      </button>
    </div>

    <!-- ════════ ONGLET ITEMS ════════ -->
    <div v-if="activeTab === 'items'" class="tab-content">
      <div class="content-header">
        <div class="filters">
          <input v-model="search" class="filter-input" placeholder="🔍 Rechercher un item..." />
          <select v-model="filterType" class="filter-select">
            <option value="">Tous les types</option>
            <option v-for="t in ITEM_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
          <select v-model="filterRarity" class="filter-select">
            <option value="">Toutes raretés</option>
            <option v-for="r in RARITIES" :key="r.id" :value="r.id">{{ r.label }}</option>
          </select>
          <span class="item-count">{{ filteredItems.length }} item(s)</span>
        </div>
        <button class="btn-add" @click="openAddItem">+ Ajouter un item</button>
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Type</th>
              <th>Palier</th>
              <th>Rareté</th>
              <th>Niv.</th>
              <th>Classe(s)</th>
              <th>Set</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id" class="data-row">
              <td class="col-name" :style="{ color: getRarityColor(item.rarity) }">{{ item.name }}</td>
              <td class="col-muted">{{ typeLabel(item.type) }}</td>
              <td>
                <span v-if="item.palier" class="palier-chip">P{{ item.palier }}</span>
                <span v-else class="col-muted">—</span>
              </td>
              <td>
                <span class="rarity-chip" :style="rarityStyle(item.rarity)">{{ getRarityLabel(item.rarity) }}</span>
              </td>
              <td class="col-muted">{{ item.requiredLevel }}</td>
              <td class="col-muted col-small">{{ item.classes?.join(', ') ?? 'Toutes' }}</td>
              <td class="col-accent col-small">{{ item.set ? setName(item.set) : '—' }}</td>
              <td class="col-actions">
                <button class="action-btn" @click="openEditItem(item)" title="Modifier">✏️</button>
                <button class="action-btn delete" @click="confirmDeleteItem(item)" title="Supprimer">🗑</button>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="8" class="empty-row">
                {{ itemsStore.loading ? 'Chargement...' : 'Aucun item. Configure Supabase et ajoute des items !' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ════════ ONGLET SETS ════════ -->
    <div v-if="activeTab === 'sets'" class="tab-content">
      <div class="content-header">
        <span class="item-count">{{ itemsStore.setsList.length }} set(s)</span>
        <button class="btn-add" @click="openAddSet">+ Créer un set</button>
      </div>

      <div class="sets-grid">
        <div v-for="set in itemsStore.setsList" :key="set.id" class="set-card" :style="{ '--sc': set.color }">
          <div class="set-card-header">
            <div class="set-color-dot" :style="{ background: set.color }"></div>
            <span class="set-card-name">{{ set.name }}</span>
            <span class="set-card-id">{{ set.id }}</span>
            <div class="set-card-actions">
              <button class="action-btn" @click="openEditSet(set)">✏️</button>
              <button class="action-btn delete" @click="confirmDeleteSet(set)">🗑</button>
            </div>
          </div>
          <div class="set-bonuses-list">
            <div v-for="(bonus, i) in (set.bonuses ?? [])" :key="i" class="bonus-line">
              <span class="bonus-count">[{{ bonus.count }}]</span>
              <span class="bonus-label">{{ bonus.label }}</span>
            </div>
            <div v-if="!set.bonuses?.length" class="col-muted" style="padding:0.5rem;font-size:0.8rem">Aucun bonus défini</div>
          </div>
          <div class="set-items-count">
            {{ countSetItems(set.id) }} item(s) dans ce set
          </div>
        </div>

        <div v-if="itemsStore.setsList.length === 0" class="empty-sets">
          Aucun set. Crée ton premier set !
        </div>
      </div>
    </div>

    <!-- ════════ MODAL ITEM ════════ -->
    <Teleport to="body">
      <div v-if="showItemForm" class="modal-overlay" @click.self="showItemForm = false">
        <div class="modal-large">
          <div class="modal-header">
            <h3>{{ editItemTarget ? `Modifier — ${editItemTarget.name}` : 'Ajouter un item' }}</h3>
            <button class="close-btn" @click="showItemForm = false">✕</button>
          </div>
          <div class="modal-body">
            <ItemForm :initial="editItemTarget" @submit="handleItemSubmit" @cancel="showItemForm = false" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ════════ MODAL SET ════════ -->
    <Teleport to="body">
      <div v-if="showSetForm" class="modal-overlay" @click.self="showSetForm = false">
        <div class="modal-medium">
          <div class="modal-header">
            <h3>{{ editSetTarget ? `Modifier — ${editSetTarget.name}` : 'Créer un set' }}</h3>
            <button class="close-btn" @click="showSetForm = false">✕</button>
          </div>
          <div class="modal-body">
            <SetForm :initial="editSetTarget" @submit="handleSetSubmit" @cancel="showSetForm = false" />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Transition name="toast-anim">
      <div v-if="toast" class="toast" :class="toast.type">{{ toast.msg }}</div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useItemsStore } from '@/stores/itemsStore'
import { RARITIES } from '@/data/constants'
import ItemForm from '@/components/admin/ItemForm.vue'
import SetForm from '@/components/admin/SetForm.vue'

const itemsStore = useItemsStore()
onMounted(() => itemsStore.init())

// ── Auth ──────────────────────────────────────────────────────
const authenticated = ref(false)
const passwordInput = ref('')
const loginError = ref('')

function tryLogin() {
  const expected = import.meta.env.VITE_ADMIN_PASSWORD
  if (!expected) { authenticated.value = true; return }
  if (passwordInput.value === expected) { authenticated.value = true; loginError.value = '' }
  else loginError.value = 'Mot de passe incorrect.'
}

// ── Onglets ───────────────────────────────────────────────────
const activeTab = ref('items')

const TABS = [
  { id: 'items', label: 'Items',  icon: '⚔️', count: () => itemsStore.items.length },
  { id: 'sets',  label: 'Sets',   icon: '✨', count: () => itemsStore.setsList.length },
]

// ── Filtres items ─────────────────────────────────────────────
const search = ref('')
const filterType = ref('')
const filterRarity = ref('')

const ITEM_TYPES = [
  { value: 'casque',     label: 'Casque' },
  { value: 'plastron',   label: 'Plastron' },
  { value: 'jambier',    label: 'Jambières' },
  { value: 'boots',      label: 'Bottes' },
  { value: 'gant',       label: 'Gant' },
  { value: 'amulette',   label: 'Amulette' },
  { value: 'bracelet',   label: 'Bracelet' },
  { value: 'anneau',     label: 'Anneau' },
  { value: 'arme',       label: 'Arme' },
  { value: 'secondaire', label: 'Secondaire' },
  { value: 'artefact',   label: 'Artefact' },
]

const filteredItems = computed(() => {
  let list = itemsStore.items
  if (filterType.value)   list = list.filter(i => i.type === filterType.value)
  if (filterRarity.value) list = list.filter(i => i.rarity === filterRarity.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(i => i.name.toLowerCase().includes(q) || i.id?.toLowerCase().includes(q) || i.set?.toLowerCase().includes(q))
  }
  return list
})

function typeLabel(type) {
  return ITEM_TYPES.find(t => t.value === type)?.label ?? type
}

function getRarityColor(id) { return RARITIES.find(r => r.id === id)?.color ?? '#aaa' }
function getRarityLabel(id) { return RARITIES.find(r => r.id === id)?.label ?? id }
function rarityStyle(id) {
  const c = getRarityColor(id)
  return { background: c + '22', color: c, borderColor: c + '55' }
}
function setName(setId) {
  return itemsStore.sets[setId]?.name ?? setId
}
function countSetItems(setId) {
  return itemsStore.items.filter(i => i.set === setId).length
}

// ── CRUD items ────────────────────────────────────────────────
const showItemForm  = ref(false)
const editItemTarget = ref(null)

function openAddItem() { editItemTarget.value = null; showItemForm.value = true }
function openEditItem(item) { editItemTarget.value = item; showItemForm.value = true }

async function handleItemSubmit(payload) {
  try {
    if (editItemTarget.value) {
      await itemsStore.updateItem(payload.id, payload)
      showToast('✅ Item modifié !', 'success')
    } else {
      await itemsStore.addItem(payload)
      showToast('✅ Item ajouté !', 'success')
    }
    showItemForm.value = false
  } catch (e) {
    showToast('❌ ' + (e.message ?? 'Erreur'), 'error')
  }
}

async function confirmDeleteItem(item) {
  if (!confirm(`Supprimer "${item.name}" ?`)) return
  try {
    await itemsStore.deleteItem(item.id)
    showToast(`🗑 "${item.name}" supprimé.`, 'success')
  } catch (e) {
    showToast('❌ Erreur suppression', 'error')
  }
}

// ── CRUD sets ─────────────────────────────────────────────────
const showSetForm  = ref(false)
const editSetTarget = ref(null)

function openAddSet() { editSetTarget.value = null; showSetForm.value = true }
function openEditSet(set) { editSetTarget.value = set; showSetForm.value = true }

async function handleSetSubmit(payload) {
  try {
    if (editSetTarget.value) {
      await itemsStore.updateSet(payload.id, payload)
      showToast('✅ Set modifié !', 'success')
    } else {
      await itemsStore.addSet(payload)
      showToast('✅ Set créé !', 'success')
    }
    showSetForm.value = false
  } catch (e) {
    showToast('❌ ' + (e.message ?? 'Erreur'), 'error')
  }
}

async function confirmDeleteSet(set) {
  if (!confirm(`Supprimer le set "${set.name}" ? Les items liés perdront leur set.`)) return
  try {
    await itemsStore.deleteSet(set.id)
    showToast(`🗑 Set "${set.name}" supprimé.`, 'success')
  } catch (e) {
    showToast('❌ Erreur suppression', 'error')
  }
}

// ── Toast ──────────────────────────────────────────────────────
const toast = ref(null)
function showToast(msg, type = 'success') {
  toast.value = { msg, type }
  setTimeout(() => { toast.value = null }, 3000)
}
</script>

<style scoped>
/* ── Login ── */
.login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; }
.login-box {
  background:var(--surface-1); border:1px solid var(--border); border-radius:16px;
  padding:2.5rem; width:340px; display:flex; flex-direction:column;
  align-items:center; gap:1rem;
  box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 0 40px rgba(124,58,237,.12);
}
.login-logo { height:55px; filter:drop-shadow(0 0 12px rgba(124,58,237,.5)); }
.login-box h2 { font-size:1.05rem; }
.login-box form { display:flex; flex-direction:column; gap:.6rem; width:100%; }
.login-input {
  background:var(--surface-2); border:1px solid var(--border); border-radius:8px;
  color:var(--text); padding:.6rem .9rem; font-size:.9rem; outline:none; width:100%;
  transition:border-color .2s;
}
.login-input:focus { border-color:var(--accent); }
.btn-login {
  padding:.6rem; background:var(--accent); color:#fff; border:none;
  border-radius:8px; font-weight:700; cursor:pointer; font-size:.9rem;
}
.login-error { color:#e05c5c; font-size:.85rem; }
.login-hint { color:var(--text-muted); font-size:.75rem; text-align:center; }
.login-hint code { color:var(--accent); }

/* ── Layout admin ── */
.admin-view {
  padding:1.25rem 1.5rem;
  display:flex; flex-direction:column; gap:1rem;
  min-height:calc(100vh - 60px);
}

.admin-header {
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.75rem;
}
.admin-title { display:flex; align-items:center; gap:.75rem; flex-wrap:wrap; }
.admin-badge {
  background:color-mix(in srgb,var(--accent) 20%,transparent);
  border:1px solid var(--accent-dim); color:var(--accent);
  font-size:.7rem; font-weight:900; letter-spacing:.1em; padding:.2rem .6rem; border-radius:4px;
}
.admin-title h2 { font-size:1.1rem; }
.source-badge {
  font-size:.75rem; padding:.2rem .6rem; border-radius:12px;
  border:1px solid var(--border); color:var(--text-muted);
}
.source-badge.supabase { color:#27ae60; border-color:rgba(39,174,96,.3); }
.source-badge.local    { color:#f39c12; border-color:rgba(243,156,18,.3); }

.admin-actions { display:flex; gap:.5rem; }
.btn-back {
  padding:.45rem .9rem; background:var(--surface-2); border:1px solid var(--border);
  border-radius:8px; color:var(--text-muted); font-size:.85rem; text-decoration:none;
  transition:all .2s;
}
.btn-back:hover { border-color:var(--accent-dim); color:var(--accent); }
.btn-logout {
  padding:.45rem .9rem; background:transparent; border:1px solid var(--border);
  border-radius:8px; color:var(--text-muted); font-size:.85rem; cursor:pointer; transition:all .2s;
}
.btn-logout:hover { border-color:#e05c5c; color:#e05c5c; }

/* ── Tabs ── */
.tabs { display:flex; gap:.35rem; border-bottom:1px solid var(--border); padding-bottom:.5rem; }
.tab-btn {
  display:flex; align-items:center; gap:.4rem;
  padding:.45rem 1rem; background:var(--surface-2); border:1px solid var(--border);
  border-radius:8px; color:var(--text-muted); font-size:.85rem; font-weight:600;
  cursor:pointer; transition:all .2s;
}
.tab-btn:hover { border-color:var(--accent-dim); color:var(--accent); }
.tab-btn.active {
  border-color:var(--accent); color:var(--accent);
  background:color-mix(in srgb,var(--accent) 10%,var(--surface-2));
}
.tab-count {
  background:var(--surface-3); border-radius:10px;
  padding:.05rem .4rem; font-size:.7rem; color:var(--text-muted);
}

/* ── Content header ── */
.tab-content { display:flex; flex-direction:column; gap:.75rem; }
.content-header {
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:.5rem;
}
.filters { display:flex; gap:.5rem; flex-wrap:wrap; align-items:center; flex:1; }

.filter-input {
  background:var(--surface-2); border:1px solid var(--border); border-radius:8px;
  color:var(--text); padding:.42rem .75rem; font-size:.85rem; outline:none;
  flex:1; min-width:180px; transition:border-color .2s;
}
.filter-input:focus { border-color:var(--accent); }

.filter-select {
  background:var(--surface-2); border:1px solid var(--border); border-radius:8px;
  color:var(--text); padding:.42rem .6rem; font-size:.85rem; outline:none; cursor:pointer;
}

.item-count { font-size:.78rem; color:var(--text-muted); white-space:nowrap; }

.btn-add {
  padding:.48rem 1.1rem; background:var(--accent); color:#fff; border:none;
  border-radius:8px; font-weight:700; font-size:.85rem; cursor:pointer; transition:opacity .2s;
  white-space:nowrap;
}
.btn-add:hover { opacity:.85; }

/* ── Table ── */
.table-wrap { overflow-x:auto; border:1px solid var(--border); border-radius:10px; }
.data-table { width:100%; border-collapse:collapse; font-size:.85rem; }
.data-table th {
  padding:.55rem .9rem; text-align:left; font-size:.68rem; font-weight:700;
  text-transform:uppercase; letter-spacing:.08em; color:var(--text-muted);
  background:var(--surface-2); border-bottom:1px solid var(--border);
  white-space:nowrap;
}
.data-row { border-bottom:1px solid var(--border); transition:background .1s; }
.data-row:hover { background:var(--surface-2); }
.data-row:last-child { border-bottom:none; }
.data-table td { padding:.48rem .9rem; vertical-align:middle; }

.col-name   { font-weight:700; }
.col-muted  { color:var(--text-muted); }
.col-small  { font-size:.78rem; }
.col-accent { color:var(--accent); font-size:.78rem; }
.col-actions { display:flex; gap:.3rem; }

.palier-chip {
  display:inline-block; font-size:.72rem; font-weight:800;
  padding:.1rem .45rem; border-radius:6px;
  background:color-mix(in srgb,var(--accent) 15%,transparent);
  border:1px solid var(--accent-dim); color:var(--accent);
}

.rarity-chip {
  display:inline-block; font-size:.72rem; font-weight:700;
  padding:.12rem .5rem; border-radius:10px; border:1px solid;
}

.action-btn {
  background:var(--surface-3); border:1px solid var(--border);
  border-radius:6px; padding:.22rem .4rem; cursor:pointer;
  font-size:.85rem; transition:all .15s;
}
.action-btn:hover { border-color:var(--accent-dim); }
.action-btn.delete:hover { border-color:rgba(224,92,92,.4); }

.empty-row {
  text-align:center; color:var(--text-muted); padding:2.5rem;
  font-style:italic; font-size:.9rem;
}

/* ── Sets grid ── */
.sets-grid {
  display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:.75rem;
}

.set-card {
  border:1px solid color-mix(in srgb,var(--sc,#888) 30%,transparent);
  border-radius:10px; overflow:hidden;
  background:color-mix(in srgb,var(--sc,#888) 5%,var(--surface-2));
}

.set-card-header {
  display:flex; align-items:center; gap:.5rem;
  padding:.6rem .9rem;
  background:color-mix(in srgb,var(--sc,#888) 12%,transparent);
  border-bottom:1px solid color-mix(in srgb,var(--sc,#888) 20%,transparent);
}

.set-color-dot {
  width:10px; height:10px; border-radius:50%; flex-shrink:0;
  box-shadow:0 0 6px currentColor;
}

.set-card-name { font-weight:700; font-size:.9rem; color:var(--sc,#888); flex:1; }
.set-card-id   { font-size:.68rem; color:var(--text-muted); font-family:monospace; }

.set-card-actions { display:flex; gap:.25rem; margin-left:auto; }

.set-bonuses-list { padding:.5rem .9rem; display:flex; flex-direction:column; gap:.2rem; }

.bonus-line { display:flex; gap:.4rem; font-size:.78rem; }
.bonus-count { font-weight:700; color:var(--sc,#888); min-width:28px; }
.bonus-label { color:var(--text-muted); }

.set-items-count {
  padding:.35rem .9rem; font-size:.72rem; color:var(--text-muted);
  border-top:1px solid color-mix(in srgb,var(--sc,#888) 15%,transparent);
}

.empty-sets {
  grid-column:1/-1; text-align:center; color:var(--text-muted);
  padding:3rem; font-style:italic;
}

/* ── Modals ── */
.modal-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.75);
  backdrop-filter:blur(4px); z-index:1000;
  display:flex; align-items:center; justify-content:center; padding:1rem;
}
.modal-large  { background:var(--surface-1); border:1px solid var(--border); border-radius:14px; width:min(920px,98vw); max-height:92vh; display:flex; flex-direction:column; box-shadow:0 24px 64px rgba(0,0,0,.6); }
.modal-medium { background:var(--surface-1); border:1px solid var(--border); border-radius:14px; width:min(640px,98vw); max-height:92vh; display:flex; flex-direction:column; box-shadow:0 24px 64px rgba(0,0,0,.6); }

.modal-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:1rem 1.25rem; border-bottom:1px solid var(--border);
}
.modal-header h3 { font-size:1rem; font-weight:700; }
.close-btn { background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; transition:color .2s; }
.close-btn:hover { color:var(--text); }

.modal-body { overflow-y:auto; padding:1.25rem; flex:1; }

/* ── Toast ── */
.toast {
  position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%);
  background:var(--surface-1); border:1px solid var(--accent); color:var(--text);
  border-radius:8px; padding:.6rem 1.25rem; font-size:.875rem;
  box-shadow:0 8px 32px rgba(0,0,0,.5); z-index:9999; white-space:nowrap;
}
.toast.error { border-color:#e05c5c; }
.toast-anim-enter-active,.toast-anim-leave-active { transition:all .25s ease; }
.toast-anim-enter-from,.toast-anim-leave-to { opacity:0; transform:translateX(-50%) translateY(10px); }
</style>
