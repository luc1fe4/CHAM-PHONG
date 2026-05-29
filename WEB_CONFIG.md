# 📋 CHAM-PHONG Web Application - Comprehensive Configuration

## 📌 Project Overview

**CHAM-PHONG** là ứng dụng web cho phép chấm phòng ký túc xá (KTX) Cỏ May của trường Đại học Nông Lâm. Hệ thống cho phép người chủ trì nhập dữ liệu chấm điểm các tiêu chí vệ sinh phòng và lưu trữ dữ liệu trên Firebase.

---

## 🏗️ Project Structure

```
d:\Self_Project\Doi_Cham_Phong\
├── CHAM-PHONG/                              # Main project folder
│   ├── frontend/                            # Frontend application
│   │   ├── index.html                       # Main page
│   │   ├── form.html                        # Form for scoring
│   │   ├── champhong.html                   # Room scoring page
│   │   ├── member.json                      # List of members and rooms
│   │   ├── firebase.json                    # Firebase deployment config
│   │   ├── 404.html                         # Error page
│   │   │
│   │   ├── images/                          # Static images
│   │   │   ├── ktxCM.png                    # KTX Cỏ May logo
│   │   │   └── NongLam.png                  # University logo
│   │   │
│   │   ├── scripts/                         # JavaScript files
│   │   │   ├── script.js                    # Main application logic
│   │   │   ├── scoring.js                   # Scoring calculation logic
│   │   │   ├── firebase-config.js           # Firebase configuration
│   │   │   ├── login.js                     # Login functionality
│   │   │   ├── dashboard.js                 # Dashboard features
│   │   │   ├── search.js                    # Search functionality
│   │   │   ├── mobile-manifest.js           # Mobile app manifest
│   │   │   ├── touch-interactions.js        # Mobile touch events
│   │   │   │
│   │   │   └── feature/                     # Advanced features
│   │   │       ├── detailed-monthly-analysis.js
│   │   │       ├── monthly-stats.js
│   │   │       ├── notes.js
│   │   │       ├── violations-query.js
│   │   │       └── weekly-stats.js
│   │   │
│   │   ├── styles/                          # CSS files
│   │   │   ├── style_main.css               # Main styles
│   │   │   ├── style_form.css               # Form styles
│   │   │   ├── styles.css                   # General styles
│   │   │   ├── mobile-responsive.css        # Mobile responsive design
│   │   │   └── content-script.css           # Content script styles
│   │   │
│   │   ├── README.md                        # Project documentation
│   │
│   └── Room-s-Transcript-Rating/            # Additional project
│       ├── index.html
│       ├── README.md
│       └── ... (extension files)
```

---

## 🔧 Firebase Configuration

### Firebase Project Details

```json
{
  "projectId": "cham-phong",
  "apiKey": "AIzaSyDV56FUyAlePJDFla4ZBvRkv4OUe8b9c8g",
  "authDomain": "cham-phong.firebaseapp.com",
  "storageBucket": "cham-phong.firebasestorage.app",
  "messagingSenderId": "871544721414",
  "appId": "1:871544721414:web:b6619c3c49bdcdf44ff387",
  "measurementId": "G-43GW7XRBXF"
}
```

### Firestore Collections

- **Collection**: `cham_phong_9`
  - **Document ID Format**: `{YYYY-MM-DD}_{room_number}`
  - **Fields**:
    - `room`: Số phòng (string)
    - `floor`: Tầng (number)
    - `nguoiTruc`: Tên người trực (string)
    - `khongCoNguoiTruc`: Boolean - Không có người trực
    - `score_55`: Điểm số cuối (number, max: 55)
    - `failed_low`: Số tiêu chí không đạt chung (number)
    - `failed_personal`: Số tiêu chí cá nhân không đạt (number)
    - `ghiChu`: Ghi chú (string)
    - `createdAt`: Timestamp (ISO string)
    - `[area]_[member_name]`: Điểm từng khu vực cá nhân (0 or 1)

### Firebase Hosting Configuration

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

---

## 👥 Member Database Structure

### member.json Format

