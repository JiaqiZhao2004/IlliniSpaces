import os, re
from dotenv import load_dotenv
import mysql.connector
from flask import Flask, request, jsonify
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import verify_token, VerifyTokenOptions
from datetime import datetime
from flask_cors import CORS
import requests

load_dotenv()
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)
app = Flask(__name__)
CORS(app)

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

def get_email(request):
    """Verify Clerk JWT and return the user's email."""
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise ValueError("Missing or invalid token")

    token = auth_header.split(" ")[1]  # Extract the actual token

    try:
        # Verify the token with Clerk's built-in function
        options = VerifyTokenOptions(secret_key=CLERK_SECRET_KEY)
        session = verify_token(token, options)
        user_id = session["sub"]
        headers = {
            'Authorization': f'Bearer {CLERK_SECRET_KEY}',
            'Content-Type': 'application/json'
        }
        response = requests.get(f'https://api.clerk.com/v1/users/{user_id}', headers=headers)
        if response.status_code == 200:
            user_data = response.json()
            email = user_data['email_addresses'][0]['email_address']
            return email
        else:
            raise ValueError(f"Failed to fetch user data: {response.status_code} {response.text}")
    except Exception as e:
        raise ValueError("Invalid or expired token") from e
    
def get_user_id(request):
    """Fetch the user ID from the database using the email."""
    email = get_email(request)
    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT UID FROM Users WHERE Email = %s", (email,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
    except mysql.connector.Error as e:
        raise ValueError(f"Database error: {e}")
    finally:
        connection.close()  # Ensures the connection is always closed

    if result:
        return result[0]
    else:
        raise ValueError("User not found")

