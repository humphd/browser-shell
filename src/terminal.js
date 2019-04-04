'use strict';

const { Terminal } = require('xterm');
const fit = require('xterm/lib/addons/fit/fit');
Terminal.applyAddon(fit);

const { molokaiTheme } = require('./config');
const vm = require('./vm');

function createTerm() {
  const term = (window.term = new Terminal({ theme: molokaiTheme }));
  term.open(document.getElementById('terminal'));
  term.fit();
  return term;
}

function start() {
  window.addEventListener('DOMContentLoaded', () => {
    const term = createTerm();
    vm.boot(term);

    // Whether or not the button is active or disabled (has .inactive class)
    function isInactive(elem) {
      return elem.classList.contains('inactive');
    }

    // Play
    document.querySelector('#term-play').onclick = function(e) {
      e.preventDefault();
      if(isInactive(e.target)) return;

      vm.resume();
      term.focus();
    };

    // Pause
    document.querySelector('#term-pause').onclick = function(e) {
      e.preventDefault();
      if(isInactive(e.target)) return;

      vm.suspend();
    };
  });
}

module.exports.start = start;
