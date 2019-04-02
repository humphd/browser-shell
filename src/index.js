'use strict';

const { Terminal } = require('xterm');
const fit = require('xterm/lib/addons/fit/fit');
const { molokaiTheme } = require('./config');
const vm = require('./vm');

/**
 * Register the nohost service worker, passing `route`
 */
if(!('serviceWorker' in navigator)) {
  console.log('[nohost] unable to initialize service worker: not supported.');
} else {
  navigator.serviceWorker
    // Downloaded via package.json script from https://www.npmjs.com/package/nohost?activeTab=versions via unpkg
    .register('nohost-sw.js')
    .then(() => {
      // Open a page to the nohost web server for this filesystem.
      const iframe = document.querySelector('#nohost-server');
      iframe.src = '/fs/';

      const btnRefresh = document.querySelector('#btn-refresh');
      btnRefresh.onclick = function(e) {
        e.preventDefault();
        iframe.contentWindow.location.reload(true);
      };
    })
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
