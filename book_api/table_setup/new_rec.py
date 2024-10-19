import uuid

import pandas as pd
import numpy as np
from scipy.sparse.linalg import svds
from connection.connect_db import connect_to_db


def fetch_data(conn):
    similarity_query = """
            SELECT a.user_id as user1, b.user_id as user2, COUNT(*) as common_books
            FROM (
                SELECT user_id, book_id FROM favorites
                UNION ALL
                SELECT user_id, book_id FROM rented_books
                UNION ALL
                SELECT user_id, book_id FROM read_history
            ) a
            JOIN (
                SELECT user_id, book_id FROM favorites
                UNION ALL
                SELECT user_id, book_id FROM rented_books
                UNION ALL
                SELECT user_id, book_id FROM read_history
            ) b ON a.book_id = b.book_id AND a.user_id != b.user_id
            GROUP BY a.user_id, b.user_id
        """
    interaction_query = """
        SELECT user_id, book_id, SUM(rating) as rating
        FROM (
            SELECT user_id, book_id, rating FROM ratings
            UNION ALL
            SELECT user_id, book_id, 3 AS rating FROM favorites
            UNION ALL
            SELECT user_id, book_id, 2 AS rating FROM rented_books
            UNION ALL
            SELECT user_id, book_id, 1 AS rating FROM read_history
        ) AS combined
        GROUP BY user_id, book_id
    """
    read_history_query = "SELECT user_id, book_id FROM read_history"

    with conn.cursor() as crs:
        crs.execute(interaction_query)
        interaction_data = crs.fetchall()

        crs.execute(read_history_query)
        read_history_data = crs.fetchall()

        crs.execute(similarity_query)
        similarity_data = crs.fetchall()

    return interaction_data, read_history_data, similarity_data


def create_matrix(interaction_data, similarity_data):
    interactions = pd.DataFrame(interaction_data, columns=['user_id', 'book_id', 'rating'])
    interactions['user_id'] = interactions['user_id'].apply(uuid.UUID)
    user_book_matrix = interactions.pivot(index='user_id', columns='book_id', values='rating').fillna(0)

    similarities = pd.DataFrame(similarity_data, columns=['user1', 'user2', 'common_books'])
    similarities['user1'] = similarities['user1'].apply(uuid.UUID)
    similarities['user2'] = similarities['user2'].apply(uuid.UUID)

    for _, row in similarities.iterrows():
        user1, user2, common_books = row['user1'], row['user2'], row['common_books']
        if user1 in user_book_matrix.index and user2 in user_book_matrix.index:
            user_book_matrix.loc[user1] += user_book_matrix.loc[user2] * common_books
            user_book_matrix.loc[user2] += user_book_matrix.loc[user1] * common_books

    return user_book_matrix


def get_recommendations(data, read_history_data):
    data = data.fillna(0)
    R = data.values
    user_ratings_mean = np.mean(R, axis=1)
    vertical_user_ratings_mean = user_ratings_mean.reshape(-1, 1)
    R_demeaned = R - vertical_user_ratings_mean

    U, sigma, Vt = svds(R_demeaned, k=3)
    sigma = np.diag(sigma)
    all_user_predicted_ratings = np.dot(np.dot(U, sigma), Vt) + vertical_user_ratings_mean
    preds = pd.DataFrame(all_user_predicted_ratings, columns=data.columns, index=data.index)

    read_history = pd.DataFrame(read_history_data, columns=['user_id', 'book_id'])
    read_history['user_id'] = read_history['user_id'].apply(uuid.UUID)

    recommendations = []
    for user_id, row in preds.iterrows():
        user_read_books = set(read_history[read_history['user_id'] == user_id]['book_id'])
        filtered_books = [(data.columns[i], row.iloc[i]) for i in range(len(row)) if
                          data.columns[i] not in user_read_books]
        filtered_books.sort(key=lambda x: x[1], reverse=True)
        similar_books = filtered_books[:10]
        recommendations.extend([(user_id, book[0]) for book in similar_books])

    return recommendations


def setup_database(conn):
    create_table_query = """
    DROP TABLE IF EXISTS user_recommendations;
    CREATE TABLE IF NOT EXISTS user_recommendations (
        user_id UUID,
        book_id UUID,
        PRIMARY KEY (user_id, book_id)
    );
    """
    with conn.cursor() as cursor:
        cursor.execute(create_table_query)
        conn.commit()


def store_recommendations(conn, recommendations):
    insert_query = "INSERT INTO user_recommendations (user_id, book_id) VALUES (%s, %s) ON CONFLICT DO NOTHING"
    with conn.cursor() as cursor:
        for user_id, book_id in recommendations:
            cursor.execute(insert_query, (str(user_id), str(book_id)))
        conn.commit()

def check_recommendation_table(conn):
    with conn.cursor() as crs:
        crs.execute("""
            SELECT u.username, b.title
            FROM user_recommendations ur
            JOIN public.book b on b.id = ur.book_id
            JOIN public.users u on u.id = ur.user_id
        """)
        recs = crs.fetchall()
    return recs

def main():
    conn = connect_to_db()
    setup_database(conn)
    interaction_data, read_history_data, similarity_data = fetch_data(conn)
    data_matrix = create_matrix(interaction_data, similarity_data)
    recs = get_recommendations(data_matrix, read_history_data)
    store_recommendations(conn, recs)
    recs = check_recommendation_table(conn)
    conn.close()
    print("Recommendations:")
    for rec in recs:
        print(rec)


if __name__ == '__main__':
    main()
