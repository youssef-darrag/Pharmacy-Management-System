// إدارة الموردين 

function loadSuppliersPage() {
    const container = document.getElementById('suppliersList');
    if (!container) return;

    container.innerHTML = '';

    const pharmacyDB = getPharmacyDB();
    pharmacyDB.suppliers.forEach(supplier => {
        const supplierCard = document.createElement('div');
        supplierCard.className = 'col-md-6 mb-3';
        supplierCard.innerHTML = `
            <div class="card supplier-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${supplier.name}</h5>
                        <span class="badge bg-warning text-dark">
                            ${'⭐'.repeat(Math.floor(supplier.rating))} ${supplier.rating}
                        </span>
                    </div>
                    <p class="card-text">
                        <i class="fas fa-user me-2"></i> ${supplier.contactPerson}<br>
                        <i class="fas fa-phone me-2"></i> ${supplier.phone}<br>
                        <i class="fas fa-envelope me-2"></i> ${supplier.email}
                    </p>
                    <div class="mt-auto">
                        <small class="text-muted">
                            <i class="fas fa-truck me-1"></i> التوصيل: ${supplier.deliveryTime}<br>
                            <i class="fas fa-file-invoice me-1"></i> شروط الدفع: ${supplier.paymentTerms}
                        </small>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editSupplier(${supplier.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSupplier(${supplier.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(supplierCard);
    });
}

function saveSupplier() {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لإضافة موردين');
        return;
    }

    const form = document.getElementById('supplierForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const newSupplier = {
        id: pharmacyDB.suppliers.length > 0 ? Math.max(...pharmacyDB.suppliers.map(s => s.id)) + 1 : 1,
        name: document.getElementById('supplierName').value,
        contactPerson: document.getElementById('supplierContact').value,
        phone: document.getElementById('supplierPhone').value,
        email: document.getElementById('supplierEmail').value,
        address: document.getElementById('supplierAddress').value,
        paymentTerms: document.getElementById('supplierPayment').value,
        rating: parseInt(document.getElementById('supplierRating').value),
        deliveryTime: "2-3 أيام"
    };

    pharmacyDB.suppliers.push(newSupplier);
    savePharmacyDB(pharmacyDB);

    // إغلاق النموذج 
    const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
    modal.hide();

    // إعادة تعيين النموذج 
    form.reset();

    // تحديث البيانات 
    if (currentPage === 'suppliers') {
        loadSuppliersPage();
    }

    alert("تم إضافة المورد بنجاح!");
}

function editSupplier(id) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل الموردين');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const supplier = pharmacyDB.suppliers.find(s => s.id === id);
    if (supplier) {
        // ملء النموذج ببيانات المورد 
        document.getElementById('supplierName').value = supplier.name;
        document.getElementById('supplierContact').value = supplier.contactPerson;
        document.getElementById('supplierPhone').value = supplier.phone;
        document.getElementById('supplierEmail').value = supplier.email;
        document.getElementById('supplierAddress').value = supplier.address;
        document.getElementById('supplierPayment').value = supplier.paymentTerms;
        document.getElementById('supplierRating').value = supplier.rating;

        // فتح النموذج 
        const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
        modal.show();

        // تغيير عنوان النموذج 
        document.querySelector('#supplierModal .modal-title').innerHTML = '<i class="fas fa-edit me-2"></i> تعديل المورد';

        // تغيير زر الحفظ 
        const saveBtn = document.querySelector('#supplierModal .btn-success');
        saveBtn.textContent = 'تحديث المورد';
        saveBtn.onclick = function () { updateSupplier(id); };
    }
}

function updateSupplier(id) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل الموردين');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const supplierIndex = pharmacyDB.suppliers.findIndex(s => s.id === id);
    if (supplierIndex !== -1) {
        pharmacyDB.suppliers[supplierIndex] = {
            ...pharmacyDB.suppliers[supplierIndex],
            name: document.getElementById('supplierName').value,
            contactPerson: document.getElementById('supplierContact').value,
            phone: document.getElementById('supplierPhone').value,
            email: document.getElementById('supplierEmail').value,
            address: document.getElementById('supplierAddress').value,
            paymentTerms: document.getElementById('supplierPayment').value,
            rating: parseInt(document.getElementById('supplierRating').value)
        };

        savePharmacyDB(pharmacyDB);

        // إغلاق النموذج 
        const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
        modal.hide();

        // إعادة تعيين النموذج والعنوان 
        document.querySelector('#supplierModal .modal-title').innerHTML = '<i class="fas fa-truck-loading me-2"></i> إضافة مورد جديد';
        const saveBtn = document.querySelector('#supplierModal .btn-success');
        saveBtn.textContent = 'حفظ المورد';
        saveBtn.onclick = function () { saveSupplier(); };
        document.getElementById('supplierForm').reset();

        // تحديث البيانات 
        if (currentPage === 'suppliers') {
            loadSuppliersPage();
        }

        alert("تم تحديث المورد بنجاح!");
    }
}

function deleteSupplier(id) {
    if (!checkPermission('delete')) {
        alert('ليس لديك صلاحية لحذف الموردين');
        return;
    }

    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
        const pharmacyDB = getPharmacyDB();
        pharmacyDB.suppliers = pharmacyDB.suppliers.filter(s => s.id !== id);
        savePharmacyDB(pharmacyDB);

        // تحديث البيانات 
        if (currentPage === 'suppliers') {
            loadSuppliersPage();
        }

        alert("تم حذف المورد بنجاح!");
    }
}

function searchSuppliers() {
    const searchTerm = document.getElementById('supplierSearch').value.toLowerCase();
    const ratingFilter = document.getElementById('supplierRatingFilter').value;

    const pharmacyDB = getPharmacyDB();
    const filteredSuppliers = pharmacyDB.suppliers.filter(supplier => {
        const matchesSearch = supplier.name.toLowerCase().includes(searchTerm) ||
            supplier.contactPerson.toLowerCase().includes(searchTerm);
        const matchesRating = !ratingFilter || supplier.rating >= parseInt(ratingFilter);

        return matchesSearch && matchesRating;
    });

    const container = document.getElementById('suppliersList');
    if (!container) return;

    container.innerHTML = '';

    filteredSuppliers.forEach(supplier => {
        const supplierCard = document.createElement('div');
        supplierCard.className = 'col-md-6 mb-3';
        supplierCard.innerHTML = `
            <div class="card supplier-card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${supplier.name}</h5>
                        <span class="badge bg-warning text-dark">
                            ${'⭐'.repeat(Math.floor(supplier.rating))} ${supplier.rating}
                        </span>
                    </div>
                    <p class="card-text">
                        <i class="fas fa-user me-2"></i> ${supplier.contactPerson}<br>
                        <i class="fas fa-phone me-2"></i> ${supplier.phone}<br>
                        <i class="fas fa-envelope me-2"></i> ${supplier.email}
                    </p>
                    <div class="mt-auto">
                        <small class="text-muted">
                            <i class="fas fa-truck me-1"></i> التوصيل: ${supplier.deliveryTime}<br>
                            <i class="fas fa-file-invoice me-1"></i> شروط الدفع: ${supplier.paymentTerms}
                        </small>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editSupplier(${supplier.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSupplier(${supplier.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(supplierCard);
    });
}

function filterSuppliers() {
    searchSuppliers();
}