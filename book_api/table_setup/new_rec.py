import psycopg2
import psycopg2.extras
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from connection.connect_db import connect_to_db


def setup_database(conn):
    """Creates the necessary tables for the recommendation module."""
    try:
        with conn.cursor() as crs:
            crs.execute("""
                DROP TABLE IF EXISTS recommendations;
                CREATE TABLE IF NOT EXISTS recommendations (
                    book_id UUID NOT NULL,
                    recommended_book_id UUID NOT NULL,
                    similarity_score REAL NOT NULL,
                    PRIMARY KEY (book_id, recommended_book_id),
                    FOREIGN KEY (book_id) REFERENCES book(id),
                    FOREIGN KEY (recommended_book_id) REFERENCES book(id)
                    ON DELETE CASCADE
                );
            """)
            conn.commit()
    except Exception as e:
        print(f"Error setting up database: {e}")
        conn.rollback()


def insert_recommendation(conn, recs):
    """Inserts recommendations into the database using batch inserts."""
    try:
        with conn.cursor() as crs:
            psycopg2.extras.execute_batch(crs, """
                INSERT INTO recommendations (book_id, recommended_book_id, similarity_score) VALUES (%s, %s, %s)
                ON CONFLICT DO NOTHING;
            """, recs, page_size=100)
        conn.commit()
    except Exception as e:
        print(f"Failed to insert recommendations: {e}")
        conn.rollback()


def get_all_books(conn):
    """Extracts all books' ids and descriptions."""
    try:
        with conn.cursor() as crs:
            crs.execute("SELECT id, description FROM book")
            books = crs.fetchall()
        return {'book_id': [book[0] for book in books], 'description': [book[1] for book in books]}
    except Exception as e:
        print(f"Error retrieving books: {e}")
        return None


def text_processing(data):
    """Processes the text data to be used in the recommendation system."""
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(data['description'])
    return tfidf_matrix


def get_recommendations(conn):
    """Generates recommendations for each book."""
    data = get_all_books(conn)
    if data:
        data_frame = pd.DataFrame(data)
        tfidf_matrix = text_processing(data_frame)
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        recommendations = []
        for idx, row in data_frame.iterrows():
            similar_indices = cosine_sim[idx].argsort()[:-12:-1]
            recommendations.extend([
                (row['book_id'], data_frame['book_id'][i], float(cosine_sim[idx][i]))
                for i in similar_indices if i != idx
            ])
        return recommendations
    else:
        return []


def main():
    conn = connect_to_db()
    setup_database(conn)
    recs = get_recommendations(conn)
    if recs:
        insert_recommendation(conn, recs)
    conn.close()
    print("Recommendations updated.")


if __name__ == '__main__':
    main()