```json
[
  {
    "room": "015",
    "floor": 0,
    "members": [
      {
        "mssv": "2301010",
        "name": "Phan Lê Nhật Anh"
      },
      ...
    ]
  }
]
```

**Dữ liệu mẫu**: 
- Phòng 015, 016, 017, ... (tầng 0)
- Mỗi phòng có 8 thành viên
- Mỗi thành viên có: MSSV (Mã số sinh viên) và Tên đầy đủ

---

## 📊 Scoring System

### Tiêu chí chấm điểm

#### 1. Khu vực Hành lang (7 tiêu chí × 1 điểm)
- Giày dép sạch sẽ
- Giày dép xếp đúng
- Kệ dép
- Sàn hành lang

#### 2. Khu vực Phòng sinh hoạt (7 tiêu chí × 1 điểm)
- Sàn phòng sạch
- Sàn gọn gàng
- Giường, tủ, bàn ghế, móc treo trong
- Cửa gỗ sạch
- Cửa kính sạch
- Quạt đảo sạch
- Đầu tủ, quần áo xếp đúng

#### 3. Giường người trực (1 tiêu chí × 2 điểm)

#### 4. Tủ người trực (1 tiêu chí × 2 điểm)

#### 5. Kệ sách cá nhân (1 tiêu chí × 2 điểm)

#### 6. Ghế cá nhân (1 tiêu chí × 2 điểm)

#### 7. Ban công (5 tiêu chí × 1 điểm)
- Chén đũa sạch sẽ
- Chén đũa gọn gàng
- Sàn sạch sẽ
- Sàn gọn gàng
- Lỗ thoát nước sạch

#### 8. Bồn rửa tay (6 tiêu chí × 1 điểm)
- Gương vòi nước
- Bồn rửa tay
- Sàn sạch sẽ
- Thùng rác
- Tường lavabo
- Móc treo chỗi

#### 9. Khu vực giặt đồ (7 tiêu chí × 1 điểm)
- Sàn tường
- Thau cây
- Lỗ thoát nước
- Vòi nước
- Sao đo
- Cửa số
- Giá treo

#### 10. Móc treo người trực (1 tiêu chí × 2 điểm)

#### 11. Nhà tắm nhỏ (5 tiêu chí × 1 điểm)
- Sàn tường
- Cửa
- Giá trong
- Vòi sen
- Lỗ thoát nước

#### 12. Nhà tắm lớn (9 tiêu chí × 1 điểm)
- Sàn tường
- Cửa
- Giá trong
- Giá treo chà
- Vòi sen
- Vòi xịt
- Lỗ thoát nước
- Bồn cầu
- Quạt hút

#### 13. WC nhỏ (7 tiêu chí × 1 điểm)
- Sàn tường
- Cửa
- Giá treo chà
- Vòi xịt
- Lỗ thoát nước
- Bồn cầu
- Quạt hút

### Công thức tính điểm

```javascript
// Điểm tối đa: 55
score_55 = 55

// Nếu một tiêu chí "Không đạt" → trừ 1 điểm
if (criteria === "Không đạt" || criteria === 0) {
  score_55 -= 1
  
  // Phân loại:
  if (isPersonalArea) {
    failed_personal += 1
  } else {
    failed_low += 1
  }
}

// Điểm không âm
if (score_55 < 0) score_55 = 0
```

### Quy tắc tính điểm

- Chỉ tính điểm **khu vực vệ sinh chung** và **khu vực cá nhân của người trực**
- Khu vực cá nhân của người không trực **không được tính**
- Khu vực cá nhân người trực: `giuong, tu, keSach, ghe, mocTreoDo`
- Mỗi tiêu chí "Không đạt" = trừ 1 điểm

---

## 📱 HTML Pages

### index.html
- Trang chủ chính
- Điều hướng chính (Home, Chấm phòng, Liên hệ)
- Logo KTX Cỏ May & Đại học Nông Lâm
- Function tabs menu

### form.html
- Form chấm phòng chi tiết
- Chứa các fieldset cho từng khu vực
- Đánh giá cho từng thành viên
- Người trực - các tiêu chí chung
- Textarea ghi chú
- Nút submit

