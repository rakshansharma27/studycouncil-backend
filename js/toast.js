const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
toastContainer.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:10px;';
document.body.appendChild(toastContainer);

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bg = type === 'error' ? '#ff4444' : 'var(--surface)';
    const border = type === 'error' ? '#cc0000' : 'var(--orange)';

    toast.style.cssText = `background:${bg}; border:1px solid ${border}; color:#fff; padding:15px 25px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.5); transform:translateX(120%); transition:transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-weight:600;`;
    toast.innerText = message;

    toastContainer.appendChild(toast);
    setTimeout(() => { toast.style.transform = 'translateX(0)'; }, 10);

    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}