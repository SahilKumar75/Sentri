import logging

logger = logging.getLogger(__name__)

class ExperimentTracker:
    """Tracks ML experiments."""
    def __init__(self, experiment_name: str):
        self.experiment_name = experiment_name
        self.runs = []
