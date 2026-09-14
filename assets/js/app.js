// ─── State ───────────────────────────────

let editingMilestoneId = null;
let currentRole = 'student';
let currentPage = 'dashboard';

const STUDENT_NAV = [
  { key: 'dashboard',     label: 'Dashboard',     icon: '⊞' },
  { key: 'project',       label: 'My Project',    icon: '📁' },
  { key: 'milestones',    label: 'Milestones',    icon: '🎯' },
  { key: 'feedback',      label: 'Feedback',      icon: '💬' },
  { key: 'meetings',      label: 'Meetings',      icon: '📅' },
  { key: 'notifications', label: 'Alerts',        icon: '🔔', badge: 3 },
];
const SUPERVISOR_NAV = [
  { key: 'sv-dashboard',  label: 'Dashboard',     icon: '⊞' },
  { key: 'sv-students',   label: 'Students',      icon: '👥' },
  { key: 'sv-proposals',  label: 'Proposals',     icon: '📁' },
  { key: 'sv-assessment', label: 'Assessment',    icon: '📊' },
  { key: 'sv-schedule',   label: 'Schedule',      icon: '📅' },
  { key: 'notifications', label: 'Alerts',        icon: '🔔', badge: 3 },
];

// ─── Render sidebar (desktop/tablet) ─────
// ─── Render sidebar ─────────────────────────
function renderSidebar() {

    console.log("renderSidebar running");
    console.log("Current role:", currentRole);

    const nav =
        currentRole === "student"
            ? STUDENT_NAV
            : SUPERVISOR_NAV;

    // Update sidebar title
    const sidebarLabel =
        document.getElementById("sidebar-label");

    if (sidebarLabel) {
        sidebarLabel.textContent =
            currentRole === "supervisor"
                ? "Supervisor Portal"
                : "Student Portal";
    }

    // Render navigation
    const sidebarNav =
        document.getElementById("sidebar-nav");

    if (!sidebarNav) {
        console.error("sidebar-nav not found");
        return;
    }

    sidebarNav.innerHTML =
        nav.map(item => `
            <div
                class="nav-item${currentPage === item.key ? ' active' : ''}"
                onclick="showPage('${item.key}'); closeSidebar()"
            >
                <span>${item.icon}</span>
                ${item.label}
            </div>
        `).join('') +

        `
        <div
            class="nav-item logout-btn"
            onclick="logout()"
        >
            <span>🚪</span>
            Logout
        </div>
        `;
}

// ─── Render bottom nav (mobile) ──────────
function renderBottomNav() {
  const nav = currentRole === 'student' ? STUDENT_NAV : SUPERVISOR_NAV;
  // Show first 5 items in bottom nav
  const items = nav.slice(0, 5);
  document.getElementById('bottom-nav-inner').innerHTML = items.map(item => `
    <button class="bnav-item${currentPage === item.key ? ' active' : ''}"
            onclick="showPage('${item.key}')">
      ${item.badge ? `<span class="bnav-badge">${item.badge}</span>` : ''}
      <span class="bnav-icon">${item.icon}</span>
      <span>${item.label}</span>
    </button>`).join('');
}

// ─── Page navigation ─────────────────────
function showPage(key){

    if(key === "dashboard"){

        loadDashboard();
    }
    if(key === "project"){
    loadProjectPage();
    }
    if(key === "sv-dashboard"){

        loadSupervisorDashboard();
    }
    if(key === "sv-students"){
    console.log("running.................")

    loadSupervisorStudents();
    }

    if(key === "sv-proposals"){

    loadSupervisorProposals();

    }
    if (key === "sv-schedule") {

    loadSupervisorMeetings();
    }

    if (key === "sv-assessment") {
    loadAssessmentStudents();
    }
    if (key === "feedback") {
    loadStudentFeedback();
    }

    if(key === "milestones"){
    loadMilestones();
    }
    if (key === "meetings") {
    loadMeetings();
    }
    if (key === "notifications") {
    loadNotifications();
    }


    if(key === "logout"){
        logout();
        return;
    }

    document.querySelectorAll('.page')
        .forEach(p => p.classList.remove('active'));

    const target =
        document.getElementById('page-' + key);

    if(target){
        target.classList.add('active');
    }

    currentPage = key;

    renderSidebar();
    renderBottomNav();
}

// ─── Sidebar drawer (tablet) ─────────────
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  const hb = document.getElementById('hamburger');
  const open = sb.classList.toggle('open');
  ov.classList.toggle('open', open);
  hb.classList.toggle('open', open);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
}

// ─── Role toggle ─────────────────────────
// function toggleRole() {
//   currentRole = currentRole === 'student' ? 'supervisor' : 'student';
//   const isSup = currentRole === 'supervisor';
//   document.getElementById('nav-avatar').textContent       = isSup ? 'KM' : 'AO';
//   document.getElementById('nav-name').textContent         = isSup ? 'Dr. Kojo Mensah' : 'Amara Osei';
//   document.getElementById('nav-role-label').textContent   = isSup ? 'Project Supervisor' : 'HND Computing Yr 2';
//   const btn = document.getElementById('role-toggle');
//   btn.textContent       = isSup ? 'Switch to Student →' : 'Switch to Supervisor →';
//   btn.style.background  = isSup ? '#F5A623' : '#3B8DD6';
//   showPage(isSup ? 'sv-dashboard' : 'dashboard');
// }

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ─── Modals ──────────────────────────────
function openModal(name) {

    document.querySelectorAll('.modal-box').forEach(
        m => m.style.display = 'none'
    );

    const box =
        document.getElementById('modal-' + name);

    if (box) {
        box.style.display = 'block';
    }

    document
        .getElementById('modal-overlay')
        .classList.add('open');


    if (name === "meeting") {

        loadMeetingMilestones();

    }

}
function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
}

// ─── Assessment sliders ───────────────────

const scores = {
    research: 72,
    methodology: 68,
    presentation: 75,
    report: 70
};

function updateScore(key, val) {

    console.log("===== UPDATE SCORE START =====");

    console.log(
        "Current assessment page:",
        document.getElementById("page-sv-assessment")
    );

    console.log(
        "Current comments box:",
        document.getElementById("assessment-comments")
    );


    scores[key] = parseInt(val);

    document.getElementById(
        'score-' + key
    ).textContent = val + '%';


    const avg = Math.round(
        Object.values(scores)
            .reduce((a, b) => a + b, 0) / 4
    );


    const band =
        avg >= 70 ? 'Distinction' :
        avg >= 60 ? 'Merit' :
        avg >= 50 ? 'Pass' :
        'Refer';


    const color =
        avg >= 70 ? '#27AE60' :
        avg >= 60 ? '#1A5FA8' :
        avg >= 50 ? '#E67E22' :
        '#E74C3C';


    const box =
        document.getElementById('grade-box');

    box.style.background = color + '15';


    document.getElementById(
        'grade-num'
    ).textContent = avg + '%';


    document.getElementById(
        'grade-num'
    ).style.color = color;


    document.getElementById(
        'grade-band'
    ).textContent = band;


    document.getElementById(
        'grade-band'
    ).style.color = color;


    console.log(
        "Before generateAssessmentComment:",
        document.getElementById("assessment-comments")
    );


    generateAssessmentComment();


    console.log("===== UPDATE SCORE END =====");
}


function generateAssessmentComment() {

    const research = scores.research;
    const methodology = scores.methodology;
    const presentation = scores.presentation;
    const report = scores.report;

    const average = Math.round(
        (research + methodology + presentation + report) / 4
    );

    let comment = "";

    // Overall performance
    if (average >= 70) {

        comment +=
            "The student is demonstrating strong overall progress in the project. ";

    } else if (average >= 60) {

        comment +=
            "The student is making good progress in the project, although some areas require further improvement. ";

    } else if (average >= 50) {

        comment +=
            "The student has made satisfactory progress, but significant improvement is required in some areas. ";

    } else {

        comment +=
            "The student's current project performance requires significant improvement and closer supervision. ";
    }


    // Research & Literature
    if (research >= 70) {

        comment +=
            "Research and literature review work is strong, with good understanding of the relevant subject matter. ";

    } else if (research >= 60) {

        comment +=
            "Research and literature review work is satisfactory, but the student should strengthen the depth and coverage of the literature. ";

    } else {

        comment +=
            "Research and literature review require considerable improvement, particularly in depth, relevance and supporting sources. ";
    }


    // Methodology
    if (methodology >= 70) {

        comment +=
            "The methodology and approach demonstrate a clear understanding of how the project should be implemented. ";

    } else if (methodology >= 60) {

        comment +=
            "The methodology is generally acceptable, although the project approach could be explained and justified more clearly. ";

    } else {

        comment +=
            "The methodology and project approach require further development and clarification. ";
    }


    // Presentation
    if (presentation >= 70) {

        comment +=
            "The student communicates the project effectively and demonstrates good presentation skills. ";

    } else if (presentation >= 60) {

        comment +=
            "Presentation and communication are satisfactory, but the student should improve clarity and confidence when explaining the project. ";

    } else {

        comment +=
            "Presentation and communication need significant improvement, particularly when explaining the project's objectives and implementation. ";
    }


    // Report
    if (report >= 70) {

        comment +=
            "The written report is well structured and demonstrates good attention to academic presentation. ";

    } else if (report >= 60) {

        comment +=
            "The written report is satisfactory but would benefit from improved structure, clarity and academic detail. ";

    } else {

        comment +=
            "The written report requires further improvement in structure, clarity and academic documentation. ";
    }


    // Final recommendation
    if (average >= 70) {

        comment +=
            "Overall, the student is progressing well and appears to be on track to complete the current project requirements.";

    } else if (average >= 60) {

        comment +=
            "The student should continue working on the identified areas while maintaining regular project activities.";

    } else if (average >= 50) {

        comment +=
            "The student should work closely with the supervisor and address the identified weaknesses before progressing further.";

    } else {

        comment +=
            "Closer supervision and significant corrective work are recommended before the student progresses to the next stage.";
    }


    const commentsBox =
        document.getElementById("assessment-comments");

    console.log(
        "ASSESSMENT COMMENTS BOX:",
        commentsBox
    );

    console.log(
        "GENERATED COMMENT:",
        comment
    );

    if (!commentsBox) {

        console.error(
            "assessment-comments element was NOT found"
        );

        return;
    }

    commentsBox.value = comment;
}

// ─── Star rating ─────────────────────────
function setStars(n) {
  document.querySelectorAll('#star-row .star-btn').forEach((s, i) => {
    s.textContent       = i < n ? '★' : '☆';
    s.style.background  = i < n ? '#1A5FA8' : '#EBF3FB';
    s.style.color       = i < n ? '#fff'    : '#1A5FA8';
  });
}

// ─── Init ────────────────────────────────
// App starts at landing; showPage called after login
// (No showPage call here — auth layer is shown first)

// ════════════════════════════════════════════
// AUTH LAYER LOGIC
// ════════════════════════════════════════════

// Which auth screen to show
function showAuth(screen) {
  document.querySelectorAll('.auth-screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + screen);
  if (el) el.classList.add('active');
  window.scrollTo(0, 0);
}

// Toggle password visibility
function togglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

// Clear error on field
function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('err');
  // find sibling err-msg
  const err = document.getElementById('err-' + id);
  if (err) err.classList.remove('show');
}
function showErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.classList.add('err');
  const err = document.getElementById('err-' + id);
  if (err) { if (msg) err.textContent = msg; err.classList.add('show'); }
  return false;
}

