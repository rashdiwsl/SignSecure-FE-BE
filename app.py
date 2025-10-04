from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from signature_model import predict_signature  # your existing model function

# -------------------- Config --------------------
UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

app = Flask(__name__)
CORS(app)  # allow frontend requests
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# -------------------- Helper --------------------
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# -------------------- Routes --------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Signature verification API running"}), 200

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(file_path)

        # Run your signature verification model
        result = predict_signature(file_path)  # should return "Valid" / "Invalid"

        # Delete the uploaded file after prediction
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")

        return jsonify({"result": result})

    return jsonify({"error": "Invalid file type"}), 400

# -------------------- Run Server --------------------
if __name__ == "__main__":
    app.run(debug=True)
