'use strict';

const { fsRoot } = require('./config');
const { fs, Path, Buffer } = require('filer');
const sh = new fs.Shell();
const dragDrop = require('drag-drop');

// Expose fs on window for people to play on the console if they want
window.fs = fs;
// Use node's lowercase style `p` path
window.path = Path;
window.Buffer = Buffer;
console.info('fs, path, and Buffer are all available on window for debugging, e.g., fs.stat(\'/\', console.log)');
console.info('See https://github.com/filerjs/filer for docs.');
console.info('use ?debug on the URL if you need Plan9/Filer debug info from v86');

/**
 * Setup drop zone for adding files
 */
window.addEventListener('DOMContentLoaded', function() {
  const dropTarget = document.querySelector('#drag-drop');

  dragDrop(dropTarget, function (files) {
    files.forEach(function (file) {
      console.log(`Importing ${file.fullPath}...`);
  
      var reader = new FileReader();
      reader.onload = function(e) {
        // e.target.result is an ArrayBuffer
        var arr = new Uint8Array(e.target.result);
        var buffer = new Buffer(arr);

        // Create any parent paths we need before trying to write the file
        const dirname = Path.dirname(file.fullPath);
        sh.mkdirp(dirname, function(err) {
          if(err) {
            return console.log(`...unable to create directory path ${dirname}: ${err.message}`);
          }

          // Write the file to disk
          fs.writeFile(file.fullPath, buffer, function(err) {
            if(err) {
              console.log(`...unable to import file ${file.fullPath}: ${err.message}`);
            } else {
              console.log(`...wrote ${file.fullPath} (${file.size} bytes) successfully.`);
            }
          });  
        });
      };
      reader.onerror = function(err) {
        console.error('FileReader error' + err);
      };
      reader.readAsArrayBuffer(file);
    });
  });  
});

/**
 * Put some files in the filesystem on the first run
 */
function install() {
  const readme = `Welcome! Your files are located in /mnt and available at the URL /${fsRoot}`;
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
  sh,
  Path,
  Buffer
};
