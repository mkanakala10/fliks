import ast
import pandas as pd

INDIAN_LANGUAGES = {"hi", "ta", "te", "ml", "kn", "bn", "mr", "gu", "pa"}


def parse_countries(value):
    if not isinstance(value, str) or not value.strip():
        return []
    try:
        countries = ast.literal_eval(value)
        if isinstance(countries, list):
            return [c.get("iso_3166_1", "") for c in countries if isinstance(c, dict)]
    except (ValueError, SyntaxError):
        pass
    return []


def is_indian_movie(row) -> bool:
    language = str(row.get("original_language", "")).strip()
    if language in INDIAN_LANGUAGES:
        return True
    countries = parse_countries(row.get("production_countries"))
    return "IN" in countries


def load_indian_movies(csv_path: str = "movies_metadata.csv") -> pd.DataFrame:
    df = pd.read_csv(
        csv_path,
        usecols=[
            "id",
            "title",
            "overview",
            "original_language",
            "production_countries",
            "vote_count",
            "vote_average",
            "release_date",
            "poster_path",
        ],
        low_memory=False,
    )
    df["id"] = pd.to_numeric(df["id"], errors="coerce")
    df = df.dropna(subset=["id", "title", "overview"])
    indian = df[df.apply(is_indian_movie, axis=1)].copy()
    indian["id"] = indian["id"].astype(int)
    return indian


def get_survey_catalog(indian_df: pd.DataFrame) -> dict[int, str]:
    """Return 5 well-known Indian films for the taste survey."""
    preferred_ids = [20453, 19404, 297222, 7508, 360814]
    catalog = {}

    for movie_id in preferred_ids:
        match = indian_df[indian_df["id"] == movie_id]
        if not match.empty:
            catalog[movie_id] = str(match.iloc[0]["title"])

    if len(catalog) < 5:
        top = indian_df.sort_values("vote_count", ascending=False)
        for _, row in top.iterrows():
            movie_id = int(row["id"])
            if movie_id not in catalog:
                catalog[movie_id] = str(row["title"])
            if len(catalog) == 5:
                break

    return catalog
