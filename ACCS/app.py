from flask import Flask, session, redirect,url_for, render_template, request, jsonify
import pyodbc
import os
import re
from werkzeug.utils import secure_filename
import bcrypt
from db import get_mysql_connection
from create_app_log import create_app_log

app = Flask(__name__)
app.secret_key = "your_secret_key"
# Database connection string
conn_str = (
    'DRIVER={SQL Server};'
    'SERVER=SVDCPRD01;'
    'DATABASE=FlightOPSPortalDB;'
    'UID=ops_user;'
    'PWD=ops@2021'
)

def get_db_connection():
    return pyodbc.connect(conn_str)

@app.route('/')
def index():
    return render_template('LandingPage.html')
########################################################################################################
# Region 1:user
@app.route("/")
@app.route("/login", methods=["GET", "POST"])
def login():
    try:
        message = ""
        if (
            request.method == "POST"
            and "username" in request.form
            and "password" in request.form
        ):
            username = request.form["username"]
            password = request.form["password"]
            if not username or not password:
                message = "Error : Please ensure all required fields are filled out before proceeding."
                return render_template("Login.html", message=message)
            password_bytes = password.encode("utf-8")
            connection = get_mysql_connection()
            cursor = connection.cursor(dictionary=True)

            cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
            user = cursor.fetchone()
            if user:
                if user["AccStatus"] == "locked":
                    message = "Error : Your account is locked"
                elif bcrypt.checkpw(password_bytes, user["password"].encode("utf-8")):
                    session["loggedin"] = True
                    session["username"] = user["username"]
                    session["name"] = user["name"]
                    session["email"] = user["email"]
                    session["Privilege"] = user["UPrivilege"]
                    return render_template("Index.html", message=message)
                else:
                    message = "Error : Please enter correct username / password!"
            else:
                message = "User not found"
        return render_template("Login.html", message=message)

    except Exception as e:
        # Log the error and handle it appropriately
        print(f"An error occurred: {e}")
        message = "Error : An error occurred. Please try again later."
        result = str(e)
        create_app_log(result, "generatePerData")
        return render_template("Login.html", message=message)

@app.route("/search", methods=["GET", "POST"])
def search():
    if "loggedin" not in session or (
        "Privilege" not in session or session["Privilege"] != "Admin"
    ):

        return redirect(url_for("login"))
    try:

        if request.method == "POST":
            search_query = request.form.get("search_query")
            if not search_query:
                message = "Please ensure all required fields are filled out before proceeding."
                return render_template("search.html", message=message)
            connection = get_mysql_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM user WHERE username LIKE %s", ("%" + search_query + "%",)
            )
            users = cursor.fetchall()
            if users:
                return render_template("UserDisplay.html", users=users)
            else:
                message = "User not found!"
                return render_template("search.html", message=message)

        return render_template("search.html")
    except Exception as e:
        print(f"Error updating user: {e}")
        result = str(e)
        create_app_log(result, "generatePerData")
        message = "Error : An error occurred while updating the user. " + str(e)
        return render_template("search.html", message=message)


@app.route("/resetpassword", methods=["GET", "POST"])
def resetpassword():
    user = session.get("username")

    try:
        if "loggedin" not in session:
            return redirect(url_for("login"))

        if request.method == "POST":
            newpassword = request.form.get("new_password")
            oldpassword = request.form.get("old_password")
            hashed_password = bcrypt.hashpw(
                newpassword.encode("utf-8"), bcrypt.gensalt()
            )
            password_bytes = oldpassword.encode("utf-8")
            if not newpassword or not oldpassword:
                message = "Error : Please ensure all required fields are filled out before proceeding."
                return render_template("resetpassword.html", message=message)
            connection = get_mysql_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM user WHERE username LIKE %s",
                ("%" + user + "%",),
            )
            users = cursor.fetchall()

            if users:
                if bcrypt.checkpw(password_bytes, users[0]["password"].encode("utf-8")):
                    update_query = """
                        UPDATE user SET password = %s
                        WHERE username = %s
                        """
                    cursor.execute(update_query, (hashed_password, user))
                    connection.commit()

                    return redirect(url_for("login"))
                else:
                    message = "Error : Please ensure that the old password is correct."
                    return render_template("resetpassword.html", message=message)

        return render_template("resetpassword.html")
    except Exception as e:
        print(f"Error updating user: {e}")
        result = str(e)
        create_app_log(result, "generatePerData")
        message = "An error occurred while updating the user." + str(e)
        return render_template("resetpassword.html", message=message)


