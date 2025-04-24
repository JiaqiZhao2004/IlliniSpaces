import pandas as pd
import mysql.connector

# --- CONFIG ---
CSV_PATH = "Rooms.csv"  # Path to your CSV file
def get_db_connection():

    connection = mysql.connector.connect(
        user="root",
        password="~Y<KsHDBG13<CN1T",
        database="databased",
        host="34.130.58.90",  # Use public IP instead of Unix socket
        port=3306  # Default MySQL port
    )
    return connection
# --- LOAD CSV ---
df = pd.read_csv(CSV_PATH)

conn = get_db_connection()
cursor = conn.cursor()
update_query = """
    UPDATE Rooms
    SET Type = %s
    WHERE BuildingId = %s AND RoomNumber = %s
"""

updated = 0
skipped = 0
for _, row in df.iterrows():
    if pd.isna(row['Type']) or pd.isna(row['BuildingId']) or pd.isna(row['RoomNumber']):
        print(f"Skipping row with missing data: {row.to_dict()}")
        skipped += 1
        continue

    cursor.execute(update_query, (row['Type'], row['BuildingId'], row['RoomNumber']))
    updated += cursor.rowcount

# --- COMMIT & CLEAN UP ---
conn.commit()
cursor.close()
conn.close()

print(f"Updated {updated} rows. Skipped {skipped} rows with missing data.")