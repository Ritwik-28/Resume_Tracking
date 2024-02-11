function processResumesAPI(resumeColumnIndex, emailColumnIndex, sheet) {
  var data = sheet.getDataRange().getValues();

  data.forEach(function (row, rowIndex) {
    if (rowIndex === 0) return; // Skip header row
    var fileUrl = row[resumeColumnIndex - 1]; // Get the file URL or ID
    var fileId = extractFileIdFromUrl(fileUrl);

    if (fileId) {
      try {
        var mimeType = DriveApp.getFileById(fileId).getMimeType();
        var email;
        
        if (mimeType === MimeType.GOOGLE_DOCS) {
          email = extractEmailFromGoogleDoc(fileId);
        } else if (mimeType === MimeType.PDF) {
          email = extractEmailFromPDF(fileId);
        } else {
          // Handle other file types or log unsupported type
          email = null;
        }

        sheet.getRange(rowIndex + 1, emailColumnIndex, 1, 1).setValue(email);
      } catch (e) {
        Logger.log('Error processing file ID ' + fileId + ': ' + e.message);
        sheet.getRange(rowIndex + 1, emailColumnIndex, 1, 1).setValue('Error: ' + e.message);
      }
    }
  });
}

function extractFileIdFromUrl(urlOrId) {
  var fileIdPattern = /\/d\/([a-zA-Z0-9_-]+)/;
  var match = urlOrId.match(fileIdPattern);
  return match ? match[1] : urlOrId;
}

function extractEmailFromGoogleDoc(fileId) {
  var doc = DocumentApp.openById(fileId);
  var text = doc.getBody().getText();
  return extractEmailFromText(text);
}

function extractEmailFromPDF(fileId) {
  var convertedDoc = convertPdfToDoc(fileId);
  var text = convertedDoc.getBody().getText();
  DriveApp.getFileById(convertedDoc.getId()).setTrashed(true); // Delete the converted Doc
  return extractEmailFromText(text);
}

function convertPdfToDoc(fileId) {
  var blob = DriveApp.getFileById(fileId).getBlob();
  var resource = {
    title: blob.getName(),
    mimeType: MimeType.GOOGLE_DOCS
  };
  var docFile = Drive.Files.insert(resource, blob);
  return DocumentApp.openById(docFile.id);
}

function extractEmailFromText(text) {
  var emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  var emailMatch = text.match(emailRegex);
  return emailMatch ? emailMatch[0] : null;
}
