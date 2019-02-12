'use strict';

const { vmStateCache, stateUrl } = require('./config');

const getVMStateUrl = () => new URL(stateUrl, window.location);

// See if we have a cached VM machine state to restart from a previous boot.
const getState = () =>
  caches
    .open(vmStateCache)
    .then(cache => cache.match(getVMStateUrl()));

// Boolean check for whether we have state in the cache
const hasState = () =>
  getState().then(response => !!response);

// Save the VM's booted state to improve startup next time.
const saveState = (err, state) => {
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

module.exports = {
  getState,
  hasState,
  saveState
};
