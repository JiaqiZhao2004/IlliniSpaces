import random
from faker import Faker
from backend.app import get_db_connection

fake = Faker()
num_users = 0


def generate_uiuc_user(existing_netIds):
    while True:
        first_name = fake.first_name()
        last_name = fake.last_name()

        if len(first_name) + len(last_name) <= 7:
            netId = first_name.lower() + last_name.lower() + str(random.randint(2, 9))
        elif len(last_name) <= 6:
            netId = first_name[0].lower() + last_name.lower() + str(random.randint(2, 9))
        else:
            netId = first_name[0].lower() + last_name[0].lower() + str(random.randint(2, 99))
        if netId not in existing_netIds:
            return f"{first_name} {last_name}", netId


netIds = set()
users = []
for _ in range(num_users):
    name, netid = generate_uiuc_user(netIds)
    users.append({
        'name': name,
        'email': netid + '@illinois.edu',
    })

for user in users:
    print(user)


# Replace with your MySQL server details
db = get_db_connection()
cursor = db.cursor()
insert_query = "INSERT IGNORE INTO Users (FullName, Email) VALUES (%s, %s)"

try:
    for user in users:
        cursor.execute(insert_query, (user['name'], user['email']))
    db.commit()
    print(f"Inserted {len(users)} users successfully.")
except Exception as e:
    db.rollback()
    print("Error occurred:", e)
finally:
    db.close()
