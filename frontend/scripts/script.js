document.addEventListener('DOMContentLoaded', () => {
  loadRoomList();
});

function loadRoomList() {
  fetch('member.json')
    .then(res => {
      if (!res.ok) throw new Error(`Lỗi HTTP! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const roomListContainer = document.getElementById('roomList');
      roomListContainer.innerHTML = '';

      if (!data || data.length === 0) {
        roomListContainer.innerHTML = '<p>Không có phòng nào để hiển thị.</p>';
        return;
      }

      data.forEach(roomData => {
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
        roomListContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error('Lỗi khi load danh sách phòng:', err);
      document.getElementById('roomList').innerHTML = '<p>Lỗi khi tải danh sách phòng.</p>';
    });
}

function loadRoomForm(roomData) {
  fetch('form.html')
    .then(res => {
      if (!res.ok) throw new Error(`Lỗi HTTP! status: ${res.status}`);
      return res.text();
    })
    .then(html => {
      // Tạo DOM tạm để lấy phần main
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const mainContent = tempDiv.querySelector('main');

      const container = document.querySelector('.container');
      container.innerHTML = `
        <h1 id="pageHeading">CHẤM PHÒNG ${roomData.room}</h1>
        ${mainContent.innerHTML}
        <button id="backBtn" class="back-btn">Quay lại danh sách</button>
      `;

      // Chèn danh sách thành viên vào fieldset "Họ và tên người trực"
      const fieldset = container.querySelector('fieldset');
      fieldset.innerHTML = `<legend>Họ và tên người trực <span style="color:red">*</span></legend>`;
      roomData.members.forEach(name => {
        const label = document.createElement('label');
        label.innerHTML = `<input type="radio" name="nguoiTruc" value="${name}"> ${name}`;
        fieldset.appendChild(label);
        fieldset.appendChild(document.createElement('br'));
      });

      // Nút quay lại
      document.getElementById('backBtn').addEventListener('click', () => {
        container.innerHTML = `<div id="roomList"></div>`;
        loadRoomList();
      });
    })
    .catch(err => {
      console.error('Lỗi khi load form chấm phòng:', err);
      document.querySelector('.container').innerHTML = '<p>Lỗi khi tải form chấm phòng.</p>';
    });
}
