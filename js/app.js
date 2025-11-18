// متغيرات التطبيق 
let currentUser = null;
let currentPage = 'dashboard';
let nextMedicineId = 6;
let nextSaleId = 3;
let nextSupplierId = 3;
let nextEmployeeId = 2;
let nextDamageId = 2;
let salesChart = null;
let inventoryChart = null;
let pharmacyDB = getPharmacyDB();

// تهيئة التطبيق 
document.addEventListener('DOMContentLoaded', function () {
    // التحقق إذا كان المستخدم مسجل الدخول مسبقاً 
    const savedUser = localStorage.getItem('currentUser');
    const savedPage = localStorage.getItem('currentPage');

    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainSystem();

        // استعادة الصفحة السابقة إذا كانت موجودة 
        if (savedPage) {
            currentPage = savedPage;
            showPage(savedPage, false); // false يعني لا تحفظ في localStorage 
        }

        // تحديث الأزرار بناءً على الصلاحيات 
        updateButtonsByPermissions();
    } else {
        showLoginPage();
    }

    // إعداد نموذج تسجيل الدخول 
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        login();
    });

    // تحميل الإشعارات 
    loadNotifications();

    // إعداد زر استعادة كلمة المرور 
    document.getElementById('forgotPassword').addEventListener('click', function (e) {
        e.preventDefault();
        alert('سيتم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني');
    });
});

// تغيير الصورة الشخصية 
function changeProfilePicture() {
    alert('سيتم فتح نافذة لاختيار صورة جديدة');
    // في التطبيق الحقيقي، سيتم رفع صورة جديدة 
}

// تحديث الملف الشخصي 
function updateProfile() {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل الملف الشخصي');
        return;
    }

    const firstName = document.getElementById('profileFirstName').value;
    const lastName = document.getElementById('profileLastName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    const address = document.getElementById('profileAddress').value;
    const bio = document.getElementById('profileBio').value;

    // تحديث اسم المستخدم في الشريط العلوي 
    currentUser.name = `${firstName} ${lastName}`;
    document.getElementById('userDisplayName').textContent = currentUser.name;
    document.getElementById('profileName').textContent = currentUser.name;

    // تحديث بيانات المستخدم في قاعدة البيانات 
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].name = currentUser.name;
        users[userIndex].fullName = `${firstName} ${lastName}`;
        saveUsers(users);
    }

    alert('تم تحديث الملف الشخصي بنجاح');
}

// عرض الصفحات 
function showPage(pageId, saveToStorage = true) {
    // إخفاء جميع الصفحات 
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // إزالة النشاط من جميع روابط القائمة 
    document.querySelectorAll('.sidebar .nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // إظهار الصفحة المطلوبة 
    document.getElementById(pageId).classList.add('active');

    // إضافة النشاط للرابط المحدد 
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    for (let link of navLinks) {
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(pageId)) {
            link.classList.add('active');
            break;
        }
    }

    // تحديث عنوان الصفحة 
    updatePageTitle(pageId);

    // حفظ الصفحة الحالية في localStorage 
    if (saveToStorage) {
        localStorage.setItem('currentPage', pageId);
        currentPage = pageId;
    }

    // تحميل بيانات الصفحة 
    switch (pageId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'medicines':
            loadMedicines();
            break;
        case 'sales':
            loadSalesPage();
            break;
        case 'inventory':
            loadInventoryPage();
            break;
        case 'alerts':
            loadAlertsPage();
            break;
        case 'reports':
            loadReportsPage();
            break;
        case 'suppliers':
            loadSuppliersPage();
            break;
        case 'employees':
            loadEmployeesPage();
            break;
    }
}

function updatePageTitle(pageId) {
    const titles = {
        'dashboard': 'لوحة التحكم',
        'medicines': 'إدارة الأدوية',
        'sales': 'نقاط البيع',
        'inventory': 'إدارة المخزون',
        'alerts': 'التنبيهات والإشعارات',
        'reports': 'التقارير والإحصائيات',
        'suppliers': 'إدارة الموردين',
        'employees': 'إدارة الموظفين',
        'delivery': 'خدمة التوصيل',
        'settings': 'الإعدادات',
        'profile': 'الملف الشخصي'
    };
    document.getElementById('pageTitle').textContent = titles[pageId] || 'لوحة التحكم';
}

// تحميل لوحة التحكم 
function loadDashboard() {
    updateStatistics();
    loadRecentMedicines();
    loadAlertsList();
    initSalesChart();
}

function updateStatistics() {
    const totalMedicines = pharmacyDB.medicines.length;
    const lowStockMedicines = pharmacyDB.medicines.filter(m => m.status === 'منخفض').length;

    document.getElementById('totalMedicines').textContent = totalMedicines;
    document.getElementById('lowStockCount').textContent = lowStockMedicines;
}

function loadRecentMedicines() {
    const tableBody = document.getElementById('recentMedicinesTable');
    tableBody.innerHTML = '';

    // عرض آخر 5 أدوية 
    const recentMedicines = pharmacyDB.medicines.slice(0, 5);

    recentMedicines.forEach(medicine => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${medicine.name}</td>
                    <td>${medicine.activeIngredient}</td>
                    <td>${medicine.price.toFixed(2)} ج.م</td>
                    <td>${medicine.stock} <span class="badge bg-${getStockBadgeColor(medicine.status)}">${medicine.status}</span></td>
                    <td><span class="badge bg-success">متوفر</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editMedicine(${medicine.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMedicine(${medicine.id})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
        tableBody.appendChild(row);
    });
}

function loadAlertsList() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';

    pharmacyDB.alerts.slice(0, 3).forEach(alert => {
        const alertClass = alert.priority === 'high' ? 'danger' : 'warning';
        const alertIcon = alert.type === 'low_stock' ? 'fa-pills' : 'fa-skull-crossbones';

        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${alertClass} d-flex align-items-center mb-3`;
        alertElement.innerHTML = `
                    <i class="fas ${alertIcon} fa-2x me-3"></i>
                    <div>
                        <h6 class="alert-heading">${alert.message.split(' - ')[0]}</h6>
                        <p class="mb-0">${alert.message.split(' - ')[1]}</p>
                    </div>
                `;
        alertsList.appendChild(alertElement);
    });
}

function initSalesChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');

    // تدمير الرسم البياني القديم إذا كان موجوداً 
    if (salesChart) {
        salesChart.destroy();
    }

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'],
            datasets: [{
                label: 'المبيعات (ج.م)',
                data: [650, 1250, 980, 1750, 1420, 2100, 1650],
                borderColor: '#2c5aa0',
                backgroundColor: 'rgba(44, 90, 160, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// تحميل إعدادات النظام عند فتح صفحة الإعدادات 
document.addEventListener('DOMContentLoaded', function () {
    // إضافة مستمع حدث لصفحة الإعدادات 
    document.addEventListener('click', function (e) {
        if (e.target && (e.target.getAttribute('onclick') === "showPage('settings')" ||
            e.target.parentElement && e.target.parentElement.getAttribute('onclick') === "showPage('settings')")) {
            loadSystemSettings();
        }
    });
});