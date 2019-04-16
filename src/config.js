'use strict';

// Locally root will be / but on gh-pages, /browser-shell/
// Strip the leading and trailing / (if present), since we'll
// add that in nohost.
const pathname = window.location.pathname;
const basename = pathname.replace(/\/(index.html)?$/, '');
const webRoot = basename.replace(/^\//, '');

module.exports = {
  fsRoot: webRoot ? `${webRoot}/fs` : 'fs',

  stateUrl: 'bin/vm-state.bin',
  vmStateCache: 'vm-state',

  // https://github.com/sonatard/color-theme-molokai/blob/2320bc6150c5dd2be353a9a7967e8c482dc48b61/molokai.minttyrc
  molokaiTheme: {
    background: '#252525',
    cursor: '#A0A0A0',
    foreground: '#A0A0A0',
    black: '#252525',
    blue: '#268BD2',
    brightBlack: '#505354',
    brightBlue: '#62ADE3',
    brightCyan: '#94D8E5',
    brightGreen: '#B7EB46',
    brightMagenta: '#BFA0FE',
    brightRed: '#FF5995',
    brightWhite: '#F8F8F2',
    brightYellow: '#FEED6C',
    cyan: '#56C2D6',
    green: '#82B414 ',
    magenta: '#8C54FE',
    red: '#F92672',
    white: '#CCCCC6',
    yellow: '#FD971F'
  },

  defaultEmulatorOptions: {
    memory_size: 32 * 1024 * 1024,
    vga_memory_size: 2 * 1024 * 1024,
    /* If you need to debug the main console, add this back.
    screen_container: document.getElementById('screen_container'),
    */
    bios: {
      url: 'bin/seabios.bin',
    },
    vga_bios: {
      url: 'bin/vgabios.bin',
    },
    cdrom: {
      url: 'bin/v86-linux.iso',
    },
    // Mouse disabled, undo if you want to interact with the screen
    disable_mouse: true,
    // Keyboard disabled, undo if you want to type in screen
    disable_keyboard: true,
    // Disable sound
    disable_speaker: true,
    autostart: true
  }
};
