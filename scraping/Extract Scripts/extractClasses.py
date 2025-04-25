import os
import xml.etree.ElementTree as ET
from datetime import datetime
from dotenv import load_dotenv
from tqdm import tqdm
from backend.app import get_db_connection
import re


def format_time_12_to_24(time_str):
    time_obj = datetime.strptime(time_str, "%I:%M %p")  # Parse as 12-hour time
    military_time = time_obj.strftime("%H:%M")  # Format as 24-hour time
    return military_time


def parse_xml_file(file_path):
    # print(f"\r Parsing XML file {file_path}")
    tree = ET.parse(file_path)
    root = tree.getroot()

    ns = {'ns2': 'http://rest.cis.illinois.edu'}  # Define namespace

    # course data
    try:
        crn = int(root.attrib["id"])
    except KeyError:
        print(f"No crn found in {file_path}")
        return None
    # calendarYear = root.find("parents/calendarYear", ns).text.strip()
    # calendarYear = int(calendarYear)
    subjectCode = root.find("parents/subject", ns).attrib["id"].strip()
    # subjectName = root.find("parents/subject", ns).text.strip()
    courseNumber = root.find("parents/course", ns).attrib["id"].strip()
    courseName = root.find("parents/course", ns).text.strip()
    try:
        sectionNumber = root.find("sectionNumber", ns).text.strip()
    except AttributeError:
        print(f"No section number found in {subjectCode}/{courseNumber}/{crn}")
        sectionNumber = "None"
    # typeCode = root.find("meetings/meeting/type", ns).attrib["code"].strip()
    typeName = root.find("meetings/meeting/type", ns).text.strip()
    if typeName == "Online" or typeName == "Online Lab":
        print(f"Skipping ONLINE {subjectCode}/{courseNumber}/{crn}")
        return None

    # reservation data
    try:
        start_time = root.find("meetings/meeting/start", ns).text.strip()
        if start_time == "ARRANGED":
            print(f"Skipping ARRANGED {subjectCode}/{courseNumber}/{crn}")
            return None
        start_time = format_time_12_to_24(start_time)
        end_time = root.find("meetings/meeting/end", ns).text.strip()
        end_time = format_time_12_to_24(end_time)
        daysOfTheWeek = root.find("meetings/meeting/daysOfTheWeek", ns).text.strip()
    except (KeyError, AttributeError) as e:
        print(f"I GIVE UP! Skipping {subjectCode}/{courseNumber}/{crn} due to {e}")
        return None

    try:
        roomNumber = root.find("meetings/meeting/roomNumber", ns).text.strip()
        buildingName = root.find("meetings/meeting/buildingName", ns).text.strip()
    except (KeyError, AttributeError):
        print(f"Skipping NO LOCATION {subjectCode}/{courseNumber}/{crn}")
        return None

    try:
        start_date = root.find('startDate', ns).text[:10]
        end_date = root.find('endDate', ns).text[:10]
    except (KeyError, AttributeError):
        sectionDateRange = root.find('sectionDateRange', ns)
        if sectionDateRange is None:
            # get course's dates
            course_tree = ET.parse("../ClassSections/3. sections/" + subjectCode + "_" + courseNumber + ".xml")
            course_root = course_tree.getroot()
            sectionDateRange = course_root.find("sectionDateRange", ns)
        if sectionDateRange is None:
            print(f"I GIVE UP! Error finding date range for class {subjectCode}/{courseNumber}/{crn}")
            return None

        sectionDateRange = sectionDateRange.text.strip()
        date_matches = re.findall(r'\b\d{2}-(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}\b',
                                  sectionDateRange)
        if len(date_matches) >= 2:
            start_date = datetime.strptime(date_matches[0], "%d-%b-%y").strftime("%Y-%m-%d")
            end_date = datetime.strptime(date_matches[-1], "%d-%b-%y").strftime("%Y-%m-%d")
        else:
            print(f"I GIVE UP! Error parsing date range for class {subjectCode}/{courseNumber}/{crn}")
            return None

    # section_data = {"crn": crn, "calendarYear": calendarYear, "subjectCode": subjectCode,
    #                 "subjectName": subjectName, "courseNumber": courseNumber,
    #                 "courseName": courseName, "sectionNumber": sectionNumber, "typeCode": typeCode,
    #                 "typeName": typeName}

    reservation_data = {"eventId": crn, "startDate": start_date, "endDate": end_date,
                        "startTime": start_time, "endTime": end_time,
                        "daysOfTheWeek": daysOfTheWeek,
                        "roomNumber": roomNumber, "buildingName": buildingName,
                        "eventName": f"{subjectCode} {courseNumber} {sectionNumber} {courseName}"}

    return reservation_data


def get_building_id(cursor, building_name):
    cursor.execute("SELECT BuildingId FROM Buildings WHERE BuildingName = %s", (building_name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    else:
        print(f"I GIVE UP! Error finding building_id for {building_name}")
        return None
    # cursor.execute("INSERT INTO Buildings (BuildingId, BuildingName) VALUES (%s, %s)", (building_name,))
    # return cursor.lastrowid


def insert_course_section(cursor, reservation_data):
    if not reservation_data:
        return
    building_id = get_building_id(cursor, reservation_data["buildingName"])
    if building_id:
        cursor.execute("""
            INSERT INTO HardReservations (EventId, StartDate, EndDate, Repeats, StartTime, EndTime, EventName, RoomNumber, BuildingId)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE 
                StartDate = VALUES(StartDate),
                EndDate = VALUES(EndDate),
                Repeats = VALUES(Repeats),
                StartTime = VALUES(StartTime),
                EndTime = VALUES(EndTime),
                EventName = VALUES(EventName),
                RoomNumber = VALUES(RoomNumber),
                BuildingId = VALUES(BuildingId)
        """, (reservation_data["eventId"], reservation_data["startDate"],
              reservation_data["endDate"], reservation_data["daysOfTheWeek"],
              reservation_data["startTime"], reservation_data["endTime"],
              reservation_data["eventName"], reservation_data["roomNumber"], building_id))


def process_xml_files(folder_path):
    conn = get_db_connection()
    cursor = conn.cursor()

    for file_name in tqdm(os.listdir(folder_path)):
        if file_name.endswith(".xml"):
            file_path = os.path.join(folder_path, file_name)
            course_data = parse_xml_file(file_path)
            insert_course_section(cursor, course_data)

    conn.commit()
    conn.close()


load_dotenv()
process_xml_files("../ClassSections/4. section data")
