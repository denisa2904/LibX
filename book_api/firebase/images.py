import os
import requests
import psycopg2
import firebase_admin
from firebase_admin import credentials, storage
from google.cloud import datastore
from requests.exceptions import RequestException

# Database connection parameters
DB_CONNECTION = "dbname='libx' user='postgres' host='localhost' password='admin'"

# Set up Google Cloud Datastore
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'cloud_sdk/libx-bc35e-535ab2ee56a3.json'
datastore_client = datastore.Client()

# Initialize Firebase Admin
cred = credentials.Certificate('sdk/libx-bc35e-firebase-adminsdk-w56by-904deb33b8.json')
app = firebase_admin.initialize_app(cred, {
    'storageBucket': 'libx-bc35e.appspot.com'
})
bucket = storage.bucket(app=app)


def connect_db():
    conn = psycopg2.connect(DB_CONNECTION)
    return conn


def fetch_book_ids():
    conn = connect_db()
    with conn.cursor() as cur:
        cur.execute("SELECT google_id FROM book")
        book_ids = [row[0] for row in cur.fetchall()]
    conn.close()
    return book_ids


def fetch_data(url):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch data, status code: {response.status_code}")
            return None
    except RequestException as e:
        print(f"Error during requests to {url}: {e}")
        return None


def upload_image_to_firebase(image_url, file_path):
    try:
        response = requests.get(image_url)
        if response.status_code == 200:
            blob = bucket.blob(file_path)
            blob.upload_from_string(response.content, content_type='image/jpeg')
            return blob.public_url
        else:
            print(f"Failed to download image, status code: {response.status_code}")
            return None
    except RequestException as e:
        print(f"Error during requests to {image_url}: {e}")
        return None


def save_to_datastore(title, image_url):
    if image_url:
        entity = datastore.Entity(key=datastore_client.key('Book'))
        entity.update({
            'title': title,
            'image_url': image_url
        })
        datastore_client.put(entity)
        print(f"Saved to Datastore: {title}")
    else:
        print("No image URL provided, not saving to datastore.")


def main():
    book_ids = fetch_book_ids()
    for book_id in book_ids:
        api_url = f"https://www.googleapis.com/books/v1/volumes/{book_id}"
        book_detail = fetch_data(api_url)
        if book_detail and 'volumeInfo' in book_detail and 'imageLinks' in book_detail[
            'volumeInfo'] and 'smallThumbnail' in book_detail['volumeInfo']['imageLinks']:
            image_url = book_detail['volumeInfo']['imageLinks']['smallThumbnail']
            filename = f"{book_id}_smallThumbnail.jpg"
            public_url = upload_image_to_firebase(image_url, filename)
            save_to_datastore(book_detail['volumeInfo'].get('title', 'Unknown Title'), public_url)
        else:
            # delete the book from database
            conn = connect_db()
            with conn.cursor() as cur:
                cur.execute("DELETE FROM book WHERE google_id = %s", (book_id,))
            conn.close()


if __name__ == "__main__":
    main()
