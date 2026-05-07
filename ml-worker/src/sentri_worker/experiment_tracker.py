import logging

logger = logging.getLogger(__name__)

class ExperimentTracker:
    """Tracks ML experiments."""
    def __init__(self, experiment_name: str):
        self.experiment_name = experiment_name
        self.runs = []

    def start_run(self, run_name: str):
        """Starts a new experiment run."""
        run = {"name": run_name, "metrics": {}, "parameters": {}}
        self.runs.append(run)
        logger.info(f"Started run: {run_name}")
        return run
