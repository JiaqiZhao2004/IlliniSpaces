import os
from dotenv import load_dotenv
import mysql.connector
from flask import Flask, request, jsonify
from clerk_backend_api import Clerk
from clerk_backend_api.jwks_helpers import verify_token

load_dotenv()
clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))
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

def get_email(request):
    """Verify Clerk JWT and return the user's email."""
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise ValueError("Missing or invalid token")

    token = auth_header.split(" ")[1]  # Extract the actual token

    try:
        # Verify the token with Clerk's built-in function
        session = clerk.verify_token(token)
        return session["email_addresses"][0]["email_address"]
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

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8080)