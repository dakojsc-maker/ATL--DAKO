// Nội dung tài liệu số 02 – Ngành Thực phẩm – Thủy sản.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành Thực phẩm – Thủy sản" (bản cho nhân viên kinh doanh, thông tin pháp lý đến 16/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '02',
  tenFile: '02_ThucPhamThuySan_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Thực phẩm – Thủy sản (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp thực phẩm – thủy sản – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Thực phẩm – Thủy sản',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH THỰC PHẨM – THỦY SẢN',
    gioiThieu: 'Nhà máy thực phẩm – thủy sản có rất đông công nhân, làm theo ca và theo mùa vụ, trong môi trường ẩm ướt, lạnh sâu, '
      + 'nhiều máy cắt, băng tải và hệ thống lạnh công nghiệp. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh sáu nhóm huấn luyện '
      + 'an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin cho buổi '
      + 'làm việc với chuyên viên Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP THỰC PHẨM – THỦY SẢN CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, học nghề, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn công nhân thuộc {{4}}, nhưng nhiều người thuộc {{3}}:** vận hành hệ thống lạnh, nồi hơi, máy chế biến và băng tải, lái xe nâng, dùng hóa chất, xử lý nước thải, bốc xếp thường xuyên từ 30 kg. Xếp thiếu Nhóm 3 là rủi ro; xếp thừa làm đội chi phí.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; công nhân thời vụ nghỉ từ 6 tháng trở lên phải huấn luyện lại.',
      '**Chứng nhận an toàn thực phẩm không thay thế ATVSLĐ:** HACCP, ISO 22000, BRCGS bảo vệ người tiêu dùng; huấn luyện ATVSLĐ là nghĩa vụ riêng để bảo vệ người lao động, và là hồ sơ được xem khi có thanh tra, tai nạn hoặc đánh giá của khách hàng.',
      '**Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động** theo quy định, không trừ vào lương người lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('doanh nghiệp thực phẩm – thủy sản'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý, chỉ huy: giám đốc, phó giám đốc được giao phụ trách, giám đốc nhà máy, trưởng phòng ban; quản đốc, phó quản đốc phân xưởng; trưởng ca chỉ huy một bộ phận sản xuất.',
        hocGi: 'Pháp luật và trách nhiệm của người quản lý; tổ chức bộ máy ATVSLĐ và y tế; kế hoạch ATVSLĐ hằng năm; đánh giá rủi ro đặc thù (hệ thống lạnh amoniac, nồi hơi, máy cắt, trơn trượt, lạnh sâu, hóa chất); điều tra tai nạn; ứng cứu khẩn cấp.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận và cán bộ ATVSLĐ, HSE chuyên trách hoặc bán chuyên trách; người trực tiếp giám sát ATVSLĐ tại xưởng.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kiểm tra xưởng chế biến, kho lạnh, phòng máy lạnh, khu hóa chất, khu xử lý nước thải; đánh giá rủi ro; huấn luyện tại chỗ; điều tra tai nạn, ứng cứu khẩn cấp; quản lý hồ sơ huấn luyện và thiết bị nghiêm ngặt.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt về ATVSLĐ: vận hành hệ thống lạnh, nồi hơi, máy chế biến, băng tải; thợ điện, cơ khí, hàn; lái xe, xe nâng; hóa chất, nước thải; bốc xếp từ 30 kg.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, thử việc, thời vụ: công nhân sơ chế thủ công, phân cỡ, xếp khay, cấp đông, kho lạnh, đóng gói thủ công; tổ trưởng; QA, QC; văn phòng, bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy xưởng; PPE đúng loại; dao và dụng cụ cắt, trơn trượt, lạnh sâu, tư thế làm việc; tín hiệu báo động, đường thoát khi rò rỉ amoniac; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, y tá, điều dưỡng phòng y tế nhà máy.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu tình huống đặc thù (hít hoặc dính amoniac, bỏng lạnh, bỏng nhiệt, cắt hở, kẹt tay vào máy, điện giật, ngạt, đuối nước); quản lý sức khỏe, bệnh nghề nghiệp; xử lý tình huống khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng, công nhân lâu năm được chọn ở từng tổ, chuyền, ca, kho lạnh, phòng máy (kiêm nhiệm).',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ tại tổ (sàn ướt, máy chưa che chắn, thiếu PPE, rò rỉ); nhắc nhở, phát hiện sớm; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('nhà máy'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – rất hay gặp khi hết vụ nguyên liệu, công nhân thời vụ nghỉ rồi quay lại.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản đốc trực tiếp vận hành máy thuộc Danh mục: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ từ sơ chế thủ công sang vận hành máy) thì người lao động cần được huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp thực phẩm – thủy sản cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Thực phẩm – thủy sản áp dụng mức tại khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP, nhẹ hơn các ngành như xây dựng, '
        + 'hóa chất, khai khoáng. Mức tối thiểu:',
      bang: [
        ['Dưới 300 lao động', '01 người **bán chuyên trách**'],
        ['Từ 300 đến dưới 1.000', '01 người **chuyên trách**'],
        ['Từ 1.000 trở lên', 'Phòng ATVSLĐ hoặc ít nhất 02 người **chuyên trách**'],
      ],
      ghiChu: 'Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2. Về y tế (Nhóm 5): chế biến, bảo quản thủy sản phải tổ chức '
        + 'bộ phận y tế ở mức cao hơn (Điều 37 Nghị định 39/2016/NĐ-CP); dưới 300 lao động cần ít nhất 01 người trình độ trung cấp y '
        + 'trở lên. Chuyên viên Viện STP – DAKO xác nhận mức cụ thể theo quy mô.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, nhà máy, phòng ban, phân xưởng, ca sản xuất) hoặc phụ trách bộ phận sản xuất, kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp vận hành, vệ sinh hoặc bảo dưỡng máy, thiết bị thuộc Danh mục (máy chế biến, băng tải, hệ thống lạnh, nồi hơi, xe nâng...); hoặc dùng hóa chất nguy hiểm, vào không gian hạn chế, làm trên cao, bốc xếp thường xuyên từ 30 kg, lái xe, hàn, điện?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ tịch HĐQT, Tổng giám đốc, Giám đốc, phó giám đốc; giám đốc nhà máy, chất lượng, kỹ thuật, vùng nuôi; trưởng, phó phòng ban; quản lý trại', '1', 'Người đứng đầu, người phụ trách bộ phận.'],
      ['B. QUẢN LÝ SẢN XUẤT'],
      ['Quản đốc, phó quản đốc phân xưởng', '1', 'Thêm Nhóm 3 nếu trực tiếp vận hành máy thuộc Danh mục.'],
      ['Trưởng ca, giám sát sản xuất', '1 hoặc 4', 'Nhóm 1 nếu chỉ huy một bộ phận sản xuất.'],
      ['Tổ trưởng, chuyền trưởng', '4', 'Nên chọn làm an toàn, vệ sinh viên (thêm Nhóm 6).'],
      ['C. CHẤT LƯỢNG, PHÒNG THÍ NGHIỆM'],
      ['QA, QC, KCS, kiểm nguyên liệu, kiểm kim loại; R&D; QC thu mua; phòng thí nghiệm hóa lý, vi sinh', '4', 'Thí nghiệm, khử trùng: xem xét Nhóm 3; QC xuống ghe, bè: thêm Nhóm 3.'],
      ['D. CƠ ĐIỆN VÀ VẬN HÀNH THIẾT BỊ'],
      ['Trưởng phòng cơ điện; kỹ sư cơ khí, điện, tự động hóa, kỹ thuật lạnh', '1', 'Nhóm 1: trưởng phòng; thêm Nhóm 3 khi làm việc thuộc Danh mục.'],
      ['Thợ điện; thợ cơ khí, bảo trì máy; thợ hàn, cắt; làm việc trên cao từ 2 m', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Vận hành hệ thống lạnh amoniac: trưởng ca lạnh, vận hành máy nén, bình chứa', '3', 'Rủi ro cao nhất; thêm an toàn hóa chất.'],
      ['Vận hành nồi hơi, lò sấy, bình áp lực, nồi hấp tiệt trùng, máy nén khí, cầu trục, pa lăng, máy phát điện', '3', 'Thiết bị có yêu cầu nghiêm ngặt.'],
      ['E. AN TOÀN VÀ Y TẾ'],
      ['Trưởng bộ phận, cán bộ ATVSLĐ, HSE (chuyên trách, bán chuyên trách)', '2', 'Trưởng phòng thêm Nhóm 1; số người tối thiểu: xem mục 1.'],
      ['Bác sĩ, y sĩ, y tá, điều dưỡng phòng y tế nhà máy', '5', 'Thủy sản phải tổ chức y tế ở mức cao hơn.'],
      ['Đội sơ cấp cứu (công nhân kiêm nhiệm)', '4', 'Thêm huấn luyện sơ cấp cứu (mục 4).'],
      ['An toàn, vệ sinh viên ở từng tổ, chuyền, ca', '6', 'Học thêm, ngoài nhóm của công việc chính.'],
      ['F. CÔNG NHÂN SẢN XUẤT VÀ VỆ SINH'],
      ['Tiếp nhận, cân, phân loại, rửa nguyên liệu', '4', 'Thêm Nhóm 3 nếu bốc xếp thường xuyên từ 30 kg.'],
      ['Sơ chế thủ công: cắt, lột vỏ, phi lê, lạng da, tỉa; phân cỡ, xếp khay', '4', 'Nhóm đông nhất của nhà máy.'],
      ['Nấu, hấp, luộc, chiên, hun khói, tẩm ướp', '4', 'Nhóm 3 nếu vận hành nồi hơi, nồi áp lực, máy thuộc Danh mục.'],
      ['Vận hành, vệ sinh, bảo dưỡng máy chế biến, băng tải, máy đóng gói; dây chuyền bia, nước giải khát, dầu ăn, bánh kẹo, sữa', '3', 'Chỉ nhặt, xếp sản phẩm trên băng chuyền: thường Nhóm 4.'],
      ['Cấp đông, mạ băng; kho lạnh; đóng gói thủ công, đóng thùng, dán nhãn', '4', 'Thêm Nhóm 3 nếu bốc xếp từ 30 kg hoặc lái xe nâng.'],
      ['Vệ sinh nhà xưởng, thiết bị cuối ca', '4 hoặc 3', 'Trường hợp ranh giới: chuyên viên rà soát.'],
      ['Vệ sinh bể, hầm, silo, hố ga; xử lý nước cấp, nước thải; pha chế hóa chất khử trùng, clo, axit, kiềm', '3', 'Thêm an toàn hóa chất.'],
      ['G. KHO, VẬN CHUYỂN, VĂN PHÒNG, BẾP ĂN'],
      ['Thủ kho, cân, nhận nguyên liệu, giao nhận; văn phòng, xuất nhập khẩu, IT; bảo vệ, tạp vụ', '4', 'Thủ kho bốc xếp thường xuyên từ 30 kg: Nhóm 3.'],
      ['Kho hóa chất; bốc xếp, đóng container; lái xe nâng, xe tải, xe lạnh, container', '3', 'Bốc xếp dưới 30 kg: Nhóm 4; xe nâng tay: chuyên viên xác nhận.'],
      ['Đầu bếp, phụ bếp, chế biến suất ăn bếp ăn tập thể', '3 hoặc 4', 'Nhóm 3 nếu từ 300 suất/ngày trở lên.'],
      ['H. GIẾT MỔ, NUÔI TRỒNG, THỨC ĂN THỦY SẢN'],
      ['Giết mổ gia súc, gia cầm', '3', 'Pha lóc sau giết mổ: chuyên viên xem xét.'],
      ['Nuôi, thu hoạch trên lồng bè, ghe; vận hành máy bơm, quạt nước, máy phát điện ao; nhà máy thức ăn (nghiền, trộn, ép viên, silo)', '3', 'Quản lý trại: Nhóm 1; công nhân ao đất trên bờ: thường Nhóm 4.'],
      ['I. THỜI VỤ, NHÀ THẦU, KHÁCH'],
      ['Lao động thời vụ, mùa vụ; học nghề, tập nghề, thử việc', '4 hoặc 3', 'Theo công việc thực tế; huấn luyện trước khi giao việc.'],
      ['Lao động thuê lại; nhà thầu bảo trì, vệ sinh, vận chuyển, bảo vệ', 'Theo công việc', 'Theo hợp đồng; nên yêu cầu minh chứng huấn luyện.'],
      ['Khách, đoàn đánh giá vào khu sản xuất', '—', 'Không thuộc 6 nhóm; phổ biến nội quy, cấp PPE.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới giữa Nhóm 3 và Nhóm 4.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG THỰC PHẨM – THỦY SẢN: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao một bộ phận lớn công nhân thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ '
      + '(Thông tư 06/2020/TT-BLĐTBXH) gồm nhiều việc trong nhà máy: vận hành, vệ sinh, bảo dưỡng máy chế biến, băng tải; vận hành '
      + 'hệ thống lạnh, nồi hơi, xe nâng; hóa chất nguy hiểm; xử lý nước thải; điện, hàn cắt, làm việc trên cao; lái xe; bốc xếp '
      + 'thường xuyên từ 30 kg; bếp ăn từ 300 suất/ngày; giết mổ. Việc thủ công như sơ chế bằng dao, xếp khay thường thuộc Nhóm 4.',
    dan: 'Ngoài phần chung của Nhóm 3, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại nhà máy:',
    nghe: [
      ['Vận hành hệ thống lạnh', 'Máy nén, bình chứa amoniac',
        'Điểm nguy hiểm của hệ thống lạnh: rò rỉ amoniac, áp suất, bỏng lạnh, ngạt, cháy nổ; kiểm tra đầu ca, van an toàn, áp kế; xử lý rò rỉ (báo động, sơ tán, thông gió, PPE); sơ cứu người hít, dính amoniac.'],
      ['Nồi hơi, thiết bị áp lực, thiết bị nâng', 'Nồi hơi, bình áp lực, nồi hấp, cầu trục',
        'Mức nước, áp suất, xả đáy, van an toàn; đường ống hơi, bỏng nhiệt; thời hạn kiểm định; vận hành cầu trục, pa lăng an toàn; xử lý sự cố, phối hợp ứng phó khẩn cấp.'],
      ['Máy chế biến, băng tải, đóng gói', 'Lột vỏ, cắt, xay, trộn, ép, sấy; băng tải',
        'Che chắn, nút dừng khẩn cấp, không đưa tay vào máy đang chạy; khóa nguồn, gắn thẻ khi vệ sinh, tháo kẹt, thay lưỡi dao; nhiệt ở máy sấy, nồi; bụi bột, bụi đường dễ cháy nổ; thực hành trên máy của doanh nghiệp.'],
      ['Cơ điện, bảo trì', 'Thợ điện, cơ khí, hàn cắt, làm việc trên cao',
        'Điện trong môi trường ẩm ướt; nguyên tắc khóa nguồn, gắn thẻ khi sửa chữa; hàn cắt gần vật liệu dễ cháy; làm việc trên cao với dây an toàn, giàn giáo, thang; sơ cứu bỏng, điện giật.'],
      ['Hóa chất, vệ sinh, nước thải', 'Hóa chất khử trùng; bể, hầm, silo',
        'Đọc nhãn, pha chế, không trộn lẫn hóa chất, PPE, rửa mắt, sơ cứu; không gian hạn chế (khí độc, thiếu oxy, xin phép vào, giám sát bên ngoài, cứu hộ); vệ sinh máy bằng nước áp lực: điện, văng bắn.'],
      ['Xe nâng, lái xe, bốc xếp', 'Xe nâng, xe tải; bốc xếp từ 30 kg',
        'Kiểm tra xe trước ca, tải trọng, tầm nhìn; đi trên sàn ướt, dốc, trong kho lạnh; bốc xếp lên xe, container, neo hàng; mang vác, nâng hạ đúng cách; xếp hàng cao, chống đổ.'],
      ['Giết mổ, chế biến thịt', 'Giết mổ gia súc, gia cầm',
        'Dao, thiết bị cắt, móc treo, tời; trơn trượt do máu, mỡ, nước; bồn nhúng nước nóng, bỏng nhiệt; nguy cơ sinh học khi tiếp xúc động vật; vệ sinh cá nhân, xử lý vết thương.'],
      ['Nuôi trồng, thức ăn thủy sản', 'Lồng bè, ghe; ao nuôi; nhà máy thức ăn',
        'Phòng chống đuối nước, áo phao; an toàn điện ở ao (quạt nước, sục khí, rò điện xuống nước); máy bơm, máy phát; hóa chất xử lý ao; máy nghiền, trộn, ép viên, vào silo; sơ cứu đuối nước, điện giật.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy công việc và thiết bị tại nhà máy, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn hóa chất', 'Amoniac của hệ thống lạnh; hóa chất vệ sinh, khử trùng (clo, axit, kiềm); hóa chất xử lý nước.'],
      ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện, vận hành tủ điện, máy bơm nơi ẩm ướt. Không thay thế Nhóm 3.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu ở từng xưởng, từng ca; ca đêm không có nhân viên y tế.'],
      ['Kiểm định kỹ thuật an toàn', 'Hệ thống lạnh, nồi hơi, bình áp lực, nồi hấp, cầu trục, xe nâng, chai khí... theo danh mục hiện hành.'],
      ['Quan trắc môi trường lao động', 'Xưởng ồn, ẩm, lạnh sâu; khu nồi hơi, phòng máy lạnh, khu xử lý nước thải.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Kế hoạch ATVSLĐ hằng năm; biện pháp cho amoniac, không gian hạn chế, vệ sinh máy.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Cân, nhiệt kế, đầu dò nhiệt độ kho lạnh, tủ đông, ẩm kế, thiết bị đo điện.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Minh chứng quản lý an toàn cho khách hàng nước ngoài; đào tạo nghề ngắn hạn cho thợ bảo trì.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Đã có HACCP, ISO 22000, BRCGS, còn phải huấn luyện ATVSLĐ không?',
      'Có. Chứng nhận an toàn thực phẩm bảo vệ người tiêu dùng; huấn luyện ATVSLĐ là nghĩa vụ riêng theo Luật An toàn, vệ sinh lao động để bảo vệ người lao động. Viện STP – DAKO huấn luyện ATVSLĐ, không thực hiện tập huấn an toàn thực phẩm.'],
    ['Công nhân sơ chế chỉ dùng dao, không đụng máy, có cần huấn luyện?',
      'Có, họ thuộc Nhóm 4 (tối thiểu 16 giờ, định kỳ hằng năm). Dao, sàn trơn, lạnh sâu, thao tác lặp lại gây nhiều tai nạn hằng ngày, nên đây là nhóm cần huấn luyện kỹ nhất dù không thuộc Danh mục.'],
    ['Công nhân đứng băng chuyền, vệ sinh máy cuối ca thuộc Nhóm 3 hay Nhóm 4?',
      'Người trực tiếp điều khiển, tháo kẹt, vệ sinh hoặc bảo dưỡng máy thuộc Danh mục là Nhóm 3; người chỉ nhặt, xếp sản phẩm trên băng chuyền thường là Nhóm 4. Trường hợp ranh giới được chuyên viên rà soát theo danh sách máy và công việc.'],
    ['Công nhân kho lạnh làm việc ở âm 18 độ trở xuống có phải Nhóm 3?',
      'Danh mục không nêu riêng công việc trong kho lạnh, nên mặc định là Nhóm 4, có bổ sung nội dung lạnh sâu. Thêm Nhóm 3 nếu họ bốc xếp thường xuyên từ 30 kg, lái xe nâng hoặc vận hành máy thuộc Danh mục.'],
    ['Thợ vận hành lạnh lâu năm, thợ điện, lái xe nâng đã có bằng nghề, có phải học?',
      'Có. Kinh nghiệm, bằng nghề, chứng chỉ vận hành là điều kiện chuyên môn; huấn luyện ATVSLĐ là yêu cầu riêng, giúp cập nhật quy trình và kỹ năng xử lý sự cố hiếm gặp như rò rỉ amoniac lớn.'],
    ['Công nhân thời vụ, nhà máy chạy ba ca, hàng nghìn người: tổ chức thế nào?',
      'Mọi người lao động, kể cả thời vụ, phải được huấn luyện trước khi giao việc; người nghỉ từ 6 tháng trở lên quay lại phải huấn luyện lại. Viện STP – DAKO huấn luyện tại nhà máy, chia lớp theo ca, theo xưởng, đầu vụ và ngoài cao điểm nguyên liệu.'],
    ['Nhà thầu bảo trì, vệ sinh, bảo vệ, lao động thuê lại: ai huấn luyện?',
      'Thường theo hợp đồng: nhà thầu huấn luyện người của họ; lao động thuê lại theo thỏa thuận giữa các bên và quy định về cho thuê lại lao động. Doanh nghiệp nên yêu cầu minh chứng huấn luyện trước khi cho vào xưởng; Viện có thể huấn luyện cho cả nhà thầu.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức. Chuyên viên rà danh sách theo máy và công việc để xếp đúng nhóm, không thừa; có thể chia đợt, ưu tiên công việc rủi ro cao trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, sơ đồ xưởng, danh sách thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, theo mùa vụ.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Khách hàng, đoàn đánh giá'),
      ['Huấn luyện tại nhà máy',
        'Chia lớp theo ca, theo xưởng để không dừng sản xuất; lý thuyết kết hợp thực hành tại chỗ trên máy, thiết bị của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 36, 37)', 'Bố trí người làm công tác ATVSLĐ và bộ phận y tế theo quy mô; chế biến, bảo quản thủy sản phải tổ chức y tế ở mức cao hơn.'],
      DANH_MUC,
      ['Luật Hóa chất 2025 (hiệu lực từ 01/01/2026) và văn bản hướng dẫn', 'Quản lý an toàn hóa chất: amoniac của hệ thống lạnh, hóa chất vệ sinh, khử trùng, xử lý nước.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('16/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026, Ủy ban Thường vụ Quốc hội đã cho ý kiến ngày 23/9/2026; dự án chưa có hiệu lực'),
  },
};
