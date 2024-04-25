import uuid

import psycopg2
import bcrypt

DB_CONNECTION = "dbname='libx' user='postgres' host='localhost' password='admin'"


def connect_to_db(conn_str):
    """Establishes a connection to the PostgreSQL database."""
    conn = psycopg2.connect(conn_str)
    conn.autocommit = True
    return conn


def create_user_table():
    """Creates a user table if it does not already exist."""
    conn = connect_to_db(DB_CONNECTION)
    with conn.cursor() as cur:
        cur.execute("""
            DROP TABLE IF EXISTS users;
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL
            );
        """)
    conn.close()


def add_user(username, email, password):
    """Adds a new user to the database, securely hashing the password."""
    conn = connect_to_db(DB_CONNECTION)
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    user_id = str(uuid.uuid4())
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO users (id, username, email, hashed_password) 
            VALUES (%s, %s, %s, %s);
        """, (user_id, username, email, hashed_password))
    conn.close()


def main():
    create_user_table()
    username = input("Enter username: ")
    email = input("Enter email: ")
    password = input("Enter password: ")
    add_user(username, email, password)
    print("User added successfully.")


if __name__ == '__main__':
    main()
