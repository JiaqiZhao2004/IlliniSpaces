import pandas as pd
import requests
import xml.etree.ElementTree as ET


def download_xml(url, fname=None):
    # Send a GET request to the URL
    response = requests.get(url)

    if fname is None:
        fname = url.split('/')[-1]

    # Check if the request was successful
    if response.status_code == 200:
        # Open a local file in write-binary mode
        with open(fname, 'wb') as file:
            # Write the content of the response to the file
            file.write(response.content)
        print(f'XML file downloaded and saved as {fname}')
    else:
        print(f'Failed to download the XML file. HTTP Status Code: {response.status_code}')


def parse_2_level_xml(fpath, level1_name='subjects', level2_name='subject',
                      column_names=('id', 'href', 'name'), field_names=('id', 'href')):
    xml_data = ET.parse(fpath)
    root = xml_data.getroot()
    subjects = root.find(level1_name)

    df = pd.DataFrame(columns=column_names)

    for subject in subjects.findall(level2_name):
        field1 = subject.get(field_names[0])
        field2 = subject.get(field_names[1])
        text = subject.text
        df.loc[len(df)] = [field1, field2, text]
        print(f"{field1}, {field2}, {text}")

    return df
