import psycopg2
import requests
import uuid

DB_CONNECTION = "dbname='libx' user='postgres' host='localhost' password='admin'"
URL = "https://www.googleapis.com/books/v1/volumes/"


def fetch_data(api_id):
    response = requests.get(f"{URL}{api_id}")
    return response.json()


def connect_to_db(conn_str):
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    return conn


def create_tables():
    conn = connect_to_db(DB_CONNECTION)
    with conn.cursor() as cur:
        # Create genres table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS genres (
                id UUID PRIMARY KEY,
                genre TEXT NOT NULL UNIQUE
            );
        """)
        # Create book_genres linking table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS book_genres (
                book_id UUID,
                genre_id UUID,
                PRIMARY KEY (book_id, genre_id),
                FOREIGN KEY (book_id) REFERENCES book (id),
                FOREIGN KEY (genre_id) REFERENCES genres (id)
            );
        """)
    conn.close()


def fetch_book_ids():
    conn = connect_to_db(DB_CONNECTION)
    with conn.cursor() as cur:
        cur.execute("SELECT google_id, id FROM book")
        books = cur.fetchall()
    conn.close()
    return books


def insert_genre(conn, genre):
    genre_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO genres (id, genre) VALUES (%s, %s) ON CONFLICT (genre) DO NOTHING RETURNING id;
        """, (genre_id, genre))
        return genre_id


def link_book_to_genre(conn, book_id, genre_id):
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO book_genres (book_id, genre_id) VALUES (%s, %s) ON CONFLICT DO NOTHING RETURNING book_id, genre_id;
        """, (book_id, genre_id))


def process_genres():
    books = fetch_book_ids()
    conn = connect_to_db(DB_CONNECTION)
    genre_ids = {}
    for google_id, book_id in books:
        data = fetch_data(google_id)
        if 'categories' in data['volumeInfo']:
            categories = data['volumeInfo']['categories']
            for category in categories:
                for genre in category.split(' / '):
                    if genre not in genre_ids:
                        genre_id = insert_genre(conn, genre)
                        genre_ids[genre] = genre_id
                    link_book_to_genre(conn, book_id, genre_ids[genre])
    conn.close()


def main():
    create_tables()
    process_genres()


if __name__ == '__main__':
    main()
