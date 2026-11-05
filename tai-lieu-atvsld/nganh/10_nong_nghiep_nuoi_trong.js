// Nội dung tài liệu số 10 – Ngành Nông nghiệp – Nuôi trồng.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành Nông nghiệp – Nuôi trồng" (bản cho nhân viên kinh doanh, thông tin pháp lý đến 17/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Ngành này áp dụng khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP (bảng bố trí một dòng, 3 mức như tài liệu 02, 06, 08).
// Cẩm nang còn dẫn Thông tư 05/2021/TT-BCT và Nghị định 113/2017/NĐ-CP; hai văn bản này đã được thay thế nên không đưa vào.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '10',
  tenFile: '10_NongNghiepNuoiTrong_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Nông nghiệp – Nuôi trồng (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp nông nghiệp – nuôi trồng – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Nông nghiệp – Nuôi trồng',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH NÔNG NGHIỆP – NUÔI TRỒNG',
    gioiThieu: 'Trang trại, nông trường, vùng nuôi và xưởng sơ chế có lao động làm việc ngoài trời, rải rác, theo mùa vụ, '
      + 'tiếp xúc trực tiếp với hóa chất, máy móc, điện, nước và động vật. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh sáu '
      + 'nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị '
      + 'sẵn thông tin cho buổi làm việc với chuyên viên của Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP NÔNG NGHIỆP – NUÔI TRỒNG CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động mùa vụ, thử việc, học nghề. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Làm nông nghiệp không mặc nhiên là {{3}}:** chăm sóc, thu hoạch, cạo mủ, cho ăn thông thường thuộc {{4}}. {{3}} dành cho người phun thuốc, vận hành máy nông nghiệp, vệ sinh chuồng trại, làm điện ở ao, làm việc trên mặt nước, lái xe, bốc xếp từ 30 kg.',
      '**Kinh nghiệm không thay thế huấn luyện:** công nhân phun thuốc bảo vệ thực vật “làm lâu, đã quen” vẫn thuộc {{3}}; nhãn thuốc có hướng dẫn cũng không thay thế việc huấn luyện theo quy định.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; người nghỉ việc hoặc trại, xưởng ngừng hoạt động từ 6 tháng trở lên phải huấn luyện lại.',
      '**Chứng nhận GAP không thay thế huấn luyện ATVSLĐ:** hồ sơ huấn luyện được xem khi thanh tra, khi xảy ra tai nạn, ngộ độc và khi đối tác thu mua kiểm tra. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('trang trại, nông trường, vùng nuôi, lâm trường và xưởng sơ chế'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ trang trại, chủ doanh nghiệp, giám đốc nông trường, vùng trồng, vùng nuôi; phó giám đốc được giao phụ trách; trại trưởng, quản đốc xưởng sơ chế, đội trưởng sản xuất; trưởng phòng kỹ thuật, thú y.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu khi có tai nạn, ngộ độc; tổ chức bộ máy ATVSLĐ cho nhiều trại; kế hoạch hằng năm theo mùa vụ; đánh giá rủi ro (thuốc bảo vệ thực vật, máy, điện ở ao, chuồng trại); điều tra tai nạn; văn hóa an toàn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: cán bộ ATVSLĐ, HSE chuyên trách hoặc bán chuyên trách, kiêm nhiệm (thường là kỹ sư nông học, thú y, thủy sản); người trực tiếp giám sát ATVSLĐ.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kỹ thuật an toàn đặc thù (hóa chất, máy nông nghiệp, điện, không gian hạn chế, mặt nước); kiểm tra, đánh giá rủi ro tại hiện trường; điều tra tai nạn, ứng cứu khẩn cấp; quản lý hồ sơ lao động mùa vụ.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: phun, pha chế thuốc bảo vệ thực vật, thủ kho thuốc; vận hành máy tuốt, gặt, cắt cỏ, bơm nước; vệ sinh chuồng trại, hầm biogas; làm điện ở ao; lồng bè, lặn; khai thác gỗ; máy xay xát, sấy, nồi hơi; lái xe.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả mùa vụ, thử việc, học nghề: công nhân chăm sóc, làm cỏ, thu hoạch, cạo mủ; nuôi dưỡng heo, gà; công nhân ao, trại giống; sơ chế, đóng gói thủ công; kỹ sư hiện trường; bảo vệ, văn phòng, bán hàng.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nắng nóng, say nắng; dụng cụ cầm tay; rắn cắn, động vật húc, đạp; đuối nước, điện ở ao (nhận thức); mang vác đúng kỹ thuật; phòng bệnh lây từ động vật, Leptospira; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: nhân viên y tế, y tá, người phụ trách trạm y tế của nông trường, trang trại.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn lao động (ngộ độc thuốc, đuối nước, điện giật, rắn cắn, say nắng); quản lý sức khỏe người lao động; bệnh nghề nghiệp; xử lý tình huống khẩn cấp ở nơi xa cơ sở y tế.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: công nhân có uy tín, nắm công việc, được chọn ở từng trại, đội, tổ hoặc ca, kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ (thuốc để sai chỗ, dây điện ở ao, máy thiếu che chắn, hầm chưa đo khí); nhắc nhở; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('trang trại, vùng nuôi, xưởng sơ chế'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – hay gặp ở trại, xưởng nghỉ theo mùa rồi mở lại và lao động mùa vụ quay lại làm.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ trại trưởng trực tiếp phun thuốc: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ từ chăm sóc sang phun thuốc hoặc lái máy) thì người lao động cần được huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp nông nghiệp cần mấy người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Trồng trọt, chăn nuôi, thủy sản, lâm nghiệp và sơ chế nông sản thuộc nhóm “cơ sở khác” tại khoản 2 Điều 36 Nghị định '
        + '39/2016/NĐ-CP (trừ cơ sở có thêm hoạt động thuộc ngành đặc thù như hóa chất, phân bón). Mức tối thiểu:',
      bang: [
        ['Dưới 300 lao động', '01 người **bán chuyên trách**'],
        ['Từ 300 đến dưới 1.000', '01 người **chuyên trách**'],
        ['Từ 1.000 trở lên', 'Phòng ATVSLĐ hoặc ít nhất 02 người **chuyên trách**'],
      ],
      ghiChu: 'Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2 và đáp ứng tiêu chuẩn riêng về trình độ, kinh nghiệm '
        + '(Điều 36). Chuyên ngành nông học, thú y, thủy sản có thuộc khối kỹ thuật hay không, cách tính lao động khi có nhiều '
        + 'trại và lao động mùa vụ: chuyên viên Viện STP – DAKO rà soát, xác nhận.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, trang trại, nông trường, xưởng, phòng ban) hoặc phụ trách bộ phận sản xuất, kỹ thuật, quản đốc?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ tại nơi làm việc?  →  {{2}}',
      'Trực tiếp dùng, bảo quản hóa chất nguy hiểm (thuốc bảo vệ thực vật, khử trùng); vận hành máy có động cơ trong nông nghiệp, máy xay xát, sấy, nồi hơi; làm việc trên cao từ 2 m, trên mặt nước; vệ sinh chuồng trại, không gian hạn chế; làm điện; lái xe ô tô; bốc xếp từ 30 kg?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ trang trại, chủ doanh nghiệp, chủ tịch HĐQT, tổng giám đốc, giám đốc', '1', 'Người đứng đầu đơn vị.'],
      ['Phó giám đốc; giám đốc nông trường, trại trưởng, quản đốc, đội trưởng, trưởng phòng', '1', 'Cấp phó, phó phòng: khi được giao phụ trách.'],
      ['Tổ trưởng tổ chăm sóc, thu hoạch', '4 hoặc 1', 'Phụ trách một bộ phận: Nhóm 1; chuyên viên rà soát.'],
      ['B. KỸ THUẬT, VĂN PHÒNG, AN TOÀN, Y TẾ'],
      ['Kỹ sư nông học, bảo vệ thực vật, thú y, thủy sản; QA/QC, cán bộ GAP, thu mẫu', '4', 'Thêm nội dung theo công việc hiện trường.'],
      ['Nhân viên phòng thí nghiệm (kiểm nghiệm nước, đất, bệnh, vi sinh)', '4 hoặc 3', 'Hóa chất nguy hiểm, vi sinh: chuyên viên rà soát.'],
      ['Thú y hiện trường: tiêm phòng, mổ khám, lấy mẫu', '4 hoặc 3', 'Tiêu hủy động vật dịch: Nhóm 3; chuyên viên xác nhận.'],
      ['Kế toán, hành chính, nhân sự, thu mua, kinh doanh, nhân viên cân', '4', 'Làm việc văn phòng hoặc tại điểm thu mua.'],
      ['Bán thuốc bảo vệ thực vật, thuốc thú y, thức ăn; thủ kho vật tư', '4 hoặc 3', 'Bảo quản, vận chuyển hóa chất nguy hiểm: Nhóm 3.'],
      ['Trưởng bộ phận HSE; cán bộ ATVSLĐ chuyên trách, bán chuyên trách, kiêm nhiệm', '2', 'Trưởng bộ phận: học thêm Nhóm 1 (quản lý).'],
      ['Nhân viên y tế, y tá, trạm y tế nông trường', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên từng trại, đội, tổ, ca', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['C. TRỒNG TRỌT, NHÀ MÀNG, LÂM NGHIỆP'],
      ['Chăm sóc, làm cỏ, bón phân, tưới, thu hoạch, cạo mủ cao su; nhà màng; trồng rừng', '4', 'Dùng hóa chất nguy hiểm: chuyên viên xem xét.'],
      ['Hái, cắt tỉa trên cây cao; làm việc trên mái nhà màng, silo, tháp nước', '3 hoặc 4', 'Trên cao từ 2 m: theo độ cao, tần suất.'],
      ['Phun, pha chế thuốc bảo vệ thực vật; thủ kho thuốc, hóa chất nguy hiểm', '3', 'Thêm huấn luyện an toàn hóa chất.'],
      ['Vận hành máy tuốt, máy gặt, máy bừa, máy cắt cỏ, máy phun, máy bơm nước', '3', 'Máy có động cơ trong nông nghiệp.'],
      ['Lái máy cày, máy kéo', 'Ranh giới', 'Chưa nêu tên trong Danh mục; chuyên viên xác nhận.'],
      ['Khai thác gỗ rừng trồng (chặt, cưa, xẻ); điều tra, quy hoạch rừng', '3', 'Điều tra, quy hoạch rừng: chuyên viên xác nhận.'],
      ['D. CHĂN NUÔI'],
      ['Nuôi dưỡng heo, gà, vịt, bò; vắt sữa, phối giống, đỡ đẻ', '4 hoặc 3', 'Động vật lớn (bò): chuyên viên xác nhận.'],
      ['Vệ sinh chuồng trại; khử trùng chuồng trại', '3', 'Chuyên viên xác nhận phạm vi công việc.'],
      ['Hầm biogas; xử lý chất thải, nước thải', '3', 'Không gian hạn chế.'],
      ['Giết mổ tại trại; tiêu hủy động vật dịch', '3', 'Theo Danh mục.'],
      ['Vận hành máy nghiền, trộn thức ăn, băng tải', '3', 'Máy gia công, băng tải.'],
      ['E. NUÔI TRỒNG THỦY SẢN'],
      ['Công nhân ao, bể, trại giống: cho ăn, đo môi trường, thay nước, thu hoạch', '4 hoặc 3', 'Trên mặt nước bằng xuồng, bè: Nhóm 3.'],
      ['Công nhân lồng bè trên sông, biển; nuôi hàu giàn; thợ lặn', '3', 'Công việc trên mặt nước, lặn.'],
      ['Vận hành quạt nước, sục khí, máy phát điện; thợ điện ao', '3', 'Máy bơm nước: chuyên viên xác nhận.'],
      ['Xử lý ao bằng hóa chất; khử trùng ao, bể', '3', 'Hóa chất nguy hiểm; khử trùng môi trường.'],
      ['Vận hành hệ thống lạnh, máy đá, kho lạnh', '3 hoặc 4', 'Thiết bị áp lực: chuyên viên xác nhận.'],
      ['F. SƠ CHẾ, KHO, CƠ ĐIỆN, HẬU CẦN'],
      ['Vận hành máy xay xát, sấy, bóc vỏ, đóng bao, băng tải; chế biến mủ cao su', '3', 'Quy mô nhỏ không loại trừ.'],
      ['Vận hành nồi hơi, lò sấy áp lực, xe nâng', '3', 'Thiết bị phải kiểm định.'],
      ['Sơ chế, phân loại, đóng gói thủ công', '4', 'Vận hành máy thuộc Danh mục: Nhóm 3.'],
      ['Bốc xếp bao thức ăn, phân bón, nông sản; nhân viên kho', '3 hoặc 4', 'Nhóm 3 khi thường xuyên bốc xếp từ 30 kg.'],
      ['Thợ điện, thợ cơ khí, sửa máy; thợ hàn, cắt', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Lái xe tải, xe bồn, xe chở thức ăn, nông sản; thợ sửa xe', '3', 'Bằng lái xe không thay thế huấn luyện Nhóm 3.'],
      ['Bảo vệ, lao công, tạp vụ; nhân viên bếp ăn tập thể', '4 hoặc 3', 'Bếp ăn từ 300 suất/ngày trở lên: Nhóm 3.'],
      ['G. MÙA VỤ, KHOÁN, ĐỐI TÁC, KHÁCH'],
      ['Lao động mùa vụ có hợp đồng lao động; thử việc, học nghề, tập nghề', 'Theo công việc', 'Phun thuốc, vận hành máy: Nhóm 3 dù ngắn ngày.'],
      ['Nhân công khoán, công nhật, đổi công; hộ liên kết, nông dân bao tiêu', 'Ranh giới', 'Không mặc nhiên là người lao động của công ty.'],
      ['Đội phun thuốc, thu hoạch, vận chuyển thuê; nhà thầu dịch vụ', 'Theo công việc', 'Đơn vị sử dụng lao động của họ huấn luyện.'],
      ['Thực tập sinh, sinh viên; khách tham quan', 'Ranh giới', 'Khách không thuộc 6 nhóm; phổ biến nội quy.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG NÔNG NGHIỆP: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao làm nông nghiệp không mặc nhiên là Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông tư '
      + '06/2020/TT-BLĐTBXH) chỉ nêu một số việc: dùng, bảo quản hóa chất nguy hiểm; máy có động cơ trong nông nghiệp (máy tuốt, '
      + 'gặt, bừa, cắt cỏ, phun thuốc, bơm nước); vệ sinh chuồng trại, không gian hạn chế; trên mặt nước, trên cao; điện; lái '
      + 'xe; chặt, cưa, xẻ gỗ; giết mổ; chế biến mủ cao su. Chăm sóc, thu hoạch thông thường thuộc Nhóm 4.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại trang trại, vùng nuôi:',
    nghe: [
      ['Thuốc, hóa chất', 'Phun, pha chế, kho thuốc; khử trùng',
        'Đọc nhãn, bảng dữ liệu an toàn; pha đúng liều, hướng gió, thời điểm phun; PPE, giặt, cất sau phun; kho tách khỏi thực phẩm, thức ăn; đổ tràn; dấu hiệu ngộ độc, sơ cứu.'],
      ['Máy nông nghiệp', 'Máy tuốt, gặt, cắt cỏ, bơm; cưa',
        'Bộ phận quay, lưỡi cắt, kẹp cuốn, lật máy; kiểm tra trước khi chạy; tắt máy trước khi sửa, gỡ vướng; địa hình dốc, ướt; kính, bịt tai, găng; khoảng cách an toàn khi chặt cây.'],
      ['Chuồng trại, biogas', 'Vệ sinh chuồng; hầm, bể chất thải',
        'Khí độc (hydro sunfua, amoniac, mê-tan), thiếu oxy, nổ; đo khí, thông gió, người giám sát, dây cứu hộ, không xuống cứu một mình; hóa chất khử trùng; bệnh lây từ động vật.'],
      ['Ao nuôi, trại giống', 'Điện ở ao; hóa chất xử lý ao',
        'Điện giật khi tay ướt, dây trần, ổ cắm ngoài trời; ngắt điện khi sửa, thiết bị chống giật; đuối nước, không đi một mình ban đêm; pha, bảo quản clo, vôi, thuốc sát trùng.'],
      ['Lồng bè, mặt nước', 'Bè trên sông, biển; lặn',
        'Ngã xuống nước, sóng gió, dây neo; áo phao, thiết bị cứu sinh, không làm một mình khi gió lớn; điện, gas, nhiên liệu trên bè; sơ cứu đuối nước, hạ thân nhiệt; liên lạc khẩn cấp.'],
      ['Sơ chế, kho', 'Xay xát, sấy; nồi hơi; xe nâng',
        'Che chắn băng tải, ngắt nguồn trước khi vệ sinh, gỡ vướng; nồi hơi, lò sấy: van an toàn, kiểm định; xe nâng: tải trọng, lối đi; bao nặng; bụi, ồn, nhiệt; hóa chất đông tụ mủ.'],
      ['Điện, cơ khí, lái xe', 'Thợ điện, hàn; xe chở hàng',
        'Cô lập nguồn, kiểm tra không điện, tiếp địa; tủ điện ngoài trời kín nước; hàn cắt: cháy nổ, chai khí; sửa máy: giữ vững, nâng đỡ; lái xe đường nông thôn, dốc; kiểm tra xe.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy quy mô, loại hình và thiết bị của trang trại, vùng nuôi, xưởng sơ chế, doanh nghiệp có thể cần thêm các nội dung '
      + 'sau; chuyên viên Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu ở trại xa cơ sở y tế: ngộ độc, đuối nước, rắn cắn, say nắng.'],
      ['Huấn luyện an toàn điện', 'Thợ điện; điện ở ao (quạt nước, sục khí, bơm), chuồng trại, xưởng sơ chế.'],
      ['Huấn luyện an toàn hóa chất', 'Thuốc bảo vệ thực vật, hóa chất khử trùng, xử lý ao, phân bón hóa học.'],
      ['Kiểm định kỹ thuật an toàn', 'Nồi hơi (sấy, chế biến), bình áp lực, chai khí, xe nâng.'],
      ['Quan trắc môi trường lao động', 'Bụi xay xát, thức ăn; tiếng ồn máy; nóng trong nhà màng; amoniac ở chuồng.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Chuồng trại, hầm biogas, ao, lồng bè, kho thuốc; kế hoạch ứng phó khẩn cấp.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Trang trại công nghệ cao: thiết bị đo nhiệt độ, độ ẩm, khí; phòng kiểm nghiệm.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Xuất khẩu, chuỗi thu mua, yêu cầu ESG; đào tạo nghề vận hành máy, thợ điện.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Nông nghiệp là công việc quen thuộc, có được miễn huấn luyện không?',
      'Không. Mọi người lao động theo hợp đồng lao động, kể cả thử việc, học nghề, đều thuộc một trong sáu nhóm. Người phun thuốc, vận hành máy, vệ sinh chuồng trại thuộc Nhóm 3 dù làm lâu năm: kinh nghiệm không thay thế huấn luyện theo quy định.'],
    ['Lao động mùa vụ chỉ làm vài tuần, có phải huấn luyện không?',
      'Có, nếu họ làm theo hợp đồng lao động: họ được xếp nhóm theo công việc dù ngắn ngày (thường là Nhóm 4; phun thuốc, vận hành máy là Nhóm 3). Viện STP – DAKO có thể huấn luyện theo đợt trước mùa vụ.'],
    ['Nhân công khoán, đội thuê ngoài: ai huấn luyện?',
      'Đối tượng theo quy định là người lao động theo hợp đồng lao động, thử việc, học nghề; nhân công khoán, hộ liên kết không mặc nhiên là người lao động của công ty. Đội thuê ngoài do đơn vị sử dụng lao động của họ huấn luyện; bên thuê kiểm tra hồ sơ, phổ biến nội quy. Chuyên viên xác nhận theo từng mô hình.'],
    ['Máy cày, máy kéo, máy bơm nước có thuộc Nhóm 3 không?',
      'Danh mục nêu máy tuốt, máy gặt, máy bừa, máy cắt cỏ, máy phun thuốc bảo vệ thực vật và máy bơm nước. Máy cày, máy kéo không được nêu tên; phạm vi với máy bơm ở ao, ruộng cũng cần xem xét. Chuyên viên xác nhận theo loại máy, công suất.'],
    ['Công nhân nuôi heo, gà, nuôi bò có phải Nhóm 3?',
      'Người vệ sinh chuồng, giết mổ, tiêu hủy động vật dịch thuộc Nhóm 3. Nuôi heo, gà thường là Nhóm 4; nuôi bò nhiều khả năng thuộc nhóm “chăn nuôi các động vật lớn” của Danh mục. Chuyên viên xác nhận theo loài, quy mô, công việc.'],
    ['Đã có chứng nhận GAP, còn phải huấn luyện ATVSLĐ không?',
      'Có. Chứng nhận tự nguyện, quy định chuyên ngành (thuốc bảo vệ thực vật, thú y, an toàn sinh học) và nghĩa vụ huấn luyện ATVSLĐ là các việc khác nhau, không thay thế nhau. Hồ sơ huấn luyện còn giúp trả lời đoàn đánh giá, đối tác thu mua.'],
    ['Đang mùa vụ, trại ở xa: tổ chức huấn luyện thế nào?',
      'Chia đợt nhỏ theo trại, tổ, đội; chọn thời điểm ngoài cao điểm (sau thu hoạch, trước vụ), sáng sớm hoặc chiều tối; tổ chức tại trại, nông trường, hội trường xã. Chuyên viên thiết kế lịch theo mùa vụ.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm, không thừa; có thể chia đợt, ưu tiên Nhóm 1, 2 và người phun thuốc, làm điện, vệ sinh chuồng trại trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo trại, tổ, đội, mùa vụ.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo mùa vụ, theo từng trại.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Đối tác thu mua, công ty bao tiêu, đoàn kiểm tra'),
      ['Huấn luyện tại trang trại, vùng nuôi',
        'Chia đợt theo trại, tổ, đội và theo vụ, tránh cao điểm thu hoạch; lý thuyết kết hợp thực hành tại chỗ, có thao tác mẫu và hình ảnh dễ hiểu cho công nhân.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 2, 36, 37)', 'Đối tượng áp dụng (Điều 2); bố trí người làm công tác ATVSLĐ theo quy mô (nông nghiệp: khoản 2 Điều 36); bộ phận y tế (Điều 37).'],
      DANH_MUC,
      ['Thông tư 19/2016/TT-BYT; Thông tư 15/2016/TT-BYT (sửa đổi bởi Thông tư 02/2023/TT-BYT)', 'Vệ sinh lao động, sơ cấp cứu, quan trắc môi trường lao động; danh mục bệnh nghề nghiệp được bảo hiểm (có nhiễm độc thuốc bảo vệ thực vật, Leptospira).'],
      ['Luật Trồng trọt, Luật Chăn nuôi, Luật Thủy sản, Luật Thú y, Luật Lâm nghiệp', 'Quy định chuyên ngành (thuốc bảo vệ thực vật, thuốc thú y, thức ăn, an toàn sinh học): nghĩa vụ riêng, không thay thế huấn luyện ATVSLĐ.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('17/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026, Ủy ban Thường vụ Quốc hội đã cho ý kiến ngày 23/9/2026, dự kiến trình Quốc '
      + 'hội tại Kỳ họp thứ Hai (tháng 10/2026) theo trình tự rút gọn; dự án chưa có hiệu lực'),
  },
};
