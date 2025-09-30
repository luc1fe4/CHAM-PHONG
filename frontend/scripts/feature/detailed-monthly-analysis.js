// ===================== DETAILED MONTHLY ANALYSIS MODULE =====================
// File: detailed-monthly-analysis.js - Thống kê chi tiết theo tháng

class DetailedMonthlyAnalysis {
    constructor() {
        this.monthlyData = {};
        this.monthLabels = {};
        this.roomMembers = {};
        this.studentData = {};
        this.weeklyData = {}; // Dữ liệu theo tuần
    }

    // Helper: Lấy key tháng từ ngày (YYYY-MM)
    getMonthKey(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    // Helper: Lấy key tuần từ ngày (YYYY-MM-W)
    getWeekKey(date) {
        const d = new Date(date);
        const monthKey = this.getMonthKey(date);
        const weekNumber = Math.ceil(d.getDate() / 7);
        return `${monthKey}-W${weekNumber}`;
    }

    // Helper: Lấy label tháng hiển thị
    getMonthLabel(monthKey) {
        const [year, month] = monthKey.split('-');
        const monthNames = [
            'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
            'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        return `${monthNames[parseInt(month) - 1]} - ${year}`;
    }

    // Load dữ liệu từ Firestore và tính toán chi tiết
    async loadDetailedMonthlyData(students) {
        if (typeof db === 'undefined') {
            console.warn("⚠️ Firestore chưa sẵn sàng, không thể load thống kê chi tiết.");
            return;
        }

        console.log("📊 DetailedMonthlyAnalysis: Đang tải dữ liệu từ Firestore...");
        const snapshot = await db.collection("cham_phong_9").orderBy("createdAt").get();

        this.monthlyData = {};
        this.weeklyData = {};
        this.monthLabels = {};
        this.roomMembers = {};
        this.studentData = {};

        // Đếm số thành viên mỗi phòng
        const roomMemberCount = {};
        const studentsByRoom = {};
        students.forEach(student => {
            if (!roomMemberCount[student.room]) {
                roomMemberCount[student.room] = 0;
                studentsByRoom[student.room] = [];
            }
            roomMemberCount[student.room]++;
            studentsByRoom[student.room].push(student);
        });
        this.roomMembers = roomMemberCount;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.nguoiTruc || !data.createdAt || !data.room) return;

            let dateObj;
            if (typeof data.createdAt === 'string') {
                dateObj = new Date(data.createdAt);
            } else if (data.createdAt.toDate) {
                dateObj = data.createdAt.toDate();
            } else {
                return;
            }

            const monthKey = this.getMonthKey(dateObj);
            const weekKey = this.getWeekKey(dateObj);
            const monthLabel = this.getMonthLabel(monthKey);

            // Khởi tạo dữ liệu tháng
            if (!this.monthlyData[monthKey]) this.monthlyData[monthKey] = {};
            if (!this.weeklyData[weekKey]) this.weeklyData[weekKey] = {};
            this.monthLabels[monthKey] = monthLabel;

            const room = data.room;
            const roomStudents = studentsByRoom[room] || [];

            // Khởi tạo dữ liệu phòng
            if (!this.monthlyData[monthKey][room]) {
                this.monthlyData[monthKey][room] = {
                    room: room,
                    diemTrucPhong: [],
                    diemPhatCaNhan: [],
                    studentViolations: {} // Theo dõi vi phạm cá nhân từng sinh viên
                };
            }

            if (!this.weeklyData[weekKey][room]) {
                this.weeklyData[weekKey][room] = {
                    room: room,
                    diemTrucPhong: [],
                    studentViolations: {}
                };
            }

            // Tính điểm trực phòng
            const diemTrucNgay = this.calculateDailyRoomScore(data);
            this.monthlyData[monthKey][room].diemTrucPhong.push(diemTrucNgay);
            this.weeklyData[weekKey][room].diemTrucPhong.push(diemTrucNgay);

            // Tính điểm phạt cá nhân cho từng sinh viên
            roomStudents.forEach(student => {
                // Không tính điểm phạt cho người trực trong ngày đó
                if (student.name !== data.nguoiTruc && student.mssv !== data.nguoiTruc) {
                    const diemPhatCaNhan = this.calculatePersonalViolations(data, student.name);
                    
                    if (diemPhatCaNhan > 0) {
                        // Lưu cho tháng
                        this.monthlyData[monthKey][room].diemPhatCaNhan.push(diemPhatCaNhan);
                        
                        if (!this.monthlyData[monthKey][room].studentViolations[student.name]) {
                            this.monthlyData[monthKey][room].studentViolations[student.name] = [];
                        }
                        this.monthlyData[monthKey][room].studentViolations[student.name].push(diemPhatCaNhan);

                        // Lưu cho tuần
                        if (!this.weeklyData[weekKey][room].studentViolations[student.name]) {
                            this.weeklyData[weekKey][room].studentViolations[student.name] = [];
                        }
                        this.weeklyData[weekKey][room].studentViolations[student.name].push(diemPhatCaNhan);
                    }
                }
            });
        });

