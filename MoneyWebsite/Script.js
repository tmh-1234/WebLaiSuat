const fN = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const pN = (s) => parseFloat(s.replace(/,/g, '')) || 0;

function updateFromProperty() {
    let p = document.getElementById('property-value');
    p.value = fN(p.value.replace(/[^0-9]/g, ''));
    updateFromSlider();
}

function updateFromSlider() {
    let s = document.getElementById('loan-ratio');
    let t = document.getElementById('ratio-tooltip');
    let a = document.getElementById('amount');
    let pv = pN(document.getElementById('property-value').value);
    
    let pct = s.value;
    a.value = fN(pv * (pct / 100));
    t.innerText = pct + "%";
    t.style.left = pct + "%";
    calculateLoan();
}

function updateFromInput() {
    let a = document.getElementById('amount');
    let s = document.getElementById('loan-ratio');
    let t = document.getElementById('ratio-tooltip');
    let pv = pN(document.getElementById('property-value').value);

    a.value = fN(a.value.replace(/[^0-9]/g, ''));
    if(pv > 0) {
        let pct = (pN(a.value) / pv) * 100;
        if(pct > 100) pct = 100;
        s.value = pct;
        t.innerText = Math.round(pct) + "%";
        t.style.left = pct + "%";
    }
    calculateLoan();
}

function calculateLoan() {
    const amt = pN(document.getElementById('amount').value);
    const mths = pN(document.getElementById('months').value);
    const rateY = pN(document.getElementById('interest').value);
    const meth = document.getElementById('method').value;

    if (amt <= 0 || mths <= 0) return;
    const rM = rateY / 12 / 100;
    let tInt = 0, firstPay = 0;

    if (meth === 'flat') {
        let lM = amt * rM;
        firstPay = (amt / mths) + lM;
        tInt = lM * mths;
    } else {
        let gC = amt / mths;
        let lD = amt * rM;
        let lC = gC * rM;
        firstPay = gC + lD;
        tInt = (lD + lC) * mths / 2;
    }

    document.getElementById('monthly-payment-first').innerText = fN(firstPay) + " VND";
    document.getElementById('total-interest').innerText = fN(tInt) + " VND";
    document.getElementById('total-all').innerText = fN(amt + tInt) + " VND";
}

function openModal() {
    renderSchedule();
    document.getElementById('modal-schedule').style.display = 'block';
}

function closeModal() { document.getElementById('modal-schedule').style.display = 'none'; }

function renderSchedule() {
    const amt = pN(document.getElementById('amount').value);
    const mths = pN(document.getElementById('months').value);
    const rY = pN(document.getElementById('interest').value);
    const meth = document.getElementById('method').value;
    const sDStr = document.getElementById('disbursement-date').value;
    
    const body = document.getElementById('schedule-body');
    body.innerHTML = '';
    let remG = amt, gM = amt / mths, rM = rY / 12 / 100;
    let sD = new Date(sDStr);

    for (let i = 1; i <= mths; i++) {
        let lM = (meth === 'flat') ? (amt * rM) : (remG * rM);
        let tP = gM + lM;
        remG -= gM;
        let pD = new Date(sD); pD.setMonth(sD.getMonth() + i);
        body.innerHTML += `<tr><td>${i}</td><td>${pD.toLocaleDateString('vi-VN')}</td><td>${fN(gM)}</td><td>${fN(lM)}</td><td>${fN(tP)}</td><td>${fN(Math.max(0, remG))}</td></tr>`;
    }
}

function checkAuth() { if(!localStorage.getItem('cur')) window.location.href='Login.html'; }
function logout() { localStorage.removeItem('cur'); window.location.href='Login.html'; }

// --- XỬ LÝ ĐĂNG KÝ & ĐĂNG NHẬP ---

