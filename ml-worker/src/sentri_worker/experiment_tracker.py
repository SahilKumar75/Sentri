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

    def log_parameter(self, run_name: str, key: str, value: any):
        """Logs a parameter for a specific run."""
        for run in self.runs:
            if run["name"] == run_name:
                run["parameters"][key] = value
                logger.debug(f"Logged parameter {key}={value} for {run_name}")
                break
