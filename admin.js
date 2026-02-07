// Admin Panel JavaScript
// Password: admin123 (CHANGE THIS IN PRODUCTION!)

const ADMIN_PASSWORD = 'SIETK@000';
let isAdminLoggedIn = false;

// Toast Notification Helper
function showToast(message, type = 'success') {
    const toast = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Admin Modal Controls
document.getElementById('adminButton').addEventListener('click', () => {
    document.getElementById('adminModal').classList.add('active');
    if (isAdminLoggedIn) {
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        populateAdminTable();
        updateExportCount();
        // Re-initialize filters when opening admin panel
        setTimeout(initializeAdminFilters, 100);
    }
});

document.getElementById('adminClose').addEventListener('click', () => {
    document.getElementById('adminModal').classList.remove('active');
});

// Login Functionality
document.getElementById('loginButton').addEventListener('click', () => {
    const password = document.getElementById('adminPassword').value;
    const errorElement = document.getElementById('loginError');

    if (password === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('adminPassword').value = '';
        errorElement.textContent = '';
        populateAdminTable();
        updateExportCount();
        // Initialize admin filters after login
        setTimeout(initializeAdminFilters, 100);
        showToast('Login successful!');
    } else {
        errorElement.textContent = '❌ Incorrect password';
    }
});

// Allow Enter key for login
document.getElementById('adminPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginButton').click();
    }
});

// Logout Functionality
document.getElementById('logoutButton').addEventListener('click', () => {
    isAdminLoggedIn = false;
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminModal').classList.remove('active');
    showToast('Logged out successfully');
});

// Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to clicked tab and corresponding content
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`tab-${tabId}`).classList.add('active');

        // Refresh data when switching to students tab
        if (tabId === 'students') {
            populateAdminTable();
            // Re-initialize filters to ensure event listeners are attached
            setTimeout(initializeAdminFilters, 100);
        }

        // Reset Add Form mode when switching to Add tab manually
        if (tabId === 'add') {
            const form = document.getElementById('addStudentForm');
            const title = document.getElementById('formTitle');
            const btn = form.querySelector('.primary-button');

            if (form.getAttribute('data-mode') !== 'edit') {
                form.reset();
                if (title) title.textContent = 'Add / Edit Student';
                btn.textContent = 'Add Student';
            }
        }

        // Update export count when switching to export tab
        if (tabId === 'export') {
            updateExportCount();
        }
    });
});

