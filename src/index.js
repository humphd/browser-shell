'use strict';

const { Terminal } = require('xterm');
const fit = require('xterm/lib/addons/fit/fit');
const { molokaiTheme } = require('./config');
const vm = require('./vm');

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
