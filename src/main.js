import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App).use(pinia).use(router)

// Initialise le store items dès le démarrage (charge depuis Supabase ou local)
app.mount('#app')

import { useItemsStore } from '@/stores/itemsStore'
import { useRunesStore }  from '@/stores/runesStore'
useItemsStore().init()
useRunesStore().init()
