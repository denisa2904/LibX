import os
import uuid

import requests
import firebase_admin
from firebase_admin import credentials, storage
from google.cloud import datastore
from requests.exceptions import RequestException
from table_setup.connection.connect_db import connect_to_db

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'cloud_sdk/libx-bc35e-535ab2ee56a3.json'
datastore_client = datastore.Client()

cred = credentials.Certificate('sdk/firebaseProps.json')
app = firebase_admin.initialize_app(cred, {
    'storageBucket': 'libx-bc35e.appspot.com'
})
bucket = storage.bucket(app=app)


def fetch_book_ids():
    conn = connect_to_db()
    book_ids = []
    with conn.cursor() as cur:
        cur.execute("SELECT google_id FROM book")
        book_ids = [row[0] for row in cur.fetchall()]
        for google_id in book_ids:
            img_id = str(uuid.uuid4())
            real_id = get_id_for_book(google_id)
            cur.execute("INSERT INTO images (id, title, book_id, type) "
                        "VALUES (%s, %s, %s, 'image/jpeg') ON CONFLICT DO NOTHING", (img_id, real_id, real_id))
    conn.close()
    return book_ids


def get_id_for_book(google_id):
    conn = connect_to_db()
    book_id = None
    with conn.cursor() as cur:
        cur.execute("SELECT id FROM book WHERE google_id = %s", (google_id,))
        book_id = cur.fetchone()[0]
    conn.close()
    return book_id


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
        if (book_detail and 'volumeInfo' in book_detail and 'imageLinks'
                in book_detail['volumeInfo'] and 'large' in book_detail['volumeInfo']['imageLinks']):
            image_url = book_detail['volumeInfo']['imageLinks']['large']
            db_id = get_id_for_book(book_id)
            filename = f"{db_id}.jpg"
            public_url = upload_image_to_firebase(image_url, filename)
            save_to_datastore(book_detail['volumeInfo'].get('title', 'Unknown Title'), public_url)
        else:
            conn = connect_to_db()
            with conn.cursor() as cur:
                cur.execute("DELETE FROM book_genres WHERE book_id = (SELECT id FROM book WHERE google_id = %s)", (book_id,))
                cur.execute("DELETE FROM recommendations WHERE book_id = (SELECT id FROM book WHERE google_id = %s) OR recommended_book_id= (SELECT id FROM book WHERE google_id = %s)", (book_id,book_id,))
                cur.execute("DELETE FROM images WHERE book_id = (SELECT id FROM book WHERE google_id = %s)", (book_id,))
                cur.execute("DELETE FROM book WHERE google_id = %s", (book_id,))
            conn.close()


if __name__ == "__main__":
    main()