// Populate Admin Table
function populateAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '';

    if (allStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No students found</td></tr>';
        return;
    }

    // Get filter values
    const searchTerm = document.getElementById('adminSearchInput')?.value.toLowerCase() || '';
    const yearFilter = document.getElementById('adminYearFilter')?.value || 'all';

    // Filter students
    const filteredAdminStudents = allStudents.filter(student => {
        // Year filter
        if (yearFilter !== 'all' && student['YEAR'] !== yearFilter) {
            return false;
        }

        // Search filter
        if (searchTerm) {
            const name = (student['NAME'] || '').toLowerCase();
            const rollNo = (student['ROLL NO'] || '').toLowerCase();
            const branch = (student['BRANCH'] || '').toLowerCase();

            if (!name.includes(searchTerm) && !rollNo.includes(searchTerm) && !branch.includes(searchTerm)) {
                return false;
            }
        }

        return true;
    });

    if (filteredAdminStudents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No students match your filters</td></tr>';
        return;
    }

    filteredAdminStudents.forEach((student) => {
        // Find the actual index in allStudents array
        const index = allStudents.indexOf(student);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student['NAME'] || 'N/A'}</td>
            <td>${student['ROLL NO'] || 'N/A'}</td>
            <td>${student['YEAR'] || 'N/A'}</td>
            <td>${student['BRANCH'] || 'N/A'}</td>
            <td>${formatCurrency(student['TOTAL FEES'])}</td>
            <td>${formatCurrency(student['FEES PAID'])}</td>
            <td>${formatCurrency(student['BALANCE'])}</td>
            <td>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editStudent(${index})">✏️ Edit</button>
                    <button class="delete-btn" onclick="deleteStudent(${index})">🗑️ Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Year-wise Google Apps Script Web App Endpoints
const YEAR_ENDPOINTS = {
    "1st": "https://script.google.com/macros/s/AKfycbzy97rXtKtipwleDtnnmOnYea9Cb-9hRUNgCVchzVIoAJv9RhFxMmtqcQYicwdHbafc/exec",
    "2nd": "https://script.google.com/macros/s/AKfycbzsWPLQg5lgmnpTef52h5rCkBqhT67F3OyBioJI6iiZzawV7tAFEmeiI16ms4JbF8QN/exec",
    "3rd": "https://script.google.com/macros/s/AKfycbxLhSVYyRDf1dN44pvZhfgiCgVZuBxF8tCI7mlDbdGJklcTS1JaMcYx4Tr256HeBgzG/exec"
};

// Get endpoint URL for a given year
function getEndpointForYear(year) {
    const normalized = year?.toString().split(' ')[0] || '';
    const endpoint = YEAR_ENDPOINTS[normalized];
    if (!endpoint) {
        console.error(`❌ No endpoint found for year: ${year}`);
        return null;
    }
    return endpoint;
}

// Undo State
let lastDeletedStudent = null;
let deleteTimeout = null;

// Edit State - Track original roll number for EDIT operations
let originalEditRollNo = null;

// UI Helpers
function setSyncStatus(status) {
    const statusDiv = document.getElementById('syncStatus');
    const statusText = statusDiv.querySelector('.status-text');

    statusDiv.classList.remove('syncing', 'error');

    if (status === 'syncing') {
        statusDiv.classList.add('syncing');
        statusText.textContent = 'Syncing...';
    } else if (status === 'live') {
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        statusText.textContent = `Live – ${time}`;
    } else if (status === 'error') {
        statusDiv.classList.add('error');
        statusText.textContent = '⚠️ Sync Error';
    }
}

function showUndoToast(student, onUndo) {
    const toast = document.getElementById('undoToast');
    const undoBtn = document.getElementById('undoButton');


    toast.classList.add('show');

    const cleanup = () => {
        toast.classList.remove('show');
        undoBtn.removeEventListener('click', handleUndo);
    };

    const handleUndo = () => {
        onUndo();
        cleanup();
        clearTimeout(deleteTimeout);
    };

    undoBtn.addEventListener('click', handleUndo);

    deleteTimeout = setTimeout(cleanup, 5000);
}

// Add/Edit Student Form Handler
document.getElementById('addStudentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const isEditMode = e.target.getAttribute('data-mode') === 'edit';
    const yearValue = document.getElementById('year').value; // "1st Year" | "2nd Year" | "3rd Year"

    if (!yearValue) {
        showToast('❌ Please select a year', 'error');
        return;
    }

    // Roll Number is required (primary key)
    const rollNo = document.getElementById('rollNo').value.trim();
    if (!rollNo) {
        showToast('❌ Roll Number is required (primary key)', 'error');
        return;
    }

    // Normalize year for backend: "1st", "2nd", "3rd"
    const normalizedYear = yearValue.split(' ')[0];

    const formData = {
        action: isEditMode ? "EDIT" : "ADD",
        year: normalizedYear,
        name: document.getElementById('name').value,
        rollNo: rollNo,
        // For EDIT: include original roll number to find the row (in case roll number was changed)
        originalRollNo: isEditMode ? (originalEditRollNo || rollNo) : null,
        branch: document.getElementById('branch').value,
        roomNo: document.getElementById('roomNo').value,
        college: document.getElementById('college').value,
        phone: document.getElementById('phone').value,
        parentPhone: document.getElementById('parentPhone').value,
        totalFees: parseFloat(document.getElementById('totalFees').value) || 0,
        feesPaid: parseFloat(document.getElementById('feesPaid').value) || 0,
        email: document.getElementById('email').value,
        proofLink: document.getElementById('proofLink').value
    };

    // Show loading state
    const submitBtn = e.target.querySelector('.primary-button');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = isEditMode ? '⏳ Updating Student...' : '⏳ Adding Student...';
    submitBtn.disabled = true;

    try {
        setSyncStatus('syncing');

        // Get year-specific endpoint
        const endpoint = getEndpointForYear(normalizedYear);
        if (!endpoint) {
            showToast('❌ Invalid year selected. Cannot sync.', 'error');
            setSyncStatus('error');
            return;
        }

        console.log(`📤 [Hostel Dashboard] Sending ${formData.action} to ${normalizedYear} Year endpoint:`, formData);

        const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8' // Using text/plain to avoid CORS issues with GAS
            }
        });

        const resultText = await response.text();
        console.log('📥 [Hostel Dashboard] Server response:', resultText);

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            // If response is not JSON, assume success if status is OK
            result = { success: response.ok };
        }

        if (result.status === "SUCCESS") {
            showToast(`✅ Student ${isEditMode ? 'updated' : 'added'} successfully!`);
            e.target.reset();
            e.target.removeAttribute('data-mode');
            originalEditRollNo = null; // Clear edit state
            submitBtn.textContent = 'Add Student';

            // Critical: Refresh data from Sheets immediately
            if (typeof fetchAllData === 'function') {
                console.log('🔄 Re-fetching live data after successful update...');
                await fetchAllData();
            }

            setSyncStatus('live');
            // Switch back to students tab
            const studentsTabBtn = document.querySelector('.tab-button[data-tab="students"]');
            if (studentsTabBtn) studentsTabBtn.click();
        } else {
            setSyncStatus('error');
            throw new Error(result.message || 'Server responded with failure');
        }

    } catch (err) {
        setSyncStatus('error');
        console.error('❌ [Hostel Dashboard] Error:', err);
        showToast(`❌ Error: ${err.message || 'Connection failed'}`, 'error');
    } finally {
        submitBtn.textContent = isEditMode ? 'Update Student' : 'Add Student';
        submitBtn.disabled = false;
    }
});

