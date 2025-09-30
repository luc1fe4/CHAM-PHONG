// Thêm vào đầu file scripts/dashboard.js

// Mobile optimization functions
const MobileDashboard = {
    init: function() {
        if (window.MobileUtils && window.MobileUtils.isMobile()) {
            this.optimizeTableForMobile();
            this.addMobileSearchFeatures();
            this.optimizeControlsForMobile();
        }
    },

    optimizeTableForMobile: function() {
        const table = document.querySelector('.excel-table');
        if (table) {
            // Add touch scroll momentum
            table.parentElement.style.webkitOverflowScrolling = 'touch';
            
            // Optimize column widths for mobile
            const style = document.createElement('style');
            style.textContent = `
                @media (max-width: 768px) {
                    .excel-table th, .excel-table td {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    .col-name {
                        max-width: 120px !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },

    addMobileSearchFeatures: function() {
        const searchInput = document.querySelector('#searchInput');
        if (searchInput) {
            
            // Improve search UX on mobile
            searchInput.addEventListener('focus', () => {
                if (window.MobileUtils) {
                    window.MobileUtils.showToast('Nhập từ khóa để tìm kiếm');
                }
            });
        }
    },


    optimizeControlsForMobile: function() {
        const controlsBar = document.querySelector('.controls-bar');
        if (controlsBar) {
            // Make controls more touch-friendly
            const buttons = controlsBar.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.style.minHeight = '44px';
                btn.style.padding = '12px 16px';
            });
            
            const selects = controlsBar.querySelectorAll('select');
            selects.forEach(select => {
                select.style.minHeight = '44px';
                select.style.fontSize = '16px';
            });
        }
    }
};

// Initialize mobile optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MobileDashboard.init();
});
// ===================== DASHBOARD MAIN MODULE =====================
// File: dashboard.js - Quản lý chức năng chính của dashboard

let currentData = [];
let filteredData = [];
let students = [];

// Load member.json
async function loadMemberData() {
  try {
    const response = await fetch('member.json');
    const data = await response.json();
    
    // Flatten the room-based structure into individual student records
    const flattenedStudents = [];
    data.forEach(room => {
      if (room.members && Array.isArray(room.members)) {
        room.members.forEach(member => {
          flattenedStudents.push({
            mssv: member.mssv,
            name: member.name,
            room: room.room,
            floor: room.floor
          });
        });
      }
    });
    
    students = flattenedStudents;
    window.students = flattenedStudents; // Export to global
    currentData = [...flattenedStudents];
    window.currentData = [...flattenedStudents]; // Export to global  
    filteredData = [...flattenedStudents];
    window.filteredData = [...flattenedStudents]; // Export to global
    
    console.log(`✅ Loaded ${flattenedStudents.length} students from ${data.length} rooms`);
    
    populateFilters(students);
    updateStats(students, filteredData);
    
    // Sử dụng notesManager để load notes to table
    if (typeof notesManager !== 'undefined') {
      await notesManager.loadNotesToTable(filteredData);
    } else {
      renderBasicStudentTable(filteredData);
    }
  } catch (err) {
    console.error('Lỗi tải dữ liệu sinh viên:', err);
  }
}

// Basic table render function (fallback khi không có notes)
function renderBasicStudentTable(data) {
  const tbody = document.getElementById("studentTableBody");
  const thead = document.querySelector("#studentTableBody").closest('table').querySelector('thead tr');
  
  if (!tbody || !thead) return;
  
  tbody.innerHTML = "";
  
  // Reset header to basic
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

// Xóa toàn bộ nội dung bảng để tránh xung đột giữa các tab
function clearStudentTable() {
    const thead = document.querySelector(".excel-table thead tr");
    const tbody = document.getElementById("studentTableBody");
    if (thead) thead.innerHTML = "";
    if (tbody) tbody.innerHTML = "";
}
window.clearStudentTable = clearStudentTable; // export global


// ===================== TAB MANAGEMENT =====================
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tabs-nav button");

  if (tabButtons.length > 0) {
    tabButtons.forEach(btn => {
      btn.addEventListener("click", async () => {
        tabButtons.forEach(b => b && b.classList.remove("active"));
        btn.classList.add("active");

        const tab = btn.getAttribute("data-tab");
        const container = document.querySelector(".dashboard-content");
        const excelContainer = document.querySelector(".excel-container");
        const weeklyStatsContainer = document.getElementById("weekly-stats-container");

        if (tab === "notes") {
          // Hiện excel-container, ẩn weekly stats
          excelContainer.style.display = "block";
          weeklyStatsContainer.style.display = "none";
          container.innerHTML = ""; // Xóa nội dung container
          await loadMemberData(); // Tải lại dữ liệu sinh viên

          if (typeof notesManager !== "undefined") {
            notesManager.loadNotesTab(container);
            if (container.innerText.includes("Chưa có ghi chú")) {
              container.innerHTML = "";
            }
          } else {
            container.innerHTML = "";
          }
        }
        else if (tab === "weeklyStats") {
          // Hiện weekly stats, ẩn excel-container
          excelContainer.style.display = "none";
          container.innerHTML = "";
          weeklyStatsContainer.style.display = "block";
          loadWeeklyStats(weeklyStatsContainer);
        }
        else if (tab === "monthlyStats") {
            excelContainer.style.display = "none";
            weeklyStatsContainer.style.display = "none";
            container.innerHTML = "";
            loadMonthlyRoomStats(container);
        }
        else if (tab === "violations") {
        excelContainer.style.display = "none";
        weeklyStatsContainer.style.display = "none";
        container.innerHTML = "";
        loadViolationsQuery(container);
        }
        else if (tab === "detailedAnalysis") {
            excelContainer.style.display = "none";
            weeklyStatsContainer.style.display = "none";
            container.innerHTML = "";
            loadDetailedAnalysis(container);
        }
      });
    });

    // Mặc định chọn tab đầu tiên
    if (tabButtons[0]) tabButtons[0].click();
  }
}


// Placeholder functions for other tabs
function loadWeeklyStats(container) {
  // Kiểm tra xem weeklyStats module đã load chưa
  if (typeof weeklyStats !== 'undefined' && weeklyStats.loadWeeklyStatsTab) {
    weeklyStats.loadWeeklyStatsTab(container);
  } else {
    container.innerHTML = "<h2>📊 Thống kê tuần</h2><p>Đang tải module...</p>";
    console.warn("WeeklyStats module chưa sẵn sàng");
  }
}

function loadMonthlyRoomStats(container) {
    if (typeof monthlyRoomStats !== 'undefined' && monthlyRoomStats.loadMonthlyRoomStatsTab) {
        monthlyRoomStats.loadMonthlyRoomStatsTab(container);
    } else {
        container.innerHTML = "<h2>📅 Thống kê tháng theo phòng</h2><p>Đang tải module...</p>";
        console.warn("MonthlyRoomStats module chưa sẵn sàng");
    }
}

function loadViolations(container) {
  if (typeof violationsQuery !== 'undefined' && violationsQuery.loadViolationsQueryTab) {
    violationsQuery.loadViolationsQueryTab(container);
  } else {
    container.innerHTML = "<h2>⚠️ Truy vấn điểm trừ</h2><p>Đang tải module...</p>";
    console.warn("ViolationsQuery module chưa sẵn sàng");
  }
}
// Thêm function này vào phần placeholder functions
function loadDetailedAnalysis(container) {
    if (typeof detailedMonthlyAnalysis !== 'undefined' && detailedMonthlyAnalysis.loadDetailedAnalysisTab) {
        detailedMonthlyAnalysis.loadDetailedAnalysisTab(container);
    } else {
        container.innerHTML = "<h2>📋 Thống kê chi tiết tháng</h2><p>Đang tải module...</p>";
        console.warn("DetailedMonthlyAnalysis module chưa sẵn sàng");
    }
}

// ===================== STATISTICS MANAGEMENT =====================
function updateStats(allData, filteredData) {
    const totalStudents = allData.length;
    const totalRooms = [...new Set(allData.map(s => s.room))].length;
    const avgStudents = totalRooms > 0 ? (totalStudents / totalRooms).toFixed(1) : 0;
    const filteredCount = filteredData.length;

    const elements = {
        totalStudents: document.getElementById('totalStudents'),
        totalRooms: document.getElementById('totalRooms'),
        avgStudents: document.getElementById('avgStudents'),
        filteredCount: document.getElementById('filteredCount')
    };

    if (elements.totalStudents) elements.totalStudents.textContent = totalStudents;
    if (elements.totalRooms) elements.totalRooms.textContent = totalRooms;
    if (elements.avgStudents) elements.avgStudents.textContent = avgStudents;
    if (elements.filteredCount) elements.filteredCount.textContent = filteredCount;

    // Update room overview stats
    const rooms = [...new Set(allData.map(s => s.room))];
    const occupiedRooms = rooms.length;
    const emptyRooms = 0;
    const fullRooms = rooms.filter(room => 
        allData.filter(s => s.room === room).length >= 8
    ).length;
    const occupancyRate = totalRooms > 0 ? ((totalStudents / (totalRooms * 8)) * 100).toFixed(1) : 0;

    const overviewElements = {
        occupiedRooms: document.getElementById('occupiedRooms'),
        emptyRooms: document.getElementById('emptyRooms'),
        fullRooms: document.getElementById('fullRooms'),
        occupancyRate: document.getElementById('occupancyRate')
    };

    if (overviewElements.occupiedRooms) overviewElements.occupiedRooms.textContent = occupiedRooms;
    if (overviewElements.emptyRooms) overviewElements.emptyRooms.textContent = emptyRooms;
    if (overviewElements.fullRooms) overviewElements.fullRooms.textContent = fullRooms;
    if (overviewElements.occupancyRate) overviewElements.occupancyRate.textContent = occupancyRate + '%';
}

// ===================== FILTER MANAGEMENT =====================
// Populate filter dropdowns
function populateFilters(data) {
    const roomFilter = document.getElementById('roomFilter');
    if (!roomFilter) return;
    
    const rooms = [...new Set(data.map(s => s.room))].sort();
    roomFilter.innerHTML = '<option value="">Tất cả phòng</option>' +
        rooms.map(room => `<option value="${room}">Phòng ${room}</option>`).join('');
}

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const roomFilter = document.getElementById('roomFilter');
    const floorFilter = document.getElementById('floorFilter');

    if (searchInput) searchInput.addEventListener('input', performSearch);
    if (roomFilter) roomFilter.addEventListener('change', performSearch);
    if (floorFilter) floorFilter.addEventListener('change', performSearch);
}

// Search and filter functionality
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const roomFilter = document.getElementById('roomFilter');
    const floorFilter = document.getElementById('floorFilter');

    if (!searchInput || !roomFilter || !floorFilter) return;

    const searchTerm = searchInput.value.toLowerCase();
    const roomFilterValue = roomFilter.value;
    const floorFilterValue = floorFilter.value;
    
    filteredData = currentData.filter(student => {
        const matchesSearch = !searchTerm || 
            student.mssv.toLowerCase().includes(searchTerm) ||
            student.name.toLowerCase().includes(searchTerm) ||
            student.room.toLowerCase().includes(searchTerm);
        
        const matchesRoom = !roomFilterValue || student.room === roomFilterValue;
        const matchesFloor = !floorFilterValue || student.floor.toString() === floorFilterValue;
        
        return matchesSearch && matchesRoom && matchesFloor;
    });
    
    // Sử dụng notesManager để reload table với filtered data
    if (typeof notesManager !== 'undefined') {
        notesManager.loadNotesToTable(filteredData);
    } else {
        renderBasicStudentTable(filteredData);
    }
    
    updateStats(currentData, filteredData);
}

// Reset filters
function resetFilters() {
    const elements = {
        search: document.getElementById('searchInput'),
        room: document.getElementById('roomFilter'),
        floor: document.getElementById('floorFilter')
    };

    if (elements.search) elements.search.value = '';
    if (elements.room) elements.room.value = '';
    if (elements.floor) elements.floor.value = '';
    
    filteredData = [...currentData];
    
    // Sử dụng notesManager để reload table
    if (typeof notesManager !== 'undefined') {
        notesManager.loadNotesToTable(filteredData);
    } else {
        renderBasicStudentTable(filteredData);
    }
    
    updateStats(currentData, filteredData);
}

// ===================== EXPORT FUNCTIONALITY =====================
// Basic export data (fallback)
function exportData() {
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
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'danh_sach_sinh_vien.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Enhanced export with notes (sử dụng notesManager)
function exportDataWithNotes() {
    if (typeof notesManager !== 'undefined') {
        notesManager.exportDataWithNotes(filteredData);
    } else {
        console.warn("NotesManager không khả dụng, sử dụng export cơ bản");
        exportData();
    }
}

// ===================== REFRESH FUNCTIONALITY =====================
async function refreshData() {
    console.log("🔄 Đang làm mới dữ liệu...");
    try {
        await loadMemberData();
        console.log("✅ Làm mới dữ liệu thành công!");
    } catch (err) {
        console.error("❌ Lỗi làm mới dữ liệu:", err);
    }
}

async function refreshNotes() {
    console.log("🔄 Đang làm mới ghi chú...");
    if (typeof notesManager !== 'undefined') {
        try {
            await notesManager.refreshNotes(filteredData);
            console.log("✅ Làm mới ghi chú thành công!");
        } catch (err) {
            console.warn("❌ Lỗi làm mới ghi chú:", err);
            renderBasicStudentTable(filteredData);
        }
    } else {
        console.warn("NotesManager không khả dụng");
        renderBasicStudentTable(filteredData);
    }
}

// ===================== INITIALIZATION =====================
// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Khởi tạo Dashboard...");
    
    setupTabs();
    loadMemberData();
    setupEventListeners();
    
    // Thêm nút export mới nếu có notesManager
    const exportBtn = document.querySelector('[onclick="exportData()"]');
    if (exportBtn && typeof notesManager !== 'undefined') {
        exportBtn.textContent = '📊 Export với Ghi chú';
        exportBtn.setAttribute('onclick', 'exportDataWithNotes()');
        exportBtn.title = 'Xuất dữ liệu bao gồm cả ghi chú theo ngày';
    }
    
    console.log("✅ Dashboard đã được khởi tạo");
});

// Auto refresh với interval dài hơn để tránh spam
setInterval(() => {
    if (typeof notesManager !== 'undefined') {
        refreshNotes();
    }
},  6000000); // 3 giây

// ===================== GLOBAL FUNCTIONS =====================
// Expose functions to global scope for compatibility
window.loadMemberData = loadMemberData;
window.performSearch = performSearch;
window.resetFilters = resetFilters;
window.exportData = exportData;
window.exportDataWithNotes = exportDataWithNotes;
window.refreshData = refreshData;
window.refreshNotes = refreshNotes;

// Export data variables to global scope for notes module
window.currentData = currentData;
window.filteredData = filteredData;
window.students = students;

window.loadMonthlyRoomStats = loadMonthlyRoomStats;