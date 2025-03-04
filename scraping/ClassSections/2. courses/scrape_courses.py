import pandas as pd
from scraping.utils import download_xml, parse_2_level_xml


def scrape_subject_courses(subject_abbr, xml_url):
    fname = f'{subject_abbr}.xml'
    download_xml(xml_url, fname)

    subject_df = parse_2_level_xml(fname, 'courses', 'course',
                                   ('number', 'href', 'name'), ('id', 'href'))
    subject_df.to_csv(f'{subject_abbr}.csv')


if __name__ == '__main__':
    subjects = pd.read_csv('../subjects.csv')
    for line in subjects.itertuples():
        scrape_subject_courses(subject_abbr=line.abbr, xml_url=line.href)