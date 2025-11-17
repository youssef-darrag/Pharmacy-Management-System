// إدارة المبيعات 

function loadSalesPage() {
    loadQuickMedicines();
    loadRecentSales();
    updateSaleTotal();
}

function loadQuickMedicines() {
    const quickList = document.getElementById('quickMedicinesList');
    if (!quickList) return;

    quickList.innerHTML = '';

    const pharmacyDB = getPharmacyDB();
    pharmacyDB.medicines.forEach(medicine => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-outline-primary btn-sm';
        button.innerHTML = `<i class="fas fa-plus me-1"></i> ${medicine.name}`;
        button.onclick = function () { addToSale(medicine.id); };
        quickList.appendChild(button);
    });
}

function addToSale(medicineId) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لإضافة مبيعات');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const medicine = pharmacyDB.medicines.find(m => m.id === medicineId);
    if (!medicine) return;

    // التحقق من توفر المخزون 
    if (medicine.stock <= 0) {
        alert('عذراً، هذا الدواء غير متوفر في المخزون');
        return;
    }

    // التحقق إذا كان الدواء مضافاً مسبقاً 
    const existingItem = pharmacyDB.currentSale.items.find(item => item.medicineId === medicineId);
    if (existingItem) {
        if (existingItem.quantity >= medicine.stock) {
            alert('عذراً، لا يمكن إضافة كمية أكبر من المتاح في المخزون');
            return;
        }
        existingItem.quantity++;
        existingItem.total = existingItem.quantity * existingItem.unitPrice;
    } else {
        pharmacyDB.currentSale.items.push({
            medicineId: medicine.id,
            name: medicine.name,
            unitPrice: medicine.price,
            quantity: 1,
            total: medicine.price
        });
    }

    savePharmacyDB(pharmacyDB);
    updateSaleTable();
    updateSaleTotal();
}

function updateSaleTable() {
    const tableBody = document.getElementById('saleItemsTable');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const pharmacyDB = getPharmacyDB();
    pharmacyDB.currentSale.items.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.unitPrice.toFixed(2)} ج.م</td>
            <td>
                <div class="input-group input-group-sm" style="width: 120px;">
                    <button class="btn btn-outline-secondary" style="height: 30px; transform: rotate(180deg);" type="button" onclick="updateSaleQuantity(${index}, -1)">-</button>
                    <input type="number" class="form-control text-center" value="${item.quantity}" min="1" onchange="updateSaleQuantityInput(${index}, this.value)">
                    <button class="btn btn-outline-secondary" style="height: 30px; transform: rotate(180deg);" type="button" onclick="updateSaleQuantity(${index}, 1)">+</button>
                </div>
            </td>
            <td>${item.total.toFixed(2)} ج.م</td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromSale(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateSaleQuantity(index, change) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل المبيعات');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const item = pharmacyDB.currentSale.items[index];
    const medicine = pharmacyDB.medicines.find(m => m.id === item.medicineId);

    const newQuantity = item.quantity + change;
    if (newQuantity < 1) {
        removeFromSale(index);
        return;
    }

    if (newQuantity > medicine.stock) {
        alert('عذراً، لا يمكن إضافة كمية أكبر من المتاح في المخزون');
        return;
    }

    item.quantity = newQuantity;
    item.total = item.quantity * item.unitPrice;

    savePharmacyDB(pharmacyDB);
    updateSaleTable();
    updateSaleTotal();
}

function updateSaleQuantityInput(index, value) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل المبيعات');
        return;
    }

    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) {
        updateSaleTable(); // إعادة تعيين القيمة 
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const item = pharmacyDB.currentSale.items[index];
    const medicine = pharmacyDB.medicines.find(m => m.id === item.medicineId);

    if (quantity > medicine.stock) {
        alert('عذراً، لا يمكن إضافة كمية أكبر من المتاح في المخزون');
        updateSaleTable(); // إعادة تعيين القيمة 
        return;
    }

    item.quantity = quantity;
    item.total = item.quantity * item.unitPrice;

    savePharmacyDB(pharmacyDB);
    updateSaleTable();
    updateSaleTotal();
}

