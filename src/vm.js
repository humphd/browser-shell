'use strict';

const filesystem = require('./filesystem');
const { V86Starter } = require('v86');
const { defaultEmulatorOptions } = require('./config');
const cache = require('./cache');

// What our shell prompt looks like, so we can wait on it.
const prompt = '/ # ';

const getVMStartOptions = () => {
  const options = Object.create(defaultEmulatorOptions);

  // Pass the filesystem into the vm
  options.filesystem = filesystem;

  return options;
};

let emulator = null;

module.exports.boot = async term => {
  if (emulator) {
    return;
  }

  const hasCachedVM = await cache.hasState();
  if (hasCachedVM) {
    try {
      await warmBoot(term);
    } catch(err) {
      console.log('Warm boot failed:', err.message);
      await coldBoot(term);
    }
  } else {
    await coldBoot(term);
  }

  // Reduce CPU/battery use when not in focus
  // TODO: we might want to add UI to disable this later
  term.on('focus', resume);
  term.on('blur', suspend);
};

// Pause the running VM
const suspend = module.exports.suspend = () => {
  if (!(emulator && emulator.is_running())) {
    return;
  }
  emulator.stop();
};

// Restart the paused VM
const resume = module.exports.resume = () => {
  if (!(emulator && !emulator.is_running())) {
    return;
  }
  emulator.run();
};

// Wire up event handlers, print shell prompt (which we've eaten), and focus term.
const startTerminal = (emulator, term) => {
  term.reset();
  term.writeln('Linux 4.15.7. Shared browser filesystem mounted in /mnt.');
  term.writeln('fs, path, and Buffer are available on console for debugging.');
  term.write(prompt);
  term.focus();

  // Wire input events from xterm.js -> ttyS0
  term.on('key', key => emulator.serial0_send(key));
  // Wire output events from ttyS0 -> xterm.js
  emulator.add_listener('serial0-output-char', char => term.write(char));
};

// Power up VM, saving state when boot completes.
const coldBoot = async term => {
  const options = getVMStartOptions();
  const emulator = new V86Starter(options);

  await storeInitialStateOnBoot(emulator, term);
  return emulator;
};

// Restore VM from saved state
const warmBoot = async term => {
  // Add saved state URL for vm
  const options = getVMStartOptions();

  return cache.getState()
    .then(response => response.arrayBuffer())
    .then(arrayBuffer =>
      URL.createObjectURL(new Blob([arrayBuffer], { type: 'application/octet-stream' } )))
    .then(url => {
      options.initial_state = { url };
      const emulator = new V86Starter(options);
      startTerminal(emulator, term);
    });
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
  emulator.save_state(cache.saveState);
  console.log('Saved VM cpu/memory state to Cache Storage');
};