// Auto-calculate balance in add form
document.getElementById('totalFees').addEventListener('input', updateAddFormBalance);
document.getElementById('feesPaid').addEventListener('input', updateAddFormBalance);

function updateAddFormBalance() {
    const totalFees = parseFloat(document.getElementById('totalFees').value) || 0;
    const feesPaid = parseFloat(document.getElementById('feesPaid').value) || 0;
    document.getElementById('balance').value = totalFees - feesPaid;
}

// Edit Student - Fill form and set mode
window.editStudent = function (index) {
    const student = allStudents[index];
    if (!student) return;

    // Switch to Add Student tab but in "Edit Mode"
    const addTabBtn = document.querySelector('.tab-button[data-tab="add"]');
    if (addTabBtn) addTabBtn.click();

    const form = document.getElementById('addStudentForm');
    form.setAttribute('data-mode', 'edit');
    const title = document.getElementById('formTitle');
    if (title) title.textContent = '✏️ Edit Student';
    const submitBtn = form.querySelector('.primary-button');
    submitBtn.textContent = 'Update Student';

    // Store original roll number for lookup (primary key)
    originalEditRollNo = student['ROLL NO'] || '';
    console.log(`📝 Editing student with original Roll No: ${originalEditRollNo}`);

    // Fill fields
    document.getElementById('name').value = student['NAME'] || '';
    document.getElementById('rollNo').value = student['ROLL NO'] || '';

    // Normalize year for dropdown: "1st" -> "1st Year"
    const yearSuffix = student['YEAR'] && student['YEAR'].includes('Year') ? '' : ' Year';
    document.getElementById('year').value = (student['YEAR'] || '') + yearSuffix;

    document.getElementById('branch').value = student['BRANCH'] || '';
    document.getElementById('roomNo').value = student['ROOM NO'] || '';
    document.getElementById('college').value = student['COLLEGE'] || '';
    document.getElementById('phone').value = student['PHONE'] || '';
    document.getElementById('parentPhone').value = student['PARENT PHONE'] || '';
    document.getElementById('totalFees').value = student['TOTAL FEES'] || 0;
    document.getElementById('feesPaid').value = student['FEES PAID'] || 0;
    document.getElementById('balance').value = (parseFloat(student['TOTAL FEES']) || 0) - (parseFloat(student['FEES PAID']) || 0);
    document.getElementById('email').value = student['EMAIL'] || '';
    document.getElementById('proofLink').value = student['proofs,links'] || '';

    // Scroll to form
    document.getElementById('tab-add').scrollIntoView({ behavior: 'smooth' });
}

