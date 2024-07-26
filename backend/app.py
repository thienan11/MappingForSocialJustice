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

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

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

# Routes
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'media' not in request.files:
        return "No file part", 400

    file = request.files['media']
    if file.filename == '':
        return "No selected file", 400

    title = request.form.get('title')
    description = request.form.get('description')
    lat = request.form.get('lat')
    lng = request.form.get('lng')

    filename = secure_filename(file.filename)
    content_type = mimetypes.guess_type(filename)[0] or 'application/octet-stream'

    try:
        # Upload to S3
        s3.upload_fileobj(
            file,
            os.getenv("AWS_BUCKET_NAME"),
            filename,
            ExtraArgs={
                'ACL': 'public-read',
                'ContentType': content_type,
                'ContentDisposition': 'inline'
            }
        )
        s3_url = f"https://{os.getenv('AWS_BUCKET_NAME')}.{os.getenv('AWS_ENDPOINT')}/{filename}"

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

@app.route('/media', methods=['GET'])
def get_media():
    try:
        media = db.media.find()
        media_list = [serialize_doc(m) for m in media]
        return jsonify(media_list), 200
    except Exception as e:
        logging.error(f"Error retrieving media: {e}")
        return str(e), 500

@app.route('/')
def home():
    return "Welcome to the server!", 200

if __name__ == '__main__':
    app.run(port=int(os.getenv("PORT", 4000)), debug=True)