// ── Login ──
async function doLogin() {

    const email =
        document.getElementById("login-email").value.trim();

    const password =
        document.getElementById("login-pass").value;

    let ok = true;

    if (!email || !email.includes("@"))
        ok = showErr("login-email");

    if (!password)
        ok = showErr("login-pass");

    if (!ok) return;

    try {

        const response = await fetch(
            "api/auth/login.php",
            {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            currentRole = data.user.role;

            enterSystemAs(data.user);

            renderSidebar();

            if(data.user.role === "supervisor"){

                showPage("sv-dashboard");

            }else{

                showPage("dashboard");
            }

        } else {

            alert(data.message);
        }

    } catch (error) {

        console.error(error);
        alert("Login failed.");
    }
}

function quickLogin(role) {
  enterSystemAs(role);
}

// ── Register ──
let regRole = 'student';
let regStep = 1;

function selectRole(r) {

    regRole = r;

    document.getElementById('role-student')
        .classList.toggle('sel', r === 'student');

    document.getElementById('role-supervisor')
        .classList.toggle('sel', r === 'supervisor');

    // Student fields
    const matricGroup = document.getElementById('reg-matric-group');
    const yearGroup = document.getElementById('reg-yr-group');

    // Supervisor field
    const departmentGroup = document.getElementById('reg-department-group');

    if (matricGroup) {
        matricGroup.style.display =
            r === 'student' ? '' : 'none';
    }

    if (yearGroup) {
        yearGroup.style.display =
            r === 'student' ? '' : 'none';
    }

    if (departmentGroup) {
        departmentGroup.style.display =
            r === 'supervisor' ? '' : 'none';
    }

    // Clear fields when switching role
    if (r === 'student') {

        const department =
            document.getElementById('reg-department');

        if (department) {
            department.value = '';
        }

    } else {

        const matric =
            document.getElementById('reg-matric');

        const year =
            document.getElementById('reg-year');

        if (matric) {
            matric.value = '';
        }

        if (year) {
            year.value = '';
        }
    }
}

function setStepBar(n) {
  regStep = n;
  [1,2,3].forEach(i => {
    document.getElementById('rs' + i).style.background = i <= n ? 'var(--blue)' : 'var(--border)';
  });
  document.getElementById('reg-step-label').textContent = `Step ${n} of 3`;
}

function regNext(from) {

    if (from === 1) {

        const name = document.getElementById('reg-name').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();

        let ok = true;

        if (!name) {
            showErr('reg-name');
            ok = false;
        }

        if (!email || !email.includes('@')) {
            showErr('reg-email');
            ok = false;
        }

        if (!phone) {
            showErr('reg-phone');
            ok = false;
        }

        if (regRole === 'student') {

            const matric =
                document.getElementById('reg-matric');

            if (!matric) {
                console.error('reg-matric does not exist in HTML');
                alert('Registration form error: Matric Number field is missing.');
                return;
            }

            if (!matric.value.trim()) {
                showErr('reg-matric');
                ok = false;
            }
        }

        if (regRole === 'supervisor') {

            const department =
                document.getElementById('reg-department');

            if (!department) {
                console.error('reg-department does not exist in HTML');
                alert('Registration form error: Department field is missing.');
                return;
            }

            if (!department.value.trim()) {
                showErr('reg-department');
                ok = false;
            }
        }

        if (!ok) {
            return;
        }

        document.getElementById('reg-step1').style.display = 'none';
        document.getElementById('reg-step2').style.display = '';

        setStepBar(2);

        return;
    }


    if (from === 2) {

        const passElement =
            document.getElementById('reg-pass');

        const pass2Element =
            document.getElementById('reg-pass2');

        if (!passElement || !pass2Element) {

            console.error(
                'Password fields are missing from the registration HTML.'
            );

            alert(
                'Registration form error: Password fields are missing.'
            );

            return;
        }

        const pass = passElement.value;
        const pass2 = pass2Element.value;

        let ok = true;


        if (regRole === 'student') {

            const year =
                document.getElementById('reg-year');

            if (!year) {

                console.error(
                    'reg-year does not exist in HTML'
                );

                alert(
                    'Registration form error: Year of Study field is missing.'
                );

                return;
            }

            if (!year.value) {

                showErr('reg-year');

                ok = false;
            }
        }


        if (pass.length < 8) {

            showErr(
                'reg-pass',
                'Password must be at least 8 characters.'
            );

            ok = false;
        }


        if (pass !== pass2) {

            showErr(
                'reg-pass2',
                'Passwords do not match.'
            );

            ok = false;
        }


        if (!ok) {
            return;
        }


        const name =
            document.getElementById('reg-name').value.trim();

        const email =
            document.getElementById('reg-email').value.trim();

        const phone =
            document.getElementById('reg-phone').value.trim();


        const roleLabel =
            regRole === 'student'
                ? 'Student'
                : 'Supervisor';


        let review = `
            <b>Name:</b> ${escapeHtml(name)}<br>
            <b>Email:</b> ${escapeHtml(email)}<br>
            <b>Phone:</b> ${escapeHtml(phone)}<br>
            <b>Role:</b> ${roleLabel}<br>
        `;


        if (regRole === 'student') {

            const matric =
                document.getElementById('reg-matric').value.trim();

            const year =
                document.getElementById('reg-year').value;

            review += `
                <b>Matric Number:</b> ${escapeHtml(matric)}<br>
                <b>Year of Study:</b> ${escapeHtml(year)}
            `;

        }


        if (regRole === 'supervisor') {

            const department =
                document.getElementById('reg-department').value.trim();

            review += `
                <b>Department:</b> ${escapeHtml(department)}
            `;
        }


        document.getElementById('reg-review').innerHTML = review;

        document.getElementById('reg-step2').style.display = 'none';
        document.getElementById('reg-step3').style.display = '';

        setStepBar(3);
    }
}

function regBack() {
  document.getElementById('reg-step2').style.display = 'none';
  document.getElementById('reg-step1').style.display = '';
  setStepBar(1);
}
function regBack2() {
  document.getElementById('reg-step3').style.display = 'none';
  document.getElementById('reg-step2').style.display = '';
  setStepBar(2);
}

async function doRegister() {

    const terms =
        document.getElementById('chk-terms').checked;

    const dataConsent =
        document.getElementById('chk-data').checked;


    // ==========================
    // TERMS & DATA CONSENT
    // ==========================

    if (!terms || !dataConsent) {

        alert(
            "Please accept the Terms and Conditions and give consent for your data to be stored."
        );

        return;
    }


    // ==========================
    // BASIC INFORMATION
    // ==========================

    const fullname =
        document.getElementById("reg-name").value.trim();

    const email =
        document.getElementById("reg-email").value.trim();

    const phone =
        document.getElementById("reg-phone").value.trim();

    const password =
        document.getElementById("reg-pass").value;


    // ==========================
    // GET ROLE FROM HTML
    // ==========================

    const registerScreen =
        document.getElementById("screen-register");

    const role =
        registerScreen?.dataset.role || "student";


    // ==========================
    // ROLE-SPECIFIC DATA
    // ==========================

    let matric_no = "";
    let department = "";
    let level = "";


    // ==========================
    // STUDENT
    // ==========================

    if (role === "student") {

        const matricElement =
            document.getElementById("reg-matric");

        const departmentElement =
            document.getElementById("reg-department");

        const yearElement =
            document.getElementById("reg-year");


        if (!matricElement || !departmentElement || !yearElement) {

            console.error(
                "Student registration fields are missing."
            );

            alert(
                "Registration form error: Student fields are missing."
            );

            return;
        }


        matric_no =
            matricElement.value.trim();

        department =
            departmentElement.value.trim();

        level =
            yearElement.value;


        if (!matric_no) {

            alert(
                "Please enter your matric number."
            );

            return;
        }


        if (!department) {

            alert(
                "Please enter your department."
            );

            return;
        }


        if (!level) {

            alert(
                "Please select your year of study."
            );

            return;
        }
    }


    // ==========================
    // SUPERVISOR
    // ==========================

    if (role === "supervisor") {

        const departmentElement =
            document.getElementById("reg-department");


        if (!departmentElement) {

            console.error(
                "Supervisor department field is missing."
            );

            alert(
                "Registration form error: Department field is missing."
            );

            return;
        }


        department =
            departmentElement.value.trim();


        if (!department) {

            alert(
                "Please enter your department."
            );

            return;
        }
    }


    // ==========================
    // SEND REGISTRATION REQUEST
    // ==========================

    try {

        const response =
            await fetch(
                "http://localhost/fypms/api/auth/register.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        fullname: fullname,
                        email: email,
                        matric_no: matric_no,
                        phone: phone,
                        department: department,
                        level: level,
                        password: password,
                        role: role

                    })
                }
            );


        // ==========================
        // READ SERVER RESPONSE
        // ==========================

        const text =
            await response.text();


        console.log(
            "Registration response:",
            text
        );


        // ==========================
        // PARSE JSON SAFELY
        // ==========================

        let result;

        try {

            result =
                JSON.parse(text);

        } catch (parseError) {

            console.error(
                "Invalid JSON response:",
                text
            );

            alert(
                "The server returned an unexpected response. Please try again."
            );

            return;
        }


        // ==========================
        // SUCCESS
        // ==========================

        if (result.success) {

            document.getElementById(
                'reg-step3'
            ).style.display = 'none';


            document.getElementById(
                'reg-step4'
            ).style.display = '';


            document.getElementById(
                'reg-step-label'
            ).textContent = 'Complete!';


            [1, 2, 3].forEach(i => {

                const step =
                    document.getElementById('rs' + i);


                if (step) {

                    step.style.background =
                        'var(--success)';
                }

            });


            return;
        }


        // ==========================
        // REGISTRATION FAILED
        // ==========================

        alert(
            result.message ||
            "Registration failed. Please try again."
        );


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        alert(
            "Unable to connect to the server. Please check that your backend is running."
        );
    }
}

function enterSystemAs(user) {

    currentRole = user.role;

    document.getElementById('nav-name').textContent =
        user.fullname;

    document.getElementById('nav-role-label').textContent =
        user.role.toUpperCase();

    document.getElementById('nav-avatar').textContent =
        user.fullname
            .split(' ')
            .map(n => n[0])
            .join('')
            .substring(0,2);

    document.getElementById('auth-layer')
        .classList.add('hidden');

    const roleToggle =
        document.getElementById('role-toggle');

    if(roleToggle){
        roleToggle.style.display = "none";
    }

    renderSidebar();
    renderBottomNav();

    if(user.role === "student"){
        showPage("dashboard");
    }else{
        showPage("sv-dashboard");
    }
}
// ── Password strength ──
function checkStrength() {
  const val = document.getElementById('reg-pass').value;
  const segs = [document.getElementById('ss1'),document.getElementById('ss2'),
                document.getElementById('ss3'),document.getElementById('ss4')];
  const lbl = document.getElementById('strength-lbl');
  let score = 0;
  if (val.length >= 8)  score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const colors = ['#E74C3C','#E67E22','#F5A623','#27AE60'];
  const labels = ['Weak','Fair','Good','Strong'];
  segs.forEach((s,i) => s.style.background = i < score ? colors[score-1] : 'var(--border)');
  lbl.textContent = score > 0 ? labels[score-1] : 'Enter a password';
  lbl.style.color = score > 0 ? colors[score-1] : 'var(--light)';
}


document.addEventListener("DOMContentLoaded", () => {

    const savedUser =
        localStorage.getItem("user");

    if(savedUser){

        const user =
            JSON.parse(savedUser);

        enterSystemAs(user);
    }
});

async function logout() {

    try {

        const response = await fetch(
            "api/auth/logout.php",
            {
                method: "POST",
                credentials: "same-origin"
            }
        );

        const data = await response.json();

        if(data.success){

            localStorage.removeItem("user");

            alert("Logged out successfully");

            location.reload();
        }

    } catch(err){

        console.error(err);

        location.reload();
    }
}


function loadUserDashboard() {

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    if (!user) return;

    const navName = document.getElementById("nav-name");
    const navRole = document.getElementById("nav-role-label");

    if(navName) navName.textContent = user.fullname;
    if(navRole) navRole.textContent = user.department;

    const studentName = document.getElementById("student-name");
    const studentDept = document.getElementById("student-department");
    const studentMatric = document.getElementById("student-matric");

    if(studentName) studentName.textContent = user.fullname;
    if(studentDept) studentDept.textContent = user.department;
    if(studentMatric) studentMatric.textContent = user.matric_no;
}


///////////////////////DASHBOARD////////////////////////////////////////////////////
async function loadDashboard() {

    try {

        const res = await fetch("api/student/dashboard.php", {
            credentials: "same-origin"
        });

        const data = await res.json();

        console.log("Student Dashboard:", data);

        if (!data.success) {
            return;
        }

        const statusElement =
            document.getElementById("dashboard-project-status");

        const milestonesElement =
            document.getElementById("milestones-done");

        const nextDueElement =
            document.getElementById("next-due");

        const feedbackElement =
            document.getElementById("unread-feedback");

        const feedbackCountElement =
            document.getElementById("feedback-count");

        const progressTextElement =
            document.getElementById("project-progress-text");

        const progressBarElement =
            document.getElementById("project-progress-bar");


        /*
        |--------------------------------------------------------------------------
        | NO PROJECT
        |--------------------------------------------------------------------------
        */

        if (!data.project) {

            if (statusElement) {
                statusElement.textContent = "No Project";
            }

            if (milestonesElement) {
                milestonesElement.textContent = "0 / 0";
            }

            if (nextDueElement) {
                nextDueElement.textContent = "--";
            }

            if (feedbackElement) {
                feedbackElement.textContent = "0 New";
            }

            if (feedbackCountElement) {
                feedbackCountElement.textContent = "0";
            }

            if (progressTextElement) {
                progressTextElement.textContent = "0%";
            }

            if (progressBarElement) {
                progressBarElement.style.width = "0%";
            }

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | STUDENT INFORMATION
        |--------------------------------------------------------------------------
        */

        const studentName =
            document.getElementById("student-name");

        if (studentName) {
            studentName.textContent =
                data.student.fullname || "Student";
        }


        const studentDepartment =
            document.getElementById("student-department");

        if (studentDepartment) {
            studentDepartment.textContent =
                data.student.department || "Department";
        }


        /*
        |--------------------------------------------------------------------------
        | PROJECT STATUS
        |--------------------------------------------------------------------------
        */

        if (statusElement) {

            statusElement.textContent =
                data.project.status || "Pending";
        }


        /*
        |--------------------------------------------------------------------------
        | MILESTONES
        |--------------------------------------------------------------------------
        */

        if (milestonesElement) {

            milestonesElement.textContent =
                `${data.milestones_done} / ${data.milestones_total}`;
        }


        /*
        |--------------------------------------------------------------------------
        | NEXT DUE
        |--------------------------------------------------------------------------
        */

        if (nextDueElement) {

            if (
                data.next_milestone &&
                data.next_milestone.due_date
            ) {

                const dueDate =
                    new Date(data.next_milestone.due_date);

                nextDueElement.textContent =
                    dueDate.toLocaleDateString(
                        "en-US",
                        {
                            month: "short",
                            day: "numeric"
                        }
                    );

            } else {

                nextDueElement.textContent = "--";
            }
        }


        /*
        |--------------------------------------------------------------------------
        | FEEDBACK
        |--------------------------------------------------------------------------
        */

        if (feedbackElement) {

            feedbackElement.textContent =
                `${data.feedback_count} New`;
        }


        if (feedbackCountElement) {

            feedbackCountElement.textContent =
                data.feedback_count;
        }


        /*
        |--------------------------------------------------------------------------
        | PROJECT PROGRESS
        |--------------------------------------------------------------------------
        */

        const progress =
            Number(data.project.progress || 0);


        if (progressTextElement) {

            progressTextElement.textContent =
                `${progress}%`;
        }


        if (progressBarElement) {

            progressBarElement.style.width =
                `${progress}%`;
        }

    } catch (err) {

        console.error(
            "Student Dashboard Error:",
            err
        );
    }
}

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const response = await fetch(
            "/FYPMS/api/auth/session.php",
            {
                credentials: "same-origin"
            }
        );

        const data = await response.json();

        if(data.success){

            const savedUser =
                JSON.parse(
                    localStorage.getItem("user")
                );

            if(savedUser){
                enterSystemAs(savedUser);
            }

        } else {

            localStorage.removeItem("user");

            document.getElementById("auth-layer")
                .classList.remove("hidden");

            showAuth("login");
        }

    } catch(err){

        console.error(err);

        showAuth("login");
    }
});


