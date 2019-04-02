'use strict';

const { Terminal } = require('xterm');
const fit = require('xterm/lib/addons/fit/fit');
const { molokaiTheme } = require('./config');
const vm = require('./vm');

function initBrowser() {
  // Open a page to the nohost web server for this filesystem.  
  const iframe = document.querySelector('#nohost-server');
  const iframeWindow = iframe.contentWindow;
  // Locally root will be / but on gh-pages, /browser-shell/
  const root = window.location.pathname.replace(/\/$/, '');

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
    iframe.src = `${root}/fs/`;
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
    .register('nohost-sw.js')
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
