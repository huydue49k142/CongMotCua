from rapidfuzz import fuzz

def are_titles_similar(title1: str, title2: str, threshold: float = 80.0) -> tuple[bool, float]:
    """
    Compares two titles using fuzzy string matching and returns if they are similar enough.
    
    Args:
        title1: The first title string.
        title2: The second title string.
        threshold: The similarity score required to be considered a match (0-100).
        
    Returns:
        A tuple containing:
        - bool: True if titles are similar, False otherwise.
        - float: The similarity score.
    """
    if not title1 or not title2:
        return False, 0.0

    # Using token_sort_ratio to handle word order differences
    # e.g., "Đơn xin thôi học" vs "Thôi học đơn xin"
    similarity_score = fuzz.token_sort_ratio(title1, title2)
    
    is_match = similarity_score >= threshold
    
    return is_match, similarity_score