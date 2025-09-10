  // ===== Trọng số gốc cho từng tiêu chí =====
  // Mapping với tên field thực tế trong HTML form
  const base_weights = {
    // Khu vực hành lang
    'hanhLang_giayDepSachSe': 1,
    'hanhLang_giayDepXepDung': 2.5,
    'hanhLang_keDep': 1,
    'hanhLang_sanHanhLang': 1,
    
    // Khu vực phòng sinh hoạt
    'phongSinhHoat_sanPhongSach': 1,
    'phongSinhHoat_sanGonGang': 2.5, // Sàn gọn gàng trong form
    'phongSinhHoat_giuongTuBanGheMocTrong': 1,
    'phongSinhHoat_cuaGoSach': 1,
    'phongSinhHoat_cuaKinhSach': 2.5,
    'phongSinhHoat_quatDaoSach': 0.5,
    'phongSinhHoat_dauTuQuanAoXepDung': 0.5,
    
    // Giường người trực
    'GiuongNguoiTruc': 2,
    
    // Tủ người trực  
    'TuNguoiTruc': 2,
    
    // Kệ sách người trực
    'KeSachNguoiTruc': 2,
    
    // Ghế người trực
    'GheNguoiTruc': 2,
    
    // Khu vực ban công
    'banCong_chenDuaSachSe': 0.5,
    'banCong_chenDuaGonGang': 2.5,
    'banCong_sanSachSe': 1,
    'banCong_sanGonGang': 1,
    'banCong_loThoatNuocSach': 1,
    
    // Khu vực bồn rửa tay
    'bonRuaTay_guongVoiNuoc': 2.5,
    'bonRuaTay_bonRuaTay': 2.5,
    'bonRuaTay_sanSachSe': 2.5,
    'bonRuaTay_thungRac': 1,
    'bonRuaTay_tuongLavabo': 1,
    'bonRuaTay_mocTreoChoi': 0.5,
    
    // Khu vực giặt đồ
    'sanTuongGiatDo': 2.5,
    'thauCayGiatDo': 1,
    'loThoatNuocGiatDo': 2.5,
    'voiNuocGiatDo': 0.5,
    'saoDoGiatDo': 2.5,
    'cuaSoGiatDo': 1,
    'giaTreoGiatDo': 1,
    
    // Móc treo người trực
    'mocNguoiTruc': 2,
    
    // Khu vực nhà tắm nhỏ
    'sanTuongNhaTamNho': 2.5,
    'cuaNhaTamNho': 0.5,
    'giaTrongNhaTamNho': 1,
    'voiSenNhaTamNho': 0.5,
    'loThoatNuocNhaTamNho': 2.5,
    
    // Khu vực nhà tắm lớn
    'sanTuongTamLon': 2.5,
    'cuaTamLon': 0.5,
    'giaTrongTamLon': 1,
    'giaTreoChaTamLon': 0.5,
    'voiSenTamLon': 0.5,
    'voiXitTamLon': 0.5,
    'loThoatNuocTamLon': 2.5,
    'bonCauTamLon': 2.5,
    'quatHutTamLon': 0.5,
    
    // Khu vực WC nhỏ
    'sanTuongWCNho': 2.5,
    'cuaWCNho': 0.5,
    'giaTreoChaWCNho': 0.5,
    'voiXitWCNho': 0.5,
    'loThoatNuocWCNho': 1,
    'bonCauWCNho': 2.5,
    'quatHutWCNho': 0.5,
    
    // Khu vực cá nhân (sẽ được xử lý riêng)
    'giuong': 2,
    'tu': 2,
    'keSach': 2,
    'ghe': 2,
    'mocTreoDo': 2
  };

  // Nhóm ảnh hưởng thấp
  const low_impact_criteria = [
    'voiSenTamLon',
    'voiSenNhaTamNho',
    'voiXitWCNho',
    'voiXitTamLon',
    'quatHutWCNho',
    'quatHutTamLon',
    'phongSinhHoat_quatDaoSach',
    'giaTreoChaTamLon',
    'giaTreoChaWCNho',
    'phongSinhHoat_dauTuQuanAoXepDung',
    'bonRuaTay_mocTreoChoi',
    'banCong_chenDuaSachSe',
    'voiNuocGiatDo',
    'phongSinhHoat_cuaGoSach',
    'cuaWCNho',
    'cuaTamLon',
    'cuaNhaTamNho'
  ];

  // Nhóm ảnh hưởng trung bình
  const medium_impact_criteria = [
    'hanhLang_giayDepSachSe',
    'hanhLang_keDep',
    'hanhLang_sanHanhLang',
    'phongSinhHoat_sanPhongSach',
    'phongSinhHoat_giuongTuBanGheMocTrong',
    'phongSinhHoat_cuaGoSach',
    'banCong_sanSachSe',
    'banCong_sanGonGang',
    'banCong_loThoatNuocSach',
    'bonRuaTay_thungRac',
    'bonRuaTay_tuongLavabo',
    'thauCayGiatDo',
    'cuaSoGiatDo',
    'giaTreoGiatDo',
    'giaTrongNhaTamNho',
    'giaTrongTamLon',
    'loThoatNuocWCNho'
  ];

  // Khu vực cá nhân
  const personal_area_criteria = [
    'giuong',
    'tu',
    'keSach',
    'ghe',
    'mocTreoDo'
  ];

  /** Tính điểm theo quy tắc */
  function calculateScore(criteria_scores) {
    console.log('Calculating score with criteria:', criteria_scores);
    
    // copy trọng số gốc
    const current_weights = { ...base_weights };

    let failed_low = 0, failed_medium = 0, failed_personal = 0;
    const failed_low_list = [], failed_medium_list = [], failed_personal_list = [];

    // Xử lý khu vực cá nhân với format mới (giuong_TenThanhVien)
    let personal_scores = {};
    Object.keys(criteria_scores).forEach(key => {
      // Bỏ qua nguoiTruc vì không phải là tiêu chí chấm điểm
      if (key === 'nguoiTruc') return;
      
      // Kiểm tra xem có phải là khu vực cá nhân không
      const personalAreaType = personal_area_criteria.find(area => key.startsWith(area + '_'));
      
      if (personalAreaType) {
        // Đây là khu vực cá nhân với format: giuong_TenThanhVien
        if (!personal_scores[personalAreaType]) {
          personal_scores[personalAreaType] = [];
        }
        
        // Chuyển đổi giá trị từ string sang số
        let score = 0;
        if (criteria_scores[key] === 'Đạt') {
          score = 1;
        } else if (criteria_scores[key] === 'Không đạt') {
          score = 0;
        } else {
          score = criteria_scores[key]; // Trường hợp đã là số
        }
        
        personal_scores[personalAreaType].push(score);
      }
    });

    // Tính điểm trung bình cho khu vực cá nhân
    Object.keys(personal_scores).forEach(type => {
      const scores = personal_scores[type];
      if (scores.length > 0) {
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        criteria_scores[type] = avgScore; // Ghi đè với điểm trung bình
        
        if (avgScore < 0.5) { // Nếu trung bình dưới 50% thì tính là fail
          failed_personal++;
          failed_personal_list.push(type);
        }
      }
    });

    // Chuyển đổi giá trị string thành số cho các tiêu chí khác
    Object.keys(criteria_scores).forEach(key => {
      if (typeof criteria_scores[key] === 'string') {
        if (criteria_scores[key] === 'Đạt') {
          criteria_scores[key] = 1;
        } else if (criteria_scores[key] === 'Không đạt') {
          criteria_scores[key] = 0;
        }
      }
    });

    // check low impact
    low_impact_criteria.forEach(c => {
      if (criteria_scores[c] === 0) {
        failed_low++;
        failed_low_list.push(c);
      }
    });

    // check medium impact
    medium_impact_criteria.forEach(c => {
      if (criteria_scores[c] === 0) {
        failed_medium++;
        failed_medium_list.push(c);
      }
    });

    // điều chỉnh trọng số nếu nhiều tiêu chí không đạt
    if (failed_low >= 6) {
      failed_low_list.forEach(c => current_weights[c] = 6);
    } else if (failed_low >= 4) {
      failed_low_list.forEach(c => current_weights[c] = 4);
    } else if (failed_low >= 2) {
      failed_low_list.forEach(c => current_weights[c] = 2);
    }

    if (failed_medium >= 2) {
      failed_medium_list.forEach(c => current_weights[c] = 2);
    }

    if (failed_personal >= 2) {
      failed_personal_list.forEach(c => current_weights[c] = 4);
    }

    // tính điểm thực tế
    let actual_score = 0;
    let max_score = 0;

    Object.keys(base_weights).forEach(c => {
      max_score += base_weights[c];
      
      const score = criteria_scores[c];
      if (score !== undefined) {
        if (score === 1 || (personal_area_criteria.includes(c) && score >= 0.5)) {
          actual_score += current_weights[c] || base_weights[c];
        }
      }
    });

    const score_55 = (max_score > 0) ? Math.round((actual_score / max_score) * 55 * 100) / 100 : 0;

    const result = {
      actual_score: Math.round(actual_score * 100) / 100,
      max_score: Math.round((max_score / 87.5 * 55) * 100) / 100
      ,
      score_55,
      failed_low,
      failed_medium,
      failed_personal
    };
    
    console.log('Score calculation result:', result);
    return result;
  }