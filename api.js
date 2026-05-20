// api.js  -  tutte le chiamate al backend GAS

function gasCall(params, callback) {
  if (!GAS_URL) {
    callback({ ok: false, error: 'GAS_URL non configurato in config.js' });
    return;
  }
  var qs = Object.keys(params)
    .map(function(k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
    .join('&');
  var url = GAS_URL + '?' + qs;

  fetch(url, { redirect: 'follow' })
    .then(function(res) { return res.json(); })
    .then(function(data) { callback(data); })
    .catch(function(err) { callback({ ok: false, error: String(err) }); });
}

function apiCreateSession(config, cb) {
  gasCall({ action: 'createSession', config: JSON.stringify(config) }, cb);
}

function apiGetSession(id, cb) {
  gasCall({ action: 'getSession', id: id }, cb);
}

function apiSubmitResult(payload, cb) {
  gasCall({ action: 'submitResult', data: JSON.stringify(payload) }, cb);
}

function apiGetSessions(cb) {
  gasCall({ action: 'getSessions' }, cb);
}

function apiDeleteSession(id, cb) {
  gasCall({ action: 'deleteSession', id: id }, cb);
}

function apiGetResults(sessionId, cb) {
  gasCall({ action: 'getResults', session: sessionId || '' }, cb);
}
