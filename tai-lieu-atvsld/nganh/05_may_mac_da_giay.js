// Nội dung tài liệu số 05 – Ngành May mặc – Da giày.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành May mặc – Da giày" (bản cho nhân viên kinh doanh, thông tin pháp lý đến 16/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Mục 1: dệt, may, da, giày áp dụng khoản 2 Điều 36 (người làm công tác ATVSLĐ) và nằm trong danh sách phải bố trí người
// làm công tác y tế theo Điều 37 Nghị định 39/2016/NĐ-CP, nên bảng bố trí dùng dạng nhiều dòng: một dòng ATVSLĐ, một dòng y tế.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '05',
  tenFile: '05_MayMacDaGiay_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành May mặc – Da giày (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp may mặc – da giày – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành May mặc – Da giày',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH MAY MẶC – DA GIÀY',
    gioiThieu: 'Nhà máy may mặc – da giày có rất đông công nhân, làm theo chuyền, theo ca; nhân sự biến động mạnh, nhất là quanh '
      + 'dịp Tết, và thường xuyên được nhãn hàng, khách hàng nước ngoài đánh giá. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh '
      + 'sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị '
      + 'sẵn thông tin cho buổi làm việc với chuyên viên Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP MAY MẶC – DA GIÀY CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, học nghề, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Thợ may thường thuộc {{4}}, nhiều công đoạn khác thuộc {{3}}:** vận hành máy cắt, chặt, ép, dập, in, sấy, mài, ép đế; dùng keo, dung môi, hóa chất giặt – nhuộm; nồi hơi, khí nén, xe nâng; điện; bốc xếp thường xuyên từ 30 kg. Xếp nhóm theo từng công đoạn, từng loại máy.',
      '**Phải bố trí người làm công tác y tế ({{5}}) theo quy mô:** dệt, may, da, giày nằm trong danh sách lĩnh vực tại Điều 37 Nghị định 39/2016/NĐ-CP, bên cạnh người làm công tác ATVSLĐ ({{2}}) theo Điều 36.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; công nhân mới tuyển sau Tết, thời vụ theo đơn hàng phải được huấn luyện trước khi vào chuyền.',
      '**Đánh giá của nhãn hàng không thay thế huấn luyện theo pháp luật Việt Nam:** hồ sơ huấn luyện đúng nhóm được xem khi thanh tra, khi xảy ra tai nạn và khi nhãn hàng đánh giá. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('doanh nghiệp may mặc – da giày'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý, chỉ huy: giám đốc, phó giám đốc được giao phụ trách; giám đốc nhà máy, giám đốc sản xuất; trưởng phòng ban; quản đốc, trưởng bộ phận sản xuất.',
        hocGi: 'Pháp luật, trách nhiệm người quản lý; tổ chức bộ máy ATVSLĐ và y tế theo quy mô; kế hoạch, nội quy cho từng công đoạn (cắt, keo, ép, sấy, kho hóa chất, nồi hơi); đánh giá rủi ro; quản lý thời vụ, nhà thầu; ứng phó khẩn cấp.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận HSE, cán bộ ATVSLĐ chuyên trách hoặc bán chuyên trách (thường kiêm từ kỹ thuật, nhân sự, cơ điện).',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; đánh giá rủi ro theo công đoạn (máy cắt, ép, keo, dung môi, nồi hơi, điện, kho); kiểm soát hóa chất; an toàn máy; quan trắc; điều tra tai nạn; hồ sơ cho thanh tra, nhãn hàng.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: vận hành máy cắt, chặt, ép, dập, in, sấy, mài; dùng keo, dung môi, hóa chất giặt – nhuộm; nồi hơi, khí nén, xe nâng; thợ điện, bảo trì; lái xe.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo máy và công đoạn (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, thử việc, thời vụ: thợ may, ủi, hoàn thành, đóng gói; trải vải; QC, kiểm hàng; kỹ thuật, mẫu; văn phòng, bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy xưởng; kim đâm, kẹp tay, kim gãy; điện ở máy may, bàn ủi; bỏng hơi; tư thế ngồi, đứng lâu; bụi, ồn; thoát hiểm, ứng phó cháy; sơ cấp cứu.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, điều dưỡng, y tá phòng y tế nhà máy.',
        hocGi: 'Nghiệp vụ y tế lao động; xử lý kim đâm, kẹp tay, bỏng hơi, dính hóa chất, hít hơi dung môi, chóng mặt hàng loạt; quản lý sức khỏe, bệnh nghề nghiệp; ứng phó khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng, công nhân lâu năm được chọn ở từng tổ, chuyền, ca (kiêm nhiệm).',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ ở chuyền (kim, điện, hóa chất, lối thoát bị chặn, nóng, ồn); nhắc nhở dùng PPE; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('nhà máy'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc xưởng ngừng hoạt động, từ 6 tháng trở lên; nghỉ dài ngày (ví dụ thai sản): chuyên viên xác nhận.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản đốc xưởng ép đế trực tiếp vận hành máy ép: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ từ chuyền may sang máy ép, máy cắt) thì người lao động cần được huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Nhà máy cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2) và y tế (Nhóm 5)?',
      dan: 'Dệt may, da giày áp dụng khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP (người làm công tác ATVSLĐ) và phải bố trí '
        + 'người làm công tác y tế theo Điều 37. Mức tối thiểu:',
      tieuDeCotNhan: 'Bố trí',
      cot: ['Dưới 300 lao động', 'Từ 300 đến dưới 500', 'Từ 500 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['Người làm công tác ATVSLĐ ({{2}})',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '01 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 02 người **chuyên trách**'],
        ['Người làm công tác y tế ({{5}})',
          '01 người trung cấp y trở lên', '01 bác sĩ hoặc y sĩ và 01 trung cấp y', '01 bác sĩ; mỗi ca 01 trung cấp y',
          'Thành lập cơ sở y tế phù hợp'],
      ],
      ghiChu: 'Ngành nghề đăng ký thuộc nhóm nguy cơ cao có thể áp dụng mức cao hơn. Không tự bố trí được người làm y tế thì '
        + 'có thể hợp đồng với cơ sở khám bệnh, chữa bệnh đủ năng lực. Chuyên viên Viện STP – DAKO xác nhận mức cụ thể.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, nhà máy, phòng ban, xưởng, bộ phận) hoặc phụ trách sản xuất, kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp vận hành máy cắt, chặt, ép, dập, cán, in, sấy, mài, băng chuyền; dùng keo, dung môi, mực, hóa chất giặt – nhuộm; vận hành nồi hơi, bình áp lực, xe nâng, thang máy; điện; hàn; lái xe; bốc xếp từ 30 kg?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ doanh nghiệp, Tổng giám đốc, Giám đốc, giám đốc nhà máy, giám đốc sản xuất', '1', 'Người đứng đầu, phụ trách sản xuất.'],
      ['Phó giám đốc; trưởng phòng ban (kế hoạch, kỹ thuật, QA/QC, cơ điện, nhân sự...)', '1', 'Cấp phó: khi được giao phụ trách.'],
      ['B. QUẢN LÝ SẢN XUẤT'],
      ['Quản đốc, phó quản đốc xưởng; trưởng bộ phận sản xuất', '1', 'Thêm Nhóm 3 nếu vận hành máy thuộc Danh mục.'],
      ['Giám sát sản xuất; trưởng chuyền, tổ trưởng, tổ phó', '4', 'Điều hành một bộ phận: xem xét Nhóm 1.'],
      ['C. KỸ THUẬT, MẪU, QA/QC'],
      ['Kỹ thuật công nghệ, IE, R&D; rập, CAD, thiết kế, kế hoạch, xuất nhập khẩu', '4', 'Nhóm 3 nếu thường xuyên chỉnh máy thuộc Danh mục.'],
      ['Thợ may mẫu, thợ làm mẫu giày', '4', 'Nhóm 3 nếu thường dùng máy cắt, ép, keo dung môi.'],
      ['QA/QC, kiểm vải, kiểm thành phẩm, kiểm kim; phòng thí nghiệm', '4', 'Phòng thí nghiệm dùng hóa chất nguy hiểm: Nhóm 3.'],
      ['D. AN TOÀN VÀ Y TẾ'],
      ['Trưởng bộ phận HSE, trưởng phòng ATVSLĐ', '1 + 2', 'Đứng đầu bộ phận, làm công tác ATVSLĐ.'],
      ['Cán bộ ATVSLĐ chuyên trách, bán chuyên trách, HSE; cán bộ CSR, môi trường kiêm nhiệm', '2', 'Kiêm nhiệm: khi được giao công tác ATVSLĐ.'],
      ['Bác sĩ, y sĩ, điều dưỡng, y tá phòng y tế', '5', 'Số người tối thiểu: xem mục 1.'],
      ['An toàn, vệ sinh viên (thường là tổ trưởng, công nhân lâu năm)', '6', 'Học thêm, ngoài nhóm của công việc chính.'],
      ['E. VĂN PHÒNG, KHO, LÁI XE'],
      ['Kế toán, nhân sự, hành chính, phiên dịch, IT, mua hàng, kinh doanh; bảo vệ, tạp vụ', '4', 'Bảo vệ: thêm phòng cháy, ứng phó khẩn cấp.'],
      ['Nhân viên bếp ăn tập thể, căng tin', '4 hoặc 3', 'Nhóm 3 nếu bếp từ 300 suất/ngày.'],
      ['Thủ kho vải, da, phụ liệu, thành phẩm; cấp phát; bốc xếp', '4 hoặc 3', 'Nhóm 3 nếu bốc xếp từ 30 kg, làm trên cao.'],
      ['Kho hóa chất, keo, dung môi, mực in; người pha, cấp hóa chất', '3', 'Thêm an toàn hóa chất.'],
      ['Lái xe con, xe đưa đón, xe tải; lái xe nâng; sạc ắc quy xe nâng', '3', 'Người sạc ắc quy: chuyên viên xác nhận.'],
      ['F. SẢN XUẤT MAY MẶC'],
      ['Cắt vải bằng máy (cắt vòng, cắt đứng, cắt tự động)', '3', 'Cắt bằng kéo, dao cầm tay: Nhóm 4.'],
      ['Trải vải, đánh số, bóc tách, phối kiện', '4', 'Nhóm 3 nếu kiêm vận hành máy cắt.'],
      ['Ép mex, ép nhiệt, dập nút – khuy; in lụa, in chuyển nhiệt, pha mực', '3', 'Máy thùa khuy, đính nút: thường Nhóm 4.'],
      ['Thợ may, thêu máy vi tính; ủi, hoàn thành, gấp xếp, đóng gói, sửa hàng', '4', 'Máy đặc biệt (ép, cao tần): chuyên viên xác nhận.'],
      ['G. SẢN XUẤT GIÀY DÉP'],
      ['Chặt dao, cắt da – vải – nhựa bằng máy; lạng, vót da', '3', 'Chuyên viên xác nhận theo máy.'],
      ['Ép nhiệt, ép cao tần, dập, đột lỗ, ép logo; gò, ráp, ép gò', '3', 'Ép cao tần: xem xét thêm điện từ trường.'],
      ['Ép đế, cán, trộn cao su, đúc đế; lò sấy, lưu hóa; mài, chà nhám', '3', 'Chuyên viên xác nhận theo máy.'],
      ['May mũ giày; lắp ráp trên chuyền, hoàn tất, kiểm tra, đóng hộp', '4', 'Vận hành, vệ sinh băng chuyền: Nhóm 3.'],
      ['H. HÓA CHẤT, GIẶT – NHUỘM, THUỘC DA'],
      ['Quét keo, xử lý bề mặt, dán đế; sơn, phun, nhuộm giày', '3', 'Theo loại keo, hóa chất (GHS).'],
      ['Giặt công nghiệp, wash, tẩy, nhuộm; máy sấy, vắt ly tâm', '3', 'Chuyên viên xác nhận từng quy trình.'],
      ['Thuộc da, chế biến, nhuộm da; thu gom chất thải nguy hại', '3', 'Chế biến da thuộc Danh mục.'],
      ['I. CƠ ĐIỆN, THIẾT BỊ, MÔI TRƯỜNG'],
      ['Thợ điện, trạm biến áp, điện lạnh; thợ cơ điện, cơ khí, hàn cắt', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Thợ sửa máy may, thợ máy chuyền', '4', 'Sửa máy cắt, ép, dập hoặc điện: Nhóm 3.'],
      ['Vận hành nồi hơi, máy nén khí, bình áp lực, chiller, thang máy, palăng', '3', 'Thiết bị thuộc danh mục kiểm định.'],
      ['Xử lý nước thải; vệ sinh bể, hầm, hố ga; làm việc trên cao từ 2 m', '3', 'Không gian hạn chế, trên cao.'],
      ['J. MỚI TUYỂN, THỜI VỤ, NHÀ THẦU, KHÁCH'],
      ['Công nhân mới tuyển, học nghề, thử việc; thời vụ theo đơn hàng', '4 hoặc 3', 'Theo công việc; huấn luyện trước khi giao việc.'],
      ['Lao động thuê lại; nhà thầu dịch vụ; chuyên gia nước ngoài', 'Theo công việc', 'Thuê lại, ngôn ngữ huấn luyện: chuyên viên xác nhận.'],
      ['Khách, đoàn đánh giá, ứng viên vào nhà máy', '—', 'Không thuộc 6 nhóm; phổ biến nội quy, cấp PPE.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới giữa Nhóm 3 và Nhóm 4.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG MAY MẶC – DA GIÀY: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao chỉ một phần công nhân thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ '
      + '(Thông tư 06/2020/TT-BLĐTBXH) nêu các máy cắt, chặt, dập, ép, cán, sấy, mài, băng chuyền, máy in công nghiệp; hóa '
      + 'chất nguy hiểm; nhuộm, chế biến da; điện; lái xe. Máy may không có tên trong Danh mục nên thợ may thường thuộc '
      + 'Nhóm 4; nhà máy giày có thể có nhiều Nhóm 3.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo máy và công đoạn:',
    nghe: [
      ['Cắt, ép mex, in', 'Máy cắt, ép nhiệt, in',
        'Lưỡi dao, kẹp, cuốn; che chắn, dừng khẩn cấp; găng chống cắt, khẩu trang, nút tai; ép nhiệt: bỏng, kẹp; mực in: nhãn, thông gió; bụi xơ vải, phòng cháy.'],
      ['Chặt, ép, gò giày', 'Máy chặt, ép, gò',
        'Kẹp, ép bàn tay ở máy chặt; nhiệt, áp lực ở máy ép; điều khiển hai tay, dừng khẩn cấp; kiểm tra máy trước ca; khóa nguồn khi vệ sinh; điện từ trường khi ép cao tần.'],
      ['Đế, sấy, mài', 'Ép đế, lò sấy, mài',
        'Nhiệt, áp lực khi ép, đúc đế; lò sấy: nhiệt, cháy; mài, chà nhám: bụi, văng mảnh; băng chuyền: cuốn, kẹp; súng khí nén; sơ cứu bỏng, kẹp.'],
      ['Keo, sơn, bề mặt', 'Quét keo, sơn phun',
        'Nhãn GHS, bảng dữ liệu an toàn (SDS); hít, dính da; thông gió, hút cục bộ; mặt nạ lọc hơi hữu cơ, găng, kính; dung môi: nguồn lửa, tĩnh điện; sơ cứu.'],
      ['Giặt, nhuộm, da', 'Wash, nhuộm, thuộc da',
        'Pha chế, chuyển hóa chất, không trộn lẫn, chống tràn đổ; nhiệt, hơi nước, nước nóng; máy sấy, vắt ly tâm; PPE chịu hóa chất; sơ cứu, báo sự cố.'],
      ['Nồi hơi, nâng hạ', 'Nồi hơi, thang máy',
        'Nổ, bỏng hơi, quá áp; van an toàn, áp kế, mức nước, xả đáy; kiểm tra trước ca, nhật ký vận hành; thang máy, palăng: tải trọng, móc, cáp; phối hợp kiểm định.'],
      ['Điện, bảo trì', 'Thợ điện, hàn, sửa máy',
        'Khóa và gắn thẻ, kiểm tra không điện; hàn cắt trong xưởng có vải, keo; làm việc trên cao khi sửa mái, thay đèn; bảo trì máy ép, cắt, dập, băng chuyền; sơ cứu điện giật.'],
      ['Kho, xe, nước thải', 'Kho hóa chất, xe nâng',
        'Lưu kho hóa chất tách nhóm; xếp pallet, kệ cao; phòng cháy kho vải, carton; xe nâng: điểm mù, người đi bộ; không gian hạn chế: đo khí, thông gió, cứu hộ.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy công đoạn, máy, thiết bị và hóa chất tại nhà máy, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn hóa chất', 'Keo, dung môi, mực in, chất xử lý; hóa chất giặt – nhuộm, thuộc da, nước thải.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu theo ca: kim đâm, kẹp tay, bỏng hơi, dính hóa chất, chóng mặt.'],
      ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện, trạm biến áp, tủ điện xưởng. Không thay thế Nhóm 3.'],
      ['Kiểm định kỹ thuật an toàn', 'Nồi hơi, bình áp lực, khí nén, đường ống hơi, hệ thống lạnh, thang máy, xe nâng.'],
      ['Quan trắc môi trường lao động', 'Bụi bông, xơ vải, ồn, nhiệt; hơi dung môi ở khu keo, sơn, in, giặt – nhuộm.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Theo công đoạn cắt, keo, ép, sấy, kho hóa chất; hồ sơ khi nhãn hàng đánh giá.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Phòng thí nghiệm, phòng QC: cân, thước, nhiệt ẩm kế, thiết bị đo lực, độ cứng.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Khi nhãn hàng yêu cầu hệ thống quản lý ATLĐ; đào tạo nghề cho công nhân mới.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Nhà máy đã được nhãn hàng đánh giá hằng năm, còn cần huấn luyện theo luật Việt Nam?',
      'Có. Đánh giá của nhãn hàng theo yêu cầu riêng của họ; huấn luyện 6 nhóm là nghĩa vụ theo pháp luật Việt Nam. Hồ sơ huấn luyện đúng nhóm, có mã tra cứu giúp trả lời đoàn đánh giá nhanh hơn; Viện STP – DAKO không cam kết kết quả đánh giá của nhãn hàng.'],
    ['Thợ may thuộc Nhóm 3 hay Nhóm 4?',
      'Thường là Nhóm 4 (tối thiểu 16 giờ, định kỳ hằng năm), vì máy may không có tên trong nhóm máy của Danh mục. Khi chuyền có máy đặc biệt (ép, cao tần...) hoặc thợ kiêm công việc khác, chuyên viên xác nhận.'],
    ['Tổ cắt, nhà máy giày có phải Nhóm 3 hết không?',
      'Không nhất thiết. Người trực tiếp vận hành máy cắt, chặt, ép, dập, in dự kiến Nhóm 3; người trải vải, đánh số, may mũ, hoàn tất có thể là Nhóm 4. Chuyên viên rà soát theo danh sách người, công việc và loại máy.'],
    ['Keo chúng tôi dùng là keo nước, có phải Nhóm 3 không?',
      'Phụ thuộc phân loại của từng sản phẩm theo hệ thống GHS. Doanh nghiệp gửi danh sách keo, dung môi, chất xử lý đang dùng cùng bảng dữ liệu an toàn (SDS) để chuyên viên đánh giá.'],
    ['Nhà máy 450 công nhân cần bao nhiêu người y tế, không tuyển được thì sao?',
      'Từ 300 đến dưới 500 lao động: ít nhất 01 bác sĩ hoặc y sĩ và 01 người trình độ trung cấp y tế, mỗi người học Nhóm 5. Không tự bố trí được thì có thể hợp đồng với cơ sở khám bệnh, chữa bệnh đủ năng lực; chuyên viên hướng dẫn cụ thể.'],
    ['Sau Tết tuyển hàng trăm công nhân mới, nhân sự biến động: huấn luyện thế nào?',
      'Huấn luyện theo đợt trước khi giao việc, ưu tiên người vào công đoạn nguy cơ cao. Chứng nhận gắn với người lao động, tra cứu được theo mã hoặc CCCD; người đã có chứng nhận còn hạn, đúng nhóm được chuyên viên xem xét phần cần bổ sung.'],
    ['Chuyền không dừng được, hàng nghìn công nhân: tổ chức huấn luyện thế nào?',
      'Chia đợt theo chuyền, theo ca, tổ chức tại nhà máy, phối hợp với phòng kế hoạch để hạn chế gián đoạn sản xuất. Lịch cụ thể do chuyên viên thiết kế sau khảo sát.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm theo công đoạn, không thừa; có thể chia đợt, ưu tiên Nhóm 1, 2, 5 và công đoạn hóa chất, máy ép, nồi hơi trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo công đoạn, máy, hóa chất.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo chuyền, theo ca.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Nhãn hàng, khách hàng, đoàn đánh giá'),
      ['Huấn luyện tại nhà máy',
        'Chia đợt theo chuyền, theo ca để không dừng sản xuất; lý thuyết kết hợp thực hành tại chỗ trên máy, thiết bị của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 30–32, 36, 37)', 'Trách nhiệm khi thuê lại lao động; bố trí người làm công tác ATVSLĐ (khoản 2 Điều 36) và người làm công tác y tế (Điều 37) theo quy mô.'],
      DANH_MUC,
      ['Thông tư 19/2016/TT-BYT', 'Quản lý vệ sinh lao động, sức khỏe người lao động, sơ cấp cứu; quan trắc môi trường lao động.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('16/10/2026',
      'đang được trình Quốc hội, dự kiến xem xét tại kỳ họp tháng 10/2026 theo trình tự rút gọn; dự án chưa có hiệu lực'),
  },
};