// Delete Student - Sync with Sheets
window.deleteStudent = async function (index) {
    const student = allStudents[index];
    if (!student) return;

    const confirmDelete = confirm(`🗑️ Are you sure you want to delete ${student['NAME']}?\n\nThis action will permanently remove the student from Google Sheets.`);

    if (confirmDelete) {
        setSyncStatus('syncing');
        const normalizedYear = (student['YEAR'] || '').split(' ')[0];
        const payload = {
            action: "DELETE",
            year: normalizedYear,
            rollNo: student['ROLL NO']
        };

        try {
            // Get year-specific endpoint
            const endpoint = getEndpointForYear(normalizedYear);
            if (!endpoint) {
                showToast('❌ Cannot delete: Invalid year data', 'error');
                setSyncStatus('error');
                return;
            }

            console.log(`📤 [Hostel Dashboard] Sending DELETE to ${normalizedYear} Year endpoint:`, payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                }
            });

            const resultText = await response.text();
            console.log('📥 [Hostel Dashboard] DELETE response:', resultText);

            let result;
            try {
                result = JSON.parse(resultText);
            } catch (e) {
                result = { status: response.ok ? "SUCCESS" : "ERROR" };
            }

            if (result.status === "SUCCESS") {
                // Show Undo Toast
                showUndoToast(student, async () => {
                    const undoPayload = {
                        action: "ADD",
                        year: normalizedYear,
                        name: student['NAME'],
                        rollNo: student['ROLL NO'],
                        branch: student['BRANCH'],
                        roomNo: student['ROOM NO'],
                        college: student['COLLEGE'],
                        phone: student['PHONE'],
                        parentPhone: student['PARENT PHONE'],
                        totalFees: student['TOTAL FEES'],
                        feesPaid: student['FEES PAID'],
                        email: student['EMAIL'],
                        proofLink: student['proofs,links']
                    };

                    setSyncStatus('syncing');
                    const undoEndpoint = getEndpointForYear(normalizedYear);
                    console.log('🔄 Undoing deletion: Re-adding student...', undoPayload);
                    await fetch(undoEndpoint, {
                        method: 'POST',
                        body: JSON.stringify(undoPayload),
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' }
                    });
                    await fetchAllData();
                    setSyncStatus('live');
                    showToast('♻️ Student restored successfully!');
                });

                // Refresh from Sheets
                if (typeof fetchAllData === 'function') {
                    console.log('🔄 Re-fetching live data after deletion...');
                    await fetchAllData();
                }
                setSyncStatus('live');
            } else {
                setSyncStatus('error');
                showToast(`❌ Error: ${result.message || 'Failed to delete student'}`, 'error');
            }
        } catch (err) {
            setSyncStatus('error');
            console.error('❌ [Hostel Dashboard] Delete Error:', err);
            showToast('❌ Connection error during deletion', 'error');
        }
    }
}

