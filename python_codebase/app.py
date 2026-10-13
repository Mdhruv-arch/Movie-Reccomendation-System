"""
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

st.title("🎬 CineMatch AI")
st.subheader("Discover Your Next Favorite Movie")
st.caption("Content-Based Machine Learning Engine powered by Scikit-learn Cosine Similarity")

movies_df, similarity = load_data()

if movies_df is not None and similarity is not None:
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
    st.info("To get started, run `python model_training.py` to train the vectorizer and generate the pickle artifacts.")
