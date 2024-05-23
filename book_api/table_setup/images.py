from connection.connect_db import connect_to_db


def setup_database(conn):
    """Creates the necessary tables for the images module."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS images (
                id UUID PRIMARY KEY,
                title TEXT NOT NULL,
                book_id UUID NOT NULL,
                type TEXT NOT NULL,
                FOREIGN KEY (book_id) REFERENCES book(id)
            );
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_images_book_id ON images (book_id);
        """)


def main():
    conn = connect_to_db()
    setup_database(conn)
    conn.close()
    print("Images database setup complete.")


if __name__ == '__main__':
    main()