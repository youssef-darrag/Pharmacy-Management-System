// دوال مساعدة عامة 
function getPharmacyDB() {
    const storedDB = localStorage.getItem('pharmacyDB');
    if (storedDB) {
        return JSON.parse(storedDB);
    } else {
        // قاعدة البيانات الافتراضية 
        const defaultDB = {
            medicines: [
                {
                    id: 1,
                    name: "باراسيتامول 500mg",
                    barcode: "123456789012",
                    activeIngredient: "باراسيتامول",
                    category: "مسكنات",
                    price: 15.00,
                    stock: 8,
                    minStock: 10,
                    expirationDate: "2026-12-31",
                    supplier: "شركة الأدوية المصرية",
                    status: "منخفض"
                },
                {
                    id: 2,
                    name: "أموكسيسيلين 250mg",
                    barcode: "123456789013",
                    activeIngredient: "أموكسيسيلين",
                    category: "مضادات حيوية",
                    price: 32.50,
                    stock: 45,
                    minStock: 5,
                    expirationDate: "2025-11-15",
                    supplier: "شركة فارمكس",
                    status: "ينتهي قريباً"
                },
                {
                    id: 3,
                    name: "فيتامين C 1000mg",
                    barcode: "123456789014",
                    activeIngredient: "حمض الأسكوربيك",
                    category: "فيتامينات",
                    price: 75.00,
                    stock: 12,
                    minStock: 15,
                    expirationDate: "2026-08-20",
                    supplier: "شركة سيديكو",
                    status: "منخفض"
                },
                {
                    id: 4,
                    name: "أدفيل 400mg",
                    barcode: "123456789015",
                    activeIngredient: "ايبوبروفين",
                    category: "مسكنات",
                    price: 28.00,
                    stock: 25,
                    minStock: 10,
                    expirationDate: "2027-03-15",
                    supplier: "شركة الأدوية المصرية",
                    status: "جيد"
                },
                {
                    id: 5,
                    name: "فنتولين 100mcg",
                    barcode: "123456789016",
                    activeIngredient: "سالبيوتامول",
                    category: "أدوية مزمنة",
                    price: 42.00,
                    stock: 18,
                    minStock: 8,
                    expirationDate: "2026-06-30",
                    supplier: "شركة فارمكس",
                    status: "جيد"
                }
            ],
            sales: [
                {
                    id: 1,
                    invoiceNumber: "INV-20251015-001",
                    customerName: "أحمد محمد",
                    items: [
                        { medicineId: 1, name: "باراسيتامول 500mg", unitPrice: 15.00, quantity: 2, total: 30.00 }
                    ],
                    totalAmount: 30.00,
                    paymentMethod: "نقدي",
                    saleDate: "2025-10-15T10:30:00"
                },
                {
                    id: 2,
                    invoiceNumber: "INV-20251018-002",
                    customerName: "أحمد محمود",
                    items: [
                        { medicineId: 4, name: "أدفيل 400mg", unitPrice: 28.00, quantity: 1, total: 28.00 },
                        { medicineId: 5, name: "فنتولين 100mcg", unitPrice: 42.00, quantity: 1, total: 42.00 }
                    ],
                    totalAmount: 70.00,
                    paymentMethod: "بطاقة",
                    saleDate: "2025-10-18T14:15:00"
                }
            ],
            alerts: [
                {
                    id: 1,
                    type: "low_stock",
                    message: "باراسيتامول 500mg - المخزون: 8 عبوات فقط",
                    priority: "high",
                    medicineId: 1,
                    alertDate: "2025-10-18",
                    resolved: false
                },
                {
                    id: 2,
                    type: "expiration",
                    message: "أموكسيسيلين 250mg - تنتهي صلاحيته في: 15/11/2025",
                    priority: "high",
                    medicineId: 2,
                    alertDate: "2025-10-19",
                    resolved: false
                },
                {
                    id: 3,
                    type: "low_stock",
                    message: "فيتامين C 1000mg - المخزون: 12 عبوة فقط",
                    priority: "medium",
                    medicineId: 3,
                    alertDate: "2025-10-17",
                    resolved: false
                }
            ],
            currentSale: {
                items: [],
                customerName: "",
                paymentMethod: "نقدي",
                total: 0
            },
            damagedMedicines: [
                {
                    id: 1,
                    medicineId: 1,
                    medicineName: "باراسيتامول 500mg",
                    quantity: 2,
                    damageDate: "2025-09-28",
                    reason: "انتهاء الصلاحية",
                    reportedBy: "د. محمد أحمد",
                    approvedBy: "مدير الصيدلية",
                    cost: 30.00
                }
            ],
            suppliers: [
                {
                    id: 1,
                    name: "شركة الأدوية المصرية",
                    contactPerson: "أحمد محمد",
                    phone: "01234567890",
                    email: "info@egypt-pharma.com",
                    address: "القاهرة - مصر",
                    paymentTerms: "30 يوم",
                    rating: 4.5,
                    deliveryTime: "2-3 أيام"
                },
                {
                    id: 2,
                    name: "شركة فارمكس",
                    contactPerson: "أحمد علي",
                    phone: "01234567891",
                    email: "contact@pharmex.com",
                    address: "الإسكندرية - مصر",
                    paymentTerms: "15 يوم",
                    rating: 4.2,
                    deliveryTime: "1-2 أيام"
                }
            ],
            systemSettings: {
                pharmacyName: "صيدلية د/محمد",
                pharmacyAddress: "المحلة الكبرى - مقابل مطعم السندباد بتاع الكشري😂",
                pharmacyPhone: "01234567890",
                pharmacyEmail: "info@elite-pharmacy.com"
            }
        };
        localStorage.setItem('pharmacyDB', JSON.stringify(defaultDB));
        return defaultDB;
    }
}

