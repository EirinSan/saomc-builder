import json
import re

def slugify(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[éèêë]', 'e', text)
    text = re.sub(r'[àâä]', 'a', text)
    text = re.sub(r'[îï]', 'i', text)
    text = re.sub(r'[ôö]', 'o', text)
    text = re.sub(r'[ûüù]', 'u', text)
    text = re.sub(r'[ç]', 'c', text)
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s-]+', '-', text).strip('-')
    return text

def get_mapped_stat(stat_name):
    if not stat_name:
        return None
    
    # Normalize: remove accents, lowercase
    s = stat_name.lower().strip()
    s = re.sub(r'[éèêë]', 'e', s)
    s = re.sub(r'[àâä]', 'a', s)
    s = re.sub(r'[îï]', 'i', s)
    s = re.sub(r'[ôö]', 'o', s)
    s = re.sub(r'[ûüù]', 'u', s)
    s = re.sub(r'[ç]', 'c', s)
    
    # Replace separators with space
    s = s.replace("'", " ").replace("’", " ").replace("_", " ").replace("-", " ")
    
    # Remove common prefixes for bonus values (like "+", "-", "/s ")
    s = re.sub(r'^[\+\-\s/s]+', '', s)
    
    # Final cleanup of non-alphanumeric (except space)
    s = re.sub(r'[^a-z0-9\s]', '', s)
    s = " ".join(s.split()) # normalize spaces

    # Specificity order
    if "degats critique competence" in s: return "degats_critique_competence"
    if "chance critique competence" in s: return "chance_critique_competence"
    if "degats competence" in s or "degats des capacites" in s: return "degats_capacites"
    if "degats d attaque" in s or "degats attaque" in s or "degat d attaque" in s or "degat attaque" in s: return "degats_attaque"
    if "degats critique" in s: return "degats_critique"
    if "chance critique" in s or "chance de critique" in s: return "chance_critique"
    if "vitesse de deplacement" in s: return "vitesse_deplacement"
    if "defense" in s: return "defense_stat"
    
    # Health/Mana/Stamina Regen
    if "sante s" in s or "reg de sante" in s: return "regen_sante"
    if "mana s" in s or "reg de mana" in s: return "regen_mana"
    if "stamina s" in s or "reg de stamina" in s: return "regen_stamina"
    
    # Basic Stats
    if "sante" in s: return "sante"
    if "degats magiques" in s: return "degats_magiques"
    if "hate d aptitude" in s or "hate aptitude" in s: return "haste_aptitude"
    if "soins bonus" in s or "soin_bonus" in s or "soin bonus" in s: return "soin_bonus"
    if "max mana" in s or "mana" in s: return "mana"
    if "stamina" in s: return "stamina"
    if "esquive" in s: return "esquive"
    if "reduction des degats" in s or "degats subis" in s: return "reduction_degats"
    if "vitesse d attaque" in s or "vitesse attaque" in s: return "vitesse_attaque"
    
    return None

def parse_bonus_string(bonus_str):
    match = re.match(r'\[(\d+)\]\s*(.*)', bonus_str, re.DOTALL)
    if not match:
        return None
    
    count = int(match.group(1))
    label = match.group(2).strip()
    
    parts = re.split(r'\n|&', label)
    
    stats = {}
    for part in parts:
        part = part.strip()
        if not part:
            continue
            
        stat_match = re.search(r'([+-]?\d+(?:\.\d+)?%?)\s*(.*)', part)
        if stat_match:
            val_str = stat_match.group(1)
            stat_name = stat_match.group(2).strip()
            
            # Remove % and convert to number
            val_text = val_str.replace('%', '')
            try:
                val = float(val_text)
            except ValueError:
                continue
            
            # Special case: reduction of damage might be positive in text but negative in value
            if "dégâts subis" in stat_name.lower():
                if val > 0: val = -val
                
            mapped_stat = get_mapped_stat(stat_name)
            if mapped_stat:
                stats[mapped_stat] = val
            else:
                clean_name = slugify(stat_name).replace('-', '_')
                if clean_name:
                    stats[clean_name] = val
                
    return {"count": count, "label": label, "stats": stats}