// Local Storage Functions - STUDENT PERSISTENCE REMOVED (Source of Truth is Sheets)
function saveToLocalStorage() {
    // Only save metadata if needed, student data is NO LONGER stored locally to ensure live sync
    try {
        localStorage.setItem('lastModified', new Date().toISOString());
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    // Student data is fetched live from Sheets on load
    console.log('ℹ️ [Hostel Dashboard] Live mode: Fetching data from Google Sheets source...');
}


// Export Functions
function updateExportCount() {
    const count = getFilteredStudents().length;
    document.getElementById('exportCount').textContent = count;
}

// CSV Export
document.getElementById('exportCSV').addEventListener('click', () => {
    const students = getFilteredStudents();

    if (students.length === 0) {
        showToast('⚠️ No data to export', 'error');
        return;
    }

    // CSV Headers
    const headers = ['NAME', 'ROLL NO', 'YEAR', 'BRANCH', 'ROOM NO', 'PHONE NUMBER', 'TOTAL FEES', 'FEES PAID', 'BALANCE'];
    let csv = headers.join(',') + '\n';

    // CSV Rows
    students.forEach(student => {
        const row = headers.map(header => {
            let value = student[header] || '';
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                value = `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csv += row.join(',') + '\n';
    });

    // Download
    downloadFile(csv, 'hostel-students.csv', 'text/csv');
    showToast('✅ CSV exported successfully!');
});

// Excel Export
document.getElementById('exportExcel').addEventListener('click', () => {
    const students = getFilteredStudents();

    if (students.length === 0) {
        showToast('⚠️ No data to export', 'error');
        return;
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(students);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Students");

    // Download
    XLSX.writeFile(wb, "hostel-students.xlsx");
    showToast('✅ Excel file exported successfully!');
});

// Print Data
document.getElementById('printData').addEventListener('click', () => {
    const students = getFilteredStudents();

    if (students.length === 0) {
        showToast('⚠️ No data to print', 'error');
        return;
    }

    // Create print window
    const printWindow = window.open('', '_blank');

    // Build print content
    let printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hostel Students - Print View</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                }
                h1 {
                    text-align: center;
                    color: #333;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #8b5cf6;
                    color: white;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                @media print {
                    body {
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body>
            <h1>Siddarth Institutions Puttur Hostel - Student Records</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Total Students: ${students.length}</p>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>Year</th>
                        <th>Branch</th>
                        <th>Room</th>
                        <th>Total Fees</th>
                        <th>Paid</th>
                        <th>Balance</th>
                    </tr>
                </thead>
                <tbody>
    `;

    students.forEach(student => {
        printContent += `
            <tr>
                <td>${student['NAME'] || 'N/A'}</td>
                <td>${student['ROLL NO'] || 'N/A'}</td>
                <td>${student['YEAR'] || 'N/A'}</td>
                <td>${student['BRANCH'] || 'N/A'}</td>
                <td>${student['ROOM NO'] || 'N/A'}</td>
                <td>₹${student['TOTAL FEES'].toLocaleString('en-IN')}</td>
                <td>₹${student['FEES PAID'].toLocaleString('en-IN')}</td>
                <td>₹${student['BALANCE'].toLocaleString('en-IN')}</td>
            </tr>
        `;
    });

    printContent += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function () {
        printWindow.print();
    };

    showToast('✅ Print dialog opened!');
});

// File Download Helper
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Admin Filter Initialization
function initializeAdminFilters() {
    console.log('🔧 Initializing admin filters...');

    const adminSearchInput = document.getElementById('adminSearchInput');
    const adminYearFilter = document.getElementById('adminYearFilter');

    if (adminSearchInput) {
        adminSearchInput.removeEventListener('input', handleAdminFilterChange);
        adminSearchInput.addEventListener('input', handleAdminFilterChange);
        console.log('✅ Admin search input listener attached');
    }

    if (adminYearFilter) {
        adminYearFilter.removeEventListener('change', handleAdminFilterChange);
        adminYearFilter.addEventListener('change', handleAdminFilterChange);
        console.log('✅ Admin year filter listener attached');
    }
}

function handleAdminFilterChange() {
    console.log('🔍 Filter changed - refreshing table...');
    populateAdminTable();
}

// Global Refresh Function to sync all UI components
window.refreshHostelData = function () {
    console.log('🔄 [Hostel Dashboard] Refreshing all data components...');

    // Core Dashboard components (if defined in script.js)
    if (typeof updateKPIs === 'function') updateKPIs();
    if (typeof updateCharts === 'function') updateCharts();
    if (typeof applyFilters === 'function') applyFilters(); // script.js version
    if (typeof renderTable === 'function') renderTable();   // script.js version

    // Admin components
    if (isAdminLoggedIn) {
        populateAdminTable();
        updateExportCount();
        updateAdminDashboard();
    }

    console.log('✅ [Hostel Dashboard] Data refresh complete!');
};

// ======================================
// ADMIN DASHBOARD FUNCTIONS
// ======================================

let adminCharts = {};
let adminDashboardYearFilter = 'all'; // Track selected year filter

// Get filtered students for admin dashboard
function getAdminFilteredStudents() {
    const students = allStudents || [];
    if (adminDashboardYearFilter === 'all') {
        return students;
    }
    return students.filter(s => s['YEAR'] === adminDashboardYearFilter);
}

function updateAdminDashboard() {
    if (!isAdminLoggedIn || typeof allStudents === 'undefined') return;

    updateAdminKPIs();
    updateAdminYearStats();
    updateAdminCharts();
}

function updateAdminKPIs() {
    const students = getAdminFilteredStudents();

    // Total Students
    const totalStudents = students.length;
    document.getElementById('adminTotalStudents').textContent = totalStudents.toLocaleString('en-IN');

    // Total Revenue (sum of FEES PAID)
    const totalRevenue = students.reduce((sum, s) => sum + (s['FEES PAID'] || 0), 0);
    document.getElementById('adminTotalRevenue').textContent = formatCurrency(totalRevenue);

    // Pending Balance
    const pendingBalance = students.reduce((sum, s) => sum + (s['BALANCE'] || 0), 0);
    document.getElementById('adminPendingBalance').textContent = formatCurrency(pendingBalance);

    // Fully Paid (Balance = 0)
    const fullyPaid = students.filter(s => s['BALANCE'] === 0).length;
    document.getElementById('adminFullyPaid').textContent = fullyPaid.toLocaleString('en-IN');
}

function updateAdminYearStats() {
    const students = getAdminFilteredStudents();

    const yearStats = {
        '1st': { count: 0, revenue: 0 },
        '2nd': { count: 0, revenue: 0 },
        '3rd': { count: 0, revenue: 0 }
    };

    students.forEach(s => {
        const year = s['YEAR'];
        if (yearStats[year]) {
            yearStats[year].count++;
            yearStats[year].revenue += s['FEES PAID'] || 0;
        }
    });

    // Update DOM
    document.getElementById('admin1stCount').textContent = `${yearStats['1st'].count} students`;
    document.getElementById('admin1stRevenue').textContent = `${formatCurrency(yearStats['1st'].revenue)} collected`;

    document.getElementById('admin2ndCount').textContent = `${yearStats['2nd'].count} students`;
    document.getElementById('admin2ndRevenue').textContent = `${formatCurrency(yearStats['2nd'].revenue)} collected`;

    document.getElementById('admin3rdCount').textContent = `${yearStats['3rd'].count} students`;
    document.getElementById('admin3rdRevenue').textContent = `${formatCurrency(yearStats['3rd'].revenue)} collected`;
}

function updateAdminCharts() {
    const students = getAdminFilteredStudents();

    // Revenue vs Balance Chart
    const totalRevenue = students.reduce((sum, s) => sum + (s['FEES PAID'] || 0), 0);
    const totalBalance = students.reduce((sum, s) => sum + (s['BALANCE'] || 0), 0);

    const revenueCtx = document.getElementById('adminRevenueChart');
    if (revenueCtx) {
        if (adminCharts.revenue) adminCharts.revenue.destroy();

        adminCharts.revenue = new Chart(revenueCtx, {
            type: 'doughnut',
            data: {
                labels: ['Collected', 'Pending'],
                datasets: [{
                    data: [totalRevenue, totalBalance],
                    backgroundColor: ['rgba(139, 92, 246, 0.8)', 'rgba(6, 182, 212, 0.8)'],
                    borderColor: ['rgba(139, 92, 246, 1)', 'rgba(6, 182, 212, 1)'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#a1a1aa', font: { size: 11 } }
                    }
                }
            }
        });
    }

    // Branch Chart
    const branchCounts = {};
    students.forEach(s => {
        const branch = s['BRANCH'] || 'Unknown';
        branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    });

    const branchCtx = document.getElementById('adminBranchChart');
    if (branchCtx) {
        if (adminCharts.branch) adminCharts.branch.destroy();

        adminCharts.branch = new Chart(branchCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(branchCounts),
                datasets: [{
                    label: 'Students',
                    data: Object.values(branchCounts),
                    backgroundColor: 'rgba(139, 92, 246, 0.8)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#a1a1aa' }, grid: { color: 'rgba(139, 92, 246, 0.1)' } },
                    x: { ticks: { color: '#a1a1aa' }, grid: { display: false } }
                }
            }
        });
    }
}

// ======================================
// YEAR-WISE QUICK FORMS
// ======================================

function initYearWiseForms() {
    const forms = ['form1stYear', 'form2ndYear', 'form3rdYear'];

    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', handleYearFormSubmit);
        }
    });
}

