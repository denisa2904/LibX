from psycopg2 import sql
from connection.connect_db import connect_to_db
import requests


def alter_table(conn):
    """Alters a table to add a new column."""
    with conn.cursor() as cur:
        cur.execute(f"""
            ALTER TABLE book
            ADD COLUMN IF NOT EXISTS previews TEXT;
        """)


def fetch_data(url):
    response = requests.get(url)
    return response.json()


def add_previews(conn, book_id, previews):
    """Adds a preview to a book."""
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE book
            SET previews = %s
            WHERE google_id = %s;
        """, (previews, book_id))


def add_previews_to_all_books(conn):
    """Adds a preview to all books."""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT google_id
            FROM book;
        """)
        book_ids = cur.fetchall()
        for book_id in book_ids:
            link = f'https://www.googleapis.com/books/v1/volumes/{book_id[0]}'
            print(link)
            book_detail = fetch_data(link)
            print(book_detail)
            preview = book_detail['accessInfo'].get('webReaderLink', 'No preview available.')
            if preview != 'No preview available.' and book_detail['accessInfo']['viewability'] == 'NONE':
                    preview = 'No preview available.'
            print(preview)
            add_previews(conn, book_id, preview)


def main():
    conn = connect_to_db()
    # alter_table(conn)
    add_previews_to_all_books(conn)
    conn.close()
    print("Previews added successfully.")


if __name__ == '__main__':
    main()
