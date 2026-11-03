/** THTTEX Showroom – Google Sheets-backed item catalog & editable price API.
 * Replace existing Apps Script code and deploy a NEW VERSION of the web app.
 * Keeps the existing updatePrice API contract, adds full item catalog in GET.
 */
const SHEET_ID = '1lSTvAWcYywBv4u4U4302Viw7u5zKuxZtg4IhyPkTZ5Q';
const SHEET_NAME = 'Sheet1';
const REQUIRED = ['item_id', 'unit_price_idr', 'last_updated_by', 'last_updated_at'];

function sheet_() {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet not found: ' + SHEET_NAME);
  return sh;
}
function data_() {
  const values = sheet_().getDataRange().getValues();
  const headers = (values[0] || []).map(String);
  REQUIRED.forEach(h => { if (headers.indexOf(h) < 0) throw new Error('Missing column: ' + h); });
  return { headers, values };
}
function doGet() {
  try {
    const { headers, values } = data_();
    const items = [], prices = {}, meta = {};
    for (let r = 1; r < values.length; r++) {
      const row = values[r], item = {};
      headers.forEach((h,c) => { if (h) item[h] = row[c] instanceof Date ? row[c].toISOString() : row[c]; });
      const id = String(item.item_id || '').trim();
      if (!id) continue;
      item.item_id = id;
      items.push(item);
      // An empty cell is missing; zero is an intentional editable price.
      prices[id] = item.unit_price_idr === '' ? '' : item.unit_price_idr;
      meta[id] = { updated_by: item.last_updated_by || '', updated_at: item.last_updated_at || '' };
    }
    return out_({ ok: true, items, prices, meta });
  } catch (err) {
    return out_({ ok: false, error: String(err.message || err) });
  }
}
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const body = JSON.parse(e && e.postData && e.postData.contents || '{}');
    if (body.action !== 'updatePrice') return out_({ ok: false, error: 'unsupported_action' });
    const id = String(body.item_id || '').trim();
    if (!id) return out_({ ok: false, error: 'missing_item_id' });
    const blank = body.unit_price_idr === '' || body.unit_price_idr == null;
    const price = blank ? '' : Number(body.unit_price_idr);
    if (!blank && (!Number.isFinite(price) || price < 0)) return out_({ ok: false, error: 'invalid_price' });
    lock.waitLock(20000);
    const sh = sheet_(), {headers,values} = data_();
    const idCol=headers.indexOf('item_id'), pCol=headers.indexOf('unit_price_idr'), byCol=headers.indexOf('last_updated_by'), atCol=headers.indexOf('last_updated_at');
    for(let r=1;r<values.length;r++) {
      if(String(values[r][idCol]).trim() !== id) continue;
      const by=String(body.updated_by||'').trim().slice(0,120);
      sh.getRange(r+1,pCol+1).setValue(price);
      sh.getRange(r+1,byCol+1).setValue(by);
      sh.getRange(r+1,atCol+1).setValue(new Date());
      SpreadsheetApp.flush();
      return out_({ ok: true, item_id:id, unit_price_idr:price });
    }
    return out_({ ok:false,error:'item_not_found',item_id:id });
  } catch(err) {
    return out_({ ok:false,error:String(err.message||err) });
  } finally {
    try { lock.releaseLock(); } catch(e) {}
  }
}
function out_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
