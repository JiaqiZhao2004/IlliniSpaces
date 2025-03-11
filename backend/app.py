import os
from dotenv import load_dotenv
import mysql.connector
from flask import Flask

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
    cursor.execute("SHOW databases")
    result = cursor.fetchone()
    connection.close()
    return result[0]

if __name__ == '__main__':
    # app.run(debug=True, host="0.0.0.0", port=int(os.environ.get('PORT', 8080)))
    app.run(debug=True, host="0.0.0.0", port=8080)

# Unnecessary?
# ./cloud_sql_proxy -instances=databased-453317:northamerica-northeast2:databased-db=tcp:3306