// ================================================================
const firebaseConfig = {
    apiKey: "AIzaSyDV56FUyAlePJDFla4ZBvRkv4OUe8b9c8g",
    authDomain: "cham-phong.firebaseapp.com",
    projectId: "cham-phong",
    storageBucket: "cham-phong.firebasestorage.app",
    messagingSenderId: "871544721414",
    appId: "1:871544721414:web:b6619c3c49bdcdf44ff387",
    measurementId: "G-43GW7XRBXF"
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);
window._db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
  loadRoomList();
});

function loadRoomList() {
  fetch('member.json')
    .then(res => res.json())
    .then(data => {
      // Dùng search.js để hiển thị và hỗ trợ tìm kiếm
      setupSearch(data, renderRoomList);
    })
    .catch(err => {
      console.error('Lỗi khi load danh sách phòng:', err);
      document.querySelector('.container').innerHTML = '<p>Lỗi khi tải danh sách phòng.</p>';
    });
}

// Hàm render danh sách phòng
function renderRoomList(roomArray, container) {
  container.innerHTML = '';
  if (!roomArray || roomArray.length === 0) {
    container.innerHTML = '<p>Không tìm thấy phòng nào.</p>';
    return;
  }

  roomArray.forEach(roomData => {
    const card = document.createElement('div');
    card.classList.add('room-card');

    const title = document.createElement('h3');
    title.textContent = `Phòng ${roomData.room}`;

    const btn = document.createElement('button');
    btn.textContent = 'Chấm phòng';
    btn.classList.add('btn-view');
    btn.addEventListener('click', () => loadRoomForm(roomData));

    card.appendChild(title);
    card.appendChild(btn);
    container.appendChild(card);
  });
}

