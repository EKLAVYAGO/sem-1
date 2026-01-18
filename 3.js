function switchSection(id) {
    document.querySelectorAll(".section").forEach(s =>
        s.classList.remove("active")
    );
    document.getElementById(id).classList.add("active");
}

/* STORAGE */
let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
let subjects = JSON.parse(localStorage.getItem("subjects")) || [];
let studyMinutes = Number(localStorage.getItem("studyMinutes")) || 0;

/* ASSIGNMENTS */
function addAssignment() {
    if (!assignmentInput.value.trim()) return;
    assignments.push({ title: assignmentInput.value, done: false });
    assignmentInput.value = "";
    save();
    renderAssignments();
}

function toggleAssignment(i) {
    assignments[i].done = !assignments[i].done;
    save();
    renderAssignments();
}

function renderAssignments() {
    pendingList.innerHTML = "";
    completedList.innerHTML = "";

    assignments.forEach((a, i) => {
        let li = document.createElement("li");
        li.innerText = a.title;
        li.onclick = () => toggleAssignment(i);
        a.done ? completedList.appendChild(li)
               : pendingList.appendChild(li);
    });

    updateOverview();
}

/* ATTENDANCE */
function addSubject() {
    if (!subjectInput.value.trim()) return;
    subjects.push({ name: subjectInput.value, present: 0, total: 0 });
    subjectInput.value = "";
    save();
    renderSubjects();
}

function renderSubjects() {
    subjectList.innerHTML = "";

    subjects.forEach((s, i) => {
        let percent = s.total ? Math.round((s.present / s.total) * 100) : 0;

        let li = document.createElement("li");
        li.className = "subject-item";
        li.innerHTML = `
            <span>${s.name} - ${percent}%</span>
            <div>
                <button onclick="markPresent(${i})">P</button>
                <button onclick="markAbsent(${i})">A</button>
            </div>
        `;
        subjectList.appendChild(li);
    });

    updateOverview();
}

function markPresent(i) {
    subjects[i].present++;
    subjects[i].total++;
    save();
    renderSubjects();
}

function markAbsent(i) {
    subjects[i].total++;
    save();
    renderSubjects();
}

/* STUDY TRACKER */
let startTime = null;
let timerInterval = null;

function startStudy() {
    if (timerInterval) return;
    startTime = Date.now();

    timerInterval = setInterval(() => {
        let diff = Date.now() - startTime;
        let min = Math.floor(diff / 60000);
        let sec = Math.floor((diff % 60000) / 1000);
        liveTimer.innerText =
            `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    }, 1000);
}

function stopStudy() {
    if (!startTime) return;

    let minutes = Math.floor((Date.now() - startTime) / 60000);
    studyMinutes += minutes;
    localStorage.setItem("studyMinutes", studyMinutes);

    clearInterval(timerInterval);
    timerInterval = null;
    startTime = null;
    liveTimer.innerText = "00:00";

    updateOverview();
}

/* OVERVIEW */
function updateOverview() {
    pendingCount.innerText = assignments.filter(a => !a.done).length;
    completedCount.innerText = assignments.filter(a => a.done).length;
    riskCount.innerText =
        subjects.filter(s => s.total && (s.present / s.total) < 0.75).length;

    studyMinutesEl = studyMinutes;
    studyMinutesSpan = document.getElementById("studyMinutes");
    studyMinutesSpan.innerText = studyMinutes;
    studyDisplay.innerText = studyMinutes;
}

/* SAVE */
function save() {
    localStorage.setItem("assignments", JSON.stringify(assignments));
    localStorage.setItem("subjects", JSON.stringify(subjects));
}

/* INIT */
renderAssignments();
renderSubjects();
updateOverview();
