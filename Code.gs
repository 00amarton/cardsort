// Card Sorting - API Backend (GitHub Pages + GAS)
// Questo script NON serve pagine HTML.
// Riceve chiamate fetch() da GitHub Pages e legge/scrive su Sheets e Properties.

var RESULTS_SHEET  = 'Risultati';
var SESSION_PREFIX = 'cs_';
var META_COLS      = 4;

function doGet(e) {
  var param  = (e && e.parameter) ? e.parameter : {};
  var action = param.action || '';
  var result;

  if (action === 'createSession') {
    var config = null;
    try { config = JSON.parse(param.config || 'null'); } catch(err) {}
    if (!config) {
      result = { ok: false, error: 'config non valida' };
    } else {
      var uuid = Utilities.getUuid();
      var id   = uuid.replace(new RegExp('-','g'),'').substring(0,8);
      PropertiesService.getScriptProperties()
        .setProperty(SESSION_PREFIX + id, JSON.stringify(config));
      result = { ok: true, id: id };
    }

  } else if (action === 'getSession') {
    var sid = param.id || '';
    var raw = sid
      ? PropertiesService.getScriptProperties().getProperty(SESSION_PREFIX + sid)
      : null;
    if (!raw) {
      result = { ok: false, error: 'sessione non trovata' };
    } else {
      try   { result = { ok: true, session: JSON.parse(raw) }; }
      catch(err) { result = { ok: false, error: 'parse error' }; }
    }

  } else if (action === 'submitResult') {
    var data = null;
    try { data = JSON.parse(param.data || 'null'); } catch(err) {}
    if (!data) {
      result = { ok: false, error: 'data non valida' };
    } else {
      try {
        _writeResult(data);
        result = { ok: true };
      } catch(err) {
        result = { ok: false, error: String(err.message || err) };
      }
    }

  } else if (action === 'getSessions') {
    var all   = PropertiesService.getScriptProperties().getProperties();
    var keys  = Object.keys(all);
    var list  = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.indexOf(SESSION_PREFIX) !== 0) { continue; }
      try {
        var c    = JSON.parse(all[k]);
        var item = {};
        item.id    = k.substring(SESSION_PREFIX.length);
        item.title = c.title || '(Senza titolo)';
        item.cards = (c.cards || []).length;
        list.push(item);
      } catch(e2) {}
    }
    list.reverse();
    result = { ok: true, sessions: list };

  } else if (action === 'deleteSession') {
    var delId = param.id || '';
    if (delId) {
      PropertiesService.getScriptProperties().deleteProperty(SESSION_PREFIX + delId);
    }
    result = { ok: true };

  } else if (action === 'getResults') {
    var filterSid = param.session || '';
    result = _readResults(filterSid);

  } else {
    result = { ok: false, error: 'action sconosciuta: ' + action };
  }

  var out = ContentService.createTextOutput(JSON.stringify(result));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function _writeResult(payload) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RESULTS_SHEET);
  if (!sheet) { sheet = ss.insertSheet(RESULTS_SHEET); }

  var cats           = payload.categories || {};
  var cardToCategory = {};
  var catKeys        = Object.keys(cats);
  for (var i = 0; i < catKeys.length; i++) {
    var cat = catKeys[i];
    var cds = cats[cat] || [];
    for (var j = 0; j < cds.length; j++) {
      cardToCategory[cds[j]] = cat;
    }
  }
  var submittedCards = Object.keys(cardToCategory);
  var headers;

  if (sheet.getLastRow() === 0) {
    headers = ['Timestamp','Sessione','Partecipante','Titolo'].concat(submittedCards);
    sheet.appendRow(headers);
    sheet.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#c5cae9');
    sheet.setFrozenRows(1);
  } else {
    var rawH = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    headers  = [];
    for (var h = 0; h < rawH.length; h++) { headers.push(String(rawH[h])); }
    var existing = headers.slice(META_COLS);
    var newCards = [];
    for (var n = 0; n < submittedCards.length; n++) {
      if (existing.indexOf(submittedCards[n]) === -1) { newCards.push(submittedCards[n]); }
    }
    if (newCards.length > 0) {
      var extended = headers.concat(newCards);
      sheet.getRange(1,1,1,extended.length).setValues([extended]);
      headers = extended;
    }
  }

  var cardH   = headers.slice(META_COLS);
  var rowData = [
    new Date(payload.timestamp || new Date().toISOString()),
    payload.sessionId     || '',
    payload.participantId || 'anonimo',
    payload.sessionTitle  || ''
  ];
  for (var r = 0; r < cardH.length; r++) {
    rowData.push(cardToCategory[cardH[r]] || '');
  }
  sheet.appendRow(rowData);
}

function _readResults(sessionId) {
  var ss    = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RESULTS_SHEET);
  if (!sheet || sheet.getLastRow() < 2) { return { ok:true, headers:[], rows:[] }; }
  var all  = sheet.getDataRange().getValues();
  var hdrs = [];
  for (var h = 0; h < all[0].length; h++) { hdrs.push(String(all[0][h])); }
  var rows = [];
  for (var i = 1; i < all.length; i++) {
    if (sessionId && String(all[i][1]) !== sessionId) { continue; }
    var row = [];
    for (var j = 0; j < all[i].length; j++) {
      var cell = all[i][j];
      row.push((cell instanceof Date) ? cell.toLocaleString('it-IT') : String(cell));
    }
    rows.push(row);
  }
  return { ok:true, headers:hdrs, rows:rows };
}