        console.log("✅ DetailedMonthlyAnalysis: Hoàn tất load dữ liệu chi tiết", this.monthlyData);
    }

    // Tính điểm trực phòng từ form chấm
    calculateDailyRoomScore(data) {
        let totalScore = 0;
        let itemCount = 0;
        
        Object.keys(data).forEach(key => {
            if (['nguoiTruc', 'room', 'createdAt', 'ghiChu', 'serverTimestamp'].includes(key)) {
                return;
            }
            
            const value = data[key];
            if (value === 'Đạt' || value === '"Đạt"') {
                totalScore += 1;
                itemCount++;
            } else if (value === 'Không đạt' || value === '"Không đạt"') {
                totalScore += 0;
                itemCount++;
            }
        });
        
        return itemCount > 0 ? (totalScore / itemCount) * 55 : 0;
    }

    // Tính điểm phạt cá nhân
    calculatePersonalViolations(data, studentName) {
        let violations = 0;
        
        const personalKeys = [
            `giuong_${studentName}`,
            `ghe_${studentName}`,
            `tu_${studentName}`,
            `keSach_${studentName}`,
            `mocTreoDo_${studentName}`
        ];
        
        personalKeys.forEach(key => {
            if (data[key] && (data[key] === 'Không đạt' || data[key] === '"Không đạt"')) {
                violations += 1;
            }
        });
        
        return violations;
    }

    // Tìm sinh viên có điểm trực < 47 trong tuần
    findLowScoreStudentsInWeeks(monthKey) {
        const results = [];
        const weeks = Object.keys(this.weeklyData).filter(weekKey => weekKey.startsWith(monthKey));

        weeks.forEach(weekKey => {
            const weekData = this.weeklyData[weekKey];
            Object.entries(weekData).forEach(([room, roomData]) => {
                // Duyệt từng ngày chấm điểm trực trong tuần
                if (roomData.diemTrucPhong && Array.isArray(roomData.diemTrucPhong)) {
                    roomData.diemTrucPhong.forEach((scoreObj, idx) => {
                        // Nếu lưu dạng số, scoreObj là số, nếu lưu dạng object thì có thêm thông tin người trực/ngày
                        let score = scoreObj;
                        let nguoiTruc = null;
                        let date = null;
                        if (typeof scoreObj === 'object') {
                            score = scoreObj.score;
                            nguoiTruc = scoreObj.nguoiTruc;
                            date = scoreObj.date;
                        }
                        // Nếu có thông tin người trực thì lấy MSSV và tên từ students
                        if (score < 47) {
                            let student = null;
                            if (nguoiTruc) {
                                student = (window.students || []).find(s => s.name === nguoiTruc || s.mssv === nguoiTruc);
                            }
                            results.push({
                                week: weekKey,
                                room: room,
                                studentName: student ? student.name : (nguoiTruc || ''),
                                mssv: student ? student.mssv : '',
                                dailyScore: score.toFixed(1),
                                date: date || ''
                            });
                        }
                    });
                }
            });
        });

        return results;
    }

    // Tìm sinh viên có điểm phạt > 7 trong tuần
    findHighViolationStudentsInWeeks(monthKey) {
        const results = [];
        const weeks = Object.keys(this.weeklyData).filter(weekKey => weekKey.startsWith(monthKey));
        
        weeks.forEach(weekKey => {
            const weekData = this.weeklyData[weekKey];
            Object.entries(weekData).forEach(([room, roomData]) => {
                Object.entries(roomData.studentViolations || {}).forEach(([studentName, violations]) => {
                    const totalViolations = violations.reduce((sum, v) => sum + v, 0);
                    if (totalViolations > 7) {
                        const student = (window.students || []).find(s => s.name === studentName && s.room === room);
                        if (student) {
                            results.push({
                                week: weekKey,
                                room: room,
                                studentName: studentName,
                                mssv: student.mssv,
                                totalViolations: totalViolations
                            });
                        }
                    }
                });
            });
        });
        
        return results;
    }

    // Tính điểm cuối cùng cho mỗi phòng trong tháng
    calculateMonthlyRoomScores(monthData) {
        const results = [];
        
        Object.entries(monthData).forEach(([room, data]) => {
            const tongDiemTrucPhong = data.diemTrucPhong.reduce((sum, score) => sum + score, 0);
            const tongDiemPhatCaNhan = data.diemPhatCaNhan.reduce((sum, penalty) => sum + penalty, 0);
            const soThanhVien = this.roomMembers[room] || 1;
            const diemCuoiCung = (tongDiemTrucPhong - tongDiemPhatCaNhan) / soThanhVien;
            
            results.push({
                room: room,
                tongDiemTruc: tongDiemTrucPhong.toFixed(1),
                tongDiemPhat: tongDiemPhatCaNhan,
                soThanhVien: soThanhVien,
                diemCuoiCung: Math.max(0, diemCuoiCung).toFixed(1)
            });
        });
        
        return results.sort((a, b) => parseFloat(b.diemCuoiCung) - parseFloat(a.diemCuoiCung));
    }

    // Tìm 3 phòng có điểm cao nhất
    findTop3Rooms(roomScores) {
        if (roomScores.length === 0) return [];
        
        // Sắp xếp theo điểm giảm dần
        const sorted = [...roomScores].sort((a, b) => parseFloat(b.diemCuoiCung) - parseFloat(a.diemCuoiCung));
        
        // Lấy điểm của phòng thứ 3
        const thirdScore = sorted.length >= 3 ? parseFloat(sorted[2].diemCuoiCung) : parseFloat(sorted[sorted.length - 1].diemCuoiCung);
        
        // Lấy tất cả phòng có điểm >= điểm thứ 3
        return sorted.filter(room => parseFloat(room.diemCuoiCung) >= thirdScore);
    }

    // Tìm 2 phòng có điểm thấp nhất
    findBottom2Rooms(roomScores) {
        if (roomScores.length === 0) return [];
        
        // Sắp xếp theo điểm tăng dần
        const sorted = [...roomScores].sort((a, b) => parseFloat(a.diemCuoiCung) - parseFloat(b.diemCuoiCung));
        
        // Lấy điểm của phòng thứ 2 từ dưới lên
        const secondLowestScore = sorted.length >= 2 ? parseFloat(sorted[1].diemCuoiCung) : parseFloat(sorted[0].diemCuoiCung);
        
        // Lấy tất cả phòng có điểm <= điểm thứ 2 thấp nhất
        return sorted.filter(room => parseFloat(room.diemCuoiCung) <= secondLowestScore);
    }

    // Render bảng thống kê chi tiết
    renderDetailedAnalysis(container, selectedMonth) {
        const monthData = this.monthlyData[selectedMonth];
        if (!monthData) {
            container.innerHTML = `
                <h2>📋 Thống kê chi tiết tháng</h2>
                <p>❌ Không có dữ liệu cho tháng đã chọn.</p>
            `;
            return;
        }

        const roomScores = this.calculateMonthlyRoomScores(monthData);
        const lowScoreStudents = this.findLowScoreStudentsInWeeks(selectedMonth);
        const highViolationStudents = this.findHighViolationStudentsInWeeks(selectedMonth);
        const top3Rooms = this.findTop3Rooms(roomScores);
        const bottom2Rooms = this.findBottom2Rooms(roomScores);

        // Tạo bảng sinh viên điểm trực thấp
        const lowScoreTable = lowScoreStudents.length > 0 ? `
            <table class="excel-table" style="margin-bottom: 20px;">
                <thead>
                    <tr style="background: #ffebee;">
                        <th>STT</th>
                        <th>Ngày</th>
                        <th>Phòng</th>
                        <th>MSSV</th>
                        <th>Họ và Tên</th>
                        <th>Điểm Trực</th>
                    </tr>
                </thead>
                <tbody>
                    ${lowScoreStudents.map((student, index) => `
                        <tr>
                            <td style="text-align: center;">${index + 1}</td>
                            <td style="text-align: center;">${student.date}</td>
                            <td style="text-align: center; font-weight: bold;">${student.room}</td>
                            <td style="text-align: center;">${student.mssv}</td>
                            <td>${student.studentName}</td>
                            <td style="text-align: center; color: #d32f2f; font-weight: bold;">${student.dailyScore}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="color: #666;">✅ Không có sinh viên nào có điểm trực < 47 trong tháng.</p>';

        // Tạo bảng sinh viên vi phạm cao
        const highViolationTable = highViolationStudents.length > 0 ? `
            <table class="excel-table" style="margin-bottom: 20px;">
                <thead>
                    <tr style="background: #fff3e0;">
                        <th>STT</th>
                        <th>Tuần</th>
                        <th>Phòng</th>
                        <th>MSSV</th>
                        <th>Họ và Tên</th>
                        <th>Điểm Phạt</th>
                    </tr>
                </thead>
                <tbody>
                    ${highViolationStudents.map((student, index) => `
                        <tr>
                            <td style="text-align: center;">${index + 1}</td>
                            <td style="text-align: center;">${student.week.split('-W')[1] ? 'Tuần ' + student.week.split('-W')[1] : ''}</td>
                            <td style="text-align: center; font-weight: bold;">${student.room}</td>
                            <td style="text-align: center;">${student.mssv}</td>
                            <td>${student.studentName}</td>
                            <td style="text-align: center; color: #f57c00; font-weight: bold;">${student.totalViolations}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="color: #666;">✅ Không có sinh viên nào có điểm phạt > 7 trong tuần.</p>';

        // Tạo bảng top 3 phòng
        const top3Table = top3Rooms.length > 0 ? `
            <table class="excel-table" style="margin-bottom: 20px;">
                <thead>
                    <tr style="background: #e8f5e8;">
                        <th>Hạng</th>
                        <th>Phòng</th>
                        <th>Số TV</th>
                        <th>Tổng Điểm Trực</th>
                        <th>Tổng Điểm Phạt</th>
                        <th>Điểm Cuối Cùng</th>
                    </tr>
                </thead>
                <tbody>
                    ${top3Rooms.map((room, index) => `
                        <tr>
                            <td style="text-align: center; font-weight: bold; color: #388e3c;">${index + 1}</td>
                            <td style="text-align: center; font-weight: bold;">${room.room}</td>
                            <td style="text-align: center;">${room.soThanhVien}</td>
                            <td style="text-align: center;">${room.tongDiemTruc}</td>
                            <td style="text-align: center;">${room.tongDiemPhat}</td>
                            <td style="text-align: center; color: #388e3c; font-weight: bold;">${room.diemCuoiCung}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="color: #666;">❌ Không có dữ liệu phòng.</p>';

        // Tạo bảng bottom 2 phòng
        const bottom2Table = bottom2Rooms.length > 0 ? `
            <table class="excel-table">
                <thead>
                    <tr style="background: #ffebee;">
                        <th>Hạng</th>
                        <th>Phòng</th>
                        <th>Số TV</th>
                        <th>Tổng Điểm Trực</th>
                        <th>Tổng Điểm Phạt</th>
                        <th>Điểm Cuối Cùng</th>
                    </tr>
                </thead>
                <tbody>
                    ${bottom2Rooms.map((room, index) => `
                        <tr>
                            <td style="text-align: center; font-weight: bold; color: #d32f2f;">Cuối ${index + 1}</td>
                            <td style="text-align: center; font-weight: bold;">${room.room}</td>
                            <td style="text-align: center;">${room.soThanhVien}</td>
                            <td style="text-align: center;">${room.tongDiemTruc}</td>
                            <td style="text-align: center;">${room.tongDiemPhat}</td>
                            <td style="text-align: center; color: #d32f2f; font-weight: bold;">${room.diemCuoiCung}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="color: #666;">❌ Không có dữ liệu phòng.</p>';

        container.innerHTML = `
            <h2>📋 Thống kê chi tiết ${this.monthLabels[selectedMonth]}</h2>
            
            <div style="margin-bottom: 24px;">
                <h3 style="color: #d32f2f;">🔻 Sinh viên có điểm trực < 47 trong tuần (${lowScoreStudents.length})</h3>
                ${lowScoreTable}
            </div>

            <div style="margin-bottom: 24px;">
                <h3 style="color: #f57c00;">⚠️ Sinh viên có điểm phạt > 7 trong tuần (${highViolationStudents.length})</h3>
                ${highViolationTable}
            </div>

            <div style="margin-bottom: 24px;">
                <h3 style="color: #388e3c;">🏆 Top 3 phòng có điểm cao nhất (${top3Rooms.length})</h3>
                ${top3Table}
            </div>

            <div>
                <h3 style="color: #d32f2f;">📉 2 phòng có điểm thấp nhất (${bottom2Rooms.length})</h3>
                ${bottom2Table}
            </div>

            <div style="margin-top: 20px; padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 13px; color: #666;">
                <strong>Ghi chú:</strong> Điểm trực phòng tính trên thang 55. Điểm phạt tính theo số vi phạm cá nhân. 
                Công thức điểm cuối cùng: (Tổng điểm trực - Tổng điểm phạt) ÷ Số thành viên.
            </div>
        `;
    }

    // Public method: Load tab thống kê chi tiết
    async loadDetailedAnalysisTab(container) {
        await this.loadDetailedMonthlyData(window.students || []);
        const months = Object.keys(this.monthlyData).sort().reverse(); // Tháng mới nhất trước

        if (months.length === 0) {
            container.innerHTML = `
                <h2>📋 Thống kê chi tiết tháng</h2>
                <p>❌ Không có dữ liệu thống kê.</p>
            `;
            return;
        }

        // Tạo dropdown chọn tháng
        const monthSelector = months.map(month => 
            `<option value="${month}">${this.monthLabels[month]}</option>`
        ).join('');

        container.innerHTML = `
            <div style="margin-bottom: 16px;">
                <label for="monthSelect" style="margin-right: 10px; font-weight: bold;">Chọn tháng:</label>
                <select id="monthSelect" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    ${monthSelector}
                </select>
                <button id="exportDetailedBtn" style="margin-left: 10px; padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    📊 Xuất Excel
                </button>
            </div>
            <div id="detailedContent"></div>
        `;

        // Hiển thị tháng đầu tiên
        this.renderDetailedAnalysis(container.querySelector('#detailedContent'), months[0]);

        // Event listener cho dropdown
        container.querySelector('#monthSelect').addEventListener('change', (e) => {
            this.renderDetailedAnalysis(container.querySelector('#detailedContent'), e.target.value);
        });

        // Event listener cho nút export
        container.querySelector('#exportDetailedBtn').addEventListener('click', () => {
            const selectedMonth = container.querySelector('#monthSelect').value;
            this.exportDetailedAnalysis(selectedMonth);
        });
    }

    // Export dữ liệu thống kê chi tiết
    async exportDetailedAnalysis(monthKey) {
        try {
            const monthData = this.monthlyData[monthKey];
            if (!monthData) return;

            const roomScores = this.calculateMonthlyRoomScores(monthData);
            const lowScoreStudents = this.findLowScoreStudentsInWeeks(monthKey);
            const highViolationStudents = this.findHighViolationStudentsInWeeks(monthKey);
            const top3Rooms = this.findTop3Rooms(roomScores);
            const bottom2Rooms = this.findBottom2Rooms(roomScores);

            let csvContent = `Thống kê chi tiết ${this.monthLabels[monthKey]}\n\n`;

            // Sinh viên điểm trực thấp
            csvContent += `Sinh viên có điểm trực < 47 trong tuần (${lowScoreStudents.length})\n`;
            csvContent += `STT,Tuần,Phòng,MSSV,Họ và Tên,Điểm TB Tuần\n`;
            lowScoreStudents.forEach((student, index) => {
                csvContent += `${index + 1},${student.week.split('-W')[1] || ''},${student.room},${student.mssv},"${student.studentName}",${student.avgScore}\n`;
            });

            csvContent += `\nSinh viên có điểm phạt > 7 trong tuần (${highViolationStudents.length})\n`;
            csvContent += `STT,Tuần,Phòng,MSSV,Họ và Tên,Điểm Phạt\n`;
            highViolationStudents.forEach((student, index) => {
                csvContent += `${index + 1},${student.week.split('-W')[1] || ''},${student.room},${student.mssv},"${student.studentName}",${student.totalViolations}\n`;
            });

            csvContent += `\nTop phòng có điểm cao nhất (${top3Rooms.length})\n`;
            csvContent += `Hạng,Phòng,Số TV,Tổng Điểm Trực,Tổng Điểm Phạt,Điểm Cuối Cùng\n`;
            top3Rooms.forEach((room, index) => {
                csvContent += `${index + 1},${room.room},${room.soThanhVien},${room.tongDiemTruc},${room.tongDiemPhat},${room.diemCuoiCung}\n`;
            });

            csvContent += `\nPhòng có điểm thấp nhất (${bottom2Rooms.length})\n`;
            csvContent += `Hạng,Phòng,Số TV,Tổng Điểm Trực,Tổng Điểm Phạt,Điểm Cuối Cùng\n`;
            bottom2Rooms.forEach((room, index) => {
                csvContent += `Cuối ${index + 1},${room.room},${room.soThanhVien},${room.tongDiemTruc},${room.tongDiemPhat},${room.diemCuoiCung}\n`;
            });

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `thong_ke_chi_tiet_${monthKey.replace('-', '_')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) {
            console.error("❌ Lỗi export thống kê chi tiết:", err);
        }
    }
}

// Tạo instance global
const detailedMonthlyAnalysis = new DetailedMonthlyAnalysis();
// Export functions to global scope
window.detailedMonthlyAnalysis = detailedMonthlyAnalysis;
window.loadDetailedAnalysis = (container) => detailedMonthlyAnalysis.loadDetailedAnalysisTab(container);