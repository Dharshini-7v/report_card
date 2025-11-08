// API Base URL
const API_BASE = 'http://localhost:4567';

// Standalone mock mode (for GitHub Pages)
const USE_MOCK = location.hostname.endsWith('github.io');

function mockResponse(body, ok = true, status = 200) {
    return {
        ok,
        status,
        async json() { return body; }
    };
}

// Simple in-memory store backed by localStorage for persistence on Pages
const mockStore = (() => {
    const KEY = 'srs-mock-store-v1';
    function load() {
        try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
    }
    function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }
    const data = load();
    if (!data.users) data.users = [{ username: 'admin', password: '1234', dept: 'CSE' }];
    if (!data.userData) data.userData = {}; // per-username: { students: [], summary: {...} }
    function getUserData(username) {
        const u = username || localStorage.getItem('username') || 'guest';
        if (!data.userData[u]) {
            data.userData[u] = { students: [], summary: { classAverage: 0, gradeCounts: {} } };
            save(data);
        }
        return data.userData[u];
    }
    function recalcSummary(username) {
        const store = getUserData(username);
        const arr = store.students || [];
        if (arr.length === 0) { store.summary = { classAverage: 0, gradeCounts: {} }; save(data); return; }
        const avg = arr.reduce((s, x) => s + (x.average || 0), 0) / arr.length;
        const gradeCounts = {};
        arr.forEach(s => { gradeCounts[s.grade] = (gradeCounts[s.grade] || 0) + 1; });
        store.summary = { classAverage: avg, gradeCounts };
        save(data);
    }
    return { data, save, getUserData, recalcSummary };
})();

function gradeFromAverage(avg) {
    if (avg >= 90) return 'A+';
    if (avg >= 80) return 'A';
    if (avg >= 70) return 'B';
    if (avg >= 60) return 'C';
    return 'F';
}

async function apiFetch(endpoint, options = {}) {
    if (!USE_MOCK) {
        const url = `${API_BASE}${endpoint}`;
        return fetch(url, options);
    }

    // MOCK endpoints
    const method = (options.method || 'GET').toUpperCase();
    let body = {};
    if (options.body) {
        try { body = JSON.parse(options.body); } catch { body = {}; }
    }

    // /login
    if (endpoint === '/login' && method === 'POST') {
        const { username, password } = body;
        const user = (mockStore.data.users || []).find(u => u.username === username && u.password === password);
        if (user) {
            return mockResponse({ status: 'success', username: user.username });
        }
        return mockResponse({ status: 'error', message: 'Invalid credentials' }, false, 401);
    }

    // /signup
    if (endpoint === '/signup' && method === 'POST') {
        const { username, password, dept } = body;
        if (!username || !password) return mockResponse({ status: 'error', message: 'Missing fields' }, false, 400);
        const exists = (mockStore.data.users || []).some(u => u.username === username);
        if (exists) return mockResponse({ status: 'error', message: 'User already exists' }, false, 409);
        mockStore.data.users.push({ username, password, dept });
        mockStore.save(mockStore.data);
        return mockResponse({ status: 'success' });
    }

    // /summary
    if (endpoint === '/summary' && method === 'GET') {
        const u = localStorage.getItem('username');
        mockStore.recalcSummary(u);
        return mockResponse(mockStore.getUserData(u).summary);
    }

    // /students
    if (endpoint === '/students' && method === 'GET') {
        const u = localStorage.getItem('username');
        return mockResponse(mockStore.getUserData(u).students || []);
    }

    // /processReport
    if (endpoint === '/processReport' && method === 'POST') {
        const { students } = body;
        if (!Array.isArray(students) || students.length === 0) {
            return mockResponse({ status: 'error', message: 'No students' }, false, 400);
        }
        const processed = students.map(s => {
            const marks = Array.isArray(s.marks) ? s.marks : [];
            const total = marks.reduce((a, b) => a + (Number(b) || 0), 0);
            const avg = marks.length ? total / marks.length : 0;
            const subjects = marks.map((m, i) => ({ subject: `Subject ${i + 1}`, mark: Number(m) || 0 }));
            const best = subjects.reduce((acc, cur) => cur.mark > (acc.mark || -1) ? cur : acc, { mark: -1 });
            const grade = gradeFromAverage(avg);
            return {
                name: s.name,
                average: avg,
                grade,
                bestSubject: best.subject,
                remark: grade === 'F' ? 'Needs Improvement' : 'Good'
            };
        });
        const u = localStorage.getItem('username');
        const store = mockStore.getUserData(u);
        store.students = processed;
        mockStore.recalcSummary(u);
        return mockResponse({ students: processed, summary: store.summary });
    }

    return mockResponse({ status: 'error', message: 'Not found' }, false, 404);
}

