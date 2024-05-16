from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson.json_util import dumps
from werkzeug.utils import secure_filename
import boto3
import os

app = Flask(__name__)

# MongoDB setup
app.config["MONGO_URI"] = os.getenv('MONGO_URI')
mongo = PyMongo(app)

# AWS S3 setup
s3 = boto3.client('s3',
                  aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                  aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                  region_name=os.getenv('AWS_REGION'))

# MongoDB Schema
media = mongo.db.media

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'media' not in request.files:
        return jsonify({'message': 'No file part'}), 400
    file = request.files['media']
    if file.filename == '':
        return jsonify({'message': 'No selected file'}), 400
    if file:
        filename = secure_filename(file.filename)
        file.save(filename)
        s3.upload_file(
            Bucket=os.getenv('AWS_BUCKET_NAME'),
            Filename=filename,
            Key=filename
        )
        os.remove(filename)
        media.insert_one({
            'title': request.form.get('title'),
            'description': request.form.get('description'),
            'url': f"{os.getenv('AWS_ENDPOINT')}/{os.getenv('AWS_BUCKET_NAME')}/{filename}",
            'lat': request.form.get('lat'),
            'lng': request.form.get('lng')
        })
        return jsonify({'message': 'File uploaded successfully'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