def generate_sql(data_file, output_file):
    with open(data_file, 'r', encoding='utf-8') as f:
        items = json.load(f)

    sets = {}
    for item in items:
        if item.get('set_name'):
            set_id = slugify(item['set_name'])
            if set_id not in sets:
                sets[set_id] = {
                    'id': set_id,
                    'name': item['set_name'],
                    'bonuses': []
                }
            
            for bonus_str in item.get('set_bonuses', []):
                parsed = parse_bonus_string(bonus_str)
                if parsed:
                    # Check if we already have this count for this set
                    existing = next((b for b in sets[set_id]['bonuses'] if b['count'] == parsed['count']), None)
                    if existing:
                        # Merge stats and combine labels if different
                        existing['stats'].update(parsed['stats'])
                        if parsed['label'] not in existing['label']:
                            existing['label'] += "\n" + parsed['label']
                    else:
                        sets[set_id]['bonuses'].append(parsed)


    sql = []
    
    # Sort sets by name for consistent output
    sorted_set_ids = sorted(sets.keys())
    for s_id in sorted_set_ids:
        s_data = sets[s_id]
        # Sort bonuses by count
        s_data['bonuses'].sort(key=lambda x: x['count'])
        bonuses_json = json.dumps(s_data['bonuses'], ensure_ascii=False).replace("'", "''")
        name_safe = s_data['name'].replace("'", "''")
        sql.append(f"INSERT INTO sets (id, name, color, bonuses) VALUES ('{s_id}', '{name_safe}', '#ffffff', '{bonuses_json}'::jsonb) ON CONFLICT (id) DO UPDATE SET bonuses = '{bonuses_json}'::jsonb;")

    for item in items:
        item_id = slugify(item['name'])
        name_safe = item['name'].replace("'", "''")
        type_safe = item['type'].replace("'", "''")
        palier = item['palier']
        
        classes_str = "NULL"
        if item.get('classes'):
            classes_arr = ", ".join(f"'{c}'" for c in item['classes'])
            classes_str = f"ARRAY[{classes_arr}]::text[]"
            
        rarity_safe = item['rarity'].replace("'", "''")
        req_lvl = item.get('required_level', 1)
        
        # Map item stats
        raw_stats = item.get('stats', {})
        mapped_stats = {}
        for k, v in raw_stats.items():
            mapped_k = get_mapped_stat(k) or slugify(k).replace('-', '_')
            if mapped_k:
                mapped_stats[mapped_k] = v
        
        stats_json = json.dumps(mapped_stats, ensure_ascii=False).replace("'", "''")
        lore_safe = item.get('lore', '').replace("'", "''")
        
        set_id_str = f"'{slugify(item['set_name'])}'" if item.get('set_name') else "NULL"
        
        tags_str = "ARRAY[]::text[]"
        if item.get('tags'):
            tags_arr = ", ".join(f"'{t}'" for t in item['tags'])
            tags_str = f"ARRAY[{tags_arr}]::text[]"

        sql.append(f"INSERT INTO items (id, name, type, palier, classes, rarity, required_level, required_attributes, stats, lore, set_id, tags) VALUES ('{item_id}', '{name_safe}', '{type_safe}', {palier}, {classes_str}, '{rarity_safe}', {req_lvl}, '{{}}'::jsonb, '{stats_json}'::jsonb, '{lore_safe}', {set_id_str}, {tags_str}) ON CONFLICT (id) DO UPDATE SET stats = '{stats_json}'::jsonb, lore = '{lore_safe}', required_level = {req_lvl}, set_id = {set_id_str};")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("\n".join(sql))

if __name__ == '__main__':
    generate_sql('data.json', 'insert_items.sql')