function removeFromSale(index) {
    if (!checkPermission('delete')) {
        alert('ليس لديك صلاحية لحذف العناصر من المبيعات');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    pharmacyDB.currentSale.items.splice(index, 1);
    savePharmacyDB(pharmacyDB);
    updateSaleTable();
    updateSaleTotal();
}

function updateSaleTotal() {
    const pharmacyDB = getPharmacyDB();
    const total = pharmacyDB.currentSale.items.reduce((sum, item) => sum + item.total, 0);
    pharmacyDB.currentSale.total = total;
    savePharmacyDB(pharmacyDB);

    const saleTotalElement = document.getElementById('saleTotal');
    if (saleTotalElement) {
        saleTotalElement.textContent = total.toFixed(2);
    }
}

function searchSaleMedicines() {
    const searchTerm = document.getElementById('saleSearch').value.toLowerCase();
    if (searchTerm.length < 2) return;

    const pharmacyDB = getPharmacyDB();
    const results = pharmacyDB.medicines.filter(medicine =>
        medicine.name.toLowerCase().includes(searchTerm) ||
        medicine.barcode.includes(searchTerm)
    );

    if (results.length > 0) {
        // إضافة أول نتيجة تلقائياً 
        addToSale(results[0].id);
        document.getElementById('saleSearch').value = '';
    }
}

function completeSale() {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لإتمام البيع');
        return;
    }

    const pharmacyDB = getPharmacyDB();

    if (pharmacyDB.currentSale.items.length === 0) {
        alert('يرجى إضافة أدوية إلى الفاتورة أولاً');
        return;
    }

    const customerName = document.getElementById('customerName').value || 'عميل نقدي';
    const paymentMethod = document.getElementById('paymentMethod').value;

    // إنشاء فاتورة جديدة 
    const newSale = {
        id: pharmacyDB.sales.length > 0 ? Math.max(...pharmacyDB.sales.map(s => s.id)) + 1 : 1,
        invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${pharmacyDB.sales.length + 1}`,
        customerName: customerName,
        items: [...pharmacyDB.currentSale.items],
        totalAmount: pharmacyDB.currentSale.total,
        paymentMethod: paymentMethod,
        saleDate: new Date().toISOString()
    };

    // تحديث المخزون 
    newSale.items.forEach(saleItem => {
        const medicine = pharmacyDB.medicines.find(m => m.id === saleItem.medicineId);
        if (medicine) {
            medicine.stock -= saleItem.quantity;

            // تحديث حالة الدواء 
            if (medicine.stock <= medicine.minStock) {
                medicine.status = "منخفض";
            }
        }
    });

    // إضافة إلى سجل المبيعات 
    pharmacyDB.sales.push(newSale);

    // إعادة تعيين عملية البيع الحالية 
    pharmacyDB.currentSale = {
        items: [],
        customerName: "",
        paymentMethod: "نقدي",
        total: 0
    };

    savePharmacyDB(pharmacyDB);

    // تحديث الواجهة 
    updateSaleTable();
    updateSaleTotal();
    document.getElementById('customerName').value = '';
    loadRecentSales();
    updateStatistics();
    loadRecentMedicines();

    alert(`تم إتمام البيع بنجاح! رقم الفاتورة: ${newSale.invoiceNumber}\nالمجموع: ${newSale.totalAmount.toFixed(2)} ج.م`);
}

function newSale() {
    const pharmacyDB = getPharmacyDB();

    if (pharmacyDB.currentSale.items.length > 0 && !confirm('هل تريد إنشاء فاتورة جديدة؟ سيتم إلغاء الفاتورة الحالية.')) {
        return;
    }

    pharmacyDB.currentSale = {
        items: [],
        customerName: "",
        paymentMethod: "نقدي",
        total: 0
    };

    savePharmacyDB(pharmacyDB);

    updateSaleTable();
    updateSaleTotal();
    document.getElementById('customerName').value = '';
}

function loadRecentSales() {
    const recentSalesList = document.getElementById('recentSalesList');
    if (!recentSalesList) return;

    recentSalesList.innerHTML = '';

    const pharmacyDB = getPharmacyDB();

    // عرض آخر 5 مبيعات 
    const recentSales = pharmacyDB.sales.slice(-5).reverse();

    if (recentSales.length === 0) {
        recentSalesList.innerHTML = '<p class="text-muted text-center">لا توجد مبيعات سابقة</p>';
        return;
    }

    recentSales.forEach(sale => {
        const saleElement = document.createElement('div');
        saleElement.className = 'border-bottom pb-2 mb-2';
        saleElement.innerHTML = `
            <div class="d-flex justify-content-between">
                <strong>${sale.invoiceNumber}</strong>
                <span class="text-success">${sale.totalAmount.toFixed(2)} ج.م</span>
            </div>
            <small class="text-muted">${sale.customerName} - ${new Date(sale.saleDate).toLocaleTimeString()}</small>
        `;
        recentSalesList.appendChild(saleElement);
    });
}