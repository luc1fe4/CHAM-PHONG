// ===================== VIOLATIONS QUERY MODULE =====================
// File: violations-query.js - Truy vấn điểm trừ theo tuần và phòng

class ViolationsQuery {
    constructor() {
        this.weeklyData = {};
        this.roomMembers = {};
        this.criteriaMapping = this.initCriteriaMapping();
    }

    // Khởi tạo mapping các tiêu chí
    initCriteriaMapping() {
        return {
            // Khu vực chung
            sanNha: 'Sàn nhà',
            bonCau: 'Bồn cầu',
            tuLanh: 'Tủ lạnh',
            banGhe: 'Bàn ghế khu vực chung',
            cuaSo: 'Cửa sổ',
            denDien: 'Đèn điện',
            quatTran: 'Quạt trần',
            racThai: 'Rác thải',
            khongKhi: 'Không khí',
            
            // Khu vực cá nhân (sẽ được thêm suffix tên)
            giuong: 'Giường',
            ghe: 'Ghế cá nhân',
            tu: 'Tủ cá nhân',
            keSach: 'Kệ sách',
            mocTreoDo: 'Móc treo đồ'
        };
    }

    // Helper: Lấy tuần từ ngày (YYYY-WW)
    getWeekKey(date) {
        const d = new Date(date);
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((d - yearStart) / 86400000 + yearStart.getDay() + 1) / 7);
        return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    }

    // Helper: Lấy khoảng ngày của tuần
    getWeekRange(weekKey) {
        const [year, week] = weekKey.split('-W');
        const yearStart = new Date(parseInt(year), 0, 1);
        const weekStart = new Date(yearStart.getTime() + (parseInt(week) - 1) * 7 * 24 * 60 * 60 * 1000);
        weekStart.setDate(weekStart.getDate() - yearStart.getDay() + 1); // Điều chỉnh về thứ 2
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        return {
            start: weekStart,
            end: weekEnd,
            label: `${weekStart.toLocaleDateString('vi-VN')} - ${weekEnd.toLocaleDateString('vi-VN')}`
        };
    }

    // Helper: Kiểm tra ngày có trong khoảng tuần không
    isDateInWeek(date, startDate, endDate) {
        const d = new Date(date);
        return d >= startDate && d <= endDate;
    }

    // Load dữ liệu vi phạm theo tuần và phòng
    async loadViolationsData(weekRange, targetRoom) {
        if (typeof db === 'undefined') {
            console.warn("⚠️ Firestore chưa sẵn sàng, không thể load dữ liệu vi phạm.");
            return null;
        }

        console.log(`📊 ViolationsQuery: Đang tải dữ liệu vi phạm tuần ${weekRange.label} - Phòng ${targetRoom}...`);

        try {
            const snapshot = await db.collection("cham_phong")
                .where("room", "==", targetRoom)
                .orderBy("createdAt")
                .get();

            const violations = {
                room: targetRoom,
                week: weekRange.label,
                commonViolations: [], // Vi phạm khu vực chung
                personalViolations: [], // Vi phạm cá nhân
                summary: {
                    totalCommonViolations: 0,
                    totalPersonalViolations: 0,
                    totalCommonPenalty: 0,
                    totalPersonalPenalty: 0
                }
            };

            // Lấy danh sách thành viên phòng
            const roomStudents = (window.students || []).filter(s => s.room === targetRoom);
            this.roomMembers[targetRoom] = roomStudents;

            // Convert snapshot to array và sort theo createdAt
            const docs = [];
            snapshot.forEach(doc => docs.push(doc));
            
            // Sort theo createdAt
            docs.sort((a, b) => {
                const aData = a.data();
                const bData = b.data();
                
                let aDate, bDate;
                
                if (typeof aData.createdAt === 'string') {
                    aDate = new Date(aData.createdAt);
                } else if (aData.createdAt && aData.createdAt.toDate) {
                    aDate = aData.createdAt.toDate();
                } else {
                    aDate = new Date(0);
                }
                
                if (typeof bData.createdAt === 'string') {
                    bDate = new Date(bData.createdAt);
                } else if (bData.createdAt && bData.createdAt.toDate) {
                    bDate = bData.createdAt.toDate();
                } else {
                    bDate = new Date(0);
                }
                
                return aDate - bDate;
            });

            docs.forEach(doc => {
                const data = doc.data();
                if (!data.createdAt) return;

                let dateObj;
                if (typeof data.createdAt === 'string') {
                    dateObj = new Date(data.createdAt);
                } else if (data.createdAt.toDate) {
                    dateObj = data.createdAt.toDate();
                } else {
                    return;
                }

                // Kiểm tra ngày có trong tuần không
                if (!this.isDateInWeek(dateObj, weekRange.start, weekRange.end)) {
                    return;
                }

                const nguoiTruc = data.nguoiTruc || '';
                const dateStr = dateObj.toLocaleDateString('vi-VN');

                // Xử lý vi phạm khu vực chung
                Object.keys(this.criteriaMapping).forEach(key => {
                    if (key === 'giuong' || key === 'ghe' || key === 'tu' || key === 'keSach' || key === 'mocTreoDo') {
                        return; // Bỏ qua tiêu chí cá nhân ở đây
                    }

                    if (data[key] === 'Không đạt' || data[key] === '"Không đạt"') {
                        violations.commonViolations.push({
                            date: dateStr,
                            criteria: this.criteriaMapping[key],
                            nguoiTruc: nguoiTruc,
                            penalty: 1 // Mỗi vi phạm chung = 1 điểm phạt
                        });
                        violations.summary.totalCommonViolations++;
                        violations.summary.totalCommonPenalty++;
                    }
                });

                // Xử lý vi phạm cá nhân
                roomStudents.forEach(student => {
                    const studentName = student.name;
                    
                    ['giuong', 'ghe', 'tu', 'keSach', 'mocTreoDo'].forEach(criteriaKey => {
                        const fieldKey = `${criteriaKey}_${studentName}`;
                        
                        if (data[fieldKey] === 'Không đạt' || data[fieldKey] === '"Không đạt"') {
                            violations.personalViolations.push({
                                studentName: studentName,
                                studentMSSV: student.mssv,
                                date: dateStr,
                                criteria: this.criteriaMapping[criteriaKey],
                                nguoiTruc: nguoiTruc,
                                isOnDuty: studentName === nguoiTruc || student.mssv === nguoiTruc,
                                penalty: 1 // Mỗi vi phạm cá nhân = 1 điểm phạt
                            });
                            violations.summary.totalPersonalViolations++;
                            violations.summary.totalPersonalPenalty++;
                        }
                    });
                });
            });

            console.log("✅ ViolationsQuery: Hoàn tất load dữ liệu vi phạm", violations);
            return violations;

        } catch (err) {
            console.error("❌ Lỗi load dữ liệu vi phạm:", err);
            return null;
        }
    }

    // Render form truy vấn
    renderQueryForm(container) {
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Lấy danh sách phòng
        const rooms = [...new Set((window.students || []).map(s => s.room))].sort((a, b) => {
            const roomA = parseInt(a) || 0;
            const roomB = parseInt(b) || 0;
            return roomA - roomB;
        });

        container.innerHTML = `
            <h2>⚠️ Truy vấn điểm trừ</h2>
            <div class="query-form" style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 12px; align-items: end;">
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 4px;">Từ ngày:</label>
                        <input type="date" id="startDate" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 4px;">Đến ngày:</label>
                        <input type="date" id="endDate" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; font-weight: 500; margin-bottom: 4px;">Phòng:</label>
                        <select id="roomSelect" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Chọn phòng</option>
                            ${rooms.map(room => `<option value="${room}">Phòng ${room}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <button id="queryBtn" style="padding: 8px 16px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            🔍 Truy vấn
                        </button>
                    </div>
                </div>
                <div style="margin-top: 12px; font-size: 13px; color: #666;">
                    💡 Chọn khoảng ngày và phòng để xem chi tiết vi phạm trong tuần
                </div>
            </div>
            <div id="queryResults"></div>
        `;

        // Thiết lập giá trị mặc định
        document.getElementById('startDate').valueAsDate = lastWeek;
        document.getElementById('endDate').valueAsDate = today;

        // Gắn sự kiện
        document.getElementById('queryBtn').addEventListener('click', () => this.handleQuery());
    }

    // Xử lý truy vấn
    async handleQuery() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const room = document.getElementById('roomSelect').value;
        const resultsContainer = document.getElementById('queryResults');

        if (!startDate || !endDate || !room) {
            resultsContainer.innerHTML = `
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 12px; border-radius: 4px;">
                    ⚠️ Vui lòng chọn đầy đủ khoảng ngày và phòng
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid #f3f3f3; border-radius: 50%; border-top: 3px solid #1976d2; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 12px;">Đang truy vấn dữ liệu...</p>
            </div>
        `;

        const weekRange = {
            start: new Date(startDate),
            end: new Date(endDate),
            label: `${new Date(startDate).toLocaleDateString('vi-VN')} - ${new Date(endDate).toLocaleDateString('vi-VN')}`
        };

        const violations = await this.loadViolationsData(weekRange, room);

        if (!violations) {
            resultsContainer.innerHTML = `
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 12px; border-radius: 4px;">
                    ❌ Lỗi khi truy vấn dữ liệu. Vui lòng thử lại.
                </div>
            `;
            return;
        }

        this.renderViolationsResults(resultsContainer, violations);
    }

    // Render kết quả vi phạm
    renderViolationsResults(container, violations) {
        const { commonViolations, personalViolations, summary, room, week } = violations;

        // Nhóm vi phạm chung theo tiêu chí
        const commonGrouped = this.groupViolationsByCriteria(commonViolations);

        // Nhóm vi phạm cá nhân theo học sinh
        const personalGrouped = this.groupViolationsByStudent(personalViolations);

        container.innerHTML = `
            <div class="violations-results">
                <!-- Header -->
                <div style="background: #e3f2fd; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 8px 0; color: #1565c0;">📋 Báo cáo vi phạm - Phòng ${room}</h3>
                    <div style="color: #666; font-size: 14px;">📅 Tuần: ${week}</div>
                </div>

                <!-- Tổng quan -->
                <div class="summary-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div class="summary-card" style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 16px;">
                        <div style="font-size: 24px; font-weight: bold; color: #e65100;">${summary.totalCommonViolations}</div>
                        <div style="color: #666; font-size: 14px;">Vi phạm khu vực chung</div>
                    </div>
                    <div class="summary-card" style="background: #fce4ec; border-left: 4px solid #e91e63; padding: 16px;">
                        <div style="font-size: 24px; font-weight: bold; color: #c2185b;">${summary.totalPersonalViolations}</div>
                        <div style="color: #666; font-size: 14px;">Vi phạm cá nhân</div>
                    </div>
                    <div class="summary-card" style="background: #ffebee; border-left: 4px solid #f44336; padding: 16px;">
                        <div style="font-size: 24px; font-weight: bold; color: #d32f2f;">${summary.totalCommonPenalty + summary.totalPersonalPenalty}</div>
                        <div style="color: #666; font-size: 14px;">Tổng điểm phạt</div>
                    </div>
                </div>

                <!-- Vi phạm khu vực chung -->
                <div class="common-violations" style="margin-bottom: 32px;">
                    <h4 style="color: #ff9800; margin-bottom: 16px;">🏠 Vi phạm khu vực chung</h4>
                    ${this.renderCommonViolationsTable(commonGrouped)}
                </div>

                <!-- Vi phạm cá nhân -->
                <div class="personal-violations">
                    <h4 style="color: #e91e63; margin-bottom: 16px;">👤 Vi phạm cá nhân</h4>
                    ${this.renderPersonalViolationsTable(personalGrouped)}
                </div>

                <!-- Export button -->
                <div style="text-align: center; margin-top: 24px;">
                    <button onclick="violationsQuery.exportViolationsData('${room}', '${week}')" 
                            style="padding: 12px 24px; background: #4caf50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        📊 Xuất báo cáo Excel
                    </button>
                </div>
            </div>
        `;
    }

    // Nhóm vi phạm chung theo tiêu chí
    groupViolationsByCriteria(violations) {
        const grouped = {};
        violations.forEach(v => {
            if (!grouped[v.criteria]) {
                grouped[v.criteria] = [];
            }
            grouped[v.criteria].push(v);
        });
        return grouped;
    }

    // Nhóm vi phạm cá nhân theo học sinh
    groupViolationsByStudent(violations) {
        const grouped = {};
        violations.forEach(v => {
            if (!grouped[v.studentName]) {
                grouped[v.studentName] = {
                    mssv: v.studentMSSV,
                    violations: []
                };
            }
            grouped[v.studentName].violations.push(v);
        });
        return grouped;
    }

    // Render bảng vi phạm khu vực chung
    renderCommonViolationsTable(grouped) {
        if (Object.keys(grouped).length === 0) {
            return `<div style="text-align: center; color: #4caf50; padding: 20px;">✅ Không có vi phạm khu vực chung</div>`;
        }

        let tableRows = '';
        Object.entries(grouped).forEach(([criteria, violations]) => {
            violations.forEach((v, index) => {
                tableRows += `
                    <tr>
                        ${index === 0 ? `<td rowspan="${violations.length}" style="vertical-align: top; border-right: 2px solid #e0e0e0; font-weight: 500;">${criteria}</td>` : ''}
                        <td>${v.date}</td>
                        <td>${v.nguoiTruc}</td>
                        <td style="color: #d32f2f; font-weight: 500;">${v.penalty}</td>
                    </tr>
                `;
            });
        });

        return `
            <div class="table-wrapper" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white;">
                    <thead>
                        <tr style="background: #fff3e0;">
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left;">Tiêu chí</th>
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left;">Ngày vi phạm</th>
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left;">Người trực</th>
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">Điểm phạt</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Render bảng vi phạm cá nhân
    renderPersonalViolationsTable(grouped) {
        if (Object.keys(grouped).length === 0) {
            return `<div style="text-align: center; color: #4caf50; padding: 20px;">✅ Không có vi phạm cá nhân</div>`;
        }

        let tableRows = '';
        Object.entries(grouped).forEach(([studentName, data]) => {
            const totalPenalty = data.violations.length;
            data.violations.forEach((v, index) => {
                const dutyWarning = v.isOnDuty ? '⚠️' : '';
                tableRows += `
                    <tr>
                        ${index === 0 ? `
                            <td rowspan="${data.violations.length}" style="vertical-align: top; border-right: 2px solid #e0e0e0; font-weight: 500;">
                                ${studentName}<br>
                                <small style="color: #666;">${data.mssv}</small>
                            </td>
                            <td rowspan="${data.violations.length}" style="vertical-align: top; border-right: 2px solid #e0e0e0; color: #d32f2f; font-weight: 500; text-align: center;">
                                ${totalPenalty}
                            </td>
                        ` : ''}
                        <td>${v.date} ${dutyWarning}</td>
                        <td>${v.criteria}</td>
                        <td>${v.nguoiTruc}</td>
                        <td style="color: #d32f2f; font-weight: 500; text-align: center;">${v.penalty}</td>
                    </tr>
                `;
            });
        });

        return `
            <div class="table-wrapper" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white;">
                    <thead>
                        <tr style="background: #fce4ec;">
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left;">Học sinh</th>
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">Tổng điểm phạt</th>
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left;">Ngày vi phạm</th>
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left;">Tiêu chí</th>
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: left;">Người trực</th>
                            <th style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">Điểm phạt</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #666;">
                ⚠️ Vi phạm trong ngày trực của chính họ
            </div>
        `;
    }

    // Export dữ liệu vi phạm
    async exportViolationsData(room, week) {
        // Implement export functionality
        console.log(`Xuất dữ liệu vi phạm phòng ${room} tuần ${week}`);
        // TODO: Implement CSV/Excel export
    }

    // Public method: load tab truy vấn
    async loadViolationsQueryTab(container) {
        this.renderQueryForm(container);
    }
}

// Tạo instance global
const violationsQuery = new ViolationsQuery();
window.loadViolationsQuery = (container) => violationsQuery.loadViolationsQueryTab(container);
window.violationsQuery = violationsQuery;

// CSS cho animation loading
if (!document.getElementById('violations-query-styles')) {
    const style = document.createElement('style');
    style.id = 'violations-query-styles';
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}