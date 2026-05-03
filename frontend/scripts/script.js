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

// ================================================================
// THÊM VÀO ĐẦU FILE SCRIPT.JS - SAU PHẦN FIREBASE CONFIG
// ================================================================

// CSS cho submit loading và result popup
const submitLoadingCSS = `
.submit-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(3px);
  animation: fadeIn 0.3s ease;
}

.submit-loading-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s ease;
  min-width: 300px;
  max-width: 90%;
}

.submit-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

.submit-loading-text {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.submit-loading-detail {
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
}

.submit-progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 15px;
}

.submit-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 3px;
  transition: width 0.3s ease;
  animation: progressPulse 2s ease-in-out infinite;
}

.submit-step-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
}

.submit-step {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dee2e6;
  transition: all 0.3s ease;
}

.submit-step.active {
  background: #007bff;
  animation: pulse 1s infinite;
}

.submit-step.completed {
  background: #28a745;
}

/* Result Popup CSS */
.result-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

.result-popup {
  background: white;
  border-radius: 20px;
  max-width: 90%;
  width: 400px;
  padding: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.4s ease;
  overflow: hidden;
}

.result-header {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 25px 30px;
  text-align: center;
  position: relative;
}

.result-header::before {
  content: '';
  font-size: 40px;
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
}

.result-header h2 {
  margin: 15px 0 5px 0;
  font-size: 24px;
  font-weight: 700;
}

.result-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.result-content {
  padding: 30px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-label {
  font-weight: 600;
  color: #333;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-value {
  font-weight: 700;
  font-size: 16px;
  color: #2c3e50;
  text-align: right;
  word-break: break-word;
  max-width: 60%;
}

.score-display {
  text-align: center;
  margin: 20px 0;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff, #e3f2fd);
  border-radius: 15px;
  border: 2px solid #2196F3;
}

.score-number {
  font-size: 36px;
  font-weight: 900;
  color: #2196F3;
  margin-bottom: 5px;
}

.score-rating {
  font-size: 18px;
  font-weight: 600;
  margin-top: 10px;
  padding: 8px 16px;
  border-radius: 25px;
  display: inline-block;
}

.rating-excellent {
  background: #d4edda;
  color: #155724;
}

.rating-good {
  background: #fff3cd;
  color: #856404;
}

.rating-average {
  background: #f8d7da;
  color: #721c24;
}

.rating-poor {
  background: #f5c6cb;
  color: #721c24;
}

.result-actions {
  padding: 0 30px 30px 30px;
  display: flex;
  gap: 15px;
}

.result-btn {
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-back {
  background: #6c757d;
  color: white;
}

.btn-back:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.btn-continue {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.btn-continue:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: translateY(-2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes progressPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-10px);
  }
  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}

/* Mobile responsive */
@media (max-width: 480px) {
  .result-popup, .submit-loading-content {
    max-width: 95%;
    margin: 10px;
  }
  
  .result-header {
    padding: 20px;
  }
  
  .result-header h2 {
    font-size: 20px;
  }
  
  .result-content {
    padding: 20px;
  }
  
  .result-actions {
    padding: 0 20px 20px 20px;
    flex-direction: column;
  }
  
  .score-number {
    font-size: 28px;
  }
}
`;

// Thêm CSS vào document
function addSubmitLoadingCSS() {
  if (!document.querySelector('#submit-loading-styles')) {
    const styleElement = document.createElement('style');
    styleElement.id = 'submit-loading-styles';
    styleElement.textContent = submitLoadingCSS;
    document.head.appendChild(styleElement);
  }
}

