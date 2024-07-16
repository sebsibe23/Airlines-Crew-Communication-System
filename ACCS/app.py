from flask import Flask, session, redirect, url_for, render_template, request, jsonify
import requests
from db import get_mysql_connection
import pyodbc
import os
from werkzeug.utils import secure_filename


app = Flask(__name__)
app.secret_key = "your_secret_key"

NODE_API_URL = "http://localhost:3000"
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

@app.route('/login', methods=['GET', 'POST'])
def login():
    try:
        message = ""
        if request.method == 'POST' and 'username' in request.form and 'password' in request.form:
            username = request.form['username']
            password = request.form['password']
            if not username or not password:
                message = "Error: Please ensure all required fields are filled out before proceeding."
                return render_template("Login.html", message=message)

            response = requests.post(f"{NODE_API_URL}/login", json={"username": username, "password": password})
            data = response.json()

            if response.status_code == 200:
                user = data["user"]
                session["loggedin"] = True
                session["username"] = user["username"]
                session["name"] = user["name"]
                session["email"] = user["email"]
                session["Privilege"] = user["UPrivilege"]
                return render_template("Index.html", message=message)
            else:
                message = data["message"]
        return render_template("Login.html", message=message)

    except Exception as e:
        print(f"An error occurred: {e}")
        message = "Error: An error occurred. Please try again later."
        return render_template("Login.html", message=message)

@app.route('/search', methods=['GET', 'POST'])
def search():
    if "loggedin" not in session or ("Privilege" not in session or session["Privilege"] != "Admin"):
        return redirect(url_for("login"))
    try:
        if request.method == 'POST':
            search_query = request.form.get("search_query")
            if not search_query:
                message = "Please ensure all required fields are filled out before proceeding."
                return render_template("search.html", message=message)

            response = requests.post(f"{NODE_API_URL}/search", json={"search_query": search_query})
            data = response.json()

            if response.status_code == 200:
                users = data["users"]
                return render_template("UserDisplay.html", users=users)
            else:
                message = data["message"]
                return render_template("search.html", message=message)
        return render_template("search.html")
    except Exception as e:
        print(f"Error updating user: {e}")
        message = "Error : An error occurred while updating the user. " + str(e)
        return render_template("search.html", message=message)

@app.route('/resetpassword', methods=['GET', 'POST'])
def resetpassword():
    user = session.get("username")
    try:
        if "loggedin" not in session:
            return redirect(url_for("login"))
        if request.method == 'POST':
            newpassword = request.form.get("new_password")
            oldpassword = request.form.get("old_password")
            if not newpassword or not oldpassword:
                message = "Error : Please ensure all required fields are filled out before proceeding."
                return render_template("resetpassword.html", message=message)

            response = requests.post(f"{NODE_API_URL}/resetpassword", json={"username": user, "old_password": oldpassword, "new_password": newpassword})
            data = response.json()

            if response.status_code == 200:
                return redirect(url_for("login"))
            else:
                message = data["message"]
                return render_template("resetpassword.html", message=message)
        return render_template("resetpassword.html")
    except Exception as e:
        print(f"Error updating user: {e}")
        message = "An error occurred while updating the user." + str(e)
        return render_template("resetpassword.html", message=message)

@app.route('/resetUserpassword', methods=['GET', 'POST'])
def resetUserpassword():
    if "loggedin" not in session or ("Privilege" not in session or session["Privilege"] != "Admin"):
        return redirect(url_for("login"))
    try:
        if request.method == 'POST':
            username = request.form.get("UserName")
            newpassword = request.form.get("new_password")
            if not newpassword or not username:
                message = "Error : Please ensure all required fields are filled out before proceeding."
                return render_template("resetUserpassword.html", message=message)

            response = requests.post(f"{NODE_API_URL}/resetUserpassword", json={"username": username, "new_password": newpassword})
            data = response.json()

            if response.status_code == 200:
                users = data["users"]
                return render_template("resetUserpassword.html", users=users)
            else:
                message = data["message"]
                return render_template("resetUserpassword.html", message=message)
        return render_template("resetUserpassword.html")
    except Exception as e:
        print(f"Error updating user: {e}")
        message = "Error : An error occurred while updating the user." + str(e)
        return render_template("resetUserpassword.html", message=message)



@app.route('/update_user/<int:userid>', methods=['GET', 'POST'])
def update_user(userid):
    if "loggedin" not in session or session["Privilege"] != "Admin":
        return redirect(url_for("login"))
    try:
        if request.method == 'POST':
            name = request.form["name"]
            username = request.form["username"]
            email = request.form["email"]
            privilege = request.form.get("privilege")
            AccStatus = request.form.get("AccStatus")
            if not name or not username or not email or not privilege or not AccStatus:
                message = "Please ensure all required fields are filled out before proceeding."
                return render_template("search.html", message=message)

            response = requests.post(f"{NODE_API_URL}/update_user/{userid}", json={"name": name, "username": username, "email": email, "privilege": privilege, "AccStatus": AccStatus})
            data = response.json()

            if response.status_code == 200:
                # Check for "users" key in response
                if "users" in data:
                    users = data["users"]
                    return render_template("UserDisplay.html", users=users)
                else:
                    # Handle case where response doesn't contain "users" key
                    name = data.get("name")  # Access data directly if available
                    username = data.get("username")
                    email = data.get("email")
                    # ... and so on for other user data
                    return render_template("UserDisplay.html", user={"name": name, "username": username, "email": email})  # Pass data as a dictionary
            else:
                message = data["message"]
                return render_template("search.html", message=message)
    except Exception as e:
        print(f"Error updating user: {e}")
        message = "Un expected error try again soon"
        return render_template("search.html", message=message)
@app.route('/register', methods=['GET', 'POST'])
def register():
    if "loggedin" not in session or ("Privilege" not in session or session["Privilege"] != "Admin"):
        return redirect(url_for("login"))
    try:
        message = ""
        if request.method == 'POST' and 'name' in request.form and 'username' in request.form and 'password' in request.form and 'email' in request.form and 'AccStatus' in request.form:
            name = request.form["name"]
            username = request.form["username"]
            password = request.form["password"]
            email = request.form["email"]
            acc_status = request.form["AccStatus"]
            privilege = request.form.get("Privilege")

            response = requests.post(f"{NODE_API_URL}/register", json={"name": name, "username": username, "password": password, "email": email, "AccStatus": acc_status, "Privilege": privilege})
            data = response.json()

            if response.status_code == 200:
                message = data["message"]
            else:
                message = data["message"]

        elif request.method == 'POST':
            message = "Error : Please fill out the form!"
    except Exception as e:
        print(f"An error occurred: {e}")
        message = str(e)
    return render_template("register.html", message=message)

@app.route('/logout')
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