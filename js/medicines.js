// إدارة الأدوية

function loadMedicines() {
    const tableBody = document.getElementById('medicinesTable');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const pharmacyDB = getPharmacyDB();
    pharmacyDB.medicines.forEach(medicine => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${medicine.id}</td>
            <td>${medicine.name}</td>
            <td>${medicine.barcode}</td>
            <td>${medicine.activeIngredient}</td>
            <td>${medicine.category}</td>
            <td>${medicine.price.toFixed(2)} ج.م</td>
            <td>${medicine.stock}</td>
            <td>${medicine.minStock}</td>
            <td>${medicine.expirationDate || 'غير محدد'}</td>
            <td><span class="badge bg-${getStockBadgeColor(medicine.status)}">${medicine.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editMedicine(${medicine.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteMedicine(${medicine.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function saveMedicine() {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لإضافة أدوية');
        return;
    }

    const form = document.getElementById('medicineForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const newMedicine = {
        id: pharmacyDB.medicines.length > 0 ? Math.max(...pharmacyDB.medicines.map(m => m.id)) + 1 : 1,
        name: document.getElementById('medicineName').value,
        barcode: document.getElementById('barcode').value,
        activeIngredient: document.getElementById('activeIngredient').value,
        category: document.getElementById('category').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        minStock: parseInt(document.getElementById('minStock').value),
        expirationDate: document.getElementById('expiration').value,
        supplier: document.getElementById('supplier').options[document.getElementById('supplier').selectedIndex].text,
        status: "جيد"
    };

    // تحديث حالة الدواء بناءً على المخزون 
    if (newMedicine.stock <= newMedicine.minStock) {
        newMedicine.status = "منخفض";
    }

    pharmacyDB.medicines.push(newMedicine);
    savePharmacyDB(pharmacyDB);

    // إغلاق النموذج 
    const modal = bootstrap.Modal.getInstance(document.getElementById('addMedicineModal'));
    modal.hide();

    // إعادة تعيين النموذج 
    form.reset();

    // تحديث البيانات 
    updateStatistics();
    loadRecentMedicines();
    if (currentPage === 'medicines') {
        loadMedicines();
    }

    alert("تم إضافة الدواء بنجاح!");
}

function editMedicine(id) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل الأدوية');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const medicine = pharmacyDB.medicines.find(m => m.id === id);
    if (medicine) {
        // ملء النموذج ببيانات الدواء 
        document.getElementById('medicineName').value = medicine.name;
        document.getElementById('barcode').value = medicine.barcode;
        document.getElementById('activeIngredient').value = medicine.activeIngredient;
        document.getElementById('category').value = medicine.category;
        document.getElementById('price').value = medicine.price;
        document.getElementById('stock').value = medicine.stock;
        document.getElementById('minStock').value = medicine.minStock;
        document.getElementById('expiration').value = medicine.expirationDate;

        // فتح النموذج 
        const modal = new bootstrap.Modal(document.getElementById('addMedicineModal'));
        modal.show();

        // تغيير عنوان النموذج 
        document.querySelector('#addMedicineModal .modal-title').innerHTML = '<i class="fas fa-edit me-2"></i> تعديل الدواء';

        // تغيير زر الحفظ 
        const saveBtn = document.querySelector('#addMedicineModal .btn-primary');
        saveBtn.textContent = 'تحديث الدواء';
        saveBtn.onclick = function () { updateMedicine(id); };
    }
}

function updateMedicine(id) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل الأدوية');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const medicineIndex = pharmacyDB.medicines.findIndex(m => m.id === id);
    if (medicineIndex !== -1) {
        pharmacyDB.medicines[medicineIndex] = {
            ...pharmacyDB.medicines[medicineIndex],
            name: document.getElementById('medicineName').value,
            barcode: document.getElementById('barcode').value,
            activeIngredient: document.getElementById('activeIngredient').value,
            category: document.getElementById('category').value,
            price: parseFloat(document.getElementById('price').value),
            stock: parseInt(document.getElementById('stock').value),
            minStock: parseInt(document.getElementById('minStock').value),
            expirationDate: document.getElementById('expiration').value
        };

        // تحديث حالة الدواء 
        if (pharmacyDB.medicines[medicineIndex].stock <= pharmacyDB.medicines[medicineIndex].minStock) {
            pharmacyDB.medicines[medicineIndex].status = "منخفض";
        } else {
            pharmacyDB.medicines[medicineIndex].status = "جيد";
        }

        savePharmacyDB(pharmacyDB);

        // إغلاق النموذج 
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMedicineModal'));
        modal.hide();

        // إعادة تعيين النموذج والعنوان 
        document.querySelector('#addMedicineModal .modal-title').innerHTML = '<i class="fas fa-pills me-2"></i> إضافة دواء جديد';
        const saveBtn = document.querySelector('#addMedicineModal .btn-primary');
        saveBtn.textContent = 'حفظ الدواء';
        saveBtn.onclick = function () { saveMedicine(); };
        document.getElementById('medicineForm').reset();

        // تحديث البيانات 
        updateStatistics();
        loadRecentMedicines();
        if (currentPage === 'medicines') {
            loadMedicines();
        }

        alert("تم تحديث الدواء بنجاح!");
    }
}

function deleteMedicine(id) {
    if (!checkPermission('delete')) {
        alert('ليس لديك صلاحية لحذف الأدوية');
        return;
    }

    if (confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
        const pharmacyDB = getPharmacyDB();
        pharmacyDB.medicines = pharmacyDB.medicines.filter(m => m.id !== id);
        savePharmacyDB(pharmacyDB);

        // تحديث البيانات 
        updateStatistics();
        loadRecentMedicines();
        if (currentPage === 'medicines') {
            loadMedicines();
        }

        alert("تم حذف الدواء بنجاح!");
    }
}

function searchMedicines() {
    const searchTerm = document.getElementById('medicineSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const pharmacyDB = getPharmacyDB();
    const filteredMedicines = pharmacyDB.medicines.filter(medicine => {
        const matchesSearch = medicine.name.toLowerCase().includes(searchTerm) ||
            medicine.activeIngredient.toLowerCase().includes(searchTerm) ||
            medicine.barcode.includes(searchTerm);
        const matchesCategory = !categoryFilter || medicine.category === categoryFilter;
        const matchesStatus = !statusFilter || medicine.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const tableBody = document.getElementById('medicinesTable');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    filteredMedicines.forEach(medicine => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${medicine.id}</td>
                    <td>${medicine.name}</td>
                    <td>${medicine.barcode}</td>
                    <td>${medicine.activeIngredient}</td>
                    <td>${medicine.category}</td>
                    <td>${medicine.price.toFixed(2)} ج.م</td>
                    <td>${medicine.stock}</td>
                    <td>${medicine.minStock}</td>
                    <td>${medicine.expirationDate || 'غير محدد'}</td>
                    <td><span class="badge bg-${getStockBadgeColor(medicine.status)}">${medicine.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editMedicine(${medicine.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteMedicine(${medicine.id})"><i class="fas fa-trash"></i></button>
                    </td>
                `;
        tableBody.appendChild(row);
    });
}

function filterMedicines() {
    searchMedicines();
}