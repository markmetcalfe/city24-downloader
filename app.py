# app.py

from flask import Flask, request, send_from_directory
import json
import os
from os import path
import time
import requests
import shutil

app = Flask(__name__)

@app.route('/add')
def add():
    password = request.args.get('password')
    if password != 'marnie2411':
        return 'Invalid passphrase', 403

    if path.exists('/photos') == False:
        os.mkdir('/photos')

    folder = '/photos/' + request.args.get('folder')

    if path.exists(folder) == False:
        os.mkdir(folder)

    url = request.args.get('url')
    imageNum = len(os.listdir(folder)) + 1
    image = requests.get(url, allow_redirects=False)
    open(folder + '/' + str(imageNum) + '.jpg', 'wb').write(image.content)

    return 'Added', 200

@app.route('/download')
def download():
    password = request.args.get('password')
    if password != 'marnie2411':
        return 'Invalid passphrase', 403

    filename = request.args.get('folder')
    directory = '/photos'
    dirfile = directory + '/' + filename

    if path.exists(dirfile) == False:
        return 'Folder not found', 400

    shutil.make_archive(dirfile, 'zip', dirfile)
    return send_from_directory(filename=filename + '.zip', directory=directory, mimetype='application/zip', as_attachment=True)

@app.route('/delete')
def delete():
    password = request.args.get('password')
    if password != 'marnie2411':
        return 'Invalid passphrase', 403

    folder = '/photos/' + request.args.get('folder')

    if path.exists(folder) == False:
        return 'Folder not found', 400

    shutil.rmtree(folder)
    if path.exists(folder + '.zip'):
        os.remove(folder + '.zip')

    return 'Deleted', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0')
