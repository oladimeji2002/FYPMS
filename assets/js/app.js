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
function renderSidebar() {
    console.log("renderSidebar running");

    const nav =
        currentRole === "student"
            ? STUDENT_NAV
            : SUPERVISOR_NAV;

document.getElementById('sidebar-nav').innerHTML =
    nav.map(item => `
        <div class="nav-item${currentPage === item.key ? ' active' : ''}"
             onclick="showPage('${item.key}');closeSidebar()">
            <span>${item.icon}</span>${item.label}
        </div>
    `).join('')

    +

    `
    <div class="nav-item logout-btn"
         onclick="logout()">
        <span>🚪</span> Logout
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

    if(key === "milestones"){
    loadMilestones();
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



// ─── Modals ──────────────────────────────
function openModal(name) {
  document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
  const box = document.getElementById('modal-' + name);
  if (box) box.style.display = 'block';
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.querySelectorAll('.modal-box').forEach(m => m.style.display = 'none');
}

// ─── Assessment sliders ───────────────────
const scores = { research: 72, methodology: 68, presentation: 75, report: 70 };
function updateScore(key, val) {
  scores[key] = parseInt(val);
  document.getElementById('score-' + key).textContent = val + '%';
  const avg = Math.round(Object.values(scores).reduce((a,b)=>a+b,0) / 4);
  const band  = avg >= 70 ? 'Distinction' : avg >= 60 ? 'Merit' : avg >= 50 ? 'Pass' : 'Refer';
  const color = avg >= 70 ? '#27AE60' : avg >= 60 ? '#1A5FA8' : avg >= 50 ? '#E67E22' : '#E74C3C';
  const box = document.getElementById('grade-box');
  box.style.background = color + '15';
  document.getElementById('grade-num').textContent  = avg + '%';
  document.getElementById('grade-num').style.color  = color;
  document.getElementById('grade-band').textContent = band;
  document.getElementById('grade-band').style.color = color;
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

    document.getElementById('reg-yr-group')
        .style.display =
            r === 'supervisor'
            ? 'none'
            : '';

    document.getElementById('reg-matric-group')
        .style.display =
            r === 'supervisor'
            ? 'none'
            : '';
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
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    let ok = true;
    if (!name) ok = showErr('reg-name');
    if (!email || !email.includes('@')) ok = showErr('reg-email');
    if (!ok) return;
    document.getElementById('reg-step1').style.display = 'none';
    document.getElementById('reg-step2').style.display = '';
    setStepBar(2);
  } else if (from === 2) {
    const dept = document.getElementById('reg-dept').value;
    const pass = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    const year = document.getElementById('reg-year').value;
    let ok = true;
    if (!dept) ok = showErr('reg-dept');
    if (regRole === 'student' && !year) ok = showErr('reg-year');
    if (pass.length < 8) ok = showErr('reg-pass', 'Password must be at least 8 characters.');
    if (pass !== pass2) ok = showErr('reg-pass2', 'Passwords do not match.');
    if (!ok) return;
    // Build review
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const roleLabel = regRole === 'student' ? 'Student' : 'Supervisor';
    const yearStr = regRole === 'student' ? `<br>Year: ${year}` : '';
    document.getElementById('reg-review').innerHTML =
      `<b>Name:</b> ${name}<br><b>Email:</b> ${email}<br><b>Role:</b> ${roleLabel}<br><b>Department:</b> ${dept}${yearStr}`;
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

    const terms = document.getElementById('chk-terms').checked;
    const dataConsent = document.getElementById('chk-data').checked;

    if (!terms || !dataConsent) {
        alert("Please accept Terms and Conditions");
        return;
    }

    const fullname = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const matric_no = document.getElementById("reg-matric").value;
    const phone = document.getElementById("reg-phone").value;
    const department = document.getElementById("reg-department").value;
    const password = document.getElementById("reg-pass").value;

    const role = document
        .querySelector(".role-opt.sel")
        .id
        .replace("role-", "");

    try {

        const response = await fetch(
            "http://localhost/fypms/api/auth/register.php",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullname,
                    email,
                    matric_no,
                    department,
                    phone,
                    password,
                    role
                })
            }
        );

        const text = await response.text();
        console.log(text);

        const result = JSON.parse(text);

        if(result.success){

            document.getElementById('reg-step3').style.display = 'none';
            document.getElementById('reg-step4').style.display = '';

            document.getElementById('reg-step-label').textContent = 'Complete!';

            [1,2,3].forEach(i=>{
                document.getElementById('rs'+i).style.background='var(--success)';
            });

        }else{
            alert(result.message || "Registration Failed");
        }

    } catch(error){
        console.error(error);
        alert("Server Error");
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

        const res = await fetch("api/student/dashboard.php");
        const data = await res.json();

        console.log(data);

        if(!data.success) return;

        if(!data.project){

            document.getElementById("project-status").textContent =
                "No Project";

            return;
        }

        document.getElementById("student-name").textContent =
            data.student.fullname;

        document.getElementById("student-department").textContent =
            data.student.department;

        document.getElementById("project-status").textContent =
            data.project.status;

        document.getElementById("milestones-done").textContent =
            `${data.milestones_done} / ${data.milestones_total}`;

        document.getElementById("unread-feedback").textContent =
            `${data.feedback_count} New`;

        document.getElementById("feedback-count").textContent =
            data.feedback_count;

        document.getElementById("project-progress-text").textContent =
            data.project.progress + "%";

        document.getElementById("project-progress-bar").style.width =
            data.project.progress + "%";

    } catch(err){

        console.error(err);

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
async function loadProjectPage(){



    try{

        const res = await fetch(
            "api/student/project.php",    {
        method: "POST",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        },}
        );

        const data = await res.json();

        if(!data.success){
            return;
        }

        const project = data.project;
        console.log(project.description);
        

        if(!project){

            document.getElementById(
                "project-title"
            ).textContent = "No Project Yet";

            return;
        }

        if(project.status !== "Pending"){

            document.getElementById(
                "edit-project-btn"
            ).style.display = "none";
        }
        if(project.status !== "Pending"){

            document.getElementById(
                "edit-project-btn"
            ).style.display = "none";

        }else{

            document.getElementById(
                "edit-project-btn"
            ).style.display = "inline-block";
        }


        document.getElementById(
            "project-title"
        ).textContent = project.title;

        document.getElementById(
            "project-status"
        ).textContent = project.status;

        document.getElementById(
            "project-description"
        ).innerHTML = project.description;

        document.getElementById(
            "project-supervisor"
        ).textContent =
            project.supervisor_name || "Not Assigned";

        document.getElementById(
            "project-department"
        ).textContent =
            project.department || "-";

        document.getElementById(
            "project-submitted"
        ).textContent =
            project.created_at;

        document.getElementById(
            "project-approved"
        ).textContent =
            project.approved_at || "-";

        document.getElementById(
            "project-session"
        ).textContent =
            project.academic_session;

        const objectives =
            project.objectives
                ? project.objectives.split("\n")
                : [];

        let html = "";

        objectives.forEach((obj,index)=>{

            html += `
                <div class="proj-objective">
                    <span class="proj-num">
                        ${index + 1}.
                    </span>
                    ${obj}
                </div>
            `;
        });

        document.getElementById(
            "project-objectives"
        ).innerHTML = html;

    }
    catch(err){
        console.error(err);
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

async function viewStudent(studentId){

    try{

        const res = await fetch(
            `api/supervisor/student_details.php?student_id=${studentId}`
        );

        const data = await res.json();

        if(!data.success){
            return;
        }

        const s = data.student;

        document.getElementById(
            "student-details-content"
        ).innerHTML = `

            <p>
                <strong>Name:</strong>
                ${s.fullname}
            </p>

            <p>
                <strong>Email:</strong>
                ${s.email}
            </p>

            <p>
                <strong>Department:</strong>
                ${s.department}
            </p>

            <p>
                <strong>Matric:</strong>
                ${s.matric_no}
            </p>

            <hr>

            <p>
                <strong>Project:</strong>
                ${s.title || "-"}
            </p>

            <p>
                <strong>Status:</strong>
                ${s.status || "-"}
            </p>

            <p>
                <strong>Progress:</strong>
                ${s.progress || 0}%
            </p>

            <p>
                <strong>Description:</strong>
                ${s.description || "-"}
            </p>

        `;

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

        openModal("student-details");

    }catch(err){

        console.error(err);
    }
}

async function assignProject(projectId){

    if(
        !confirm(
            "Assign this project to yourself?"
        )
    ){
        return;
    }

    try{

        const res = await fetch(
            "api/supervisor/assign_project.php",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    project_id: projectId
                })
            }
        );

        const data = await res.json();

        if(data.success){

            alert(
                "Project assigned successfully"
            );

            loadSupervisorProposals();
            loadSupervisorDashboard();
            loadSupervisorStudents();

        }else{

            alert(
                "Assignment failed"
            );
        }

    }catch(err){

        console.error(err);
    }
}


async function loadSupervisorProposals(){

    try{

        const res = await fetch(
            "api/supervisor/proposals.php",
            {
                credentials:"same-origin"
            }
        );

        const text = await res.text();

        console.log("Students API:", text);

        if(!data.success){
            return;
        }

        let html = "";

        data.projects.forEach(project => {

            html += `
            <div class="proposal-card"
                 style="border-left:4px solid #E67E22">

                <div class="proposal-top">

                    <div>

                        <span class="badge"
                              style="background:#E67E2220;color:#E67E22">

                            Pending Review

                        </span>

                        <div class="proposal-title">
                            ${project.title}
                        </div>

                        <div class="proposal-submitter">
                            ${project.fullname}
                        </div>

                    </div>

                    <div class="proposal-actions">

                        <button
                            class="btn btn-primary"
                            onclick="assignProject(${project.id})">

                            📌 Assign To Me

                        </button>

                    </div>

                </div>

                <p class="proposal-desc">
                    ${project.description}
                </p>

            </div>
            `;
        });

        document.getElementById(
            "sv-proposals-container"
        ).innerHTML = html;

    }catch(err){

        console.error(err);
    }
}


async function loadSupervisorProposals(){

    try{

        const res = await fetch(
            "api/supervisor/proposals.php",
            {
                credentials:"same-origin"
            }
        );

        const data = await res.json();

        if(!data.success){
            return;
        }

        let html = "";

        /* Pending Projects */

        if(data.pending.length > 0){

            html += `
            <div class="section-title"
                 style="margin-bottom:15px">
                Pending Projects
            </div>
            `;

            data.pending.forEach(project=>{

                html += `
                <div class="proposal-card"
                     style="border-left:4px solid #E67E22">

                    <div class="proposal-top">

                        <div>

                            <span class="badge"
                                style="
                                background:#E67E2220;
                                color:#E67E22">

                                Pending Review

                            </span>

                            <div class="proposal-title">
                                ${project.title}
                            </div>

                            <div class="proposal-submitter">
                                ${project.fullname}
                            </div>

                        </div>

                        <div class="proposal-actions">

                            <button
                                class="btn btn-success"
                                onclick="assignProject(${project.id})">

                                Assign To Me

                            </button>

                        </div>

                    </div>

                    <p class="proposal-desc">
                        ${project.description}
                    </p>

                </div>
                `;
            });
        }

        /* Assigned Projects */

        if(data.assigned.length > 0){

            html += `
            <div class="section-title"
                 style="
                 margin-top:25px;
                 margin-bottom:15px">

                My Assigned Projects

            </div>
            `;

            data.assigned.forEach(project=>{

                html += `
                <div class="proposal-card"
                     style="border-left:4px solid #27AE60">

                    <div style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        flex-wrap:wrap">

                        <span class="badge"
                            style="
                            background:#27AE6020;
                            color:#27AE60">

                            Assigned

                        </span>

                        <span style="
                            font-weight:700;
                            font-size:14px;
                            color:#0F2D52">

                            ${project.title}

                        </span>

                    </div>

                    <div style="
                        font-size:12px;
                        color:#8AA0B8;
                        margin-top:4px">

                        ${project.fullname}

                    </div>

                </div>
                `;
            });
        }

        if(
            data.pending.length === 0 &&
            data.assigned.length === 0
        ){

            html = `
            <div class="section-card">
                No proposals available
            </div>
            `;
        }

        document.getElementById(
            "sv-proposals-container"
        ).innerHTML = html;

    }catch(err){

        console.error(err);
    }
}


////////////////////view student details////////////////


async function viewStudent(studentId){

    localStorage.setItem(
        "selectedStudent",
        studentId
    );

    showPage(
        "sv-student-details"
    );

    loadStudentDetails();
}



async function loadStudentDetails(){

    try{

        const studentId =
            localStorage.getItem(
                "selectedStudent"
            );

        const res = await fetch(
            `api/supervisor/student_details.php?student_id=${studentId}`,
            {
                credentials:"same-origin"
            }
        );

        const data = await res.json();

        if(!data.success){
            return;
        }

        const s = data.student;

        document.getElementById(
            "sv-student-details-container"
        ).innerHTML = `

        <div class="section-card">

            <div class="page-title">
                ${s.fullname}
            </div>

            <div class="page-sub">
                ${s.email}
            </div>

            <br>

            <div class="detail-row">
                <strong>Matric No:</strong>
                ${s.matric_no}
            </div>

            <div class="detail-row">
                <strong>Department:</strong>
                ${s.department}
            </div>

            <hr style="margin:20px 0">

            <h3>
                Project Information
            </h3>

            <div class="detail-row">
                <strong>Title:</strong>
                ${s.title || "No Project"}
            </div>

            <div class="detail-row">
                <strong>Status:</strong>
                ${s.status || "-"}
            </div>

            <div class="detail-row">
                <strong>Progress:</strong>
                ${s.progress || 0}%
            </div>

            <br>

            <div>
                <strong>Description</strong>

                <p>
                    ${s.description || ""}
                </p>
            </div>

            <br>

            <div>
                <strong>Objectives</strong>

                <p>
                    ${s.objectives || ""}
                </p>
            </div>

            <br>

            <button
                class="btn btn-primary"
                onclick="openModal('feedback')">

                Give Feedback

            </button>

        </div>

        `;

        loadStudentMilestones(s.project_id);

    }catch(err){

        console.error(err);
    }
}

// /////////////////////////// load milestones////////////////////
async function loadStudentMilestones(projectId){

    try{

        const res = await fetch(
            `api/supervisor/get_milestones.php?project_id=${projectId}`
        );

        const data = await res.json();

        if(!data.success){
            return;
        }

        let html = "";

        if(data.milestones.length === 0){

            html = `
            <div class="section-card">
                No milestones yet
            </div>
            `;

        }else{

            data.milestones.forEach(m=>{

                let icon = "⏳";

                if(
                    m.status === "Completed"
                ){
                    icon = "✅";
                }

                html += `
                <div class="milestone-row">

                    <div class="milestone-left">

                        <span>
                            ${icon}
                        </span>

                        <span>
                            ${m.title}
                        </span>

                    </div>

                    <div>

                        ${m.progress}%

                    </div>

                </div>
                `;
            });

        }

        document.getElementById(
            "sv-milestones-list"
        ).innerHTML = html;

    }catch(err){

        console.error(err);
    }
}


function saveMilestone() {

    const title =
        document.getElementById("mile-title").value;

    const description =
        document.getElementById("mile-description").value;

    const due_date =
        document.getElementById("mile-date").value;

    fetch("api/student/create_milestone.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: editingMilestoneId,
            title,
            description,
            due_date
        })
    })
    .then(r => r.json())
    .then(data => {

        if (!data.success) {

            alert("Operation failed");
            return;
        }

        editingMilestoneId = null;

        closeMilestoneModal();

        loadMilestones();
    });
}


async function loadMilestones() {

    try {

        const res = await fetch(
            "api/student/get_milestones.php"
        );

        const data = await res.json();

        if (!data.success) return;

        let html = "";

        if (data.milestones.length === 0) {

            html = `
            <div class="section-card">
                No milestones yet
            </div>
            `;

        } else {

            data.milestones.forEach(m => {

                let color = "#E67E22";

                if (m.status === "Completed") {
                    color = "#27AE60";
                }

                html += `
                <div class="section-card" style="margin-bottom:15px">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        margin-bottom:10px;
                    ">

                        <h4>${m.title}</h4>

                        <span
                            style="
                                background:${color}20;
                                color:${color};
                                padding:5px 10px;
                                border-radius:20px;
                                font-size:12px;
                                font-weight:600;
                            ">
                            ${m.status}
                        </span>

                    </div>

                    <p style="
                        margin-bottom:10px;
                        color:#666;
                    ">
                        ${m.description || "No description"}
                    </p>

                    <div style="
                        font-size:13px;
                        color:#888;
                        margin-bottom:10px;
                    ">
                        Due Date: ${m.due_date}
                    </div>

                    <div class="progress-bar">

                        <div
                            class="progress-fill"
                            style="width:${m.progress || 0}%">
                        </div>

                    </div>

                    <div style="
                        text-align:right;
                        margin-top:5px;
                        font-size:13px;
                        font-weight:600;
                    ">
                        ${m.progress || 0}%
                    </div>

                    <div style="
                        display:flex;
                        justify-content:flex-end;
                        gap:10px;
                        margin-top:15px;
                    ">

                        <button
                            class="btn btn-outline"
                            onclick="editMilestone(${m.id})">

                            Edit

                        </button>

                        <button
                            class="btn btn-danger"
                            onclick="deleteMilestone(${m.id})">

                            Delete

                        </button>

                    </div>

                </div>
                `;
            });

        }

        document.getElementById(
            "student-milestones-container"
        ).innerHTML = html;

    } catch(err) {

        console.error(err);

        alert("Failed to load milestones");

    }

}

async function editMilestone(id) {

    try {

        const res = await fetch(
            "api/student/get_milestones.php"
        );

        const data = await res.json();

        if (!data.success) return;

        const milestone = data.milestones.find(
            m => m.id == id
        );

        if (!milestone) {
            alert("Milestone not found");
            return;
        }

        editingMilestoneId = id;

        document.getElementById(
            "milestone-modal-title"
        ).innerText = "Edit Milestone";

        document.getElementById(
            "mile-title"
        ).value = milestone.title;

        document.getElementById(
            "mile-description"
        ).value = milestone.description || "";

        document.getElementById(
            "mile-date"
        ).value = milestone.due_date;

        openMilestoneModal();

    } catch(err) {

        console.error(err);

        alert("Failed to load milestone");

    }

}


async function deleteMilestone(id) {

    if (!confirm("Delete this milestone?")) {
        return;
    }

    console.log("Deleting milestone:", id);

    try {

        const res = await fetch(
            "api/student/delete_milestone.php",
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

        if (data.success) {

            alert(data.message);

            await loadMilestones();

        } else {

            alert(data.message);
        }

    } catch (err) {

        console.error(err);

        alert("Failed to delete milestone");
    }
}


function openMilestoneModal() {

    editingMilestoneId = null;

    document.getElementById(
        "milestone-modal-title"
    ).innerText = "Add Milestone";

    document.getElementById(
        "mile-title"
    ).value = "";

    document.getElementById(
        "mile-description"
    ).value = "";

    document.getElementById(
        "mile-date"
    ).value = "";

    document.getElementById(
        "modal-overlay"
    ).classList.add("open");
}

function closeMilestoneModal() {

    document.getElementById("modal-overlay").classList.remove("open");

    document.getElementById("milestone-modal").style.display = "none";

}
