// ===================== WEEKLY STATS MODULE =====================
// File: weekly-stats.js - Thống kê tuần độc lập

class WeeklyStats {
    constructor() {
        this.weeklyData = {};
        this.weekLabels = {}; // Thêm dòng này
    }

    // Helper: Lấy ngày đầu tuần (thứ 2) từ 1 ngày bất kỳ
    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = CN, 1 = T2...
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // điều chỉnh về T2
        return new Date(d.setDate(diff));
    }

    // Load dữ liệu từ Firestore
    async loadWeeklyData(students) {
        if (typeof db === 'undefined') {
            console.warn("⚠️ Firestore chưa sẵn sàng, không thể load thống kê tuần.");
            return;
        }

        console.log("🔄 WeeklyStats: Đang tải dữ liệu từ Firestore...");
        const snapshot = await db.collection("cham_phong_9").orderBy("createdAt").get();

        this.weeklyData = {};
        this.weekLabels = {}; // Reset lại nhãn tuần

        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.nguoiTruc || !data.createdAt || !data.room) return;
            
            // Tìm sinh viên theo tên hoặc MSSV
            const student = students.find(s => s.name === data.nguoiTruc || s.mssv === data.nguoiTruc);
            if (!student) return;
            
            // Chỉ xử lý nếu sinh viên này ở đúng phòng được chấm
            if (student.room !== data.room) return;

            let dateObj;
            if (typeof data.createdAt === 'string') {
                dateObj = new Date(data.createdAt);
            } else if (data.createdAt.toDate) {
                dateObj = data.createdAt.toDate();
            } else {
                return;
            }

            // Sử dụng getWeekRange để lấy key và label tuần
            const weekInfo = this.getWeekRange(dateObj);
            const weekKey = weekInfo.key;
            const weekLabel = weekInfo.label;

            if (!this.weeklyData[weekKey]) this.weeklyData[weekKey] = {};
            this.weekLabels[weekKey] = weekLabel; // Gán nhãn tuần

            if (!this.weeklyData[weekKey][student.mssv]) {
                this.weeklyData[weekKey][student.mssv] = { name: student.name, room: student.room, floor: student.floor, diemTruc: [], diemPhat: [] };
            }

            // Tính điểm trực từ form chấm
            const diemTrucNgay = this.calculateDailyScore(data);
            this.weeklyData[weekKey][student.mssv].diemTruc.push(diemTrucNgay);

            // Tính điểm phạt cá nhân (chỉ khi không phải người trực)
            const diemPhatCaNhan = this.calculatePersonalViolations(data, student.name);
            if (diemPhatCaNhan > 0) {
                this.weeklyData[weekKey][student.mssv].diemPhat.push(diemPhatCaNhan);
            }
        });

        console.log("✅ WeeklyStats: Hoàn tất load dữ liệu tuần", this.weeklyData, this.weekLabels);
    }

    // Tính toán cho từng sinh viên trong tuần
    calculateStats(records) {
        const results = [];
        Object.entries(records).forEach(([mssv, rec]) => {
            // Tính điểm trực (trung bình nếu >= 2 ngày)
            let diemTruc = 0;
            if (rec.diemTruc.length >= 2) {
                diemTruc = rec.diemTruc.reduce((a, b) => a + b, 0) / rec.diemTruc.length;
            } else if (rec.diemTruc.length === 1) {
                diemTruc = rec.diemTruc[0];
            }

            // Tổng điểm phạt cá nhân
            const diemPhat = rec.diemPhat.reduce((a, b) => a + b, 0);
            
            // Điểm tổng = Điểm trực - Điểm phạt
            const tong = diemTruc - diemPhat;

            results.push({
                mssv,
                name: rec.name,
                room: rec.room,
                diemTruc: diemTruc.toFixed(1), // Đổi từ 2 thành 1 decimal
                diemPhat,
                tong: Math.max(0, tong).toFixed(1) // Đổi từ 2 thành 1 decimal
            });
        });
        return results;
    }
    // Thêm function này vào class WeeklyStats:
    calculateDailyScore(data) {
        // Ưu tiên sử dụng điểm đã được tính sẵn từ Firestore
        if (data.score_55 && typeof data.score_55 === 'number') {
            console.log(`📊 Sử dụng điểm từ Firestore: ${data.score_55}`);
            return data.score_55;
        }
        
        if (data.maxScore && typeof data.maxScore === 'number') {
            console.log(`📊 Sử dụng maxScore từ Firestore: ${data.maxScore}`);
            return data.maxScore;
        }
        
        // Fallback: Tính lại nếu không có điểm sẵn (với logic đã sửa)
        console.log("⚠️ Không tìm thấy điểm sẵn, tính lại từ form...");
        
        let totalScore = 0;
        let itemCount = 0;
        
        // Danh sách field cần bỏ qua (bao gồm metadata)
        const excludeFields = [
            'nguoiTruc', 'room', 'createdAt', 'ghiChu', 'serverTimestamp',
            'failed_low', 'failed_medium', 'failed_personal', 
            'maxScore', 'score_55', 'khongCoNguoiTruc'
        ];
        
        Object.keys(data).forEach(key => {
            // Bỏ qua metadata fields
            if (excludeFields.includes(key)) return;
            
            const value = data[key];
            // Chỉ xử lý các field string chứa "Đạt" hoặc "Không đạt"
            if (typeof value === 'string') {
                if (value === 'Đạt' || value === '"Đạt"') {
                    totalScore += 1;
                    itemCount++;
                } else if (value === 'Không đạt' || value === '"Không đạt"') {
                    totalScore += 0; // Không đạt = 0 điểm
                    itemCount++;
                }
            }
        });
        
        const calculatedScore = itemCount > 0 ? (totalScore / itemCount) * 55 : 0;
        console.log(`🧮 Điểm tính lại: ${calculatedScore} (${totalScore}/${itemCount} tiêu chí)`);
        
        return calculatedScore;
    }
    calculatePersonalViolations(data, studentName) {
        let violations = 0;
        
        // Các key liên quan đến cá nhân (giường, ghế, tủ, kệ sách, móc treo)
        const personalKeys = [
            `giuong_${studentName}`,
            `ghe_${studentName}`,
            `tu_${studentName}`,
            `keSach_${studentName}`,
            `mocTreoDo_${studentName}`
        ];
        
        personalKeys.forEach(key => {
            if (data[key] && (data[key] === 'Không đạt' || data[key] === '"Không đạt"')) {
                violations += 1; // Mỗi vi phạm = 1 điểm phạt
            }
        });
        
        return violations;
    }
    renderWeeklyTable(container) {
        const students = window.students || [];
        const weeks = Object.keys(this.weeklyData).sort((a,b)=>new Date(a)-new Date(b));

        // Header - Fixed columns
        let headerFixed = `
            <th class="fixed-col col-1">STT</th>
            <th class="fixed-col col-2">MSSV</th>
            <th class="fixed-col col-3">Họ và Tên</th>
            <th class="fixed-col col-4">Phòng</th>
            <th class="fixed-col col-5">Tầng</th>
        `;
        
        // Header - Scrollable columns
        let headerScroll = '';
        weeks.forEach(w => {
            headerScroll += `
                <th style="background:#26c6da;color:#fff;font-weight:bold;font-size:11px;padding:8px 4px;text-align:center;min-width:80px;white-space:normal;line-height:1.3;">Điểm trực<br>${this.weekLabels[w]}</th>
                <th style="background:#ef5350;color:#fff;font-weight:bold;font-size:11px;padding:8px 4px;text-align:center;min-width:80px;white-space:normal;line-height:1.3;">Điểm phạt<br>${this.weekLabels[w]}</th>
                <th style="background:#7986cb;color:#fff;font-weight:bold;font-size:11px;padding:8px 4px;text-align:center;min-width:80px;white-space:normal;line-height:1.3;">Tổng<br>${this.weekLabels[w]}</th>
            `;
        });

        // Body
        const rows = students.map((s, i) => {
            let colsFixed = `
                <td class="fixed-col col-1">${i+1}</td>
                <td class="fixed-col col-2">${s.mssv}</td>
                <td class="fixed-col col-3" style="text-align:left;">${s.name}</td>
                <td class="fixed-col col-4">${s.room}</td>
                <td class="fixed-col col-5">${s.floor}</td>
            `;
            let colsScroll = '';
            weeks.forEach(w => {
                const rec = this.weeklyData[w][s.mssv];
                if (rec) {
                    let diemTruc = rec.diemTruc.length >= 2
                        ? rec.diemTruc.reduce((a,b)=>a+b,0) / rec.diemTruc.length
                        : rec.diemTruc.reduce((a,b)=>a+b,0) || 0;
                    const diemPhat = rec.diemPhat.reduce((a,b)=>a+b,0) || 0;
                    const tong = diemTruc - diemPhat;
                    colsScroll += `
                        <td style="color:green;font-weight:bold;">${diemTruc.toFixed(1)}</td>
                        <td style="color:red;">${diemPhat}</td>
                        <td style="font-weight:bold;">${tong.toFixed(1)}</td>
                    `;
                } else {
                    colsScroll += `<td>-</td><td>-</td><td>-</td>`;
                }
            });
            return `<tr>${colsFixed}${colsScroll}</tr>`;
        }).join("");

        container.innerHTML = `
            <style>
                .excel-table-wrapper {
                    position: relative;
                    overflow: auto;
                    max-height: 600px;
                    max-width: 100%;
                    border: 1px solid #ddd;
                    margin-top: 10px;
                }
                .excel-table {
                    border-collapse: separate;
                    border-spacing: 0;
                    width: auto;
                    min-width: 100%;
                    font-size: 13px;
                    table-layout: fixed;
                }
                .excel-table thead {
                    position: sticky;
                    top: 0;
                    z-index: 30;
                    background: #f5f5f5;
                }
                .excel-table th {
                    padding: 8px 4px;
                    border: 1px solid #ddd;
                    font-weight: bold;
                    background: #f5f5f5;
                    text-align: center;
                }
                .excel-table td {
                    padding: 6px 4px;
                    border: 1px solid #e0e0e0;
                    text-align: center;
                }
                .excel-table .fixed-col {
                    position: sticky;
                    background: white;
                    z-index: 20;
                    box-shadow: 2px 0 4px rgba(0,0,0,0.1);
                }
                .excel-table thead .fixed-col {
                    z-index: 40;
                    background: #f5f5f5;
                }
                /* Kích thước CỐ ĐỊNH - không thay đổi */
                .excel-table .col-1 { 
                    left: 0; 
                    width: 50px; 
                    min-width: 50px; 
                    max-width: 50px; 
                }
                .excel-table .col-2 { 
                    left: 50px; 
                    width: 90px; 
                    min-width: 90px; 
                    max-width: 90px; 
                }
                .excel-table .col-3 { 
                    left: 140px; 
                    width: 150px; 
                    min-width: 150px; 
                    max-width: 150px; 
                }
                .excel-table .col-4 { 
                    left: 290px; 
                    width: 70px; 
                    min-width: 70px; 
                    max-width: 70px; 
                }
                .excel-table .col-5 { 
                    left: 360px; 
                    width: 60px; 
                    min-width: 60px; 
                    max-width: 60px; 
                }
                /* Các cột điểm tuần - có thể thêm vô hạn */
                .excel-table th:not(.fixed-col),
                .excel-table td:not(.fixed-col) {
                    min-width: 80px;
                    width: 80px;
                }
                .excel-table tbody tr:hover {
                    background-color: #f9f9f9;
                }
                /* Đảm bảo các cột cố định không bị ảnh hưởng khi hover */
                .excel-table tbody tr:hover .fixed-col {
                    background-color: white;
                }
            </style>
            <h2>📊 Thống kê tuần</h2>
            <div class="excel-table-wrapper">
                <table class="excel-table">
                    <thead><tr>${headerFixed}${headerScroll}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div style="margin-top:8px;font-size:12px;color:#555;">
                📌 Thống kê tuần: ${weeks.length} khoảng thời gian | ${students.length} sinh viên <br>
                <em>Dữ liệu được tính từ form chấm điểm hằng ngày. Cuộn ngang/dọc để xem thêm.</em>
            </div>
        `;
    }


    // Public method: load tab
    async loadWeeklyStatsTab(container) {
        await this.loadWeeklyData(window.students || []);
        const weeks = Object.keys(this.weeklyData).sort((a, b) => {
            const [y1, m1, d1] = a.split('-');
            const [y2, m2, d2] = b.split('-');
            return new Date(`${y2}-${m2}-${d2}`) - new Date(`${y1}-${m1}-${d1}`);
        });

        if (weeks.length === 0) {
            container.innerHTML = "<p>❌ Không có dữ liệu thống kê tuần.</p>";
            return;
        }

        this.renderWeeklyTable(container); // Chỉ truyền container
    }
    getWeekRange(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0=CN, 1=T2...
        const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diffToMonday));
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        return {
            key: monday.toISOString().slice(0,10), // YYYY-MM-DD (dùng để group)
            label: `${monday.toLocaleDateString("vi-VN")} - ${sunday.toLocaleDateString("vi-VN")}`
        };
    }


}

// Tạo instance global
const weeklyStats = new WeeklyStats();
window.loadWeeklyStats = (container) => weeklyStats.loadWeeklyStatsTab(container);
