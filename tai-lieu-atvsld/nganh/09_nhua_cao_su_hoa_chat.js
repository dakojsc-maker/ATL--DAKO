// Nội dung tài liệu số 09 – Ngành Nhựa – Cao su – Hóa chất.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành Nhựa – Cao su – Hóa chất" (bản cho nhân viên kinh doanh, thông tin pháp lý đến
// 17/10/2026). Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem
// nganh/01_xay_dung.js. Mục 1: sản xuất hóa chất áp dụng khoản 1 Điều 36 Nghị định 39/2016/NĐ-CP, gia công nhựa, cao su
// không được nêu trực tiếp nên thường áp dụng khoản 2; bảng bố trí dùng dạng hai dòng như tài liệu 03, 04.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '09',
  tenFile: '09_NhuaCaoSuHoaChat_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Nhựa – Cao su – Hóa chất (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp nhựa – cao su – hóa chất – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Nhựa – Cao su – Hóa chất',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH NHỰA – CAO SU – HÓA CHẤT',
    gioiThieu: 'Nhà máy nhựa, cao su, hóa chất có nhiều công việc thuộc danh mục nghiêm ngặt, nhiều thiết bị phải kiểm định, và '
      + 'nguy cơ cháy nổ, rò rỉ có thể ảnh hưởng cả khu vực xung quanh. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh sáu nhóm '
      + 'huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn '
      + 'thông tin cho buổi làm việc với chuyên viên Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP NHỰA – CAO SU – HÓA CHẤT CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động mùa vụ, học nghề, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn công nhân sản xuất thuộc {{3}}:** dùng, pha chế, bảo quản hóa chất nguy hiểm; chế biến mủ cao su; sản xuất, chế biến nhựa, vận hành máy ép, cán, nghiền; nồi hơi, nồi lưu hóa, bình áp lực; không gian hạn chế; xe nâng. Văn phòng, bảo vệ, tạp vụ thuộc {{4}}.',
      '**Hai yêu cầu chạy song song:** huấn luyện ATVSLĐ theo 6 nhóm, và huấn luyện an toàn chuyên ngành hóa chất theo Luật Hóa chất 2025 (hiệu lực từ 01/01/2026). Học Nhóm 3 không tự động thay thế yêu cầu về hóa chất.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; lao động mùa vụ chế biến mủ nghỉ từ 6 tháng trở lên phải huấn luyện lại.',
      '**Hồ sơ huấn luyện luôn được kiểm tra:** khi thanh tra, khi xảy ra sự cố và khi khách hàng lớn đánh giá nhà cung cấp. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('doanh nghiệp nhựa – cao su – hóa chất'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý, chỉ huy: giám đốc, phó giám đốc được giao phụ trách; giám đốc nhà máy, chi nhánh, nông trường chế biến; trưởng phòng ban; quản đốc, trưởng dây chuyền, trưởng ca.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu khi xảy ra tai nạn, sự cố; tổ chức bộ máy ATVSLĐ; kế hoạch hằng năm; đánh giá rủi ro cháy nổ, rò rỉ hóa chất, thiết bị áp lực, không gian hạn chế; văn hóa an toàn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận HSE, cán bộ ATVSLĐ chuyên trách hoặc bán chuyên trách (thường là kỹ sư, quản đốc kiêm nhiệm).',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kỹ thuật an toàn hóa chất, cháy nổ, thiết bị áp lực, điện, máy ép, cán, không gian hạn chế; đánh giá rủi ro, cấp phép làm việc nguy hiểm; kiểm soát nhà thầu; điều tra sự cố.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: pha chế, san chiết, bồn bể hóa chất; vận hành máy ép phun, thổi, đùn, nghiền; chế biến mủ, trộn luyện, lưu hóa cao su; nồi hơi, lò, hệ thống lạnh; điện, hàn; xe nâng; xử lý nước thải.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, thử việc: văn phòng, kế toán, nhân sự, kinh doanh, mua hàng; kế hoạch, thiết kế khuôn; thủ kho thông thường; bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy khi vào xưởng, kho (lối đi, PPE, biển cảnh báo, khu cấm); nhận biết nhãn cảnh báo hóa chất; xử lý khi nghe còi báo, phát hiện mùi lạ, rò rỉ; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, y tá phụ trách trạm y tế nhà máy.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cứu bỏng hóa chất, bỏng nhiệt, hít khí độc, hóa chất bắn vào mắt; cấp cứu tai nạn lao động; quản lý sức khỏe người lao động, bệnh nghề nghiệp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng, thợ chính được chọn ở từng xưởng, ca (kiêm nhiệm).',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ, phát hiện sớm rò rỉ, thiết bị bất thường; nhắc nhở; báo cáo, kiến nghị; phối hợp khi có sự cố.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('nhà máy'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – hay gặp với lao động mùa vụ chế biến mủ cao su.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản đốc trực tiếp điều hành công đoạn hóa chất: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Đổi công thức, nguyên liệu, máy mới** hoặc chuyển sang công việc khác thì cần đánh giá lại rủi ro và huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Điều 36 Nghị định 39/2016/NĐ-CP xếp sản xuất hóa chất vào nhóm có yêu cầu cao hơn (khoản 1); gia công sản phẩm '
        + 'nhựa, cao su không được nêu trực tiếp nên thường áp dụng khoản 2. Mức tối thiểu:',
      cot: ['Dưới 50 lao động', 'Từ 50 đến dưới 300', 'Từ 300 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['Sản xuất hóa chất (khoản 1)',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '02 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 03 người **chuyên trách**'],
        ['Nhựa, cao su và lĩnh vực khác (khoản 2)',
          '01 người **bán chuyên trách**', '01 người **bán chuyên trách**', '01 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 02 người **chuyên trách**'],
      ],
      ghiChu: 'Vừa sản xuất hóa chất vừa gia công nhựa, cao su: chuyên viên Viện STP – DAKO xác định mức theo ngành nghề đăng '
        + 'ký. Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, nhà máy, phòng ban, xưởng, kho, ca) hoặc phụ trách bộ phận sản xuất, kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp dùng, pha chế, bảo quản, vận chuyển hóa chất nguy hiểm; chế biến mủ cao su; sản xuất, chế biến nhựa; vận hành máy ép, cán, nghiền, thiết bị áp lực, lò; vào không gian hạn chế; hàn cắt; điện; xe nâng; bốc xếp từ 30 kg; lái xe?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ doanh nghiệp, Tổng giám đốc, Giám đốc, phó giám đốc; giám đốc nhà máy, chi nhánh, nông trường', '1', 'Cấp phó: khi được giao phụ trách.'],
      ['Trưởng phòng: sản xuất, kỹ thuật – công nghệ, kế hoạch, cơ điện, chất lượng, nhân sự, kinh doanh', '1', 'Phó phòng: Nhóm 1 nếu được giao phụ trách.'],
      ['B. ĐIỀU HÀNH SẢN XUẤT'],
      ['Quản đốc, phó quản đốc phân xưởng; trưởng dây chuyền', '1', 'Nên thêm Nhóm 3 khi điều hành công đoạn hóa chất, áp lực.'],
      ['Trưởng ca, giám sát ca', '1 + 3', 'Điều hành ca, xử lý tình huống tại hiện trường.'],
      ['Tổ trưởng sản xuất, thợ chính phụ trách máy hoặc tổ', '3', 'Nên chọn làm an toàn, vệ sinh viên (thêm Nhóm 6).'],
      ['C. KỸ THUẬT, CHẤT LƯỢNG, THÍ NGHIỆM'],
      ['Kỹ sư công nghệ, quy trình, sản xuất; kỹ sư cơ điện, thiết bị, dự án', '3', 'Chủ yếu làm văn phòng: xem xét Nhóm 4.'],
      ['QA/QC, KCS, lấy mẫu trong xưởng, kho; phòng thí nghiệm, R&D', '3 hoặc 4', 'Thường xuyên dùng hóa chất nguy hiểm: Nhóm 3.'],
      ['Kế hoạch, điều độ, kỹ thuật văn phòng, thiết kế khuôn', '4', 'Xuống xưởng: phổ biến nội quy, cấp PPE.'],
      ['D. AN TOÀN, MÔI TRƯỜNG, Y TẾ'],
      ['Trưởng bộ phận HSE, trưởng phòng ATVSLĐ', '1 + 2', 'Đứng đầu bộ phận, làm công tác ATVSLĐ.'],
      ['Cán bộ ATVSLĐ chuyên trách, bán chuyên trách, HSE, giám sát an toàn', '2', 'Số người tối thiểu: xem mục 1.'],
      ['Người phụ trách chuyên môn về an toàn hóa chất', 'Theo công việc', 'Yêu cầu riêng của luật hóa chất; chuyên viên xác nhận.'],
      ['Cán bộ môi trường, xử lý chất thải (văn phòng)', '4', 'Xuống bể, hầm, xử lý chất thải nguy hại: Nhóm 3.'],
      ['Nhân viên y tế, y tá, phụ trách trạm y tế', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên ở từng xưởng, ca', '6', 'Học thêm, ngoài nhóm của công việc chính.'],
      ['E. VĂN PHÒNG, KHO, HỖ TRỢ'],
      ['Kế toán, hành chính, nhân sự, IT, kinh doanh, mua hàng; bảo vệ, tạp vụ', '4', 'Bảo vệ: thêm nhận biết sự cố hóa chất, sơ tán.'],
      ['Nhân viên bếp ăn tập thể', '4 hoặc 3', 'Nhóm 3 nếu bếp từ 300 suất/ngày trở lên.'],
      ['Thủ kho nguyên liệu, thành phẩm thông thường', '4', 'Nhóm 3 nếu bốc xếp từ 30 kg, lái xe nâng.'],
      ['Thủ kho, nhân viên kho hóa chất, xuất nhập, san chiết hóa chất', '3', 'Thêm huấn luyện an toàn hóa chất.'],
      ['F. SẢN XUẤT HÓA CHẤT'],
      ['Vận hành phản ứng, phối liệu, nghiền, sấy; pha sơn, mực, keo; san chiết', '3', 'Trực tiếp sản xuất, sử dụng hóa chất nguy hiểm.'],
      ['Vận hành bồn bể, đường ống, bơm chuyển, trạm xuất nhập hóa chất', '3', 'Vào bồn: thêm không gian hạn chế.'],
      ['Đóng gói, dán nhãn thành phẩm hóa chất', '3 hoặc 4', 'Ranh giới: chuyên viên xác nhận.'],
      ['G. SẢN XUẤT NHỰA VÀ CAO SU'],
      ['Vận hành máy ép phun, thổi, đùn, cán màng, in bao bì nhựa', '3', 'Sản xuất, chế biến nhựa; máy ép, cán.'],
      ['Nghiền, rửa, tạo hạt, phối trộn nhựa, cấp liệu; thợ khuôn, chỉnh máy', '3', 'Máy nghiền, băng tải; nhiệt, nâng hạ.'],
      ['Sơ chế mủ (đánh đông, cán, băm, sấy, ép kiện); trộn luyện, cán, lưu hóa cao su', '3', 'Hóa chất đánh đông; máy cán, trộn kín, áp lực.'],
      ['Cắt ba via, kiểm hàng, đóng gói sản phẩm nhựa, lốp, găng', '3 hoặc 4', 'Không tiếp xúc máy, quá trình chế biến: Nhóm 4.'],
      ['H. THIẾT BỊ, CƠ ĐIỆN, VẬN CHUYỂN, MÔI TRƯỜNG'],
      ['Nồi hơi, lò dầu tải nhiệt, nồi lưu hóa, bình áp lực, máy nén khí, hệ thống lạnh', '3', 'Hệ thống lạnh amoniac: thêm nguy cơ hóa chất.'],
      ['Thợ điện, cơ điện; thợ hàn, cắt, cơ khí bảo trì, sửa chữa máy', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Xe nâng, cầu trục, palăng, buộc tải; bốc xếp bao, phuy hóa chất', '3', 'Bao dưới 30 kg: chuyên viên xác nhận.'],
      ['Lái xe tải, xe bồn, xe đầu kéo, xe con của công ty', '3', 'Chở hóa chất: thêm yêu cầu chuyên ngành.'],
      ['Xử lý nước thải, khí thải, vệ sinh bể; vệ sinh công nghiệp, vệ sinh bồn', '3', 'Không gian hạn chế, khí độc.'],
      ['Thu gom chất thải nguy hại, bao bì dính hóa chất', '3 hoặc 4', 'Ranh giới: chuyên viên xác nhận.'],
      ['I. THỜI VỤ, NHÀ THẦU, KHÁCH'],
      ['Lao động thời vụ, mùa vụ; học việc, tập nghề, thử việc', '3 hoặc 4', 'Theo công việc; huấn luyện trước khi giao việc.'],
      ['Nhà thầu bảo trì, xây dựng, thợ thuê ngoài trong nhà máy', 'Theo công việc', 'Nhà thầu huấn luyện; nhà máy kiểm tra hồ sơ.'],
      ['Khách, đối tác, đoàn kiểm tra vào nhà máy', '—', 'Không thuộc 6 nhóm; nội quy, sơ tán, cấp PPE.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới giữa Nhóm 3 và Nhóm 4.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG NHỰA – CAO SU – HÓA CHẤT: HỌC GÌ THEO NGHỀ',
    viSao: '**Vì sao phần lớn công nhân sản xuất thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông '
      + 'tư 06/2020/TT-BLĐTBXH) nêu rõ việc sản xuất, sử dụng, bảo quản hóa chất nguy hiểm; chế biến mủ cao su; sản xuất, chế '
      + 'biến nhựa; vận hành máy ép, cán, nghiền; thiết bị áp lực; không gian hạn chế, xử lý nước thải. Văn phòng, bảo vệ, tạp '
      + 'vụ thuộc Nhóm 4.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại nhà máy:',
    nghe: [
      ['Hóa chất, pha chế', 'San chiết, bồn bể',
        'Tính chất nguy hiểm (cháy nổ, ăn mòn, độc); nhãn, bảng dữ liệu an toàn; phối liệu, bơm chuyển, lấy mẫu; tĩnh điện, nguồn lửa, thông gió; PPE, vòi rửa mắt; xử lý đổ vãi, rò rỉ.'],
      ['Sản xuất nhựa', 'Ép, thổi, đùn, nghiền',
        'Kẹp, ép, cuốn: che chắn, cửa an toàn, dừng khẩn cấp; khóa và gắn thẻ khi thay khuôn, xử lý kẹt; bỏng nhựa nóng chảy, khuôn; bụi, hơi; máy nghiền, băng tải.'],
      ['Chế biến cao su', 'Mủ, trộn, lưu hóa',
        'Amoniac, axit đánh đông mủ: PPE, đổ vãi, hít phải, bắn vào mắt; máy cán, băm, trộn kín: cuốn kẹp; lò sấy, nồi lưu hóa: nhiệt, hơi, xả áp; bụi, mùi.'],
      ['Áp lực, lò, lạnh', 'Nồi hơi, lò dầu, chiller',
        'Nổ do quá áp, thiếu nước, quá nhiệt; áp kế, van an toàn, mực nước; xả đáy; rò rỉ amoniac: báo động, sơ tán, sơ cứu; chai khí; hồ sơ kiểm định.'],
      ['Cơ điện, hàn cắt', 'Điện, cơ khí, bảo trì',
        'Cắt điện, treo biển, kiểm tra không điện; khóa năng lượng khi bảo trì máy ép, cán, bơm; hàn cắt ở khu có hơi dung môi, bụi nhựa cần quy trình riêng; cô lập đường ống hóa chất.'],
      ['Kho, xe nâng', 'Kho hóa chất, bốc xếp',
        'Nhãn, biểu tượng nguy hiểm, sắp xếp hóa chất tương kỵ; xe nâng: tải trọng, tầm nhìn, người đi bộ, phuy, pallet hóa chất; bốc xếp đúng tư thế; xử lý đổ vãi.'],
      ['Nước thải, vệ sinh bồn', 'Bể, bồn, hố ga',
        'Thiếu oxy, khí độc, khí cháy; cô lập nguồn, đo khí, thông gió, cấp phép vào, giám sát bên ngoài; mặt nạ, dây cứu hộ; người cứu không vào khi chưa có thiết bị.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy hóa chất, máy móc, thiết bị tại nhà máy, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn hóa chất', 'Theo Luật Hóa chất 2025; đối tượng, nội dung, thời lượng: chuyên viên xác nhận.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu cơ sở: bỏng hóa chất, bỏng nhiệt, hít khí độc.'],
      ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện; điện, tĩnh điện ở khu có hơi dung môi, bụi dễ cháy.'],
      ['Kiểm định kỹ thuật an toàn', 'Nồi hơi, bình áp lực, nồi lưu hóa, hệ thống lạnh, chai khí, xe nâng.'],
      ['Quan trắc môi trường lao động', 'Hơi dung môi, bụi nhựa, bụi cao su, hóa chất, ồn, nhiệt, khí độc.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Cháy nổ, rò rỉ, không gian hạn chế; cơ sở cho biện pháp ứng phó sự cố.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Áp kế, nhiệt kế, cân định lượng hóa chất, thiết bị đo khí cầm tay.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Khi khách hàng lớn đánh giá nhà cung cấp; đào tạo vận hành máy ép, thiết bị.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Công nhân đã học Nhóm 3, còn phải học an toàn hóa chất riêng không?',
      'Nhóm 3 có phần hóa chất, nhưng Luật Hóa chất 2025 còn yêu cầu huấn luyện an toàn chuyên ngành hóa chất cho người lao động liên quan. Hóa chất của nhà máy có thuộc diện không, cách ghép hai nội dung và thời lượng: chuyên viên xác nhận theo văn bản.'],
    ['Chứng nhận huấn luyện hóa chất theo quy định cũ còn dùng được không?',
      'Nghị định 113/2017/NĐ-CP đã hết hiệu lực từ 17/01/2026. Giá trị của chứng nhận đã cấp tùy từng trường hợp; chuyên viên Viện STP – DAKO tra cứu nhóm, hạn và hướng dẫn phần cần bổ sung.'],
    ['Công nhân đứng máy ép phun chỉ bấm nút, lấy sản phẩm có phải Nhóm 3?',
      'Danh mục có nhóm sản xuất, chế biến nhựa và vận hành máy ép, cán, nên công nhân đứng máy thường là Nhóm 3. Người cắt ba via, kiểm hàng, đóng gói không tiếp xúc máy có thể là Nhóm 4; chuyên viên xác nhận theo công việc thực tế.'],
    ['Công nhân sơ chế mủ tiếp xúc amoniac, axit thuộc nhóm nào?',
      'Chế biến mủ cao su và dùng, bảo quản hóa chất nguy hiểm đều thuộc Danh mục nên là Nhóm 3. Ngoài ra có thể thuộc diện huấn luyện an toàn chuyên ngành hóa chất; chuyên viên xác nhận theo hóa chất, nơi dùng và số người tiếp xúc.'],
    ['Bốc xếp bao nguyên liệu 25 kg có phải Nhóm 3?',
      'Danh mục nêu bốc xếp thủ công thường xuyên từ 30 kg trở lên. Bao 25 kg dưới ngưỡng, nhưng nếu bốc xếp hóa chất nguy hiểm hoặc lái xe nâng thì vẫn có thể là Nhóm 3; chuyên viên xác nhận.'],
    ['Vào vụ mủ, đơn hàng cao điểm tuyển nhiều thời vụ: huấn luyện thế nào?',
      'Người lao động thời vụ phải được huấn luyện trước khi làm việc. Viện STP – DAKO huấn luyện theo đợt tại nhà máy, lập kế hoạch trước mùa vụ, chia lớp theo ca; người nghỉ từ 6 tháng trở lên quay lại phải huấn luyện lại.'],
    ['Nhà thầu bảo trì, hàn thuê ngoài, vệ sinh bồn: ai huấn luyện?',
      'Đơn vị sử dụng lao động của nhà thầu chịu trách nhiệm huấn luyện; nhà máy kiểm tra hồ sơ và phổ biến nguy cơ khu vực (hóa chất, cháy nổ, không gian hạn chế), quy trình cấp phép làm việc. Chứng nhận do Viện STP – DAKO cấp tra cứu được trực tuyến.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm theo công đoạn, không thừa; có thể chia đợt, ưu tiên Nhóm 1, 2 và công đoạn hóa chất, thiết bị áp lực trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, hóa chất, máy, thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, theo mùa vụ.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Khách hàng, đoàn đánh giá, cơ quan kiểm tra'),
      ['Huấn luyện tại nhà máy',
        'Chia lớp theo ca để không dừng sản xuất; thực hành tại chỗ trên quy trình, máy của doanh nghiệp (không dùng hóa chất nguy hiểm thật để thực hành).'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 36)', 'Bố trí người làm công tác ATVSLĐ theo quy mô; sản xuất hóa chất áp dụng mức cao hơn (khoản 1).'],
      DANH_MUC,
      ['Luật Hóa chất số 69/2025/QH15; Nghị định 25/2026/NĐ-CP, 26/2026/NĐ-CP', 'Luật Hóa chất 2025 có hiệu lực từ 01/01/2026; an toàn hóa chất, huấn luyện an toàn chuyên ngành hóa chất. Nghị định 113/2017/NĐ-CP đã hết hiệu lực.'],
      ['Thông tư 19/2016/TT-BYT', 'Quản lý vệ sinh lao động, sức khỏe người lao động, sơ cấp cứu; quan trắc môi trường lao động.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('17/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026 và đang chờ Quốc hội xem xét, chưa có hiệu lực'),
  },
};