///////////////////////////project load /////////////
async function loadProjectPage() {

    try {

        const res = await fetch(
            "api/student/project.php",
            {
                method: "GET",
                credentials: "same-origin"
            }
        );

        const data = await res.json();

        console.log("My Project:", data);


        if (!data.success) {
            return;
        }


        const project = data.project;


        /*
        |--------------------------------------------------------------------------
        | NO PROJECT
        |--------------------------------------------------------------------------
        */

        if (!project) {

            document.getElementById(
                "project-title"
            ).textContent = "No Project Yet";

            document.getElementById(
                "project-status"
            ).textContent = "No Project";

            document.getElementById(
                "project-supervisor"
            ).textContent = "Not Assigned";

            document.getElementById(
                "project-department"
            ).textContent = "-";

            document.getElementById(
                "project-description"
            ).textContent =
                "No project description available.";

            document.getElementById(
                "project-objectives"
            ).textContent =
                "No objectives added yet.";

            document.getElementById(
                "project-submitted"
            ).textContent = "-";

            document.getElementById(
                "project-approved"
            ).textContent = "-";

            const progressElement =
                document.getElementById(
                    "project-page-progress"
                );

            if (progressElement) {
                progressElement.textContent = "0%";
            }

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | PROJECT TITLE
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "project-title"
        ).textContent =
            project.title || "Untitled Project";


        /*
        |--------------------------------------------------------------------------
        | PROJECT STATUS
        |--------------------------------------------------------------------------
        */

        const statusElement =
            document.getElementById(
                "project-status"
            );

        const status =
            project.status || "Pending";


        if (statusElement) {

            statusElement.textContent =
                status;


            if (status === "Approved") {

                statusElement.style.background =
                    "#27AE6020";

                statusElement.style.color =
                    "#27AE60";

            } else if (status === "In Progress") {

                statusElement.style.background =
                    "#1A5FA820";

                statusElement.style.color =
                    "#1A5FA8";

            } else if (status === "Completed") {

                statusElement.style.background =
                    "#27AE6020";

                statusElement.style.color =
                    "#27AE60";

            } else if (status === "Rejected") {

                statusElement.style.background =
                    "#E74C3C20";

                statusElement.style.color =
                    "#E74C3C";

            } else {

                statusElement.style.background =
                    "#F39C1220";

                statusElement.style.color =
                    "#F39C12";
            }
        }


        /*
        |--------------------------------------------------------------------------
        | SUPERVISOR
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "project-supervisor"
        ).textContent =
            project.supervisor_name ||
            "Not Assigned";


        /*
        |--------------------------------------------------------------------------
        | DEPARTMENT
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "project-department"
        ).textContent =
            project.supervisor_department ||
            project.department ||
            "-";


        /*
        |--------------------------------------------------------------------------
        | DESCRIPTION
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "project-description"
        ).textContent =
            project.description ||
            "No project description available.";


        /*
        |--------------------------------------------------------------------------
        | OBJECTIVES
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "project-objectives"
        ).textContent =
            project.objectives ||
            "No objectives added yet.";


        /*
        |--------------------------------------------------------------------------
        | SUBMITTED
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "project-submitted"
        ).textContent =
            project.created_at
                ? new Date(
                    project.created_at
                ).toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )
                : "-";


        /*
        |--------------------------------------------------------------------------
        | APPROVED
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "project-approved"
        ).textContent =
            project.approved_at
                ? new Date(
                    project.approved_at
                ).toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )
                : "-";


        /*
        |--------------------------------------------------------------------------
        | PROJECT PROGRESS
        |--------------------------------------------------------------------------
        |
        | Calculate progress from the 6 milestones.
        |
        */

        let projectProgress =
            Number(project.progress || 0);


        try {

            const milestoneResponse =
                await fetch(
                    "api/student/get_milestones.php",
                    {
                        credentials: "same-origin"
                    }
                );


            const milestoneData =
                await milestoneResponse.json();


            if (
                milestoneData.success &&
                Array.isArray(
                    milestoneData.milestones
                )
            ) {

                const milestones =
                    milestoneData.milestones;


                const total =
                    milestones.length;


                const completed =
                    milestones.filter(
                        milestone =>
                            milestone.status ===
                            "Completed"
                    ).length;


                if (total > 0) {

                    projectProgress =
                        Math.round(
                            (
                                completed /
                                total
                            ) * 100
                        );
                }
            }

        } catch (error) {

            console.error(
                "Unable to calculate project progress:",
                error
            );
        }


        /*
        |--------------------------------------------------------------------------
        | DISPLAY PROGRESS
        |--------------------------------------------------------------------------
        */

        const progressElement =
            document.getElementById(
                "project-page-progress"
            );


        if (progressElement) {

            progressElement.textContent =
                `${projectProgress}%`;
        }


        /*
        |--------------------------------------------------------------------------
        | EDIT BUTTON
        |--------------------------------------------------------------------------
        */

        const editButton =
            document.getElementById(
                "edit-project-btn"
            );


        if (editButton) {

            if (status === "Pending") {

                editButton.style.display =
                    "inline-block";

            } else {

                editButton.style.display =
                    "none";
            }
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE PROJECT BUTTON
        |--------------------------------------------------------------------------
        */

        const createButton =
            document.querySelector(
                "#page-project button[onclick=\"openModal('create-project')\"]"
            );


        if (createButton) {

            if (
                status === "Approved" ||
                status === "In Progress" ||
                status === "Completed"
            ) {

                createButton.style.display =
                    "none";

            } else {

                createButton.style.display =
                    "inline-block";
            }
        }

    } catch (error) {

        console.error(
            "My Project Error:",
            error
        );
    }
}
////////////////create project//////////////////////////

async function createProject() {

    const title =
        document.getElementById("new-project-title").value.trim();

    const description =
        document.getElementById("new-project-description").value.trim();

    const objectives =
        document.getElementById("new-project-objectives").value.trim();

    console.log({
        title,
        description,
        objectives
    });

    if(!title || !description || !objectives){
        alert("Please fill all fields");
        return;
    }

    const response = await fetch(
        "/FYPMS/api/student/create_project.php",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description,
                objectives
            })
        }
    );

    const data = await response.json();

    console.log(data);

    if(data.success){

        alert("Project Created Successfully");

        closeModalDirect();

        loadProjectPage();

    }else{

        alert(data.message);
    }
}

///////load supervisor///////////////

async function loadSupervisors() {

    try {

        const res = await fetch(
            "api/student/get_supervisors.php",
            {
                credentials: "same-origin"
            }
        );

        const text = await res.text();

        console.log("Supervisors Response:", text);

        const data = JSON.parse(text);

        if (!data.success) {
            alert(data.message || "Failed to load supervisors");
            return;
        }

        const select = document.getElementById(
            "project-supervisor-select"
        );

        if (!select) {
            console.error(
                "project-supervisor-select not found"
            );
            return;
        }

        let html =
            '<option value="">Select Supervisor</option>';

        data.supervisors.forEach((s) => {

            html += `
                <option value="${s.id}">
                    ${s.fullname} (${s.department})
                </option>
            `;
        });

        select.innerHTML = html;

    } catch (err) {

        console.error(
            "Load Supervisors Error:",
            err
        );
    }

}


    async function openEditProject(){

        document.getElementById(
            "edit-project-title"
        ).value =
            document.getElementById(
                "project-title"
            ).textContent;

        document.getElementById(
            "edit-project-description"
        ).value =
            document.getElementById(
                "project-description"
            ).textContent;

        openModal("edit-project");
    }


    async function updateProject(){

        const title =
            document.getElementById(
                "edit-project-title"
            ).value.trim();

        const description =
            document.getElementById(
                "edit-project-description"
            ).value.trim();

        const objectives =
            document.getElementById(
                "edit-project-objectives"
            ).value.trim();

        const response =
            await fetch(
                "api/student/update_project.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                        "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        objectives
                    })
                }
            );

        const data =
            await response.json();

        if(data.success){

            alert(
                "Project Updated Successfully"
            );

            closeModalDirect();

            loadProjectPage();

        }else{

            alert(data.message);
        }
    }

    ////////////LOAD SUPERVISOR DASHBOAARD////////////////////////
async function loadSupervisorDashboard(){

    try{

        const res = await fetch(
            "api/supervisor/dashboard.php",
            {
                credentials: "same-origin"
            }
        );

        const data = await res.json();

        console.log(data);

        if(!data.success){
            return;
        }

        document.getElementById(
            "sv-assigned"
        ).textContent =
            data.assigned_students;

        document.getElementById(
            "sv-pending"
        ).textContent =
            data.pending_proposals;

        document.getElementById(
            "sv-meetings"
        ).textContent =
            data.meetings;

        document.getElementById(
            "sv-assessments"
        ).textContent =
            data.assessments;

    }catch(err){

        console.error(
            "Dashboard Error:",
            err
        );
    }
}

function enterSystem(){

    showAuth("login");

}

///////////////////////////supevisor stundent////////////////////////


async function loadSupervisorStudents(){

    try{

        console.log("loadSupervisorStudents running");

        const res = await fetch(
            "api/supervisor/students.php",
            {
                credentials: "same-origin"
            }
        );

        const data = await res.json();

        console.log("Students API Response:", data);

        if(!data.success){
            alert(data.message || "Failed to load students");
            return;
        }

        if(data.students.length === 0){

            document.getElementById(
                "sv-students-container"
            ).innerHTML = `
                <div class="section-card">
                    No students assigned
                </div>
            `;

            return;
        }

        let html = "";

        data.students.forEach(student => {

            html += `
            <div class="student-card">

                <div class="student-card-top">

                    <div class="student-info">

                        <div>
                            <div style="
                                font-weight:800;
                                font-size:15px;
                                color:#0F2D52">
                                ${student.fullname}
                            </div>

                            <div style="
                                font-size:12px;
                                color:#8AA0B8">
                                ${student.email}
                            </div>

                            <div style="
                                font-size:13px;
                                color:#4A5568;
                                margin-top:2px">
                                ${student.title}
                            </div>
                        </div>

                    </div>

                    <div class="student-card-actions">

                        <span class="badge">
                            ${student.status}
                        </span>

                        <button
                            class="btn btn-primary"
                            onclick="viewStudent(${student.student_id})">
                            View Details
                        </button>

                    </div>

                </div>

                <div class="student-card-progress">

                    <div class="progress-row">
                        <span>Progress</span>
                        <span>${student.progress}%</span>
                    </div>

                    <div class="progress-bar">
                        <div
                            class="progress-fill"
                            style="width:${student.progress}%;background:#1A5FA8">
                        </div>
                    </div>

                </div>

            </div>
            `;
        });

        document.getElementById(
            "sv-students-container"
        ).innerHTML = html;

    }catch(err){

        console.error("Student Load Error:", err);
    }
}

async function viewStudent(studentId) {

    try {

        const res = await fetch(
            `api/supervisor/student_details.php?student_id=${studentId}`
        );

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Failed to load student details");
            return;
        }


        const s = data.student;


        /*
        |--------------------------------------------------------------------------
        | STATUS STYLE
        |--------------------------------------------------------------------------
        */

        let statusColor = "#E67E22";
        let statusBackground = "#E67E2220";

        if (s.status === "Active") {

            statusColor = "#27AE60";
            statusBackground = "#27AE6020";

        } else if (s.status === "Completed") {

            statusColor = "#1A5FA8";
            statusBackground = "#1A5FA820";

        }


        /*
        |--------------------------------------------------------------------------
        | STUDENT DETAILS UI
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "student-details-content"
        ).innerHTML = `

            <!-- STUDENT HEADER -->

            <div style="
                display:flex;
                align-items:center;
                gap:15px;
                padding-bottom:18px;
                border-bottom:1px solid #E5EDF5;
                margin-bottom:20px;
            ">

                <div style="
                    width:52px;
                    height:52px;
                    border-radius:50%;
                    background:#EBF3FB;
                    color:#1A5FA8;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:18px;
                    font-weight:800;
                ">
                    ${(s.fullname || "S")
                        .split(" ")
                        .map(n => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                </div>


                <div>

                    <div style="
                        font-size:18px;
                        font-weight:800;
                        color:#0F2D52;
                    ">
                        ${s.fullname}
                    </div>

                    <div style="
                        font-size:13px;
                        color:#8AA0B8;
                        margin-top:3px;
                    ">
                        ${s.email}
                    </div>

                </div>

            </div>


            <!-- STUDENT INFORMATION -->

            <div style="
                font-size:15px;
                font-weight:800;
                color:#0F2D52;
                margin-bottom:12px;
            ">
                Student Information
            </div>


            <div style="
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:12px;
                margin-bottom:24px;
            ">

                <div style="
                    background:#F7FAFD;
                    padding:12px;
                    border-radius:8px;
                ">

                    <div style="
                        font-size:11px;
                        color:#8AA0B8;
                        margin-bottom:4px;
                    ">
                        Matric No
                    </div>

                    <div style="
                        font-size:13px;
                        font-weight:700;
                        color:#1A1A2E;
                    ">
                        ${s.matric_no || "-"}
                    </div>

                </div>


                <div style="
                    background:#F7FAFD;
                    padding:12px;
                    border-radius:8px;
                ">

                    <div style="
                        font-size:11px;
                        color:#8AA0B8;
                        margin-bottom:4px;
                    ">
                        Department
                    </div>

                    <div style="
                        font-size:13px;
                        font-weight:700;
                        color:#1A1A2E;
                    ">
                        ${s.department || "-"}
                    </div>

                </div>

            </div>


            <!-- PROJECT INFORMATION -->

            <div style="
                font-size:15px;
                font-weight:800;
                color:#0F2D52;
                margin-bottom:12px;
            ">
                Project Information
            </div>


            <div style="
                border:1px solid #E5EDF5;
                border-radius:10px;
                padding:16px;
                margin-bottom:20px;
            ">

                <div style="
                    font-size:15px;
                    font-weight:800;
                    color:#0F2D52;
                    line-height:1.5;
                    margin-bottom:14px;
                ">
                    ${s.title || "-"}
                </div>


                <div style="
                    display:flex;
                    align-items:center;
                    gap:10px;
                    margin-bottom:14px;
                ">

                    <span style="
                        font-size:11px;
                        color:#8AA0B8;
                    ">
                        Status
                    </span>

                    <span
                        class="badge"
                        style="
                            background:${statusBackground};
                            color:${statusColor};
                        "
                    >
                        ${s.status || "-"}
                    </span>

                </div>


                <!-- PROGRESS -->

                <div style="margin-bottom:16px;">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        font-size:12px;
                        color:#4A5568;
                        margin-bottom:6px;
                    ">

                        <span>
                            Project Progress
                        </span>

                        <strong>
                            ${s.progress || 0}%
                        </strong>

                    </div>


                    <div style="
                        height:8px;
                        background:#EAF0F6;
                        border-radius:10px;
                        overflow:hidden;
                    ">

                        <div style="
                            width:${s.progress || 0}%;
                            height:100%;
                            background:#1A5FA8;
                            border-radius:10px;
                        "></div>

                    </div>

                </div>


                <!-- DESCRIPTION -->

                <div style="margin-bottom:16px;">

                    <div style="
                        font-size:12px;
                        font-weight:700;
                        color:#4A5568;
                        margin-bottom:5px;
                    ">
                        Description
                    </div>

                    <div style="
                        font-size:13px;
                        line-height:1.6;
                        color:#4A5568;
                    ">
                        ${s.description || "-"}
                    </div>

                </div>


                <!-- OBJECTIVES -->

                <div>

                    <div style="
                        font-size:12px;
                        font-weight:700;
                        color:#4A5568;
                        margin-bottom:5px;
                    ">
                        Objectives
                    </div>

                    <div style="
                        font-size:13px;
                        line-height:1.6;
                        color:#4A5568;
                    ">
                        ${s.objectives || "-"}
                    </div>

                </div>

            </div>

        `;


        /*
        |--------------------------------------------------------------------------
        | APPROVE / REJECT BUTTONS
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            "approve-btn"
        ).setAttribute(
            "onclick",
            `approveProject(${s.project_id})`
        );


        document.getElementById(
            "reject-btn"
        ).setAttribute(
            "onclick",
            `rejectProject(${s.project_id})`
        );


        /*
        |--------------------------------------------------------------------------
        | OPEN MODAL
        |--------------------------------------------------------------------------
        */

        openModal("student-details");


    } catch (err) {

        console.error(
            "Failed to load student details:",
            err
        );

    }

}

// ============================================================
// SUPERVISOR PROJECT PROPOSALS
// ============================================================

async function reviewProject(projectId, action) {

    if (!projectId) {
        alert("Invalid project.");
        return;
    }

    let message = "";

    if (action === "accept") {
        message =
            "Accept this project proposal?\n\n" +
            "The student will be assigned to you and the 6 project milestones will be created automatically.";
    }

    if (action === "reject") {
        message =
            "Reject this project proposal?\n\n" +
            "The student will be notified and will be able to submit another proposal.";
    }

    if (!confirm(message)) {
        return;
    }

    try {

        const response = await fetch(
            "api/supervisor/assign_project.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    project_id: projectId,
                    action: action
                })
            }
        );

        const data = await response.json();

        console.log("PROJECT REVIEW:", data);

        if (!data.success) {
            alert(
                data.message ||
                "Unable to process project proposal."
            );
            return;
        }

        if (action === "accept") {

            alert(
                data.message ||
                "Project proposal accepted successfully."
            );

        } else {

            alert(
                data.message ||
                "Project proposal rejected."
            );
        }

        await loadSupervisorProposals();

        if (typeof loadSupervisorDashboard === "function") {
            await loadSupervisorDashboard();
        }

        if (typeof loadSupervisorStudents === "function") {
            await loadSupervisorStudents();
        }

    } catch (error) {

        console.error(
            "PROJECT REVIEW ERROR:",
            error
        );

        alert(
            "Something went wrong while processing the project proposal."
        );
    }
}