// Function hiển thị loading khi submit
function showSubmitLoading() {
  // Thêm CSS
  addSubmitLoadingCSS();
  
  // Xóa loading cũ nếu có
  const existingLoading = document.querySelector('.submit-loading-overlay');
  if (existingLoading) {
    existingLoading.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'submit-loading-overlay';
  
  overlay.innerHTML = `
    <div class="submit-loading-content">
      <div class="submit-spinner"></div>
      <div class="submit-loading-text" id="submitLoadingText">Đang xử lý...</div>
      <div class="submit-loading-detail" id="submitLoadingDetail">Vui lòng chờ trong giây lát</div>
      
      <div class="submit-progress-bar">
        <div class="submit-progress-fill" id="submitProgressFill" style="width: 0%"></div>
      </div>
      
      <div class="submit-step-indicator">
        <div class="submit-step" id="step1"></div>
        <div class="submit-step" id="step2"></div>
        <div class="submit-step" id="step3"></div>
        <div class="submit-step" id="step4"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }

  return {
    updateProgress: (step, text, detail) => {
      const loadingText = overlay.querySelector('#submitLoadingText');
      const loadingDetail = overlay.querySelector('#submitLoadingDetail');
      const progressFill = overlay.querySelector('#submitProgressFill');
      
      if (loadingText) loadingText.textContent = text;
      if (loadingDetail) loadingDetail.textContent = detail;
      if (progressFill) progressFill.style.width = `${(step / 4) * 100}%`;
      
      // Cập nhật step indicators
      for (let i = 1; i <= 4; i++) {
        const stepEl = overlay.querySelector(`#step${i}`);
        if (stepEl) {
          stepEl.classList.remove('active', 'completed');
          if (i < step) {
            stepEl.classList.add('completed');
          } else if (i === step) {
            stepEl.classList.add('active');
          }
        }
      }
    },
    hide: () => {
      if (overlay && overlay.parentNode) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.remove();
            document.body.style.overflow = '';
          }
        }, 300);
      }
    }
  };
}

// Function delay với promise
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Function hiển thị popup kết quả
function showResultPopup(roomNumber, nguoiTruc, score, khongCoNguoiTruc = false) {
  // Thêm CSS
  addSubmitLoadingCSS();
  
  // Xóa popup cũ nếu có
  const existingPopup = document.querySelector('.result-popup-overlay');
  if (existingPopup) {
    existingPopup.remove();
  }

  // Tính toán rating
  const percentage = (score / 55) * 100;
  let rating = '';
  let ratingClass = '';

  // Tạo popup
  const overlay = document.createElement('div');
  overlay.className = 'result-popup-overlay';
  
  overlay.innerHTML = `
    <div class="result-popup">
      <div class="result-header">
        <h2>Kết quả đã được lưu thành công</p>
      </div>
      
      <div class="result-content">
        <div class="result-item">
          <div class="result-label">
            Số phòng:
          </div>
          <div class="result-value">${roomNumber}</div>
        </div>
        
        <div class="result-item">
          <div class="result-label">
            Người trực:
          </div>
          <div class="result-value">
            ${khongCoNguoiTruc ? 'Không có người trực' : nguoiTruc}
          </div>
        </div>
        
        <div class="score-display">
          <div class="score-number">${Math.round(score * 100) / 100}</div>
          <div style="color: #666; font-size: 14px;">/ 55 điểm</div>
          <div class="score-rating ${ratingClass}">
            ${rating} (${Math.round(percentage)}%)
          </div>
        </div>
      </div>
      
      <div class="result-actions">
        <button class="result-btn btn-back" id="backToListBtn">
          ← Quay lại danh sách
        </button>
        <button class="result-btn btn-continue" id="continueBtn">
          Tiếp tục ở đây ↻
        </button>
      </div>
    </div>
  `;

  // Thêm popup vào document
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100, 50, 200]);
  }

  // Xử lý sự kiện nút
  const backBtn = overlay.querySelector('#backToListBtn');
  const continueBtn = overlay.querySelector('#continueBtn');

  backBtn.addEventListener('click', () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    
    // Đóng popup
    closeResultPopup();
    
    // Quay lại danh sách phòng
    const container = document.querySelector('.container');
    container.innerHTML = `<div id="roomList"></div>`;
    loadRoomList();
  });

  continueBtn.addEventListener('click', () => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    
    // Chỉ đóng popup, giữ nguyên form
    closeResultPopup();
  });

  // Đóng popup khi click overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeResultPopup();
    }
  });
}

