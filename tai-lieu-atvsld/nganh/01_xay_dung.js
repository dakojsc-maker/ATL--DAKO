// Nội dung tài liệu số 01 – Ngành Xây dựng (bản đã duyệt, dùng làm mẫu cho các ngành tiếp theo).
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành xây dựng" (bản cho nhân viên kinh doanh, thông tin pháp lý đến 15/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ.
// Cú pháp: **đậm**; {{n}} -> "Nhóm n" tô màu nhóm. Trong cột "Nhóm" của bảng tra: "1", "1 + 3", "3 hoặc 4", "Theo công việc", "—".

const chung = require('../khung/noi_dung_chung');

module.exports = {
  so: '01',
  tenFile: '01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Xây dựng (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp xây dựng – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Xây dựng',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH XÂY DỰNG',
    gioiThieu: 'Doanh nghiệp xây dựng có lao động phân tán ở nhiều công trường, biến động theo từng công trình, và phần lớn công việc '
      + 'thuộc diện có yêu cầu nghiêm ngặt về an toàn, vệ sinh lao động (ATVSLĐ). Tài liệu này giúp Quý Doanh nghiệp nắm nhanh '
      + 'sáu nhóm huấn luyện theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin cho buổi làm việc '
      + 'với chuyên viên Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP XÂY DỰNG CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn nhân sự công trường thuộc {{3}}** (công việc có yêu cầu nghiêm ngặt): thợ thi công, kỹ sư hiện trường, giám sát, vận hành máy, lái xe. Người lao động chỉ làm công việc nghiêm ngặt sau khi đã được huấn luyện và cấp thẻ an toàn.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; nghỉ việc từ 6 tháng trở lên phải huấn luyện lại.',
      '**Hồ sơ huấn luyện luôn được kiểm tra:** chủ đầu tư, tổng thầu thường yêu cầu trước khi cho vào công trường; tổng thầu kiểm tra công tác an toàn của thầu phụ; đây cũng là hồ sơ được xem đầu tiên khi có thanh tra hoặc tai nạn.',
      '**Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động** theo quy định, không trừ vào lương người lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('doanh nghiệp xây dựng'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý, chỉ huy: giám đốc, phó giám đốc được giao phụ trách, trưởng phòng ban, giám đốc chi nhánh; giám đốc dự án, chỉ huy trưởng, đội trưởng.',
        hocGi: 'Pháp luật và trách nhiệm của người đứng đầu; tổ chức bộ máy ATVSLĐ; kế hoạch ATVSLĐ hằng năm và kế hoạch an toàn tổng hợp của dự án; đánh giá rủi ro; quản lý thầu phụ, tổ đội; điều tra tai nạn; văn hóa an toàn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: cán bộ an toàn, HSE chuyên trách hoặc bán chuyên trách (kiêm nhiệm); người trực tiếp giám sát ATVSLĐ tại công trường.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; đánh giá rủi ro, biện pháp an toàn cho công việc nguy cơ cao; kiểm tra hiện trường, họp an toàn đầu ca; quản lý PPE, thiết bị nghiêm ngặt và kiểm định; điều tra tai nạn, ứng cứu khẩn cấp.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt về ATVSLĐ: kỹ sư hiện trường, giám sát; thợ thi công các nghề; vận hành máy, thiết bị nâng; thợ điện, thợ hàn; lái xe.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo nghề (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, tập nghề, thử việc: văn phòng, kế toán, nhân sự, kinh doanh, kho, bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ của người lao động; nội quy nơi làm việc và khi vào công trường; sử dụng PPE; sơ cấp cứu cơ bản, thoát hiểm.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: nhân viên y tế, phụ trách trạm y tế công trường.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu tai nạn lao động (ngã cao, điện giật, bỏng, ngạt, chấn thương); quản lý sức khỏe, bệnh nghề nghiệp; xử lý tình huống khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: thợ chính, tổ trưởng được cử làm mạng lưới an toàn ở tổ, đội (kiêm nhiệm).',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ, nhắc nhở sử dụng PPE; phát hiện sớm hành vi, điều kiện không an toàn; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('công trường'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – rất hay gặp khi công trình kết thúc, đội thợ giải tán rồi tập hợp lại.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ đội trưởng: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** thì người lao động cần được huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp xây dựng cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Thi công công trình xây dựng thuộc nhóm ngành phải bố trí người làm công tác ATVSLĐ theo quy mô lao động '
        + '(Điều 36 Nghị định 39/2016/NĐ-CP). Mức tối thiểu:',
      bang: [
        ['Dưới 50 lao động', '01 người **bán chuyên trách**'],
        ['Từ 50 đến dưới 300', '01 người **chuyên trách**'],
        ['Từ 300 đến dưới 1.000', '02 người **chuyên trách**'],
        ['Từ 1.000 trở lên', 'Phòng ATVSLĐ hoặc ít nhất 03 người **chuyên trách**'],
      ],
      ghiChu: 'Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2 và đáp ứng tiêu chuẩn về trình độ khối kỹ thuật, kinh nghiệm '
        + 'theo Điều 36 nêu trên; huấn luyện Nhóm 2 không thay thế yêu cầu về bằng cấp.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, phòng ban, chi nhánh, ban chỉ huy công trường, đội thi công) hoặc phụ trách bộ phận kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp làm công việc nghiêm ngặt: thi công xây dựng, làm việc trên cao từ 2 m, điện, hàn cắt, vận hành máy xây dựng và thiết bị nâng, không gian hạn chế, lái xe ô tô...?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ CẤP CÔNG TY'],
      ['Chủ tịch HĐQT, chủ doanh nghiệp, Tổng giám đốc, Giám đốc; giám đốc chi nhánh, xí nghiệp, đội xây dựng trực thuộc', '1', 'Người đứng đầu đơn vị.'],
      ['Phó Tổng giám đốc, Phó Giám đốc', '1', 'Bắt buộc khi được giao phụ trách ATVSLĐ hoặc phụ trách kỹ thuật, kinh doanh; khuyến nghị cho mọi cấp phó.'],
      ['Trưởng phòng: kỹ thuật – thi công, kế hoạch – đấu thầu, vật tư – thiết bị, chất lượng, hành chính – nhân sự, kế toán trưởng, kinh doanh', '1', 'Phó phòng: Nhóm 1 nếu được giao phụ trách ATVSLĐ hoặc phụ trách bộ phận; còn lại Nhóm 4.'],
      ['B. ĐIỀU HÀNH DỰ ÁN VÀ CÔNG TRƯỜNG'],
      ['Giám đốc dự án, chủ nhiệm dự án; chỉ huy trưởng, chỉ huy phó công trường', '1', 'Khuyến nghị thêm Nhóm 3 khi trực tiếp điều hành, kiểm tra công việc nghiêm ngặt.'],
      ['Đội trưởng, đốc công', '1 + 3', 'Vừa quản lý đội, vừa trực tiếp thi công.'],
      ['Tổ trưởng, thợ chính phụ trách tổ thi công', '3', 'Nên cử làm an toàn, vệ sinh viên (thêm Nhóm 6).'],
      ['C. KỸ THUẬT, GIÁM SÁT, CHẤT LƯỢNG'],
      ['Kỹ sư thi công, kỹ sư hiện trường; kỹ sư giám sát (nhà thầu, tư vấn giám sát, ban QLDA, chủ đầu tư); QA/QC, thí nghiệm hiện trường, trắc đạc, khảo sát', '3', 'Công việc xây dựng thuộc Danh mục nghiêm ngặt. Chủ yếu làm việc văn phòng: xem xét Nhóm 4.'],
      ['Dự toán, quản lý khối lượng (QS), kế hoạch, hồ sơ hoàn công, thiết kế, BIM', '4', 'Thường xuyên làm việc tại hiện trường: xem xét Nhóm 3.'],
      ['D. AN TOÀN VÀ Y TẾ'],
      ['Trưởng bộ phận HSE, trưởng phòng ATVSLĐ', '1 + 2', 'Vừa đứng đầu bộ phận, vừa làm công tác ATVSLĐ.'],
      ['Cán bộ ATVSLĐ chuyên trách, bán chuyên trách; HSE officer; giám sát an toàn hiện trường', '2', 'Số người tối thiểu theo quy mô: xem mục 1.'],
      ['Nhân viên y tế, phụ trách trạm y tế công trường', '5', ''],
      ['An toàn, vệ sinh viên ở các tổ, đội', '6', 'Học thêm, ngoài nhóm của công việc chính.'],
      ['E. VĂN PHÒNG, HỖ TRỢ VÀ KHO'],
      ['Kế toán, hành chính, nhân sự, văn thư, IT, kinh doanh; bảo vệ, lao công, tạp vụ', '4', 'Bảo vệ nên bổ sung phòng cháy, ứng phó khẩn cấp.'],
      ['Nhân viên bếp ăn tập thể', '4', 'Nhóm 3 nếu bếp từ 300 suất ăn/ngày trở lên.'],
      ['Thủ kho, nhân viên kho vật tư, cung ứng hiện trường', '4', 'Nhóm 3 nếu thường xuyên bốc xếp thủ công vật nặng từ 30 kg, bảo quản hóa chất nguy hiểm hoặc lái xe nâng.'],
      ['F. LÁI XE, VẬN HÀNH MÁY VÀ THỢ THI CÔNG'],
      ['Lái xe con, xe tải, xe ben, xe bồn bê tông, xe cẩu, xe đầu kéo chở vật liệu', '3', 'Lái xe ô tô thuộc Danh mục nghiêm ngặt.'],
      ['Vận hành cần trục, cẩu, vận thăng, sàn treo; tín hiệu viên, buộc tải; máy xúc, ủi, lu, đầm; xe nâng; bơm bê tông, trạm trộn; nồi hơi, máy nén khí; thợ sửa chữa máy', '3', 'Máy xây dựng, thiết bị nâng, thiết bị áp lực thuộc Danh mục nghiêm ngặt.'],
      ['Thợ làm việc trên cao từ 2 m: giàn giáo, cốp pha, cốt thép, mặt dựng, kết cấu thép, lợp mái', '3', ''],
      ['Thợ hàn, cắt kim loại; gia công cốt thép, kết cấu thép; thợ cơ khí', '3', ''],
      ['Thợ điện, điện nhẹ, điều hòa thông gió, ống nước – PCCC (MEP)', '3', 'Thêm huấn luyện an toàn điện tùy công việc.'],
      ['Thợ đào, hố móng, tầng hầm, phá dỡ, cống, bể; thợ khoan, ép, đóng cọc', '3', ''],
      ['Thợ bê tông, mộc, sơn, chống thấm, ốp lát, hoàn thiện', '3', 'Thợ sơn, chống thấm: thêm an toàn hóa chất khi dùng hóa chất nguy hiểm.'],
      ['G. LAO ĐỘNG PHỔ THÔNG, THỜI VỤ, NHÀ THẦU PHỤ'],
      ['Phụ hồ, phụ việc, bốc xếp, vận chuyển vật liệu, dọn dẹp công trường', '3 hoặc 4', 'Nhóm 3 khi làm công việc xây dựng thuộc Danh mục (thường gặp); Nhóm 4 khi không thuộc Danh mục.'],
      ['Lao động thời vụ, học việc, tập nghề, thử việc', '3 hoặc 4', 'Theo công việc được giao; huấn luyện trước khi giao việc.'],
      ['Tổ đội khoán, thầu nhân công, nhân sự nhà thầu phụ', 'Theo công việc', 'Người sử dụng lao động của họ huấn luyện; nhà thầu chính kiểm tra hồ sơ.'],
      ['Khách vào công trường (chủ đầu tư, tư vấn, đoàn kiểm tra)', '—', 'Không thuộc 6 nhóm; phổ biến nội quy, cấp PPE trước khi vào.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG XÂY DỰNG: HỌC GÌ THEO TỪNG NGHỀ',
    viSao: '**Vì sao phần lớn nhân sự công trường thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ '
      + '(Thông tư 06/2020/TT-BLĐTBXH) bao gồm chính các việc của công trường: thi công, giám sát, khảo sát, lắp đặt, sửa chữa, '
      + 'phá dỡ, bảo trì công trình; làm việc trên cao từ 2 m; vận hành máy xây dựng, thiết bị nâng; điện; hàn, cắt kim loại; '
      + 'không gian hạn chế; lái xe ô tô; hóa chất nguy hiểm; cưa xẻ gỗ; bốc xếp thủ công thường xuyên vật nặng từ 30 kg.',
    dan: 'Ngoài phần chung của Nhóm 3, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại công trường:',
    nghe: [
      ['Kỹ sư, giám sát hiện trường', 'Kỹ sư thi công, giám sát, QA/QC, trắc đạc',
        'An toàn chuyên ngành xây dựng (trên cao, giàn giáo – cốp pha, hố móng, cẩu lắp, điện thi công, hàn cắt, phòng cháy); kiểm tra hiện trường, nhận biết điều kiện và hành vi không an toàn, lập biên bản, yêu cầu dừng việc; sơ cứu ban đầu.'],
      ['Làm việc trên cao', 'Giàn giáo, cốp pha, cốt thép, mặt dựng, mái',
        'Ngã cao, vật rơi; hệ thống chống ngã (dây an toàn toàn thân, điểm neo, lưới, lan can, sàn thao tác); lắp dựng, kiểm tra, tháo dỡ giàn giáo; làm việc khi có gió, mưa, sét; cứu hộ người treo trên dây; thực hành mặc và kiểm tra dây an toàn.'],
      ['Hàn, cắt, gia công thép', 'Hàn hồ quang, MIG, TIG; cắt gas, plasma; cơ khí',
        'Cháy nổ khi hàn cắt; chai khí oxy, axetylen, LPG, van chống cháy ngược; điện giật từ máy hàn; khói hàn, bảo vệ mắt và da; hàn cắt trên cao, trong không gian hạn chế; máy mài, máy cắt, máy uốn.'],
      ['Điện và cơ điện (MEP)', 'Điện thi công, điện nhẹ, điều hòa, ống nước – PCCC',
        'Điện thi công: tủ điện tạm, dây dẫn, chống dòng rò, nối đất; khóa – gắn thẻ khi sửa chữa; khoảng cách an toàn với đường dây, kể cả khi cẩu lắp; sơ cứu điện giật.'],
      ['Đào, hố móng, hầm, phá dỡ, cọc', 'Đào, tầng hầm, phá dỡ; cống, bể; khoan, ép cọc',
        'Sạt lở, sập vách (chống vách, rào chắn mép hố, thoát nước); không gian hạn chế (đo khí, thông gió, người giám sát bên ngoài, cứu hộ); trình tự phá dỡ; an toàn máy khoan, ép, đóng cọc.'],
      ['Bê tông, mộc, sơn, hoàn thiện', 'Bê tông, mộc, sơn, chống thấm, ốp lát, trần',
        'Máy trộn, đầm, bơm bê tông; bỏng xi măng, vôi; máy cưa, bụi gỗ; dung môi, thông gió, bảo vệ hô hấp, phiếu an toàn hóa chất; làm việc trên thang, sàn công tác.'],
      ['Vận hành máy nâng, máy thi công', 'Cần trục, cẩu, vận thăng, sàn treo, máy xúc, xe nâng',
        'Kiểm tra máy trước ca; tải trọng, biểu đồ tải, ổn định máy, gió; tín hiệu cẩu, buộc tải, vùng nguy hiểm; khoảng cách với đường điện; điểm mù, đường dốc, nền yếu; xử lý sự cố.'],
      ['Lái xe', 'Xe tải, xe ben, xe bồn bê tông, xe cẩu, xe con',
        'Giao thông nội bộ công trường: tốc độ, điểm mù, lùi xe có người dẫn, đường dốc, nền yếu; chằng buộc, tải trọng, nâng hạ thùng ben; kiểm tra xe trước ca; tiếp nhiên liệu an toàn.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy công việc và thiết bị tại công trường, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện (MEP), điện thi công, làm việc gần lưới điện. Yêu cầu riêng, không thay thế Nhóm 3.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu công trường; công trường không có nhân viên y tế chuyên trách.'],
      ['Huấn luyện an toàn hóa chất', 'Dùng, lưu trữ hóa chất nguy hiểm: sơn, dung môi, chống thấm, khí hàn, nhiên liệu.'],
      ['Kiểm định kỹ thuật an toàn', 'Cần trục, vận thăng, sàn treo, xe nâng, máy ép cọc, bơm bê tông, bình áp lực, chai khí... theo danh mục hiện hành.'],
      ['Quan trắc môi trường lao động', 'Xưởng gia công, công trường nhiều bụi, ồn, khói hàn, hơi dung môi.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Kế hoạch an toàn tổng hợp trình chủ đầu tư; biện pháp cho việc nguy cơ cao.'],
      ['Tư vấn hệ thống quản lý ISO 45001', 'Dự thầu dự án có yêu cầu ISO 45001 hoặc muốn chuẩn hóa hệ thống quản lý an toàn.'],
      ['Giáo dục nghề nghiệp; hiệu chuẩn', 'Đào tạo nghề ngắn hạn cho thợ (hàn, vận hành máy...); kiểm định, hiệu chuẩn thiết bị đo.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Văn phòng, doanh nghiệp nhỏ có phải huấn luyện không?',
      'Có. Nghĩa vụ huấn luyện áp dụng với mọi người lao động, không phân biệt quy mô doanh nghiệp. Văn phòng thuộc Nhóm 4 (tối thiểu 16 giờ, định kỳ hằng năm), có thể tổ chức gọn tại chỗ.'],
    ['Đã có cán bộ an toàn, giám đốc còn phải học không? Cử người học thay được không?',
      'Có. Cán bộ an toàn thuộc Nhóm 2, giám đốc thuộc Nhóm 1, nội dung và trách nhiệm khác nhau. Mỗi người thuộc Nhóm 1 phải tự học, không học thay; lịch học được sắp xếp linh hoạt để không ảnh hưởng điều hành.'],
    ['Kỹ sư chỉ ra công trường vài ngày mỗi tuần, xếp Nhóm 4 được không?',
      'Nhóm xác định theo công việc thực tế, không theo số ngày ở công trường: trực tiếp giám sát, thi công là Nhóm 3. Xếp thấp hơn thực tế gây rủi ro về hồ sơ khi có thanh tra hoặc tai nạn.'],
    ['Thợ có bằng nghề, chứng chỉ vận hành, bằng lái xe có phải học?',
      'Có. Bằng nghề, chứng chỉ vận hành, giấy phép lái xe là điều kiện chuyên môn; huấn luyện ATVSLĐ là yêu cầu riêng. Thiết bị đã kiểm định vẫn cần người vận hành được huấn luyện.'],
    ['Lao động đông, biến động, công trường ở xa thì tổ chức thế nào?',
      'Mọi người lao động, kể cả thời vụ, thử việc, phải được huấn luyện trước khi giao việc. Viện STP – DAKO huấn luyện tại công trường, chia đợt theo tổ đội, ca hoặc theo tiến độ thi công.'],
    ['Thợ đã có thẻ an toàn ở công trình khác, có phải học lại?',
      'Tra cứu mã chứng nhận để xem nhóm và thời hạn. Còn hạn và đúng nhóm công việc thì không học lại toàn bộ; chuyên viên đề xuất phần cần bổ sung (nếu có).'],
    ['Thầu phụ, tổ đội khoán, thiết bị thuê kèm người vận hành: ai huấn luyện?',
      'Người sử dụng lao động của họ (thầu phụ, tổ đội, bên cho thuê). Nhà thầu chính kiểm tra công tác an toàn của thầu phụ (Thông tư 04/2017/TT-BXD), nên yêu cầu hồ sơ huấn luyện trước khi cho vào công trường.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức. Chi phí an toàn lao động của dự án nằm trong chi phí hạng mục chung của dự toán, không được giảm khi đấu thầu (Thông tư 04/2017/TT-BXD).'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, công trường, hồ sơ hiện có.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch, địa điểm theo tiến độ thi công.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Chủ đầu tư, tổng thầu'),
      ['Huấn luyện tại công trường',
        'Chia đợt theo tổ đội, ca làm việc để hạn chế gián đoạn thi công; lý thuyết kết hợp thực hành tại chỗ, nội dung gắn với công việc thực tế của từng nghề.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      ...chung.PHAP_LY_CHUNG,
      ['Thông tư 04/2017/TT-BXD (hợp nhất tại 07/VBHN-BXD); QCVN 18:2021/BXD', 'Quản lý an toàn trong thi công xây dựng: kế hoạch an toàn tổng hợp, nhà thầu chính kiểm tra thầu phụ, chi phí an toàn trong dự toán; quy chuẩn an toàn thi công.'],
    ],
    tinhTrang: chung.TINH_TRANG_PHAP_LY,
  },
};
