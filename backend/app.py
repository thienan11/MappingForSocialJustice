from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from pymongo import MongoClient
import boto3
import os
import mimetypes
from dotenv import load_dotenv
import logging
from bson.json_util import dumps, ObjectId
import subprocess
import tempfile

# TODO: Use uuid to generate unique filenames for uploaded media

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
# CORS(app)

if os.getenv("FLASK_ENV") == "development":
    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}) # Development
else:
    CORS(app, resources={r"/*": {
        "origins": os.getenv("FRONTEND_PROD_URL"),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }}) # Production

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response

# Setup logging
logging.basicConfig(level=logging.INFO)

# MongoDB setup using pymongo
mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("MONGO_DB_NAME")
client = MongoClient(mongo_uri)
db = client[db_name]

# Ensure the database connection is established
try:
    client.server_info()  # Forces a call to the server
    logging.info(f"Connected to MongoDB successfully! Using database: {db_name}")
except Exception as e:
    logging.error(f"Failed to connect to MongoDB: {e}")
    raise

# AWS S3 setup
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_REGION"),
    endpoint_url=os.getenv("AWS_ENDPOINT")
)

# Helper function to serialize MongoDB documents
def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    return doc

# Helper function to process and blur media
def blur_media(input_path, output_path, media_type):
    logging.info(f"Processing {media_type} file.")
    logging.info(f"Input path: {input_path}")
    logging.info(f"Output path: {output_path}")

    supported_formats = {'pfm', 'bmp', 'dng', 'png', 'webp', 'jpeg', 'tif', 'mpo', 'tiff', 'jpg', 'asf', 'mkv', 'avi', 'mpeg', 'm4v', 'webm', 'wmv', 'mp4', 'mpg', 'gif', 'ts', 'mov'}
    file_ext = os.path.splitext(input_path)[1].lower().replace('.', '')
    if file_ext not in supported_formats:
        logging.error(f"Unsupported file format: {file_ext}")
        raise ValueError(f"Unsupported file format: {file_ext}")

    if not os.path.isfile(input_path):
        logging.error(f"Input file does not exist or is not accessible: {input_path}")
        raise FileNotFoundError(f"Input file does not exist or is not accessible: {input_path}")

    script_path = 'face_blurring/scripts/yolo_blurring.py'
    if not os.path.exists(script_path):
        logging.error(f"Script file does not exist: {script_path}")
        raise FileNotFoundError(f"Script file does not exist: {script_path}")

    command = [
        'python3', script_path,
        '-m', media_type,
        '-i', input_path,
        '-o', output_path
    ]
    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        logging.info(f"Blurring completed successfully: {result.stdout}")
    except subprocess.CalledProcessError as e:
        logging.error(f"Blurring failed: {e.stderr}")
        raise

# Routes
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'media' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['media']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    title = request.form.get('title')
    description = request.form.get('description')
    lat = request.form.get('lat')
    lng = request.form.get('lng')

    filename = secure_filename(file.filename)
    content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'

    temp_input_file = None
    temp_output_file = None

    try:
        # Save the file temporarily
        temp_input_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1])
        file.save(temp_input_file.name)

        # Determine if the file is an image or video
        media_type = 'image' if content_type.startswith('image') else 'video'

        # Prepare output path for blurred file
        temp_output_file = tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1])
        output_path = temp_output_file.name

        # Apply blurring
        blur_media(temp_input_file.name, output_path, media_type)

        # Upload to S3
        with open(output_path, 'rb') as file_obj:
            s3.upload_fileobj(
                file_obj,
                os.getenv("AWS_BUCKET_NAME"),
                filename,
                ExtraArgs={
                    'ACL': 'public-read',
                    'ContentType': content_type,
                    'ContentDisposition': 'inline'
                }
            )

        endpoint = os.getenv('AWS_ENDPOINT').replace('https://', '')
        s3_url = f"https://{os.getenv('AWS_BUCKET_NAME')}.{endpoint}/{filename}"

        # Save to MongoDB
        media = {
            "title": title,
            "description": description,
            "url": s3_url,
            "lat": lat,
            "lng": lng
        }
        result = db.media.insert_one(media)
        media['_id'] = str(result.inserted_id)

        return jsonify({"message": "File uploaded successfully", "media": media}), 201

    except Exception as e:
        logging.error(f"Error uploading file: {e}")
        return str(e), 500
    

    finally:
        # Cleanup temporary files
        logging.info("Cleaning up temporary files...")
        if temp_input_file and os.path.exists(temp_input_file.name):
            os.remove(temp_input_file.name)
        if temp_output_file and os.path.exists(output_path):
            os.remove(output_path)
        logging.info("Cleanup complete.")

@app.route('/media', methods=['GET'])
def get_media():
    try:
        media = db.media.find()
        media_list = [serialize_doc(m) for m in media]
        return jsonify(media_list), 200
    except Exception as e:
        logging.error(f"Error retrieving media: {e}")
        return str(e), 500
    
# TODO: Implement the delete_media route (MongoDB and S3)

@app.route('/')
def home():
    return "Welcome to the MFSJ server!", 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 4000)), debug=True)
