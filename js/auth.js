// إدارة المصادقة والمستخدمين 

// تسجيل الدخول 
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // التحقق من بيانات المستخدم 
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;

        // تحديث وقت آخر دخول 
        user.lastLogin = new Date().toISOString();
        saveUsers(users);

        // حفظ حالة تسجيل الدخول 
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('currentPage', 'dashboard');

        showMainSystem();

        // تحديث الأزرار بناءً على الصلاحيات 
        updateButtonsByPermissions();
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
}

// تسجيل الخروج 
function logout() {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('currentUser');
        showLoginPage();
        document.getElementById('loginForm').reset();
    }
}

// عرض صفحة تسجيل الدخول 
function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('mainSystem').style.display = 'none';
}

// عرض النظام الرئيسي 
function showMainSystem() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainSystem').style.display = 'block';

    // تحديث معلومات المستخدم في الشريط العلوي 
    document.getElementById('userDisplayName').textContent = currentUser.name;
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileRole').textContent = getRoleName(currentUser.role);

    // تحميل البيانات الأولية 
    loadDashboard();
    updateNotificationCount();
    populateDamageMedicineSelect();
}