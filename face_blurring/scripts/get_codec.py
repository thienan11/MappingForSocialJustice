# Determine the codec based on file extension
def get_codec_from_file(filename):
    extension = filename.split('.')[-1].lower()
    if extension in ['avi']:
        return 'XVID'
    elif extension in ['mp4']:
        return 'mp4v'
    elif extension in ['mov']:
        return 'avc1'
    else:
        raise ValueError("Unsupported file format")