// ID Spreadsheet
var ssId = '1riqVNsmz_tOB9uyZFI1GmT4qV96ZMyJowHyYKnJ44HA';

function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('GIS Desa - Pemetaan Bangunan')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function saveData(data) {
  var ss = SpreadsheetApp.openById(ssId);
  var sheet = ss.getSheetByName('Data_Bangunan');
  
  if (!sheet) {
    sheet = ss.insertSheet('Data_Bangunan');
    sheet.appendRow(['Timestamp', 'No_Bangunan', 'Luas_m2', 'Nama_Penghuni', 'Alamat', 'Koordinat_JSON']);
  }
  
  sheet.appendRow([
    new Date(),
    data.noBangunan,
    data.luas,
    data.nama,
    data.alamat,
    data.koordinat
  ]);
  
  return "Data berhasil disimpan!";
}
