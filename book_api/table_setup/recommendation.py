import psycopg2

# Database connection parameters
DB_CONNECTION = "dbname='libx' user='postgres' host='localhost' password='admin'"


def connect_to_db(conn_str):
    """Establishes a connection to the PostgreSQL database."""
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    return conn


def setup_database(conn):
    """Creates the necessary tables for the recommendation module."""
    with conn.cursor() as crs:
        crs.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                user_id UUID NOT NULL,
                book_id UUID NOT NULL,
                PRIMARY KEY (user_id, book_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (book_id) REFERENCES book(id)
            );
        """)


def insert_recommendation(conn, recs):
    """Inserts recommendations into the database.
       'recs' is a list of tuples (user_id, book_id, recommended_at)."""
    with conn.cursor() as crs:
        crs.executemany("""
            INSERT INTO recommendations (user_id, book_id) VALUES (%s, %s);
        """, recs)


def main():
    conn = connect_to_db(DB_CONNECTION)
    setup_database(conn)
    conn.close()
    print("Recommendations database setup complete.")


if __name__ == '__main__':
    main()

