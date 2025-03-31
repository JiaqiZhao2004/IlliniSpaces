import os
from dotenv import load_dotenv
import mysql.connector
from flask import Flask, request, jsonify
import random
import string
import requests

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

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

@app.route('/')
def hello_world():
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SHOW TABLES")
    result = cursor.fetchall()  # Fetch all rows
    connection.close()
    return ', '.join([row[0] for row in result])  # Convert tuple list to string

# Route to insert data into the Rooms table
@app.route('/insert', methods=['POST'])
def insert_data():
    try:
        # Get data from the request (JSON format)
        building_id = request.json['BuildingId']
        room_number = request.json['RoomNumber']
        capacity = request.json['Capacity']
        
        # Insert data into the Rooms table
        connection = get_db_connection()
        cursor = connection.cursor()
        
        insert_query = """
        INSERT INTO Rooms (BuildingId, RoomNumber, Capacity)
        VALUES (%s, %s, %s)
        """
        cursor.execute(insert_query, (building_id, room_number, capacity))
        
        # Commit the transaction
        connection.commit()
        
        # Close the connection
        cursor.close()
        connection.close()
        
        return jsonify({"message": "Data inserted successfully!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Unnecessary?
# ./cloud_sql_proxy -instances=databased-453317:northamerica-northeast2:databased-db=tcp:3306

# Adding HardReservation Code

def get_coordinates_from_nominatim(building_name):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": building_name,
        "format": "json",
        "limit": 1
    }
    response = requests.get(url, params=params, headers={"User-Agent": "your-app-name"})
    data = response.json()
    if data:
        return float(data[0]["lon"]), float(data[0]["lat"])
    return None, None

def generate_random_building_id():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

@app.route('/insert_hard_reservation', methods=['POST'])
def insert_hard_reservation():
    data = request.get_json()
    building_name = data['BuildingName']
    room_number = data['RoomNumber']
    event_name = data['EventName']
    start_date = data['StartDate']
    end_date = data['EndDate']
    repeats = data.get('Repeats')
    start_time = data['StartTime']
    end_time = data['EndTime']

    connection = get_db_connection()
    cursor = connection.cursor()

    # check if building exists
    cursor.execute("SELECT BuildingId FROM Buildings WHERE BuildingName = %s", (building_name,))
    result = cursor.fetchone()

    if result:
        building_id = result[0]
    else:
        # fetch coordinates
        lon, lat = get_coordinates_from_nominatim(building_name)
        if lon is None or lat is None:
            return jsonify({"error": "Could not find coordinates for building name"}), 400

        # generate random 4-char ID and insert building
        building_id = generate_random_building_id()
        try:
            cursor.execute("""
                INSERT INTO Buildings (BuildingId, BuildingName, Longitude, Latitude)
                VALUES (%s, %s, %s, %s)
            """, (building_id, building_name, lon, lat))
        except mysql.connector.Error as e:
            return jsonify({"error": str(e)}), 500

        # insert room with NULL/default capacity
        cursor.execute("""
            INSERT INTO Rooms (BuildingId, RoomNumber, Capacity)
            VALUES (%s, %s, %s)
        """, (building_id, room_number, None))

    # insert into HardReservations
    cursor.execute("""
        INSERT INTO HardReservations (StartDate, EndDate, Repeats, StartTime, EndTime, EventName, RoomNumber, BuildingId)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (start_date, end_date, repeats, start_time, end_time, event_name, room_number, building_id))

    connection.commit()
    cursor.close()
    connection.close()

    return jsonify({"message": "Hard reservation added successfully!"}), 201

if __name__ == '__main__':
    # app.run(debug=True, host="0.0.0.0", port=int(os.environ.get('PORT', 8080)))
    app.run(debug=True, host="0.0.0.0", port=8080)