@app.route("/resetUserpassword", methods=["GET", "POST"])
def resetUserpassword():
    if "loggedin" not in session or (
        "Privilege" not in session or session["Privilege"] != "Admin"
    ):

        return redirect(url_for("login"))
    try:

        if request.method == "POST":
            username = request.form.get("UserName")
            newpassword = request.form.get("new_password")

            hashed_password = bcrypt.hashpw(
                newpassword.encode("utf-8"), bcrypt.gensalt()
            )

            if not newpassword or not username:
                message = "Error : Please ensure all required fields are filled out before proceeding."
                return render_template("resetpassword.html", message=message)
            connection = get_mysql_connection()
            cursor = connection.cursor(dictionary=True)
            cursor.execute(
                "SELECT * FROM user WHERE username LIKE %s",
                ("%" + username + "%",),
            )
            users = cursor.fetchall()

            if users:

                update_query = """
                        UPDATE user SET password = %s
                        WHERE username = %s
                        """
                cursor.execute(update_query, (hashed_password, username))
                connection.commit()

                return render_template("resetUserpassword.html", users=users)
            else:

                message = "Error : Please ensure that the user name is  correct."
                return render_template("resetUserpassword.html", message=message)

        return render_template("resetUserpassword.html")
    except Exception as e:

        result = str(e)
        create_app_log(result, "generatePerData")
        message = "Error : An error occurred while updating the user." + str(e)
        return render_template("resetUserpassword.html", message=message)


@app.route("/update_user/<int:user_id>", methods=["GET", "POST"])
def update_user(user_id):

    if "loggedin" not in session or session["Privilege"] != "Admin":
        return redirect(url_for("login"))
    try:
        if request.method == "POST":
            name = request.form["name"]
            username = request.form["username"]
            email = request.form["email"]
            privilege = request.form.get("privilege")
            AccStatus = request.form.get("AccStatus")
            # Please ensure all required fields are filled out before proceeding.
            if not name or not username or not email or not privilege or not AccStatus:
                message = "Please ensure all required fields are filled out before proceeding."
                return render_template("search.html", message=message)
            connection = get_mysql_connection()
            cursor = connection.cursor(dictionary=True)

            update_query = """
                UPDATE user SET name = %s, username = %s, email = %s, UPrivilege = %s ,AccStatus= %s
                WHERE user_id = %s
            """

            cursor.execute(
                update_query, (name, username, email, privilege, AccStatus, user_id)
            )

            cursor.execute("SELECT * FROM user WHERE user_id = %s", (user_id,))
            users = cursor.fetchall()
            if users:
                return render_template("UserDisplay.html", users=users)
            else:
                message = "User not found!"
                return render_template("search.html", message=message)
    except Exception as e:
        result = str(e)
        create_app_log(result, "generatePerData")

        message = "Un expected error try agin soon"
        return render_template("search.html", message=result)


@app.route("/register", methods=["GET", "POST"])
def register():
    if "loggedin" not in session or (
        "Privilege" not in session or session["Privilege"] != "Admin"
    ):

        return redirect(url_for("login"))
    try:
        message = ""
        if (
            request.method == "POST"
            and "name" in request.form
            and "username" in request.form
            and "password" in request.form
            and "email" in request.form
            and "AccStatus" in request.form
        ):
            # Form data
            name = request.form["name"]
            username = request.form["username"]
            password = request.form["password"]
            email = request.form["email"]
            acc_status = request.form["AccStatus"]
            privilege = request.form.get("Privilege")
            # Hash password
            hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

            # Get MySQL connection
            connection = get_mysql_connection()
            cursor = connection.cursor(dictionary=True)

            # Check if account already exists
            cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
            account = cursor.fetchone()

            if not username or not password or not email or not name:
                message = "Error : Please ensure all required fields are filled out before proceeding."

            elif account:
                message = "Error :Account already exists!"
            elif not re.match(r"[^@]+@[^@]+\.[^@]+", email):
                message = "Invalid email address!"
            else:
                # Insert new user
                cursor.execute(
                    "INSERT INTO user (username, name, email, password, UPrivilege, AccStatus) VALUES (%s, %s, %s, %s, %s, %s)",
                    (
                        username,
                        name,
                        email,
                        hashed_password.decode("utf-8"),
                        privilege,
                        acc_status,
                    ),
                )
                connection.commit()
                message = (
                    "Registration Successful! The account has been created successfully User name ="
                    + str(username)
                    + " Password "
                    + str(password)
                )

        elif request.method == "POST":
            message = "Error : Please fill out the form!"
    except Exception as e:
        result = str(e)
        create_app_log(result, "generatePerData")
        message = str(e)

    return render_template("register.html", message=message)


