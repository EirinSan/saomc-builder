import json
import sys

def append_to_data(file_path):
    try:
        with open('data.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        data = []
        
    with open(file_path, 'r', encoding='utf-8') as f:
        new_data = json.load(f)
        
    data.extend(new_data)
    
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    append_to_data(sys.argv[1])