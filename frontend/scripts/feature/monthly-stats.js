// ===================== MONTHLY ROOM STATS MODULE =====================
// File: monthly-room-stats.js - Thống kê tháng theo phòng

class MonthlyRoomStats {
    constructor() {
        this.monthlyData = {};
        this.monthLabels = {};
        this.roomMembers = {}; // Lưu số lượng thành viên mỗi phòng
    }

    // Helper: Lấy key tháng từ ngày (YYYY-MM)
    getMonthKey(date) {
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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

    // Load dữ liệu từ Firestore và tính toán theo tháng
    async loadMonthlyData(students) {
        if (typeof db === 'undefined') {
            console.warn("⚠️ Firestore chưa sẵn sàng, không thể load thống kê tháng.");
            return;
        }

        console.log("🔄 MonthlyRoomStats: Đang tải dữ liệu từ Firestore...");
        const snapshot = await db.collection("cham_phong_9").orderBy("createdAt").get();

        this.monthlyData = {};
        this.monthLabels = {};
        this.roomMembers = {};

        // Đếm số thành viên mỗi phòng
        const roomMemberCount = {};
        students.forEach(student => {
            if (!roomMemberCount[student.room]) {
                roomMemberCount[student.room] = 0;
            }
            roomMemberCount[student.room]++;
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
            const monthLabel = this.getMonthLabel(monthKey);

            if (!this.monthlyData[monthKey]) this.monthlyData[monthKey] = {};
            this.monthLabels[monthKey] = monthLabel;

            const room = data.room;
            if (!this.monthlyData[monthKey][room]) {
                this.monthlyData[monthKey][room] = {
                    room: room,
                    diemTrucPhong: [], // Điểm trực của phòng (từ form chấm)
                    diemPhatCaNhan: [] // Điểm phạt cá nhân của tất cả thành viên
                };
            }

            // Tính điểm trực phòng từ form chấm
            const diemTrucNgay = this.calculateDailyRoomScore(data);
            this.monthlyData[monthKey][room].diemTrucPhong.push(diemTrucNgay);

            // Tính điểm phạt cá nhân cho tất cả thành viên trong phòng (trừ người trực)
            const roomStudents = students.filter(s => s.room === room);
            roomStudents.forEach(student => {
                // Không tính điểm phạt cho người trực trong ngày đó
                if (student.name !== data.nguoiTruc && student.mssv !== data.nguoiTruc) {
                    const diemPhatCaNhan = this.calculatePersonalViolations(data, student.name);
                    if (diemPhatCaNhan > 0) {
                        this.monthlyData[monthKey][room].diemPhatCaNhan.push(diemPhatCaNhan);
                    }
                }
            });
        });

        console.log("✅ MonthlyRoomStats: Hoàn tất load dữ liệu tháng", this.monthlyData, this.monthLabels);
    }

    // Tính điểm trực phòng từ form chấm (tất cả tiêu chí)
    calculateDailyRoomScore(data) {
        let totalScore = 0;
        let itemCount = 0;
        
        // Duyệt qua tất cả các field trong form
        Object.keys(data).forEach(key => {
            // Bỏ qua các field không phải điểm chấm
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
        
        // Trả về điểm trung bình (scale 0-55)
        return itemCount > 0 ? (totalScore / itemCount) * 55 : 0;
    }

    // Tính điểm phạt cá nhân từ vi phạm khu vực cá nhân
    calculatePersonalViolations(data, studentName) {
        let violations = 0;
        
        // Các key liên quan đến cá nhân
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

    // Tính toán điểm cuối cùng cho mỗi phòng trong tháng
    calculateMonthlyRoomStats(monthData) {
        const results = [];
        
        Object.entries(monthData).forEach(([room, data]) => {
            // Tổng điểm trực phòng trong tháng
            const tongDiemTrucPhong = data.diemTrucPhong.reduce((sum, score) => sum + score, 0);
            
            // Tổng điểm phạt cá nhân của tất cả thành viên trong tháng
            const tongDiemPhatCaNhan = data.diemPhatCaNhan.reduce((sum, penalty) => sum + penalty, 0);
            
            // Số lượng thành viên trong phòng
            const soThanhVien = this.roomMembers[room] || 1;
            
            // Công thức: (Tổng điểm trực phòng - Tổng điểm phạt phòng) / Số lượng thành viên
            const diemCuoiCung = (tongDiemTrucPhong - tongDiemPhatCaNhan) / soThanhVien;
            
            results.push({
                room: room,
                tongDiemTruc: tongDiemTrucPhong.toFixed(1),
                tongDiemPhat: tongDiemPhatCaNhan,
                soThanhVien: soThanhVien,
                diemCuoiCung: Math.max(0, diemCuoiCung).toFixed(1) // Không để âm
            });
        });
        
        // Sắp xếp theo số phòng
        return results.sort((a, b) => {
            const roomA = parseInt(a.room) || 0;
            const roomB = parseInt(b.room) || 0;
            return roomA - roomB;
        });
    }

    // Render bảng thống kê tháng theo phòng
    renderMonthlyRoomTable(container) {
        const students = window.students || [];
        const months = Object.keys(this.monthlyData).sort();

        if (months.length === 0) {
            container.innerHTML = `
                <h2>📅 Thống kê tháng theo phòng</h2>
                <p>❌ Không có dữ liệu thống kê tháng.</p>
            `;
            return;
        }

        // Lấy danh sách tất cả các phòng
        const allRooms = [...new Set(students.map(s => s.room))].sort((a, b) => {
            const roomA = parseInt(a) || 0;
            const roomB = parseInt(b) || 0;
            return roomA - roomB;
        });

        // Header
        let header = `
            <th style="width: 60px;">STT</th>
            <th style="width: 80px;">PHÒNG</th>
            <th style="width: 100px;">SỐ THÀNH VIÊN</th>
        `;
        months.forEach(month => {
            header += `<th style="background:#e3f2fd; min-width: 120px;">${this.monthLabels[month]}</th>`;
        });

        // Body
        const rows = allRooms.map((room, index) => {
            const memberCount = this.roomMembers[room] || 0;
            let cols = `
                <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                <td style="text-align: center; font-weight: bold; color: #1976d2;">${room}</td>
                <td style="text-align: center;">${memberCount}</td>
            `;
            
            months.forEach(month => {
                const roomData = this.monthlyData[month][room];
                if (roomData) {
                    const stats = this.calculateMonthlyRoomStats({ [room]: roomData });
                    const roomStats = stats[0];
                    
                    cols += `
                        <td style="text-align: center; font-weight: bold; color: ${roomStats.diemCuoiCung >= 50 ? '#388e3c' : '#d32f2f'};">
                            ${roomStats.diemCuoiCung}
                        </td>
                    `;
                } else {
                    cols += `<td style="text-align: center; color: #999;">-</td>`;
                }
            });
            
            return `<tr>${cols}</tr>`;
        }).join("");

        // Tính thống kê tổng quan
        const totalRooms = allRooms.length;
        const totalStudents = students.length;
        const avgMembersPerRoom = totalRooms > 0 ? (totalStudents / totalRooms).toFixed(1) : 0;

        container.innerHTML = `
            <h2>📅 Thống kê tháng theo phòng</h2>
            <div class="stats-summary" style="margin-bottom: 16px; padding: 12px; background: #f5f5f5; border-radius: 6px; font-size: 14px;">
                <strong>Tổng quan:</strong> ${totalRooms} phòng | ${totalStudents} sinh viên | 
                TB ${avgMembersPerRoom} SV/phòng | ${months.length} tháng có dữ liệu
                <br>
                <em>Công thức: (Tổng điểm trực phòng - Tổng điểm phạt cá nhân) ÷ Số thành viên (scale 0-55)</em>
            </div>
            <div class="excel-table-wrapper">
                <table class="excel-table">
                    <thead><tr>${header}</tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div style="margin-top: 12px; font-size: 12px; color: #666;">
                🟢 Màu xanh: Điểm ≥ 50 | 🔴 Màu đỏ: Điểm < 50
            </div>
        `;
    }

    // Public method: load tab tháng
    async loadMonthlyRoomStatsTab(container) {
        await this.loadMonthlyData(window.students || []);
        const months = Object.keys(this.monthlyData);

        if (months.length === 0) {
            container.innerHTML = `
                <h2>📅 Thống kê tháng theo phòng</h2>
                <p>❌ Không có dữ liệu thống kê tháng.</p>
            `;
            return;
        }

        this.renderMonthlyRoomTable(container);
    }

    // Export dữ liệu thống kê tháng
    async exportMonthlyData() {
        try {
            await this.loadMonthlyData(window.students || []);
            const months = Object.keys(this.monthlyData).sort();
            const allRooms = [...new Set((window.students || []).map(s => s.room))].sort((a, b) => {
                const roomA = parseInt(a) || 0;
                const roomB = parseInt(b) || 0;
                return roomA - roomB;
            });

            const headers = ['STT', 'PHÒNG', 'SỐ THÀNH VIÊN'];
            months.forEach(month => headers.push(this.monthLabels[month]));

            const csvContent = [
                headers.join(','),
                ...allRooms.map((room, index) => {
                    const memberCount = this.roomMembers[room] || 0;
                    const row = [index + 1, room, memberCount];

                    months.forEach(month => {
                        const roomData = this.monthlyData[month][room];
                        if (roomData) {
                            const stats = this.calculateMonthlyRoomStats({ [room]: roomData });
                            row.push(stats[0].diemCuoiCung);
                        } else {
                            row.push('');
                        }
                    });

                    return row.join(',');
                })
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `thong_ke_thang_theo_phong_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (err) {
            console.error("❌ Lỗi export thống kê tháng:", err);
        }
    }
}

// Tạo instance global
const monthlyRoomStats = new MonthlyRoomStats();
window.loadMonthlyRoomStats = (container) => monthlyRoomStats.loadMonthlyRoomStatsTab(container);
window.exportMonthlyRoomStats = () => monthlyRoomStats.exportMonthlyData();