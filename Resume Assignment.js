// Global variable to track the last assigned recruiter for round-robin assignment
let lastAssignedRecruiterIndex = -1;

// Define sourceFolders at the global level
const sourceFolders = {
  'Naukri': '1BT5-viqek49mOxmcNmyPjcXZHpHATwEv', 
  'Expertia': '10vbeQMVt12N8ay2cBW_63gokctmmBKFh',
  'Instahyre': '1AQ1E50K4WUT7Db944ZPro3wQYmSWZg0b',
  'Employee Referral': '1VgoXrwDdWAUdejhdCGTpwgrG6W9qwJFY'
};

function distributeResume() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const assignmentSheet = ss.getSheetByName('Assignment');
  const masterSheet = ss.getSheetByName('Master Sheet');

  clearCountsAndWarnings(assignmentSheet);

  const recruitersRange = assignmentSheet.getRange('A3:C' + assignmentSheet.getLastRow());
  const recruiters = recruitersRange.getValues();
  const dateOfAssignment = assignmentSheet.getRange('A1').getDisplayValue();
  
  const sourceFoldersInfo = getSourceFoldersInfo();

  let masterSheetData = [];
  let totalResumesAssigned = 0;

  recruiters.forEach((recruiter, index) => {
    const recruiterEmail = recruiter[0];
    const isPresent = recruiter[1] === 'Present';
    let resumesToAssignCount = recruiter[2];
    
    if (isPresent && resumesToAssignCount > 0) {
      const availableResumesCount = getTotalUnassignedResumes(sourceFoldersInfo);
      if (availableResumesCount < resumesToAssignCount) {
        resumesToAssignCount = availableResumesCount;
      }

      const assignments = assignResumesToRecruiter(recruiterEmail, resumesToAssignCount, dateOfAssignment, sourceFoldersInfo);
      masterSheetData = masterSheetData.concat(assignments);
      totalResumesAssigned += resumesToAssignCount;
    }
  });

  let employeeReferralAssignments = assignEmployeeReferrals(sourceFoldersInfo, recruiters, dateOfAssignment);
  masterSheetData = masterSheetData.concat(employeeReferralAssignments);

  if (masterSheetData.length > 0) {
    const startRow = masterSheet.getLastRow() + 1;
    const numberOfColumns = masterSheetData[0].length;
    masterSheet.getRange(startRow, 1, masterSheetData.length, numberOfColumns).setValues(masterSheetData);
  }

  updateCountsAndCheckWarnings(assignmentSheet, sourceFoldersInfo);
  clearS();
}

function getTotalUnassignedResumes(sourceFoldersInfo) {
  let total = 0;
  for (const source in sourceFoldersInfo) {
    if (source !== 'Employee Referral') {
      total += sourceFoldersInfo[source].length;
    }
  }
  return total;
}

function assignResumesToRecruiter(email, count, dateOfAssignment, sourceFoldersInfo) {
  const drive = DriveApp;
  let assignments = [];
  let sources = Object.keys(sourceFoldersInfo);
  
  sources.sort((a, b) => {
    const priorities = {'Naukri': 1, 'Expertia': 2, 'Instahyre': 3};
    return priorities[a] - priorities[b];
  });
  
  while (assignments.length < count) {
    for (const source of sources) {
      if (assignments.length >= count) break;
      
      if (sourceFoldersInfo[source].length > 0) {
        let fileInfo = sourceFoldersInfo[source].shift();
        let assignedFolderId = getAssignedFolderIdForSource(source);
        let assignedFolder = drive.getFolderById(assignedFolderId);
        let newFile = fileInfo.file.makeCopy(fileInfo.name, assignedFolder);
        fileInfo.file.setTrashed(true);
        
        assignments.push([
          dateOfAssignment,
          source,
          email,
          '',
          '',
          '',
          newFile.getUrl()
        ]);
      }
    }
  }

  return assignments;
}

