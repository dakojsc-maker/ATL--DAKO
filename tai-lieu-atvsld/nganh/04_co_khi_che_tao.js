// Nội dung tài liệu số 04 – Ngành Cơ khí – Chế tạo.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành Cơ khí – Chế tạo" (bản cho nhân viên kinh doanh, thông tin pháp lý đến 17/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Mục 1: Điều 36 Nghị định 39/2016/NĐ-CP có hai mức cho ngành này (khoản 1 và khoản 2), nên bảng bố trí cán bộ dùng dạng
// nhiều dòng (canBo.cot + canBo.dong) như tài liệu 03.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '04',
  tenFile: '04_CoKhiCheTao_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Cơ khí – Chế tạo (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp cơ khí – chế tạo – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Cơ khí – Chế tạo',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH CƠ KHÍ – CHẾ TẠO',
    gioiThieu: 'Xưởng cơ khí – chế tạo có nhiều máy móc chuyển động, nhiệt, điện, khí nén và hóa chất; công nhân làm theo ca, '
      + 'theo chuyền, phần lớn trực tiếp đứng máy, hàn cắt hoặc vận hành thiết bị. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh '
      + 'sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị '
      + 'sẵn thông tin cho buổi làm việc với chuyên viên Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP CƠ KHÍ – CHẾ TẠO CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, học nghề, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn thợ trong xưởng thuộc {{3}}:** đứng máy tiện, phay, mài, CNC, dập, chấn, ép; hàn, cắt; đúc, mạ, sơn; vận hành cầu trục, xe nâng, nồi hơi, khí nén; điện; bốc xếp thường xuyên từ 30 kg – kể cả người vệ sinh, bảo dưỡng máy.',
      '**Máy không phải kiểm định, người đứng máy vẫn thuộc {{3}}:** danh mục thiết bị phải kiểm định (cầu trục, xe nâng, nồi hơi, bình áp lực, chai khí...) và danh mục công việc xác định Nhóm 3 là hai danh mục khác nhau.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm. Thâm niên, chứng chỉ tay nghề hay chứng chỉ vận hành không thay thế huấn luyện ATVSLĐ.',
      '**Hồ sơ huấn luyện luôn được kiểm tra:** khách hàng lớn, tập đoàn mẹ khi đánh giá nhà cung cấp, cơ quan thanh tra và khi xảy ra tai nạn. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('doanh nghiệp cơ khí – chế tạo'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý, chỉ huy: giám đốc, phó giám đốc được giao phụ trách; giám đốc nhà máy, chi nhánh, xí nghiệp; trưởng phòng ban; quản đốc, phó quản đốc phân xưởng.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu khi xảy ra tai nạn; tổ chức bộ máy, kế hoạch ATVSLĐ hằng năm; đánh giá rủi ro theo máy và công đoạn; quản lý máy, thiết bị nghiêm ngặt, hóa chất; quản lý nhà thầu; văn hóa an toàn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận HSE, cán bộ ATVSLĐ chuyên trách, bán chuyên trách hoặc kiêm nhiệm; người giám sát an toàn tại xưởng.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kỹ thuật an toàn máy công cụ, hàn cắt, dập ép, thiết bị nâng, áp lực, điện, hóa chất; đánh giá rủi ro, cô lập năng lượng; công việc nóng, trên cao, không gian hạn chế; điều tra tai nạn.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: thợ tiện, phay, mài, CNC, dập, chấn, ép; thợ hàn, cắt; đúc, rèn, mạ, sơn; vận hành cầu trục, xe nâng, nồi hơi, khí nén; thợ điện, bảo trì; lái xe; bốc xếp từ 30 kg.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo máy và công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, thử việc, thời vụ: lắp ráp thủ công, kiểm tra, đóng gói; QA, QC; kỹ sư công nghệ, thiết kế; thủ kho; văn phòng, kinh doanh, bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy xưởng, vùng cấm, biển báo; PPE; giao thông nội bộ, xe nâng, cầu trục đang hoạt động; tư thế mang vác; thoát hiểm; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, y tá, điều dưỡng phòng y tế nhà máy.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu tai nạn đặc thù cơ khí (vết cắt, đứt chi, dập nát, bỏng nhiệt, bỏng hóa chất, chấn thương mắt, điện giật); quản lý sức khỏe, bệnh nghề nghiệp; xử lý tình huống khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng, thợ chính, thợ lâu năm được chọn ở từng tổ, chuyền, ca (kiêm nhiệm).',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ tại máy (thiếu che chắn, rò dầu, dây điện hở, sàn trơn, chai khí không chống đổ); nhắc nhở dùng PPE; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('xưởng'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc xưởng ngừng hoạt động, từ 6 tháng trở lên.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản đốc trực tiếp kiểm tra công việc tại máy: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ từ máy tiện sang máy dập, từ văn phòng ra xưởng) thì người lao động cần được huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp cơ khí cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Điều 36 Nghị định 39/2016/NĐ-CP xếp sản xuất kim loại và sản phẩm từ kim loại, đóng và sửa chữa tàu vào nhóm có '
        + 'yêu cầu cao hơn (khoản 1); các lĩnh vực còn lại áp dụng khoản 2. Mức tối thiểu:',
      cot: ['Dưới 50 lao động', 'Từ 50 đến dưới 300', 'Từ 300 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['Gia công, sản phẩm kim loại; đóng, sửa tàu (khoản 1)',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '02 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 03 người **chuyên trách**'],
        ['Lĩnh vực khác, ví dụ lắp ráp máy móc, thiết bị (khoản 2)',
          '01 người **bán chuyên trách**', '01 người **bán chuyên trách**', '01 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 02 người **chuyên trách**'],
      ],
      ghiChu: 'Áp dụng khoản nào do ngành nghề đăng ký và sản phẩm chính quyết định; chuyên viên Viện STP – DAKO xác nhận. '
        + 'Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2. Bộ phận y tế (Điều 37) cũng tổ chức theo quy mô và ngành '
        + 'nghề; chuyên viên xác định cho từng doanh nghiệp.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, nhà máy, chi nhánh, phòng ban, phân xưởng) hoặc phụ trách bộ phận sản xuất, kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp vận hành, sửa chữa, vệ sinh máy tiện, phay, mài, dập, ép, băng tải; hàn cắt; đúc, mạ; thiết bị nâng, áp lực; điện; trên cao từ 2 m; không gian hạn chế; hóa chất; lái xe; bốc xếp từ 30 kg?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ doanh nghiệp, Tổng giám đốc, Giám đốc; giám đốc nhà máy, chi nhánh, xí nghiệp; phó giám đốc', '1', 'Phó giám đốc: khi được giao phụ trách; nên học cả cấp phó.'],
      ['Trưởng phòng ban: kế hoạch, kỹ thuật, cơ điện, QA/QC, vật tư, kho, nhân sự, kế toán', '1', 'Phó phòng: Nhóm 1 nếu được giao phụ trách.'],
      ['B. QUẢN LÝ SẢN XUẤT TẠI XƯỞNG'],
      ['Quản đốc, phó quản đốc phân xưởng', '1', 'Nên thêm Nhóm 3 khi trực tiếp kiểm tra công việc tại máy.'],
      ['Trưởng ca, trưởng chuyền, tổ trưởng, thợ chính phụ trách tổ', '3', 'Phụ trách cả bộ phận, ca độc lập: xem xét thêm Nhóm 1.'],
      ['C. KỸ THUẬT, CÔNG NGHỆ, CHẤT LƯỢNG'],
      ['Kỹ sư thiết bị, bảo trì, cơ điện; kỹ sư lắp đặt, chạy thử tại nhà máy khách hàng', '3', 'Khi trực tiếp làm với máy; chủ yếu văn phòng: Nhóm 4.'],
      ['Kỹ sư công nghệ, quy trình, sản xuất, chế tạo', '4', 'Nhóm 3 nếu thường xuyên vận hành, chạy thử máy.'],
      ['QA, QC, KCS; phòng đo, phòng thí nghiệm vật liệu', '4', 'Nhóm 3 nếu thường xuyên đứng máy, dùng hóa chất nguy hiểm.'],
      ['Kiểm tra không phá hủy (NDT)', '3 hoặc 4', 'Chụp bức xạ: Nhóm 3, kèm an toàn bức xạ (Viện chưa cung cấp).'],
      ['Thiết kế CAD, khuôn, R&D, lập trình CNC/CAM, kế hoạch sản xuất', '4', 'Lập trình viên chạy thử trên máy: xem xét Nhóm 3.'],
      ['D. AN TOÀN VÀ Y TẾ'],
      ['Trưởng bộ phận HSE, trưởng phòng ATVSLĐ', '1 + 2', 'Vừa đứng đầu bộ phận, vừa làm công tác ATVSLĐ.'],
      ['Cán bộ ATVSLĐ chuyên trách, bán chuyên trách, kiêm nhiệm; giám sát an toàn', '2', 'Số người tối thiểu: xem mục 1.'],
      ['Nhân viên y tế, y tá, bác sĩ phòng y tế nhà máy', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên ở từng tổ, chuyền, ca', '6', 'Học thêm; vẫn giữ nhóm của công việc chính.'],
      ['E. VĂN PHÒNG, KHO, LÁI XE'],
      ['Kế toán, hành chính, nhân sự, mua hàng, xuất nhập khẩu, kinh doanh, IT; bảo vệ, tạp vụ', '4', 'Bảo vệ thuê ngoài: công ty dịch vụ huấn luyện.'],
      ['Nhân viên bếp ăn nhà máy', '4', 'Bếp từ 300 suất/ngày trở lên: xem xét Nhóm 3.'],
      ['Thủ kho thép, phôi, thành phẩm, dụng cụ, khuôn; xuất nhập hàng', '4', 'Nhóm 3 nếu bốc xếp từ 30 kg, lái xe nâng, cầu trục.'],
      ['Thủ kho hóa chất, sơn, khí công nghiệp; lái xe tải, xe đưa đón; thợ sửa xe', '3', 'Kho hóa chất: thêm an toàn hóa chất.'],
      ['F. GIA CÔNG, DẬP ÉP, HÀN CẮT'],
      ['Thợ tiện, phay, bào, khoan, mài, cưa; máy CNC, tia lửa điện, cắt dây', '3', 'Gồm cả người cài đặt, vệ sinh, bảo dưỡng máy.'],
      ['Máy dập, đột, chấn, uốn, ép thủy lực; cắt tôn, laser, plasma; thay khuôn', '3', 'Máy cắt tia nước: chuyên viên đối chiếu.'],
      ['Thợ hàn hồ quang, MIG/MAG, TIG, hàn điểm; hàn cắt gas; gò hàn; hàn ống, bồn bể', '3', 'Thêm trên cao, không gian hạn chế nếu có.'],
      ['Vận hành robot hàn, cánh tay robot', '3 hoặc 4', 'Chỉ nạp phôi, bấm khởi động: chuyên viên rà soát.'],
      ['G. ĐÚC, NHIỆT LUYỆN, XỬ LÝ BỀ MẶT'],
      ['Làm khuôn đúc, nấu rót kim loại, lò nung, lò nhiệt luyện, rèn', '3', 'Lò cảm ứng, cao tần: xem xét thêm điện từ trường.'],
      ['Mạ, tẩy rửa, anod, phun cát, phun bi, sơn tĩnh điện, sơn phun, pha sơn', '3', 'Thêm an toàn hóa chất.'],
      ['Xử lý nước thải xưởng mạ, sơn; vệ sinh bồn, bể, két, khoang kín', '3', 'Không gian hạn chế.'],
      ['H. THIẾT BỊ NÂNG, ÁP LỰC, ĐIỆN, BẢO TRÌ'],
      ['Cầu trục, cổng trục, pa lăng, tời; móc cáp, buộc tải, ra tín hiệu', '3', 'Thiết bị nâng thuộc danh mục kiểm định.'],
      ['Lái xe nâng hàng, xe nâng người, sàn nâng; sạc ắc quy xe nâng', '3', 'Người sạc ắc quy: chuyên viên xác nhận.'],
      ['Nồi hơi, lò gia nhiệt dầu, máy nén khí, bình khí nén, hệ thống lạnh', '3', 'Thiết bị áp lực thuộc danh mục kiểm định.'],
      ['Thợ điện, bảo trì điện, lắp tủ điện, điện tự động hóa, trạm biến áp', '3', 'Thêm huấn luyện an toàn điện.'],
      ['Bảo trì cơ khí, sửa chữa, cơ điện, lắp đặt máy; lắp dựng kết cấu thép', '3', 'Thêm làm việc trên cao từ 2 m nếu có.'],
      ['I. LẮP RÁP, PHỔ THÔNG, THỜI VỤ, NHÀ THẦU'],
      ['Thợ nguội, đánh bóng, đánh nhám, làm sạch ba via; băng tải, súng khí nén', '3', 'Lắp ráp thủ công không dùng máy: xem xét Nhóm 4.'],
      ['Lắp ráp trên chuyền (cơ – điện nhẹ), kiểm tra, đóng gói', '4', 'Nhóm 3 nếu bốc xếp từ 30 kg, dùng máy thuộc Danh mục.'],
      ['Phụ việc, phụ hàn, phụ máy, bốc xếp; thời vụ, học việc, thực tập sinh', '3 hoặc 4', 'Theo công việc; huấn luyện trước khi giao việc.'],
      ['Lao động thuê lại; nhà thầu bảo trì, vệ sinh, vận chuyển', 'Theo công việc', 'Theo hợp đồng; chuyên viên xác nhận.'],
      ['Khách, đoàn đánh giá, nhà cung cấp vào xưởng', '—', 'Không thuộc 6 nhóm; phổ biến nội quy, cấp PPE.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới giữa Nhóm 3 và Nhóm 4.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG CƠ KHÍ – CHẾ TẠO: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao phần lớn nhân sự xưởng cơ khí thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ '
      + '(Thông tư 06/2020/TT-BLĐTBXH) nêu rõ việc vận hành, sửa chữa, vệ sinh máy mài, tiện, phay, dập, ép, băng tải; hàn '
      + 'cắt; đúc, mạ; thiết bị nâng, áp lực; điện; trên cao, không gian hạn chế. Máy không phải kiểm định, người vận hành '
      + 'vẫn thuộc Nhóm 3.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo máy và công việc tại xưởng:',
    nghe: [
      ['Gia công cắt gọt, CNC', 'Tiện, phay, mài, khoan',
        'Cuốn, kẹp từ trục quay, mâm cặp, dao, phoi; che chắn, khóa liên động, dừng khẩn cấp; không đeo găng, trang sức gần bộ phận quay; dầu cắt gọt; cửa an toàn, chạy thử chương trình CNC.'],
      ['Dập, chấn, ép, cắt tấm', 'Dập, chấn; laser, plasma',
        'Đứt, dập chi ở vùng khuôn; màn chắn quang điện, điều khiển hai tay, không vô hiệu hóa bảo vệ; thay khuôn: cô lập năng lượng, chèn đầu trượt; mép sắc tôn tấm; khói, cháy khi cắt.'],
      ['Hàn, cắt, lắp dựng', 'Hồ quang, gas; kết cấu',
        'Điện giật khi hàn, nối đất; hồ quang, tia lửa, kim loại nóng; khói hàn, thông gió; cháy nổ quanh khu hàn, người canh lửa; chai oxy, axetylen; trên cao, không gian hạn chế.'],
      ['Đúc, rèn, nhiệt luyện', 'Lò nung, nấu rót',
        'Bỏng, kim loại nóng chảy bắn, nổ khi gặp nước hoặc vật ẩm; PPE chịu nhiệt; khởi động, vận hành, tắt lò an toàn; nhiên liệu, khí cháy; xử lý sự cố, sơ cứu bỏng.'],
      ['Mạ, sơn, xử lý bề mặt', 'Mạ, phun cát, sơn',
        'Nhãn, bảng dữ liệu an toàn hóa chất; axit, kiềm, dung môi; pha chế, xử lý rò đổ, rửa mắt; hơi dung môi dễ cháy, chống tĩnh điện, thông gió buồng sơn; bụi, ồn khi phun cát.'],
      ['Nâng hạ, áp lực', 'Cầu trục, xe nâng, nồi hơi',
        'Kiểm tra trước ca: phanh, cáp, móc, van an toàn; không vượt tải, không đi dưới tải treo; buộc tải, tín hiệu tay; xe nâng: điểm mù, người đi bộ; nồi hơi: xả đáy, xử lý sự cố.'],
      ['Điện, cơ điện, bảo trì', 'Điện, tự động hóa',
        'Điện giật, hồ quang; khóa và gắn thẻ, kiểm tra không điện; tủ điện, nối đất, dụng cụ cách điện; cô lập điện, khí nén, thủy lực khi bảo trì; trên cao khi bảo trì cầu trục, mái xưởng.'],
      ['Nguội, lắp ráp, đánh bóng', 'Mài cầm tay, băng tải',
        'Đá mài, vỏ che, tốc độ cho phép; kính, mặt che; tia lửa, bụi; dụng cụ khí nén, ồn, rung; băng tải: kẹp, cuốn tại con lăn, không vệ sinh khi đang chạy; mép sắc, ba via.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy máy, thiết bị và công việc tại xưởng, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện, lắp tủ điện, máy hàn lớn. Không thay thế Nhóm 3.'],
      ['Huấn luyện an toàn hóa chất', 'Xưởng sơn, mạ, tẩy rửa; dung môi, axit, kiềm, khí công nghiệp.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu của xưởng: vết cắt, đứt chi, bỏng, điện giật, hóa chất.'],
      ['Kiểm định kỹ thuật an toàn', 'Cầu trục, pa lăng, xe nâng, nồi hơi, bình khí nén, chai khí, hệ thống lạnh.'],
      ['Quan trắc môi trường lao động', 'Khói hàn, bụi kim loại, ồn, hơi dung môi, nhiệt ở xưởng hàn, sơn, mạ.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Máy, dây chuyền mới; hàn trong bồn, cẩu lắp; quy trình khóa và gắn thẻ.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Phòng QC, phòng đo: độ dài, khối lượng, nhiệt độ, điện, lực, độ cứng.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Khi khách hàng lớn đánh giá nhà cung cấp; đào tạo nghề ngắn hạn cho thợ.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Máy tiện, phay, dập không phải kiểm định, thợ đứng máy có thuộc Nhóm 3?',
      'Có. Danh mục thiết bị phải kiểm định (cầu trục, xe nâng, nồi hơi, bình áp lực, chai khí...) và Danh mục công việc xác định Nhóm 3 là hai danh mục khác nhau. Người vận hành, sửa chữa, bảo dưỡng, vệ sinh máy tiện, phay, mài, dập, ép thuộc Nhóm 3; máy cụ thể có phải kiểm định không do chuyên viên đối chiếu.'],
    ['Thợ lành nghề hàng chục năm, có chứng chỉ hàn, chứng chỉ vận hành, còn phải học?',
      'Có. Huấn luyện là yêu cầu theo công việc, không theo thâm niên; chứng chỉ tay nghề, chứng chỉ vận hành là điều kiện chuyên môn, còn Nhóm 3 là yêu cầu ATVSLĐ riêng. Nội dung có thực hành, cập nhật quy trình, máy mới và cách xử lý tình huống.'],
    ['Máy mới nhập khẩu đã có đủ thiết bị an toàn, còn cần huấn luyện?',
      'Cần. Thiết bị bảo vệ giảm rủi ro nhưng không thay được việc người vận hành hiểu máy và quy trình. Rủi ro tăng lên khi thay khuôn, bảo trì, xử lý kẹt phôi; huấn luyện giúp làm đúng và không vô hiệu hóa thiết bị bảo vệ.'],
    ['Công nhân lắp ráp dùng tua vít điện, phụ việc vệ sinh máy: Nhóm 3 hay Nhóm 4?',
      'Dụng cụ cầm tay nhẹ không thuộc nhóm máy trong Danh mục thì xem xét Nhóm 4. Người trực tiếp vệ sinh, bảo dưỡng máy thuộc Danh mục thường là Nhóm 3. Trường hợp ranh giới được chuyên viên rà soát theo công cụ và công việc thực tế.'],
    ['Công nhân mới tuyển, vài ngày sau cho đứng máy được không?',
      'Người làm công việc thuộc Danh mục phải được huấn luyện trước khi bố trí làm việc. Viện STP – DAKO có thể huấn luyện nhanh theo đợt tại xưởng cho lao động mới tuyển.'],
    ['Xưởng chạy ba ca, đang chạy đơn hàng gấp: tổ chức huấn luyện thế nào?',
      'Chia đợt nhỏ theo tổ, theo ca, huấn luyện ngay tại xưởng; phần thực hành bố trí lúc máy ít tải; ưu tiên công việc rủi ro cao trước. Chuyên viên thiết kế lịch theo kế hoạch sản xuất.'],
    ['Nhà thầu bảo trì, thợ hàn khoán, lao động thuê lại: ai huấn luyện?',
      'Nhà thầu, tổ đội là người sử dụng lao động của họ nên chịu trách nhiệm huấn luyện; lao động thuê lại theo hợp đồng và Điều 30–32 Nghị định 39/2016/NĐ-CP. Doanh nghiệp nên yêu cầu xuất trình chứng nhận trước khi cho vào xưởng; chứng nhận do Viện STP – DAKO cấp tra cứu được trực tuyến.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm theo máy và công việc, không thừa; có thể chia đợt, ưu tiên Nhóm 1, 2 và thợ hàn, thiết bị nâng, áp lực, dập ép trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, sơ đồ xưởng, danh sách máy, thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, theo tổ.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Khách hàng, đoàn đánh giá'),
      ['Huấn luyện tại xưởng',
        'Chia đợt theo tổ, theo ca để không dừng sản xuất; lý thuyết kết hợp thực hành tại chỗ trên máy, thiết bị của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 30–32, 36, 37, 38)', 'Trách nhiệm khi thuê lại lao động; bố trí người làm công tác ATVSLĐ và bộ phận y tế theo ngành, quy mô; hội đồng ATVSLĐ cơ sở.'],
      DANH_MUC,
      ['Thông tư 19/2016/TT-BYT', 'Quản lý vệ sinh lao động, sức khỏe người lao động, sơ cấp cứu; quan trắc môi trường lao động.'],
      ['Nghị quyết 66.18/2026/NQ-CP', 'Cơ chế tạm thời từ 01/7/2026 đến hết 28/02/2027: đơn giản hóa một số thủ tục ATVSLĐ; máy, thiết bị nghiêm ngặt khai báo khi đưa vào sử dụng.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('17/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026 và trình Quốc hội, dự kiến xem xét tại kỳ họp thứ 2 khai mạc ngày 17/10/2026, '
      + 'kèm dự thảo nghị định thay thế Nghị định 39/2016/NĐ-CP và Nghị định 44/2016/NĐ-CP; dự án chưa có hiệu lực'),
  },
};
