import psycopg2


# Database connection parameters
DB_CONNECTION = "dbname='libx' user='postgres' host='localhost' password='admin'"


def connect_to_db(conn_str):
    """Establishes a connection to the PostgreSQL database."""
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    return conn


def setup_database(conn):
    """Creates the necessary tables for the ratings module."""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS ratings (
                book_id UUID NOT NULL,
                user_id UUID NOT NULL,
                rating INT CHECK (rating >= 1 AND rating <= 5),
                PRIMARY KEY (book_id, user_id),
                FOREIGN KEY (book_id) REFERENCES book(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        """)
        cur.execute("""
            CREATE INDEX IF NOT EXISTS idx_ratings_book_id ON ratings (book_id);
            CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings (user_id);
        """)


def main():
    conn = connect_to_db(DB_CONNECTION)
    setup_database(conn)
    conn.close()
    print("Ratings database setup complete.")


if __name__ == '__main__':
    main()


