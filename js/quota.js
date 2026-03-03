const FREE_LIMIT = 10;

function getTodayKey() { return 'sc_quota_' + new Date().toISOString().split('T')[0]; }
function getUsedToday() { return parseInt(localStorage.getItem(getTodayKey()) || '0'); }
function incrementQuota() { localStorage.setItem(getTodayKey(), getUsedToday() + 1); updateSidebarStats(); }

function isQuotaExceeded(plan) { return plan !== 'pro' && getUsedToday() >= FREE_LIMIT; }

function showUpgradeModal(reason) {
    const modal = document.getElementById('upgradeModal');
    const reasonText = document.getElementById('upgradeReason');
    if (modal && reasonText) {
        reasonText.innerText = reason;
        modal.classList.add('show');
    }
}

function closeUpgradeModal() {
    const modal = document.getElementById('upgradeModal');
    if (modal) modal.classList.remove('show');
}

function updateSidebarStats() {
    const user = getSession();
    if (!user) return;
    const askedEl = document.getElementById('statAsked');
    const remEl = document.getElementById('statRemaining');
    if (askedEl && remEl) {
        if (user.plan === 'pro') {
            askedEl.innerText = '∞'; remEl.innerText = '∞';
        } else {
            const used = getUsedToday();
            askedEl.innerText = used;
            remEl.innerText = Math.max(0, FREE_LIMIT - used);
        }
    }
}