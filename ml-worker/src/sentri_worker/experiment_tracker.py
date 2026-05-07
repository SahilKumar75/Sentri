import logging
import json

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

    def log_metric(self, run_name: str, key: str, value: float):
        """Logs a metric for a specific run."""
        for run in self.runs:
            if run["name"] == run_name:
                run["metrics"][key] = value
                logger.debug(f"Logged metric {key}={value} for {run_name}")
                break

    def summarize(self):
        """Returns a summary of all runs."""
        summary = f"Experiment: {self.experiment_name}\n"
        for run in self.runs:
            summary += f"Run: {run['name']}\n"
            summary += f"  Parameters: {run['parameters']}\n"
            summary += f"  Metrics: {run['metrics']}\n"
        return summary

    def save_to_disk(self, file_path: str):
        """Saves experiment data to a JSON file."""
        data = {
            "experiment_name": self.experiment_name,
            "runs": self.runs
        }
        with open(file_path, "w") as f:
            json.dump(data, f, indent=4)
        logger.info(f"Experiment saved to {file_path}")

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    tracker = ExperimentTracker("test_experiment")
    
    tracker.start_run("run_1")
    tracker.log_parameter("run_1", "learning_rate", 0.01)
    tracker.log_metric("run_1", "accuracy", 0.95)
    
    print(tracker.summarize())
