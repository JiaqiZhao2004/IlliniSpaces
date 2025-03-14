import os
import sqlite3
import xml.etree.ElementTree as ET

def parse_xml_file(file_path):
    tree = ET.parse(file_path)
    root = tree.getroot()
    
    ns = {'ns2': 'http://rest.cis.illinois.edu'}  # Define namespace
    
    event_id = int(root.get('id'))
    start_date = root.find('ns2:startDate', ns).text[:10]
    end_date = root.find('ns2:endDate', ns).text[:10]
    
    meeting = root.find('.//ns2:meeting', ns)
    start_time = meeting.find('ns2:start', ns).text
    end_time = meeting.find('ns2:end', ns).text
    
    event_name = root.find('.//ns2:course', ns).text.strip()
    room_number = int(meeting.find('ns2:roomNumber', ns).text)
    building_name = meeting.find('ns2:buildingName', ns).text.strip()
    
    return (event_id, start_date, end_date, None, start_time, end_time, event_name, room_number, building_name)

def get_building_id(cursor, building_name):
    cursor.execute("SELECT BuildingId FROM Buildings WHERE BuildingName = ?", (building_name,))
    result = cursor.fetchone()
    
    if result:
        return result[0]
    else:
        cursor.execute("INSERT INTO Buildings (BuildingName) VALUES (?)", (building_name,))
        return cursor.lastrowid

def insert_course_section(cursor, data):
    event_id, start_date, end_date, repeats, start_time, end_time, event_name, room_number, building_name = data
    
    building_id = get_building_id(cursor, building_name)
    
    cursor.execute("""
        INSERT INTO HardReservations (EventId, StartDate, EndDate, Repeats, StartTime, EndTime, EventName, RoomNumber, BuildingId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (event_id, start_date, end_date, repeats, start_time, end_time, event_name, room_number, building_id))

def process_xml_files(folder_path, db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".xml"):
            file_path = os.path.join(folder_path, file_name)
            course_data = parse_xml_file(file_path)
            insert_course_section(cursor, course_data)
    
    conn.commit()
    conn.close()

# Example usage
folder_path = "path/to/xml/folder"  # Change to your folder path
db_path = "path/to/database.db"  # Change to your database path
process_xml_files(folder_path, db_path)