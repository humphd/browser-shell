'use strict';

const { Workbox } = require('workbox-window');
const browser = require('./browser');
const { fsRoot } = require('./config');
const filesystem = require('./filesystem');

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
  wb.controlling.then(browser.start);

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
