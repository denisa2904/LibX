import uuid
import bcrypt
from connection.connect_db import connect_to_db


def create_user_table():
    """Creates a user table if it does not already exist."""
    conn = connect_to_db()
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                role VARCHAR(10) NOT NULL
            );
        """)
    conn.close()


def add_user(username, email, password, role='user'):
    """Adds a new user to the database, securely hashing the password."""
    conn = connect_to_db()
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO users (id, username, email, hashed_password, role) 
            VALUES (%s, %s, %s, %s, %s);
        """, (user_id, username, email, hashed_password, role))
    conn.close()


def main():
    create_user_table()
    username = 'admin'
    email = 'admin@admin.com'
    password = 'admin'
    add_user(username, email, password, 'admin')
    print("User added successfully.")


if __name__ == '__main__':
    main()
