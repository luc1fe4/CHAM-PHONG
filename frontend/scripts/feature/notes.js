// ===================== NOTES MANAGEMENT MODULE =====================
// File: notes.js - Quản lý tất cả chức năng liên quan đến ghi chú

class NotesManager {
    constructor() {
        this.notesByRoomNameDate = {};
        this.allDates = new Set();
    }

    // ===================== LOAD NOTES TO MAIN TABLE =====================
    async loadNotesToTable(filteredData) {
        try {
            // Kiểm tra Firebase connection
            if (typeof db === 'undefined') {
                console.warn("Firebase chưa được khởi tạo, hiển thị bảng không có ghi chú");
                this.renderStudentTable(filteredData);
                return;
            }

            console.log("🔄 Đang tải dữ liệu ghi chú từ Firestore...");

            // Lấy dữ liệu ghi chú từ Firestore
            const snapshot = await db.collection("cham_phong_9").orderBy("createdAt").get();

            // Tạo object lưu trữ ghi chú theo room-name-date
            this.notesByRoomNameDate = {};
            this.allDates = new Set();

            console.log(`📋 Tìm thấy ${snapshot.size} bản ghi trong Firestore`);

            snapshot.forEach(doc => {
                const data = doc.data();
                console.log("📄 Đang xử lý document:", {
                    id: doc.id,
                    room: data.room,
                    nguoiTruc: data.nguoiTruc,
                    ghiChu: data.ghiChu,
                    createdAt: data.createdAt
                });

                // Chỉ xử lý khi có ghi chú không rỗng
                if (data.ghiChu && data.ghiChu.trim() !== "" && data.room && data.nguoiTruc) {
                    // Chuyển đổi timestamp thành date string
                    let dateStr = "";
                    if (data.createdAt) {
                        if (typeof data.createdAt === 'string') {
                            dateStr = new Date(data.createdAt).toLocaleDateString("vi-VN");
                        } else if (data.createdAt && data.createdAt.toDate) {
                            dateStr = data.createdAt.toDate().toLocaleDateString("vi-VN");
                        } else if (data.serverTimestamp && data.serverTimestamp.toDate) {
                            dateStr = data.serverTimestamp.toDate().toLocaleDateString("vi-VN");
                        }
                    }

                    if (dateStr) {
                        this.allDates.add(dateStr);
                        // Tạo key theo format: room-nguoiTruc-date
                        const key = `${data.room}-${data.nguoiTruc}-${dateStr}`;
                        this.notesByRoomNameDate[key] = data.ghiChu;

                        console.log(`✅ Đã lưu ghi chú: ${key} = "${data.ghiChu}"`);
                    }
                }
            });

            console.log(`📊 Tổng cộng ${this.allDates.size} ngày có ghi chú:`, Array.from(this.allDates));
            console.log("🗂️ Dữ liệu ghi chú:", this.notesByRoomNameDate);

            // Sắp xếp ngày theo thứ tự thời gian
            const sortedDates = Array.from(this.allDates).sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/');
                const [dayB, monthB, yearB] = b.split('/');
                const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
                const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
                return dateA - dateB;
            });

            console.log("📅 Ngày đã sắp xếp:", sortedDates);

