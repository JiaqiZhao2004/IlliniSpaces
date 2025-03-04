from scraping.utils import download_xml, parse_2_level_xml

fname = 'subjects.xml'
subjects_master = 'https://courses.illinois.edu/cisapp/explorer/schedule/2025/spring.xml'
download_xml(subjects_master, fname)

subject_df = parse_2_level_xml(fname, 'subjects', 'subject',
                               ('abbr', 'href', 'name'), ('id', 'href'))
subject_df.to_csv('subjects.csv')
