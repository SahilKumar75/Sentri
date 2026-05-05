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
        interaction = (X[:, 0] * X[:, 1]).reshape(-1, 1)
        return np.hstack((X, interaction))

    def train_model(self, data: list, target_calories: list):
        """Trains the calorie prediction model."""
        X = self.preprocess_activity_data(data)
        X_features = self.extract_features(X)
        y = np.array(target_calories)
        
        self.model.fit(X_features, y)
        self.is_trained = True
        logger.info("Calorie predictor model trained successfully.")

    def predict_calories(self, data: list) -> list:
        """Predicts calories burned for given activity data."""
        if not self.is_trained:
            logger.warning("Predicting with untrained model, results may be inaccurate.")
        X = self.preprocess_activity_data(data)
        X_features = self.extract_features(X)
        predictions = self.model.predict(X_features)
        return [max(0.0, float(p)) for p in predictions]
