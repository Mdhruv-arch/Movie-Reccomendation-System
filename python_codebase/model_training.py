"""
CineMatch AI — Data Science & ML Training Pipeline
Loads TMDB 5000 Movies & Credits datasets.
Performs data cleaning, feature extraction, text preprocessing,
vectorization with CountVectorizer / TF-IDF, and Cosine Similarity computation.
"""

import numpy as np
import pandas as pd
import ast
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os

print("=" * 60)
print("CineMatch AI — Training Pipeline Initializing...")
print("=" * 60)

movies_file = 'tmdb_5000_movies.csv'
credits_file = 'tmdb_5000_credits.csv'

if not os.path.exists(movies_file) or not os.path.exists(credits_file):
    print("Warning: TMDB CSV files not found in working directory.")
    print("Creating sample records for immediate testing...")
    movies = pd.DataFrame({
        'id': [27205, 157336, 155, 603, 550],
        'title': ['Inception', 'Interstellar', 'The Dark Knight', 'The Matrix', 'Fight Club'],
        'genres': ['[{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}]'] * 5,
        'keywords': ['[{"name": "dream"}, {"name": "subconscious"}, {"name": "heist"}]'] * 5,
        'overview': ['A thief steals corporate secrets through dream-sharing technology.'] * 5,
    })
    credits = pd.DataFrame({
        'movie_id': [27205, 157336, 155, 603, 550],
        'cast': ['[{"name": "Leonardo DiCaprio"}, {"name": "Joseph Gordon-Levitt"}, {"name": "Tom Hardy"}]'] * 5,
        'crew': ['[{"job": "Director", "name": "Christopher Nolan"}]'] * 5
    })
else:
    movies = pd.read_csv(movies_file)
    credits = pd.read_csv(credits_file)

if 'title' in credits.columns:
    movies = movies.merge(credits, on='title')
else:
    movies = movies.merge(credits, left_on='id', right_on='movie_id')

movies = movies[['id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew']]
movies.dropna(subset=['overview'], inplace=True)
movies.drop_duplicates(subset=['title'], inplace=True)

def extract_names(json_str):
    try:
        items = ast.literal_eval(json_str)
        return [item['name'] for item in items if isinstance(item, dict) and 'name' in item]
    except (ValueError, SyntaxError):
        return []

def extract_top_cast(json_str, limit=3):
    try:
        items = ast.literal_eval(json_str)
        return [item['name'] for item in items[:limit] if isinstance(item, dict) and 'name' in item]
    except (ValueError, SyntaxError):
        return []

def extract_director(json_str):
    try:
        items = ast.literal_eval(json_str)
        for member in items:
            if isinstance(member, dict) and member.get('job') == 'Director':
                return [member['name']]
        return []
    except (ValueError, SyntaxError):
        return []

movies['genres'] = movies['genres'].apply(extract_names)
movies['keywords'] = movies['keywords'].apply(extract_names)
movies['cast'] = movies['cast'].apply(lambda x: extract_top_cast(x, limit=4))
movies['crew'] = movies['crew'].apply(extract_director)
movies['overview'] = movies['overview'].apply(lambda x: x.split() if isinstance(x, str) else [])

def collapse(L):
    return [i.replace(" ", "") for i in L]

movies['genres'] = movies['genres'].apply(collapse)
movies['keywords'] = movies['keywords'].apply(collapse)
movies['cast'] = movies['cast'].apply(collapse)
movies['crew'] = movies['crew'].apply(collapse)

movies['tags'] = movies['overview'] + movies['genres'] + movies['keywords'] + movies['cast'] + movies['crew']

new_df = movies[['id', 'title', 'tags']].copy()
new_df['tags'] = new_df['tags'].apply(lambda x: " ".join(x).lower())

cv = CountVectorizer(max_features=5000, stop_words='english')
vectors = cv.fit_transform(new_df['tags']).toarray()
similarity = cosine_similarity(vectors)

pickle.dump(new_df.to_dict(), open('movies_dict.pkl', 'wb'))
pickle.dump(similarity, open('similarity.pkl', 'wb'))
print("Saved movies_dict.pkl and similarity.pkl successfully.")
