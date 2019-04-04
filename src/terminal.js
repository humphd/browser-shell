'use strict';

const { Terminal } = require('xterm');
const fit = require('xterm/lib/addons/fit/fit');
const { molokaiTheme } = require('./config');
const vm = require('./vm');

function start() {
  window.addEventListener('DOMContentLoaded', () => {
    Terminal.applyAddon(fit);
    const term = (window.term = new Terminal({ theme: molokaiTheme }));
    term.open(document.getElementById('terminal'));
    term.fit();
    vm.boot(term);
  });
}

module.exports.start = start;
