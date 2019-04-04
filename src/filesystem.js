'use strict';

const { fsRoot } = require('./config');
const { fs, Path, Buffer } = require('filer');

// Expose fs on window for people to play on the console if they want
window.fs = fs;
// Use node's lowercase style `p` path
window.path = Path;
window.Buffer = Buffer;
console.info('fs, path, and Buffer are all available on window for debugging, e.g., fs.stat(\'/\', console.log)');
console.info('See https://github.com/filerjs/filer for docs.');
console.info('use ?debug on the URL if you need Plan9/Filer debug info from v86');

/**
 * Put some files in the filesystem on the first run
 */
function install() {
  const readme = `Welcome! Your files are located in /mnt and available at the URL ${fsRoot}`;
  fs.writeFile('/readme.txt', readme, (err) => {
    if(err) console.error('unable to write readme file!', err);

    const html = '<h1>Hello World</h1>';
    fs.writeFile('/hello-world.html', html, (err) => {
      if(err) console.error('unable to write html file!', err);
    });    
  });
}

module.exports = {
  install,
  fs,
  sh: new fs.Shell(),
  Path,
  Buffer
};
