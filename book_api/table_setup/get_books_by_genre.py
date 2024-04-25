import psycopg2

# Database connection parameters
DB_CONNECTION = "dbname='libx' user='postgres' host='localhost' password='admin'"


def connect_to_db(conn_str):
    """Establishes a connection to the PostgreSQL database."""
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    return conn


def fetch_books_by_genre(genre_name):
    """Fetches all books that are associated with a specific genre."""
    conn = connect_to_db(DB_CONNECTION)
    with conn.cursor() as cur:
        cur.execute("""
            SELECT b.id, b.title, b.author, b.year
            FROM book b
            JOIN book_genres bg ON b.id = bg.book_id
            JOIN genres g ON g.id = bg.genre_id
            WHERE g.genre = %s;
        """, (genre_name,))
        books = cur.fetchall()
    conn.close()
    return books


def main():
    conn = connect_to_db(DB_CONNECTION)
    with conn.cursor() as cur:
        cur.execute("SELECT genre FROM genres")
        genres = [row[0] for row in cur.fetchall()]
    conn.close()
    for genre_name in genres:
        books = fetch_books_by_genre(genre_name)
        if books:
            print(f"Books in the genre '{genre_name}':")
            for book in books:
                print(f"ID: {book[0]}, Title: {book[1]}, Author: {book[2]}, Year: {book[3]}")
        else:
            print(f"No books found in the genre '{genre_name}'.")
        print()


if __name__ == '__main__':
    main()