function assignEmployeeReferrals(sourceFoldersInfo, recruiters, dateOfAssignment) {
  if (!sourceFoldersInfo['Employee Referral'] || sourceFoldersInfo['Employee Referral'].length === 0) {
    return [];
  }

  let assignments = [];
  let employeeReferralFiles = sourceFoldersInfo['Employee Referral'];

  while (employeeReferralFiles.length > 0) {
    const recruiterIndex = (lastAssignedRecruiterIndex + 1) % recruiters.length;
    lastAssignedRecruiterIndex = recruiterIndex;

    const recruiter = recruiters[recruiterIndex];
    const recruiterEmail = recruiter[0];
    const isPresent = recruiter[1] === 'Present';

    if (!isPresent) {
      continue;
    }

    let fileInfo = employeeReferralFiles.shift();
    let assignedFolderId = getAssignedFolderIdForSource('Employee Referral');
    let assignedFolder = DriveApp.getFolderById(assignedFolderId);
    let newFile = fileInfo.file.makeCopy(fileInfo.name, assignedFolder);
    fileInfo.file.setTrashed(true);

    assignments.push([
      dateOfAssignment,
      'Employee Referral',
      recruiterEmail,
      '',
      '',
      '',
      newFile.getUrl()
    ]);
  }

  return assignments;
}

function getAssignedFolderIdForSource(source) {
  const assignedSubfolders = {
    'Naukri': '1XqMgMZ4MnUNpMLTUZXcu6OMv5CJXScwo',
    'Expertia': '1yC-Er25UGCfqbiRsQgs4YpyE_7AWRTqp',
    'Instahyre': '1VF6d6HyLmyb91g1EUuGbdjLL5H9IIPCs',
    'Employee Referral': '1Zo0QMHTt74gctGmFD6S6GaGe7DMhRgYO'
  };
  return assignedSubfolders[source];
}

function clearS() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Assignment");
  var range = sheet.getRange("C3:C8");
  range.clearContent();
}

function getSourceFoldersInfo() {
  const drive = DriveApp;
  let sourceFoldersInfo = {};

  for (const source in sourceFolders) {
    let folder = drive.getFolderById(sourceFolders[source]);
    let files = folder.getFiles();
    let fileInfoList = [];

    while (files.hasNext()) {
      let file = files.next();
      fileInfoList.push({
        name: file.getName(),
        file: file
      });
    }

    sourceFoldersInfo[source] = fileInfoList;
  }

  return sourceFoldersInfo;
}

function clearCountsAndWarnings(sheet) {
  // Assuming counts are in column F and warnings in column G
  const countsRange = sheet.getRange('F2:F4' + sheet.getLastRow());
  const warningsRange = sheet.getRange('G2:G4' + sheet.getLastRow());

  countsRange.clearContent(); // Clears the content in counts column
  warningsRange.clearContent(); // Clears the content in warnings column
}

function updateCountsAndCheckWarnings(sheet, sourceFoldersInfo) {
  const sourcesRange = sheet.getRange('E2:E4' + sheet.getLastRow()); // Start from row 2 now
  const sources = sourcesRange.getValues();

  // Clear all previous warnings before setting new ones
  const warningsRange = sheet.getRange('G2:G4' + sheet.getLastRow()); // Adjusted to start from row 2
  warningsRange.clearContent();
  warningsRange.clearNote();

  sources.forEach((sourceRow, index) => {
    let sourceName = sourceRow[0];
    if (sourceName) {
      const count = sourceFoldersInfo[sourceName] ? sourceFoldersInfo[sourceName].length : 0;
      const countCell = sheet.getRange(2 + index, 6); // Adjusted to start from F2
      const warningCell = sheet.getRange(2 + index, 7); // Adjusted to start from G2

      // Update count in column F
      countCell.setValue(count);

      // If the count is below the warning threshold, add a warning
      if (count < 10) {
        const warningMessage = `Warning: Only ${count} resumes left in ${sourceName}. Please add more resumes.`;
        warningCell.setValue(warningMessage);
        warningCell.setFontColor("red");
      } else {
        // If the count is above the threshold, ensure no warnings
        warningCell.setFontColor("black");
      }
    }
  });
}
