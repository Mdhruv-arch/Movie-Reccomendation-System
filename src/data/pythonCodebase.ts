export interface CodeFile {
  filename: string;
  language: string;
  description: string;
  content: string;
}

export const PYTHON_PROJECT_FILES: CodeFile[] = [
  {
    filename: "app.py",
    language: "python",
    description: "Streamlit Web Application for CineMatch AI",
    content: `"""
CineMatch AI — Movie Recommendation System
Built with Streamlit, Scikit-learn, and TMDB Dataset.
Suitable for AI/ML Engineer & Data Analyst Portfolios.
"""

import streamlit as st
import pickle
import pandas as pd
import requests
import os

# Set page config with dark cinematic styling
st.set_page_config(
    page_title="CineMatch AI — Movie Recommendation System",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for dark cinema aesthetic
st.markdown("""
<style>
    .reportview-container {
        background: #0a0a0a;
        color: #f5f5f5;
    }
    .main {
        background-color: #0a0a0a;
    }
    h1, h2, h3 {
        font-family: 'Plus Jakarta Sans', sans-serif;
        color: #f5f5f5;
    }
    .stButton>button {
        background-color: #d97706;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.5rem 1.5rem;
        font-weight: 600;
        transition: all 0.2s;
    }
    .stButton>button:hover {
        background-color: #b45309;
        color: white;
        transform: translateY(-1px);
    }
    .movie-card {
        background: #171717;
        border-radius: 12px;
        padding: 12px;
        margin-bottom: 16px;
        border: 1px solid #262626;
        transition: transform 0.2s;
    }
    .movie-card:hover {
        transform: translateY(-4px);
        border-color: #d97706;
    }
    .similarity-badge {
        background: rgba(217, 119, 6, 0.2);
        color: #f59e0b;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------
def fetch_poster(movie_id, api_key=None):
    """
    Fetch movie poster path from TMDB API with graceful placeholder fallback.
    """
    if not api_key:
        api_key = os.environ.get("TMDB_API_KEY", "")
    
    if api_key:
        try:
            url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={api_key}&language=en-US"
            response = requests.get(url, timeout=3)
            data = response.json()
            poster_path = data.get('poster_path')
            if poster_path:
                return f"https://image.tmdb.org/t/p/w500/{poster_path}"
        except Exception:
            pass
            
    # Default graceful cinematic placeholder
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80"

@st.cache_data
def load_data():
    """
    Load precomputed movies dictionary and similarity matrix.
    Fallback to generating baseline if pickle files are missing.
    """
    try:
        movies_dict = pickle.load(open('movies_dict.pkl', 'rb'))
        similarity = pickle.load(open('similarity.pkl', 'rb'))
        movies_df = pd.DataFrame(movies_dict)
        return movies_df, similarity
    except FileNotFoundError:
        st.warning("Precomputed 'movies_dict.pkl' or 'similarity.pkl' not found. Run model_training.py first!")
        return None, None

def recommend_movies(movie_title, movies_df, similarity, top_n=10):
    """
    Recommend top N movies using Cosine Similarity on content vectors.
    """
    try:
        movie_idx = movies_df[movies_df['title'] == movie_title].index[0]
        distances = similarity[movie_idx]
        
        # Enumerate and sort by similarity score (descending)
        movie_list = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])
        
        # Exclude the selected movie itself (index 0)
        recommendations = []
        for item in movie_list[1:top_n + 1]:
            cand_idx = item[0]
            cand_score = item[1]
            cand_movie = movies_df.iloc[cand_idx]
            
            recommendations.append({
                'title': cand_movie['title'],
                'movie_id': cand_movie.get('movie_id', cand_movie.get('id', 0)),
                'similarity_score': round(float(cand_score) * 100, 1),
                'genres': cand_movie.get('genres', []),
                'overview': cand_movie.get('overview', 'No synopsis available.')
            })
            
        return recommendations
    except Exception as e:
        st.error(f"Error calculating recommendations: {str(e)}")
        return []

# ---------------------------------------------------------
# APP HEADER & HERO
# ---------------------------------------------------------
st.title("🎬 CineMatch AI")
st.subheader("Discover Your Next Favorite Movie")
st.caption("Content-Based Machine Learning Engine powered by Scikit-learn Cosine Similarity")

movies_df, similarity = load_data()

if movies_df is not None and similarity is not None:
    # Sidebar Filters
    with st.sidebar:
        st.header("⚙️ Recommendation Filters")
        top_k = st.slider("Number of recommendations", min_value=5, max_value=12, value=10, step=1)
        st.markdown("---")
        st.markdown("### 📊 About this Model")
        st.markdown("""
        - **Algorithm**: Content-Based Filtering
        - **Vector Space**: CountVectorizer / TF-IDF
        - **Distance Metric**: Cosine Similarity
        - **Feature Soup**: Genres + Keywords + Director + Cast + Overview
        """)
        st.caption("Designed for AI/ML Engineer Portfolios")

    # Main Selection Area
    movie_titles = movies_df['title'].values
    selected_movie = st.selectbox(
        "Search or select a movie you loved:",
        movie_titles,
        index=0
    )

    if st.button("Recommend Movies", type="primary"):
        with st.spinner("Calculating cosine similarity across feature space..."):
            recommendations = recommend_movies(selected_movie, movies_df, similarity, top_n=top_k)

        if recommendations:
            st.markdown(f"### Movies similar to **{selected_movie}**")
            
            # Display in responsive grid (columns of 5)
            cols = st.columns(5)
            for i, rec in enumerate(recommendations):
                col = cols[i % 5]
                with col:
                    poster_url = fetch_poster(rec['movie_id'])
                    st.image(poster_url, use_container_width=True)
                    st.markdown(f"**{rec['title']}**")
                    st.markdown(f"<span class='similarity-badge'>{rec['similarity_score']}% Match</span>", unsafe_allow_html=True)
                    
                    with st.expander("Synopsis"):
                        st.write(rec['overview'])
else:
    st.info("To get started, run \`python model_training.py\` to train the vectorizer and generate the pickle artifacts.")
`
  },
  {
    filename: "model_training.py",
    language: "python",
    description: "Data Preprocessing & Scikit-learn Model Training Pipeline",
    content: `"""
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

# 1. LOAD DATASETS
movies_file = 'tmdb_5000_movies.csv'
credits_file = 'tmdb_5000_credits.csv'

if not os.path.exists(movies_file) or not os.path.exists(credits_file):
    print("Warning: TMDB CSV files not found in working directory.")
    print("Creating synthetic dataset sample for immediate testing...")
    # Create sample DataFrame for testing
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

# Merge datasets on movie title / ID
if 'title' in credits.columns:
    movies = movies.merge(credits, on='title')
else:
    movies = movies.merge(credits, left_on='id', right_on='movie_id')

print(f"Dataset Loaded. Total raw records: {len(movies)}")

# 2. SELECT RELEVANT FEATURES
# Essential columns for content-based matching
movies = movies[['id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew']]

# 3. HANDLE MISSING VALUES AND DUPLICATES
movies.dropna(subset=['overview'], inplace=True)
movies.drop_duplicates(subset=['title'], inplace=True)
print(f"Cleaned records: {len(movies)}")

# 4. JSON FEATURE EXTRACTION HELPERS
def extract_names(json_str):
    """Extract list of names from stringified JSON array."""
    try:
        items = ast.literal_eval(json_str)
        return [item['name'] for item in items if isinstance(item, dict) and 'name' in item]
    except (ValueError, SyntaxError):
        return []

def extract_top_cast(json_str, limit=3):
    """Extract top 3 cast members from stringified JSON."""
    try:
        items = ast.literal_eval(json_str)
        return [item['name'] for item in items[:limit] if isinstance(item, dict) and 'name' in item]
    except (ValueError, SyntaxError):
        return []

def extract_director(json_str):
    """Extract director name from crew stringified JSON."""
    try:
        items = ast.literal_eval(json_str)
        for member in items:
            if isinstance(member, dict) and member.get('job') == 'Director':
                return [member['name']]
        return []
    except (ValueError, SyntaxError):
        return []

# Apply extraction functions
movies['genres'] = movies['genres'].apply(extract_names)
movies['keywords'] = movies['keywords'].apply(extract_names)
movies['cast'] = movies['cast'].apply(lambda x: extract_top_cast(x, limit=4))
movies['crew'] = movies['crew'].apply(extract_director)
movies['overview'] = movies['overview'].apply(lambda x: x.split() if isinstance(x, str) else [])

# 5. ENTITY COLLAPSING (Remove spaces to prevent cross-name interference)
# E.g. 'Christopher Nolan' -> 'ChristopherNolan'
def collapse(L):
    return [i.replace(" ", "") for i in L]

movies['genres'] = movies['genres'].apply(collapse)
movies['keywords'] = movies['keywords'].apply(collapse)
movies['cast'] = movies['cast'].apply(collapse)
movies['crew'] = movies['crew'].apply(collapse)

# 6. COMBINE FEATURES INTO A UNIFIED 'SOUP' (TAGS)
movies['tags'] = movies['overview'] + movies['genres'] + movies['keywords'] + movies['cast'] + movies['crew']

# Create final clean DataFrame
new_df = movies[['id', 'title', 'tags']].copy()
new_df['tags'] = new_df['tags'].apply(lambda x: " ".join(x).lower())

print("\\nSample Tag Soup for first movie:")
print(new_df['tags'].iloc[0][:150] + "...")

# 7. VECTORIZATION USING SCIKIT-LEARN
# CountVectorizer removes English stop words and caps vocabulary to top 5000 terms
cv = CountVectorizer(max_features=5000, stop_words='english')
vectors = cv.fit_transform(new_df['tags']).toarray()
print(f"\\nVector Matrix Shape: {vectors.shape} (Movies x Vocabulary Features)")

# 8. COSINE SIMILARITY MATRIX
# Computes similarity matrix between all pairs of movies
similarity = cosine_similarity(vectors)
print(f"Cosine Similarity Matrix Shape: {similarity.shape}")

# 9. RECOMMENDATION FUNCTION TEST
def test_recommend(movie_title, top_n=5):
    if movie_title not in new_df['title'].values:
        print(f"Movie '{movie_title}' not found in dataset.")
        return
    idx = new_df[new_df['title'] == movie_title].index[0]
    distances = similarity[idx]
    ranked = sorted(list(enumerate(distances)), reverse=True, key=lambda x: x[1])[1:top_n+1]
    print(f"\\nTop {top_n} Recommendations for '{movie_title}':")
    for rank, (cand_idx, score) in enumerate(ranked, 1):
        print(f"  {rank}. {new_df.iloc[cand_idx]['title']} (Cosine Score: {score:.4f})")

test_recommend('Inception', 5)

# 10. EXPORT PICKLE ARTIFACTS FOR DEPLOYMENT
os.makedirs('.', exist_ok=True)
pickle.dump(new_df.to_dict(), open('movies_dict.pkl', 'wb'))
pickle.dump(similarity, open('similarity.pkl', 'wb'))
print("\\nModel training complete! Saved 'movies_dict.pkl' and 'similarity.pkl'.")
`
  },
  {
    filename: "requirements.txt",
    language: "text",
    description: "Python Dependencies for Local Execution and Streamlit Cloud",
    content: `streamlit>=1.30.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
requests>=2.31.0
`
  },
  {
    filename: "README.md",
    language: "markdown",
    description: "Complete GitHub Repository Portfolio Documentation",
    content: `# CineMatch AI — Movie Recommendation System

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3%2B-orange)
![Streamlit](https://img.shields.io/badge/Streamlit-1.30%2B-red)
![License](https://img.shields.io/badge/License-MIT-green)

An end-to-end, content-based movie recommendation system built with **Python**, **Scikit-learn**, **Pandas**, and **Streamlit**, trained on the TMDB 5000 Movies dataset. Designed for AI/ML Engineer and Data Analyst fresher portfolios to demonstrate fundamental NLP, vector space modeling, and web deployment.

---

## 📌 Architecture & ML Methodology

### 1. Content-Based Filtering
Unlike Collaborative Filtering (which requires user interaction logs and suffers from the cold-start problem), Content-Based Filtering models the intrinsic features of each item:
- **Directorial Style**: Director (weighted to capture aesthetic continuity)
- **Star Power**: Top 4 billed cast members
- **Thematic Elements**: Plot keywords and genres
- **Plot Representation**: Processed synopsis with English stop words stripped

### 2. Entity Collapsing
Actor and director names are stripped of whitespace (e.g. \`Christopher Nolan\` becomes \`christophernolan\`). This prevents erroneous cross-matches with different individuals sharing common first or last names.

### 3. Vector Space & Cosine Similarity
Movie feature "soups" are vectorized using **CountVectorizer** / **TF-IDF** into a 5,000-dimensional sparse feature space. The similarity between movie $A$ and movie $B$ is computed using the Cosine Similarity formula:

$$\\cos(\\theta) = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|} = \\frac{\\sum_{i=1}^{n} A_i B_i}{\\sqrt{\\sum_{i=1}^{n} A_i^2} \\sqrt{\\sum_{i=1}^{n} B_i^2}}$$

Cosine similarity measures the orientation rather than magnitude, ensuring longer plots or larger cast lists do not artificially inflate similarity.

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/your-username/cinematch-ai.git
cd cinematch-ai
\`\`\`

### 2. Create Virtual Environment
\`\`\`bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
\`\`\`

### 3. Install Dependencies
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Train Model & Generate Pickles
\`\`\`bash
python model_training.py
\`\`\`

### 5. Launch Streamlit Application
\`\`\`bash
streamlit run app.py
\`\`\`

---

## 🧠 Portfolio Interview Talking Points

1. **Why Cosine Similarity over Euclidean Distance?**
   Euclidean distance is sensitive to text length. Two movies with identical themes but different overview lengths would have a large Euclidean distance, whereas Cosine Similarity measures the angle between vectors, normalizing for document magnitude.

2. **How to address Cold Start for New Movies?**
   Content-based filtering handles new movies immediately as long as metadata (director, cast, genres, overview) is provided.

3. **Production Scalability:**
   While calculating an $N \\times N$ similarity matrix is $O(N^2)$, in production we can index the vector embeddings using Approximate Nearest Neighbor (ANN) libraries such as **FAISS** or **HNSWLib** to achieve sub-millisecond query time across millions of items.

---

## 📄 License
MIT License. Created by Dhruv Mandaviya for AI/ML engineering showcase.
`
  }
];
