'use strict';

const { Terminal } = require('xterm');
const fit = require('xterm/lib/addons/fit/fit');
const { molokaiTheme } = require('./config');
const vm = require('./vm');

// Locally root will be / but on gh-pages, /browser-shell/
// Strip the leading and trailing / (if present), since we'll
// add that in nohost.
const pathname = window.location.pathname;
const webRoot = pathname.replace(/^\//, '').replace(/\/$/, '');
const fsRoot = `${webRoot ? webRoot + '/' : ''}fs`;

function initBrowser() {
  // Open a page to the nohost web server for this filesystem.  
  const iframe = document.querySelector('#nohost-server');
  const iframeWindow = iframe.contentWindow;

  // Back
  document.querySelector('#browser-back').onclick = function(e) {
    e.preventDefault();
    iframeWindow.history.back(); 
  };

  // Forward
  document.querySelector('#browser-forward').onclick = function(e) {
    e.preventDefault();
    iframeWindow.history.forward();
  };

  function goHome() {
    iframe.src = fsRoot;
  }

  // Forward
  document.querySelector('#browser-home').onclick = function(e) {
    e.preventDefault();
    goHome();
  };

  // Refresh
  document.querySelector('#browser-refresh').onclick = function(e) {
    e.preventDefault();
    iframeWindow.location.reload(true);
  };

  goHome();
}

/**
 * Register the nohost service worker, passing `route`
 */
if(!('serviceWorker' in navigator)) {
  console.log('[nohost] unable to initialize service worker: not supported.');
} else {
  navigator.serviceWorker
    // Downloaded via package.json script from https://www.npmjs.com/package/nohost?activeTab=versions via unpkg
    .register(`nohost-sw.js?route=${encodeURIComponent(fsRoot)}`)
    .then(initBrowser)
    .catch(err => {
      console.error(`[nohost] unable to register service worker: ${err.message}`);
    });
}

function createTerminal() {
  Terminal.applyAddon(fit);
  const term = (window.term = new Terminal({ theme: molokaiTheme }));
  term.open(document.getElementById('terminal'));
  term.fit();

  return term;
}

window.addEventListener('DOMContentLoaded', () => {
  const term = createTerminal();
  vm.boot(term);
});
