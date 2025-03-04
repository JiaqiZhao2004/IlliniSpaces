import os
import pandas as pd
from scraping.utils import download_xml, parse_2_level_xml
import xml.etree.ElementTree as ET


for path in os.listdir('../3. sections'):
    if not path.endswith('.csv'):
        continue
    section_df = pd.read_csv(f'../3. sections/{path}')
    prefix = path.split('.')[0]

    for line in section_df.itertuples():
        fname = f'{prefix}_{str(line.section_name).strip()}_{line.crn}.xml'
        download_xml(line.href, fname)