# Create a favorite
@app.route('/favorites', methods=['POST'])
def add_favorite():
    try:
        uid = get_user_id(request)  # get UID from the request
    except ValueError as e:
        return jsonify({"error": str(e)}), 401  # Return 401 Unauthorized for failures
    
    data = request.json
    building_id = data.get('BuildingId')
    
    if not uid or not building_id:
        return jsonify({'error': 'UID and BuildingId are required'}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("INSERT INTO Favorites (UID, BuildingId) VALUES (%s, %s)", (uid, building_id))
        connection.commit()
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()
    
    return jsonify({'message': 'Favorite added successfully'}), 201

# Get all favorites for a user
@app.route('/favorites', methods=['GET'])
def get_favorites():
    try:
        uid = get_user_id(request)  # get UID from the request
    except ValueError as e:
        return jsonify({"error": str(e)}), 401  # Return 401 Unauthorized for failures
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT BuildingId FROM Favorites WHERE UID = %s", (uid,))
    favorites = cursor.fetchall()
    cursor.close()
    connection.close()
    
    return jsonify({'favorites': [fav[0] for fav in favorites]}), 200

# Delete a favorite
@app.route('/favorites', methods=['DELETE'])
def delete_favorite():
    try:
        uid = get_user_id(request)  # get UID from the request
    except ValueError as e:
        return jsonify({"error": str(e)}), 401  # Return 401 Unauthorized for failures
    data = request.json
    building_id = data.get('BuildingId')
    
    if not uid or not building_id:
        return jsonify({'error': 'UID and BuildingId are required'}), 400
    
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM Favorites WHERE UID = %s AND BuildingId = %s", (uid, building_id))
        connection.commit()
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()
    
    return jsonify({'message': 'Favorite deleted successfully'}), 200

@app.route('/users', methods=['POST'])
def add_user():
    try:
        email = get_email(request)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    data = request.json
    full_name = data.get('FullName')

    if full_name == "":
        full_name = email.split("@")[0]

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM Users WHERE Email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            print("User already exists:", existing_user)
        else:
            cursor.execute("INSERT INTO Users (FullName, Email) VALUES (%s, %s)", (full_name, email))
            print("Inserted new user.")
        connection.commit()
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({'message': 'User added successfully'}), 201

@app.route('/users', methods=['DELETE'])
def delete_user():
    try:
        uid = get_user_id(request)  # get UID from the request
    except ValueError as e:
        return jsonify({"error": str(e)}), 401  # Return 401 Unauthorized for failures

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("DELETE FROM Users WHERE UID = %s", (uid,))
        connection.commit()
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()
    return jsonify({'message': 'User deleted successfully'}), 200

@app.route('/user/reservations', methods=['GET'])
def get_user_reservations():
    try:
        uid = get_user_id(request)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    cursor.execute("""
            SELECT ur.ReservationId, ur.RoomNumber, b.BuildingName, ur.Date, ur.StartTime, ur.EndTime, CONCAT(ur.Date, ' ', ur.StartTime) AS start_time
            FROM UserReservations ur
            JOIN Buildings b ON ur.BuildingId = b.BuildingId
            WHERE ur.UID = %s AND CONCAT(ur.Date, ' ', ur.EndTime) > %s
            ORDER BY start_time
        """, (uid, now))
    active_reservations = cursor.fetchall()
    cursor.execute("""
            SELECT ur.ReservationId, ur.RoomNumber, b.BuildingName, ur.Date, ur.StartTime, ur.EndTime, CONCAT(ur.Date, ' ', ur.EndTime) AS end_time
            FROM UserReservations ur
            JOIN Buildings b ON ur.BuildingId = b.BuildingId
            WHERE ur.UID = %s AND CONCAT(ur.Date, ' ', ur.EndTime) <= %s
            ORDER BY end_time DESC
        """, (uid, now))
    past_reservations = cursor.fetchall()
    user_reservations = {"active" : active_reservations, "past" : past_reservations}
    cursor.close()
    connection.close()

    return jsonify(user_reservations), 200

    # try:
    #     cursor.execute("""
    #         SELECT ur.RoomNumber, b.BuildingName, ur.Date, ur.StartTime, ur.EndTime
    #         FROM UserReservations ur
    #         JOIN Buildings b ON ur.BuildingId = b.BuildingId
    #         WHERE ur.UID = %s
    #     """, (uid,))
    #     reservations = cursor.fetchall()
    # except mysql.connector.Error as e:
    #     return jsonify({"error": str(e)}), 500
    # finally:
    #     cursor.close()
    #     connection.close()

    # Optional: categorize active vs past
    # today = datetime.now().date()
    # active, past = [], []

    # for res in reservations:
    #     res_date = datetime.strptime(res["Date"], "%Y-%m-%d").date()
    #     (active if res_date >= today else past).append(res)

    # return jsonify({
    #     "active": active,
    #     "past": past
    # }), 200

@app.route('/user/reservations', methods=['POST'])
def add_user_reservations():

    try:
        uid = get_user_id(request)  # get UID from the request
    except ValueError as e:
        return jsonify({"error": str(e)}), 401  # Return 401 Unauthorized for failures
    
    data = request.json
    building_id = data.get('BuildingId')
    room_number = data.get('RoomNumber')
    date = data.get('Date')
    start_time = data.get('StartTime')
    end_time = data.get('EndTime')

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ")
        connection.start_transaction()

        cursor.execute("""
                    SELECT BuildingName, COUNT(*) FROM UserReservations NATURAL JOIN Buildings
                    WHERE UID = %s AND YEARWEEK(Date, 1) = YEARWEEK(%s, 1)
                    GROUP BY BuildingName
                    """,(uid, date))
        existing_reservations = cursor.fetchall()
        if existing_reservations:
            data = {}
            total_reservations = 0
            for reservation in existing_reservations:
                data[reservation[0]] = reservation[1]
                total_reservations += reservation[1]
            if total_reservations > 5:
                return jsonify({'error': f'You already have 5 reservations in a week: {data}'}), 400

        cursor.execute("""
            SELECT ReservationId AS id FROM UserReservations
            WHERE BuildingId = %s AND RoomNumber = %s AND EndTime > %s AND StartTime < %s AND Date = %s
            UNION ALL
            Select EventId AS id FROM HardReservations
            WHERE BuildingId = %s AND RoomNumber = %s AND EndTime > %s AND StartTime < %s
            AND Repeats LIKE %s
            """, (
            building_id, room_number, start_time, end_time, date,
            building_id, room_number, start_time, end_time, f"%{get_weekday_letter(date)}%"
        ))
        conflicts = cursor.fetchall()
        num_conflicts = len(conflicts)
        if num_conflicts:
            return jsonify({'error': f'Conflicted with {num_conflicts} reservations. Try another slot.'}), 409

        cursor.execute("INSERT INTO UserReservations (UID, RoomNumber, BuildingId, Date, StartTime, EndTime) VALUES (%s, %s, %s, %s, %s, %s)",
                       (uid, room_number, building_id, date, start_time, end_time))
        connection.commit()
    except mysql.connector.Error as err:
        connection.rollback()
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()
    
    return jsonify({'message': 'User Reservation added successfully'}), 201


@app.route('/user/reservations', methods=['DELETE'])
def delete_user_reservations():
    try:
        uid = get_user_id(request)  # Extract user ID from token
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    # Required parameters (can be passed as query or JSON)
    data = request.get_json()
    reservation_id = data.get("ReservationId")

    if not reservation_id:
        return jsonify({"error": "ReservationId is required"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute(
            "DELETE FROM UserReservations WHERE UID = %s AND ReservationId = %s",
            (uid, reservation_id)
        )
        connection.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "No matching reservation found"}), 404

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({"message": "Reservation deleted successfully"}), 200


@app.route('/reservations/search', methods=['GET'])
def search_reservations():
    """
    Search existing reservations (now only support user reservations, not hard reservations)
    input: BuildingId, RoomNumber, Date
    :return: list of matching UserReservations(UID, ReservationId, StartTime, EndTime)
    """

    try:
        uid = get_user_id(request)  # get UID from the request
    except ValueError as e:
        return jsonify({"error": str(e)}), 401  # Return 401 Unauthorized for failures

    room_number = request.args.get('RoomNumber')
    building_id = request.args.get('BuildingId')
    date = request.args.get('Date')
    # TODO: Add weekday-dependent building opening and closing time

    if not uid or not room_number or not building_id or not date:
        return jsonify({'error': 'UID, RoomNumber, BuildingId, Date are required'}), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        # TODO: Add building opening and closing time
        # cursor.execute("SELECT ?? FROM Buildings WHERE BuildingId = %s", (building_id,))

        cursor.execute("""
            SELECT Email AS Host, StartTime, EndTime 
            FROM UserReservations NATURAL JOIN Users 
            WHERE Date = %s AND BuildingId = %s AND RoomNumber = %s 
            UNION ALL 
            SELECT CONCAT(EventName, ' (CRN: ', EventId, ')') AS Host, StartTime, EndTime 
            FROM HardReservations
            WHERE Repeats LIKE %s AND BuildingId = %s AND RoomNumber = %s
            ORDER BY StartTime, EndTime DESC
            """, (
            date, building_id, room_number,
            f"%{get_weekday_letter(date)}%", building_id, room_number))
        reservations = cursor.fetchall()

    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({'reservations': reservations}), 200

@app.route('/buildings', methods=['GET'])
def get_buildings():
    connection = get_db_connection()
    cursor = connection.cursor()
    try:
        cursor.execute("SELECT * FROM Buildings")
        columns = [desc[0] for desc in cursor.description]  # Get column names
        buildings = cursor.fetchall()
        results = [dict(zip(columns, row)) for row in buildings]
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify({'buildings': results}), 200

@app.route('/rooms', methods=['GET'])
def get_rooms():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)
    try:
        cursor.execute("SELECT * FROM Rooms")
        rooms = cursor.fetchall()
    except mysql.connector.Error as err:
        return jsonify({'error': str(err)}), 500
    finally:
        cursor.close()
        connection.close()

    return jsonify(rooms), 200