function loadRoomForm(roomData) {
  fetch('form.html')
    .then(res => {
      if (!res.ok) throw new Error(`Lỗi HTTP! status: ${res.status}`);
      return res.text();
    })
    .then(html => {
      // Lấy phần <main> trong form.html
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const mainContent = tempDiv.querySelector('main');

      const container = document.querySelector('.container');
      container.innerHTML = `
        <h1 id="pageHeading">CHẤM PHÒNG ${roomData.room}</h1>
        ${mainContent.innerHTML}
        <div class="form-actions">
          <button id="backBtn">Quay lại danh sách</button>
        </div>
      `;

      // ===== 1) Render "Họ và tên người trực" =====
      const nguoiTrucFieldset = container.querySelector('fieldset'); // fieldset đầu tiên
      nguoiTrucFieldset.innerHTML = `<legend>Họ và tên người trực <span style="color:red">*</span></legend>`;
      roomData.members.forEach((member, idx) => {
        const label = document.createElement('label');
        label.style.display = 'inline-block';
        label.style.marginRight = '16px';
        label.innerHTML = `
          <input type="radio" name="nguoiTruc" value="${member.name}" required> ${member.name}
        `;
        nguoiTrucFieldset.appendChild(label);
      });

      // ===== 2) Render các khối chấm theo TỪNG THÀNH VIÊN =====
      const memberLists = container.querySelectorAll('.member-list');
      memberLists.forEach(list => {
        const section = list.getAttribute('data-section'); 
        if (!section || section === 'nguoiTruc') return;

        list.innerHTML = ''; 
        roomData.members.forEach((member, idx) => {
          const row = document.createElement('div');
          row.className = 'member-row';
          row.style.margin = '6px 0';

          row.innerHTML = `
            <strong>${member.name}</strong>
            <label style="margin-left:10px">
              <input type="radio" name="${section}_${member.name}" value="Đạt" required> Đạt
            </label>
            <label style="margin-left:10px">
              <input type="radio" name="${section}_${member.name}" value="Không đạt" required> Không đạt
            </label>
          `;
          list.appendChild(row);
        }); 
      });

      const khongCoLabel = document.createElement('label');
      khongCoLabel.style.cssText = 'display: inline-block; margin-right: 16px; background-color: #fff3cd; border-color: #ffeaa7;';
      khongCoLabel.innerHTML = `
        <input type="radio" name="nguoiTruc" value="khong_co_nguoi_truc" id="khongCoNguoiTruc" required> Không có người trực
      `;
      nguoiTrucFieldset.appendChild(khongCoLabel);

      // ===== 1.6) Xử lý sự kiện "Không có người trực" =====
      const khongCoRadio = container.querySelector('#khongCoNguoiTruc');
      if (khongCoRadio) {
        khongCoRadio.addEventListener('change', function() {
          if (this.checked) {
            // Tự động đánh "Không đạt" cho tất cả các ô
            const allKhongDatRadios = container.querySelectorAll('input[type="radio"][value="Không đạt"]');
            allKhongDatRadios.forEach(radio => {
              radio.checked = true;
            });
          }
        });
      }
      // ===== 1.7) Thêm nút cuộn xuống cuối trang =====
      const mainContainer = container.querySelector('main') || container;
      const scrollBtn = document.createElement('button');
      scrollBtn.id = 'scrollToBottom';
      scrollBtn.title = 'Cuộn xuống cuối trang';
      scrollBtn.textContent = '↓';
      mainContainer.appendChild(scrollBtn);

      // Xử lý sự kiện cuộn
      scrollBtn.addEventListener('click', function() {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
        
        // Haptic feedback trên mobile
        if (navigator.vibrate) {
          navigator.vibrate(10);
        }
      });

      // Ẩn/hiện nút cuộn dựa vào vị trí scroll
      window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.body.scrollHeight - window.innerHeight;
        
        if (scrollTop > 200 && scrollTop < scrollHeight - 100) {
          scrollBtn.style.display = 'flex';
        } else {
          scrollBtn.style.display = 'none';
        }
      });

      // Ẩn nút ban đầu
      scrollBtn.style.display = 'none';


      // ===== 3) Bắt sự kiện Auto Fill (kiểm tra phần tử có tồn tại không) =====
      const autoFillAllBtn = container.querySelector('#autoFillAll');
      
      if (autoFillAllBtn) {
        autoFillAllBtn.addEventListener('click', () => {
          autoTickAll(container.querySelector('#roomForm'));
        });
      }

      // ===== 4) Bắt sự kiện SUBMIT form để lưu Firestore + đẩy Sheet =====
      const form = container.querySelector('#roomForm');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          
          console.log('Form submitted'); // Debug
          
          if (!validateRequiredFields(form)) return;

          try {
            // B1: Thu thập dữ liệu form -> criteria_scores
            const criteria_scores = collectCriteriaScores(form);
            console.log('Criteria scores:', criteria_scores); // Debug

            // B2: Gọi hàm tính điểm
            const result = calculateScore(criteria_scores);
            console.log('Score result:', result); // Debug

            // B3: Tạo payload với mapping đúng field name
            const payload = createFirestorePayload(form, roomData, result);
            console.log('Payload to save:', payload); // Debug

            // 🔑 Bổ sung ghi chú
            const ghiChu = form.querySelector('#ghiChu')?.value || "";
            payload.ghiChu = ghiChu;

            // B4: Lưu vào Firestore
            await saveToFirestore(payload);
            

            alert("Đã lưu chấm phòng thành công! Số điểm: " + result.score_55);
            const container = document.querySelector('.container');
            container.innerHTML = `<div id="roomList"></div>`;
            loadRoomList();
          } catch (error) {
            console.error('Lỗi khi submit form:', error);
            alert('Có lỗi xảy ra: ' + error.message);
          }
        });
      }

      // ===== 5) Nút quay lại =====
      const backBtn = container.querySelector('#backBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          container.innerHTML = `<div id="roomList"></div>`;
          loadRoomList();
        });
      }
    })
    .catch(err => {
      console.error('Lỗi khi load form chấm phòng:', err);
      document.querySelector('.container').innerHTML = '<p>Lỗi khi tải form chấm phòng.</p>';
    });
}

/**
 * Thu thập dữ liệu từ form thành object {criteria: 1|0}
 * - Nếu radio chọn "đạt" → 1 điểm
 * - Nếu radio chọn "không đạt" → 0 điểm
 * - Người trực thì lấy tên (không tính điểm)
 */
function collectCriteriaScores(form) {
  const criteria_scores = {};
  
  // Thu thập tất cả radio được chọn (trừ nguoiTruc)
  const radios = form.querySelectorAll('input[type="radio"]:checked');
  radios.forEach(radio => {
    const name = radio.name;
    const value = radio.value;
    
    // Bỏ qua nguoiTruc vì không phải là tiêu chí chấm điểm
    if (name === 'nguoiTruc') return;
    
    // Chuyển đổi giá trị thành số
    if (value === 'Đạt') {
      criteria_scores[name] = 1;
    } else if (value === 'Không đạt') {
      criteria_scores[name] = 0;
    }
  });

  console.log('Collected criteria scores:', criteria_scores);
  return criteria_scores;
}

/**
 * Tạo payload cho Firestore với mapping đúng field name
 * Sửa đổi để lưu trữ dữ liệu khu vực cá nhân với tên thành viên
 */
