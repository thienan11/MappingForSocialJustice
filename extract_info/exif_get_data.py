import subprocess

def get_metadata_with_exiftool(file_path):
    # Assuming ExifTool is installed and in your PATH
    cmd = ['exiftool', file_path]
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, err = process.communicate()
    
    if err:
        print("Error:", err)
    else:
        metadata = {}
        for line in out.split('\n'):
            if ': ' in line:
                key, value = line.split(': ', 1)
                metadata[key.strip()] = value.strip()
        return metadata

# Example usage for an image file
image_metadata = get_metadata_with_exiftool('../data/Tehran_TestMedia/SharifSampleVideo.mp4')
print(image_metadata)