def validate_decimal_precision(value, total_digits, decimal_places):
    try:
        float_val = float(value)
    except ValueError:
        return False

    str_val = str(abs(float_val))
    if '.' in str_val:
        int_part, dec_part = str_val.split('.')
    else:
        int_part, dec_part = str_val, ''

    return len(int_part + dec_part) <= total_digits and len(dec_part) <= decimal_places

@app.route('/nearestBuildings', methods=['GET'])
def nearest_rooms():
    try:
        lat = float(request.args.get('lat'))
        lng = float(request.args.get('lng'))
        current_date = request.args.get('date')   # format: 'YYYY-MM-DD'
        current_time = request.args.get('time')   # format: 'HH:MM'
        max_results = int(request.args.get('max', 5))

        if not validate_decimal_precision(lat, 10, 8):
            return jsonify({'error': 'Invalid latitude format or range'}), 400
        lat = float(lat)
        if not validate_decimal_precision(lng, 11, 8):
            return jsonify({'error': 'Invalid longitude format or range'}), 400
        lng = float(lng)
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', current_date):
            return jsonify({'error': 'Invalid date format'}), 400
        if not re.match(r'^\d{2}:\d{2}$', current_time):
            return jsonify({'error': 'Invalid time format'}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.callproc('GetNearestAvailableBuildings', [lat, lng, current_date, current_time, max_results])

        # Fetch results from procedure
        results = []
        for result in cursor.stored_results():
            results.extend(result.fetchall())

        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

@app.route('/availableRooms', methods=['GET'])
def available_rooms():
    try:
        current_date = request.args.get('date')
        current_time = request.args.get('time')

        if not re.match(r'^\d{4}-\d{2}-\d{2}$', current_date):
            return jsonify({'error': 'Invalid date format'}), 400
        if not re.match(r'^\d{2}:\d{2}$', current_time):
            return jsonify({'error': 'Invalid time format'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.callproc('GetAvailableRoomsWithMetadata', [current_date, current_time])

        results = []
        for result in cursor.stored_results():
            results.extend(result.fetchall())

        return jsonify(results)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# TODO: UPDATE method for User
# @app.route('/users', methods=['UPDATE'])
# def update_user():
#     try:
#         uid = get_user_id(request)
#     except ValueError as e:
#         return jsonify({"error": str(e)}), 401
#
#     data = request.json
#
#     return jsonify({'message': 'User updated successfully'}), 200

def get_weekday_letter(date_str: str):
    date_obj = datetime.strptime(date_str, "%Y-%m-%d")
    weekday_index = date_obj.weekday()  # 0 = Monday, 6 = Sunday
    letters = ['M', 'T', 'W', 'R', 'F', 'S', 'U']  # R = Thursday, U = Sunday
    return letters[weekday_index]

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(debug=True, host='0.0.0.0', port=port)
