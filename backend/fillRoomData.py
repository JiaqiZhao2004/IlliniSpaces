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


def get_lat_lon(building_name: str):

    renames = {
        "Literatures, Cultures & Linguistics Building": "Foreign Languages Building",
        "Speech & Hearing Science Bldg": "Department of Speech and Hearing Science",
        "Lincoln Hall Theater": "Lincoln Hall",
        "Library": "Main Library",
        "Asian American House": "Asian American Cultural Center",
        "Agricultural Bioprocess Lab": "Agricultural Bioprocess Laboratory",
        "ACES Lib, Info & Alum Ctr": "ACES Library",
        "Art and Design Building": "Art and Design",
        "Architecture Annex": "Art Annex Studio 1",
        "Art-East Annex, Studio 2": "Art Annex Studio 2",
        "Agricultural Engr Sciences Bld": "1304 W Pennsylvania Ave, Urbana, IL 61801",
        "Allen Residence Hall": "1005 W Gregory Dr, Urbana, IL 61801",
        "Banner Building": "506 S Wright St, Urbana, IL 61801",
        "Business Instructional Fac": "515 E Gregory Dr, Champaign, IL 61820",
        "Burnsides Research Lab": "1201 W Gregory Dr, Urbana, IL 61801",
        "Building Research Council Bldg": "40.094089, -88.242568",
        "Early Child Development Lab": "1105 W Nevada St, Urbana, IL 61801",
        "Child Development Laboratory": "1105 W Nevada St, Urbana, IL 61801",
        "Civil Eng Hydrosystems Lab": "205 N Mathews Ave, Urbana, IL 61801",
        "Chemical and Life Sci Lab": "601 S Goodwin Ave, Urbana, IL 61801",
        "Campus Rec Outdoor Ctr": "51 E Gregory Dr, Champaign, IL 61820",
        "Coordinated Science Lab": "1308 W Main St, Urbana, IL 61801",
        "Colonel Wolfe School": "403 E Healey St, Champaign, IL 61820",
        "Ctr Wounded Veterans Higher Ed": "908 W Nevada St, Urbana, IL 61801",
        "Electrical & Computer Eng Bldg": "306 N Wright St, Urbana, IL 61801",
        "E R Madigan Laboratory": "1201 W Gregory Dr, Urbana, IL 61801",
        "FAR - Food Service Building": "Florida Avenue Residence Halls",
        "FAR Meeting Space": "Florida Avenue Residence Halls",
        "Fighting Illini Ctr for Excellence": "1700 S 4th St, Champaign, IL 61820",
        "Fire Service Institute Center": "11 Gerty Dr, Champaign, IL 61820",
        "Fred Turner Student Serv Bldg": "610 E John St, Champaign, IL 61820",
        "Garner Hall": "201 E Gregory Dr, Champaign, IL 61820",
        "Gregory Dr. Food Service": "301 E Gregory Dr, Champaign, IL 61820",
        "Grad Photo Studio": "1205 W Oregon St, Urbana, IL 61801",
        "Grad Sch of Lib & Info Science": "501 E Daniel St, Champaign, IL 61820",
        "Willard Airport: Hangar 1": "11 Airport Rd, Savoy, IL 61874",
        "Willard Airport: Hangar 4": "11 Airport Rd, Savoy, IL 61874",
        "Inst Gov & Public Affairs Bldg": "1007 W Nevada St, Urbana, IL 61801",
        "Inst Labor &  Industrial Rel": "504 E Armory Ave, Champaign, IL 61820",
        "Intramural-Phys Ed Bldg": "201 E Peabody Dr, Champaign, IL 61820",
        "Illinois Street Residence Lng": "1010 W Illinois St, Urbana, IL 61801",
        "Krannert Center for Perf Arts": "500 S Goodwin Ave, Urbana, IL 61801",
        "Lincoln Avenue Residence Hall": "1005 W Illinois St, Urbana, IL 61801",
        "Law Building": "504 E Pennsylvania Ave, Champaign, IL 61820",
        "Sidney Lu Mech Engr Bldg": "1206 W Green St, Urbana, IL 61801",
        "Micro & Nanotechnology Lab": "208 N Wright St, Urbana, IL 61801",
        "Seitz Materials Research Lab": "104 S Goodwin Ave, Urbana, IL 61801",
        "Materials Science & Eng Bld": "1304 W Green St, Urbana, IL 61801",
        "Meat Science Laboratory": "1503 S Maryland Dr, Urbana, IL 61801",
        "Civil & Envir Eng Bldg": "205 N Mathews Ave, Urbana, IL 61801",
        "Newmark Civil Engineering Bldg": "205 N Mathews Ave, Urbana, IL 61801",
        "Nat Center for Suprcomp Appl": "1205 W Clark St, Urbana, IL 61801",
        "Nuclear Engineering Lab": "103 S Goodwin Ave, Urbana, IL 61801",
        "Nuclear Radiations Laboratory": "103 S Goodwin Ave, Urbana, IL 61801",
        "Natural Res Studies Annex": "40.091290, -88.242558",
        "National Soybean Res Ctr": "National Soybean",
        "Optical Physics & Eng Bldg.": "405 N Mathews Ave, Urbana, IL 61801",
        "Optical Physics & Eng Lab": "405 N Mathews Ave, Urbana, IL 61801",
        "Peabody Food Serv Bldg": "301 E Peabody Dr, Champaign, IL 61820",
        "Pennsylvania Lounge Bld - PAR": "Pennsylvania Avenue Residence Halls",
        "Willard Airport: Q1": "11 Airport Rd, Savoy, IL 61874",
        "Willard Airport: Q3": "11 Airport Rd, Savoy, IL 61874",
        "Willard Airport: Q4": "11 Airport Rd, Savoy, IL 61874",
        "Willard Airport: Q5": "11 Airport Rd, Savoy, IL 61874",
        "Willard Airport: Q7": "11 Airport Rd, Savoy, IL 61874",
        "Willard Airport: Q8": "11 Airport Rd, Savoy, IL 61874",
        "Rehabilitation Educ Ctr": "1207 S Oak St, Champaign, IL 61820",
        "Richmond Studio": "1002 S Goodwin Ave, Urbana, IL 61801",
        "Sculpture Building": "408 E Peabody Dr, Champaign, IL 61820",
        "Student Dining & Res Program": "301 E Gregory Dr, Champaign, IL 61820",
        "South Farms": "3601 S Race St, Urbana, IL 61802",
        "Undergraduate Library": "1408 W Gregory Dr, Urbana, IL 61801",
        "Vegetable Crops Building": "1707 S Orchard St, Urbana, IL 61801",
        "Vet Med Basic Sciences Bldg": "2001 S Lincoln Ave, Urbana, IL 61802",
        "VetMed ClinicalSkillsLearnCntr": "2001 S Lincoln Ave, Urbana, IL 61802",
        "Veterinary Teaching Hospital": "40.091832, -88.222581",
        "Wardall Hall - ISR": "1012 W Illinois St, Urbana, 61801",
        "Storefront Studio": "740 S Gregory St, Urbana, IL 61801",
        "Illni Center": "200 S Wacker Dr, Chicago, IL 60606"
    }

    if building_name in renames:
        building_name = renames[building_name]
    else:
        building_name = building_name.split(',')[0]
        building_name = building_name.replace("Bldg", "Building")
        building_name = building_name.replace(" Bld", " Building")
        building_name = building_name.replace(" Dev", " Development")
        building_name = building_name.replace(" Serv ", " Services ")
        building_name = building_name.replace(" Sch ", " School ")
        building_name = building_name.replace("Inst ", "Institute of ")
        building_name = building_name.replace("Comp Sci", "Computer Science")

    base_url = "https://nominatim.openstreetmap.org/search?"
    params = {
        'q': building_name + " " + "Champaign County",
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
            print(f"No coordinates for {building_name}")
            return None, None
    except requests.exceptions.RequestException as e:
        print(f"Error retrieving data for {building_name}: {e}")
        return None, None
    finally:
        # Sleep for a short time to avoid hitting the rate limit
        time.sleep(0.3)


def insert_building_data(buildings_df, cursor):
    for _, row in buildings_df.iterrows():
        cursor.execute("""
            select * from Buildings where BuildingName = %s
        """, (row['BuildingName'],))
        building = cursor.fetchone()
        if building:
            continue

        latitude, longitude = get_lat_lon(row['BuildingName'])
        if not (latitude and longitude):
            print(f"No coordinates for {row['BuildingName']}")
        else:
            print(f"Coordinates for {row['BuildingName']}: {latitude}, {longitude}")
        sql = """
        INSERT INTO Buildings (BuildingId, BuildingName, Longitude, Latitude)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE 
            BuildingName = VALUES(BuildingName),
            BuildingId = VALUES(BuildingId),
            Longitude = VALUES(Longitude),
            Latitude = VALUES(Latitude)
        """
        values = (row['BuildingId'], row['BuildingName'], longitude, latitude)
        cursor.execute(sql, values)


def insert_room_data(rooms_df, cursor):
    for _, row in rooms_df.iterrows():
        sql = """
        INSERT INTO Rooms (RoomNumber, BuildingId, Capacity, Type)
        VALUES (%s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE Capacity = VALUES(Capacity), Type = VALUES(Type)
        """
        values = (row['RoomNumber'], row['BuildingId'], row['Capacity'], row['Type'])
        cursor.execute(sql, values)

def main():
    # Create connection to the database using environment variables
    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        # Load the Building CSV and Rooms CSV into pandas DataFrames
        buildings_file = '../scraping/buildings.csv'  # Path to your buildings CSV file
        rooms_file = '../scraping/rooms.csv'  # Path to your rooms CSV file

        buildings_df = pd.read_csv(buildings_file)
        rooms_df = pd.read_csv(rooms_file)

        # Insert data into Buildings and Rooms tables
        insert_building_data(buildings_df, cursor)
        # Commit the transaction
        connection.commit()

        insert_room_data(rooms_df, cursor)
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
