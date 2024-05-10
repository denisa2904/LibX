import psycopg2

with open('connection/db_connection', 'r') as f:
    DB_CONNECTION = f.read().strip()


def connect_to_db():
    """Establishes a connection to the PostgreSQL database."""
    conn = psycopg2.connect(DB_CONNECTION)
    conn.autocommit = True
    return conn