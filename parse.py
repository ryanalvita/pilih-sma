import csv
import json
import re

with open('raw_data.tsv', newline='', encoding='utf-8') as f:
    reader = csv.reader(f, delimiter='\t', quotechar='"')
    rows = list(reader)

header = rows[0]
# find fixed columns
idx_sekolah = header.index('Sekolah')
idx_nomor = header.index('Nomor Sekolah')
idx_tahun = header.index('Tahun')
idx_jalur = header.index('Jalur')
idx_lolos = header.index('Lolos')
idx_sumlolos = header.index('Sum Lolos')
idx_sumber = header.index('Sumber')
idx_catatan = header.index('Catatan')

uni_cols = list(range(idx_lolos + 1, idx_sumlolos))
uni_names = [header[i] for i in uni_cols]

records = []
for r in rows[1:]:
    if not r or not r[0].strip():
        continue
    # pad row if short
    if len(r) < len(header):
        r = r + [''] * (len(header) - len(r))
    sekolah = r[idx_sekolah].strip()
    nomor = r[idx_nomor].strip()
    tahun = r[idx_tahun].strip()
    jalur = r[idx_jalur].strip()
    lolos = r[idx_lolos].strip()
    sumber = r[idx_sumber].strip().replace('\n', ' ').strip()
    catatan = r[idx_catatan].strip()

    universities = {}
    for i, name in zip(uni_cols, uni_names):
        val = r[i].strip() if i < len(r) else ''
        if val:
            try:
                universities[name] = int(val)
            except ValueError:
                pass

    has_breakdown = len(universities) > 0

    def to_int(v):
        try:
            return int(v)
        except ValueError:
            return None

    records.append({
        'school': sekolah,
        'schoolNumber': nomor or None,
        'year': to_int(tahun),
        'track': jalur or 'SNBP',
        'accepted': to_int(lolos),
        'universities': universities,
        'hasBreakdown': has_breakdown,
        'source': sumber or None,
        'note': catatan or None,
    })

# Build school list with slugs
def slugify(name):
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')

schools = {}
for rec in records:
    key = rec['school']
    if key not in schools:
        schools[key] = {
            'name': key,
            'slug': slugify(key),
            'schoolNumber': rec['schoolNumber'],
            'type': 'negeri' if key.upper().startswith('SMAN') else 'swasta',
        }

with open('src/data/snbp.json', 'w', encoding='utf-8') as f:
    json.dump({
        'universities': uni_names,
        'schools': sorted(schools.values(), key=lambda s: s['name']),
        'records': records,
    }, f, ensure_ascii=False, indent=2)

print(f"Parsed {len(records)} records across {len(schools)} schools, {len(uni_names)} university columns")
