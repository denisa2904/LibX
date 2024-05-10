from connection.connect_db import connect_to_db


def setup_database(conn):
    """Creates the necessary tables for the user_books module."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS rented_books (
                user_id UUID NOT NULL,
                book_id UUID NOT NULL,
                PRIMARY KEY (user_id, book_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (book_id) REFERENCES book(id)
            );
        """)


def main():
    conn = connect_to_db()
    setup_database(conn)
    conn.close()
    print("User books database setup complete.")


if __name__ == '__main__':
    main()