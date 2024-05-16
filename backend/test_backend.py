import unittest
from flask import Flask
from flask_pymongo import PyMongo
from werkzeug.utils import secure_filename
from io import BytesIO
import boto3
import os
from backend import app, media
from unittest.mock import patch, MagicMock

class FlaskTestCase(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.app = app.test_client()
        self.app.testing = True

    def test_upload_no_file_part(self):
        response = self.app.post('/upload')
        self.assertEqual(response.status_code, 400)
        self.assertIn(b'No file part', response.data)

    def test_upload_no_selected_file(self):
        data = {'media': (BytesIO(b''), '')}
        response = self.app.post('/upload', content_type='multipart/form-data', data=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn(b'No selected file', response.data)

    @patch('backend.s3.upload_file')
    @patch('backend.media.insert_one')
    def test_upload_file_success(self, mock_insert_one, mock_upload_file):
        data = {
            'media': (BytesIO(b'my file contents'), 'testfile.txt'),
            'title': 'Test Title',
            'description': 'Test Description',
            'lat': '12.34',
            'lng': '56.78'
        }
        mock_upload_file.return_value = None
        mock_insert_one.return_value = MagicMock()

        response = self.app.post('/upload', content_type='multipart/form-data', data=data)
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'File uploaded successfully', response.data)
        mock_upload_file.assert_called_once()
        mock_insert_one.assert_called_once_with({
            'title': 'Test Title',
            'description': 'Test Description',
            'url': f"{os.getenv('AWS_ENDPOINT')}/{os.getenv('AWS_BUCKET_NAME')}/testfile.txt",
            'lat': '12.34',
            'lng': '56.78'
        })

if __name__ == '__main__':
    unittest.main()