            // Render bảng với các cột ghi chú theo ngày
            this.renderStudentTableWithNotes(filteredData, sortedDates);

        } catch (err) {
            console.error("❌ Lỗi load ghi chú:", err);
            this.renderStudentTable(filteredData);
        }
    }

    // Main render function with dynamic notes columns
    renderStudentTableWithNotes(data, dates) {
        const tbody = document.getElementById("studentTableBody");
        const thead = document.querySelector("#studentTableBody").closest('table').querySelector('thead tr');

        if (!tbody || !thead) return;

        console.log("🎨 Đang render bảng với dữ liệu:", {
            students: data.length,
            dates: dates.length,
            datesList: dates
        });

        // Clear existing content
        tbody.innerHTML = "";

        // Tạo header cơ bản
        thead.innerHTML = `
            <th class="col-stt" style="width: 50px;">STT</th>
            <th class="col-mssv" style="width: 80px;">MSSV</th>
            <th class="col-name" style="width: 200px;">HỌ VÀ TÊN</th>
            <th class="col-room" style="width: 70px;">PHÒNG</th>
            <th class="col-floor" style="width: 60px;">TẦNG</th>
        `;

        // Thêm các cột ngày động (chỉ khi có ghi chú)
        dates.forEach(date => {
            const th = document.createElement('th');
            th.className = 'col-note';
            th.textContent = date;
            th.style.minWidth = '150px';
            th.style.maxWidth = '200px';
            th.style.backgroundColor = '#e8f5e8';
            th.style.fontSize = '12px';
            th.style.fontWeight = 'bold';
            th.style.textAlign = 'center';
            th.style.border = '1px solid #ddd';
            th.style.position = 'sticky';
            th.style.top = '0';
            th.style.zIndex = '10';
            thead.appendChild(th);
        });

        // Render data rows
        data.forEach((student, index) => {
            const row = document.createElement("tr");
            row.setAttribute("data-mssv", student.mssv);
            row.setAttribute("data-name", student.name);
            row.setAttribute("data-room", student.room);

            // Các cột cơ bản
            row.innerHTML = `
                <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                <td style="text-align: center; font-family: monospace;">${student.mssv}</td>
                <td style="text-align: left; padding-left: 8px; font-weight: 500;">${student.name}</td>
                <td style="text-align: center; font-weight: bold; color: #007bff;">${student.room}</td>
                <td style="text-align: center;">${student.floor}</td>
            `;

            // Thêm các cột ghi chú theo ngày
            dates.forEach(date => {
                const td = document.createElement('td');

                // Tạo key để tìm ghi chú - thử nhiều format khác nhau
                const possibleKeys = [
                    `${student.room}-${student.name}-${date}`,  // room-name-date
                    `${student.room}-${student.mssv}-${date}`,  // room-mssv-date
                ];

                let note = "";
                let foundKey = "";

                // Tìm ghi chú theo các key có thể
                for (const key of possibleKeys) {
                    if (this.notesByRoomNameDate[key]) {
                        note = this.notesByRoomNameDate[key];
                        foundKey = key;
                        break;
                    }
                }

                console.log(`🔍 Tìm ghi chú cho ${student.name} (${student.room}) ngày ${date}:`, {
                    possibleKeys,
                    foundKey,
                    note
                });

                td.textContent = note || "";
                td.title = note ? `${student.name} - ${date}: ${note}` : `Không có ghi chú cho ${student.name} ngày ${date}`;
                td.style.fontSize = '11px';
                td.style.padding = '6px 4px';
                td.style.textAlign = 'left';
                td.style.maxWidth = '200px';
                td.style.overflow = 'hidden';
                td.style.textOverflow = 'ellipsis';
                td.style.whiteSpace = 'nowrap';
                td.style.border = '1px solid #eee';
                td.style.cursor = 'help';

                // Highlight cells có ghi chú
                if (note) {
                    td.style.backgroundColor = '#fff9c4';
                    td.style.fontWeight = '600';
                    td.style.color = '#8b5a00';
                    td.style.borderLeft = '3px solid #ffc107';
                } else {
                    td.style.backgroundColor = '#f8f9fa';
                    td.style.color = '#6c757d';
                    td.style.fontStyle = 'italic';
                    td.textContent = '-';
                }

                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        // Thêm thông tin tổng kết
        if (dates.length > 0) {
            const infoRow = document.createElement('tr');
            const totalColumns = 5 + dates.length;
            const totalNotes = Object.keys(this.notesByRoomNameDate).length;

            infoRow.innerHTML = `
                <td colspan="${totalColumns}" style="text-align: center; font-size: 12px; color: #495057; padding: 12px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-top: 2px solid #007bff;">
                    📋 <strong>Tổng quan:</strong> 
                    ${dates.length} ngày có ghi chú | 
                    ${totalNotes} ghi chú | 
                    ${data.length} sinh viên được hiển thị | 
                    Các ô màu vàng là ngày có ghi chú | 
                    <em>Hover chuột để xem chi tiết</em>
                </td>
            `;
            infoRow.style.position = 'sticky';
            infoRow.style.bottom = '0';
            infoRow.style.zIndex = '5';
            tbody.appendChild(infoRow);
        } else {
            // Thông báo khi không có ghi chú
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = `
                <td colspan="5" style="text-align: center; font-size: 14px; color: #6c757d; padding: 20px; background-color: #f8f9fa;">
                    📄 Chưa có ghi chú nào trong cơ sở dữ liệu. <br>
                    <small>Ghi chú sẽ được hiển thị tự động khi có dữ liệu từ Firestore.</small>
                </td>
            `;
            tbody.appendChild(noDataRow);
        }

        // Thêm CSS cho bảng responsive
        this.addTableStyles();
        this.wrapTableInContainer();
    }

    // Fallback render function (original)
    renderStudentTable(data) {
        if (!data || data.length === 0) {
            console.warn("Không có dữ liệu để render");
            return;
        }
        
        const tbody = document.getElementById("studentTableBody");
        const thead = document.querySelector("#studentTableBody").closest('table').querySelector('thead tr');

        if (!tbody || !thead) return;

        tbody.innerHTML = "";

        // Reset header to original
        thead.innerHTML = `
            <th class="col-stt">STT</th>
            <th class="col-mssv">MSSV</th>
            <th class="col-name">HỌ VÀ TÊN</th>
            <th class="col-room">PHÒNG</th>
            <th class="col-floor">TẦNG</th>
        `;

        data.forEach((student, index) => {
            const row = document.createElement("tr");
            row.setAttribute("data-mssv", student.mssv);
            row.setAttribute("data-name", student.name);
            row.setAttribute("data-room", student.room);

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${student.mssv}</td>
                <td>${student.name}</td>
                <td>${student.room}</td>
                <td>${student.floor}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // ===================== NOTES TAB FUNCTIONALITY =====================
    async loadNotesTab(container) {
        try {
            if (typeof db === 'undefined') {
                container.innerHTML = `
                    <h2>📌 Ghi chú</h2>
                    <p>Lỗi: Không thể kết nối đến cơ sở dữ liệu</p>
                `;
                return;
            }

            const snapshot = await db.collection("cham_phong_9").orderBy("createdAt", "desc").limit(50).get();

            if (snapshot.empty) {
                container.innerHTML = "";
                return;
            }
            snapshot.forEach(doc => {
                const data = doc.data();

                if (data.ghiChu && data.ghiChu.trim() !== "") {
                    let timeStr = "";
                    if (data.createdAt) {
                        if (typeof data.createdAt === 'string') {
                            timeStr = new Date(data.createdAt).toLocaleString("vi-VN");
                        } else if (data.createdAt && data.createdAt.toDate) {
                            timeStr = data.createdAt.toDate().toLocaleString("vi-VN");
                        } else if (data.serverTimestamp && data.serverTimestamp.toDate) {
                            timeStr = data.serverTimestamp.toDate().toLocaleString("vi-VN");
                        }
                    }

                }
            });

        } catch (err) {
            console.error("Lỗi tải ghi chú:", err);
        }
    }

    // ===================== EXPORT FUNCTIONALITY =====================
    async exportDataWithNotes(filteredData) {
        try {
            if (typeof db === 'undefined') {
                this.exportBasicData(filteredData);
                return;
            }

            const snapshot = await db.collection("cham_phong_9").orderBy("createdAt").get();
            const notesByRoomNameDate = {};
            const allDates = new Set();

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.ghiChu && data.ghiChu.trim() !== "" && data.room && data.nguoiTruc) {
                    let dateStr = "";
                    if (data.createdAt) {
                        if (typeof data.createdAt === 'string') {
                            dateStr = new Date(data.createdAt).toLocaleDateString("vi-VN");
                        } else if (data.createdAt && data.createdAt.toDate) {
                            dateStr = data.createdAt.toDate().toLocaleDateString("vi-VN");
                        } else if (data.serverTimestamp && data.serverTimestamp.toDate) {
                            dateStr = data.serverTimestamp.toDate().toLocaleDateString("vi-VN");
                        }
                    }

                    if (dateStr) {
                        allDates.add(dateStr);
                        const key = `${data.room}-${data.nguoiTruc}-${dateStr}`;
                        notesByRoomNameDate[key] = data.ghiChu;
                    }
                }
            });

            const sortedDates = Array.from(allDates).sort((a, b) => {
                const [dayA, monthA, yearA] = a.split('/');
                const [dayB, monthB, yearB] = b.split('/');
                const dateA = new Date(`${yearA}-${monthA}-${dayA}`);
                const dateB = new Date(`${yearB}-${monthB}-${dayB}`);
                return dateA - dateB;
            });

            const headers = ['STT', 'MSSV', 'Họ và tên', 'Phòng', 'Tầng'];
            sortedDates.forEach(date => headers.push(`Ghi chú ${date}`));

            const csvContent = [
                headers.join(','),
                ...filteredData.map((student, index) => {
                    const row = [
                        index + 1,
                        student.mssv,
                        `"${student.name}"`,
                        student.room,
                        student.floor
                    ];

                    sortedDates.forEach(date => {
                        // Thử tìm ghi chú theo name hoặc mssv
                        const keyByName = `${student.room}-${student.name}-${date}`;
                        const keyByMssv = `${student.room}-${student.mssv}-${date}`;
                        const note = notesByRoomNameDate[keyByName] || notesByRoomNameDate[keyByMssv] || "";
                        row.push(`"${note}"`);
                    });

                    return row.join(',');
                })
            ].join('\n');

            this.downloadCSV(csvContent, `danh_sach_sinh_vien_co_ghi_chu_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.csv`);

        } catch (err) {
            console.error("Lỗi export:", err);
            this.exportBasicData(filteredData);
        }
    }

    // Basic export data
    exportBasicData(filteredData) {
        const headers = ['STT', 'MSSV', 'Họ và tên', 'Phòng', 'Tầng'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map((student, index) => [
                index + 1,
                student.mssv,
                `"${student.name}"`,
                student.room,
                student.floor
            ].join(','))
        ].join('\n');

        this.downloadCSV(csvContent, 'danh_sach_sinh_vien.csv');
    }

    // Helper function to download CSV
    downloadCSV(content, filename) {
        const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // ===================== UTILITY FUNCTIONS =====================
    addTableStyles() {
        if (document.getElementById('notesTableStyles')) return;

        const style = document.createElement('style');
        style.id = 'notesTableStyles';
        style.textContent = `
            .table-container {
                max-height: 70vh;
                overflow: auto;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .table-container table {
                margin-bottom: 0;
                border-collapse: separate;
                border-spacing: 0;
            }

            .table-container thead th {
                position: sticky;
                top: 0;
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                border: none;
                z-index: 10;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .table-container tbody tr:hover {
                background-color: #f8f9fa;
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: all 0.2s ease;
            }

            .col-note {
                border-left: 2px solid #28a745 !important;
            }

            @media (max-width: 768px) {
                .table-container {
                    max-height: 50vh;
                    font-size: 12px;
                }

                .col-note {
                    min-width: 120px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    wrapTableInContainer() {
        const table = document.querySelector('#studentTableBody').closest('table');
        if (table && !table.parentElement.classList.contains('table-container')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-container';
            table.parentElement.insertBefore(wrapper, table);
            wrapper.appendChild(table);

            // Thêm hướng dẫn sử dụng
            this.addScrollGuide(wrapper);
        }
    }

    // Thêm hướng dẫn cuộn ngang
    addScrollGuide(container) {
        const guide = document.createElement('div');
        guide.id = 'scroll-guide';
        guide.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 123, 255, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 30;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;
        guide.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span>🔒 Cột cố định</span>
                <span style="opacity: 0.7;">|</span>
                <span>↔️ Cuộn ngang để xem ghi chú</span>
            </div>
        `;

        container.style.position = 'relative';
        container.appendChild(guide);

        // Tự động ẩn hướng dẫn sau 5 giây
        setTimeout(() => {
            if (guide && guide.parentElement) {
                guide.style.opacity = '0';
                setTimeout(() => {
                    if (guide && guide.parentElement) {
                        guide.remove();
                    }
                }, 300);
            }
        }, 5000);

        // Ẩn hướng dẫn khi scroll
        let scrollTimeout;
        container.addEventListener('scroll', () => {
            if (guide && guide.parentElement) {
                guide.style.opacity = '0.3';
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    if (guide && guide.parentElement) {
                        guide.style.opacity = '0.8';
                    }
                }, 1000);
            }
        });
    }

    // Refresh notes data
    async refreshNotes(filteredData) {
        console.log("🔄 NotesManager: Đang làm mới dữ liệu ghi chú...");
        try {
            await this.loadNotesToTable(filteredData);
            console.log("✅ NotesManager: Làm mới thành công!");
        } catch (err) {
            console.error("❌ NotesManager: Lỗi làm mới:", err);
            throw err; // Re-throw để dashboard xử lý fallback
        }
    }

    // Debug function để kiểm tra dữ liệu
    async debugFirestoreData() {
        try {
            console.log("🔍 Debug: Kiểm tra dữ liệu Firestore...");
            const snapshot = await db.collection("cham_phong_9").limit(5).get();

            snapshot.forEach(doc => {
                console.log("📄 Document:", doc.id);
                console.log("📊 Data:", doc.data());
            });

        } catch (err) {
            console.error("❌ Debug error:", err);
        }
    }
}

// Tạo instance global để sử dụng
const notesManager = new NotesManager();

// Export các functions để tương thích với code cũ
window.loadNotesToTable = (filteredData) => notesManager.loadNotesToTable(filteredData);
window.loadNotes = (container) => notesManager.loadNotesTab(container);
window.exportDataWithNotes = (filteredData) => notesManager.exportDataWithNotes(filteredData);
window.refreshNotes = () => {
    // Lấy filteredData từ global scope
    const globalFilteredData = window.filteredData || [];
    return notesManager.refreshNotes(globalFilteredData);
};

// Debug function
window.debugNotes = () => notesManager.debugFirestoreData();