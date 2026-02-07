# Google Apps Script Setup Guide

## ⚠️ IMPORTANT: Web App Deployment Settings

Your Google Apps Script must be deployed with these **exact settings**:

### 1. Deploy as Web App
1. Open your Google Apps Script project
2. Click **Deploy** → **New Deployment**
3. Click **Select Type** → Choose **Web App**

### 2. Configure Settings
Set these deployment configurations:

```
Execute as: Me (your email)
Who has access: Anyone
```

**CRITICAL**: Must be "Anyone" - not "Anyone with the link"

### 3. Deploy
1. Click **Deploy**
2. **Copy the Web App URL** (should end with `/exec`)
3. Click **Authorize** and grant permissions

---

## ✅ Your Script Must Have doPost Function

Your Google Apps Script needs this structure:

```javascript
function doPost(e) {
  try {
    // Parse incoming data
    const data = e.parameter; // For form data
    // OR
    // const data = JSON.parse(e.postData.contents); // For JSON
    
    const name = data.name;
    const rollNo = data.rollNo;
    const year = data.year;
    const branch = data.branch;
    const college = data.college;
    const roomNo = data.roomNo;
    const phone = data.phone;
    const parentPhone = data.parentPhone;
    const totalFees = data.totalFees;
    const feesPaid = data.feesPaid;
    const proofLink = data.proofLink;
    const email = data.email;
    
    // Your logic to save to Google Sheets
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('1st Year');
    sheet.appendRow([name, rollNo, year, branch, college, roomNo, phone, parentPhone, totalFees, feesPaid, proofLink, email]);
    
    // Send emails (optional)
    // MailApp.sendEmail(...)
    
    // Return success
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Student added successfully' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

## 🔍 Testing Checklist

- [ ] Web App deployed as "Execute as: Me"
- [ ] Access set to "Anyone"
- [ ] Web App URL copied and used in frontend
- [ ] `doPost` function exists in script
- [ ] Script has access to the Google Sheet
- [ ] Browser console open (F12) to see logs
- [ ] Try submitting the form

---

## 🐛 Common Issues

### Issue: CORS Error
**Fix**: Make sure deployment is set to "Anyone" (not "Anyone with the link")

### Issue: "Not Found" or 404
**Fix**: Re-deploy the Web App and use the NEW URL

### Issue: Parse Error
**Fix**: Make sure your doPost returns proper JSON with ContentService

### Issue: Permission Denied
**Fix**: Re-authorize the script in Deployments → Manage Deployments → Edit → Save

---

## 📝 Current Configuration

Web App URL: `https://script.google.com/macros/s/AKfycbz32D1HjDUqb1z0IWJjBNWaByEi8IPyYPdTYM1NR02pY6hGbBU_DBgJPjdKGq0RDwBu/exec`

Frontend sends: **URLSearchParams** (form-encoded data)
Expected response: **JSON** with `{ success: true/false, error: "..." }`
