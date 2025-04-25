import random
from faker import Faker
from app import get_db_connection
import pandas as pd

fake = Faker()
num_reservations = 2000

# Replace with your MySQL server details
db = get_db_connection()
cursor = db.cursor(dictionary=True)
insert_query = "INSERT IGNORE INTO UserReservations (Date, StartTime, EndTime, BuildingId, RoomNumber, UID) VALUES (%s, %s, %s, %s, %s, %s);"

cursor.execute("SELECT BuildingId, RoomNumber FROM Rooms")
rooms = cursor.fetchall()
df = pd.DataFrame(rooms)

def generate_uiuc_user_reservations():
    time_format = "%H:%M"
    start_time = fake.time(pattern=time_format)
    end_time = fake.time(pattern=time_format)
    if start_time < "08:00" or end_time > "22:00":
        return None
    if (end_time < start_time):
        start_time, end_time = end_time, start_time
    date = fake.date_between(start_date="-1w", end_date="+1w").strftime("%Y-%m-%d")

    random_row = df.sample(n=1).iloc[0]
    building_id, room_number = str(random_row['BuildingId']), str(random_row['RoomNumber'])

    return date, start_time, end_time, building_id, room_number


# netIds = set()
reservations = []
for _ in range(num_reservations):
    sample = generate_uiuc_user_reservations()
    if sample is None:
        continue
    date, start_time, end_time, building_id, room_number = sample
    reservations.append({
        'date': date,
        'start_time': start_time,
        'end_time': end_time,
        'building_id': building_id,
        'room_number': room_number
    })

for res in reservations:
    print(res)

try:
    for i, res in enumerate(reservations):
        cursor.execute(insert_query, (res['date'], res['start_time'], res['end_time'], res['building_id'], res['room_number'], i))
    db.commit()
    print(f"Inserted {len(reservations)} users successfully.")


    cursor.execute("select * from UserReservations")
    rows = cursor.fetchall()
    for row in rows:
        print(row)

except Exception as e:
    db.rollback()
    print("Error occurred:", e)
finally:
    db.close()
