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
    var marnieFolderName = 'photos-' + new Date().toString();
    var URLs = [];
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

function addImage(URL) {
    let req = GM.xmlHttpRequest({
        method: "GET",
        url: 'http://markmetcalfe.io/city24/add?password=marnie2411&folder=' + marnieFolderName + '&url=' + URL,
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
            url: 'http://markmetcalfe.io/city24/delete?password=marnie2411&folder=' + marnieFolderName,
            onload: function (xhr) {
                console.log('Deleted folder: ' + marnieFolderName);
                window.onbeforeunload = null;
            },
        });
        req.send();
    }, 2000);
    let win = window.open('http://markmetcalfe.io/city24/add?password=marnie2411&folder=' + marnieFolderName, '_blank');
    win.focus();
}