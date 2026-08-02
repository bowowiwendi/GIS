// ID Spreadsheet
var ssId = '1riqVNsmz_tOB9uyZFI1GmT4qV96ZMyJowHyYKnJ44HA';
var SHEET_NAME = 'Data_Bangunan';
var COLUMNS = ['ID', 'Timestamp', 'No_Bangunan', 'Luas_m2', 'Nama_Penghuni', 'Alamat', 'RT_RW', 'Jenis_Bangunan', 'Jumlah_Keluarga', 'Koordinat_JSON'];

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

// Migrasi otomatis: menambahkan kolom ID untuk data lama agar bisa diedit/dihapus
function ensureStructure_() {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) {
    sheet.appendRow(COLUMNS);
    return;
  }
  if (values[0][0] === 'ID') return;
  var headers = ['ID'].concat(values[0]);
  var rows = [headers];
  for (var i = 1; i < values.length; i++) {
    rows.push([Utilities.getUuid().slice(0, 8)].concat(values[i]));
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
      rtRw: r[6] || '',
      jenis: r[7] || '',
      jumlahKeluarga: r[8] || '',
      koordinat: r[9] || ''
    });
  }
  return result;
}

function saveData(data) {
  if (!data.noBangunan || !data.nama || !data.alamat || !data.rtRw || !data.jenis || !data.jumlahKeluarga || !data.koordinat) {
    throw new Error('Lengkapi semua field dan gambar poligon bangunan terlebih dahulu!');
  }
  var sheet = getSheet_();
  ensureStructure_();
  sheet.appendRow([
    Utilities.getUuid().slice(0, 8),
    new Date(),
    data.noBangunan,
    data.luas,
    data.nama,
    data.alamat,
    data.rtRw,
    data.jenis,
    data.jumlahKeluarga,
    data.koordinat
  ]);
  return 'Data berhasil disimpan!';
}

function updateData(id, data) {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      var row = i + 1;
      sheet.getRange(row, 1, 1, COLUMNS.length).setValues([[
        id,
        values[i][1] || new Date(),
        data.noBangunan,
        data.luas,
        data.nama,
        data.alamat,
        data.rtRw,
        data.jenis,
        data.jumlahKeluarga,
        data.koordinat
      ]]);
      return 'Data berhasil diperbarui!';
    }
  }
  throw new Error('Data tidak ditemukan!');
}

function deleteData(id) {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return 'Data berhasil dihapus!';
    }
  }
  throw new Error('Data tidak ditemukan!');
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
    totalKeluarga += parseInt(d.jumlahKeluarga, 10) || 0;
    var jenis = d.jenis || 'Lainnya';
    var rt = d.rtRw || '-';
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
