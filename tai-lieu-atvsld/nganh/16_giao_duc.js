// Nội dung tài liệu số 16 – Ngành Giáo dục.
// Nguồn: “Cẩm nang tư vấn ATVSLĐ – Ngành Giáo dục” (bản cho nhân viên kinh doanh, thông tin pháp lý đến 18/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Điều 36, 37 Nghị định 39/2016/NĐ-CP viết cho cơ sở sản xuất, kinh doanh: bảng bố trí hai dòng (khoản 2) chỉ là mức
// tham chiếu, chuyên viên xác nhận cách áp dụng cho trường công lập, tư thục.
// Điểm riêng: huấn luyện ATVSLĐ dành cho người lao động của trường, không phải an toàn cho học sinh.
// Cẩm nang còn dẫn Thông tư 05/2021/TT-BCT và Nghị định 113/2017/NĐ-CP; hai văn bản này đã được thay thế nên không đưa vào.

const chung = require('../khung/noi_dung_chung');

const [, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '16',
  tenFile: '16_GiaoDuc_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Giáo dục (tài liệu dành cho cơ sở giáo dục)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho cơ sở giáo dục – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Giáo dục',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH GIÁO DỤC',
    gioiThieu: 'Trường mầm non, phổ thông, trung tâm, cơ sở giáo dục nghề nghiệp và đại học có đông giáo viên, nhân viên; phần '
      + 'lớn làm công việc thông thường, một số làm việc ở xưởng thực hành, phòng thí nghiệm, bếp ăn, xe đưa đón, khu kỹ thuật. '
      + 'Tài liệu này giúp Quý Nhà trường nắm nhanh sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự '
      + 'ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin cho buổi làm việc với chuyên viên của Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU CƠ SỞ GIÁO DỤC CẦN BIẾT',
    diemChinh: [
      '**Huấn luyện ATVSLĐ dành cho người lao động của trường, không phải an toàn cho học sinh:** giáo viên, giảng viên, cán bộ, nhân viên (kể cả viên chức) đều phải được huấn luyện theo 6 nhóm; an toàn trường học, y tế học đường cho học sinh là quy định riêng.',
      '**Phần lớn giáo viên, nhân viên thuộc {{4}}:** giáo viên lý thuyết, mầm non, văn phòng, bảo vệ, tạp vụ. {{3}} chỉ tập trung ở xưởng thực hành nghề, phòng thí nghiệm, bếp ăn từ 300 suất/ngày, lái xe, điện, thang máy, nồi hơi, bể phốt, bể bơi.',
      '**Nhóm được xác định theo công việc thực tế:** trưởng khoa, trưởng xưởng thuộc {{1}}; trưởng xưởng trực tiếp dạy trên máy thêm {{3}}; tổ trưởng chuyên môn thường thuộc {{4}}, nên học thêm {{6}}.',
      '**Huấn luyện thuận lợi nhất vào dịp hè, trước khai giảng:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; người nghỉ việc từ 6 tháng trở lên phải huấn luyện lại.',
      '**Nhà thầu suất ăn, bảo vệ, vệ sinh, xe đưa đón huấn luyện người của mình:** nhà trường kiểm tra hồ sơ trước khi cho vào làm việc. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('trường học, trung tâm, cơ sở giáo dục nghề nghiệp và đại học'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ tịch hội đồng trường, chủ trường tư thục; hiệu trưởng, giám đốc; phó hiệu trưởng được giao phụ trách (nhất là cơ sở vật chất); giám đốc phân hiệu; trưởng phòng, ban; trưởng khoa, giám đốc viện, trung tâm; trưởng xưởng, phòng thí nghiệm.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu với người lao động; tổ chức công tác ATVSLĐ của trường; kế hoạch hằng năm; đánh giá rủi ro theo khu vực (xưởng, phòng thí nghiệm, bếp, bể bơi, ký túc xá, khu kỹ thuật); quản lý nhà thầu; điều tra tai nạn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận an toàn, quản trị; cán bộ ATVSLĐ chuyên trách; người kiêm nhiệm (thường phụ trách cơ sở vật chất, thiết bị, hành chính, kỹ thuật); cán bộ an ninh – an toàn được giao ATVSLĐ.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; đánh giá rủi ro theo khu vực; kiểm soát hóa chất phòng thí nghiệm, bể bơi, vệ sinh; thiết bị nghiêm ngặt (thang máy, nồi hơi); quản lý nhà thầu suất ăn, bảo vệ, vệ sinh, xe; điều tra tai nạn; hồ sơ cho đoàn kiểm tra.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: giáo viên, kỹ thuật viên thực hành cơ khí, hàn, điện, ô tô; kỹ thuật viên phòng thí nghiệm dùng hóa chất nguy hiểm; nhân viên bếp từ 300 suất/ngày; lái xe; thợ điện, bảo trì; vận hành thang máy, nồi hơi; bể phốt, bể nước.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả thử việc: giáo viên, giảng viên lý thuyết; giáo viên mầm non, bảo mẫu, cô nuôi (bếp dưới 300 suất); tổ trưởng chuyên môn; giáo viên thể dục; văn phòng, thư viện, ký túc xá; bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy trường; ngã, điện, cháy, hóa chất khi vào phòng thí nghiệm, xưởng; nâng, bế trẻ, tư thế, giọng nói, màn hình; phòng bệnh truyền nhiễm; thoát hiểm, sơ tán; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, điều dưỡng, y tá phòng y tế của trường (với vai trò y tế cho người lao động).',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn lao động của giáo viên, nhân viên (ngã, bỏng, dính hóa chất, chấn thương ở xưởng); quản lý sức khỏe người lao động; bệnh nghề nghiệp; ứng phó khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: giáo viên, nhân viên đại diện tổ, khối, khu vực (xưởng, bếp, ký túc xá), kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ (cầu thang, điện, thiết bị, hóa chất, lối thoát hiểm bị chặn); nhắc nhở dùng PPE, nội quy; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('trường'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên; trường hợp nghỉ dài ngày (ví dụ nghỉ thai sản): chuyên viên xác nhận.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ trưởng xưởng vừa quản lý vừa dạy trên máy: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Học sinh, sinh viên, người học nghề thực hành tại xưởng** là trường hợp riêng theo Luật ATVSLĐ; chuyên viên xác nhận cách huấn luyện.',
    ],
    canBo: {
      tieuDe: 'Trường cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2) và y tế (Nhóm 5)?',
      dan: 'Điều 36, 37 Nghị định 39/2016/NĐ-CP viết cho cơ sở sản xuất, kinh doanh; cách áp dụng cho trường công lập, tư thục '
        + 'do chuyên viên xác nhận. Mức tham chiếu (khoản 2):',
      tieuDeCotNhan: 'Bố trí',
      rongCotNhan: 2000,
      cot: ['Dưới 300 lao động', 'Từ 300 đến dưới 500', 'Từ 500 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['Người làm công tác ATVSLĐ ({{2}})',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '01 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 02 người **chuyên trách**'],
        ['Người làm công tác y tế ({{5}})',
          '01 người trung cấp y', '01 người trung cấp y', '01 y sĩ và 01 người trung cấp y',
          '01 bác sĩ và 01 người làm y tế khác'],
      ],
      ghiChu: 'Không bố trí được người đủ tiêu chuẩn thì có thể thuê tổ chức đủ năng lực; chuyên ngành sư phạm không thuộc khối '
        + 'kỹ thuật. Y tế trường học chăm sóc sức khỏe học sinh là quy định riêng, khác huấn luyện Nhóm 5.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (trường, khoa, phòng, ban, xưởng, cơ sở) hoặc phụ trách bộ phận chuyên môn, kỹ thuật, quản trị?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp vận hành máy ở xưởng thực hành, hàn, làm điện; dùng hóa chất nguy hiểm ở phòng thí nghiệm, bể bơi; nấu ăn tại bếp từ 300 suất/ngày; lái xe ô tô; vận hành thang máy, nồi hơi; làm việc trên cao, trong bể phốt, bể ngầm; cứu hộ?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ tịch hội đồng trường, chủ trường tư thục; hiệu trưởng, giám đốc', '1', 'Người đứng đầu đơn vị.'],
      ['Phó hiệu trưởng, phó giám đốc; giám đốc phân hiệu; trưởng phòng, ban', '1', 'Cấp phó, phó phòng: khi được giao phụ trách.'],
      ['Trưởng khoa, trưởng bộ môn, giám đốc viện, trung tâm trực thuộc', '1', 'Chuyên viên xác nhận theo cơ cấu tổ chức.'],
      ['Tổ trưởng, tổ phó chuyên môn; khối trưởng', '4', 'Nên học thêm Nhóm 6; có thể xem xét Nhóm 1.'],
      ['Trưởng xưởng thực hành, trưởng phòng thí nghiệm, trưởng bộ phận kỹ thuật', '1', 'Vận hành máy, dùng hóa chất: thêm Nhóm 3.'],
      ['B. GIÁO VIÊN, GIẢNG VIÊN, MẦM NON'],
      ['Giáo viên phổ thông; giảng viên lý thuyết, trợ giảng; giáo viên trung tâm; giáo vụ', '4', 'Lực lượng đông nhất; phòng thí nghiệm: khối D.'],
      ['Giáo viên mầm non, bảo mẫu, nhân viên nuôi dưỡng, chăm sóc trẻ', '4', 'Nâng, bế, vệ sinh, bệnh truyền nhiễm.'],
      ['Nhân viên chăm sóc trẻ khuyết tật, trẻ cần hỗ trợ đặc biệt', '4 hoặc 3', 'Chăm sóc người khuyết tật: chuyên viên xác nhận.'],
      ['Giáo viên thể dục; huấn luyện viên thể thao (trường năng khiếu)', '4', 'Huấn luyện viên chuyên nghiệp: chuyên viên xác nhận.'],
      ['C. XƯỞNG THỰC HÀNH NGHỀ'],
      ['Giáo viên, kỹ thuật viên xưởng thực hành cơ khí (tiện, phay, mài, CNC), hàn, cắt', '3', 'Máy gia công, hàn cắt thuộc Danh mục.'],
      ['Giáo viên thực hành điện, điện tử công suất, điện lạnh, tự động hóa', '3', 'Thêm huấn luyện an toàn điện.'],
      ['Giáo viên thực hành ô tô, sửa chữa xe; giáo viên dạy lái xe', '3', 'Lái, sửa chữa ô tô thuộc Danh mục.'],
      ['Giáo viên thực hành xây dựng, mộc, may và nghề khác có máy', '3 hoặc 4', 'Chuyên viên xác nhận theo máy.'],
      ['Giáo viên dạy thực hành nấu ăn (bếp thực hành)', '4', 'Bếp từ 300 suất/ngày: Nhóm 3.'],
      ['D. PHÒNG THÍ NGHIỆM, BỂ BƠI'],
      ['Giáo viên, giảng viên, kỹ thuật viên phòng thí nghiệm hóa, sinh, lý, vật liệu', '3 hoặc 4', 'Hóa chất nguy hiểm thường xuyên: Nhóm 3.'],
      ['Phòng thí nghiệm vi sinh, xét nghiệm; vận hành máy X-quang (trường y)', '3', 'Chuyên viên xác nhận theo công việc.'],
      ['Nhân viên bể bơi: xử lý nước, hóa chất, máy bơm, lọc; cứu hộ', '3 hoặc 4', 'Hóa chất, cứu hộ: chuyên viên xác nhận.'],
      ['E. AN TOÀN, Y TẾ, VĂN PHÒNG, HỖ TRỢ'],
      ['Trưởng bộ phận an toàn, quản trị; cán bộ ATVSLĐ chuyên trách, kiêm nhiệm', '2', 'Trưởng bộ phận: học thêm Nhóm 1.'],
      ['Nhân viên y tế học đường (bác sĩ, y sĩ, điều dưỡng, y tá)', '5', 'Y tế chăm sóc học sinh: quy định riêng.'],
      ['An toàn, vệ sinh viên (đại diện tổ, khối, khu vực)', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['Kế toán, hành chính, văn thư, nhân sự, IT, tuyển sinh, thư viện, ký túc xá', '4', 'Lao động văn phòng; viên chức cũng áp dụng.'],
      ['Bảo vệ cổng, ký túc xá, trực đêm; lao công, tạp vụ', '4', 'Hóa chất tẩy rửa, khử trùng, trơn trượt.'],
      ['Thủ kho thiết bị, vật tư; kho thực phẩm, giao nhận thực phẩm', '4 hoặc 3', 'Bốc xếp thường xuyên từ 30 kg: Nhóm 3.'],
      ['F. BẾP ĂN, XE ĐƯA ĐÓN, KỸ THUẬT'],
      ['Nhân viên bếp bán trú (cô nuôi, đầu bếp, phụ bếp) dưới 300 suất/ngày; căng tin', '4', 'Bỏng, dao, gas, điện, trơn trượt.'],
      ['Nhân viên bếp ăn tập thể từ 300 suất/ngày trở lên', '3', 'Bếp thuê ngoài: nhà thầu huấn luyện.'],
      ['Lái xe đưa đón học sinh, xe buýt trường, xe văn phòng, xe tải', '3', 'Lái xe ô tô thuộc Danh mục.'],
      ['Phụ xe, người giám sát, hướng dẫn học sinh trên xe', '4', 'Chuyên viên xác nhận theo công việc.'],
      ['Thợ điện, trạm biến áp; thợ cơ khí, hàn; sửa chữa công trình, trên cao từ 2 m', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Vận hành thang máy, nồi hơi, bình áp lực; điều hòa, hệ thống lạnh', '3', 'Thiết bị phải kiểm định.'],
      ['Xử lý nước thải, bể nước ngầm, bể phốt; vệ sinh bể, hầm; lau kính nhà cao tầng', '3', 'Không gian hạn chế, trên cao.'],
      ['G. THỈNH GIẢNG, NHÀ THẦU, KHÁCH'],
      ['Thỉnh giảng, hợp đồng ngắn hạn, chuyên gia nước ngoài; thực tập sinh, tình nguyện viên', 'Theo công việc', 'Chuyên viên làm rõ trách nhiệm huấn luyện.'],
      ['Nhà thầu suất ăn, bảo vệ, vệ sinh, xe đưa đón, bảo trì; lao động thuê lại', 'Theo công việc', 'Nhà thầu huấn luyện người của mình.'],
      ['Phụ huynh, khách, đoàn kiểm tra, thợ sửa chữa thuê ngoài', '—', 'Không thuộc 6 nhóm; phổ biến nội quy.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, và làm rõ ai là người lao động của trường, ai là người của nhà thầu.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG CƠ SỞ GIÁO DỤC: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao trường học chỉ có ít người thuộc Nhóm 3?** Giảng dạy lý thuyết không thuộc Danh mục công việc có yêu cầu '
      + 'nghiêm ngặt về ATVSLĐ (Thông tư 06/2020/TT-BLĐTBXH). Nhóm 3 chỉ áp dụng cho người trực tiếp vận hành máy gia công, hàn, '
      + 'điện; dùng hóa chất nguy hiểm; nấu ăn tại bếp từ 300 suất/ngày; lái xe ô tô; vận hành thang máy, nồi hơi; làm việc '
      + 'trên cao, trong không gian hạn chế; cứu hộ chuyên nghiệp.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại trường:',
    nghe: [
      ['Xưởng thực hành', 'Cơ khí, hàn, điện, ô tô',
        'Nguy cơ theo máy: tiện, phay, mài, hàn, cắt, ép, khoan; điện, khí nén, tia hàn; che chắn, dừng khẩn cấp, khóa nguồn khi bảo trì; vị trí đứng, giám sát khi hướng dẫn nhiều học viên.'],
      ['Phòng thí nghiệm', 'Hóa, sinh, vi sinh',
        'Nhãn GHS, bảng dữ liệu an toàn; bảo quản, tách nhóm hóa chất; tủ hút; xử lý đổ tràn, thu gom chất thải; chai khí, tủ sấy, lò; sinh học, bức xạ (nếu có); sơ cứu dính hóa chất.'],
      ['Bếp ăn tập thể', 'Bếp từ 300 suất/ngày',
        'Bỏng nhiệt và hơi, dao, gas, điện, trơn trượt, mang vác; nồi, lò, máy thái, máy trộn: kiểm tra trước ca; cháy dầu mỡ, gas; sơ tán; găng, giày chống trượt; sơ cứu bỏng.'],
      ['Lái xe đưa đón', 'Xe đưa đón, xe của trường',
        'Điểm mù, đông người, giờ cao điểm ở cổng trường; kiểm tra xe trước ca; sức khỏe, mệt mỏi của lái xe; xử lý sự cố, cháy, tai nạn; phối hợp với bảo vệ, phụ xe; sơ cứu ban đầu.'],
      ['Bể bơi', 'Xử lý nước, cứu hộ',
        'Lưu trữ, pha, nạp hóa chất xử lý nước (clo...), PPE, xử lý rò rỉ; máy bơm, hệ thống lọc, điện trong môi trường ẩm ướt; cứu hộ: phối hợp, báo động, sơ cấp cứu.'],
      ['Kỹ thuật, bảo trì', 'Điện, thang máy, nồi hơi',
        'Cô lập nguồn, khóa và gắn thẻ, kiểm tra không điện; thang máy: không tự xử lý khi kẹt; nồi hơi, bình áp lực: van an toàn, áp kế, nhật ký; trên cao: thang, dây đai; hàn, cắt.'],
      ['Bể phốt, vệ sinh', 'Bể phốt, bể ngầm, hố ga',
        'Không gian hạn chế: đo khí, thông gió, giám sát bên ngoài, cứu hộ; hóa chất xử lý nước; lau kính nhà cao tầng: trên cao, dây an toàn; cắt tỉa cây: máy cắt, điện.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy loại hình, quy mô và cơ sở vật chất của trường, có thể cần thêm các nội dung sau; chuyên viên Viện STP – DAKO '
      + 'sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện sơ cấp cứu', 'Phòng y tế, đội sơ cấp cứu của trường: ngã, bỏng, dính hóa chất, chấn thương ở xưởng.'],
      ['Huấn luyện an toàn điện', 'Nhân viên điện, kỹ thuật bảo trì, trạm biến áp; xưởng thực hành; giáo viên dạy điện.'],
      ['Huấn luyện an toàn hóa chất', 'Phòng thí nghiệm, xưởng, hóa chất vệ sinh, khử trùng, xử lý nước bể bơi.'],
      ['Kiểm định kỹ thuật an toàn', 'Thang máy, nồi hơi, bình áp lực, bình khí nén, hệ thống lạnh, palăng, cầu trục.'],
      ['Quan trắc môi trường lao động', 'Xưởng thực hành (ồn, bụi, hơi hàn), phòng thí nghiệm, bếp (nhiệt), bể bơi.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Theo khu vực: xưởng, phòng thí nghiệm, bếp bán trú, bể bơi, khu kỹ thuật.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Cân phân tích, thiết bị đo ở phòng thí nghiệm, trung tâm kiểm định, xưởng.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Trường quốc tế, tư thục, đối tác có yêu cầu; liên kết đào tạo nghề ngắn hạn.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Trường công lập, giáo viên là viên chức, có phải huấn luyện ATVSLĐ không?',
      'Có. Luật ATVSLĐ áp dụng cả với cán bộ, công chức, viên chức; viên chức có quyền và nghĩa vụ ATVSLĐ như người lao động, trừ khi văn bản áp dụng riêng có quy định khác. Nhóm huấn luyện xác định theo công việc; cách áp dụng cho đơn vị sự nghiệp công lập do chuyên viên xác nhận.'],
    ['Viện có huấn luyện an toàn cho học sinh không?',
      'Không. Viện huấn luyện ATVSLĐ cho người lao động của trường (giáo viên, nhân viên). An toàn trường học, phòng chống tai nạn thương tích, đuối nước, kỹ năng sinh tồn, an toàn thực phẩm bán trú, y tế học đường cho học sinh là quy định riêng; chuyên viên ghi nhận để phối hợp đơn vị phù hợp.'],
    ['Giáo viên học 16 giờ, lại học định kỳ hằng năm: tổ chức thế nào?',
      'Giáo viên thuộc Nhóm 4: lần đầu tối thiểu 16 giờ, định kỳ hằng năm tối thiểu 50% thời gian lần đầu. Có thể tổ chức gọn vào dịp hè, trước khai giảng hoặc ngày sinh hoạt chuyên môn, chia theo tổ, khối, tại trường; lịch cụ thể do chuyên viên thiết kế.'],
    ['Giáo viên thực hành có phải Nhóm 3? Còn học viên thực hành thì sao?',
      'Giáo viên trực tiếp vận hành, hướng dẫn trên máy gia công, hàn, điện, ô tô thuộc Nhóm 3. Học sinh, sinh viên, người học nghề có điều riêng trong Luật ATVSLĐ; cách huấn luyện và trách nhiệm do chuyên viên làm rõ.'],
    ['Phòng thí nghiệm chỉ có vài hóa chất cơ bản, có phải Nhóm 3?',
      'Phụ thuộc hóa chất có thuộc phân loại nguy hiểm theo GHS hay không và mức độ tiếp xúc trực tiếp, thường xuyên. Nhà trường chuẩn bị danh mục hóa chất kèm bảng dữ liệu an toàn để chuyên viên đánh giá; nhiều trường hợp là Nhóm 4 kèm huấn luyện an toàn hóa chất.'],
    ['Bếp bán trú, bảo vệ, vệ sinh thuê công ty dịch vụ: ai huấn luyện?',
      'Công ty dịch vụ là người sử dụng lao động, chịu trách nhiệm huấn luyện cho người của mình; nhà trường kiểm tra hồ sơ trước khi cho vào làm việc. Nếu là nhân viên của trường thì trường chịu trách nhiệm. Bếp từ 300 suất/ngày: người trực tiếp nấu thuộc Nhóm 3.'],
    ['Người kiêm nhiệm ATVSLĐ tốt nghiệp sư phạm được không? Trường cần mấy người?',
      'Người được giao làm công tác ATVSLĐ phải học Nhóm 2; tiêu chuẩn bằng cấp khối kỹ thuật là điều kiện riêng, chuyên ngành sư phạm có thể không đáp ứng. Mức bố trí ở mục 1 là mức tham chiếu; chuyên viên xác nhận cách áp dụng cho từng loại trường.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm, không thừa; có thể ưu tiên Nhóm 1, 2, 5 và các vị trí Nhóm 3 trước. Trường công lập: Viện cung cấp hồ sơ năng lực, báo giá theo quy trình của trường.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo tổ, khoa, khu vực.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch vào dịp hè, trước khai giảng.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Đoàn kiểm tra, đối tác'),
      ['Huấn luyện tại trường',
        'Tổ chức vào dịp hè, trước khai giảng hoặc ngày sinh hoạt chuyên môn; chia theo tổ, khối, khoa; thực hành tại xưởng, phòng thí nghiệm, bếp của trường.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      ['Luật An toàn, vệ sinh lao động số 84/2015/QH13', 'Áp dụng cả với cán bộ, công chức, viên chức (Điều 2, 6); điều riêng cho học sinh, sinh viên, người học nghề; an toàn, vệ sinh viên (Điều 74).'],
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 30–32, 36, 37)', 'Lao động thuê lại; bố trí người làm công tác ATVSLĐ và y tế theo quy mô (mức tham chiếu, chuyên viên xác nhận cách áp dụng cho trường).'],
      DANH_MUC,
      ['Thông tư liên tịch 13/2016/TTLT-BYT-BGDĐT; Thông tư 33/2021/TT-BYT', 'Y tế trường học (chăm sóc sức khỏe học sinh, sinh viên): quy định riêng, khác huấn luyện ATVSLĐ Nhóm 5.'],
      ['Thông tư 19/2016/TT-BYT', 'Quản lý vệ sinh lao động, sức khỏe người lao động, sơ cấp cứu; quan trắc môi trường lao động.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('18/10/2026',
      'đang được trình Quốc hội, dự kiến xem xét tại kỳ họp tháng 10/2026 theo trình tự rút gọn; dự án chưa có hiệu lực'),
  },
};
