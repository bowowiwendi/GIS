// ID Spreadsheet
var ssId = '1riqVNsmz_tOB9uyZFI1GmT4qV96ZMyJowHyYKnJ44HA';
var SHEET_NAME = 'Data_Bangunan';
var COLUMNS = ['ID', 'Timestamp', 'No_Bangunan', 'Luas_m2', 'Nama_Penghuni', 'Alamat', 'RT', 'RW', 'Jenis_Bangunan', 'Nama_Keluarga', 'Koordinat_JSON'];

function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('GIS Desa - Pemetaan Bangunan')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(ssId);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLUMNS);
  }
  return sheet;
}

// Migrasi otomatis: menambahkan kolom ID, memisahkan RT dan RW, mengganti Jumlah_Keluarga -> Nama_Keluarga
function ensureStructure_() {
  var sheet = getSheet_();
  var head = sheet.getRange(1, 1, 1, COLUMNS.length).getValues()[0] || [];
  if (String(head[0] || '').trim() === 'ID' && head.indexOf('RT') > -1 && head.indexOf('RW') > -1) return;
  var values = sheet.getDataRange().getValues();
  var col = {};
  values[0].forEach(function (h, i) { col[String(h || '').trim()] = i; });
  var rows = [COLUMNS];
  for (var i = 1; i < values.length; i++) {
    var get = function (name) { return col[name] !== undefined ? values[i][col[name]] : ''; };
    var rtRw = String(get('RT_RW') || '').split('/');
    rows.push([
      get('ID') || Utilities.getUuid().slice(0, 8),
      get('Timestamp'),
      get('No_Bangunan'),
      get('Luas_m2'),
      get('Nama_Penghuni'),
      get('Alamat'),
      rtRw[0] || '',
      rtRw[1] || '',
      get('Jenis_Bangunan'),
      get('Jumlah_Keluarga'),
      get('Koordinat_JSON')
    ]);
  }
  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
}

function getData() {
  ensureStructure_();
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var r = values[i];
    result.push({
      id: r[0],
      timestamp: r[1] ? r[1].toString() : '',
      noBangunan: r[2],
      luas: r[3],
      nama: r[4],
      alamat: r[5],
      rt: String(r[6] || ''),
      rw: String(r[7] || ''),
      jenis: r[8] || '',
      keluarga: String(r[9] || ''),
      koordinat: r[10] || ''
    });
  }
  return result;
}

function saveData(data) {
  if (!data.noBangunan || !data.nama || !data.alamat || !data.rt || !data.rw || !data.jenis || !data.koordinat) {
    throw new Error('Lengkapi semua field dan gambar poligon bangunan terlebih dahulu!');
  }
  var sheet = getSheet_();
  sheet.appendRow([
    Utilities.getUuid().slice(0, 8),
    new Date(),
    data.noBangunan,
    data.luas,
    data.nama,
    data.alamat,
    data.rt,
    data.rw,
    data.jenis,
    data.keluarga,
    data.koordinat
  ]);
  return 'Data berhasil disimpan!';
}

function updateData(id, data) {
  var sheet = getSheet_();
  var ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 0), 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      var row = i + 2;
      var old = sheet.getRange(row, 1, 1, COLUMNS.length).getValues()[0];
      sheet.getRange(row, 1, 1, COLUMNS.length).setValues([[
        id,
        old[1] || new Date(),
        data.noBangunan,
        data.luas,
        data.nama,
        data.alamat,
        data.rt,
        data.rw,
        data.jenis,
        data.keluarga,
        data.koordinat
      ]]);
      return 'Data berhasil diperbarui!';
    }
  }
  throw new Error('Data tidak ditemukan!');
}

function deleteData(id) {
  var sheet = getSheet_();
  var ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 0), 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) {
      sheet.deleteRow(i + 2);
      return 'Data berhasil dihapus!';
    }
  }
  throw new Error('Data tidak ditemukan!');
}

// Menghitung jumlah keluarga: mendukung data lama (angka) dan baru (nama dipisah baris)
function countKeluarga_(v) {
  var s = String(v || '').trim();
  if (!s) return 0;
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  return s.split(/[\n;]/).map(function (x) { return x.trim(); }).filter(function (x) { return x; }).length;
}

function getStats() {
  var data = getData();
  var perJenis = {};
  var perRt = {};
  var totalLuas = 0;
  var totalKeluarga = 0;
  data.forEach(function (d) {
    var luas = parseFloat(d.luas) || 0;
    totalLuas += luas;
    totalKeluarga += Math.max(countKeluarga_(d.keluarga), 1);
    var jenis = d.jenis || 'Lainnya';
    var rt = d.rt ? 'RT ' + d.rt : '-';
    perJenis[jenis] = (perJenis[jenis] || 0) + 1;
    perRt[rt] = (perRt[rt] || 0) + 1;
  });
  return {
    jumlah: data.length,
    totalLuas: totalLuas.toFixed(2),
    avgLuas: data.length ? (totalLuas / data.length).toFixed(2) : 0,
    totalKeluarga: totalKeluarga,
    perJenis: perJenis,
    perRt: perRt
  };
}
