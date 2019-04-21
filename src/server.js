'use strict';

const { Workbox } = require('workbox-window');
const browser = require('./browser');
const { fsRoot } = require('./config');
const filesystem = require('./filesystem');

/**
 * Parcel doesn't like relative links to routes in a service worker.
 * So let's do it at run-time vs. build-time! Swap all 
 * <code class="parcel-ignore">/fs/...</code> for <a> links to server.
 */
function fixFsUrls() {
  const links = document.querySelectorAll('.parcel-ignore');
  if(!links) return;
  
  links.forEach(link => {
    const path = link.innerHTML;
    link.innerHTML = '';

    const a = document.createElement('a');
    a.href = path;
    a.innerHTML = path;
    a.target = '_blank';
    link.appendChild(a);
  });
}

/**
 * Register the nohost service worker, passing `route`
 */
function start() {
  if(!('serviceWorker' in navigator)) {
    console.log('[nohost] unable to initialize service worker: not supported.');
    return;
  }

  // Downloaded via package.json script from https://www.npmjs.com/package/nohost?activeTab=versions via unpkg
  const wb = new Workbox(`nohost-sw.js?route=${encodeURIComponent(fsRoot)}`);

  // Wait on the server to be fully ready to handle routing requests
  wb.controlling.then(() => {
    fixFsUrls();
    browser.start();
  });

  // Deal with first-run install, if necessary
  wb.addEventListener('installed', (event) => {
    if(!event.isUpdate) {
      filesystem.install();
    }
  });
  
  // Register the service worker after event listeners have been added.
  wb.register();
}

module.exports.start = start;
