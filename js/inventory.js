// إدارة المخزون 

function loadInventoryPage() {
    updateInventoryStatistics();
    loadRecentDamages();
    initInventoryChart();
}

function updateInventoryStatistics() {
    const pharmacyDB = getPharmacyDB();
    const totalItems = pharmacyDB.medicines.length;
    const lowStockItems = pharmacyDB.medicines.filter(m => m.status === 'منخفض').length;
    const expiringItems = pharmacyDB.medicines.filter(m => m.status === 'ينتهي قريباً').length;
    const monthlyDamages = pharmacyDB.damagedMedicines.filter(d =>
        new Date(d.damageDate).getMonth() === new Date().getMonth()
    ).length;

    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('lowStockItems').textContent = lowStockItems;
    document.getElementById('expiringItems').textContent = expiringItems;
    document.getElementById('monthlyDamages').textContent = monthlyDamages;
}

function loadRecentDamages() {
    const container = document.getElementById('recentDamagesList');
    if (!container) return;

    container.innerHTML = '';

    const pharmacyDB = getPharmacyDB();
    const recentDamages = pharmacyDB.damagedMedicines.slice(-5).reverse();

    if (recentDamages.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">لا توجد تلفيات مسجلة</p>';
        return;
    }

    recentDamages.forEach(damage => {
        const damageElement = document.createElement('div');
        damageElement.className = 'border-bottom pb-2 mb-2';
        damageElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <strong>${damage.medicineName}</strong>
                    <br>
                    <small class="text-muted">الكمية: ${damage.quantity} | السبب: ${damage.reason}</small>
                </div>
                <span class="badge bg-danger">${damage.cost} ج.م</span>
            </div>
            <small class="text-muted">${damage.damageDate} - ${damage.reportedBy}</small>
        `;
        container.appendChild(damageElement);
    });
}

function initInventoryChart() {
    const ctx = document.getElementById('inventoryChart');
    if (!ctx) return;

    const pharmacyDB = getPharmacyDB();

    // تدمير الرسم البياني القديم إذا كان موجوداً 
    if (inventoryChart) {
        inventoryChart.destroy();
    }

    const categories = [...new Set(pharmacyDB.medicines.map(m => m.category))];
    const data = categories.map(category =>
        pharmacyDB.medicines.filter(m => m.category === category).length
    );

    inventoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#2c5aa0', '#34a853', '#ff6b35', '#ffc107',
                    '#6f42c1', '#e83e8c', '#20c997', '#fd7e14'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function populateDamageMedicineSelect() {
    const select = document.getElementById('damageMedicine');
    if (!select) return;

    select.innerHTML = '<option value="">اختر الدواء...</option>';

    const pharmacyDB = getPharmacyDB();
    pharmacyDB.medicines.forEach(medicine => {
        const option = document.createElement('option');
        option.value = medicine.id;
        option.textContent = `${medicine.name} (المخزون: ${medicine.stock})`;
        select.appendChild(option);
    });
}

function recordDamage() {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتسجيل التلفيات');
        return;
    }

    const medicineId = parseInt(document.getElementById('damageMedicine').value);
    const quantity = parseInt(document.getElementById('damageQuantity').value);
    const reason = document.getElementById('damageReason').value;
    const notes = document.getElementById('damageNotes').value;

    if (!medicineId || !quantity || !reason) {
        alert('يرجى ملء جميع الحقول المطلوبة');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const medicine = pharmacyDB.medicines.find(m => m.id === medicineId);
    if (!medicine) {
        alert('الدواء المحدد غير موجود');
        return;
    }

    if (quantity > medicine.stock) {
        alert('الكمية المدخلة أكبر من المخزون المتاح');
        return;
    }

    // إنشاء سجل التلفيات 
    const newDamage = {
        id: pharmacyDB.damagedMedicines.length > 0 ? Math.max(...pharmacyDB.damagedMedicines.map(d => d.id)) + 1 : 1,
        medicineId: medicineId,
        medicineName: medicine.name,
        quantity: quantity,
        damageDate: new Date().toISOString().split('T')[0],
        reason: reason,
        reportedBy: window.currentUser ? window.currentUser.name : "مستخدم غير معروف",
        approvedBy: "مدير الصيدلية",
        cost: quantity * medicine.price,
        notes: notes
    };

    pharmacyDB.damagedMedicines.push(newDamage);

    // تحديث المخزون 
    medicine.stock -= quantity;

    savePharmacyDB(pharmacyDB);

    // إغلاق النموذج 
    const modal = bootstrap.Modal.getInstance(document.getElementById('damageModal'));
    modal.hide();

    // إعادة تعيين النموذج 
    document.getElementById('damageForm').reset();

    // تحديث البيانات 
    if (currentPage === 'inventory') {
        loadInventoryPage();
    }
    updateStatistics();
    loadRecentMedicines();

    alert("تم تسجيل التلفيات بنجاح!");
}