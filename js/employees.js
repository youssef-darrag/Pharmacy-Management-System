// إدارة الموظفين 

function loadEmployeesPage() {
    const tableBody = document.getElementById('employeesTable');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const users = getUsers();

    users.forEach(employee => {
        const statusBadge = employee.isActive ?
            '<span class="badge bg-success">نشط</span>' :
            '<span class="badge bg-secondary">غير نشط</span>';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.id}</td>
            <td>${employee.fullName || employee.name}</td>
            <td>${employee.username}</td>
            <td>
                <span class="badge bg-primary user-role-badge">${getRoleName(employee.role)}</span>
            </td>
            <td>${statusBadge}</td>
            <td>${employee.lastLogin ? new Date(employee.lastLogin).toLocaleString('ar-EG') : 'لم يسجل دخول'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editEmployee(${employee.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning me-1" onclick="toggleEmployeeStatus(${employee.id})">
                    <i class="fas fa-power-off"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteEmployee(${employee.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function saveEmployee() {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لإضافة موظفين');
        return;
    }

    const form = document.getElementById('employeeForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // جمع الصلاحيات 
    const permissions = [];
    if (document.getElementById('permRead').checked) permissions.push('read');
    if (document.getElementById('permWrite').checked) permissions.push('write');
    if (document.getElementById('permDelete').checked) permissions.push('delete');
    if (document.getElementById('permApprove').checked) permissions.push('approve');

    const newEmployee = {
        id: getUsers().length > 0 ? Math.max(...getUsers().map(e => e.id)) + 1 : 1,
        username: document.getElementById('employeeUsername').value,
        password: document.getElementById('employeePassword').value,
        role: document.getElementById('employeeRole').value,
        fullName: document.getElementById('employeeName').value,
        name: document.getElementById('employeeName').value,
        permissions: permissions,
        isActive: true,
        lastLogin: null
    };

    const users = getUsers();
    users.push(newEmployee);
    saveUsers(users);

    // إغلاق النموذج 
    const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
    modal.hide();

    // إعادة تعيين النموذج 
    form.reset();

    // تحديث البيانات 
    if (currentPage === 'employees') {
        loadEmployeesPage();
    }

    alert("تم إضافة الموظف بنجاح!");
}

function editEmployee(id) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل الموظفين');
        return;
    }

    const users = getUsers();
    const employee = users.find(e => e.id === id);
    if (employee) {
        // ملء النموذج ببيانات الموظف 
        document.getElementById('employeeName').value = employee.fullName || employee.name;
        document.getElementById('employeeUsername').value = employee.username;
        document.getElementById('employeeRole').value = employee.role;

        // تعيين الصلاحيات 
        document.getElementById('permRead').checked = employee.permissions.includes('read');
        document.getElementById('permWrite').checked = employee.permissions.includes('write');
        document.getElementById('permDelete').checked = employee.permissions.includes('delete');
        document.getElementById('permApprove').checked = employee.permissions.includes('approve');

        // فتح النموذج 
        const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
        modal.show();

        // تغيير عنوان النموذج 
        document.querySelector('#employeeModal .modal-title').innerHTML = '<i class="fas fa-edit me-2"></i> تعديل الموظف';

        // تغيير زر الحفظ 
        const saveBtn = document.querySelector('#employeeModal .btn-primary');
        saveBtn.textContent = 'تحديث الموظف';
        saveBtn.onclick = function () { updateEmployee(id); };
    }
}

function updateEmployee(id) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتعديل الموظفين');
        return;
    }

    const users = getUsers();
    const employeeIndex = users.findIndex(e => e.id === id);
    if (employeeIndex !== -1) {
        // جمع الصلاحيات 
        const permissions = [];
        if (document.getElementById('permRead').checked) permissions.push('read');
        if (document.getElementById('permWrite').checked) permissions.push('write');
        if (document.getElementById('permDelete').checked) permissions.push('delete');
        if (document.getElementById('permApprove').checked) permissions.push('approve');

        users[employeeIndex] = {
            ...users[employeeIndex],
            username: document.getElementById('employeeUsername').value,
            role: document.getElementById('employeeRole').value,
            fullName: document.getElementById('employeeName').value,
            name: document.getElementById('employeeName').value,
            permissions: permissions
        };

        saveUsers(users);

        // إغلاق النموذج 
        const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
        modal.hide();

        // إعادة تعيين النموذج والعنوان 
        document.querySelector('#employeeModal .modal-title').innerHTML = '<i class="fas fa-user-plus me-2"></i> إضافة موظف جديد';
        const saveBtn = document.querySelector('#employeeModal .btn-primary');
        saveBtn.textContent = 'حفظ الموظف';
        saveBtn.onclick = function () { saveEmployee(); };
        document.getElementById('employeeForm').reset();

        // تحديث البيانات 
        if (currentPage === 'employees') {
            loadEmployeesPage();
        }

        alert("تم تحديث الموظف بنجاح!");
    }
}

function toggleEmployeeStatus(id) {
    if (!checkPermission('write')) {
        alert('ليس لديك صلاحية لتغيير حالة الموظفين');
        return;
    }

    const users = getUsers();
    const employeeIndex = users.findIndex(e => e.id === id);
    if (employeeIndex !== -1) {
        users[employeeIndex].isActive = !users[employeeIndex].isActive;
        saveUsers(users);

        // تحديث البيانات 
        if (currentPage === 'employees') {
            loadEmployeesPage();
        }

        alert(`تم ${users[employeeIndex].isActive ? 'تفعيل' : 'تعطيل'} الموظف بنجاح!`);
    }
}

function deleteEmployee(id) {
    if (!checkPermission('delete')) {
        alert('ليس لديك صلاحية لحذف الموظفين');
        return;
    }

    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
        const users = getUsers();
        // منع حذف المستخدم الحالي 
        if (id === currentUser.id) {
            alert('لا يمكن حذف المستخدم الحالي');
            return;
        }

        const updatedUsers = users.filter(e => e.id !== id);
        saveUsers(updatedUsers);

        // تحديث البيانات 
        if (currentPage === 'employees') {
            loadEmployeesPage();
        }

        alert("تم حذف الموظف بنجاح!");
    }
}