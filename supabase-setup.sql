-- ═══════════════════════════════════════════════════════════
-- SAOMC BUILDER — Script de création des tables Supabase
-- Colle ce SQL dans : Supabase → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════

-- Table des sets
create table if not exists sets (
  id       text primary key,
  name     text not null,
  color    text default '#888888',
  bonuses  jsonb default '[]'::jsonb
);

-- Table des items
create table if not exists items (
  id                   text primary key,
  name                 text not null,
  type                 text not null,
  palier               integer,                          -- Palier de l'item (1, 2, 3...)
  classes              text[],                           -- null = toutes classes
  rarity               text not null default 'commun',
  required_level       integer default 1,
  required_attributes  jsonb default '{}'::jsonb,
  stats                jsonb default '{}'::jsonb,
  lore                 text default '',
  set_id               text references sets(id) on delete set null,
  tags                 text[] default '{}',
  created_at           timestamptz default now()
);

-- Index
create index if not exists items_type_idx   on items(type);
create index if not exists items_rarity_idx on items(rarity);
create index if not exists items_set_id_idx on items(set_id);
create index if not exists items_palier_idx on items(palier);

-- Row Level Security
alter table items enable row level security;
alter table sets  enable row level security;

-- Lecture publique
create policy "Public read items" on items for select using (true);
create policy "Public read sets"  on sets  for select using (true);

-- Écriture admin (clé anon — protégée côté app par mot de passe)
create policy "Anon insert items"  on items for insert with check (true);
create policy "Anon update items"  on items for update using (true);
create policy "Anon delete items"  on items for delete using (true);
create policy "Anon insert sets"   on sets  for insert with check (true);
create policy "Anon update sets"   on sets  for update using (true);
create policy "Anon delete sets"   on sets  for delete using (true);
