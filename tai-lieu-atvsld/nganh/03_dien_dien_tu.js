// Nội dung tài liệu số 03 – Ngành Điện – Điện tử.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành Điện – Điện tử" (bản cho nhân viên kinh doanh, thông tin pháp lý đến 16/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Riêng mục 1: Điều 36 Nghị định 39/2016/NĐ-CP có hai mức cho ngành này, nên bảng bố trí cán bộ dùng dạng nhiều dòng
// (canBo.cot + canBo.dong) thay cho canBo.bang.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '03',
  tenFile: '03_DienDienTu_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Điện – Điện tử (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp điện – điện tử – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Điện – Điện tử',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH ĐIỆN – ĐIỆN TỬ',
    gioiThieu: 'Doanh nghiệp điện – điện tử gồm hai mảng có rủi ro rất khác nhau: mảng điện (phát điện, truyền tải, xây lắp, '
      + 'thí nghiệm) chủ yếu đối mặt với điện giật, hồ quang, ngã cao, cháy nổ; mảng điện tử có hàng nghìn công nhân làm theo ca, '
      + 'tiếp xúc hóa chất, nhiệt và máy móc. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh sáu nhóm huấn luyện an toàn, vệ sinh '
      + 'lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin cho buổi làm việc với '
      + 'chuyên viên Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP ĐIỆN – ĐIỆN TỬ CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, học nghề, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Mảng điện phần lớn thuộc {{3}}, mảng điện tử phần lớn thuộc {{4}}:** vận hành, bảo trì, thử nghiệm thiết bị điện, làm việc trên cao, hầm cáp là Nhóm 3; công nhân lắp ráp điện tử thường là Nhóm 4, trừ công đoạn hóa chất, xi mạ, máy ép, dập. Vận hành máy SMT, hàn thiếc là trường hợp ranh giới.',
      '**{{3}} không thay thế huấn luyện an toàn điện:** Nhóm 3 theo pháp luật ATVSLĐ; an toàn điện theo pháp luật điện lực, đã thay đổi từ năm 2025. Người làm công việc điện thường cần cả hai.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; lao động thời vụ theo đơn hàng, đội thi công theo dự án nghỉ từ 6 tháng trở lên phải huấn luyện lại.',
      '**Hồ sơ huấn luyện theo pháp luật Việt Nam là yêu cầu riêng:** chương trình EHS của tập đoàn không thay thế được; khách hàng, chủ đầu tư, đoàn kiểm tra thường xem hồ sơ trước khi cho vào nhà máy, trạm, công trường.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('doanh nghiệp điện – điện tử'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý, chỉ huy: giám đốc, phó giám đốc được giao phụ trách; giám đốc nhà máy, chi nhánh, điện lực; trưởng phòng ban; quản đốc; giám đốc dự án, chỉ huy trưởng công trình điện.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu khi có tai nạn, sự cố điện, cháy nổ; tổ chức bộ máy, kế hoạch ATVSLĐ hằng năm; đánh giá rủi ro đặc thù (điện giật, hồ quang, cháy nổ, hóa chất, máy móc); điều tra tai nạn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng phòng, cán bộ HSE, EHS, ATVSLĐ chuyên trách hoặc bán chuyên trách; người trực tiếp giám sát ATVSLĐ tại nhà máy, trạm, công trường.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kỹ thuật an toàn điện, thiết bị nâng, áp lực, hóa chất, máy móc, cháy nổ; kiểm tra, đánh giá rủi ro tại hiện trường; huấn luyện tại chỗ; điều tra tai nạn, ứng cứu khẩn cấp.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: vận hành, bảo trì, thử nghiệm thiết bị điện; đường dây, cáp ngầm, trên cao; hàn, cắt; máy dập, ép; hóa chất, xi mạ; thiết bị nâng, áp lực; lái xe, xe nâng.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, thử việc, thời vụ: công nhân lắp ráp, kiểm tra, đóng gói, phòng sạch; QA, QC; kỹ sư thiết kế làm văn phòng; kho; văn phòng, bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy, biển cảnh báo điện; PPE; khói hàn, dung môi, máy móc; công thái học, mỏi mắt; thoát nạn, ứng phó cháy; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, y tá, điều dưỡng phòng y tế nhà máy.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu điện giật, bỏng điện, bỏng hóa chất, ngộ độc hơi dung môi; quản lý sức khỏe, bệnh nghề nghiệp, công nhân ca đêm; xử lý tình huống khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng, công nhân lâu năm được chọn ở từng tổ, ca, dây chuyền, đội thi công (kiêm nhiệm).',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ tại vị trí làm việc; nhắc nhở, phát hiện sớm; báo cáo, kiến nghị cải thiện điều kiện làm việc.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('nhà máy, trạm, công trường'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – hay gặp với thời vụ theo đơn hàng, đội thi công theo dự án.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản đốc trực tiếp vận hành thiết bị có yêu cầu nghiêm ngặt: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ từ lắp ráp sang vận hành máy ép) thì người lao động cần được huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp điện – điện tử cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Điều 36 Nghị định 39/2016/NĐ-CP xếp sản xuất, truyền tải, phân phối điện vào nhóm ngành nguy cơ cao; sản xuất '
        + 'thiết bị điện, điện tử, thương mại, dịch vụ áp dụng mức thấp hơn. Mức tối thiểu:',
      cot: ['Dưới 50 lao động', 'Từ 50 đến dưới 300', 'Từ 300 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['Sản xuất, truyền tải, phân phối điện',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '02 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 03 người **chuyên trách**'],
        ['Sản xuất thiết bị điện, điện tử; thương mại, dịch vụ',
          '01 người **bán chuyên trách**', '01 người **bán chuyên trách**', '01 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 02 người **chuyên trách**'],
      ],
      ghiChu: 'Mức áp dụng theo công đoạn thực tế (có gia công kim loại, xây lắp đường dây và trạm... có thể thuộc nhóm nguy cơ '
        + 'cao); chuyên viên Viện STP – DAKO xác nhận. Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2. Cơ sở nguy cơ cao '
        + 'từ 300 lao động trở lên phải có hội đồng ATVSLĐ cơ sở.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, nhà máy, chi nhánh, phòng ban, phân xưởng, đội thi công) hoặc phụ trách bộ phận kỹ thuật, sản xuất, kinh doanh, vận hành?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ tại nơi làm việc?  →  {{2}}',
      'Trực tiếp vận hành, bảo trì, thử nghiệm thiết bị điện; làm việc trên cao từ 2 m; hàn, cắt; máy dập, ép; hóa chất nguy hiểm, xi mạ; không gian hạn chế; thiết bị nâng, áp lực; lái xe, xe nâng; bốc xếp nặng?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ doanh nghiệp, Tổng giám đốc, Giám đốc; giám đốc nhà máy, chi nhánh, điện lực', '1', 'Người đứng đầu đơn vị.'],
      ['Phó giám đốc (kỹ thuật, sản xuất, vận hành, an toàn); trưởng phòng ban', '1', 'Phó giám đốc: khi được giao phụ trách; nên học cả cấp phó.'],
      ['B. QUẢN LÝ SẢN XUẤT, VẬN HÀNH VÀ DỰ ÁN'],
      ['Quản đốc, trưởng bộ phận sản xuất (SMT, lắp ráp, cơ khí, thử nghiệm)', '1', 'Thêm Nhóm 3 nếu trực tiếp vận hành thiết bị nghiêm ngặt.'],
      ['Trưởng ca sản xuất, trưởng dây chuyền, tổ trưởng', '4 hoặc 3', 'Nhóm 3 nếu làm việc nghiêm ngặt; chuyên viên rà soát.'],
      ['Trưởng ca vận hành nhà máy điện, trạm biến áp', '3', 'Chỉ huy toàn ca: xem xét thêm Nhóm 1.'],
      ['Giám đốc dự án, chỉ huy trưởng công trình điện', '1', 'Thêm Nhóm 3 khi trực tiếp kiểm tra hiện trường.'],
      ['Đội trưởng đội xây lắp, đường dây, thí nghiệm; tổ trưởng thi công', '3', 'Toàn quyền chỉ huy: xem xét thêm Nhóm 1.'],
      ['C. KỸ THUẬT, THIẾT KẾ VÀ CHẤT LƯỢNG'],
      ['Kỹ sư vận hành, thi công, giám sát hiện trường, bảo trì, thiết bị', '3', 'Kỹ sư quy trình: theo mức tiếp xúc dây chuyền.'],
      ['Kỹ sư thiết kế, R&D, lập trình PLC, firmware; dự toán, CAD', '4', 'Nhóm 3 nếu thường xuyên đo thử, chạy thử có điện.'],
      ['QA, QC: kiểm tra nhập hàng, trên dây chuyền, xuất hàng', '4', 'Nhóm 3 nếu dùng hóa chất nguy hiểm, máy bức xạ.'],
      ['D. AN TOÀN VÀ Y TẾ'],
      ['Trưởng phòng HSE, EHS; cán bộ ATVSLĐ chuyên trách, bán chuyên trách', '2', 'Trưởng phòng thêm Nhóm 1; số người: xem mục 1.'],
      ['Cán bộ môi trường, phòng cháy chữa cháy kiêm nhiệm', '2 hoặc 4', 'Nhóm 2 nếu có giám sát ATVSLĐ.'],
      ['Nhân viên y tế nhà máy, trạm y tế', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên ở từng tổ, ca, dây chuyền', '6', 'Học thêm, ngoài nhóm của công việc chính.'],
      ['E. VẬN HÀNH, XÂY LẮP VÀ BẢO TRÌ ĐIỆN'],
      ['Điều độ viên, trực chính, trực phụ; trung tâm điều khiển (SCADA)', '3', 'Điều khiển qua màn hình: chuyên viên xác nhận.'],
      ['Vận hành nhà máy điện (lò hơi, tua-bin, máy phát), trạm biến áp', '3', 'Thiết bị điện và thiết bị áp lực.'],
      ['Đường dây, trạm; thợ leo cột; cáp ngầm, hầm cáp; treo tháo công tơ', '3', 'Điện, trên cao, không gian hạn chế.'],
      ['Thợ xây lắp điện, thợ điện bảo trì; lắp đặt điện mặt trời, lưu trữ', '3', 'Thêm an toàn điện tùy công việc.'],
      ['Thợ điện nhẹ: mạng, camera, báo cháy, viễn thông', '4 hoặc 3', 'Nhóm 3 nếu trên cao, trong hầm, gần nguồn điện.'],
      ['Thí nghiệm, đo thử, thử cao áp, hiệu chỉnh rơ le, hiệu chuẩn', '3', 'Ít người nhưng rủi ro rất cao.'],
      ['F. SẢN XUẤT THIẾT BỊ ĐIỆN'],
      ['Cắt, dập, gia công cơ khí; hàn; kéo dây, đùn nhựa sản xuất cáp', '3', 'Máy dập, ép; hàn, cắt kim loại.'],
      ['Sản xuất ắc quy, pin; sơn tĩnh điện, mạ; thử nghiệm xuất xưởng', '3', 'Ắc quy, hóa chất: thêm an toàn hóa chất.'],
      ['Quấn dây máy biến áp, động cơ; lắp lõi thép; tẩm sơn cách điện', '3 hoặc 4', 'Theo máy móc, hóa chất: chuyên viên rà soát.'],
      ['Lắp ráp tủ bảng điện, thiết bị đóng cắt, đèn, thiết bị gia dụng', '4', 'Nhóm 3 nếu tiếp xúc điện áp cao khi lắp, thử.'],
      ['G. SẢN XUẤT, LẮP RÁP ĐIỆN TỬ'],
      ['Lắp ráp trên dây chuyền, đóng gói; phòng sạch, kiểm tra ngoại quan', '4', 'Nhóm đông nhất; Nhóm 3 nếu dùng hóa chất nguy hiểm.'],
      ['Máy SMT, lò reflow, AOI; hàn thiếc bản mạch; kiểm thử ICT, FCT', '4 hoặc 3', 'Ranh giới: chuyên viên rà soát theo công việc.'],
      ['Xi mạ, ăn mòn bản mạch, pha chế hóa chất; máy ép nhựa, dập, cắt', '3', 'Thêm an toàn hóa chất.'],
      ['Máy kiểm tra bằng tia X, thiết bị tần số cao, laser', '3', 'An toàn bức xạ là khóa riêng, Viện chưa cung cấp.'],
      ['H. TIỆN ÍCH, KHO, VẬN CHUYỂN, VĂN PHÒNG'],
      ['Lò hơi, máy nén khí, bình áp lực, cầu trục, xe nâng; xử lý nước thải', '3', 'Thiết bị thuộc Danh mục; không gian hạn chế.'],
      ['Thủ kho, kho linh kiện, vật tư, thành phẩm', '4', 'Nhóm 3 nếu bốc xếp nặng, lái xe nâng.'],
      ['Kho hóa chất, dung môi, ắc quy; lái xe tải, xe thang, xe công trình', '3', 'Hóa chất nguy hiểm; lái xe thuộc Danh mục.'],
      ['Văn phòng, kinh doanh, IT; bảo vệ, tạp vụ', '4', 'Ra công trình khách: thêm nội dung khu vực có điện.'],
      ['Nhân viên bếp ăn tập thể', '3 hoặc 4', 'Nhóm 3 nếu bếp từ 300 suất trở lên.'],
      ['I. THỜI VỤ, NHÀ THẦU, KHÁCH'],
      ['Lao động thời vụ theo đơn hàng; học việc, tập nghề, thử việc', '4 hoặc 3', 'Theo công việc; huấn luyện trước khi giao việc.'],
      ['Lao động thuê lại; nhà thầu bảo trì, thầu phụ điện', 'Theo công việc', 'Thường Nhóm 3; nên yêu cầu minh chứng huấn luyện.'],
      ['Khách, đoàn đánh giá, giao hàng vào khu sản xuất', '—', 'Không thuộc 6 nhóm; hướng dẫn an toàn ngắn.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới giữa Nhóm 3 và Nhóm 4.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG ĐIỆN – ĐIỆN TỬ: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao phần lớn nhân sự mảng điện thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ '
      + '(Thông tư 06/2020/TT-BLĐTBXH) nêu rõ việc vận hành, bảo trì, sửa chữa, thử nghiệm, kiểm định thiết bị điện, đường dây, '
      + 'nhà máy điện, ắc quy; cùng làm việc trên cao, không gian hạn chế, hàn cắt, máy ép, dập, hóa chất, mạ, lái xe. Ở mảng '
      + 'điện tử, phần lớn công nhân lắp ráp thuộc Nhóm 4.',
    dan: 'Ngoài phần chung của Nhóm 3, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại doanh nghiệp:',
    nghe: [
      ['Nhà máy điện, trạm biến áp', 'Trực ca, điều độ',
        'Điện giật, hồ quang; khoảng cách an toàn, nối đất, kiểm tra không điện; thao tác, giao nhận ca, khóa và treo biển; lò hơi, dầu và khí cách điện; xử lý chập cháy, nổ máy biến áp.'],
      ['Đường dây, cáp ngầm', 'Leo cột; hầm cáp, hố ga',
        'Khoảng cách với thiết bị mang điện, điện cảm ứng, nối đất; leo cột, dây an toàn, xe thang; hầm cáp: đo khí, thông gió, giám sát, cứu hộ; sào, găng, ủng cách điện; sấm sét.'],
      ['Xây lắp điện, điện mặt trời', 'Thợ điện công trình',
        'Tủ điện tạm, chống dòng rò, nối đất; khóa và treo biển khi sửa chữa; làm việc trên mái, gần đường dây; mảng pin luôn có điện khi có nắng; ắc quy, hệ thống lưu trữ.'],
      ['Thử nghiệm cao áp', 'Rơ le; thử xuất xưởng',
        'Khu vực thử, rào chắn, xả điện, nối đất, tín hiệu cảnh báo, quy trình hai người; điện dung, điện cảm ứng; kiểm tra không điện; thiết bị lân cận còn mang điện.'],
      ['Sản xuất thiết bị điện', 'Dập, cắt, kéo dây; hàn; ắc quy',
        'Che chắn, dừng khẩn cấp, khóa và gắn thẻ khi bảo trì máy; khói hàn, bình khí; dung môi, sơn cách điện, axit và chì ắc quy; cầu trục, xe nâng khi chuyển lõi thép, máy biến áp.'],
      ['Dây chuyền điện tử (khi thuộc Nhóm 3)', 'SMT, reflow, hàn thiếc',
        'Băng chuyền, tay gắp, lò nhiệt, dừng khẩn cấp, không vô hiệu hóa che chắn; khói hàn, chất trợ hàn, kem hàn, dung môi, thông gió; an toàn điện khi kiểm thử; công thái học.'],
      ['Hóa chất, xi mạ, ép, bức xạ', 'Kho hóa chất; tia X',
        'Nhãn, bảng dữ liệu an toàn hóa chất; lưu trữ, pha chế; găng, kính, mặt nạ, rửa mắt; ứng phó rò rỉ, cháy; máy ép, dập: khóa liên động, thay khuôn; bức xạ, điện từ trường, laser.'],
      ['Tiện ích, kho, vận chuyển', 'Lò hơi, cầu trục, xe',
        'Quá áp, rò rỉ khí, hơi; cầu trục, palăng: tải trọng, buộc móc, tín hiệu; bể nước thải: khí độc, không gian hạn chế, cứu hộ; bốc xếp, chằng buộc máy biến áp, cuộn cáp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy công việc và thiết bị tại doanh nghiệp, có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn điện', 'Thợ điện, vận hành trạm, nhà máy điện, đường dây, thí nghiệm. Không thay thế Nhóm 3.'],
      ['Huấn luyện an toàn hóa chất', 'Dung môi, chất trợ hàn, kem hàn, axit xi mạ, dầu và sơn cách điện, điện phân ắc quy.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu ở nhà máy, trạm, công trường; nơi có nguy cơ điện giật, bỏng.'],
      ['Kiểm định kỹ thuật an toàn', 'Cầu trục, xe nâng, nồi hơi, bình áp lực; thiết bị điện: chuyên viên xác nhận.'],
      ['Quan trắc môi trường lao động', 'Khói hàn, hơi dung môi, bụi, ồn; điện từ trường tần số cao; phòng sạch.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Nhà máy, dây chuyền mới; bảo trì có cắt điện; biện pháp thi công xây lắp điện.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Thiết bị đo điện, nhiệt độ, lực, khối lượng ở phòng thí nghiệm, kiểm thử.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Khi khách hàng, chủ đầu tư đánh giá nhà cung cấp; đào tạo nghề ngắn hạn cho thợ.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Nhóm 3 và huấn luyện an toàn điện có phải là một?',
      'Không. Nhóm 3 là huấn luyện ATVSLĐ theo Nghị định 44/2016/NĐ-CP; an toàn điện là yêu cầu riêng theo pháp luật điện lực (Luật Điện lực 2024, Nghị định 62/2025/NĐ-CP, Thông tư 02/2025/TT-BCT). Người làm công việc điện thường cần cả hai; chuyên viên xác định ai cần loại nào.'],
    ['Thẻ an toàn điện cấp theo Thông tư 05/2021/TT-BCT còn dùng được không?',
      'Thông tư này đã được thay thế từ 01/02/2025. Giá trị của thẻ, hồ sơ cũ tùy từng trường hợp; chuyên viên Viện STP – DAKO rà soát và hướng dẫn phần cần bổ sung.'],
    ['Công nhân lắp ráp điện tử chỉ cần Nhóm 4?',
      'Đúng với phần lớn công nhân lắp ráp, kiểm tra, đóng gói (tối thiểu 16 giờ, định kỳ hằng năm). Người vận hành máy SMT, lò reflow, hàn thiếc, kiểm thử điện áp cao hoặc dùng hóa chất có thể thuộc Nhóm 3; chuyên viên rà soát theo công việc thực tế.'],
    ['Điều độ viên, kỹ sư thiết kế có thuộc Nhóm 3 không?',
      'Có thể. Vận hành, điều khiển thiết bị điện, kể cả qua màn hình, có thể thuộc Danh mục; kỹ sư thường xuyên đo thử, chạy thử có điện là Nhóm 3. Chuyên viên rà soát từng vị trí.'],
    ['Nhà máy đã tự huấn luyện nội bộ, còn cần đơn vị huấn luyện?',
      'Việc tự tổ chức huấn luyện phải đáp ứng điều kiện riêng, khác nhau giữa các nhóm; chuyên viên sẽ giải thích cụ thể. Viện STP – DAKO hỗ trợ phần doanh nghiệp chưa tự làm được, như Nhóm 1, 2, 5 và hồ sơ chứng nhận.'],
    ['Công nhân đông, chạy ca, thời vụ, đội thi công theo dự án: tổ chức thế nào?',
      'Mọi người lao động, kể cả thời vụ, phải được huấn luyện trước khi giao việc; nghỉ từ 6 tháng trở lên phải huấn luyện lại. Viện STP – DAKO huấn luyện tại nhà máy, công trường, chia đợt theo ca, dây chuyền, lịch dự án.'],
    ['Máy biến áp, tủ và cáp trung thế có phải kiểm định?',
      'Thông tư 02/2025/TT-BCT có danh mục thiết bị, dụng cụ điện trên 1 kV phải kiểm định lần đầu và định kỳ (máy biến áp, máy cắt, cáp điện, chống sét van, sào cách điện...). Thiết bị cụ thể và phạm vi dịch vụ: chuyên viên xác nhận. Tài khoản quản lý ATVSLĐ giúp theo dõi hạn kiểm định.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm theo công việc, không thừa; có thể chia đợt, ưu tiên công việc rủi ro cao trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, công đoạn, danh sách thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, dây chuyền, dự án.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Khách hàng, chủ đầu tư, đoàn đánh giá'),
      ['Huấn luyện tại nhà máy, công trường',
        'Chia đợt theo ca, dây chuyền, dự án để hạn chế gián đoạn sản xuất; thực hành tại chỗ trên thiết bị của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 36, 38)', 'Bố trí người làm công tác ATVSLĐ theo nhóm ngành và quy mô lao động; hội đồng ATVSLĐ cơ sở.'],
      DANH_MUC,
      ['Luật Điện lực số 61/2024/QH15; Nghị định 62/2025/NĐ-CP; Thông tư 02/2025/TT-BCT',
        'Pháp luật về an toàn điện, áp dụng từ năm 2025; quy định kiểm định thiết bị, dụng cụ điện trên 1 kV. Thông tư 02/2025/TT-BCT thay thế Thông tư 05/2021/TT-BCT từ 01/02/2025.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('16/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026, Ủy ban Thường vụ Quốc hội đã cho ý kiến ngày 23/9/2026, chưa có hiệu lực; '
      + 'Bộ Công Thương đang dự thảo văn bản thay thế Nghị định 62/2025/NĐ-CP và Thông tư 02/2025/TT-BCT'),
  },
};
