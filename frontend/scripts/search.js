function setupSearch(data, renderRoomList, containerSelector = '.container') {
  const container = document.querySelector(containerSelector);

  // Lấy ô tìm kiếm đã có trong header
  const searchBox = document.querySelector('#searchInput');
  if (!searchBox) {
    console.error("Không tìm thấy #searchInput trong header!");
    return;
  }

  // Vùng chứa danh sách phòng (nếu chưa có thì tạo mới)
  let roomListContainer = document.querySelector('#roomList');
  if (!roomListContainer) {
    roomListContainer = document.createElement('div');
    roomListContainer.id = "roomList";
    container.innerHTML = ''; // chỉ xóa nội dung danh sách, không động tới header
    container.appendChild(roomListContainer);
  }

  // Render toàn bộ ngay khi load
  renderRoomList(data, roomListContainer);

  // Sự kiện tìm kiếm
  searchBox.addEventListener('input', (e) => {
    const keyword = e.target.value.trim().toLowerCase();
    if (keyword === "") {
      renderRoomList(data, roomListContainer);
    } else {
      const filtered = data.filter(roomData =>
        roomData.room.toLowerCase().includes(keyword)
      );
      renderRoomList(filtered, roomListContainer);
    }
  });
}
