from connection.connect_db import connect_to_db


def setup_database(conn):
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS rented_books (
                user_id UUID NOT NULL,
                book_id UUID NOT NULL,
                rented_on DATE NOT NULL DEFAULT CURRENT_DATE,
                PRIMARY KEY (user_id, book_id),
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (book_id) REFERENCES book(id)
            );
        """)


def main():
    conn = connect_to_db()
    setup_database(conn)
    conn.close()


if __name__ == '__main__':
    main()