// Keep old function name available in case another part of
// the HTML still calls assignProject().
async function assignProject(projectId) {

    await reviewProject(
        projectId,
        "accept"
    );
}


async function loadSupervisorProposals() {

    const container =
        document.getElementById(
            "sv-proposals-container"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="section-card">
            Loading project proposals...
        </div>
    `;

    try {

        const response = await fetch(
            "api/supervisor/proposals.php",
            {
                credentials: "same-origin"
            }
        );

        const data =
            await response.json();

        console.log(
            "SUPERVISOR PROPOSALS:",
            data
        );

        if (!data.success) {

            container.innerHTML = `
                <div class="section-card">
                    ${
                        data.message ||
                        "Unable to load project proposals."
                    }
                </div>
            `;

            return;
        }

        let html = "";

        // =====================================================
        // PENDING PROJECTS
        // =====================================================

        if (
            data.pending &&
            data.pending.length > 0
        ) {

            html += `
                <div
                    class="section-title"
                    style="margin-bottom:15px"
                >
                    Pending Project Proposals
                </div>
            `;

            data.pending.forEach(project => {

                html += `
                    <div
                        class="proposal-card"
                        style="
                            border-left:4px solid #E67E22;
                            margin-bottom:15px;
                        "
                    >

                        <div class="proposal-top">

                            <div>

                                <span
                                    class="badge"
                                    style="
                                        background:#E67E2220;
                                        color:#E67E22;
                                    "
                                >
                                    Pending Review
                                </span>

                                <div class="proposal-title">
                                    ${escapeHtml(
                                        project.title ||
                                        "Untitled Project"
                                    )}
                                </div>

                                <div class="proposal-submitter">
                                    Student:
                                    ${escapeHtml(
                                        project.fullname ||
                                        "Unknown Student"
                                    )}
                                </div>

                                ${
                                    project.matric_no
                                    ?
                                    `
                                    <div
                                        style="
                                            font-size:12px;
                                            color:#8AA0B8;
                                            margin-top:4px;
                                        "
                                    >
                                        Matric:
                                        ${escapeHtml(
                                            project.matric_no
                                        )}
                                    </div>
                                    `
                                    :
                                    ""
                                }

                            </div>

                            <div
                                class="proposal-actions"
                                style="
                                    display:flex;
                                    gap:8px;
                                    flex-wrap:wrap;
                                "
                            >

                                <button
                                    class="btn btn-success"
                                    onclick="
                                        reviewProject(
                                            ${project.id},
                                            'accept'
                                        )
                                    "
                                >
                                    ✓ Accept
                                </button>

                                <button
                                    class="btn btn-outline"
                                    onclick="
                                        reviewProject(
                                            ${project.id},
                                            'reject'
                                        )
                                    "
                                >
                                    ✕ Reject
                                </button>

                            </div>

                        </div>

                        <p class="proposal-desc">
                            ${escapeHtml(
                                project.description ||
                                "No description provided."
                            )}
                        </p>

                        ${
                            project.objectives
                            ?
                            `
                            <div
                                style="
                                    margin-top:10px;
                                    font-size:13px;
                                    color:#4A5568;
                                "
                            >
                                <strong>Objectives:</strong>
                                <div
                                    style="
                                        margin-top:5px;
                                        white-space:pre-line;
                                    "
                                >
                                    ${escapeHtml(
                                        project.objectives
                                    )}
                                </div>
                            </div>
                            `
                            :
                            ""
                        }

                    </div>
                `;
            });

        } else {

            html += `
                <div class="section-card">

                    <div
                        style="
                            text-align:center;
                            padding:25px;
                            color:#8AA0B8;
                        "
                    >
                        <div
                            style="
                                font-size:32px;
                                margin-bottom:8px;
                            "
                        >
                            📄
                        </div>

                        <div
                            style="
                                font-weight:600;
                                color:#4A5568;
                            "
                        >
                            No pending project proposals
                        </div>

                        <div
                            style="
                                font-size:13px;
                                margin-top:5px;
                            "
                        >
                            New student proposals will appear here.
                        </div>
                    </div>

                </div>
            `;
        }


        // =====================================================
        // ASSIGNED PROJECTS
        // =====================================================

        if (
            data.assigned &&
            data.assigned.length > 0
        ) {

            html += `
                <div
                    class="section-title"
                    style="
                        margin-top:25px;
                        margin-bottom:15px;
                    "
                >
                    My Assigned Projects
                </div>
            `;

            data.assigned.forEach(project => {

                html += `
                    <div
                        class="proposal-card"
                        style="
                            border-left:4px solid #27AE60;
                            margin-bottom:15px;
                        "
                    >

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                align-items:flex-start;
                                gap:15px;
                            "
                        >

                            <div>

                                <span
                                    class="badge"
                                    style="
                                        background:#27AE6020;
                                        color:#27AE60;
                                    "
                                >
                                    ${escapeHtml(
                                        project.status ||
                                        "Assigned"
                                    )}
                                </span>

                                <div class="proposal-title">
                                    ${escapeHtml(
                                        project.title ||
                                        "Untitled Project"
                                    )}
                                </div>

                                <div class="proposal-submitter">
                                    Student:
                                    ${escapeHtml(
                                        project.fullname ||
                                        "Unknown Student"
                                    )}
                                </div>

                            </div>

                        </div>

                        <p class="proposal-desc">
                            ${escapeHtml(
                                project.description ||
                                "No description provided."
                            )}
                        </p>

                    </div>
                `;
            });
        }

        container.innerHTML = html;

    } catch (error) {

        console.error(
            "LOAD SUPERVISOR PROPOSALS ERROR:",
            error
        );

        container.innerHTML = `
            <div class="section-card">
                Unable to load project proposals.
                Please refresh and try again.
            </div>
        `;
    }
}


////////////////////view student details////////////////
//////////////////// VIEW STUDENT DETAILS ////////////////////

async function viewStudent(studentId) {

    if (!studentId) {

        alert("Invalid student.");

        return;
    }


    localStorage.setItem(
        "selectedStudent",
        studentId
    );


    showPage(
        "sv-student-details"
    );


    await loadStudentDetails();
}


async function loadStudentDetails() {

    const container =
        document.getElementById(
            "sv-student-details-container"
        );


    if (!container) {
        return;
    }


    const studentId =
        localStorage.getItem(
            "selectedStudent"
        );


    if (!studentId) {

        container.innerHTML = `
            <div class="section-card">
                <div style="
                    text-align:center;
                    padding:40px;
                    color:#8AA0B8;
                ">
                    Student not selected.
                </div>
            </div>
        `;

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    container.innerHTML = `
        <div class="section-card">
            <div style="
                text-align:center;
                padding:50px;
                color:#8AA0B8;
            ">

                <div style="
                    font-size:30px;
                    margin-bottom:12px;
                ">
                    ⏳
                </div>

                Loading student details...

            </div>
        </div>
    `;


    try {

        const res = await fetch(
            `api/supervisor/student_details.php?student_id=${studentId}`,
            {
                credentials: "same-origin"
            }
        );


        const data =
            await res.json();


        console.log(
            "STUDENT DETAILS:",
            data
        );


        if (!data.success) {

            container.innerHTML = `
                <div class="section-card">

                    <div style="
                        padding:30px;
                        text-align:center;
                        color:#C0392B;
                    ">
                        ${escapeHtml(
                            data.message ||
                            "Unable to load student details."
                        )}
                    </div>

                </div>
            `;

            return;
        }


        const student =
            data.student || {};

        const project =
            data.project || null;

        const milestones =
            data.milestones || [];

        const meetings =
            data.meetings || [];

        const currentMilestone =
            data.current_milestone || null;


        /*
        |--------------------------------------------------------------------------
        | INITIALS
        |--------------------------------------------------------------------------
        */

        const initials =
            (student.fullname || "Student")
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(
                    name => name.charAt(0)
                )
                .join("")
                .toUpperCase();


        /*
        |--------------------------------------------------------------------------
        | PROJECT STATUS
        |--------------------------------------------------------------------------
        */

        let projectStatusColor =
            "#E67E22";

        let projectStatusBackground =
            "#FFF3E8";


        if (
            project &&
            project.status === "Approved"
        ) {

            projectStatusColor =
                "#1A5FA8";

            projectStatusBackground =
                "#EAF3FB";
        }


        if (
            project &&
            project.status === "In Progress"
        ) {

            projectStatusColor =
                "#1A5FA8";

            projectStatusBackground =
                "#EAF3FB";
        }


        if (
            project &&
            project.status === "Completed"
        ) {

            projectStatusColor =
                "#27AE60";

            projectStatusBackground =
                "#EAF8EF";
        }


        /*
        |--------------------------------------------------------------------------
        | CURRENT CHAPTER
        |--------------------------------------------------------------------------
        */

        const currentChapter =
            currentMilestone
                ? currentMilestone.title
                : (
                    project &&
                    project.status === "Completed"
                        ? "Project Completed"
                        : "No active milestone"
                );


        /*
        |--------------------------------------------------------------------------
        | COMPLETED MILESTONES
        |--------------------------------------------------------------------------
        */

        const completedCount =
            milestones.filter(
                milestone =>
                    milestone.status === "Completed"
            ).length;


        const totalMilestones =
            milestones.length;


        /*
        |--------------------------------------------------------------------------
        | PROJECT SECTION
        |--------------------------------------------------------------------------
        */

        let projectHtml = "";


        if (!project) {

            projectHtml = `

                <div style="
                    padding:25px;
                    text-align:center;
                    color:#8AA0B8;
                ">

                    <div style="
                        font-size:32px;
                        margin-bottom:10px;
                    ">
                        📁
                    </div>

                    <strong>
                        No active project
                    </strong>

                    <div style="
                        margin-top:5px;
                        font-size:13px;
                    ">
                        This student does not currently have
                        an approved project assigned to you.
                    </div>

                </div>

            `;

        } else {

            projectHtml = `

                <!-- PROJECT HEADER -->

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:20px;
                    flex-wrap:wrap;
                    margin-bottom:22px;
                ">

                    <div style="
                        flex:1;
                        min-width:240px;
                    ">

                        <div style="
                            font-size:20px;
                            font-weight:800;
                            color:#0F2D52;
                            margin-bottom:7px;
                        ">
                            ${escapeHtml(
                                project.title ||
                                "Untitled Project"
                            )}
                        </div>

                        <div style="
                            font-size:13px;
                            color:#8AA0B8;
                        ">
                            Final Year Project
                        </div>

                    </div>


                    <span style="
                        display:inline-flex;
                        align-items:center;
                        padding:7px 12px;
                        border-radius:20px;
                        font-size:12px;
                        font-weight:700;
                        background:${projectStatusBackground};
                        color:${projectStatusColor};
                    ">
                        ${escapeHtml(
                            project.status ||
                            "Unknown"
                        )}
                    </span>

                </div>


                <!-- PROJECT STATS -->

                <div style="
                    display:grid;
                    grid-template-columns:
                        repeat(auto-fit,minmax(150px,1fr));
                    gap:12px;
                    margin-bottom:22px;
                ">


                    <div style="
                        padding:15px;
                        background:#F7FAFD;
                        border-radius:10px;
                    ">

                        <div style="
                            font-size:11px;
                            color:#8AA0B8;
                            margin-bottom:6px;
                        ">
                            Overall Progress
                        </div>

                        <div style="
                            font-size:22px;
                            font-weight:800;
                            color:#1A5FA8;
                        ">
                            ${Number(
                                project.progress || 0
                            )}%
                        </div>

                    </div>


                    <div style="
                        padding:15px;
                        background:#F7FAFD;
                        border-radius:10px;
                    ">

                        <div style="
                            font-size:11px;
                            color:#8AA0B8;
                            margin-bottom:6px;
                        ">
                            Milestones
                        </div>

                        <div style="
                            font-size:22px;
                            font-weight:800;
                            color:#1A5FA8;
                        ">
                            ${completedCount}/${totalMilestones}
                        </div>

                    </div>


                    <div style="
                        padding:15px;
                        background:#F7FAFD;
                        border-radius:10px;
                    ">

                        <div style="
                            font-size:11px;
                            color:#8AA0B8;
                            margin-bottom:6px;
                        ">
                            Current Chapter
                        </div>

                        <div style="
                            font-size:15px;
                            font-weight:800;
                            color:#0F2D52;
                        ">
                            ${escapeHtml(
                                currentChapter
                            )}
                        </div>

                    </div>

                </div>


                <!-- PROGRESS BAR -->

                <div style="
                    margin-bottom:25px;
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin-bottom:7px;
                        font-size:12px;
                        color:#66788A;
                    ">

                        <span>
                            Project Progress
                        </span>

                        <strong>
                            ${Number(
                                project.progress || 0
                            )}%
                        </strong>

                    </div>

                    <div style="
                        height:8px;
                        background:#EAF0F5;
                        border-radius:20px;
                        overflow:hidden;
                    ">

                        <div style="
                            height:100%;
                            width:${Number(
                                project.progress || 0
                            )}%;
                            background:#1A5FA8;
                            border-radius:20px;
                        "></div>

                    </div>

                </div>


                <!-- DESCRIPTION -->

                <div style="
                    margin-bottom:20px;
                ">

                    <div style="
                        font-size:13px;
                        font-weight:800;
                        color:#0F2D52;
                        margin-bottom:7px;
                    ">
                        Project Description
                    </div>

                    <div style="
                        font-size:13px;
                        line-height:1.7;
                        color:#536579;
                        background:#F7FAFD;
                        padding:15px;
                        border-radius:10px;
                    ">
                        ${escapeHtml(
                            project.description ||
                            "No description provided."
                        )}
                    </div>

                </div>


                <!-- OBJECTIVES -->

                <div>

                    <div style="
                        font-size:13px;
                        font-weight:800;
                        color:#0F2D52;
                        margin-bottom:7px;
                    ">
                        Project Objectives
                    </div>

                    <div style="
                        font-size:13px;
                        line-height:1.7;
                        color:#536579;
                        background:#F7FAFD;
                        padding:15px;
                        border-radius:10px;
                        white-space:pre-line;
                    ">
                        ${escapeHtml(
                            project.objectives ||
                            "No objectives provided."
                        )}
                    </div>

                </div>

            `;
        }


        /*
        |--------------------------------------------------------------------------
        | MILESTONES
        |--------------------------------------------------------------------------
        */

        let milestonesHtml = "";


        if (milestones.length === 0) {

            milestonesHtml = `

                <div style="
                    padding:30px;
                    text-align:center;
                    color:#8AA0B8;
                ">

                    No milestones found.

                </div>

            `;

        } else {

            milestonesHtml =
                milestones.map(
                    (milestone, index) => {

                        const status =
                            milestone.status ||
                            "Pending";


                        const progress =
                            Number(
                                milestone.progress || 0
                            );


                        let statusColor =
                            "#8A96A3";

                        let statusBackground =
                            "#F2F4F7";

                        let icon =
                            "○";


                        if (
                            status === "Active"
                        ) {

                            statusColor =
                                "#1A5FA8";

                            statusBackground =
                                "#EAF3FB";

                            icon = "●";
                        }


                        if (
                            status === "Inconclusive"
                        ) {

                            statusColor =
                                "#C27A00";

                            statusBackground =
                                "#FFF8E6";

                            icon = "!";
                        }


                        if (
                            status === "Completed"
                        ) {

                            statusColor =
                                "#27AE60";

                            statusBackground =
                                "#EAF8EF";

                            icon = "✓";
                        }


                        const documentName =
                            milestone.document
                                ? String(
                                    milestone.document
                                )
                                    .split("/")
                                    .pop()
                                : "";


                        return `

                            <div style="
                                position:relative;
                                padding:18px;
                                border:1px solid #E5EDF5;
                                border-radius:12px;
                                margin-bottom:12px;
                                background:#fff;
                            ">

                                <div style="
                                    display:flex;
                                    gap:14px;
                                    align-items:flex-start;
                                ">


                                    <!-- NUMBER -->

                                    <div style="
                                        width:38px;
                                        height:38px;
                                        min-width:38px;
                                        border-radius:50%;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        background:${statusBackground};
                                        color:${statusColor};
                                        font-weight:800;
                                        font-size:14px;
                                    ">
                                        ${milestone.milestone_no || index + 1}
                                    </div>


                                    <!-- CONTENT -->

                                    <div style="
                                        flex:1;
                                        min-width:0;
                                    ">

                                        <div style="
                                            display:flex;
                                            justify-content:space-between;
                                            gap:10px;
                                            align-items:flex-start;
                                            flex-wrap:wrap;
                                        ">

                                            <div>

                                                <div style="
                                                    font-size:15px;
                                                    font-weight:800;
                                                    color:#0F2D52;
                                                ">
                                                    ${escapeHtml(
                                                        milestone.title ||
                                                        "Milestone"
                                                    )}
                                                </div>

                                                <div style="
                                                    margin-top:4px;
                                                    font-size:12px;
                                                    color:#8AA0B8;
                                                ">
                                                    ${escapeHtml(
                                                        milestone.description ||
                                                        ""
                                                    )}
                                                </div>

                                            </div>


                                            <span style="
                                                padding:6px 10px;
                                                border-radius:15px;
                                                font-size:11px;
                                                font-weight:700;
                                                background:${statusBackground};
                                                color:${statusColor};
                                            ">
                                                ${icon}
                                                ${escapeHtml(status)}
                                            </span>

                                        </div>


                                        <!-- PROGRESS -->

                                        <div style="
                                            margin-top:15px;
                                        ">

                                            <div style="
                                                display:flex;
                                                justify-content:space-between;
                                                font-size:11px;
                                                color:#8AA0B8;
                                                margin-bottom:5px;
                                            ">

                                                <span>
                                                    Progress
                                                </span>

                                                <strong>
                                                    ${progress}%
                                                </strong>

                                            </div>

                                            <div style="
                                                height:6px;
                                                background:#EDF2F7;
                                                border-radius:10px;
                                                overflow:hidden;
                                            ">

                                                <div style="
                                                    height:100%;
                                                    width:${progress}%;
                                                    background:${statusColor};
                                                    border-radius:10px;
                                                "></div>

                                            </div>

                                        </div>


                                        <!-- META -->

                                        <div style="
                                            display:flex;
                                            flex-wrap:wrap;
                                            gap:18px;
                                            margin-top:14px;
                                            font-size:12px;
                                            color:#66788A;
                                        ">

                                            <span>
                                                <strong>
                                                    Due:
                                                </strong>
                                                ${milestone.due_date || "Not set"}
                                            </span>


                                            <span>
                                                <strong>
                                                    Document:
                                                </strong>

                                                ${
                                                    documentName
                                                        ? escapeHtml(
                                                            documentName
                                                        )
                                                        : "Not submitted"
                                                }

                                            </span>

                                        </div>


                                        ${
                                            milestone.document
                                                ? `
                                                    <div style="
                                                        margin-top:12px;
                                                    ">

                                                        <a
                                                            href="${escapeHtml(
                                                                milestone.document
                                                            )}"
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            class="btn btn-outline"
                                                            style="
                                                                display:inline-block;
                                                                text-decoration:none;
                                                            "
                                                        >
                                                            View Document
                                                        </a>

                                                    </div>
                                                `
                                                : ""
                                        }

                                    </div>

                                </div>

                            </div>

                        `;
                    }
                ).join("");
        }


        /*
        |--------------------------------------------------------------------------
        | MEETING HISTORY
        |--------------------------------------------------------------------------
        */

        let meetingsHtml = "";


        if (meetings.length === 0) {

            meetingsHtml = `

                <div style="
                    padding:25px;
                    text-align:center;
                    color:#8AA0B8;
                ">

                    No meeting history yet.

                </div>

            `;

        } else {

            meetingsHtml =
                meetings.map(
                    meeting => {

                        let color =
                            "#E67E22";

                        let background =
                            "#FFF3E8";


                        if (
                            meeting.status === "Completed"
                        ) {

                            color =
                                "#27AE60";

                            background =
                                "#EAF8EF";
                        }


                        if (
                            meeting.status === "Inconclusive"
                        ) {

                            color =
                                "#C27A00";

                            background =
                                "#FFF8E6";
                        }


                        if (
                            meeting.status === "Pending"
                        ) {

                            color =
                                "#1A5FA8";

                            background =
                                "#EAF3FB";
                        }


                        let formattedDate =
                            "Date not available";


                        if (
                            meeting.meeting_date
                        ) {

                            const date =
                                new Date(
                                    meeting.meeting_date
                                );


                            if (
                                !isNaN(
                                    date.getTime()
                                )
                            ) {

                                formattedDate =
                                    date.toLocaleString(
                                        "en-US",
                                        {
                                            year:
                                                "numeric",
                                            month:
                                                "short",
                                            day:
                                                "numeric",
                                            hour:
                                                "numeric",
                                            minute:
                                                "2-digit"
                                        }
                                    );
                            }
                        }


                        return `

                            <div style="
                                border-left:4px solid ${color};
                                background:#fff;
                                border:1px solid #E5EDF5;
                                border-left-width:4px;
                                border-radius:10px;
                                padding:15px;
                                margin-bottom:10px;
                            ">

                                <div style="
                                    display:flex;
                                    justify-content:space-between;
                                    gap:10px;
                                    flex-wrap:wrap;
                                    margin-bottom:8px;
                                ">

                                    <div>

                                        <strong style="
                                            color:#0F2D52;
                                            font-size:13px;
                                        ">
                                            ${escapeHtml(
                                                meeting.milestone_title ||
                                                "Milestone"
                                            )}
                                        </strong>

                                        <div style="
                                            margin-top:4px;
                                            color:#8AA0B8;
                                            font-size:11px;
                                        ">
                                            ${formattedDate}
                                        </div>

                                    </div>


                                    <span style="
                                        padding:5px 9px;
                                        border-radius:14px;
                                        font-size:11px;
                                        font-weight:700;
                                        background:${background};
                                        color:${color};
                                    ">
                                        ${escapeHtml(
                                            meeting.status ||
                                            "Pending"
                                        )}
                                    </span>

                                </div>


                                <div style="
                                    font-size:12px;
                                    line-height:1.6;
                                    color:#536579;
                                ">

                                    <strong>
                                        Agenda:
                                    </strong>

                                    ${escapeHtml(
                                        meeting.agenda ||
                                        "No agenda provided."
                                    )}

                                </div>

                            </div>

                        `;
                    }
                ).join("");
        }


        /*
        |--------------------------------------------------------------------------
        | FINAL PAGE
        |--------------------------------------------------------------------------
        */

        container.innerHTML = `

            <!-- BACK -->

            <div style="
                margin-bottom:15px;
            ">

                <button
                    class="btn btn-outline"
                    onclick="showPage('sv-students')"
                >
                    ← Back to My Students
                </button>

            </div>


            <!-- STUDENT HEADER -->

            <div class="section-card"
                style="
                    margin-bottom:15px;
                "
            >

                <div style="
                    display:flex;
                    align-items:center;
                    gap:15px;
                ">

                    <div style="
                        width:58px;
                        height:58px;
                        min-width:58px;
                        border-radius:50%;
                        background:#EAF3FB;
                        color:#1A5FA8;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:18px;
                        font-weight:800;
                    ">
                        ${escapeHtml(initials)}
                    </div>


                    <div style="
                        flex:1;
                    ">

                        <div style="
                            font-size:20px;
                            font-weight:800;
                            color:#0F2D52;
                        ">
                            ${escapeHtml(
                                student.fullname ||
                                "Student"
                            )}
                        </div>

                        <div style="
                            margin-top:4px;
                            font-size:13px;
                            color:#8AA0B8;
                        ">
                            ${escapeHtml(
                                student.email ||
                                ""
                            )}
                        </div>

                    </div>

                </div>

            </div>


            <!-- STUDENT INFORMATION -->

            <div class="section-card"
                style="
                    margin-bottom:15px;
                "
            >

                <div style="
                    font-size:15px;
                    font-weight:800;
                    color:#0F2D52;
                    margin-bottom:15px;
                ">
                    Student Information
                </div>


                <div style="
                    display:grid;
                    grid-template-columns:
                        repeat(auto-fit,minmax(180px,1fr));
                    gap:12px;
                ">

                    <div>
                        <div style="
                            font-size:11px;
                            color:#8AA0B8;
                            margin-bottom:4px;
                        ">
                            Matric Number
                        </div>

                        <strong>
                            ${escapeHtml(
                                student.matric_no ||
                                "Not provided"
                            )}
                        </strong>
                    </div>


                    <div>
                        <div style="
                            font-size:11px;
                            color:#8AA0B8;
                            margin-bottom:4px;
                        ">
                            Phone
                        </div>

                        <strong>
                            ${escapeHtml(
                                student.phone ||
                                "Not provided"
                            )}
                        </strong>
                    </div>


                    <div>
                        <div style="
                            font-size:11px;
                            color:#8AA0B8;
                            margin-bottom:4px;
                        ">
                            Department
                        </div>

                        <strong>
                            ${escapeHtml(
                                student.department ||
                                "Not provided"
                            )}
                        </strong>
                    </div>


                    <div>
                        <div style="
                            font-size:11px;
                            color:#8AA0B8;
                            margin-bottom:4px;
                        ">
                            Level
                        </div>

                        <strong>
                            ${escapeHtml(
                                student.level ||
                                "Not provided"
                            )}
                        </strong>
                    </div>

                </div>

            </div>


            <!-- PROJECT -->

            <div class="section-card"
                style="
                    margin-bottom:15px;
                "
            >

                <div style="
                    font-size:15px;
                    font-weight:800;
                    color:#0F2D52;
                    margin-bottom:18px;
                ">
                    Project Overview
                </div>

                ${projectHtml}

            </div>


            <!-- MILESTONES -->

            <div class="section-card"
                style="
                    margin-bottom:15px;
                "
            >

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    gap:10px;
                    flex-wrap:wrap;
                    margin-bottom:18px;
                ">

                    <div>

                        <div style="
                            font-size:15px;
                            font-weight:800;
                            color:#0F2D52;
                        ">
                            Project Milestones
                        </div>

                        <div style="
                            margin-top:4px;
                            font-size:12px;
                            color:#8AA0B8;
                        ">
                            Track the student's progress through each chapter.
                        </div>

                    </div>


                    <div style="
                        font-size:12px;
                        font-weight:700;
                        color:#1A5FA8;
                    ">
                        ${completedCount}/${totalMilestones}
                        completed
                    </div>

                </div>


                ${milestonesHtml}

            </div>


            <!-- MEETING HISTORY -->

            <div class="section-card">

                <div style="
                    font-size:15px;
                    font-weight:800;
                    color:#0F2D52;
                    margin-bottom:18px;
                ">
                    Meeting History
                </div>

                ${meetingsHtml}

            </div>

        `;

    } catch (error) {

        console.error(
            "STUDENT DETAILS ERROR:",
            error
        );


        container.innerHTML = `

            <div class="section-card">

                <div style="
                    padding:30px;
                    text-align:center;
                    color:#C0392B;
                ">

                    Unable to load student details.
                    Please try again.

                </div>

            </div>

        `;
    }
}



async function loadMilestones() {

    const container =
        document.getElementById("student-milestones-container");

    if (!container) return;

    container.innerHTML = `
        <div class="section-card">
            Loading milestones...
        </div>
    `;

    try {

        const res = await fetch(
            "api/student/get_milestones.php"
        );

        const data = await res.json();

        console.log("MILESTONES RECEIVED:", data);

        if (!data.success) {

            container.innerHTML = `
                <div class="section-card">
                    ${data.message || "Unable to load milestones."}
                </div>
            `;

            return;
        }

        const milestones = data.milestones || [];

        if (milestones.length === 0) {

            container.innerHTML = `
                <div class="section-card">

                    <h4 style="margin-bottom:8px">
                        No Project Milestones Yet
                    </h4>

                    <p style="color:#777">
                        Your milestones will appear here after your
                        project proposal has been approved by your supervisor.
                    </p>

                </div>
            `;

            return;
        }

        let html = "";

        milestones.forEach((m, index) => {

            const status = m.status || "Pending";
            const progress = Number(m.progress || 0);

            let statusColor = "#E67E22";
            let statusBackground = "#FFF3E8";

            if (status === "Active") {

                statusColor = "#1A5FA8";
                statusBackground = "#EAF3FB";

            } else if (status === "Completed") {

                statusColor = "#27AE60";
                statusBackground = "#EAF8EF";

            } else if (status === "Inconclusive") {

                statusColor = "#C27A00";
                statusBackground = "#FFF8E6";

            }

            const isActive =
                status === "Active" ||
                status === "Inconclusive";

            const hasDocument =
                m.document &&
                String(m.document).trim() !== "";

            const isCompleted =
                status === "Completed";

            let actionHtml = "";

            /*
             * COMPLETED
             */
            if (isCompleted) {

                actionHtml = `
                    <div
                        style="
                            padding:10px 12px;
                            background:#EAF8EF;
                            color:#27AE60;
                            border-radius:8px;
                            font-size:13px;
                            font-weight:600;
                        "
                    >
                        ✓ Milestone Completed
                    </div>
                `;

            /*
             * ACTIVE / INCONCLUSIVE
             */
            } else if (isActive) {

                actionHtml = `

                    <div
                        style="
                            display:flex;
                            flex-wrap:wrap;
                            gap:10px;
                            margin-top:15px;
                        "
                    >

                        <button
                            class="btn btn-primary"
                            onclick="openMilestoneModal(${m.id})"
                        >
                            ${hasDocument ? "Update Document" : "Upload Document"}
                        </button>

                        ${
                            hasDocument
                            ?
                            `
                            <button
                                class="btn btn-outline"
                                onclick="requestMilestoneMeeting(${m.id})"
                            >
                                Request Meeting
                            </button>
                            `
                            :
                            `
                            <button
                                class="btn btn-outline"
                                disabled
                                title="Upload your document first"
                            >
                                Request Meeting
                            </button>
                            `
                        }

                    </div>

                `;

            /*
             * PENDING
             */
            } else {

                const previousCompleted =
                    index === 0 ||
                    milestones[index - 1].status === "Completed";

                if (previousCompleted) {

                    actionHtml = `
                        <button
                            class="btn btn-primary"
                            onclick="startMilestone(${m.id})"
                        >
                            Start Milestone
                        </button>
                    `;

                } else {

                    actionHtml = `
                        <div
                            style="
                                padding:10px 12px;
                                background:#f5f5f5;
                                color:#888;
                                border-radius:8px;
                                font-size:13px;
                            "
                        >
                            🔒 Complete the previous milestone first
                        </div>
                    `;
                }
            }

            html += `

                <div
                    class="section-card"
                    style="
                        margin-bottom:15px;
                        border-left:4px solid ${statusColor};
                    "
                >

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:flex-start;
                            gap:15px;
                            margin-bottom:12px;
                        "
                    >

                        <div>

                            <div
                                style="
                                    font-size:12px;
                                    color:#888;
                                    margin-bottom:4px;
                                "
                            >
                                Milestone ${m.milestone_no || index + 1}
                            </div>

                            <h4 style="margin:0">
                                ${escapeHtml(m.title || "Untitled Milestone")}
                            </h4>

                        </div>

                        <span
                            style="
                                background:${statusBackground};
                                color:${statusColor};
                                padding:5px 10px;
                                border-radius:20px;
                                font-size:12px;
                                font-weight:600;
                                white-space:nowrap;
                            "
                        >
                            ${escapeHtml(status)}
                        </span>

                    </div>

                    <p
                        style="
                            margin-bottom:12px;
                            color:#666;
                            line-height:1.6;
                        "
                    >
                        ${escapeHtml(
                            m.description || "No description available."
                        )}
                    </p>

                    <div
                        style="
                            display:flex;
                            flex-wrap:wrap;
                            gap:20px;
                            font-size:13px;
                            color:#777;
                            margin-bottom:12px;
                        "
                    >

                        ${
                            hasDocument
                            ?
                            `
                            <span style="color:#27AE60">
                                ✓ Document submitted
                            </span>
                            `
                            :
                            `
                            <span>
                                No document submitted
                            </span>
                            `
                        }

                    </div>

                    ${
                        hasDocument
                        ?
                        `
                        <div
                            style="
                                margin-top:10px;
                                font-size:13px;
                            "
                        >
                            📄
                            <strong>Document:</strong>
                            ${escapeHtml(
                                String(m.document).split("/").pop()
                            )}
                        </div>
                        `
                        :
                        ""
                    }

                    ${actionHtml}

                </div>
            `;
        });

        container.innerHTML = html;

    } catch (err) {

        console.error("LOAD MILESTONES ERROR:", err);

        container.innerHTML = `
            <div class="section-card">

                <strong>
                    Unable to load milestones.
                </strong>

                <p style="color:#777;margin-top:8px">
                    Please refresh the page and try again.
                </p>

            </div>
        `;
    }
}
function closeMilestoneModal() {

    const milestoneModal =
        document.getElementById(
            "modal-milestone"
        );

    if (milestoneModal) {
        milestoneModal.style.display = "none";
    }

    const fileInput =
        document.getElementById(
            "mile-document"
        );

    if (fileInput) {
        fileInput.value = "";
    }

    document.getElementById(
        "modal-overlay"
    ).classList.remove("open");
}

async function loadStudentFeedback() {

    try {

        const res = await fetch(
            "api/student/get_feedback.php"
        );

        const data = await res.json();

        const container = document.getElementById(
            "student-feedback-container"
        );

        if (!data.success) {

            container.innerHTML = `
                <div class="section-card">
                    Unable to load feedback.
                </div>
            `;

            return;
        }

        if (data.feedback.length === 0) {

            container.innerHTML = `
                <div class="section-card">

                    <div style="
                        text-align:center;
                        padding:30px;
                        color:#8AA0B8;
                    ">
                        No supervisor feedback yet.
                    </div>

                </div>
            `;

            return;
        }

        let html = "";

        data.feedback.forEach(f => {

            html += `
                <div
                    class="feedback-card"
                    style="border-left:4px solid #D6E4F7"
                >

                    <div class="feedback-header">

                        <div class="feedback-meta">

                            <span style="
                                font-weight:700;
                                font-size:14px;
                                color:#0F2D52;
                            ">
                                ${f.supervisor_name || "Supervisor"}
                            </span>

                            <span
                                class="badge"
                                style="
                                    background:#3B8DD620;
                                    color:#3B8DD6;
                                "
                            >
                                ${f.milestone_title || "Project"}
                            </span>

                        </div>

                        <span style="
                            font-size:12px;
                            color:#8AA0B8;
                        ">
                            ${f.created_at}
                        </span>

                    </div>

                    <p class="feedback-text">
                        ${f.comment}
                    </p>

                </div>
            `;

        });

        container.innerHTML = html;

    } catch (error) {

        console.error("Feedback error:", error);

        document.getElementById(
            "student-feedback-container"
        ).innerHTML = `
            <div class="section-card">
                Failed to load feedback.
            </div>
        `;

    }

}

// ============================================================
// LOAD ELIGIBLE MEETING MILESTONES
// ============================================================

async function loadMeetingMilestones() {

    const select =
        document.getElementById(
            "meeting-milestone"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Loading available milestones...
        </option>
    `;

    try {

        const response = await fetch(
            "api/student/get_meeting_milestones.php"
        );

        const data =
            await response.json();

        if (!data.success) {

            select.innerHTML = `
                <option value="">
                    Unable to load milestones
                </option>
            `;

            return;
        }

        const milestones =
            data.milestones || [];

        const eligible =
            milestones.filter(m =>
                m.document &&
                m.can_request_meeting !== false
            );

        select.innerHTML = `
            <option value="">
                Select milestone
            </option>
        `;

        if (eligible.length === 0) {

            select.innerHTML = `
                <option value="">
                    No milestone available for meeting
                </option>
            `;

            return;
        }

        eligible.forEach(milestone => {

            select.innerHTML += `
                <option
                    value="${milestone.id}"
                >
                    ${escapeHtml(
                        milestone.title
                    )}
                </option>
            `;

        });

    } catch (error) {

        console.error(
            "LOAD MEETING MILESTONES ERROR:",
            error
        );

        select.innerHTML = `
            <option value="">
                Failed to load milestones
            </option>
        `;
    }
}


async function requestMeeting() {

    const milestone_id =
        document.getElementById("meeting-milestone").value;

    const meeting_date =
        document.getElementById("meeting-datetime").value;

    const agenda =
        document.getElementById("meeting-agenda").value.trim();


    if (!milestone_id) {

        alert("Please select a milestone");

        return;
    }


    if (!meeting_date) {

        alert("Please select a meeting date and time");

        return;
    }


    if (!agenda) {

        alert("Please enter the meeting agenda");

        return;
    }


    try {

        const response = await fetch(
            "api/student/request_meeting.php",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    milestone_id: milestone_id,

                    meeting_date: meeting_date,

                    agenda: agenda

                })
            }
        );


        const data = await response.json();


        if (!data.success) {

            alert(data.message || "Failed to request meeting");

            return;
        }


        alert("Meeting request sent successfully");


        // Clear form

        document.getElementById(
            "meeting-milestone"
        ).value = "";

        document.getElementById(
            "meeting-datetime"
        ).value = "";

        document.getElementById(
            "meeting-agenda"
        ).value = "";


        closeModalDirect();


        // Later we'll reload meetings here

        loadMeetings();


    } catch (error) {

        console.error(error);

        alert("Something went wrong while requesting the meeting");

    }

}

