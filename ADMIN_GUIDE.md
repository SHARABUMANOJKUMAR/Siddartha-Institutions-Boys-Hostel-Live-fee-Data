# Hostel Management Dashboard - Admin Panel Guide

## 🔐 Admin Access

**Default Password:** `admin123`

> ⚠️ **IMPORTANT**: Change this password before deploying to production!
> 
> To change the password, edit line 4 in `admin.js`:
> ```javascript
> const ADMIN_PASSWORD = 'your-new-password-here';
> ```

## 📋 Features

### 1. Authentication
- Click the **"🔐 Admin"** button in the header
- Enter the admin password
- Access the admin panel upon successful login

### 2. Manage Students Tab
- View all students in a comprehensive table
- **Edit** any student record by clicking the "✏️ Edit" button
- **Delete** students with confirmation dialog
- See real-time updates to the dashboard

### 3. Add Student Tab
- Complete form to add new student records
- Required fields: Name, Year, Total Fees, Fees Paid
- Balance is auto-calculated
- Form validation ensures data integrity

### 4. Export Data Tab
Three export options available:
- **📄 CSV Export**: Download as CSV file (Excel compatible)
- **📊 Excel Export**: Download as native .xlsx file
- **🖨️ Print View**: Generate printer-friendly report

All exports respect the current year filter!

## 💾 Data Persistence

### Local Storage
- All admin changes are saved to browser localStorage
- Data persists across page refreshes
- Changes are live but LOCAL to your browser

### Syncing with Google Sheets
> **Note**: Currently, changes are stored locally only. To sync with Google Sheets:
> 
> 1. Export data using CSV/Excel export
> 2. Manually update your Google Sheets
> 3. Refresh the dashboard to see live sheet data

## 🎯 Workflow Example

### Adding a New Student
1. Click "Admin" → Login
2. Go to "➕ Add Student" tab
3. Fill in student details
4. Click "Add Student"
5. Student appears in dashboard immediately

### Editing a Student
1. Go to "👥 Manage Students" tab
2. Find the student in the table
3. Click "✏️ Edit"
4. Update information in the modal
5. Click "Save Changes"

### Exporting Reports
1. (Optional) Filter by year using the year dropdown
2. Click "Admin" → "📥 Export Data"
3. Choose your export format
4. File downloads automatically

## 🔄 How Year Filter Works

When you select a year from the main dashboard:
- **KPIs** update to show that year's statistics
- **Charts** display only that year's data
- **Table** filters to that year's students
- **Exports** will only include the filtered year

Select "All Years" to see complete data.

## ⚡ Quick Tips

1. **Logout**: Click "Logout" in the admin panel to secure access
2. **Live Updates**: All changes reflect immediately in the dashboard
3. **Mobile Friendly**: Admin panel adapts to mobile screens
4. **Data Safety**: Use delete confirmation carefully - it cannot be undone
5. **Export Regularly**: Create backups by exporting data frequently

## 🛡️ Security Notes

### Current Implementation
- Simple password-based authentication
- Data stored in browser localStorage
- No server-side validation

### For Production Use
Consider implementing:
- **Secure Authentication**: OAuth, JWT, or session-based auth
- **Backend API**: Node.js + database for persistent storage
- **Role-Based Access**: Different permission levels
- **Encryption**: Hash passwords, encrypt sensitive data
- **Audit Log**: Track who made which changes

## 📞 Support

For issues or questions:
- Check browser console for error messages
- Ensure JavaScript is enabled
- Clear browser cache if data seems stuck
- Test in an incognito window to rule out localStorage issues

## 🎨 Customization

### Changing Colors
Edit `style.css` admin panel variables (lines 700+)

### Adding New Fields
1. Update HTML form in ` index.html`
2. Update admin table headers
3. Modify `admin.js` add/edit functions

### Different Password Requirements
Modify the authentication logic in `admin.js`

---

**Version**: 1.0  
**Last Updated**: February 2026
