'use strict';

const { fsRoot } = require('./config');

function start() {
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
    iframe.src = `/${fsRoot}`;
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

module.exports.start = start;
