document.addEventListener("DOMContentLoaded", () => {
  const chamPhongLink = document.getElementById("chamPhongLink");
  chamPhongLink.addEventListener("click", (e) => {
    e.preventDefault();
    const password = prompt("Vui lòng nhập mật khẩu để truy cập:");
    if (password === "123456") {   // 🔑 thay bằng mật khẩu bạn muốn
      window.location.href = "champhong.html";
    } else if (password !== null) {
      alert("Sai mật khẩu!");
    }
  });
});