// Utility Functions
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '9999';
    alert.style.minWidth = '300px';
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<span class="loading"></span> Loading...';
    } else {
        button.disabled = false;
        button.innerHTML = button.getAttribute('data-original-text') || button.textContent;
    }
}

// Login Page
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const button = e.target.querySelector('button[type="submit"]');
        
        button.setAttribute('data-original-text', button.textContent);
        setLoading(button, true);
        
        try {
            const response = await apiFetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            setLoading(button, false);
            
            if (data.status === 'success') {
                localStorage.setItem('username', data.username);
                localStorage.setItem('isLoggedIn', 'true');
                showAlert('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                showAlert(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            setLoading(button, false);
            showAlert('Connection error. Please check if server is running.', 'error');
        }
    });
}

// Signup Page
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('suUser').value;
        const password = document.getElementById('suPass').value;
        const dept = document.getElementById('suDept').value;
        const button = e.target.querySelector('button[type="submit"]');
        
        button.setAttribute('data-original-text', button.textContent);
        setLoading(button, true);
        
        try {
            const response = await apiFetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, dept })
            });
            
            const data = await response.json();
            setLoading(button, false);
            
            if (data.status === 'success') {
                showAlert('Account created successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                showAlert(data.message || 'Signup failed', 'error');
            }
        } catch (error) {
            setLoading(button, false);
            showAlert('Connection error. Please check if server is running.', 'error');
        }
    });
}

