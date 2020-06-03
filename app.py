# app.py

from flask import Flask, request, send_from_directory
import json
import os
from os import path
import time
import requests
import shutil
from xhtml2pdf import pisa
from urllib.parse import unquote
import glob

app = Flask(__name__)

@app.route('/summary', methods=['POST'])
def summary():
    password = request.json.get('password')
    if password != 'marnie2411':
        return 'Invalid passphrase', 403

    if path.exists('/photos') == False:
        os.mkdir('/photos')

    folderName = request.json.get('folder')
    folder = '/photos/' + folderName

    if path.exists(folder) == False:
        os.mkdir(folder)

    filename = folder + '/' + folderName + ' listing.pdf'

    if path.exists(filename) == True:
        os.remove(filename)

    bodyHtml = unquote(request.json.get('html'))
    css = 'body {font-family: sans-serif} pre {font-family: inherit} tr{text-align:left} @font-face {font-family: \'Open Sans\', sans-serif; src: url(OpenSans-Regular.ttf)}'
    sourceHtml = '<html><head><style>' + css + '</style></head><body>' + bodyHtml + '</body>'

    pdfFile = open(filename, 'wb')
    pisaStatus = pisa.CreatePDF(sourceHtml, dest=pdfFile, encoding='utf-8')
    pdfFile.close()

    return 'Added pdf', 200

@app.route('/add', methods=['POST'])
def add():
    password = request.json.get('password')
    if password != 'marnie2411':
        return 'Invalid passphrase', 403

    if path.exists('/photos') == False:
        os.mkdir('/photos')

    folderName = request.json.get('folder')
    folder = '/photos/' + folderName

    if path.exists(folder) == False:
        os.mkdir(folder)

    url = unquote(request.json.get('url'))
    imageNum = str(len(glob.glob1(folder, "*.jpg")) + 1).zfill(2)
    image = requests.get(url, allow_redirects=False)
    imageFile = open(folder + '/' + folderName + ' ' + imageNum + '.jpg', 'wb')
    imageFile.write(image.content)
    imageFile.close()

    return 'Added photo', 200

@app.route('/download')
def download():
    password = request.args.get('password')
    if password != 'marnie2411':
        return 'Invalid passphrase', 403

    filename = unquote(request.args.get('folder'))
    directory = '/photos'
    dirfile = directory + '/' + filename

    if path.exists(dirfile) == False:
        return 'Folder not found', 400

    shutil.make_archive(dirfile, 'zip', dirfile)
    return send_from_directory(filename=filename + '.zip', directory=directory, mimetype='application/zip', as_attachment=True)

@app.route('/delete', methods=['POST'])
def delete():
    password = request.json.get('password')
    if password != 'marnie2411':
        return 'Invalid passphrase', 403

    folder = '/photos/' + request.json.get('folder')

    if path.exists(folder) == False:
        return 'Folder not found', 400

    shutil.rmtree(folder)
    if path.exists(folder + '.zip'):
        os.remove(folder + '.zip')

    return 'Deleted', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0')
