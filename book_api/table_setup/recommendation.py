from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from connection.connect_db import connect_to_db


def setup_database(conn):
    """Creates the necessary tables for the recommendation module."""
    with conn.cursor() as crs:
        crs.execute("""
            CREATE TABLE IF NOT EXISTS recommendations (
                book_id UUID NOT NULL,
                recommended_book_id UUID NOT NULL,
                PRIMARY KEY (book_id, recommended_book_id),
                FOREIGN KEY (book_id) REFERENCES book(id),
                FOREIGN KEY (recommended_book_id) REFERENCES book(id)
            );
        """)


def insert_recommendation(conn, recs):
    """Inserts recommendations into the database.
       'recs' is a list of tuples (book_id, recommended_book_id)."""
    with conn.cursor() as crs:
        crs.executemany("""
            INSERT INTO recommendations (book_id, recommended_book_id) VALUES (%s, %s);
        """, recs)


def get_all_books(conn):
    """Extracts all books' ids and descriptions in a json """
    with conn.cursor() as crs:
        crs.execute("SELECT id, description FROM book")
        books = crs.fetchall()
    data = {'book_id': [book[0] for book in books], 'description': [book[1] for book in books]}
    return data


def text_processing(data):
    """Processes the text data to be used in the recommendation system."""
    data = pd.DataFrame(data)
    tfidf = TfidfVectorizer(stop_words='english')
    tfidf_matrix = tfidf.fit_transform(data['description'])
    return tfidf_matrix


def get_recommendations(conn):
    """Generates recommendations for each book."""
    data = get_all_books(conn)
    data = pd.DataFrame(data)
    tfidf_matrix = text_processing(data)
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    recommendations = []
    for idx, row in data.iterrows():
        similar_indices = cosine_sim[idx].argsort()[:-11:-1]
        similar_books = [(data['book_id'][i], cosine_sim[idx][i]) for i in similar_indices]
        recommendations.extend([(row['book_id'], book[0]) for book in similar_books if book[0] != row['book_id']])
    return recommendations


def check_recommendation_table(conn):
    """For each book, get its title and the titles of the recommended books."""
    with conn.cursor() as crs:
        crs.execute("""
            SELECT b1.title, b2.title
            FROM book b1
            JOIN recommendations r ON b1.id = r.book_id
            JOIN book b2 ON r.recommended_book_id = b2.id
        """)
        recs = crs.fetchall()
    return recs


def main():
    conn = connect_to_db()
    setup_database(conn)
    recs = get_recommendations(conn)
    insert_recommendation(conn, recs)
    recs = check_recommendation_table(conn)
    conn.close()
    # print("Recommendations database setup complete.")
    print("Recommendations:")
    for rec in recs:
        print(f"{rec[0]} -> {rec[1]}")


if __name__ == '__main__':
    main()
