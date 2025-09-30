// ===== Trọng số gốc cho từng tiêu chí =====
  // Mapping với tên field thực tế trong HTML form
  const base_weights = {
    // Khu vực hành lang
    'hanhLang_giayDepSachSe': 1,
    'hanhLang_giayDepXepDung': 1,
    'hanhLang_keDep': 1,
    'hanhLang_sanHanhLang': 1,
    
    // Khu vực phòng sinh hoạt
    'phongSinhHoat_sanPhongSach': 1,
    'phongSinhHoat_sanGonGang': 1, // Sàn gọn gàng trong form
    'phongSinhHoat_giuongTuBanGheMocTrong': 1,
    'phongSinhHoat_cuaGoSach': 1,
    'phongSinhHoat_cuaKinhSach': 1,
    'phongSinhHoat_quatDaoSach': 1,
    'phongSinhHoat_dauTuQuanAoXepDung': 1,
    
    // Giường người trực
    'GiuongNguoiTruc': 2,
    
    // Tủ người trực  
    'TuNguoiTruc': 2,
    
    // Kệ sách người trực
    'KeSachNguoiTruc': 2,
    
    // Ghế người trực
    'GheNguoiTruc': 2,
    
    // Khu vực ban công
    'banCong_chenDuaSachSe': 1,
    'banCong_chenDuaGonGang': 1,
    'banCong_sanSachSe': 1,
    'banCong_sanGonGang': 1,
    'banCong_loThoatNuocSach': 1,
    
    // Khu vực bồn rửa tay
    'bonRuaTay_guongVoiNuoc': 1,
    'bonRuaTay_bonRuaTay': 1,
    'bonRuaTay_sanSachSe': 1,
    'bonRuaTay_thungRac': 1,
    'bonRuaTay_tuongLavabo': 1,
    'bonRuaTay_mocTreoChoi': 1,
    
    // Khu vực giặt đồ
    'sanTuongGiatDo': 1,
    'thauCayGiatDo': 1,
    'loThoatNuocGiatDo': 1,
    'voiNuocGiatDo': 1,
    'saoDoGiatDo': 1,
    'cuaSoGiatDo': 1,
    'giaTreoGiatDo': 1,
    
    // Móc treo người trực
    'mocNguoiTruc': 2,
    
    // Khu vực nhà tắm nhỏ
    'sanTuongNhaTamNho': 1,
    'cuaNhaTamNho': 1,
    'giaTrongNhaTamNho': 1,
    'voiSenNhaTamNho': 1,
    'loThoatNuocNhaTamNho': 1,

    // Khu vực nhà tắm lớn
    'sanTuongTamLon': 1,
    'cuaTamLon': 1,
    'giaTrongTamLon': 1,
    'giaTreoChaTamLon': 1,
    'voiSenTamLon': 1,
    'voiXitTamLon': 1,
    'loThoatNuocTamLon': 1,
    'bonCauTamLon': 1,
    'quatHutTamLon': 1,
    
    // Khu vực WC nhỏ
    'sanTuongWCNho': 1,
    'cuaWCNho': 1,
    'giaTreoChaWCNho': 1,
    'voiXitWCNho': 1,
    'loThoatNuocWCNho': 1,
    'bonCauWCNho': 1,
    'quatHutWCNho': 1,

    // Khu vực cá nhân (sẽ được xử lý riêng)
    'giuong': 2,
    'tu': 2,
    'keSach': 2,
    'ghe': 2,
    'mocTreoDo': 2
  };
  /** Tính điểm theo quy tắc đơn giản hóa */
  function calculateScore(criteria_scores) {
    const all_criteria = [
        'hanhLang_giayDepSachSe', 'hanhLang_giayDepXepDung', 'hanhLang_keDep', 'hanhLang_sanHanhLang',
        'phongSinhHoat_sanPhongSach', 'phongSinhHoat_sanGonGang', 'phongSinhHoat_giuongTuBanGheMocTrong',
        'phongSinhHoat_cuaGoSach', 'phongSinhHoat_cuaKinhSach', 'phongSinhHoat_quatDaoSach', 'phongSinhHoat_dauTuQuanAoXepDung',
        'GiuongNguoiTruc', 'TuNguoiTruc', 'KeSachNguoiTruc', 'GheNguoiTruc',
        'banCong_chenDuaSachSe', 'banCong_chenDuaGonGang', 'banCong_sanSachSe', 'banCong_sanGonGang', 'banCong_loThoatNuocSach',
        'bonRuaTay_guongVoiNuoc', 'bonRuaTay_bonRuaTay', 'bonRuaTay_sanSachSe', 'bonRuaTay_thungRac', 'bonRuaTay_tuongLavabo', 'bonRuaTay_mocTreoChoi',
        'sanTuongGiatDo', 'thauCayGiatDo', 'loThoatNuocGiatDo', 'voiNuocGiatDo', 'saoDoGiatDo', 'cuaSoGiatDo', 'giaTreoGiatDo',
        'mocNguoiTruc',
        'sanTuongNhaTamNho', 'cuaNhaTamNho', 'giaTrongNhaTamNho', 'voiSenNhaTamNho', 'loThoatNuocNhaTamNNo',
        'sanTuongTamLon', 'cuaTamLon', 'giaTrongTamLon', 'giaTreoChaTamLon', 'voiSenTamLon', 'voiXitTamLon', 'loThoatNuocTamLon', 'bonCauTamLon', 'quatHutTamLon',
        'sanTuongWCNho', 'cuaWCNho', 'giaTreoChaWCNho', 'voiXitWCNho', 'loThoatNuocWCNho', 'bonCauWCNho', 'quatHutWCNho',
        'giuong', 'tu', 'keSach', 'ghe', 'mocTreoDo'
    ];

    let score_55 = 55;
    let failed = 0;

    all_criteria.forEach(key => {
        let value = criteria_scores[key];
        if (value === 'Không đạt' || value === 0) {
            score_55 -= 1;
            failed += 1;
        }
        // Đạt thì giữ nguyên, không đạt thì trừ 1 điểm
    });

    // Không cho điểm âm
    if (score_55 < 0) score_55 = 0;

    return {
        score_55,
        raw_score: 55 - failed,
        total_criteria: all_criteria.length,
        max_score: 55,
        failed_low: failed,
        failed_medium: 0,
        failed_personal: 0
    };
}