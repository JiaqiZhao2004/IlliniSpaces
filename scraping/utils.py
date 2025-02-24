import requests


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

