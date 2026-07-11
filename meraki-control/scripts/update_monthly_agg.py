
import json
from datetime import datetime

SALES_PATH = "/Users/Coyol/.openclaw/workspace/meraki-control/data/sales.json"
MONTHLY_PATH = "/Users/Coyol/.openclaw/workspace/meraki-control/data/monthly.json"

def load_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return {}
    except json.JSONDecodeError:
        print(f"Error decoding JSON from {file_path}")
        return {}

def save_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def normalize_daily_record(record):
    # Check if the record is in the nested format {date, coyol: {}, esh: {}, laluna: {}}
    if isinstance(record, dict) and 'date' in record and ('coyol' in record or 'esh' in record or 'laluna' in record):
        normalized_records = []
        date = record['date']
        restaurants = ['coyol', 'esh', 'laluna']
        for rest_code in restaurants:
            if rest_code in record and record[rest_code]:
                nested_data = record[rest_code]
                # Ensure all necessary keys are present, even if 0
                normalized_records.append({
                    "date": date,
                    "restaurant": rest_code,
                    "total": nested_data.get("total", 0),
                    "cash": nested_data.get("cash", 0),
                    "card": nested_data.get("card", 0),
                    "food": nested_data.get("food", 0),
                    "bar": nested_data.get("bar", 0),
                    "netSales": nested_data.get("netSales", nested_data.get("total", 0)),
                    "customers": nested_data.get("customers", 0),
                    "orders": nested_data.get("orders", 0),
                    "discounts": nested_data.get("discounts", 0),
                    "serviceTax": nested_data.get("serviceTax", 0),
                    "iva": nested_data.get("iva", 0),
                    "netReceipts": nested_data.get("netReceipts", nested_data.get("total", 0) - nested_data.get("cash", 0) - nested_data.get("card", 0)), # Basic calculation if not present
                    "mdo": nested_data.get("mdo", 0),
                    "gastos": nested_data.get("gastos", 0),
                    "sales": nested_data.get("sales", 0), # This might be redundant with total
                })
        return normalized_records
    # If it's already in the flat format, return it as a list with one item
    elif isinstance(record, dict) and 'restaurant' in record and 'date' in record:
        return [record]
    return [] # Return empty list if format is unrecognized

def aggregate_daily_to_monthly(daily_sales_data):
    aggregated_data_per_day = {}

    for record_raw in daily_sales_data:
        normalized_records_for_day = normalize_daily_record(record_raw)
        for record in normalized_records_for_day:
            date_obj = datetime.strptime(record['date'], '%Y-%m-%d')
            month_key = date_obj.strftime('%Y-%m')
            restaurant_code = record['restaurant']

            if month_key not in aggregated_data_per_day:
                aggregated_data_per_day[month_key] = {}
            if restaurant_code not in aggregated_data_per_day[month_key]:
                aggregated_data_per_day[month_key][restaurant_code] = {
                    "totalSales": 0, "food": 0, "bar": 0, "cash": 0, "card": 0,
                    "customers": 0, "orders": 0, "discounts": 0, "serviceTax": 0, "iva": 0, "netReceipts": 0,
                    "avgOrder": 0, "perPerson": 0, "mdo": 0, "gastos": 0, "sales": 0,
                    "days_count": 0 # To calculate averages later if needed
                }

            agg_rest = aggregated_data_per_day[month_key][restaurant_code]
            agg_rest["totalSales"] += record.get("total", 0)
            agg_rest["cash"] += record.get("cash", 0)
            agg_rest["card"] += record.get("card", 0)
            agg_rest["food"] += record.get("food", 0)
            agg_rest["bar"] += record.get("bar", 0)
            # Only count days for restaurants that have actual sales data for that day
            # This prevents overcounting for restaurants that might not have a record every day.
            # This can be made more sophisticated if needed.
            if record.get("total", 0) > 0: 
                agg_rest["days_count"] += 1
            
            # Accumulate other fields, assuming they are direct sums
            agg_rest["customers"] += record.get("customers", 0)
            agg_rest["orders"] += record.get("orders", 0)
            agg_rest["discounts"] += record.get("discounts", 0)
            agg_rest["serviceTax"] += record.get("serviceTax", 0)
            agg_rest["iva"] += record.get("iva", 0)
            agg_rest["netReceipts"] += record.get("netReceipts", 0)
            agg_rest["mdo"] += record.get("mdo", 0)
            agg_rest["gastos"] += record.get("gastos", 0)
            agg_rest["sales"] += record.get("sales", 0)


    final_monthly_data = []
    for month_key, restaurants_data in aggregated_data_per_day.items():
        for restaurant_code, data in restaurants_data.items():
            
            # Finalize averages where applicable
            if data["orders"] > 0:
                data["avgOrder"] = round(data["totalSales"] / data["orders"], 2)
            else:
                data["avgOrder"] = 0
            
            if data["customers"] > 0:
                data["perPerson"] = round(data["totalSales"] / data["customers"], 2)
            else:
                data["perPerson"] = 0

            data["month"] = month_key
            data["restaurant"] = restaurant_code
            data["source"] = "daily_aggregate"
            # Mark as partial logic. If the month is current, or not fully present in daily_sales_data, it's partial.
            # For simplicity, if we are processing current month, mark it partial
            current_month = datetime.now().strftime('%Y-%m')
            if month_key == current_month or data["days_count"] < datetime.strptime(month_key, '%Y-%m').replace(day=28).day:
                data["partial"] = True
            else:
                data["partial"] = False

            data.pop("days_count", None) # Remove helper field

            final_monthly_data.append(data)
    
    return final_monthly_data

def update_monthly_json():
    monthly_data_obj = load_json(MONTHLY_PATH)
    sales_data_obj = load_json(SALES_PATH)

    if not sales_data_obj or 'daily' not in sales_data_obj:
        print("No 'daily' sales data found in sales.json")
        return

    all_daily_records = sales_data_obj['daily']
    new_monthly_entries = aggregate_daily_to_monthly(all_daily_records)

    # Convert existing monthly data list to a dict for easier updates by (month, restaurant)
    existing_monthly_dict = {}
    for entry in monthly_data_obj.get('monthly', []) or []:
        key = (entry.get('month'), entry.get('restaurant'))
        existing_monthly_dict[key] = entry

    # Update or add new entries
    for new_entry in new_monthly_entries:
        key = (new_entry['month'], new_entry['restaurant'])
        existing_monthly_dict[key] = new_entry # Overwrite if exists, add if new
    
    # Convert back to list and sort
    updated_monthly_list = list(existing_monthly_dict.values())
    updated_monthly_list.sort(key=lambda x: (x['month'], x['restaurant']))

    monthly_data_obj['monthly'] = updated_monthly_list
    monthly_data_obj['lastUpdated'] = datetime.now().isoformat(timespec='seconds') + 'Z'
    
    save_json(MONTHLY_PATH, monthly_data_obj)
    print("monthly.json updated successfully.")

update_monthly_json()
