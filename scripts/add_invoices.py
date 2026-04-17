#!/usr/bin/env python3
import json
import os

# Load existing invoices
invoices_path = os.path.expanduser('~/.openclaw/workspace/meraki-control/data/invoices.json')
with open(invoices_path, 'r') as f:
    data = json.load(f)

existing_claves = {inv['clave'] for inv in data['invoices']}

# New invoices from April 16
new_invoices = [
    {
        "clave": "50616042600060276013100100001010000000347100041769",
        "supplier": "KARLA DE LOS ANGELES MARTINEZ OVIEDO",
        "supplier_id": "602760131",
        "date": "2026-04-16",
        "subtotal": 21000.0,
        "iva": 210.0,
        "total": 21210.0,
        "items": [{"product": "HUEVO DE PASTOREO, CARTÓN DE 15 UNIDADES", "qty": 10.0, "unit": "Unid", "unit_price": 2100.0, "total": 21210.0}],
        "restaurant": "esh",
        "source_file": "50616042600060276013100100001010000000347100041769.xml"
    },
    {
        "clave": "50616042600060276013100100001010000000348100041769",
        "supplier": "KARLA DE LOS ANGELES MARTINEZ OVIEDO", 
        "supplier_id": "602760131",
        "date": "2026-04-16",
        "subtotal": 12600.0,
        "iva": 126.0,
        "total": 12726.0,
        "items": [{"product": "HUEVO DE PASTOREO, CARTÓN DE 15 UNIDADES", "qty": 6.0, "unit": "Unid", "unit_price": 2100.0, "total": 12726.0}],
        "restaurant": "coyol",
        "source_file": "50616042600060276013100100001010000000348100041769.xml"
    },
    {
        "clave": "50616042600060276013100100001010000000349100041769",
        "supplier": "KARLA DE LOS ANGELES MARTINEZ OVIEDO",
        "supplier_id": "602760131", 
        "date": "2026-04-16",
        "subtotal": 21000.0,
        "iva": 210.0,
        "total": 21210.0,
        "items": [{"product": "HUEVO DE PASTOREO, CARTÓN DE 15 UNIDADES", "qty": 10.0, "unit": "Unid", "unit_price": 2100.0, "total": 21210.0}],
        "restaurant": "laluna",
        "source_file": "50616042600060276013100100001010000000349100041769.xml"
    },
    {
        "clave": "50616042600310110918000200003010000100870116042670",
        "supplier": "Distribuidora Isleña de Alimentos, S.A.",
        "supplier_id": "3101109180",
        "date": "2026-04-16",
        "subtotal": 36542.4,
        "iva": 4750.51,
        "total": 41292.91,
        "items": [{"product": "PROSCIUTTO CRUDO SILVER CITTERIO REBANADO PACK 500GR", "qty": 2.0, "unit": "Kg", "unit_price": 22839.0, "total": 41292.91}],
        "restaurant": None,
        "source_file": "50616042600310110918000200003010000100870116042670_1.xml"
    },
    {
        "clave": "50616042600310110918000200003010000100885116042685",
        "supplier": "Distribuidora Isleña de Alimentos, S.A.",
        "supplier_id": "3101109180",
        "date": "2026-04-16",
        "subtotal": 265263.04,
        "iva": 29905.28,
        "total": 295168.32,
        "items": [
            {"product": "AZUCAR CRUDO ZUKRA 2KG", "qty": 12.0, "total": 22105.51},
            {"product": "VINAGRE CLARO GALON PIPPO", "qty": 4.0, "total": 7407.15},
            {"product": "TOMATES SECOS EN ACEITE IPOSEA", "qty": 4.0, "total": 55002.98},
            {"product": "TOALL INTERFOL ECONAT", "qty": 1.0, "total": 22114.55},
            {"product": "TE MENTA TWININGS", "qty": 1.0, "total": 3072.42},
            {"product": "OLIO SANSA LUGLIO 5LT", "qty": 8.0, "total": 114331.14}
        ],
        "restaurant": None,
        "source_file": "50616042600310110918000200003010000100885116042685_1.xml"
    },
    {
        "clave": "50616042600310110918000200003010000100965116042665",
        "supplier": "Distribuidora Isleña de Alimentos, S.A.",
        "supplier_id": "3101109180",
        "date": "2026-04-16",
        "subtotal": 57867.45,
        "iva": 7522.78,
        "total": 65390.23,
        "items": [
            {"product": "AZUCAR ZUKRA SACHETS", "qty": 1.0, "total": 872.76},
            {"product": "TOALL ROLL ECO PULITUTTO LUCART", "qty": 2.0, "total": 35934.68},
            {"product": "OLIO SANSA LUGLIO 5LT", "qty": 2.0, "total": 28582.79}
        ],
        "restaurant": None,
        "source_file": "50616042600310110918000200003010000100965116042665_1.xml"
    },
    {
        "clave": "50616042600310110918000200003010000100978116042678",
        "supplier": "Distribuidora Isleña de Alimentos, S.A.",
        "supplier_id": "3101109180",
        "date": "2026-04-16",
        "subtotal": 163028.45,
        "iva": 18709.1,
        "total": 181737.55,
        "items": [
            {"product": "SEMOLA DE TRIGO GRANORO 1k", "qty": 10.0, "total": 15634.8},
            {"product": "SAL SALTARINA FINA 500GR", "qty": 25.0, "total": 5277.25},
            {"product": "OLIO EXTRA VIRGEN 5L LUGLIO", "qty": 3.0, "total": 80266.73},
            {"product": "LECHE DE COCO ROLAND", "qty": 5.0, "total": 7774.4},
            {"product": "TOMATE PELADO CAMPORO", "qty": 5.0, "total": 15368.0},
            {"product": "ALCACHOFA CORAZON NAT IPOSEA", "qty": 3.0, "total": 39306.54}
        ],
        "restaurant": None,
        "source_file": "50616042600310110918000200003010000100978116042678_1.xml"
    },
    {
        "clave": "50616042615581547203100100001010000001636144122853",
        "supplier": "MARIO GONZALEZ OLIVERA",
        "supplier_id": "155815472031",
        "date": "2026-04-16",
        "subtotal": 35000.0,
        "iva": 0.0,
        "total": 35000.0,
        "items": [{"product": "Cilindro de 100 lbs GLP", "qty": 1.0, "unit": "Unid", "unit_price": 35000.0, "total": 35000.0}],
        "restaurant": None,
        "source_file": "FE-50616042615581547203100100001010000001636144122853.xml"
    },
    {
        "clave": "50616042615581547203100100001010000001637178249477",
        "supplier": "MARIO GONZALEZ OLIVERA",
        "supplier_id": "155815472031",
        "date": "2026-04-16",
        "subtotal": 185000.0,
        "iva": 0.0,
        "total": 185000.0,
        "items": [{"product": "Cilindro de 100 lbs GLP", "qty": 5.0, "unit": "Kg", "unit_price": 37000.0, "total": 185000.0}],
        "restaurant": None,
        "source_file": "FE-50616042615581547203100100001010000001637178249477.xml"
    },
    {
        "clave": "50616042600310263070000100212010000075504100075504",
        "supplier": "Ferreterías Grupo Nosara S.R.L",
        "supplier_id": "3102630700",
        "date": "2026-04-16",
        "subtotal": 72746.62,
        "iva": 9457.06,
        "total": 82203.68,
        "items": [{"product": "REMACHE 3/16 X 3/8", "qty": 3683.0, "unit": "Unid", "unit_price": 24.69, "total": 82203.68}],
        "restaurant": "coyol",
        "source_file": "50616042600310263070000100212010000075504100075504.xml"
    }
]

added = 0
for inv in new_invoices:
    if inv['clave'] not in existing_claves:
        data['invoices'].append(inv)
        added += 1
        print(f"✅ Added: {inv['date']} | {inv['supplier'][:30]} | ₡{inv['total']:,.0f}")
    else:
        print(f"⏭️  Skip (exists): {inv['supplier'][:30]}")

with open(invoices_path, 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n📦 Added {added} new invoices. Total now: {len(data['invoices'])}")