async function startMilestone(id) {

    if (!id) {
        alert("Invalid milestone.");
        return;
    }

    const confirmed = confirm(
        "Start this milestone?\n\n" +
        "Once started, this becomes your current chapter."
    );

    if (!confirmed) {
        return;
    }

    try {

        const res = await fetch(
            "api/student/create_milestone.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id
                })
            }
        );

        const data = await res.json();

        console.log("START MILESTONE:", data);

        if (!data.success) {

            alert(
                data.message ||
                "Unable to start milestone."
            );

            return;
        }

        alert(
            data.message ||
            "Milestone started successfully."
        );

        await loadMilestones();

    } catch (err) {

        console.error(
            "START MILESTONE ERROR:",
            err
        );

        alert(
            "Unable to start milestone. Please try again."
        );
    }
}

async function openMilestoneModal(id) {

    if (!id) {
        alert("Invalid milestone.");
        return;
    }

    try {

        const res = await fetch(
            "api/student/get_single_milestone.php?id=" + id
        );

        const data = await res.json();

        console.log("SINGLE MILESTONE:", data);

        if (!data.success) {

            alert(
                data.message ||
                "Unable to load milestone."
            );

            return;
        }

        const milestone =
            data.milestone || data.data;

        if (!milestone) {

            alert("Milestone information not found.");
            return;
        }

        document.getElementById(
            "milestone-modal-title"
        ).innerText =
            milestone.document
                ? "Update Milestone Document"
                : "Upload Milestone Document";

        document.getElementById(
            "milestone-modal-message"
        ).innerText =
            milestone.document
                ? "Your document has already been submitted. You can upload an updated version if corrections are required."
                : "Upload your completed chapter document before requesting a supervisor meeting.";

        document.getElementById(
            "milestone-selected-id"
        ).value = milestone.id;

        document.getElementById(
            "mile-title"
        ).value =
            milestone.title || "";

        document.getElementById(
            "mile-description"
        ).value =
            milestone.description || "";

        const currentDocument =
            document.getElementById(
                "current-milestone-document"
            );

        if (milestone.document) {

            currentDocument.innerHTML = `
                Current document:
                <strong>
                    ${escapeHtml(
                        String(milestone.document)
                            .split("/")
                            .pop()
                    )}
                </strong>
            `;

        } else {

            currentDocument.innerHTML =
                "No document uploaded yet.";

        }

        document.getElementById(
            "mile-document"
        ).value = "";

        document.getElementById(
            "milestone-save-btn"
        ).innerText =
            milestone.document
                ? "Update Document"
                : "Upload Document";

        const meetingModal =
            document.getElementById("modal-meeting");

        if (meetingModal) {
            meetingModal.style.display = "none";
        }

        const milestoneModal =
            document.getElementById("modal-milestone");

        if (milestoneModal) {
            milestoneModal.style.display = "block";
        }

        document.getElementById(
            "modal-overlay"
        ).classList.add("open");

    } catch (err) {

        console.error(
            "OPEN MILESTONE ERROR:",
            err
        );

        alert(
            "Unable to load milestone information."
        );
    }
}