function createFirestorePayload(form, roomData, result) {
  const payload = {
    room: roomData.room,
    // điểm & báo cáo
    maxScore: result.max_score,
    score_55: result.score_55,
    failed_low: result.failed_low,
    failed_medium: result.failed_medium,
    failed_personal: result.failed_personal,
    // ghi chú + thời gian tạo (string)
    ghiChu: form.querySelector('textarea[name="ghiChu"]')?.value || "",
    createdAt: new Date().toISOString()
  };

  // Lấy giá trị người trực (value có thể là mssv hoặc "khong_co_nguoi_truc")
  const nguoiTrucValue = form.querySelector('input[name="nguoiTruc"]:checked')?.value || "";
  if (nguoiTrucValue === 'khong_co_nguoi_truc') {
    payload.khongCoNguoiTruc = true;
    payload.nguoiTruc = "";
  } else {
    payload.khongCoNguoiTruc = false;
    // Nếu value là mssv, tìm tên trong roomData.members, nếu không tìm thấy dùng value thẳng
    const memberObj = roomData.members ? roomData.members.find(m => m.mssv === nguoiTrucValue) : null;
    payload.nguoiTruc = memberObj ? memberObj.name : (nguoiTrucValue || "");
  }

  // Định nghĩa rõ ràng các khu vực "cá nhân" (tên phải khớp với phần render form)
  const personalAreas = ['giuong', 'tu', 'keSach', 'ghe', 'mocTreoDo'];

  // Thu thập radio đã chọn
  const radios = form.querySelectorAll('input[type="radio"]:checked');
  radios.forEach(radio => {
    const name = radio.name;
    const value = radio.value;

    // đã xử lý người trực ở trên
    if (name === 'nguoiTruc') return;

    // Nếu dạng name có dấu '_' (ví dụ: "giuong_2602052" hoặc "giuong_0")
    const underscoreIndex = name.indexOf('_');
    if (underscoreIndex > 0) {
      const areaType = name.slice(0, underscoreIndex);
      const memberKey = name.slice(underscoreIndex + 1);

      // Nếu là khu vực cá nhân -> chuyển thành key với tên thành viên
      if (personalAreas.includes(areaType)) {
        let memberObj = null;

        // Nếu memberKey là số nguyên (index) -> lấy theo index
        if (/^\d+$/.test(memberKey)) {
          const idx = parseInt(memberKey, 10);
          memberObj = roomData.members && roomData.members[idx] ? roomData.members[idx] : null;
        } else {
          // Ngược lại coi như là mssv
          memberObj = roomData.members ? roomData.members.find(m => m.mssv === memberKey) : null;
        }

        if (memberObj && memberObj.name) {
          const newKey = `${areaType}_${memberObj.name}`; // ví dụ: "giuong_Bùi Thị X"
          payload[newKey] = value;
        } else {
          // fallback: nếu không tìm thấy memberObj, vẫn lưu dưới dạng gốc
          payload[name] = value;
        }
        return;
      }
    }

    // Các field dành cho người trực (giữ nguyên tên field như trong form)
    if (/^(GheNguoiTruc|GiuongNguoiTruc|KeSachNguoiTruc|TuNguoiTruc|mocNguoiTruc|MocNguoiTruc)$/.test(name)) {
      payload[name] = value;
      return;
    }

    // Mặc định: khu vực công cộng khác -> giữ nguyên tên field
    payload[name] = value;
  });

  return payload;
}