async function handleYearFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const yearValue = formData.get('year'); // "1st Year", "2nd Year", "3rd Year"
    const normalizedYear = yearValue.split(' ')[0]; // "1st", "2nd", "3rd"

    const endpoint = getEndpointForYear(normalizedYear);
    if (!endpoint) {
        showToast('❌ Invalid year configuration', 'error');
        return;
    }

    const submitBtn = form.querySelector('.year-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Adding...';
    submitBtn.disabled = true;

    const payload = {
        action: "ADD",
        year: normalizedYear,
        name: formData.get('name'),
        rollNo: formData.get('rollNo'),
        branch: formData.get('branch'),
        totalFees: parseFloat(formData.get('totalFees')) || 0,
        feesPaid: parseFloat(formData.get('feesPaid')) || 0,
        phone: formData.get('phone'),
        parentPhone: '',
        roomNo: '',
        college: '',
        email: '',
        proofLink: ''
    };

    try {
        setSyncStatus('syncing');
        console.log(`📤 [Year Form] Adding to ${normalizedYear} Year:`, payload);

        const response = await fetch(endpoint, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });

        const resultText = await response.text();
        console.log('📥 [Year Form] response:', resultText);

        let result;
        try {
            result = JSON.parse(resultText);
        } catch (e) {
            result = { status: response.ok ? "SUCCESS" : "ERROR" };
        }

        if (result.status === "SUCCESS") {
            showToast(`✅ Student added to ${normalizedYear} Year!`);
            form.reset();

            // Refresh all data
            if (typeof fetchAllData === 'function') {
                await fetchAllData();
            }
            setSyncStatus('live');
        } else {
            throw new Error(result.message || 'Server returned an error');
        }
    } catch (err) {
        setSyncStatus('error');
        console.error('❌ [Year Form] Error:', err);
        showToast('❌ Failed to add student', 'error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Update tab switching to refresh dashboard when opened
const originalTabHandler = document.querySelectorAll('.tab-button').forEach.bind(document.querySelectorAll('.tab-button'));
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');

        // Reset Add Form when Add tab is clicked manually
        if (tabId === 'add') {
            const form = document.getElementById('addStudentForm');
            const mode = form.getAttribute('data-mode');
            // Only reset if it's currently in Edit mode or has data
            if (mode === 'edit') {
                form.reset();
                form.removeAttribute('data-mode');
                const title = document.getElementById('formTitle');
                if (title) title.textContent = '➕ Add New Student';
                const submitBtn = form.querySelector('.primary-button');
                if (submitBtn) submitBtn.textContent = 'Add Student';
                originalEditRollNo = null;
            }
        }

        // Refresh dashboard when dashboard tab is opened
        if (tabId === 'dashboard') {
            setTimeout(updateAdminDashboard, 100);
        }
    });
});

// Initialize - Try to initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Admin.js DOM ready');
    setTimeout(initializeAdminFilters, 100);
    setTimeout(initYearWiseForms, 150);
    setTimeout(initAdminDashboardFilter, 200);
});

// Initialize admin dashboard year filter
function initAdminDashboardFilter() {
    const filter = document.getElementById('adminDashboardYearFilter');
    if (filter) {
        filter.addEventListener('change', (e) => {
            adminDashboardYearFilter = e.target.value;
            console.log(`🔍 Admin Dashboard filter changed to: ${adminDashboardYearFilter}`);
            updateAdminDashboard();
        });
    }
}

// Initialize - Load local storage on page load
//loadFromLocalStorage();




