// إدارة التقارير 

function loadReportsPage() {
    const reportContent = document.getElementById('reportContent');
    if (!reportContent) return;

    const pharmacyDB = getPharmacyDB();

    reportContent.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">تقرير المبيعات</h5>
                <p class="card-text">يظهر هنا تقرير المبيعات حسب الفترة المحددة.</p>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>رقم الفاتورة</th>
                                <th>التاريخ</th>
                                <th>اسم العميل</th>
                                <th>المجموع</th>
                                <th>طريقة الدفع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pharmacyDB.sales.map(sale => `
                                <tr>
                                    <td>${sale.invoiceNumber}</td>
                                    <td>${new Date(sale.saleDate).toLocaleDateString('ar-EG')}</td>
                                    <td>${sale.customerName}</td>
                                    <td>${sale.totalAmount.toFixed(2)} ج.م</td>
                                    <td>${sale.paymentMethod}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function generateReport() {
    if (!checkPermission('approve')) {
        alert('ليس لديك صلاحية لإنشاء التقارير');
        return;
    }

    // في التطبيق الحقيقي، سيتم إنشاء تقرير بناءً على المعايير المحددة 
    alert("تم إنشاء التقرير بنجاح!");
}

function changeReportType() {
    // في التطبيق الحقيقي، سيتم تغيير نوع التقرير المعروض 
}

function exportReport() {
    if (!checkPermission('approve')) {
        alert('ليس لديك صلاحية لتصدير التقارير');
        return;
    }

    // في التطبيق الحقيقي، سيتم تصدير التقرير إلى Excel 
    alert("تم تصدير التقرير إلى Excel بنجاح!");
}