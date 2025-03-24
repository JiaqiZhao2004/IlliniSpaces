import os, time
import pandas as pd
import mysql.connector
import requests
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    db_user = os.getenv('DB_USER')
    db_pass = os.getenv('DB_PASS')
    db_name = os.getenv('DB_NAME')
    public_ip = os.getenv('PUBLIC_IP')
    
    connection = mysql.connector.connect(
        user=db_user,
        password=db_pass,
        database=db_name,
        host=public_ip,  # Use public IP instead of Unix socket
        port=3306  # Default MySQL port
    )
    return connection

def get_lat_lon(building_name):
    base_url = "https://nominatim.openstreetmap.org/search?"
    params = {
        'q': building_name,
        'format': 'json',
        'addressdetails': 1,
        'limit': 1
    }
    
    headers = {
        'User-Agent': 'YourAppName/1.0 (your-email@example.com)'  # Replace with your app name and email
    }

    try:
        response = requests.get(base_url, params=params, headers=headers)
        response.raise_for_status()  # Check for errors in response
        data = response.json()
        if data:
            latitude = float(data[0].get('lat'))
            longitude = float(data[0].get('lon'))     
            latitude = round(latitude, 8)
            longitude = round(longitude, 8)
            return latitude, longitude
        else:
            return None, None
    except requests.exceptions.RequestException as e:
        print(f"Error retrieving data for {building_name}: {e}")
        return None, None
    finally:
        # Sleep for a short time to avoid hitting the rate limit
        time.sleep(0.3)

def insert_building_data(buildings_df, cursor):
    for _, row in buildings_df.iterrows():
        latitude, longitude = get_lat_lon(row['BuildingName'])
        if not (latitude and longitude):
            print(f"No coordinates for {row['BuildingName']}")
        else:
            print(f"Coordinates for {row['BuildingName']}: {latitude}, {longitude}")
        sql = """
        INSERT INTO Buildings (BuildingId, BuildingName, Longitude, Latitude)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE BuildingName = VALUES(BuildingName)
        """
        values = (row['BuildingId'], row['BuildingName'], longitude, latitude)
        cursor.execute(sql, values)

def insert_room_data(rooms_df, cursor):
    for _, row in rooms_df.iterrows():
        sql = """
        INSERT INTO Rooms (RoomNumber, BuildingId, Capacity)
        VALUES (%s, %s, %s)
        ON DUPLICATE KEY UPDATE Capacity = VALUES(Capacity)
        """
        values = (row['RoomNumber'], row['BuildingId'], row['Capacity'])
        cursor.execute(sql, values)

def main():
    try:
        # Create connection to the database using environment variables
        connection = get_db_connection()
        cursor = connection.cursor()

        # Load the Building CSV and Rooms CSV into pandas DataFrames
        buildings_file = '../scraping/buildings.csv'  # Path to your buildings CSV file
        rooms_file = '../scraping/rooms.csv'          # Path to your rooms CSV file

        buildings_df = pd.read_csv(buildings_file)
        rooms_df = pd.read_csv(rooms_file)

        # Insert data into Buildings and Rooms tables
        insert_building_data(buildings_df, cursor)
        insert_room_data(rooms_df, cursor)

        # Commit the transaction
        connection.commit()

        print("Data inserted successfully!")

    except Error as e:
        print(f"Error: {e}")
        connection.rollback()  # Rollback in case of error

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    main()