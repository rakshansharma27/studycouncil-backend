let currentHistory = [];

function saveQuestion(question, mode, responses, synthesis) {
    const user = getSession();
    if (!user) return;

    const newEntry = {
        id: Date.now().toString(),
        user_email: user.email,
        question,
        mode,
        responses,
        synthesis,
        date: new Date().toISOString()
    };

    let history = JSON.parse(localStorage.getItem('sc_history') || '[]');
    history.unshift(newEntry); // Add to beginning
    localStorage.setItem('sc_history', JSON.stringify(history));

    renderSidebarHistory();
}

function fetchHistory() {
    const user = getSession();
    if (!user) return [];

    const history = JSON.parse(localStorage.getItem('sc_history') || '[]');
    const userHistory = history.filter(item => item.user_email === user.email);
    currentHistory = userHistory;
    return userHistory;
}

function renderSidebarHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    list.innerHTML = '';

    const history = fetchHistory();
    const displayHistory = history.slice(0, 5);

    if (displayHistory.length === 0) {
        list.innerHTML = '<li>No questions yet.</li>';
        return;
    }

    displayHistory.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item.question;
        li.onclick = () => loadHistoryItem(item.id);
        list.appendChild(li);
    });
}

function loadHistoryItem(id) {
    const item = currentHistory.find(i => i.id === id);
    if (!item) return;

    document.getElementById('askInput').value = item.question;
    document.querySelector('.responses-grid').style.display = 'grid';
    document.querySelector('.synthesis-box').classList.add('show');
    document.querySelector('.action-bar').style.display = 'flex';

    const contents = document.querySelectorAll('.model-content');

    let parsedResponses = item.responses;
    if (typeof parsedResponses === 'string') {
        try { parsedResponses = JSON.parse(parsedResponses); } catch (e) { }
    }

    parsedResponses.forEach((resp, idx) => {
        if (contents[idx]) contents[idx].innerHTML = resp.response;
    });

    document.getElementById('synthText').innerHTML = item.synthesis;
}