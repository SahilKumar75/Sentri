import numpy as np
import logging
import pickle
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

    def save_model(self, path: str = None):
        """Saves the trained model to disk."""
        save_path = path or self.model_path
        if not save_path:
            raise ValueError("No model path provided for saving.")
        with open(save_path, 'wb') as f:
            pickle.dump({'model': self.model, 'is_trained': self.is_trained}, f)

    def load_model(self, path: str = None):
        """Loads a trained model from disk."""
        load_path = path or self.model_path
        if not load_path:
            raise ValueError("No model path provided for loading.")
        with open(load_path, 'rb') as f:
            data = pickle.load(f)
            self.model = data['model']
            self.is_trained = data['is_trained']

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    predictor = CaloriePredictor()
    dummy_data = [
        {"duration_minutes": 30, "intensity": 0.8, "avg_heart_rate": 140},
        {"duration_minutes": 45, "intensity": 0.6, "avg_heart_rate": 120}
    ]
    dummy_targets = [300, 250]
    
    logger.info("Training predictor...")
    predictor.train_model(dummy_data, dummy_targets)
    
    logger.info("Predicting...")
    predictions = predictor.predict_calories(dummy_data)
    for t, p in zip(dummy_targets, predictions):
        logger.info(f"Target: {t}, Predicted: {p:.2f}")
