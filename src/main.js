import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

// Init theme before render to avoid flash
const savedTheme = localStorage.getItem('theme') || 'dark'
document.documentElement.setAttribute('data-theme', savedTheme)

const pinia = createPinia()
const app = createApp(App).use(pinia).use(router)

// Initialise le store items dès le démarrage (charge depuis Supabase ou local)
app.mount('#app')

import { useItemsStore } from '@/stores/itemsStore'
import { useRunesStore }  from '@/stores/runesStore'
useItemsStore().init()
useRunesStore().init()
