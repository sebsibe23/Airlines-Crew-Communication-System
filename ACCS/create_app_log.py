import os


def create_app_log(error_message, method_name):
    try:
        logs_directory = "logs"
        if not os.path.exists(logs_directory):
            os.makedirs(logs_directory)

        log_file_path = os.path.join(logs_directory, f"{method_name}.txt")
        with open(log_file_path, "a") as log_file:
            log_file.write(error_message + "\n")
    except Exception as e:
        result = str(e)
        create_app_log(result, "create_app_log")
