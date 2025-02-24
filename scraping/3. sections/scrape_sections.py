import os
import pandas as pd
from scraping.utils import download_xml, parse_2_level_xml


def scrape_course_sections(subject_abbr, course_number, xml_url):
    fname = f'{subject_abbr}_{course_number}.xml'
    download_xml(xml_url, fname)

    subject_df = parse_2_level_xml(fname, 'sections', 'section',
                                   ('crn', 'href', 'section_name'), ('id', 'href'))
    subject_df.to_csv(f'{subject_abbr}_{course_number}.csv')


if __name__ == '__main__':
    for path in os.listdir('../2. courses'):
        if not path.endswith('.csv'):
            continue
        subject_df = pd.read_csv(f'../2. courses/{path}')
        subject_abbr = path.split('.')[0]

        for line in subject_df.itertuples():
            scrape_course_sections(subject_abbr=subject_abbr, course_number= line.number, xml_url=line.href)