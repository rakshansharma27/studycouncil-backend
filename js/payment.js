const RAZORPAY_KEY = 'rzp_live_SMhTI5qPFEyGCz'; // replace with your real key later

function initiatePayment(plan) {
    const user = getSession();
    if (!user) { window.location.href = 'login.html'; return; }

    const amounts = { monthly: 29900, yearly: 238800 };
    const labels = { monthly: 'StudyCouncil Pro Monthly', yearly: 'StudyCouncil Pro Yearly' };

    const options = {
        key: RAZORPAY_KEY,
        amount: amounts[plan],
        currency: 'INR',
        name: 'StudyCouncil',
        description: labels[plan],
        prefill: { name: user.name, email: user.email },
        theme: { color: '#7C3AED' },
        handler: function (response) {
            upgradeToPro(user, response.razorpay_payment_id);
        },
        modal: {
            ondismiss: function () { showToast('Payment cancelled', 'info'); }
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

function upgradeToPro(user, paymentId) {
    user.plan = 'pro';
    user.paymentId = paymentId;
    user.upgradedAt = new Date().toISOString();
    localStorage.setItem('sc_session', JSON.stringify(user));

    const users = JSON.parse(localStorage.getItem('sc_users') || '[]');
    const idx = users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
        users[idx].plan = 'pro';
        localStorage.setItem('sc_users', JSON.stringify(users));
    }

    showToast('🎉 Welcome to Pro! All features unlocked.', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 1500);
}