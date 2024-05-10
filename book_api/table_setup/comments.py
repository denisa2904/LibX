from connection.connect_db import connect_to_db


def setup_database(conn):
    """Creates the necessary tables for the comments module."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                id UUID PRIMARY KEY,
                book_id UUID NOT NULL,
                user_id UUID NOT NULL,
                comment TEXT NOT NULL,
                FOREIGN KEY (book_id) REFERENCES book(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_comments_book_id ON comments (book_id);
            CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments (user_id);
        """)


def main():
    conn = connect_to_db()
    setup_database(conn)
    conn.close()
    print("Comments database setup complete.")


if __name__ == '__main__':
    main()
