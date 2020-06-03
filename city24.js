// ==UserScript==
// @name         City24 Photo Grabber
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  For Marnz
// @author       Mark Metcalfe
// @match        https://www.city24.ee/*
// @match        https://www.city24.lv/*


// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Your code here...
    let p = document.createElement("button");
    p.textContent = "Run Marks Script";
    p.onclick = runMarksScript;
    p.style = "display:block;position:fixed;top:0;left:0;width:100px;height:50px;z-index:999999999;background:white";
    document.body.insertBefore(p, document.body.firstChild);
})();

function runMarksScript() {
    document.querySelector('.itemTitle h1 span').remove()
    var marnieFolderName = document.querySelector('.itemTitle h1').textContent;
    document.querySelector('.property_description a.toggle_more').click();
    document.querySelector('.property_description a.toggle_more').remove();
    let desc = document.querySelector('.property_description');
    let newDesc = document.createElement('div');
    newDesc.innerHTML = desc.innerHTML;
    desc.parentNode.replaceChild(newDesc, desc);

    let html = document.querySelector('.itemOverview').innerHTML;

    document.querySelector('.mapdialog__arrow').click();
    let mapsLink = /^window\.open\(\'([^']+)'/g.exec(document.querySelector('#imageMap').getAttribute('onclick'))[1];
    html += '<h2>Map</h2><a href="' + mapsLink +'">View on Google Maps</a><br><br>' + document.querySelector('#itemMap').innerHTML;

    html = '<h1>' + marnieFolderName + '</h1>' + html;
    document.querySelector('html').innerHTML = encodeURIComponent(html);
    addSummary(html);

    document.querySelector('.itemImages a').click();
    getPhotos();
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
    }, 4000);
}

function addSummary(Html) {
    let req = GM.xmlHttpRequest({
        method: "GET",
        url: 'https://markmetcalfe.io/city24/summary?password=marnie2411&folder=' + marnieFolderName + '&html=' + encodeURIComponent(Html),
        onload: function (xhr) {
            console.log('Added summary to folder: ' + marnieFolderName);
        },
    });
    req.send();
}

function addImage(URL) {
    let req = GM.xmlHttpRequest({
        method: "GET",
        url: 'https://markmetcalfe.io/city24/add?password=marnie2411&folder=' + marnieFolderName + '&url=' + URL,
        onload: function (xhr) {
            console.log('Added image to folder: ' + marnieFolderName + ' with url: ' + URL);
        },
    });
    req.send();
}

function downloadZip() {
    window.onbeforeunload = function () {
        return "Yo wait up a little...need to delete the photos on the server so i dont run out of room my g";
    }
    setTimeout(function () {
        let req = GM.xmlHttpRequest({
            method: "GET",
            url: 'https://markmetcalfe.io/city24/delete?password=marnie2411&folder=' + marnieFolderName,
            onload: function (xhr) {
                console.log('Deleted folder: ' + marnieFolderName);
                window.onbeforeunload = null;
            },
        });
        req.send();
    }, 2000);
    let win = window.open('https://markmetcalfe.io/city24/add?password=marnie2411&folder=' + marnieFolderName, '_blank');
    win.focus();
}