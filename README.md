# Resume_Tracking

A system created for a small scale recruitment team to assign and track resumes.

Tools Used:
1. Google Sheets to manage the resumes and as frontend to utilize the resumes assigned to the Recruitment Team.
2. Google Drive as database to store the resumes. (can use S3 or Blob)
3. Google Appscript to automate the process.

Since we are working in Google Workspace, create a service account for the google drive api.

The resumes are assigned on a round robin basis to all the members in the recruitment team based on their pressence. 
* To keep the master sheet clean, the resumes that are not selected or get disqualified in any of the interview rounds are automatically moved to a different tab "Rejected" in Google sheets every midnight.
* The resumes which the recruitment team is not able to connect with are moved to a different tab "Drop Cases" so that those resumes can be rechurned in future.

To keep the system fast and optimised, at a single time only 10 resumes are assigned to each recruiter.
Their is a custom resume parsing tool also to parse the resumes.
* Basic information like name, phone number and email address are parsed.

The Assignment portal also gets updated with the number of resumes left in each recruiters bucket and also in the database automatically.

How it works?
* The team first marks which recruiter needs resume and how many (between 1-10)
* Then the resumes from the google drive main folder are moved to the assigned folder (this steps helps in avoiding re-assignment of same resume to the team)
* The link to the particullar resume is then marked in "Master Sheet" against every recruiter.

Known Flaws:
* The person who uploads the resumes to the google drive can only assign the resumes to the team.
* In case of failure, reupload all the resumes to the drive.

Use Case for the System:
* Track the progress by the recruitment team.
* Track source wise hiring quality and conversion.
* Save time from manually assigning resumes over mail or google sheet.
* Clean reporting system.
