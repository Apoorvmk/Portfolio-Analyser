import numpy as np
from typing import List

def calculate_entropy(probabilities: np.ndarray) -> float:
    """
    Calculates Shannon Entropy: H = -Σ(pi * log(pi))
    """
    # Filter out zeros to avoid log(0)
    p = probabilities[probabilities > 0]
    if len(p) == 0:
        return 0.0
    return -np.sum(p * np.log(p))

def calculate_hhi(probabilities: np.ndarray) -> float:
    """
    Calculates Herfindahl-Hirschman Index: Σ(pi²)
    """
    return np.sum(probabilities**2)

def calculate_coverage(probabilities: np.ndarray) -> int:
    """
    Returns count of sectors with allocation > 0
    """
    return int(np.sum(probabilities > 0))

def calculate_concentration_ratio(probabilities: np.ndarray, top_n: int = 3) -> float:
    """
    Returns the sum of top N sector weights
    """
    sorted_probs = np.sort(probabilities)[::-1]
    return float(np.sum(sorted_probs[:top_n]))

def get_diversification_score(entropy: float, hhi: float, n_sectors: int) -> float:
    """
    Calculates a score from 0-100:
    score = (0.5 * normalized_entropy) + (0.5 * (1 - normalized_hhi)) * 100
    """
    if n_sectors <= 1:
        return 0.0
    
    # Max entropy is log(n_sectors) when all sectors are equal
    max_entropy = np.log(n_sectors)
    norm_entropy = entropy / max_entropy if max_entropy > 0 else 0
    
    # Min HHI is 1/n_sectors, Max HHI is 1.0
    # We want to normalize HHI such that 1/n_sectors -> 0 and 1.0 -> 1.0
    min_hhi = 1.0 / n_sectors
    if 1.0 - min_hhi > 0:
        norm_hhi = (hhi - min_hhi) / (1.0 - min_hhi)
    else:
        norm_hhi = 1.0
        
    score = (0.5 * norm_entropy + 0.5 * (1.0 - norm_hhi)) * 100
    return round(float(score), 2)
