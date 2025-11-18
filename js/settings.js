// الإعدادات 

function saveSystemSettings() {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتغيير إعدادات النظام');
        return;
    }

    const pharmacyName = document.getElementById('pharmacyName').value;
    const pharmacyAddress = document.getElementById('pharmacyAddress').value;
    const pharmacyPhone = document.getElementById('pharmacyPhone').value;
    const pharmacyEmail = document.getElementById('pharmacyEmail').value;

    const pharmacyDB = getPharmacyDB();
    pharmacyDB.systemSettings = {
        pharmacyName,
        pharmacyAddress,
        pharmacyPhone,
        pharmacyEmail
    };

    savePharmacyDB(pharmacyDB);
    alert("تم حفظ إعدادات النظام بنجاح!");
}

function changePassword() {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتغيير كلمة المرور');
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        alert('يرجى ملء جميع الحقول');
        return;
    }

    if (currentPassword !== currentUser.password) {
        alert('كلمة المرور الحالية غير صحيحة');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('كلمة المرور الجديدة وتأكيدها غير متطابقين');
        return;
    }

    // تحديث كلمة المرور 
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        saveUsers(users);

        // تحديث المستخدم الحالي 
        currentUser.password = newPassword;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // إعادة تعيين الحقول 
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        alert('تم تغيير كلمة المرور بنجاح');
    }
}

// تحميل إعدادات النظام 
function loadSystemSettings() {
    const pharmacyDB = getPharmacyDB();
    if (pharmacyDB.systemSettings) {
        document.getElementById('pharmacyName').value = pharmacyDB.systemSettings.pharmacyName;
        document.getElementById('pharmacyAddress').value = pharmacyDB.systemSettings.pharmacyAddress;
        document.getElementById('pharmacyPhone').value = pharmacyDB.systemSettings.pharmacyPhone;
        document.getElementById('pharmacyEmail').value = pharmacyDB.systemSettings.pharmacyEmail;
    }
}