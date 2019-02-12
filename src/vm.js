'use strict';

const { fs, Path, Buffer } = require('filer');
const { V86Starter } = require('v86');
const { vmStateCache, stateUrl, defaultEmulatorOptions } = require('./config');

// Expose fs on window
window.fs = fs;

// What our shell prompt looks like, so we can wait on it.
const prompt = '/ # ';

const getVMStateUrl = () => new URL(stateUrl, window.location);

const getVMStartOptions = () => {
  const options = Object.create(defaultEmulatorOptions);
  options.filesystem = {
    fs,
    sh: new fs.Shell(),
    Path,
    Buffer
  };

  return options;
};

class VM {
  constructor(term) {
    this.emulator = null;
    this.term = term;

    this.boot = async () => {
      if (this.emulator) {
        return;
      }

      const hasCachedVM = await checkState();
      if (hasCachedVM) {
        this.emulator = warmBoot(this.term);
      } else {
        this.emulator = await coldBoot(this.term);
      }
    };

    // Pause the running VM
    this.suspend = () => {
      if (!(this.emulator && this.emulator.is_running())) {
        return;
      }
      this.emulator.stop();
    };

    // Restart the paused VM
    this.resume = () => {
      if (!(this.emulator && !this.emulator.is_running())) {
        return;
      }
      this.emulator.run();
    };
  }
}

// Wire up event handlers, print shell prompt (which we've eaten), and focus term.
const startTerminal = (emulator, term) => {
  term.reset();
  term.writeln('Linux 4.15.7. Shared browser files are located in /mnt');
  term.write(prompt);
  term.focus();

  // Wire input events from xterm.js -> ttyS0
  term.on('key', key => emulator.serial0_send(key));
  // Wire output events from ttyS0 -> xterm.js
  emulator.add_listener('serial0-output-char', char => term.write(char));
};

// Power up VM, saving state when boot completes.
const coldBoot = async term => {
/**
  term.write('Booting Linux');

  // Write .... to terminal to show we're doing something.
  const timer = setInterval(() => {
    term.write('.');
  }, 500);
**/
  const options = getVMStartOptions();
  const emulator = new V86Starter(options);

  await storeInitialStateOnBoot(emulator, term);
  return emulator;
};

// Restore VM from saved state
const warmBoot = term => {
  // Add saved state URL for vm
  const options = getVMStartOptions();
  options.initial_state = {
    url: stateUrl
  };
  const emulator = new V86Starter(options);
  startTerminal(emulator, term);

  return emulator;
};

// Wait until we get our shell prompt (other characters are noise on the serial port at startup)
// At the same time, print all boot messages to the screen, and clear when booted.
const waitForPrompt = async (emulator, term) =>
  new Promise(resolve => {
    let serialBuffer = '';
    let screenBuffer = [];
    let currentRow;

    function handleScreenCharData(data) {
      const row = data[0];
      const col = data[1];
      const char = data[2];

      // Flush the buffer and advance to next line
      if(row !== currentRow) {
        currentRow = row;
        term.writeln(screenBuffer.join(''));
        screenBuffer = [];
      }

      screenBuffer[col] = String.fromCharCode(char);
    }
  
    function handleSerialCharData(char) {
      serialBuffer += char;

      // Wait for initial root shell prompt, which indicates a completed boot
      if (serialBuffer.endsWith(prompt)) {
        // Remove boot time screen and serial data handlers and clear the terminal
        emulator.remove_listener('screen-put-char', handleScreenCharData);
        emulator.remove_listener('serial0-output-char', handleSerialCharData);
        term.clear();

        // We're done, we have a prompt, system is ready. 
        resolve();
      }
    }

    // Start listening for data over the serial and screen buses.
    emulator.add_listener('screen-put-char', handleScreenCharData);
    emulator.add_listener('serial0-output-char', handleSerialCharData);
  });

const storeInitialStateOnBoot = async (emulator, term) => {
  // Wait for the prompt to come up, then start term and save the VM state
  await waitForPrompt(emulator, term);
  startTerminal(emulator, term);
//  emulator.save_state(saveVMState);
};

// See if we have a cached VM machine state to restart from a previous boot.
const checkState = () =>
  caches
    .open(vmStateCache)
    .then(cache =>
      cache.match(getVMStateUrl()).then(response => !!response)
    );

// Save the VM's booted state to improve startup next time.
const saveVMState = (err, state) => {
  const blob = new Blob([new Uint8Array(state)], {
    type: 'application/octet-stream',
  });
  const response = new Response(blob, {
    status: 200,
    statusText: 'OK, Linux VM machine state cached (safe to delete).',
  });

  const headers = new Headers();
  headers.append('Content-Type', 'application/octet-stream');
  // TODO: not sure why content-length is always 0 in Chrome?
  headers.append('Content-Length', blob.size);

  const url = getVMStateUrl();
  const request = new Request(url, {
    method: 'GET',
    headers,
  });

  caches
    .open(vmStateCache)
    .then(cache => cache.put(request, response))
    .catch(err => console.error(err));
};

module.exports = VM;
