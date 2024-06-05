import requests
import uuid
import psycopg2
from psycopg2 import sql
from connection.connect_db import connect_to_db

# Constants
API_URL = "https://www.googleapis.com/books/v1/volumes?q=inauthor:Patricia+Cornwell"


def fetch_data(url):
    response = requests.get(url)
    return response.json()


def setup_database(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS book (
                id UUID PRIMARY KEY,
                google_id TEXT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                isbn TEXT NOT NULL,
                publisher TEXT NOT NULL,
                year INT NOT NULL,
                description TEXT NOT NULL,
                rating FLOAT NOT NULL
            );
        """)


def insert_books_data(conn, books):
    with conn.cursor() as cur:
        query = sql.SQL("""
            INSERT INTO book (id, google_id, title, author, isbn, publisher, year, description, rating)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 0.0)
            ON CONFLICT (id) DO NOTHING;
        """)
        for book in books:
            image = book['volumeInfo'].get('imageLinks', {}).get('thumbnail', 'None')
            volume_info = book['volumeInfo']
            authors = volume_info.get('authors', ['Unknown'])[0]
            book_id = str(uuid.uuid4())
            book_tuple = (
                book_id,
                book['id'],
                volume_info['title'],
                authors,
                volume_info.get('industryIdentifiers', [{'identifier': 'N/A'}])[0]['identifier'],
                volume_info.get('publisher', 'N/A'),
                volume_info.get('publishedDate', 'N/A')[:4],
                volume_info.get('description', 'No description available')
            )
            if image != 'None' and book_tuple[4] != 'N/A' and book_tuple[
                7] != 'No description available' and authors != 'Unknown' and book_tuple[5] != 'N/A' and book_tuple[
                6] != 'N/A':
                cur.execute(query, book_tuple)


def main():
    data = fetch_data(API_URL)

    if 'items' in data:
        # Connect to DB
        conn = connect_to_db()

        # Setup DB
        # setup_database(conn)

        # Insert data
        insert_books_data(conn, data['items'])

        # Close connection
        conn.close()

        print("Data inserted successfully.")
    else:
        print("No books found.")


if __name__ == "__main__":
    main()