@app.route("/logout")
def logout():
    session.pop("username", None)
    session.pop("Privilege", None)
    return redirect(url_for("login"))
@app.route('/chats', methods=['GET'])
def get_chats():
    query = """
        SELECT DISTINCT TOP 100 empNo_sequence, empNumber, crewqual, crewcat,
               COUNT(CASE WHEN Reply IS NULL THEN 1 END) AS unread_count,
               MAX(msgTimeStamp) AS max_timestamp
        FROM dbo.tblFreeText
        GROUP BY empNo_sequence, empNumber, crewqual, crewcat
        ORDER BY max_timestamp DESC
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()
    
    chats = []
    for row in rows:
        chats.append({
            'empNo_sequence': row[0],
            'empNumber': row[1],
            'crewqual': row[2],
            'crewcat': row[3],
            'unread_count': row[4]
        })
    
    return jsonify(chats)

@app.route('/messages/<path:empNo_sequence>', methods=['GET'])
def get_messages(empNo_sequence):
    query = """
        SELECT empNumber, phone, txtMsg, msgTimeStamp, sentBy, msgSentStatus, 
            sequence, isfromEt, empSign, crewqual, crewcat, 
            msgtaype, fltno, msgDeliveredTimeStamp, Reply, 
            Repliedby, Repliedon, ReplyDeliveredon
        FROM dbo.tblFreeText
        WHERE empNo_sequence = ?
        ORDER BY msgTimeStamp ASC
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, (empNo_sequence,))
    rows = cursor.fetchall()
    conn.close()
    
    messages = []
    for row in rows:
        messages.append({
            'empNumber': row[0],
            'phone': row[1],
            'txtMsg': row[2],
            'msgTimeStamp': row[3],
            'sentBy': row[4],
            'msgSentStatus': row[5],
            'sequence': row[6],
            'isfromEt': row[7],
            'empSign': row[8],
            'crewqual': row[9],
            'crewcat': row[10],
            'msgtaype': row[11],
            'fltno': row[12],
            'msgDeliveredTimeStamp': row[13],
            'Reply': row[14],
            'Repliedby': row[15],
            'Repliedon': row[16],
            'ReplyDeliveredon': row[17]
        })
    
    return jsonify(messages)


@app.route('/send_message_or_file', methods=['POST'])
def send_message_or_file():
    data = request.form
    empNo_sequence = data['empNo_sequence']
    message = data.get('message', '')
    
    file = request.files.get('file')
    
    if message or file:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if message:
            query_message = """
                INSERT INTO dbo.tblFreeText (empNo_sequence, txtMsg, sentBy, msgTimeStamp)
                VALUES (?, ?, ?, GETDATE())
            """
            cursor.execute(query_message, (empNo_sequence, message, 'Current User'))
        
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join('uploads', filename)
            file.save(file_path)
            
            query_file = """
                INSERT INTO dbo.tblFreeText (empNo_sequence, txtMsg, sentBy, msgTimeStamp, msgtaype)
                VALUES (?, ?, ?, GETDATE(), 'file')
            """
            cursor.execute(query_file, (empNo_sequence, filename, 'Current User'))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Message or file sent successfully'})
    else:
        return jsonify({'success': False, 'message': 'No message or file provided'})

if __name__ == '__main__':
    app.run(debug=True ,port=25000)