async function saveMilestone() {

    const milestoneId =
        document.getElementById(
            "milestone-selected-id"
        ).value;

    const fileInput =
        document.getElementById(
            "mile-document"
        );

    if (!milestoneId) {

        alert("Milestone not selected.");
        return;
    }

    if (
        !fileInput.files ||
        fileInput.files.length === 0
    ) {

        alert(
            "Please select your chapter document first."
        );

        return;
    }

    const file = fileInput.files[0];

    const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {

        alert(
            "Only PDF, DOC, and DOCX files are allowed."
        );

        return;
    }

    const maxSize =
        10 * 1024 * 1024;

    if (file.size > maxSize) {

        alert(
            "The document must not be larger than 10MB."
        );

        return;
    }

    const formData =
        new FormData();

    formData.append(
        "milestone_id",
        milestoneId
    );

    formData.append(
        "document",
        file
    );

    const button =
        document.getElementById(
            "milestone-save-btn"
        );

    button.disabled = true;
    button.innerText = "Uploading...";

    try {

        const res = await fetch(
            "api/student/update_milestone.php",
            {
                method: "POST",
                body: formData
            }
        );

        const data = await res.json();

        console.log(
            "UPLOAD MILESTONE:",
            data
        );

        if (!data.success) {

            alert(
                data.message ||
                "Document upload failed."
            );

            return;
        }

        alert(
            data.message ||
            "Document uploaded successfully."
        );

        closeMilestoneModal();

        await loadMilestones();

        /*
         * Refresh meeting-related information too,
         * if the page/function exists.
         */
        if (
            typeof loadStudentMeetings === "function"
        ) {
            loadStudentMeetings();
        }

    } catch (err) {

        console.error(
            "UPLOAD DOCUMENT ERROR:",
            err
        );

        alert(
            "Document upload failed. Please try again."
        );

    } finally {

        button.disabled = false;

        button.innerText =
            "Upload Document";
    }
}

// ============================================================
// STUDENT — REQUEST MILESTONE MEETING
// ============================================================

async function requestMilestoneMeeting(milestoneId) {

    if (!milestoneId) {
        alert("Invalid milestone.");
        return;
    }

    try {

        const response = await fetch(
            "api/student/get_meeting_milestones.php"
        );

        const data =
            await response.json();

        console.log(
            "MEETING MILESTONES:",
            data
        );

        if (!data.success) {

            alert(
                data.message ||
                "Unable to verify meeting eligibility."
            );

            return;
        }

        const milestone =
            (data.milestones || []).find(
                m =>
                    Number(m.id) ===
                    Number(milestoneId)
            );

        if (!milestone) {

            alert(
                "This milestone is not currently available for a meeting request."
            );

            return;
        }

        if (!milestone.document) {

            alert(
                "Please upload your milestone document before requesting a meeting."
            );

            return;
        }

        if (
            milestone.can_request_meeting === false
        ) {

            alert(
                "A meeting request is already pending for this milestone."
            );

            return;
        }

        // Open meeting modal
        if (
            typeof openModal === "function"
        ) {

            openModal("meeting");

        } else {

            alert(
                "Meeting request form is unavailable."
            );

            return;
        }

        // Load only eligible milestones
        await loadMeetingMilestones();

        // Automatically select the clicked milestone
        const select =
            document.getElementById(
                "meeting-milestone"
            );

        if (select) {

            select.value =
                String(milestoneId);

        }

    } catch (error) {

        console.error(
            "REQUEST MEETING ERROR:",
            error
        );

        alert(
            "Unable to prepare the meeting request."
        );
    }
}

