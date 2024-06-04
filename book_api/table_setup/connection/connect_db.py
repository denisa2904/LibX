import psycopg2

# with open('table_setup/connection/db_connection.txt', 'r') as f:
#     DB_CONNECTION = f.read().strip()
DB_CONNECTION = "dbname='libx' user='postgres' host='localhost' password='admin'"

def connect_to_db():
    """Establishes a connection to the PostgreSQL database."""
    conn = psycopg2.connect(DB_CONNECTION)
    conn.autocommit = True
    return conn
