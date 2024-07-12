import mysql.connector
from create_app_log import create_app_log


def get_mysql_connection():
    try:
        config = {
            "host": "localhost",
            "user": "root",
            "password": "root",
            "database": "perdiem",
        }
        connection = mysql.connector.connect(**config)
        return connection
    except Exception as e:
        result = str(e)
        create_app_log(result, "get_mysql_connection")