/** Lưu Firestore (collection: "cham_phong") */
async function saveToFirestore(payload) {
  if (!window._db) {
    throw new Error("Firebase chưa khởi tạo (_db not found).");
  }

  try {
    console.log('Saving to Firestore:', payload); // Debug
    
    const docRef = await window._db.collection("cham_phong").add({
      ...payload,
      serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    console.log("Đã lưu document với ID:", docRef.id);
  } catch (err) {
    console.error("Lỗi Firestore:", err);
    throw err;
  }
}


// Tick sẵn để test nhanh - tất cả "đạt"
function autoTickAll(form) {
  const radios = form.querySelectorAll('input[type="radio"][value="Đạt"]');
  radios.forEach(r => r.checked = true);
}

// Validate các mục có *
function validateRequiredFields(form) {
  const requiredFieldsets = form.querySelectorAll('fieldset legend span[style*="red"]');
  
  for (let span of requiredFieldsets) {
    const fieldset = span.closest('fieldset');
    const radioInputs = fieldset.querySelectorAll('input[type="radio"]');
    const radioNames = [...new Set([...radioInputs].map(r => r.name))];
    
    let allGroupsChecked = true;
    radioNames.forEach(name => {
      const groupRadios = fieldset.querySelectorAll(`input[name="${name}"]`);
      const hasChecked = [...groupRadios].some(r => r.checked);
      if (!hasChecked) {
        allGroupsChecked = false;
      }
    });
    
    if (!allGroupsChecked) {
      alert(`Bạn chưa chọn đầy đủ các mục trong: ${span.parentNode.textContent.replace('*', '').trim()}`);
      return false;
    }
  }
  
  return true;
}

// Thêm vào scripts/script.js

// Mobile-optimized room card creation
function createMobileRoomCard(roomNumber) {
    const roomCard = document.createElement('div');
    roomCard.className = 'room-card mobile-room-card';
    roomCard.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        position: relative;
    `;
    
    // Add room number
    const roomNumberEl = document.createElement('h3');
    roomNumberEl.textContent = roomNumber;
    roomNumberEl.style.cssText = `
        margin: 0 0 8px 0;
        color: #2c3e50;
        font-size: 18px;
        font-weight: 600;
    `;
    
    // Add status indicator
    const statusEl = document.createElement('div');
    statusEl.className = 'room-status';
    statusEl.textContent = 'Chưa chấm';
    statusEl.style.cssText = `
        background: #ffc107;
        color: #212529;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
        margin-top: auto;
    `;
    
    // Add touch feedback
    roomCard.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.95)';
        this.style.boxShadow = '0 1px 4px rgba(0,0,0,0.2)';
    });
    
    roomCard.addEventListener('touchend', function() {
        setTimeout(() => {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }, 150);
    });
    
    // Add click handler
    roomCard.addEventListener('click', function() {
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
        
        // Show loading state
        statusEl.textContent = 'Đang tải...';
        statusEl.style.background = '#007bff';
        statusEl.style.color = 'white';
        
        // Navigate to form
        setTimeout(() => {
            window.location.href = `form.html?room=${roomNumber}`;
        }, 500);
    });
    
    roomCard.appendChild(roomNumberEl);
    roomCard.appendChild(statusEl);
    
    return roomCard;
}

// Mobile-optimized room list rendering
function renderMobileRoomList(rooms) {
    const roomList = document.getElementById('roomList');
    if (!roomList) return;
    
    // Clear existing content
    roomList.innerHTML = '';
    
    // Add mobile-specific styling
    roomList.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        padding: 15px;
        max-width: 100%;
        overflow-x: hidden;
    `;
    
    // Create room cards
    rooms.forEach(room => {
        const roomCard = createMobileRoomCard(room);
        roomList.appendChild(roomCard);
    });
    
    // Add loading animation
    const style = document.createElement('style');
    style.textContent = `
        .room-card {
            animation: slideInUp 0.3s ease forwards;
            opacity: 0;
            transform: translateY(20px);
        }
        
        .room-card:nth-child(1) { animation-delay: 0.1s; }
        .room-card:nth-child(2) { animation-delay: 0.2s; }
        .room-card:nth-child(3) { animation-delay: 0.3s; }
        .room-card:nth-child(n+4) { animation-delay: 0.4s; }
        
        @keyframes slideInUp {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

// Mobile search optimization
function optimizeMobileSearch() {
    const searchInput = document.querySelector('#searchInput');
    if (!searchInput) return;
    
    // Add search suggestions for mobile
    const suggestions = ['CM101', 'CM201', 'CM301', 'Tầng 1', 'Tầng 2', 'Tầng 3'];
    
    const datalist = document.createElement('datalist');
    datalist.id = 'roomSuggestions';
    
    suggestions.forEach(suggestion => {
        const option = document.createElement('option');
        option.value = suggestion;
        datalist.appendChild(option);
    });
    
    searchInput.setAttribute('list', 'roomSuggestions');
    searchInput.parentElement.appendChild(datalist);
    
    // Add mobile-friendly search behavior
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        // Show loading indicator
        this.style.background = 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'8\' fill=\'none\' stroke=\'%23007bff\' stroke-width=\'2\' stroke-dasharray=\'50\' stroke-dashoffset=\'25\'%3E%3CanimateTransform attributeName=\'transform\' type=\'rotate\' values=\'0 10 10;360 10 10\' dur=\'1s\' repeatCount=\'indefinite\'/%3E%3C/circle%3E%3C/svg%3E") no-repeat right 10px center';
        this.style.backgroundSize = '16px 16px';
        
        searchTimeout = setTimeout(() => {
            // Perform search
            this.style.background = '';
            performSearch(this.value);
        }, 500);
    });
}

// Initialize mobile optimizations
document.addEventListener('DOMContentLoaded', function() {
    if (window.MobileUtils && window.MobileUtils.isMobile()) {
        optimizeMobileSearch();
        
        // Add mobile-specific event listeners
        window.addEventListener('online', () => {
            if (window.MobileUtils) {
                window.MobileUtils.showToast('Đã kết nối internet');
            }
        });
        
        window.addEventListener('offline', () => {
            if (window.MobileUtils) {
                window.MobileUtils.showToast('Mất kết nối internet');
            }
        });
    }
});