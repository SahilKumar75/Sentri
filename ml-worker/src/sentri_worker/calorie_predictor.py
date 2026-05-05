import numpy as np
import logging
from sklearn.linear_model import Ridge

logger = logging.getLogger(__name__)

class CaloriePredictor:
    """Predicts calories burned based on user activity data."""
    def __init__(self, model_path: str = None):
        self.model_path = model_path
        self.model = Ridge(alpha=1.0)
        self.is_trained = False

    def preprocess_activity_data(self, data: list) -> np.ndarray:
        """Preprocesses raw activity data into structured features."""
        processed = []
        for entry in data:
            duration = entry.get('duration_minutes', 0)
            intensity = entry.get('intensity', 1.0)
            heart_rate = entry.get('avg_heart_rate', 70)
            processed.append([duration, intensity, heart_rate])
        return np.array(processed)

    def extract_features(self, X: np.ndarray) -> np.ndarray:
        """Extracts polynomial features from base activity data."""
        # Simple feature engineering: duration * intensity
        interaction = (X[:, 0] * X[:, 1]).reshape(-1, 1)
        return np.hstack((X, interaction))