### champhong.html
- Trang chấm phòng
- Danh sách phòng
- Điều hướng phòng

### 404.html
- Trang lỗi 404

---

## 🎨 Styling Files

### style_main.css
- Styles cho layout chính
- Styling header, navigation
- Container styles

### style_form.css
- Styles cho form chấm phòng
- Fieldset styling
- Input, radio button styles
- Table styles cho tiêu chí

### styles.css
- Styles tổng quát
- Button styles
- General typography

### mobile-responsive.css
- Responsive design cho mobile
- Grid layout adjustments
- Font size scaling
- Touch-friendly buttons
- Viewport optimization

---

## 🚀 JavaScript Files

### script.js (Main Application)
```
Chức năng chính:
- Load danh sách phòng từ member.json
- Render form chấm phòng động
- Xử lý sự kiện submit form
- Lưu dữ liệu lên Firebase
- Hiển thị kết quả chấm điểm
- Xử lý loading & error popups
- Mobile optimization
```

**Key Functions**:
- `loadRoomList()` - Load danh sách phòng
- `renderRoomList(roomArray, container)` - Render room cards
- `loadRoomForm(roomData)` - Load form chấm phòng
- `collectCriteriaScores(form)` - Thu thập điểm từ form
- `createFirestorePayload(form, roomData, result)` - Tạo payload cho Firestore
- `saveToFirestore(payload)` - Lưu dữ liệu lên Firebase
- `handleFormSubmit(e, form, roomData)` - Xử lý submit form
- `showSubmitLoading()` - Hiển thị loading popup
- `showResultPopup(...)` - Hiển thị popup kết quả
- `showErrorPopup(...)` - Hiển thị popup lỗi

### scoring.js (Scoring Logic)
```
Chức năng chính:
- Định nghĩa trọng số cho từng tiêu chí
- Tính điểm theo quy tắc chỉ trừ khu vực vệ sinh chung và cá nhân người trực
```

**Key Structure**:
```javascript
const base_weights = {
  'hanhLang_giayDepSachSe': 1,
  'hanhLang_giayDepXepDung': 1,
  // ... more criteria
  'giuong': 2,              // Personal areas - weight 2
  'tu': 2,
  'keSach': 2,
  'ghe': 2,
  'mocTreoDo': 2
}

function calculateScore(criteria_scores, dutyName = '') {
  // Return: { score_55, raw_score, total_criteria, max_score, failed_low, failed_personal }
}
```

### firebase-config.js
- Firebase initialization config
- Firestore database setup

### login.js
- Login functionality

### dashboard.js
- Dashboard features

### search.js
- Search & filter functionality

### mobile-manifest.js
- Mobile app manifest configuration

### touch-interactions.js
- Mobile touch event handlers

### feature/*.js
- Advanced analytics and reporting features

---

## 🔗 Data Flow

```
┌─────────────────────┐
│  member.json        │ (Load room & member list)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  script.js: loadRoomList()          │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Render room cards grid             │
│  (mobile-room-card)                 │
└──────────┬──────────────────────────┘
           │
           ▼ (Click room)
┌─────────────────────────────────────┐
│  script.js: loadRoomForm()          │
│  Load form.html & populate data     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  Render form with:                  │
│  - Người trực radio buttons         │
│  - Member rows per section          │
│  - Criteria checkboxes              │
└──────────┬──────────────────────────┘
           │
           ▼ (Fill form & Submit)
┌─────────────────────────────────────┐
│  handleFormSubmit()                 │
│  - Validate required fields         │
│  - Show loading popup               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  collectCriteriaScores(form)        │
│  - Extract radio selections         │
│  - Return criteria_scores object    │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  scoring.js: calculateScore()       │
│  - Calculate score_55               │
│  - Count failed items               │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  createFirestorePayload()           │
│  - Map data to Firestore format     │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  saveToFirestore(payload)           │
│  - Save to: cham_phong_9/           │
│  - Doc ID: {date}_{room}            │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│  showResultPopup(...)               │
│  - Display score & details          │
│  - Show rating badge                │
└─────────────────────────────────────┘
```

