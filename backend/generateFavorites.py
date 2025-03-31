import os
import random
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return mysql.connector.connect(
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASS'),
        database=os.getenv('DB_NAME'),
        host=os.getenv('PUBLIC_IP'),
        port=3306
    )

def insert_favorites(cursor, num_favorites=300):
    cursor.execute("SELECT UID FROM Users")
    user_ids = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT BuildingId FROM Buildings")
    building_ids = [row[0] for row in cursor.fetchall()]
    
    favorites = [(random.choice(user_ids), random.choice(building_ids)) for _ in range(num_favorites)]
    cursor.executemany("""
        INSERT INTO Favorites (UID, BuildingId) VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE UID=UID;
    """, favorites)

def main():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    insert_favorites(cursor, 300)
    
    conn.commit()
    cursor.close()
    conn.close()
    print("Favorites insertion complete!")

if __name__ == "__main__":
    main()