async function loadMeetings() {

    try {

        const response = await fetch(
            "api/student/get_meetings.php"
        );

        const data = await response.json();

        const container =
            document.getElementById("student-meetings-container");

        if (!container) return;


        if (!data.success) {

            container.innerHTML = `
                <div class="section-card">
                    Failed to load meetings
                </div>
            `;

            return;
        }


        if (data.meetings.length === 0) {

            container.innerHTML = `
                <div class="section-card">
                    <div style="
                        text-align:center;
                        padding:30px;
                        color:#8AA0B8;
                    ">
                        <div style="
                            font-size:35px;
                            margin-bottom:10px;
                        ">
                            📅
                        </div>

                        <div style="
                            font-weight:600;
                            color:#4A5568;
                            margin-bottom:5px;
                        ">
                            No meetings yet
                        </div>

                        <div style="font-size:13px;">
                            Request a meeting with your supervisor
                            to get started.
                        </div>
                    </div>
                </div>
            `;

            return;
        }


        let html = "";


        data.meetings.forEach(meeting => {

            let color = "#E67E22";

            if (meeting.status === "Confirmed") {
                color = "#27AE60";
            }

            if (meeting.status === "Completed") {
                color = "#1A5FA8";
            }


            const date =
                new Date(meeting.meeting_date);


            const formattedDate =
                date.toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    }
                );


            const formattedTime =
                date.toLocaleTimeString(
                    "en-US",
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );


            html += `

                <div
                    class="meeting-card"
                    style="border-left:4px solid ${color}"
                >

                    <div class="meeting-top">

                        <div>

                            <div class="meeting-date">
                                ${formattedDate}
                                ${formattedTime}
                            </div>


                            <span
                                class="badge"
                                style="
                                    background:${color}20;
                                    color:${color};
                                "
                            >
                                ${meeting.status}
                            </span>

                        </div>

                    </div>


                    <div
                        style="
                            margin-top:10px;
                            font-size:13px;
                            color:#4A5568;
                        "
                    >

                        <strong>
                            Milestone:
                        </strong>

                        ${meeting.milestone_title}

                    </div>


                    <div class="meeting-agenda">

                        <strong>
                            Agenda:
                        </strong>

                        ${meeting.agenda}

                    </div>

                </div>

            `;

        });


        container.innerHTML = html;


    } catch (error) {

        console.error(
            "Failed to load meetings:",
            error
        );


        const container =
            document.getElementById(
                "student-meetings-container"
            );


        if (container) {

            container.innerHTML = `
                <div class="section-card">
                    Failed to load meetings
                </div>
            `;

        }

    }
}


// ============================================================
// SUPERVISOR — MEETINGS
// ============================================================