function savePharmacyDB(db) {
    localStorage.setItem('pharmacyDB', JSON.stringify(db));
}

function getUsers() {
    const storedUsers = localStorage.getItem('pharmacyUsers');
    if (storedUsers) {
        return JSON.parse(storedUsers);
    } else {
        // المستخدم الافتراضي (المدير) 
        const defaultUsers = [
            {
                id: 1,
                username: "admin",
                password: "admin123",
                name: "د. محمد أحمد",
                role: "admin",
                fullName: "محمد أحمد",
                permissions: ["read", "write", "delete", "approve"],
                isActive: true,
                lastLogin: new Date().toISOString()
            }
        ];
        localStorage.setItem('pharmacyUsers', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
}

function saveUsers(users) {
    localStorage.setItem('pharmacyUsers', JSON.stringify(users));
}

// بيانات الإشعارات 
const notifications = [
    { id: 1, title: "مخزون منخفض", message: "باراسيتامول 500mg - المخزون: 8 عبوات فقط", time: "منذ 5 دقائق", read: false, type: "warning" },
    { id: 2, title: "انتهاء الصلاحية", message: "أموكسيسيلين 250mg - تنتهي صلاحيته في: 15/10/2023", time: "منذ ساعة", read: false, type: "danger" },
    { id: 3, title: "طلب جديد", message: "تم استلام طلب جديد من العميل محمد أحمد", time: "منذ ساعتين", read: true, type: "info" },
    { id: 4, title: "تقرير المبيعات", message: "تم إنشاء تقرير المبيعات الشهري بنجاح", time: "منذ 3 ساعات", read: true, type: "success" },
    { id: 5, title: "تحديث النظام", message: "تم تحديث النظام إلى الإصدار 2.5.1", time: "منذ يوم", read: true, type: "primary" }
];

// دالة التحقق من الصلاحيات 
function checkPermission(permission) {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission);
}

// تحديث الأزرار بناءً على الصلاحيات 
function updateButtonsByPermissions() {
    // إخفاء الأزرار التي لا يمتلك المستخدم صلاحيات لها 
    if (!checkPermission('write')) {
        const addButtons = document.querySelectorAll('#addMedicineBtn, #addMedicineBtn2, #addSupplierBtn, #addEmployeeBtn, #damageBtn, #inventoryBtn');
        addButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
    }

    if (!checkPermission('delete')) {
        // إخفاء أزرار الحذف 
        const deleteButtons = document.querySelectorAll('.btn-outline-danger');
        deleteButtons.forEach(btn => {
            if (btn.innerHTML.includes('fa-trash')) {
                btn.style.display = 'none';
            }
        });
    }

    if (!checkPermission('approve')) {
        const approveButtons = document.querySelectorAll('#markAllReadBtn, #printReportBtn, #exportReportBtn');
        approveButtons.forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
    }
}

function getRoleName(role) {
    const roleNames = {
        'admin': 'مدير النظام',
        'pharmacist': 'صيدلي',
        'assistant': 'مساعد صيدلي',
        'delivery': 'موظف توصيل',
        'cleaner': 'عامل نظافة'
    };
    return roleNames[role] || role;
}

function getStockBadgeColor(status) {
    switch (status) {
        case 'منخفض': return 'danger';
        case 'ينتهي قريباً': return 'warning';
        default: return 'success';
    }
}

// تحميل الإشعارات 
function loadNotifications() {
    const notificationList = document.getElementById('notificationList');
    if (!notificationList) return;

    notificationList.innerHTML = '';

    notifications.forEach(notification => {
        const notificationClass = notification.read ? 'notification-item' : 'notification-item unread';
        const notificationElement = document.createElement('div');
        notificationElement.className = notificationClass;
        notificationElement.innerHTML = `
            <div class="d-flex w-100 justify-content-between">
                <h6 class="mb-1">${notification.title}</h6>
                <small class="notification-time">${notification.time}</small>
            </div>
            <p class="mb-1">${notification.message}</p>
        `;
        notificationElement.addEventListener('click', function () {
            markNotificationAsRead(notification.id);
        });
        notificationList.appendChild(notificationElement);
    });
}

// تحديث عدد الإشعارات غير المقروءة 
function updateNotificationCount() {
    const unreadCount = notifications.filter(n => !n.read).length;
    const notificationCountElement = document.getElementById('notificationCount');
    if (notificationCountElement) {
        notificationCountElement.textContent = unreadCount;
    }
    updateAlertsCount();
}

// تحديث عدد التنبيهات 
function updateAlertsCount() {
    const pharmacyDB = getPharmacyDB();
    const unresolvedAlerts = pharmacyDB.alerts.filter(alert => !alert.resolved).length;
    const alertsCountElement = document.getElementById('alertsCount');
    if (alertsCountElement) {
        alertsCountElement.textContent = unresolvedAlerts;
    }
}

// تعليم إشعار كمقروء 
function markNotificationAsRead(id) {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
        notification.read = true;
        updateNotificationCount();

        // إعادة تحميل قائمة الإشعارات 
        loadNotifications();
    }
}