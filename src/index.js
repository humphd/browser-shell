'use strict';

const { Terminal } = require('xterm');
const fit = require('xterm/lib/addons/fit/fit');
const { molokaiTheme } = require('./config');
const VM = require('./vm');
let vm;

function createTerminal() {
//  Terminal.applyAddon(fit);
  const term = (window.term = new Terminal({ theme: molokaiTheme }));
  term.open(document.getElementById('terminal'));
//  term.fit();
  return term;
}

window.addEventListener('DOMContentLoaded', () => {
  const term = createTerminal();
  vm = new VM(term);

  // Reduce CPU/battery use when not in focus
  // TODO: we might want to add UI to disable this later
  term.on('focus', vm.resume);
  term.on('blur', vm.suspend);

  vm.boot();
});
