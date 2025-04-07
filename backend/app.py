import os
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

    try:
        cursor.execute("""
            SELECT ur.RoomNumber, b.BuildingName, ur.Date, ur.StartTime, ur.EndTime
            FROM UserReservations ur
            JOIN Buildings b ON ur.BuildingId = b.BuildingId
            WHERE ur.UID = %s
        """, (uid,))
        reservations = cursor.fetchall()
    except mysql.connector.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

    # Optional: categorize active vs past
    today = datetime.now().date()
    active, past = [], []

    for res in reservations:
        res_date = datetime.strptime(res["Date"], "%Y-%m-%d").date()
        (active if res_date >= today else past).append(res)

    return jsonify({
        "active": active,
        "past": past
    }), 200

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


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)