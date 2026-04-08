import json

def main():
    # Read text dump
    try:
        with open('docx_dump_utf8.txt', 'r', encoding='utf-8') as f:
            lines = [line.strip() for line in f.read().splitlines()]
    except Exception as e:
        print("Error reading docx_dump_utf8.txt:", e)
        return

    try:
        start_idx = lines.index('Akita')
        # We know Yorkshire Terrier is the last one
        end_idx = lines.index('Yorkshire Terrier') + 4
    except ValueError as e:
        print("Could not find start/end bounds.", e)
        return

    # Parse weights
    weights_data = {}
    for i in range(start_idx, end_idx, 4):
        raca = lines[i]
        origem = lines[i+1]
        try:
            peso_macho = float(lines[i+2])
        except:
            peso_macho = None
        try:
            peso_femea = float(lines[i+3])
        except:
            peso_femea = None
        
        weights_data[raca.lower()] = {
            'pesoMacho': peso_macho,
            'pesoFemea': peso_femea
        }
    
    print(f"Extracted weights for {len(weights_data)} breeds.")

    # Read breeds.json
    breeds_path = 'bello-app/src/utils/breeds.json'
    try:
        with open(breeds_path, 'r', encoding='utf-8') as f:
            breeds = json.load(f)
    except Exception as e:
        print(f"Error reading {breeds_path}:", e)
        return

    # Merge data
    matched = 0
    for b in breeds:
        name = b['breed'].lower()
        if name in weights_data:
            w = weights_data[name]
            b['pesoMacho'] = w['pesoMacho']
            b['pesoFemea'] = w['pesoFemea']
            matched += 1
        elif " " in name:
            # try finding by just matching the part
            pass
            
    # Also, some breeds in the document might not be in breeds.json
    # We can just add them or leave them. Let's merge purely on exact (case-insensitive) match.
    # What if we just append missing ones? Let's add missing breeds to the breeds.json
    existing_breeds = set(b['breed'].lower() for b in breeds)
    
    for i in range(start_idx, end_idx, 4):
        raca = lines[i]
        origem = lines[i+1]
        peso_macho = float(lines[i+2])
        peso_femea = float(lines[i+3])
        
        if raca.lower() not in existing_breeds:
            breeds.append({
                "breed": raca,
                "origin": origem,
                "pesoMacho": peso_macho,
                "pesoFemea": peso_femea
            })
            matched += 1

    # Sort breeds alphabetically
    breeds.sort(key=lambda x: x['breed'])

    # Write back breeds.json
    with open(breeds_path, 'w', encoding='utf-8') as f:
        json.dump(breeds, f, ensure_ascii=False, indent=2)
    
    print(f"Merged successfully. Updated {matched} records.")

if __name__ == '__main__':
    main()