// Dashboard Page
if (document.getElementById('resultTable')) {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
    
    // Display username if available
    const username = localStorage.getItem('username');
    if (username) {
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
            usernameEl.textContent = username;
        }
    }
    
    // Load summary data and student results
    async function loadSummary() {
        try {
            const response = await apiFetch('/summary');
            const data = await response.json();
            
            if (data && data.classAverage !== undefined) {
                displaySummary(data);
            } else {
                document.getElementById('summary').innerHTML = '<p>No data available yet. Create some reports to see statistics.</p>';
            }
            
            // Load student results
            loadStudentResults();
        } catch (error) {
            console.error('Error loading summary:', error);
            document.getElementById('summary').innerHTML = '<p class="alert error">Unable to load summary data.</p>';
            loadStudentResults();
        }
    }
    
    // Load and display student results in table
    async function loadStudentResults() {
        try {
            const response = await apiFetch('/students');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const students = await response.json();
            const tbody = document.getElementById('resultTableBody');
            if (!tbody) return;
            
            if (students && Array.isArray(students) && students.length > 0) {
                tbody.innerHTML = students.map(student => `
                    <tr>
                        <td><strong>${student.name}</strong></td>
                        <td>${student.average.toFixed(2)}%</td>
                        <td><span class="grade-badge grade-${student.grade.replace('+', '-plus')}">${student.grade}</span></td>
                        <td>${student.bestSubject || 'N/A'}</td>
                        <td>${student.remark || 'N/A'}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                            No data available yet. Create reports to see results here.
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading student results:', error);
            const tbody = document.getElementById('resultTableBody');
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                            No data available yet. Create reports to see results here.
                        </td>
                    </tr>
                `;
            }
        }
    }
    
    function displaySummary(summary) {
        const summaryDiv = document.getElementById('summary');
        summaryDiv.innerHTML = `
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>Class Average</h3>
                    <div class="value">${summary.classAverage.toFixed(2)}%</div>
                </div>
                ${summary.gradeCounts ? Object.entries(summary.gradeCounts).map(([grade, count]) => `
                    <div class="summary-card">
                        <h3>Grade ${grade}</h3>
                        <div class="value">${count}</div>
                    </div>
                `).join('') : ''}
            </div>
        `;
    }
    
    loadSummary();
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Report Entry Page
if (document.getElementById('studentForm')) {
    // Check authentication
    if (!localStorage.getItem('isLoggedIn')) {
        window.location.href = 'index.html';
    }
    
    // Display username
    const username = localStorage.getItem('username');
    if (username) {
        const usernameEl = document.getElementById('username');
        if (usernameEl) {
            usernameEl.textContent = username;
        }
    }
    
    let subjectCount = 3;
    let studentCount = 2;
    
    // Generate form
    document.getElementById('generate').addEventListener('click', (e) => {
        e.preventDefault();
        generateStudentForm();
    });
    
    function generateStudentForm() {
        subjectCount = parseInt(document.getElementById('subjects').value) || 3;
        studentCount = parseInt(document.getElementById('studentCount').value) || 2;
        
        const studentsDiv = document.getElementById('students');
        studentsDiv.innerHTML = '';
        
        if (subjectCount < 1 || subjectCount > 10) {
            showAlert('Number of subjects must be between 1 and 10', 'error');
            return;
        }
        
        if (studentCount < 1 || studentCount > 50) {
            showAlert('Number of students must be between 1 and 50', 'error');
            return;
        }
        
        for (let i = 1; i <= studentCount; i++) {
            const studentBlock = document.createElement('div');
            studentBlock.className = 'student-block';
            studentBlock.innerHTML = `
                <h3>Student ${i}</h3>
                <label>
                    Student Name
                    <input type="text" name="student_${i}_name" required placeholder="Enter student name">
                </label>
                <div class="marks-container">
                    ${Array.from({ length: subjectCount }, (_, j) => `
                        <div class="mark-input">
                            <label>
                                Subject ${j + 1}
                                <input type="number" name="student_${i}_mark_${j}" min="0" max="100" required placeholder="Marks">
                            </label>
                        </div>
                    `).join('')}
                </div>
            `;
            studentsDiv.appendChild(studentBlock);
        }
    }
    
    // Process form
    document.getElementById('studentForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const students = [];
        
        // Collect student data
        for (let i = 1; i <= studentCount; i++) {
            const name = formData.get(`student_${i}_name`);
            if (!name) continue;
            
            const marks = [];
            for (let j = 0; j < subjectCount; j++) {
                const mark = parseInt(formData.get(`student_${i}_mark_${j}`));
                if (!isNaN(mark)) {
                    marks.push(mark);
                }
            }
            
            if (marks.length === subjectCount) {
                students.push({ name, marks });
            }
        }
        
        if (students.length === 0) {
            showAlert('Please fill in at least one student with all marks', 'error');
            return;
        }
        
        const button = e.target.querySelector('button[type="submit"]');
        button.setAttribute('data-original-text', button.textContent);
        setLoading(button, true);
        
        try {
            const response = await apiFetch('/processReport', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students })
            });
            
            const data = await response.json();
            setLoading(button, false);
            
            if (data && data.students) {
                displayResults(data);
                showAlert('Report processed successfully!', 'success');
            } else {
                showAlert('Error processing report', 'error');
            }
        } catch (error) {
            setLoading(button, false);
            showAlert('Connection error. Please check if server is running.', 'error');
        }
    });
    
    function displayResults(data) {
        const form = document.getElementById('studentForm');
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'results';
        resultsDiv.innerHTML = `
            <h2>Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Average</th>
                        <th>Grade</th>
                        <th>Best Subject</th>
                        <th>Remark</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.students.map(student => `
                        <tr>
                            <td><strong>${student.name}</strong></td>
                            <td>${student.average.toFixed(2)}%</td>
                            <td><span class="grade-badge grade-${student.grade.replace('+', '-plus')}">${student.grade}</span></td>
                            <td>${student.bestSubject}</td>
                            <td>${student.remark}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${data.summary ? `
                <div class="summary-grid" style="margin-top: 20px;">
                    <div class="summary-card">
                        <h3>Class Average</h3>
                        <div class="value">${data.summary.classAverage.toFixed(2)}%</div>
                    </div>
                </div>
            ` : ''}
            <div class="actions" style="margin-top: 20px;">
                <button onclick="window.location.href='dashboard.html'">View Dashboard</button>
                <button class="secondary" onclick="document.getElementById('results').remove(); generateStudentForm();">New Entry</button>
            </div>
        `;
        
        form.insertAdjacentElement('afterend', resultsDiv);
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Clear button
    document.getElementById('clear').addEventListener('click', () => {
        document.getElementById('students').innerHTML = '';
        const results = document.getElementById('results');
        if (results) results.remove();
    });
    
    // Initialize with default values
    generateStudentForm();
}