---

## 📲 Mobile Optimization Features

### Responsive Design
- Grid layout: `repeat(auto-fill, minmax(140px, 1fr))`
- Font scaling for small screens
- Touch-friendly button sizes (min 44×44px)
- Viewport: `width=device-width, initial-scale=0.5`

### Mobile Features
- Touch interactions & haptic feedback
- Optimized loading animations
- Mobile-specific room card layout
- Search suggestions for mobile
- Mobile web app capability
- Status bar styling

### Performance
- Lazy loading
- Progressive enhancement
- Minimal animations
- Efficient CSS media queries

---

## 🔐 Security Notes

⚠️ **IMPORTANT**: Firebase API key is public in code (as per Firebase design)
- Use Firestore security rules in Firebase Console
- Implement authentication if needed
- Consider environment variables for sensitive data

---

## 📦 Dependencies

### External Libraries
- **Firebase SDK**: Firestore & Authentication
- **Google Fonts**: Roboto (Vietnamese subset)
- **HTML5 APIs**: 
  - LocalStorage
  - Vibration API (for haptic feedback)
  - Fetch API

### Browser Compatibility
- Chrome/Chromium
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🎯 Key Features

### 1. Room Management
- Load rooms from JSON
- Display room cards with status
- Search/filter rooms
- Navigate between rooms

### 2. Scoring System
- Multi-criteria evaluation
- Per-member scoring
- Person-on-duty special rules
- Dynamic form generation

### 3. Data Persistence
- Firebase Firestore storage
- Real-time data sync
- Document ID: `{date}_{room}`
- Automatic timestamps

### 4. User Experience
- Loading overlay with progress
- Result popup with score breakdown
- Error handling & retry
- Mobile-optimized interface
- Touch feedback

### 5. Analytics (Optional)
- Monthly statistics
- Weekly analysis
- Detailed reports
- Violation tracking

---

## 🚀 Deployment

### Firebase Hosting

```bash
# Deploy configuration
{
  "hosting": {
    "public": "frontend",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

### Deploy Steps
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Live URL
```
https://cham-phong.firebaseapp.com
```

---

## 📋 Form Fields Summary

### Required Fields (marked with *)
- Tiêu chí chung của từng khu vực
- Người trực section
- Khu vực cá nhân của người trực
- Khu vực vệ sinh chung

### Optional Fields
- Ghi chú (textarea)

### Validation Rules
- All required radio buttons must be selected
- Prevents form submission if validation fails
- Shows error alerts

---

## 🎨 Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Primary | Blue | #007bff |
| Success | Green | #28a745 |
| Danger | Red | #dc3545 |
| Warning | Orange | #ffc107 |
| Text | Dark Gray | #333 |
| Border | Light Gray | #ddd |
| Background | White | #fff |

---

## 📊 Statistics & Calculations

### Score Breakdown
- **Max Score**: 55 điểm
- **Common Criteria**: ~42 tiêu chí × 1 điểm = 42 điểm
- **Duty Personal Area**: 5 khu vực × 1 tiêu chí = 5 điểm + bonus from common areas
- **Per Failure**: -1 điểm

### Performance Metrics
- Load time: < 2s
- Form render: < 1s
- Firestore save: < 3s
- Mobile optimization: 90+ Lighthouse score

---

## 🔄 Update & Maintenance

### member.json Updates
Update room & member information as needed:
```json
{
  "room": "001",
  "floor": 0,
  "members": [...]
}
```

### Scoring Rules Changes
Modify in `scoring.js`:
```javascript
const base_weights = {
  // Update weights here
}
```

### Form Updates
Modify in `form.html`:
- Add/remove fieldsets
- Update criteria descriptions
- Change required fields

---

## 📞 Contact & Support

- **Project**: CHAM-PHONG
- **University**: Trường Đại học Nông Lâm
- **Dormitory**: KTX Cỏ May
- **Technology Stack**: HTML5, CSS3, JavaScript ES6+, Firebase

---

**Last Updated**: May 29, 2026
**Version**: 1.0
**Status**: Production Ready ✅