async function loadSupervisorMeetings() {

    const container =
        document.getElementById(
            "supervisor-meetings-container"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="section-card">
            Loading meetings...
        </div>
    `;

    try {

        const response = await fetch(
            "api/supervisor/get_meetings.php",
            {
                credentials: "same-origin"
            }
        );

        const data =
            await response.json();

        console.log(
            "SUPERVISOR MEETINGS:",
            data
        );

        if (!data.success) {

            container.innerHTML = `
                <div class="section-card">
                    ${
                        data.message ||
                        "Failed to load meetings."
                    }
                </div>
            `;

            return;
        }

        if (
            !data.meetings ||
            data.meetings.length === 0
        ) {

            container.innerHTML = `
                <div class="section-card">

                    <div
                        style="
                            text-align:center;
                            padding:30px;
                            color:#8AA0B8;
                        "
                    >

                        <div
                            style="
                                font-size:35px;
                                margin-bottom:10px;
                            "
                        >
                            📅
                        </div>

                        <div
                            style="
                                font-weight:600;
                                color:#4A5568;
                                margin-bottom:5px;
                            "
                        >
                            No meetings yet
                        </div>

                        <div style="font-size:13px;">
                            Student meeting requests will appear here.
                        </div>

                    </div>

                </div>
            `;

            return;
        }

        let html = "";

        data.meetings.forEach(meeting => {

            let color = "#E67E22";

            if (
                meeting.status ===
                "Completed"
            ) {
                color = "#27AE60";
            }

            if (
                meeting.status ===
                "Inconclusive"
            ) {
                color = "#C27A00";
            }

            const date =
                new Date(
                    meeting.meeting_date
                );

            const formattedDate =
                date.toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    }
                );

            const formattedTime =
                date.toLocaleTimeString(
                    "en-US",
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );

            let actionButton = "";

            // ================================================
            // PENDING → REVIEW
            // ================================================

            if (
                meeting.status ===
                "Pending"
            ) {

                actionButton = `
                    <div
                        style="
                            display:flex;
                            gap:8px;
                            flex-wrap:wrap;
                        "
                    >

                        <button
                            class="btn btn-success"
                            onclick="
                                updateMeetingStatus(
                                    ${meeting.id},
                                    'Completed'
                                )
                            "
                        >
                            ✓ Mark Completed
                        </button>

                        <button
                            class="btn btn-outline"
                            onclick="
                                updateMeetingStatus(
                                    ${meeting.id},
                                    'Inconclusive'
                                )
                            "
                        >
                            ↻ Inconclusive
                        </button>

                    </div>
                `;
            }

            html += `
                <div
                    class="meeting-card"
                    style="
                        border-left:4px solid ${color};
                        margin-bottom:15px;
                    "
                >

                    <div class="meeting-top">

                        <div>

                            <div class="meeting-date">
                                ${formattedDate}
                                ${formattedTime}
                            </div>

                            <span
                                class="badge"
                                style="
                                    background:${color}20;
                                    color:${color};
                                "
                            >
                                ${escapeHtml(
                                    meeting.status ||
                                    "Pending"
                                )}
                            </span>

                            <span
                                style="
                                    font-size:13px;
                                    color:#4A5568;
                                    margin-left:10px;
                                "
                            >
                                ·
                                ${escapeHtml(
                                    meeting.student_name ||
                                    "Student"
                                )}
                            </span>

                        </div>

                    </div>

                    <div
                        style="
                            margin-top:10px;
                            font-size:13px;
                            color:#4A5568;
                        "
                    >
                        <strong>
                            Milestone:
                        </strong>

                        ${escapeHtml(
                            meeting.milestone_title ||
                            "Milestone"
                        )}
                    </div>

                    <div class="meeting-agenda">

                        <strong>
                            Agenda:
                        </strong>

                        ${escapeHtml(
                            meeting.agenda ||
                            "No agenda provided."
                        )}

                    </div>

                    ${
                        actionButton
                        ?
                        `
                        <div
                            style="
                                display:flex;
                                justify-content:flex-end;
                                margin-top:15px;
                            "
                        >
                            ${actionButton}
                        </div>
                        `
                        :
                        ""
                    }

                </div>
            `;
        });

        container.innerHTML = html;

    } catch (error) {

        console.error(
            "LOAD SUPERVISOR MEETINGS ERROR:",
            error
        );

        container.innerHTML = `
            <div class="section-card">
                Failed to load meetings.
            </div>
        `;
    }
}


// ============================================================
// SUPERVISOR — UPDATE MEETING
// ============================================================

async function updateMeetingStatus(
    meetingId,
    status
) {

    if (!meetingId) {
        alert("Invalid meeting.");
        return;
    }

    if (
        status !== "Completed" &&
        status !== "Inconclusive"
    ) {
        alert("Invalid meeting status.");
        return;
    }

    const confirmation =
        status === "Completed"
            ?
            "Mark this meeting as completed?\n\nThe milestone will be completed and the next milestone will become active."
            :
            "Mark this meeting as inconclusive?\n\nThe student will need to make corrections and submit the milestone again.";

    if (!confirm(confirmation)) {
        return;
    }

    try {

        const response = await fetch(
            "api/supervisor/update_meeting.php",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    meeting_id: meetingId,
                    status: status
                })
            }
        );

        const data =
            await response.json();

        console.log(
            "UPDATE MEETING:",
            data
        );

        if (!data.success) {

            alert(
                data.message ||
                "Failed to update meeting."
            );

            return;
        }

        alert(
            data.message ||
            (
                status === "Completed"
                    ?
                    "Meeting completed successfully. The next milestone is now available."
                    :
                    "Meeting marked as inconclusive. The student has been notified."
            )
        );

        await loadSupervisorMeetings();

        if (
            typeof loadSupervisorDashboard ===
            "function"
        ) {
            await loadSupervisorDashboard();
        }

        if (
            typeof loadSupervisorStudents ===
            "function"
        ) {
            await loadSupervisorStudents();
        }

    } catch (error) {

        console.error(
            "UPDATE MEETING ERROR:",
            error
        );

        alert(
            "Something went wrong while updating the meeting."
        );
    }
}


async function loadAssessmentStudents() {

    try {

        const response = await fetch(
            "api/supervisor/get_students.php"
        );

        const data = await response.json();

        const select =
            document.getElementById(
                "assessment-student"
            );

        if (!select) return;

        select.innerHTML = `
            <option value="">
                Select student
            </option>
        `;

        if (!data.success) {

            console.error(
                data.message ||
                "Failed to load students"
            );

            return;
        }

        data.students.forEach(student => {

            select.innerHTML += `
                <option
                    value="${student.student_id}"
                    data-project="${student.project_title}"
                >
                    ${student.student_name}
                </option>
            `;

        });

    } catch (error) {

        console.error(
            "Failed to load assessment students:",
            error
        );

    }
}

async function loadAssessmentStudent() {

    const studentSelect =
        document.getElementById("assessment-student");

    const projectDisplay =
        document.getElementById("assessment-project");

    const eligibilityDisplay =
        document.getElementById("assessment-eligibility");

    if (!studentSelect) {
        return;
    }

    const studentId =
        studentSelect.value;


    // Reset when no student is selected
    if (!studentId) {

        if (projectDisplay) {
            projectDisplay.textContent =
                "Select a student";
        }

        if (eligibilityDisplay) {
            eligibilityDisplay.textContent =
                "Select a student to check assessment eligibility.";
        }

        return;
    }


    // Show loading state
    if (projectDisplay) {
        projectDisplay.textContent =
            "Loading project...";
    }

    if (eligibilityDisplay) {
        eligibilityDisplay.textContent =
            "Checking assessment eligibility...";
    }


    try {

        const response = await fetch(
            "api/supervisor/student_details.php?student_id=" +
            encodeURIComponent(studentId),
            {
                credentials: "same-origin"
            }
        );


        const data =
            await response.json();


        console.log(
            "Assessment Student:",
            data
        );


        if (!data.success) {

            if (projectDisplay) {
                projectDisplay.textContent =
                    "Unable to load student project.";
            }

            if (eligibilityDisplay) {
                eligibilityDisplay.textContent =
                    data.message ||
                    "Unable to check assessment eligibility.";
            }

            return;
        }


        const student =
            data.student || {};

        const project =
            data.project || null;

        const milestones =
            data.milestones || [];


        /*
        |--------------------------------------------------------------------------
        | NO PROJECT
        |--------------------------------------------------------------------------
        */

        if (!project) {

            if (projectDisplay) {
                projectDisplay.textContent =
                    "No active project";
            }

            if (eligibilityDisplay) {
                eligibilityDisplay.textContent =
                    "This student does not have an approved project.";
            }

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | DISPLAY PROJECT
        |--------------------------------------------------------------------------
        */

        if (projectDisplay) {

            projectDisplay.textContent =
                project.title ||
                "Untitled Project";
        }


        /*
        |--------------------------------------------------------------------------
        | CHECK ALL 6 MILESTONES
        |--------------------------------------------------------------------------
        */

        const totalMilestones =
            milestones.length;


        const completedMilestones =
            milestones.filter(
                milestone =>
                    milestone.status === "Completed"
            ).length;


        const allCompleted =
            totalMilestones === 6 &&
            completedMilestones === 6;


        /*
        |--------------------------------------------------------------------------
        | CHECK EXISTING FINAL ASSESSMENT
        |--------------------------------------------------------------------------
        */

        let finalAssessmentExists = false;


        try {

            const feedbackResponse =
                await fetch(
                    "api/student/get_feedback.php",
                    {
                        credentials: "same-origin"
                    }
                );


            /*
             * This endpoint is student-specific,
             * so we do not rely on it for the
             * supervisor assessment check.
             *
             * The backend submit_assessment.php
             * remains the final protection.
             */

            await feedbackResponse.json();

        } catch (error) {

            console.log(
                "Feedback check skipped."
            );
        }


        /*
        |--------------------------------------------------------------------------
        | ASSESSMENT ELIGIBILITY
        |--------------------------------------------------------------------------
        */

        if (allCompleted) {

            if (eligibilityDisplay) {

                eligibilityDisplay.innerHTML = `
                    <span style="
                        display:inline-flex;
                        align-items:center;
                        gap:6px;
                        padding:8px 12px;
                        border-radius:8px;
                        background:#EAF8EF;
                        color:#27AE60;
                        font-size:13px;
                        font-weight:700;
                    ">
                        ✓ Eligible for Final Assessment
                    </span>

                    <div style="
                        margin-top:8px;
                        font-size:12px;
                        color:#66788A;
                    ">
                        All 6 project milestones have been completed.
                    </div>
                `;
            }

        } else {

            if (eligibilityDisplay) {

                eligibilityDisplay.innerHTML = `
                    <span style="
                        display:inline-flex;
                        align-items:center;
                        gap:6px;
                        padding:8px 12px;
                        border-radius:8px;
                        background:#FFF3E8;
                        color:#C27A00;
                        font-size:13px;
                        font-weight:700;
                    ">
                        ⏳ Not Yet Eligible
                    </span>

                    <div style="
                        margin-top:8px;
                        font-size:12px;
                        color:#66788A;
                    ">
                        ${completedMilestones}
                        of
                        ${totalMilestones}
                        milestones completed.
                        All 6 milestones must be completed before
                        the final assessment.
                    </div>
                `;
            }
        }


        /*
        |--------------------------------------------------------------------------
        | STORE SELECTED STUDENT
        |--------------------------------------------------------------------------
        */

        window.selectedAssessmentStudent =
            studentId;


    } catch (error) {

        console.error(
            "Assessment Student Error:",
            error
        );


        if (projectDisplay) {

            projectDisplay.textContent =
                "Unable to load project.";
        }


        if (eligibilityDisplay) {

            eligibilityDisplay.textContent =
                "Unable to check assessment eligibility.";
        }
    }
}


async function loadAssessmentMilestones() {

    const studentSelect =
        document.getElementById(
            "assessment-student"
        );

    const milestoneSelect =
        document.getElementById(
            "assessment-milestone"
        );

    const projectDisplay =
        document.getElementById(
            "assessment-project"
        );

    if (!studentSelect || !milestoneSelect) {
        return;
    }

    const studentId =
        studentSelect.value;


    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    milestoneSelect.innerHTML = `
        <option value="">
            Loading milestones...
        </option>
    `;

    milestoneSelect.disabled = true;


    if (!studentId) {

        milestoneSelect.innerHTML = `
            <option value="">
                Select a student first
            </option>
        `;

        if (projectDisplay) {
            projectDisplay.textContent =
                "Select a student";
        }

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | PROJECT NAME
    |--------------------------------------------------------------------------
    */

    const selectedOption =
        studentSelect.options[
            studentSelect.selectedIndex
        ];

    if (projectDisplay) {

        projectDisplay.textContent =
            selectedOption.dataset.project ||
            "";
    }


    try {

        const response = await fetch(
            "api/supervisor/get_student_milestones.php?student_id=" +
            encodeURIComponent(studentId)
        );

        const data = await response.json();


        if (!data.success) {

            milestoneSelect.innerHTML = `
                <option value="">
                    ${data.message || "Failed to load milestones"}
                </option>
            `;

            return;
        }


        milestoneSelect.innerHTML = `
            <option value="">
                Select milestone
            </option>
        `;


        if (data.milestones.length === 0) {

            milestoneSelect.innerHTML = `
                <option value="">
                    No milestones found
                </option>
            `;

            return;
        }


        data.milestones.forEach(milestone => {

            milestoneSelect.innerHTML += `
                <option value="${milestone.id}">
                    ${milestone.title}
                    (${milestone.progress || 0}% -
                    ${milestone.status})
                </option>
            `;

        });


        milestoneSelect.disabled = false;


    } catch (error) {

        console.error(
            "Failed to load assessment milestones:",
            error
        );

        milestoneSelect.innerHTML = `
            <option value="">
                Failed to load milestones
            </option>
        `;

    }
}


function loadSelectedAssessmentMilestone() {

    const select =
        document.getElementById("assessment-milestone");

    if (!select) return;

    const milestoneId = select.value;

    if (!milestoneId) {
        return;
    }

    const option =
        select.options[select.selectedIndex];

    console.log(
        "Selected milestone:",
        milestoneId
    );

    console.log(
        "Milestone:",
        option.textContent
    );

}

// ============================================================
// SUPERVISOR — FINAL ASSESSMENT
// ============================================================

async function submitAssessment() {

    const studentSelect =
        document.getElementById(
            "assessment-student"
        );

    const commentInput =
        document.getElementById(
            "assessment-comments"
        );

    const studentId =
        studentSelect
            ? studentSelect.value
            : "";

    const comment =
        commentInput
            ? commentInput.value.trim()
            : "";

    const research =
        Number(scores.research);

    const methodology =
        Number(scores.methodology);

    const presentation =
        Number(scores.presentation);

    const report =
        Number(scores.report);


    // ========================================================
    // VALIDATION
    // ========================================================

    if (!studentId) {

        alert(
            "Please select a student."
        );

        return;
    }

    if (!comment) {

        alert(
            "Assessment comment is required."
        );

        return;
    }

    const scoreValues = [
        research,
        methodology,
        presentation,
        report
    ];

    const invalidScore =
        scoreValues.some(
            score =>
                !Number.isFinite(score) ||
                score < 0 ||
                score > 100
        );

    if (invalidScore) {

        alert(
            "All assessment scores must be between 0 and 100."
        );

        return;
    }


    // ========================================================
    // CONFIRM
    // ========================================================

    const confirmed =
        confirm(
            "Submit the final assessment for this student?\n\n" +
            "This assessment can only be submitted after all 6 milestones have been completed."
        );

    if (!confirmed) {
        return;
    }


    // ========================================================
    // SUBMIT
    // ========================================================

    try {

        const response =
            await fetch(
                "api/supervisor/submit_assessment.php",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    credentials:
                        "same-origin",

                    body: JSON.stringify({

                        student_id:
                            studentId,

                        // IMPORTANT:
                        // Final assessment has NO milestone.
                        milestone_id:
                            null,

                        research_score:
                            research,

                        methodology_score:
                            methodology,

                        presentation_score:
                            presentation,

                        report_score:
                            report,

                        comment:
                            comment
                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "FINAL ASSESSMENT RESPONSE:",
            data
        );


        if (!data.success) {

            alert(
                data.message ||
                "Failed to submit final assessment."
            );

            return;
        }


        alert(
            data.message ||
            "Final assessment submitted successfully."
        );


        // ====================================================
        // RESET FORM
        // ====================================================

        if (studentSelect) {
            studentSelect.value = "";
        }

        if (commentInput) {
            commentInput.value = "";
        }


        scores.research = 0;
        scores.methodology = 0;
        scores.presentation = 0;
        scores.report = 0;


        const scoreElements = {
            research:
                document.getElementById(
                    "score-research"
                ),

            methodology:
                document.getElementById(
                    "score-methodology"
                ),

            presentation:
                document.getElementById(
                    "score-presentation"
                ),

            report:
                document.getElementById(
                    "score-report"
                )
        };


        Object.entries(
            scoreElements
        ).forEach(
            ([key, element]) => {

                if (element) {
                    element.textContent =
                        "0%";
                }

            }
        );


        const gradeNum =
            document.getElementById(
                "grade-num"
            );

        const gradeBand =
            document.getElementById(
                "grade-band"
            );


        if (gradeNum) {
            gradeNum.textContent =
                "0%";
        }

        if (gradeBand) {
            gradeBand.textContent =
                "Not Assessed";
        }


        if (
            typeof loadAssessmentStudents ===
            "function"
        ) {
            await loadAssessmentStudents();
        }

        if (
            typeof loadSupervisorDashboard ===
            "function"
        ) {
            await loadSupervisorDashboard();
        }

        if (
            typeof loadSupervisorStudents ===
            "function"
        ) {
            await loadSupervisorStudents();
        }

    } catch (error) {

        console.error(
            "FINAL ASSESSMENT ERROR:",
            error
        );

        alert(
            "Something went wrong while submitting the final assessment."
        );
    }
}


async function loadStudentFeedback() {

    try {

        const response = await fetch(
            "api/student/get_feedback.php"
        );

        const data = await response.json();

        console.log("Feedback response:", data);

        const container =
            document.getElementById(
                "student-feedback-container"
            );

        if (!container) {
            console.error(
                "student-feedback-container not found"
            );
            return;
        }


        if (!data.success) {

            container.innerHTML = `
                <div class="section-card">
                    Failed to load feedback
                </div>
            `;

            return;
        }


        if (!data.feedback || data.feedback.length === 0) {

            container.innerHTML = `
                <div class="section-card">

                    <div style="
                        text-align:center;
                        padding:30px;
                        color:#8AA0B8;
                    ">

                        <div style="
                            font-size:35px;
                            margin-bottom:10px;
                        ">
                            💬
                        </div>

                        <div style="
                            font-weight:600;
                            color:#4A5568;
                            margin-bottom:5px;
                        ">
                            No feedback yet
                        </div>

                        <div style="font-size:13px;">
                            Feedback from your supervisor
                            will appear here.
                        </div>

                    </div>

                </div>
            `;

            return;
        }


        let html = "";


        data.feedback.forEach(feedback => {

            html += `

                <div
                    class="section-card"
                    style="margin-bottom:15px"
                >

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        margin-bottom:12px;
                    ">

                        <div>

                            <div style="
                                font-size:16px;
                                font-weight:700;
                                color:#1A365D;
                            ">
                                ${feedback.milestone_title || "Project Feedback"}
                            </div>

                            <div style="
                                font-size:13px;
                                color:#718096;
                                margin-top:4px;
                            ">
                                Supervisor:
                                ${feedback.supervisor_name || "Supervisor"}
                            </div>

                        </div>

                        <div style="
                            font-size:12px;
                            color:#718096;
                        ">
                            ${feedback.created_at}
                        </div>

                    </div>


                    <!-- ASSESSMENT SCORES -->

                    <div style="
                        display:grid;
                        grid-template-columns:repeat(4,1fr);
                        gap:10px;
                        margin-bottom:15px;
                    ">

                        <div style="
                            background:#F7FAFC;
                            padding:10px;
                            border-radius:8px;
                            text-align:center;
                        ">
                            <div style="
                                font-size:11px;
                                color:#718096;
                            ">
                                Research
                            </div>

                            <strong>
                                ${feedback.research_score ?? 0}%
                            </strong>
                        </div>


                        <div style="
                            background:#F7FAFC;
                            padding:10px;
                            border-radius:8px;
                            text-align:center;
                        ">
                            <div style="
                                font-size:11px;
                                color:#718096;
                            ">
                                Methodology
                            </div>

                            <strong>
                                ${feedback.methodology_score ?? 0}%
                            </strong>
                        </div>


                        <div style="
                            background:#F7FAFC;
                            padding:10px;
                            border-radius:8px;
                            text-align:center;
                        ">
                            <div style="
                                font-size:11px;
                                color:#718096;
                            ">
                                Presentation
                            </div>

                            <strong>
                                ${feedback.presentation_score ?? 0}%
                            </strong>
                        </div>


                        <div style="
                            background:#F7FAFC;
                            padding:10px;
                            border-radius:8px;
                            text-align:center;
                        ">
                            <div style="
                                font-size:11px;
                                color:#718096;
                            ">
                                Report
                            </div>

                            <strong>
                                ${feedback.report_score ?? 0}%
                            </strong>
                        </div>

                    </div>


                    <!-- OVERALL SCORE -->

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        background:#F0F7FF;
                        padding:12px 15px;
                        border-radius:8px;
                        margin-bottom:15px;
                    ">

                        <strong>
                            Overall Assessment
                        </strong>

                        <strong style="
                            color:#1A5FA8;
                            font-size:20px;
                        ">
                            ${feedback.average_score ?? 0}%
                        </strong>

                    </div>


                    <!-- COMMENT -->

                    <div style="
                        background:#FAFAFA;
                        border-left:3px solid #1A5FA8;
                        padding:12px 15px;
                        border-radius:4px;
                        color:#4A5568;
                        line-height:1.6;
                    ">

                        <strong style="
                            display:block;
                            margin-bottom:5px;
                            color:#1A365D;
                        ">
                            Supervisor's Feedback
                        </strong>

                        ${feedback.comment || "No comment provided."}

                    </div>

                </div>

            `;

        });


        container.innerHTML = html;


    } catch (error) {

        console.error(
            "Failed to load student feedback:",
            error
        );

    }

}

async function loadNotifications() {

    try {

        const response = await fetch(
            "api/notifications/get_notifications.php"
        );

        const data = await response.json();

        console.log("Notifications:", data);

        if (!data.success) {
            console.error(
                "Failed to load notifications:",
                data.message
            );
            return;
        }


        const studentContainer =
            document.getElementById("notif-list-student");

        const supervisorContainer =
            document.getElementById("notif-list-supervisor");


        /*
        |--------------------------------------------------------------------------
        | DETERMINE USER ROLE
        |--------------------------------------------------------------------------
        */

        const role = data.user.role;

        let container = null;


        if (role === "student") {

            if (studentContainer) {
                studentContainer.style.display = "block";
            }

            if (supervisorContainer) {
                supervisorContainer.style.display = "none";
            }

            container = studentContainer;


        } else if (role === "supervisor") {

            if (studentContainer) {
                studentContainer.style.display = "none";
            }

            if (supervisorContainer) {
                supervisorContainer.style.display = "block";
            }

            container = supervisorContainer;
        }


        if (!container) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | NO NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        if (
            !data.notifications ||
            data.notifications.length === 0
        ) {

            container.innerHTML = `
                <div class="page-sub">
                    No notifications
                </div>
            `;

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | UNREAD COUNT
        |--------------------------------------------------------------------------
        */

        const unread =
            Number(data.unread_count) || 0;


        let html = `
            <div class="page-sub">
                ${unread}
                unread notification${unread === 1 ? "" : "s"}
            </div>
        `;


        /*
        |--------------------------------------------------------------------------
        | RENDER NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        data.notifications.forEach(notification => {

            const isUnread =
                Number(notification.is_read) === 0;


            /*
            |--------------------------------------------------------------------------
            | ICON
            |--------------------------------------------------------------------------
            */

            let icon = "🔔";


            if (notification.type === "meeting") {

                icon = "📅";

            } else if (notification.type === "assessment") {

                icon = "📊";

            } else if (notification.type === "feedback") {

                icon = "💬";

            } else if (notification.type === "milestone") {

                icon = "📌";
            }


            /*
            |--------------------------------------------------------------------------
            | COLORS
            |--------------------------------------------------------------------------
            */

            const background =
                isUnread
                    ? "#EBF3FB"
                    : "#FFFFFF";


            const border =
                isUnread
                    ? "#3B8DD6"
                    : "#D6E4F7";


            /*
            |--------------------------------------------------------------------------
            | NOTIFICATION CARD
            |--------------------------------------------------------------------------
            */

            html += `

                <div
                    class="notif-card"
                    style="
                        background:${background};
                        border-left:4px solid ${border};
                    "
                >

                    <span style="
                        font-size:22px;
                    ">
                        ${icon}
                    </span>


                    <div style="
                        flex:1;
                    ">

                        <div style="
                            font-size:13px;
                            font-weight:${isUnread ? "700" : "500"};
                            color:#1A1A2E;
                        ">
                            ${notification.title}
                        </div>


                        <div style="
                            font-size:12px;
                            color:#4A5568;
                            margin-top:3px;
                        ">
                            ${notification.message}
                        </div>


                        <div style="
                            font-size:11px;
                            color:#8AA0B8;
                            margin-top:5px;
                        ">
                            ${notification.created_at}
                        </div>


                        ${
                            isUnread
                                ? `
                                    <button
                                        type="button"
                                        class="btn btn-default"
                                        style="
                                            margin-top:10px;
                                            padding:6px 12px;
                                            font-size:11px;
                                        "
                                        onclick="markNotificationRead(${notification.id})"
                                    >
                                        Mark as read
                                    </button>
                                `
                                : ""
                        }

                    </div>


                    ${
                        isUnread
                            ? `<div class="notif-dot"></div>`
                            : ""
                    }

                </div>

            `;

        });


        /*
        |--------------------------------------------------------------------------
        | DISPLAY
        |--------------------------------------------------------------------------
        */

        container.innerHTML = html;


    } catch (error) {

        console.error(
            "Failed to load notifications:",
            error
        );

    }

}


async function markNotificationRead(notificationId) {

    console.log(
        "MARKING NOTIFICATION:",
        notificationId
    );


    try {

        const response = await fetch(
            "api/notifications/mark_notification_read.php",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    notification_id: notificationId
                })
            }
        );


        const data = await response.json();


        console.log(
            "MARK READ RESPONSE:",
            data
        );


        if (!data.success) {

            alert(
                data.message ||
                "Failed to mark notification as read"
            );

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | RELOAD NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        await loadNotifications();
        await loadNotificationCount();


    } catch (error) {

        console.error(
            "Mark notification error:",
            error
        );

        alert(
            "Something went wrong while marking notification as read"
        );

    }

}

async function loadNotificationCount() {
    try {
        const response = await fetch(
            "api/notifications/get_notifications.php?t=" + Date.now(),
            {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store"
            }
        );

        const data = await response.json();

        console.log("NOTIFICATION API RESPONSE:", data);

        const badge = document.getElementById("notif-count");

        if (!badge) {
            console.error("notif-count element not found");
            return;
        }

        if (!data.success) {
            console.error(
                "Notification API error:",
                data.message
            );

            badge.textContent = "0";
            badge.style.display = "none";

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | COUNT ACTUAL UNREAD NOTIFICATIONS
        |--------------------------------------------------------------------------
        */

        const notifications = Array.isArray(data.notifications)
            ? data.notifications
            : [];

        const unreadNotifications = notifications.filter(
            notification =>
                Number(notification.is_read) === 0
        );

        const unreadCount =
            unreadNotifications.length;

        console.log(
            "TOTAL NOTIFICATIONS:",
            notifications.length
        );

        console.log(
            "UNREAD NOTIFICATIONS:",
            unreadNotifications
        );

        console.log(
            "UNREAD COUNT:",
            unreadCount
        );


        /*
        |--------------------------------------------------------------------------
        | UPDATE BADGE
        |--------------------------------------------------------------------------
        */

        if (unreadCount > 0) {

            badge.textContent =
                unreadCount > 99
                    ? "99+"
                    : unreadCount;

            badge.style.display =
                "inline-flex";

        } else {

            badge.textContent = "0";

            badge.style.display =
                "none";
        }

    } catch (error) {

        console.error(
            "Notification count error:",
            error
        );
    }
}


setInterval(loadNotificationCount, 30000);
loadNotificationCount();