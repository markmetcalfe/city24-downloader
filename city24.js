// ==UserScript==
// @name         City24 Photo Grabber
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  For Marnz
// @author       Mark Metcalfe
// @match        https://www.city24.ee/*
// @match        https://www.city24.lv/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    let btn = document.createElement("button");
    btn.id = 'run-script-button';
    btn.textContent = "Run Marks Script";
    btn.onclick = runMarksScript;
    btn.style = "display:block;position:fixed;top:0;left:0;width:100px;height:50px;z-index:999999999;background:white";
    document.body.insertBefore(btn, document.body.firstChild);
})();

const timeBetweenPictures = 6000;
const baseUrl = 'https://markmetcalfe.io/city24';

function runMarksScript() {
    let msg = document.createElement("div");
    msg.id = 'script-running-message';
    msg.innerHTML = "<div><strike>Stealin</strike><em>Getting</em> the photos!</div><div style=\"font-size:30px\"><em>\"Private property doesn't vibe\" - Karl Marx</em></div>";
    msg.style = "display:flex;position:fixed;top:0;left:0;width:100vw;height:100vh;justify-content:center;z-index:999999999999;align-items:center;font-size:10em;background:white;opacity:0.9;flex-wrap:wrap";
    document.body.insertBefore(msg, document.body.firstChild);

    document.querySelector('.itemTitle h1 span').remove()
    document.querySelector('.property_description a.toggle_more').click();
    document.querySelector('.property_description a.toggle_more').remove();
    let desc = document.querySelector('.property_description');
    let newDesc = document.createElement('div');
    newDesc.innerHTML = desc.innerHTML;
    desc.parentNode.replaceChild(newDesc, desc);

    let html = document.querySelector('.itemOverview').innerHTML;

    document.querySelector('.mapdialog__arrow').click();
    let mapsLink = /^window\.open\(\'([^']+)'/g.exec(document.querySelector('#imageMap').getAttribute('onclick'))[1];
    html += '<h2>Map</h2><a href="' + mapsLink + '">View on Google Maps</a><br><br>' + document.querySelector('#itemMap').innerHTML;

    html = '<h1>' + folderName() + '</h1>' + html;
    addSummary(html);

    document.querySelector('.itemImages a').click();
    setTimeout(function () {
        getPhotos();
    }, timeBetweenPictures);
}

function getPhotos() {
    var interval = null;
    interval = setInterval(function () {
        if (document.querySelector('.highslide-image')) {
            let url = document.querySelector('.highslide-image').getAttribute('src');
            addImage(url);
            if (document.querySelector('.highslide-viewport > .highslide-btn-wrap.next a')) {
                document.querySelector('.highslide-viewport > .highslide-btn-wrap.next a').click();
            } else {
                downloadZip();
                clearInterval(interval);
                return;
            }
        } else {
            downloadZip();
            clearInterval(interval);
            return;
        }
    }, timeBetweenPictures);
}

function addSummary(Html) {
    GM_xmlhttpRequest({
        method: "POST",
        url: baseUrl + '/summary',
        data: JSON.stringify({
            password: 'marnie2411',
            folder: folderName(),
            html: encodeURIComponent(Html)
        }),
        headers: {
            "Content-Type": "application/json;charset=UTF-8"
        },
        onload: function (xhr) {
            console.log('Added summary to folder: ' + folderName());
        },
    });
}

function addImage(URL) {
    GM_xmlhttpRequest({
        method: "POST",
        url: baseUrl + '/add',
        data: JSON.stringify({
            password: 'marnie2411',
            folder: folderName(),
            url: encodeURIComponent(URL)
        }),
        headers: {
            "Content-Type": "application/json;charset=UTF-8"
        },
        onload: function (xhr) {
            console.log('Added image to folder: ' + folderName() + ' with url: ' + URL);
        },
    });
}

function downloadZip() {
    window.onbeforeunload = function () {
        return "Yo wait up a little...need to delete the photos on the server so i dont run out of room my g";
    }
    setTimeout(function () {
        GM_xmlhttpRequest({
            method: "POST",
            url: baseUrl + '/delete',
            data: JSON.stringify({
                password: 'marnie2411',
                folder: folderName()
            }),
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            onload: function (xhr) {
                console.log('Deleted folder: ' + folderName());
                window.onbeforeunload = null;
                document.getElementById('script-running-message').remove();
                document.getElementById('run-script-button').remove();
            },
        });
    }, timeBetweenPictures * 2);
    setTimeout(function () {
        let folderEncoded = encodeURIComponent(folderName());
        let win = window.open(baseUrl + '/download?password=marnie2411&folder=' + folderEncoded, '_blank');
        win.focus();
    }, timeBetweenPictures);
}

function folderName() {
    return document.querySelector('.itemTitle h1').textContent.trim()
}