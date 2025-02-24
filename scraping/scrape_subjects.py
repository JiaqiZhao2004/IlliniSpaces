import xml.etree.ElementTree as ET
import pandas as pd
from scraping.utils import download_xml

courses_master = 'https://courses.illinois.edu/cisapp/explorer/schedule/2025/spring.xml'
download_xml(courses_master, fname='subjects.xml')

xml_data = ET.parse('subjects.xml')
root = xml_data.getroot()
subjects = root.find('subjects')

subject_df = pd.DataFrame(columns=['abbr', 'name', 'href'])

for subject in subjects.findall('subject'):
    abbr = subject.get('id')
    name = subject.text
    href = subject.get('href')
    subject_df.loc[len(subject_df)] = [abbr, name, href]
    print(f"Subject: {name}, ID: {id}, href: {href}")

subject_df.to_csv('subjects.csv')