function closeResultPopup() {
  const overlay = document.querySelector('.result-popup-overlay');
  if (overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// Function hiển thị popup lỗi
function showErrorPopup(roomNumber, errorMessage) {
  // Thêm CSS
  addSubmitLoadingCSS();
  
  const overlay = document.createElement('div');
  overlay.className = 'result-popup-overlay';
  
  overlay.innerHTML = `
    <div class="result-popup">
      <div class="result-header" style="background: linear-gradient(135deg, #dc3545, #c82333);">
        <h2>Có lỗi xảy ra!</h2>
        <p>Không thể lưu dữ liệu chấm phòng</p>
      </div>
      
      <div class="result-content">
        <div class="result-item">
          <div class="result-label">
            Phòng:
          </div>
          <div class="result-value">${roomNumber}</div>
        </div>
        
        <div class="result-item">
          <div class="result-label">
            ⚠️ Lỗi:
          </div>
          <div class="result-value" style="color: #dc3545;">
            ${errorMessage}
          </div>
        </div>
        
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 10px; padding: 15px; margin: 20px 0; color: #721c24;">
          <strong>💡 Gợi ý:</strong><br>
          • Kiểm tra kết nối internet<br>
          • Thử lại sau vài giây<br>
          • Liên hệ quản trị viên nếu lỗi tiếp tục
        </div>
      </div>
      
      <div class="result-actions">
        <button class="result-btn btn-continue" id="retryBtn" style="background: linear-gradient(135deg, #28a745, #1e7e34);">
          Thử lại
        </button>
        <button class="result-btn btn-back" id="errorBackBtn">
          ← Quay lại
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Haptic feedback cho lỗi
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }

  // Xử lý sự kiện nút
  const retryBtn = overlay.querySelector('#retryBtn');
  const backBtn = overlay.querySelector('#errorBackBtn');

  retryBtn.addEventListener('click', () => {
    overlay.remove();
    document.body.style.overflow = '';
    // Trigger submit lại
    const form = document.querySelector('#roomForm');
    if (form) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(submitEvent);
    }
  });

  backBtn.addEventListener('click', () => {
    overlay.remove();
    document.body.style.overflow = '';
  });

  // Đóng khi click overlay
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = '';
    }
  });
}

// Function xử lý submit form với loading
async function handleFormSubmit(e, form, roomData) {
  e.preventDefault();

  // Nếu form đã được lưu thành công rồi thì chặn gửi tiếp
  if (form.dataset.submitted === 'true') {
    alert('Dữ liệu đã được lưu. Vui lòng không gửi lại cùng một phiếu.');
    return;
  }

  // Nếu đang trong quá trình gửi thì chặn lần nhấp tiếp theo
  if (form.dataset.submitting === 'true') {
    return;
  }

  form.dataset.submitting = 'true';
  console.log('Form submitted');
  
  if (!validateRequiredFields(form)) {
    form.dataset.submitting = 'false';
    return;
  }

  // Khởi tạo loading với các bước
  const loadingControl = showSubmitLoading();

  try {
    // Bước 1: Kiểm tra dữ liệu
    loadingControl.updateProgress(1, 'Đang kiểm tra dữ liệu...', 'Xác thực thông tin form');
    await delay(800);

    // Bước 2: Tính toán điểm số
    loadingControl.updateProgress(2, 'Đang tính toán điểm số...', 'Phân tích kết quả chấm điểm');
    await delay(600);
    
    const criteria_scores = collectCriteriaScores(form);
    console.log('Criteria scores:', criteria_scores);

    const result = calculateScore(criteria_scores);
    console.log('Score result:', result);

    // Bước 3: Chuẩn bị dữ liệu
    loadingControl.updateProgress(3, 'Đang chuẩn bị dữ liệu...', 'Tạo payload và kiểm tra kết nối');
    await delay(500);

    const payload = createFirestorePayload(form, roomData, result);
    console.log('Payload to save:', payload);

    // Bổ sung ghi chú
    const ghiChu = form.querySelector('#ghiChu')?.value || "";
    payload.ghiChu = ghiChu;

    // Bước 4: Lưu dữ liệu
    loadingControl.updateProgress(4, 'Đang lưu dữ liệu...', 'Ghi vào cơ sở dữ liệu');
    await delay(400);

    await saveToFirestore(payload);
    
    // Đánh dấu form đã gửi thành công, chặn gửi lại
    form.dataset.submitted = 'true';
    form.dataset.submitting = 'false';
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Đã lưu';
      submitButton.style.cursor = 'not-allowed';
    }

    // Hoàn thành - delay một chút để user thấy hoàn thành
    loadingControl.updateProgress(4, 'Hoàn thành!', 'Dữ liệu đã được lưu thành công');
    await delay(600);
    
    // Đóng loading
    loadingControl.hide();

    // Delay nhỏ trước khi hiển thị kết quả
    await delay(200);

    // Lấy thông tin người trực để hiển thị
    const nguoiTrucValue = form.querySelector('input[name="nguoiTruc"]:checked')?.value || "";
    const isKhongCoNguoiTruc = nguoiTrucValue === 'khong_co_nguoi_truc';
    const nguoiTrucName = isKhongCoNguoiTruc ? "" : nguoiTrucValue;

    // Hiển thị popup kết quả
    showResultPopup(roomData.room, nguoiTrucName, result.score_55, isKhongCoNguoiTruc);
    
  } catch (error) {
    console.error('Lỗi khi submit form:', error);
    form.dataset.submitting = 'false';
    loadingControl.hide();
    
    // Delay nhỏ trước khi hiển thị lỗi
    await delay(200);
    
    // Enhanced error message với popup
    showErrorPopup(roomData.room, error.message);
  }
}

// ================================================================
// HƯỚNG DẪN SỬ DỤNG:
// 1. Thêm toàn bộ code trên vào đầu file script.js (sau phần firebase config)
// 2. Trong function loadRoomForm, tìm và thay thế dòng này:
//    form.addEventListener('submit', async (e) => { ... });
//    Bằng:
//    form.addEventListener('submit', (e) => handleFormSubmit(e, form, roomData));
// ================================================================

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

// Thêm function mới để cập nhật hiển thị tên người trực
function updatePersonalSectionsWithTrucName(container) {
  const personalSections = [
    'giuong', 'tu', 'keSach', 'ghe', 'mocTreoDo'
  ];
  
  const nguoiTrucRadios = container.querySelectorAll('input[name="nguoiTruc"]');
  
  nguoiTrucRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        const selectedValue = this.value;
        
        if (selectedValue === 'khong_co_nguoi_truc') {
          // Nếu chọn "Không có người trực" - ẩn tên người trực
          personalSections.forEach(section => {
            const memberList = container.querySelector(`.member-list[data-section="${section}"]`);
            if (memberList) {
              const memberRows = memberList.querySelectorAll('.member-row');
              memberRows.forEach(row => {
                const trucIndicator = row.querySelector('.truc-indicator');
                if (trucIndicator) {
                  trucIndicator.remove();
                }
              });
            }
          });
        } else {
          // Tìm tên của người được chọn làm trực
          const selectedName = selectedValue; // Giả sử value chính là tên
          
          personalSections.forEach(section => {
            const memberList = container.querySelector(`.member-list[data-section="${section}"]`);
            if (memberList) {
              const memberRows = memberList.querySelectorAll('.member-row');
              
              memberRows.forEach(row => {
                // Xóa indicator cũ (nếu có)
                const oldIndicator = row.querySelector('.truc-indicator');
                if (oldIndicator) {
                  oldIndicator.remove();
                }
                
                // Lấy tên thành viên từ strong tag
                const memberNameEl = row.querySelector('strong');
                if (memberNameEl && memberNameEl.textContent.trim() === selectedName) {
                  // Thêm indicator cho người trực
                  const trucIndicator = document.createElement('span');
                  trucIndicator.className = 'truc-indicator';
                  trucIndicator.textContent = ' (Người trực)';
                  trucIndicator.style.cssText = `
                    color: #dc3545;
                    font-weight: bold;
                    font-size: 12px;
                    background: #fff5f5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid #fecaca;
                    margin-left: 8px;
                  `;
                  memberNameEl.appendChild(trucIndicator);
                }
              });
            }
          });
        }
      }
    });
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
        form.addEventListener('submit', (e) => handleFormSubmit(e, form, roomData));
      }


      // ===== 5) Nút quay lại =====
      const backBtn = container.querySelector('#backBtn');
      if (backBtn) {
        backBtn.addEventListener('click', () => {
          container.innerHTML = `<div id="roomList"></div>`;
          loadRoomList();
        });
      }

      // ===== THÊM MỚI: Cập nhật hiển thị tên người trực và tự động tick "Đạt" cho khu vực cá nhân =====
      const personalSections = ['giuong', 'tu', 'keSach', 'ghe', 'mocTreoDo'];
      const nguoiTrucRadios = container.querySelectorAll('input[name="nguoiTruc"]');
      nguoiTrucRadios.forEach(radio => {
        radio.addEventListener('change', function() {
          if (this.checked && this.value !== 'khong_co_nguoi_truc') {
            const selectedName = this.value;
            // Tự động tick "Đạt" cho các khu vực cá nhân của người trực
            personalSections.forEach(section => {
              const radioDat = container.querySelector(`input[type="radio"][name="${section}_${selectedName}"][value="Đạt"]`);
              if (radioDat) radioDat.checked = true;
            });
            // Hiển thị nhãn "Người trực" ở các khu vực cá nhân
            personalSections.forEach(section => {
              const memberList = container.querySelector(`.member-list[data-section="${section}"]`);
              if (memberList) {
                const memberRows = memberList.querySelectorAll('.member-row');
                memberRows.forEach(row => {
                  // Xóa nhãn cũ nếu có
                  const oldIndicator = row.querySelector('.truc-indicator');
                  if (oldIndicator) oldIndicator.remove();
                  // Thêm nhãn mới cho người trực
                  const memberNameEl = row.querySelector('strong');
                  if (memberNameEl && memberNameEl.textContent.trim() === selectedName) {
                    const trucIndicator = document.createElement('span');
                    trucIndicator.className = 'truc-indicator';
                    trucIndicator.textContent = ' (Người trực)';
                    trucIndicator.style.cssText = `
                      color: #dc3545;
                      font-weight: bold;
                      font-size: 12px;
                      background: #fff5f5;
                      padding: 2px 6px;
                      border-radius: 4px;
                      border: 1px solid #fecaca;
                      margin-left: 8px;
                    `;
                    memberNameEl.appendChild(trucIndicator);
                  }
                });
              }
            });
          } else if (this.checked && this.value === 'khong_co_nguoi_truc') {
            // Nếu chọn "Không có người trực", xóa nhãn "Người trực" ở các khu vực cá nhân
            personalSections.forEach(section => {
              const memberList = container.querySelector(`.member-list[data-section="${section}"]`);
              if (memberList) {
                const memberRows = memberList.querySelectorAll('.member-row');
                memberRows.forEach(row => {
                  const trucIndicator = row.querySelector('.truc-indicator');
                  if (trucIndicator) trucIndicator.remove();
                });
              }
            });
          }
        });
      });

      // ===== THÊM MỚI: Hiển thị nhãn "Người trực" khi render form lần đầu nếu đã chọn =====
      setTimeout(() => {
        const checkedRadio = container.querySelector('input[name="nguoiTruc"]:checked');
        if (checkedRadio && checkedRadio.value !== 'khong_co_nguoi_truc') {
          const selectedName = checkedRadio.value;
          personalSections.forEach(section => {
            const memberList = container.querySelector(`.member-list[data-section="${section}"]`);
            if (memberList) {
              const memberRows = memberList.querySelectorAll('.member-row');
              memberRows.forEach(row => {
                const memberNameEl = row.querySelector('strong');
                if (memberNameEl && memberNameEl.textContent.trim() === selectedName) {
                  const trucIndicator = document.createElement('span');
                  trucIndicator.className = 'truc-indicator';
                  trucIndicator.textContent = ' (Người trực)';
                  trucIndicator.style.cssText = `
                    color: #dc3545;
                    font-weight: bold;
                    font-size: 12px;
                    background: #fff5f5;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid #fecaca;
                    margin-left: 8px;
                  `;
                  memberNameEl.appendChild(trucIndicator);
                }
              });
            }
          });
        }
      }, 0);

      // ===== THÊM MỚI: Hiển thị họ tên người trực ở các khu vực cá nhân =====
      const personalLabels = [
        { selector: 'legend', keyword: 'Giường người trực' },
        { selector: 'legend', keyword: 'Tủ người trực' },
        { selector: 'legend', keyword: 'Kệ sách người trực' },
        { selector: 'legend', keyword: 'Ghế người trực' },
        { selector: 'legend', keyword: 'Móc treo đồ người trực' }
      ];

      function updatePersonalAreaLabels(trucName) {
        personalLabels.forEach(item => {
          const legends = container.querySelectorAll(item.selector);
          legends.forEach(legend => {
            if (legend.textContent.trim().startsWith(item.keyword)) {
              // Nếu có tên người trực thì thêm vào, nếu không thì chỉ giữ nguyên
              if (trucName && trucName !== 'khong_co_nguoi_truc') {
                legend.innerHTML = `<span style="color:#007bff">${item.keyword}: ${trucName}</span> <span style="color:red">*</span>`;
              } else {
                legend.innerHTML = `${item.keyword} <span style="color:red">*</span>`;
              }
            }
          });
        });
      }

      // Sự kiện khi chọn người trực
      nguoiTrucRadios.forEach(radio => {
        radio.addEventListener('change', function() {
          updatePersonalAreaLabels(this.value);
        });
      });

      // Hiển thị tên người trực khi load form lần đầu nếu đã chọn
      setTimeout(() => {
        const checkedRadio = container.querySelector('input[name="nguoiTruc"]:checked');
        if (checkedRadio) {
          updatePersonalAreaLabels(checkedRadio.value);
        }
      }, 0);
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
  const personalAreas = ['giuong', 'tu', 'keSach', 'ghe', 'mocTreoDo'];
  
  // Thu thập tất cả radio được chọn (trừ nguoiTruc)
  const radios = form.querySelectorAll('input[type="radio"]:checked');
  radios.forEach(radio => {
    const name = radio.name;
    const value = radio.value;
    
    // Bỏ qua nguoiTruc vì không phải là tiêu chí chấm điểm
    if (name === 'nguoiTruc') return;

    let scoreKey = name;
    const underscoreIndex = name.indexOf('_');
    if (underscoreIndex > 0) {
      const areaType = name.slice(0, underscoreIndex);
      if (personalAreas.includes(areaType)) {
        scoreKey = areaType;
      }
    }
    
    // Chuyển đổi giá trị thành số
    if (value === 'Đạt') {
      if (criteria_scores[scoreKey] !== 0) {
        criteria_scores[scoreKey] = 1;
      }
    } else if (value === 'Không đạt') {
      criteria_scores[scoreKey] = 0;
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


/** Lưu Firestore (collection: "cham_phong_9") với ID custom date_room */
async function saveToFirestore(payload) {
  if (!window._db) {
    throw new Error("Firebase chưa khởi tạo (_db not found).");
  }

  if (!payload.createdAt || !payload.room) {
    throw new Error("Payload thiếu createdAt hoặc room.");
  }

  const createdDate = new Date(payload.createdAt);
  if (Number.isNaN(createdDate.getTime())) {
    throw new Error("createdAt không phải định dạng ngày hợp lệ.");
  }

  const dateKey = createdDate.toISOString().slice(0, 10); // YYYY-MM-DD
  const roomKey = payload.room.replace(/[\/\s]+/g, '_');
  const docId = `${dateKey}_${roomKey}`;

  try {
    console.log('Saving to Firestore with custom ID:', docId, payload); // Debug

    await window._db.collection("cham_phong_9").doc(docId).set({
      ...payload,
      serverTimestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    console.log("Đã lưu document với ID:", docId);
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

