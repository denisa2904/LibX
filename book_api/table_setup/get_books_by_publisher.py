from connection.connect_db import connect_to_db


def fetch_books_by_publisher(publisher_name):
    """Fetches all books that are published by a specific publisher."""
    conn = connect_to_db()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT id, title, author, year, description
            FROM book
            WHERE publisher = %s;
        """, (publisher_name,))
        books = cur.fetchall()
    conn.close()
    return books


def main():
    conn = connect_to_db()
    with conn.cursor() as cur:
        cur.execute("SELECT DISTINCT publisher FROM book")
        publishers = [row[0] for row in cur.fetchall()]
    conn.close()
    for publisher_name in publishers:
        books = fetch_books_by_publisher(publisher_name)
        if books:
            print(f"Books published by '{publisher_name}':")
            for book in books:
                print(f"Title: {book[1]}")
        print()


if __name__ == '__main__':
    main()
