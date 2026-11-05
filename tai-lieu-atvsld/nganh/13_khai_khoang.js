// Nội dung tài liệu số 13 – Ngành Khai khoáng.
// Nguồn: “Cẩm nang tư vấn ATVSLĐ – Ngành Khai khoáng” (bản cho nhân viên kinh doanh, thông tin pháp lý đến 16/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Khai khoáng thuộc khoản 1 Điều 36 và phải tổ chức y tế theo Điều 37 Nghị định 39/2016/NĐ-CP: bảng bố trí 5 mức,
// hai dòng ATVSLĐ + y tế như tài liệu 07.
// Điểm riêng: chế độ huấn luyện kỹ thuật an toàn khai thác khoáng sản (pháp luật khoáng sản) Viện không cung cấp.
// Cẩm nang còn dẫn Thông tư 05/2021/TT-BCT và Nghị định 113/2017/NĐ-CP; hai văn bản này đã được thay thế nên không đưa vào.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '13',
  tenFile: '13_KhaiKhoang_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Khai khoáng (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp khai khoáng – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Khai khoáng',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH KHAI KHOÁNG',
    gioiThieu: 'Mỏ hầm lò, mỏ lộ thiên, mỏ đá, cát và nhà máy tuyển có nhiều nguy cơ nghiêm trọng cùng lúc: nổ mìn, sập lở, '
      + 'xe và máy lớn, bụi, điện, không gian hạn chế, mặt nước. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh sáu nhóm huấn '
      + 'luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin '
      + 'cho buổi làm việc với chuyên viên của Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP KHAI KHOÁNG CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, học nghề, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn lực lượng lao động thuộc {{3}}:** Danh mục công việc nghiêm ngặt nêu thẳng khảo sát, thăm dò, khai thác, chế biến khoáng sản, cùng nổ mìn, máy xúc, xe tự đổ, nghiền sàng, băng tải, công trình ngầm. {{4}} chủ yếu là người làm việc gián tiếp.',
      '**Hai chế độ huấn luyện không thay thế nhau:** huấn luyện ATVSLĐ theo 6 nhóm là nghĩa vụ với mọi người lao động; huấn luyện kỹ thuật an toàn khai thác khoáng sản cho nhân sự quản lý, điều hành mỏ là chế độ riêng theo pháp luật khoáng sản.',
      '**Khai khoáng phải bố trí cán bộ ATVSLĐ và y tế ở mức cao:** từ 50 lao động trở lên cần người chuyên trách; mỏ nào cũng phải có người làm công tác y tế hoặc hợp đồng với cơ sở y tế (xem mục 1).',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} định kỳ hằng năm; người nghỉ hoặc mỏ tạm dừng từ 6 tháng trở lên phải huấn luyện lại. Chi phí do người sử dụng lao động chi trả.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('mỏ, nhà máy tuyển và doanh nghiệp khai khoáng'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ tịch HĐQT, tổng giám đốc; giám đốc điều hành mỏ, giám đốc mỏ, nhà máy tuyển, xí nghiệp; phó giám đốc; trưởng phòng (kỹ thuật, an toàn, cơ điện, thông gió, trắc địa, địa chất...); quản đốc, phó quản đốc phân xưởng.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu; tổ chức bộ máy ATVSLĐ, y tế ở mức yêu cầu cao; kế hoạch ATVSLĐ theo ca, mùa mưa bão; đánh giá rủi ro nổ mìn, sạt lở, xe và máy lớn, băng tải, hầm lò; quản lý nhà thầu; điều tra tai nạn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận ATVSLĐ, HSE; cán bộ ATVSLĐ chuyên trách, bán chuyên trách; cán bộ an toàn ở từng phân xưởng.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kiểm tra hiện trường mỏ, trạm nghiền sàng, băng tải, bãi thải; nhận diện, xếp hạng rủi ro; kế hoạch, nội quy, quy trình; huấn luyện tại chỗ; điều tra tai nạn; quản lý hồ sơ huấn luyện, thiết bị, quan trắc.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: thợ lò; công nhân khoan, bốc xúc, san gạt; thợ mìn; lái xe tự đổ, máy xúc, ủi, tàu điện; vận hành nghiền, sàng, tuyển, băng tải; tàu hút cát; thợ điện, cơ khí, hàn; nồi hơi, cầu trục; kho hóa chất, nhiên liệu.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, thử việc: văn phòng, nhân sự, kế toán, kế hoạch, điều độ; kỹ sư làm chủ yếu ở văn phòng; phòng thí nghiệm không dùng hóa chất nguy hiểm; thủ kho, giao nhận; bảo vệ, tạp vụ, lễ tân.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy khu mỏ; nguy cơ khi vào mỏ, bãi, nhà máy: xe chạy, vật liệu rơi, bụi, ồn, khu vực cấm và tín hiệu nổ mìn; PPE; thoát hiểm, báo cháy; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, y tá, điều dưỡng phòng y tế mỏ, nhà máy tuyển.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn (đè kẹp, rơi cao, đá văng, điện giật, bỏng, ngạt khí và bụi, say nắng, đuối nước); quản lý sức khỏe; bệnh nghề nghiệp; vận chuyển nạn nhân từ nơi khó tiếp cận.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng hoặc công nhân có uy tín ở từng tổ, ca, tầng, trạm, kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ (băng tải thiếu che chắn, người cắt ngang đường xe, làm trên cao không dây, thiếu PPE); nhắc nhở; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('mỏ'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – hay gặp khi mỏ tạm dừng sau mưa bão hoặc theo kế hoạch.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản đốc trực tiếp vận hành máy: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Huấn luyện kỹ thuật an toàn khai thác khoáng sản** (chế độ riêng của ngành mỏ) không thay thế huấn luyện ATVSLĐ theo nhóm, và ngược lại.',
    ],
    canBo: {
      tieuDe: 'Mỏ cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2) và y tế (Nhóm 5)?',
      dan: 'Khai khoáng thuộc nhóm ngành có yêu cầu cao về người làm công tác ATVSLĐ (khoản 1 Điều 36) và phải tổ chức bộ phận '
        + 'y tế (Điều 37 Nghị định 39/2016/NĐ-CP). Mức tối thiểu:',
      tieuDeCotNhan: 'Bố trí',
      rongCotNhan: 1750,
      cot: ['Dưới 50 lao động', 'Từ 50 đến dưới 300', 'Từ 300 đến dưới 500', 'Từ 500 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['ATVSLĐ',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '02 người **chuyên trách**', '02 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 03 **chuyên trách**'],
        ['Y tế',
          '01 người trung cấp y', '01 người trung cấp y', '01 bác sĩ hoặc y sĩ, 01 trung cấp y', '01 bác sĩ; mỗi ca 01 trung cấp y',
          'Thành lập cơ sở y tế'],
      ],
      ghiChu: 'Người phụ trách kỹ thuật an toàn mỏ theo pháp luật khoáng sản là chức danh riêng, không đồng nhất với người làm '
        + 'công tác ATVSLĐ. Không tự bố trí được y tế thì có thể hợp đồng với cơ sở khám bệnh, chữa bệnh. Chuyên viên xác nhận.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, mỏ, nhà máy tuyển, xí nghiệp, phòng ban, phân xưởng) hoặc phụ trách bộ phận sản xuất, kỹ thuật?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp khảo sát, khai thác, chế biến khoáng sản; khoan, nổ mìn; vận hành máy xúc, ủi, xe tự đổ, tàu điện, máy nghiền, sàng, băng tải, nồi hơi, cầu trục; làm trong hầm lò, không gian hạn chế, trên cao, trên mặt nước; hóa chất, xăng dầu; điện; hàn; bốc xếp từ 30 kg?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ SẢN XUẤT'],
      ['Chủ tịch HĐQT, tổng giám đốc, giám đốc công ty', '1', 'Chủ tịch không điều hành: chuyên viên xác nhận.'],
      ['Phó giám đốc (sản xuất, kỹ thuật, an toàn, cơ điện...); trưởng phòng, phó phòng', '1', 'Cấp phó phụ trách ATVSLĐ phải huấn luyện.'],
      ['Giám đốc điều hành mỏ, giám đốc mỏ, nhà máy tuyển, xí nghiệp', '1', 'Còn có huấn luyện chuyên ngành mỏ riêng.'],
      ['Người phụ trách kỹ thuật an toàn mỏ', '1 hoặc 2', 'Chức danh chuyên ngành; chuyên viên xác nhận.'],
      ['Quản đốc, phó quản đốc (khai thác, đào lò, vận tải, cơ điện, tuyển)', '1', 'Còn có huấn luyện chuyên ngành mỏ riêng.'],
      ['Trưởng ca, trưởng kíp, giám sát sản xuất', '1 hoặc 3', 'Chỉ huy một bộ phận: Nhóm 1; ranh giới.'],
      ['Tổ trưởng, đội trưởng, chỉ huy gương', '3', 'Nên chọn làm an toàn, vệ sinh viên (Nhóm 6).'],
      ['B. KỸ THUẬT, VĂN PHÒNG, AN TOÀN, Y TẾ'],
      ['Kỹ sư mỏ, khai thác, xây dựng mỏ', '4 hoặc 3', 'Thường xuyên ở gương, hầm lò, tầng: Nhóm 3.'],
      ['Địa chất, trắc địa, khảo sát hiện trường, khoan thăm dò', '3', 'Làm văn phòng: chuyên viên xem xét.'],
      ['Nhân viên thông gió, đo khí mỏ (hầm lò)', '3', 'Đo khí mỏ: quy định chuyên ngành riêng.'],
      ['Phòng thí nghiệm; R&D, môi trường, quản lý chất lượng', '4', 'Dùng hóa chất nguy hiểm: xem xét Nhóm 3.'],
      ['Văn phòng: nhân sự, kế toán, kế hoạch, điều độ, mua hàng, IT, giao nhận', '4', 'Đi hiện trường thường xuyên: xem xét thêm.'],
      ['Bảo vệ, tạp vụ, lễ tân; nhân viên bếp ăn tập thể', '4 hoặc 3', 'Bếp ăn từ 300 suất/ngày trở lên: Nhóm 3.'],
      ['Trưởng bộ phận ATVSLĐ, HSE; cán bộ ATVSLĐ, cán bộ an toàn phân xưởng', '2', 'Trưởng phòng: học thêm Nhóm 1.'],
      ['Bác sĩ, y sĩ, y tá, điều dưỡng phòng y tế mỏ', '5', 'Mỏ bắt buộc tổ chức y tế.'],
      ['An toàn, vệ sinh viên (mỗi tổ, ca, tầng, trạm)', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['Đội sơ cấp cứu, ứng cứu khẩn cấp kiêm nhiệm; đội cứu hộ mỏ', 'Theo công việc', 'Ứng cứu, cứu hộ mỏ: chế độ riêng.'],
      ['C. KHAI THÁC HẦM LÒ, LỘ THIÊN, NỔ MÌN'],
      ['Thợ khai thác, đào lò, chống lò; vận tải lò, thông gió, thoát nước trong lò', '3', 'Còn có huấn luyện chuyên ngành hầm lò.'],
      ['Công nhân khoan, bốc xúc, san gạt, bơm thoát nước, làm đường mỏ', '3', 'Khai thác khoáng sản, máy xúc, ủi.'],
      ['Công nhân bãi thải, bãi chứa khoáng sản', '3 hoặc 4', 'Ranh giới: chuyên viên xác nhận.'],
      ['Chỉ huy nổ mìn, thợ mìn, thợ nạp mìn; vận chuyển thuốc nổ', '3', 'Quy định vật liệu nổ riêng.'],
      ['Thủ kho vật liệu nổ; bảo vệ kho mìn, cảnh giới khu nổ mìn', '3 hoặc 4', 'Chuyên viên xác nhận theo công việc.'],
      ['D. VẬN TẢI, THIẾT BỊ, CƠ ĐIỆN'],
      ['Lái xe tự đổ trên 5 tấn; vận hành máy xúc, đào, ủi, gạt, lu', '3', 'Bằng lái xe không thay thế huấn luyện Nhóm 3.'],
      ['Lái xe tải, đầu kéo, xe đưa đón; tàu điện vận tải mỏ; xe nâng', '3', 'Lái xe thuê ngoài thuộc nhà thầu.'],
      ['Thợ điện mỏ, trạm biến áp, cáp điện', '3', 'Thêm huấn luyện an toàn điện.'],
      ['Thợ cơ khí sửa máy khoan, băng tải, nghiền, xe mỏ; thợ hàn; trên cao', '3', 'Hàn, máy, trên cao thuộc Danh mục.'],
      ['Vận hành nồi hơi, bình áp lực, máy nén khí, cần trục, cầu trục, tời', '3', 'Thiết bị phải kiểm định.'],
      ['Vận hành trạm bơm thoát nước, quạt gió chính, trạm khí nén', '3', 'Chuyên viên xác nhận theo thiết bị.'],
      ['E. TUYỂN, NGHIỀN SÀNG, CÁT, KHO, HÓA CHẤT'],
      ['Vận hành máy nghiền, sàng, tuyển nổi, ép lọc, băng tải; cấp liệu, lấy mẫu', '3', 'Chế biến khoáng sản, máy thuộc Danh mục.'],
      ['Pha chế, sử dụng hóa chất tuyển; kho hóa chất, nhiên liệu, bơm xăng dầu', '3', 'Thêm huấn luyện an toàn hóa chất.'],
      ['Vệ sinh băng tải, thu gom rơi vãi; vệ sinh công nghiệp, quét bụi', '3 hoặc 4', 'Ranh giới: chuyên viên xác nhận.'],
      ['Vệ sinh bể, hầm, bunke, giếng, hố thu; xử lý nước thải mỏ', '3', 'Không gian hạn chế.'],
      ['Thuyền trưởng, thủy thủ tàu hút cát, sà lan; công nhân bến bãi', '3', 'Trên mặt nước; quy định đường thủy riêng.'],
      ['Thủ kho vật tư, thành phẩm; nhân viên cân xe; bốc xếp thủ công', '4 hoặc 3', 'Bốc xếp thường xuyên từ 30 kg: Nhóm 3.'],
      ['F. THỜI VỤ, NHÀ THẦU, KHÁCH'],
      ['Lao động thời vụ, theo mùa; học nghề, thử việc', 'Theo công việc', 'Làm tại mỏ, nhà máy tuyển thường là Nhóm 3.'],
      ['Lao động thuê lại; nhà thầu khoan nổ, đào lò, bốc xúc, vận tải, bảo trì', 'Theo công việc', 'Trách nhiệm huấn luyện theo hợp đồng.'],
      ['Khách, đoàn kiểm tra, tài xế bên ngoài vào khu mỏ', '—', 'Không thuộc 6 nhóm; phổ biến nội quy.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu và chỉ tính huấn luyện ATVSLĐ theo 6 nhóm (không tính huấn luyện chuyên ngành mỏ). '
      + 'Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế của từng người.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG KHAI KHOÁNG: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao phần lớn lao động mỏ thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông tư '
      + '06/2020/TT-BLĐTBXH) nêu thẳng khảo sát, thăm dò, khai thác, chế biến khoáng sản; nổ mìn; máy xúc, ủi, xe tự đổ trên '
      + '5 tấn, trạm nghiền sàng; máy nghiền, băng tải; công trình ngầm, không gian hạn chế; điện; lái xe, tàu điện. Nhóm 4 '
      + 'chủ yếu là người làm việc gián tiếp.',
    dan: 'Viện STP – DAKO bổ sung nội dung ATVSLĐ theo công việc tại mỏ, nhà máy tuyển. Phần kỹ thuật chuyên ngành mỏ (thông '
      + 'gió, khí mỏ, chống lò, kỹ thuật nổ mìn) thuộc chế độ huấn luyện riêng:',
    nghe: [
      ['Khai thác lộ thiên', 'Khoan, bốc xúc, san gạt',
        'Sạt lở bờ tầng, rơi đá, mép tầng; điểm mù, vùng nguy hiểm quanh máy xúc, xe tự đổ, không ngủ trong gầm xe; tín hiệu, khu cấm khi nổ mìn; bơm thoát nước; mưa bão, sét.'],
      ['Thợ lò', 'Đào lò, chống lò, vận tải lò',
        'Nguy cơ chung trong công trình ngầm: không gian hạn chế, điện, ồn, bụi, nhiệt, ẩm; PPE, khẩu trang lọc bụi; an toàn quanh băng tải, tời trục, tàu điện; sơ cứu, báo sự cố.'],
      ['Khoan nổ mìn', 'Thợ mìn, kho, vận chuyển',
        'Nguy cơ chung khi làm việc với thuốc nổ ở mức ATVSLĐ: PPE, nội quy khu vực, tĩnh điện, nhiệt, tín hiệu; phối hợp với chỉ huy nổ mìn, tổ cảnh giới; sơ cứu, báo sự cố.'],
      ['Xe, máy mỏ', 'Xe tự đổ, máy xúc, tàu điện',
        'Chống lật, lùi xe, xúc đổ trên đường dốc, bờ tầng, bãi thải; không đứng trong tầm quay; tín hiệu, nhường đường; tàu điện: tín hiệu, tốc độ; xe nâng: tải trọng, tầm nhìn.'],
      ['Tuyển, nghiền sàng', 'Nghiền, sàng, tuyển, băng tải',
        'Che chắn, nút dừng, dây giật khẩn cấp dọc băng tải; khóa nguồn khi tháo kẹt, thay lưới sàng; bụi, ồn; hóa chất tuyển, axit, kiềm: pha chế, không trộn lẫn; bể lắng, bunke.'],
      ['Cát, mặt nước', 'Tàu hút cát, sà lan, bến',
        'Đuối nước, áo phao; làm việc ban đêm, mưa bão; rò điện xuống nước; máy hút, bơm, tời: cuốn kẹp, cáp bắn; neo đậu, lên xuống tàu; sơ cứu đuối nước, điện giật.'],
      ['Cơ điện, thiết bị', 'Điện mỏ, sửa chữa, nồi hơi',
        'Điện áp cao ở trạm, động cơ lớn; khóa nguồn, gắn thẻ; hàn cắt gần nhiên liệu, bụi than; kê chắn khi sửa xe; nồi hơi, cầu trục, tời: áp suất, van an toàn, tải trọng, tín hiệu.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy loại hình mỏ, quy mô và thiết bị, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên Viện STP – DAKO sẽ '
      + 'xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu mỗi ca, khu vực: đè kẹp, rơi cao, bỏng, ngạt, điện giật, đuối nước.'],
      ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện mỏ, trạm điện, động cơ lớn, băng tải, bơm thoát nước.'],
      ['Huấn luyện an toàn hóa chất', 'Hóa chất tuyển khoáng, axit, kiềm, thuốc tuyển nổi, nhiên liệu, xử lý nước thải.'],
      ['Kiểm định kỹ thuật an toàn', 'Nồi hơi, bình áp lực, máy nén khí, cần trục, cầu trục, tời, xe nâng, chai khí.'],
      ['Quan trắc môi trường lao động', 'Bụi than, bụi silic, ồn, nóng ở mỏ, khu nghiền sàng, băng tải, nhà máy tuyển.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Kế hoạch ATVSLĐ hằng năm; xe tự đổ, máy xúc, băng tải, trên cao, không gian hạn chế.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Cân xe, cân băng tải, thiết bị đo nhiệt độ, điện, thiết bị phòng thí nghiệm.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Đối tác, nhà đầu tư yêu cầu minh chứng; nghề vận hành, thợ điện, hàn, cơ khí.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Đã huấn luyện kỹ thuật an toàn khai thác khoáng sản, còn cần huấn luyện theo 6 nhóm?',
      'Đây là hai chế độ khác nhau: huấn luyện kỹ thuật an toàn theo pháp luật khoáng sản dành cho nhân sự quản lý, điều hành mỏ; huấn luyện ATVSLĐ theo Nghị định 44/2016/NĐ-CP là nghĩa vụ với mọi người lao động. Chưa có cơ sở để coi chế độ này thay thế chế độ kia; chuyên viên rà soát theo hồ sơ của mỏ.'],
    ['Viện STP – DAKO có cấp chứng nhận kỹ thuật an toàn mỏ, huấn luyện nổ mìn không?',
      'Không. Huấn luyện kỹ thuật an toàn khai thác khoáng sản (mỏ lộ thiên tự tổ chức, mỏ hầm lò do cơ quan nhà nước cấp chứng nhận), huấn luyện vật liệu nổ, đo khí mỏ, cứu hộ mỏ thuộc quy định chuyên ngành riêng. Viện huấn luyện ATVSLĐ 6 nhóm và các dịch vụ đi kèm.'],
    ['Tổ trưởng, chỉ huy gương, trưởng ca thuộc nhóm nào?',
      'Tổ trưởng, đội trưởng, chỉ huy gương trực tiếp làm công việc thuộc Danh mục nên thuộc Nhóm 3, nên thêm Nhóm 6. Trưởng ca, trưởng kíp chỉ huy một bộ phận sản xuất thuộc Nhóm 1; đây là trường hợp ranh giới, chuyên viên xác nhận theo quyền hạn thực tế.'],
    ['Lái xe tự đổ có bằng hạng cao, thợ điện có chứng chỉ điện mỏ: còn phải học Nhóm 3?',
      'Có. Bằng lái, bằng nghề, chứng chỉ chuyên ngành và huấn luyện ATVSLĐ là các yêu cầu khác nhau. Xe tự đổ trên 5 tấn, công việc điện thuộc Danh mục nên cần Nhóm 3; thợ điện nên học thêm an toàn điện.'],
    ['Mỏ thuê nhà thầu khoan nổ, bốc xúc, vận tải: ai huấn luyện?',
      'Thường do hợp đồng quy định: nhà thầu là người sử dụng lao động của người mình. Doanh nghiệp nên yêu cầu nhà thầu cung cấp minh chứng huấn luyện trước khi vào mỏ; Viện có thể huấn luyện cho chính nhà thầu. Lao động thuê lại: chuyên viên xác nhận.'],
    ['Thiết bị trong mỏ có phải kiểm định không?',
      'Nồi hơi, bình áp lực, máy nén khí, cần trục, cầu trục, tời, xe nâng, chai khí thuộc danh mục thiết bị nghiêm ngặt, thường phải kiểm định tùy thông số; Viện có dịch vụ kiểm định. Thiết bị chuyên dùng trong hầm lò có thủ tục, quy chuẩn riêng của ngành mỏ; chuyên viên xác nhận.'],
    ['Mỏ chạy ba ca, mùa mưa lại nghỉ: tổ chức huấn luyện thế nào?',
      'Huấn luyện tại mỏ, chia đợt, lớp nhỏ, luân phiên theo ca; có thể tận dụng thời gian nghỉ mưa bão. Quản đốc, trưởng ca nên học trước. Lao động nghỉ từ 6 tháng trở lên quay lại phải huấn luyện lại; lịch cụ thể do chuyên viên đề xuất.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm, không thừa; có thể chia đợt, ưu tiên Nhóm 1, 2, 5 và thợ lò, thợ mìn, lái xe, máy xúc, vận hành băng tải, nghiền sàng trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo ca, tầng, thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, theo mùa mưa bão.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Chủ đầu tư, đối tác, đoàn kiểm tra'),
      ['Huấn luyện tại mỏ',
        'Chia đợt, lớp nhỏ theo ca, tầng, trạm; tận dụng thời gian dừng do mưa bão; thực hành tại chỗ trên thiết bị và công việc thực tế của mỏ.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 36, 37)', 'Khai khoáng thuộc nhóm có yêu cầu cao về bố trí người làm công tác ATVSLĐ (khoản 1 Điều 36) và phải tổ chức bộ phận y tế (Điều 37).'],
      DANH_MUC,
      ['Luật Địa chất và Khoáng sản số 54/2024/QH15; Nghị định 193/2025/NĐ-CP; Thông tư 43/2025/TT-BCT', 'Kỹ thuật an toàn trong khai thác khoáng sản; huấn luyện kỹ thuật an toàn cho nhân sự quản lý, điều hành mỏ: chế độ riêng, Viện không cung cấp.'],
      ['Luật Hóa chất 2025 (hiệu lực từ 01/01/2026)', 'Quản lý, an toàn hóa chất trong tuyển khoáng; chuyên viên xác nhận căn cứ hiện hành khi huấn luyện an toàn hóa chất.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('16/10/2026',
      'đã được Chính phủ thông qua (Nghị quyết 275/NQ-CP ngày 17/9/2026), Ủy ban Thường vụ Quốc hội đã cho ý kiến ngày '
      + '23/9/2026; dự án chưa có hiệu lực'),
  },
};
