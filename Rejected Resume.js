function moveRejectedRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var masterSheet = ss.getSheetByName("Master Sheet");
  var rejectedSheet = ss.getSheetByName("Rejected");

  var masterData = masterSheet.getDataRange().getValues();
  var rejectedRows = [];
  var rowsToDelete = [];

  for (var i = 1; i < masterData.length; i++) {
    var row = masterData[i];
    var h = row[7]; // Column H
    var iCol = row[8]; // Column I
    var j = row[9]; // Column J
    var k = row[10]; // Column K

    // Check specific conditions for rejection
    if (h === 'Not Cleared' || j === 'Not Cleared' || k === 'Not Cleared') {
      rejectedRows.push(row);
      rowsToDelete.push(i + 1); // +1 to account for zero-index in arrays
    }
  }

  // Append rejected rows to Rejected Sheet and remove them from Master Sheet
  if (rejectedRows.length > 0) {
    var firstEmptyRow = rejectedSheet.getLastRow() + 1;
    rejectedSheet.getRange(firstEmptyRow, 1, rejectedRows.length, rejectedRows[0].length).setValues(rejectedRows);

    // Delete rows in reverse order to avoid index shifting issues
    for (var j = rowsToDelete.length - 1; j >= 0; j--) {
      masterSheet.deleteRow(rowsToDelete[j]);
    }
  }
}
