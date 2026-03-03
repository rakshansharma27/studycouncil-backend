const API_BASE = 'https://studycouncil.onrender.com';
let currentMode = 'concept';

async function askCouncil() {
    const inputEl = document.getElementById('askInput');
    const question = inputEl.value.trim();
    if (!question) return;

    const user = getSession();
    if (isQuotaExceeded(user.plan)) {
        showUpgradeModal("You've reached your 10 free questions today.");
        return;
    }

    // UI Updates
    document.getElementById('askBtn').disabled = true;
    document.querySelector('.responses-grid').style.display = 'grid';
    document.querySelector('.synthesis-box').classList.remove('show');
    document.querySelector('.action-bar').style.display = 'none';

    const contents = document.querySelectorAll('.model-content');
    contents.forEach(el => el.innerHTML = '<div class="spinner"></div>');

    try {
        const res = await fetch(`${API_BASE}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, mode: currentMode })
        });

        if (!res.ok) throw new Error('Network error');
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        // Staggered reveal
        data.individual.forEach((item, index) => {
            setTimeout(() => {
                contents[index].innerHTML = item.response;
            }, index * 200);
        });

        setTimeout(() => {
            document.getElementById('synthText').innerHTML = data.synthesis;
            document.querySelector('.synthesis-box').classList.add('show');
            document.querySelector('.action-bar').style.display = 'flex';
            document.getElementById('askBtn').disabled = false;

            saveQuestion(question, currentMode, data.individual, data.synthesis);
            incrementQuota();
        }, data.individual.length * 200 + 500);

    } catch (err) {
        showToast('Could not reach backend. Is FastAPI running?', 'error');
        contents.forEach(el => el.innerHTML = 'Error fetching response.');
        document.getElementById('askBtn').disabled = false;
    }
}

function copyAnswer() {
    const text = document.getElementById('synthText').innerText;
    navigator.clipboard.writeText(text);
    const btn = document.getElementById('copyBtn');
    btn.innerText = "Copied! ✓";
    setTimeout(() => btn.innerText = "📋 Copy Answer", 2000);
}

function askAgain() {
    document.getElementById('askInput').value = '';
    document.querySelector('.responses-grid').style.display = 'none';
    document.querySelector('.synthesis-box').classList.remove('show');
    document.querySelector('.action-bar').style.display = 'none';
    document.getElementById('askInput').focus();
    updateCharCount();
}

function setMode(mode, el) {
    const user = getSession();
    if (mode !== 'concept' && user.plan !== 'pro') {
        showUpgradeModal("Exam Prep and Career Guide are Pro features.");
        return;
    }
    currentMode = mode;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.mode-list li').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');

    const input = document.getElementById('askInput');
    if (mode === 'concept') input.placeholder = "Explain quantum entanglement...";
    if (mode === 'exam') input.placeholder = "Generate exam questions for thermodynamics...";
    if (mode === 'career') input.placeholder = "What are the career prospects for biomedical engineering?";
}

function addSubject(subject) {
    const input = document.getElementById('askInput');
    input.value = `In ${subject}: ` + input.value;
    input.focus();
    updateCharCount();
}

function updateCharCount() {
    const input = document.getElementById('askInput');
    const count = document.getElementById('charCount');
    const btn = document.getElementById('askBtn');
    const len = input.value.length;
    count.innerText = `${len} / 500`;

    if (len > 400) count.className = 'char-count warning';
    if (len >= 500) count.className = 'char-count danger';
    if (len < 400) count.className = 'char-count';

    btn.disabled = len === 0 || len > 500;
}