// Hàm xử lý Đăng Ký
function handleRegister(e) {
    e.preventDefault();
    const u = document.getElementById('reg-username').value.trim();
    const p = document.getElementById('reg-password').value;
    const c = document.getElementById('reg-confirm').value;

    if (u === "" || p === "") {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (p !== c) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Kiểm tra tên đăng nhập đã tồn tại chưa
    if (users.find(user => user.u === u)) {
        alert("Tên đăng nhập này đã tồn tại!");
        return;
    }

    users.push({ u, p });
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Đăng ký tài khoản thành công!');
    window.location.href = 'Login.html';
}

// Hàm xử lý Đăng Nhập
function handleLogin(e) {
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;

    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userFound = users.find(user => user.u === u && user.p === p);

    if (userFound) {
        localStorage.setItem('cur', u); // Lưu trạng thái đăng nhập
        window.location.href = 'Index.html';
    } else {
        alert('Tên đăng nhập hoặc mật khẩu không đúng!');
    }
}

// Kiểm tra quyền truy cập (Dùng ở Index.html)
function checkAuth() {
    if (!localStorage.getItem('cur')) {
        window.location.href = 'Login.html';
    }
}

// Đăng xuất
function logout() {
    localStorage.removeItem('cur');
    window.location.href = 'Login.html';
}

// --- LOGIC TÍNH TOÁN LÃI SUẤT (Giữ nguyên) ---

function updateFromProperty() {
    let p = document.getElementById('property-value');
    if (!p) return;
    p.value = fN(p.value.replace(/[^0-9]/g, ''));
    updateFromSlider();
}

function updateFromSlider() {
    let s = document.getElementById('loan-ratio');
    let t = document.getElementById('ratio-tooltip');
    let a = document.getElementById('amount');
    let propElem = document.getElementById('property-value');
    if (!s || !propElem) return;

    let pv = pN(propElem.value);
    let pct = s.value;
    a.value = fN(pv * (pct / 100));
    t.innerText = pct + "%";
    t.style.left = pct + "%";
    calculateLoan();
}

function updateFromInput() {
    let a = document.getElementById('amount');
    let s = document.getElementById('loan-ratio');
    let t = document.getElementById('ratio-tooltip');
    let propElem = document.getElementById('property-value');
    if (!a || !propElem) return;

    let pv = pN(propElem.value);
    a.value = fN(a.value.replace(/[^0-9]/g, ''));
    
    if (pv > 0) {
        let pct = (pN(a.value) / pv) * 100;
        if (pct > 100) pct = 100;
        s.value = pct;
        t.innerText = Math.round(pct) + "%";
        t.style.left = pct + "%";
    }
    calculateLoan();
}

function calculateLoan() {
    const amtElem = document.getElementById('amount');
    if (!amtElem) return;

    const amt = pN(amtElem.value);
    const mths = pN(document.getElementById('months').value);
    const rateY = pN(document.getElementById('interest').value);
    const meth = document.getElementById('method').value;

    if (amt <= 0 || mths <= 0) return;
    const rM = rateY / 12 / 100;
    let tInt = 0, firstPay = 0;

    if (meth === 'flat') {
        let lM = amt * rM;
        firstPay = (amt / mths) + lM;
        tInt = lM * mths;
    } else {
        let gC = amt / mths;
        let lD = amt * rM;
        let lC = gC * rM;
        firstPay = gC + lD;
        tInt = (lD + lC) * mths / 2;
    }

    document.getElementById('monthly-payment-first').innerText = fN(firstPay) + " VND";
    document.getElementById('total-interest').innerText = fN(tInt) + " VND";
    document.getElementById('total-all').innerText = fN(amt + tInt) + " VND";
}

function openModal() {
    renderSchedule();
    document.getElementById('modal-schedule').style.display = 'block';
}

function closeModal() { document.getElementById('modal-schedule').style.display = 'none'; }

function renderSchedule() {
    const amt = pN(document.getElementById('amount').value);
    const mths = pN(document.getElementById('months').value);
    const rY = pN(document.getElementById('interest').value);
    const meth = document.getElementById('method').value;
    const sDStr = document.getElementById('disbursement-date').value;
    
    const body = document.getElementById('schedule-body');
    if (!body) return;
    body.innerHTML = '';
    let remG = amt, gM = amt / mths, rM = rY / 12 / 100;
    let sD = sDStr ? new Date(sDStr) : new Date();

    for (let i = 1; i <= mths; i++) {
        let lM = (meth === 'flat') ? (amt * rM) : (remG * rM);
        let tP = gM + lM;
        remG -= gM;
        let pD = new Date(sD); pD.setMonth(sD.getMonth() + i);
        body.innerHTML += `<tr><td>${i}</td><td>${pD.toLocaleDateString('vi-VN')}</td><td>${fN(gM)}</td><td>${fN(lM)}</td><td>${fN(tP)}</td><td>${fN(Math.max(0, remG))}</td></tr>`;
    }
}