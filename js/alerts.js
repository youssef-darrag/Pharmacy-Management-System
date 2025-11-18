// إدارة التنبيهات 

function loadAlertsPage() {
    const container = document.getElementById('alertsContainer');
    if (!container) return;

    container.innerHTML = '';

    const typeFilter = document.getElementById('alertTypeFilter').value;
    const priorityFilter = document.getElementById('alertPriorityFilter').value;
    const statusFilter = document.getElementById('alertStatusFilter').value;

    const pharmacyDB = getPharmacyDB();
    const filteredAlerts = pharmacyDB.alerts.filter(alert => {
        const matchesType = !typeFilter || alert.type === typeFilter;
        const matchesPriority = !priorityFilter || alert.priority === priorityFilter;
        const matchesStatus = !statusFilter ||
            (statusFilter === 'resolved' && alert.resolved) ||
            (statusFilter === 'unresolved' && !alert.resolved);

        return matchesType && matchesPriority && matchesStatus;
    });

    if (filteredAlerts.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">لا توجد تنبيهات تطابق معايير البحث</p>';
        return;
    }

    filteredAlerts.forEach(alert => {
        const priorityClass = alert.priority === 'high' ? 'danger' :
            alert.priority === 'medium' ? 'warning' : 'info';

        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${priorityClass} d-flex justify-content-between align-items-center`;
        alertElement.innerHTML = `
            <div>
                <h6 class="alert-heading">${alert.message}</h6>
                <small class="text-muted">${alert.alertDate} - ${alert.type === 'low_stock' ? 'مخزون منخفض' :
                alert.type === 'expiration' ? 'انتهاء صلاحية' : 'تلفيات'}</small>
            </div>
            <div>
                ${!alert.resolved ?
                `<button class="btn btn-sm btn-success me-1" onclick="resolveAlert(${alert.id})">
                        <i class="fas fa-check"></i> حل
                    </button>` :
                '<span class="badge bg-success">محلول</span>'
            }
                <button class="btn btn-sm btn-danger" onclick="deleteAlert(${alert.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(alertElement);
    });
}

function resolveAlert(id) {
    if (!checkPermission('approve')) {
        alert('ليس لديك صلاحية لحل التنبيهات');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    const alertIndex = pharmacyDB.alerts.findIndex(a => a.id === id);
    if (alertIndex !== -1) {
        pharmacyDB.alerts[alertIndex].resolved = true;
        savePharmacyDB(pharmacyDB);

        // تحديث البيانات 
        loadAlertsPage();
        updateAlertsCount();

        alert("تم حل التنبيه بنجاح!");
    }
}

function deleteAlert(id) {
    if (!checkPermission('delete')) {
        alert('ليس لديك صلاحية لحذف التنبيهات');
        return;
    }

    if (confirm('هل أنت متأكد من حذف هذا التنبيه؟')) {
        const pharmacyDB = getPharmacyDB();
        pharmacyDB.alerts = pharmacyDB.alerts.filter(a => a.id !== id);
        savePharmacyDB(pharmacyDB);

        // تحديث البيانات 
        loadAlertsPage();
        updateAlertsCount();

        alert("تم حذف التنبيه بنجاح!");
    }
}

function markAllAlertsAsRead() {
    if (!checkPermission('approve')) {
        alert('ليس لديك صلاحية لتعليم التنبيهات كمقروءة');
        return;
    }

    const pharmacyDB = getPharmacyDB();
    pharmacyDB.alerts.forEach(alert => {
        alert.resolved = true;
    });
    savePharmacyDB(pharmacyDB);

    // تحديث البيانات 
    loadAlertsPage();
    updateAlertsCount();

    alert("تم تعليم جميع التنبيهات كمقروءة!");
}

function refreshAlerts() {
    loadAlertsPage();
}

function filterAlerts() {
    loadAlertsPage();
}