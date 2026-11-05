// Nội dung tài liệu số 06 – Ngành Văn phòng – Dịch vụ – Tài chính.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành Văn phòng – Dịch vụ – Tài chính" (bản cho nhân viên kinh doanh, thông tin pháp lý
// đến 16/10/2026). Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem
// nganh/01_xay_dung.js. Ngành này áp dụng khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP (bảng bố trí một dòng, 3 mức như tài liệu 02).

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '06',
  tenFile: '06_VanPhongDichVuTaiChinh_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Văn phòng – Dịch vụ – Tài chính (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp văn phòng – dịch vụ – tài chính – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Văn phòng – Dịch vụ – Tài chính',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH VĂN PHÒNG – DỊCH VỤ – TÀI CHÍNH',
    gioiThieu: 'Doanh nghiệp văn phòng – dịch vụ – tài chính có phần lớn nhân sự làm việc với máy tính, giấy tờ trong tòa nhà; '
      + 'rủi ro thấp hơn sản xuất, nhưng số người lớn và thường có nhiều chi nhánh, phòng giao dịch. Tài liệu này giúp Quý '
      + 'Doanh nghiệp nắm nhanh sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc '
      + 'từng nhóm và chuẩn bị sẵn thông tin cho buổi làm việc với chuyên viên Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP VĂN PHÒNG – TÀI CHÍNH CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả người thử việc, học nghề. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn nhân sự thuộc {{4}}:** giao dịch viên, kế toán, nhân sự, kinh doanh, lập trình viên, nhân viên trung tâm liên hệ... Ngồi làm việc với máy tính cả ngày không phải là Nhóm 3.',
      '**{{3}} tập trung ở một bộ phận nhỏ, hay bị bỏ sót:** lái xe ô tô (kể cả xe con), kỹ thuật tòa nhà và trung tâm dữ liệu (điện, UPS, ắc quy, thang máy), vệ sinh công nghiệp, lau kính, khử trùng, thi công biển hiệu và sân khấu.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm. Với nhiều chi nhánh, phòng giao dịch, hồ sơ cần được quản lý tập trung.',
      '**Hồ sơ huấn luyện là yêu cầu tuân thủ:** được xem khi thanh tra, khi xảy ra tai nạn (kể cả trên đường đi làm) và khi đối tác đánh giá nhà cung cấp. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('doanh nghiệp văn phòng – dịch vụ – tài chính'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ tịch, tổng giám đốc, giám đốc, phó giám đốc được giao phụ trách; giám đốc khối, vùng, chi nhánh, phòng giao dịch, văn phòng khu vực; trưởng phòng, ban hội sở.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu khi có tai nạn, kể cả trên đường đi làm; tổ chức bộ máy ATVSLĐ và y tế; kế hoạch ATVSLĐ cho toàn hệ thống; đánh giá rủi ro văn phòng (điện, cháy, ecgônômi, trượt ngã, an ninh); ứng phó khẩn cấp.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận HSE, cán bộ ATVSLĐ chuyên trách; thường gặp nhất là nhân viên hành chính – nhân sự hoặc quản trị kiêm nhiệm (bán chuyên trách).',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; đánh giá rủi ro tòa nhà, quầy giao dịch, kho quỹ, phòng máy; kiểm tra, hồ sơ, kế hoạch hằng năm; quản lý PPE, thiết bị nghiêm ngặt; huấn luyện tại chỗ, mạng lưới an toàn, vệ sinh viên; điều tra tai nạn.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: lái xe ô tô; kỹ thuật viên tòa nhà, trung tâm dữ liệu (điện, UPS, ắc quy, thang máy); vệ sinh công nghiệp, lau kính, bể, hầm; khử trùng; thợ lắp biển hiệu, dựng sân khấu, máy in công nghiệp.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả thử việc: giao dịch viên, thủ quỹ, tín dụng, môi giới; kế toán, hành chính, nhân sự, kinh doanh; CNTT; trung tâm liên hệ; bảo vệ, tạp vụ; nhân viên đi thực địa.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; an toàn điện thiết bị văn phòng; ecgônômi (ngồi lâu, màn hình, ánh sáng); trượt ngã, mang vác; phòng cháy, thoát hiểm trong tòa nhà; ứng phó khẩn cấp tại quầy; an toàn đi lại; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, y tá, điều dưỡng phụ trách phòng y tế.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu tại văn phòng (ngất, đột quỵ, ngừng tim, ngừng thở, bỏng, điện giật, hóc dị vật); quản lý sức khỏe, vệ sinh lao động, bệnh nghề nghiệp; phối hợp cơ sở y tế, hỗ trợ sơ tán.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: người được chọn ở từng chi nhánh, phòng giao dịch, tầng, phòng ban, ca trực (kiêm nhiệm).',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ ở văn phòng, quầy giao dịch (dây điện, ổ cắm quá tải, lối thoát bị chặn, sàn ướt); nhắc nhở, phát hiện sớm; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('văn phòng, chi nhánh'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc từ 6 tháng trở lên, hoặc chi nhánh, đơn vị ngừng hoạt động từ 6 tháng trở lên rồi mở lại.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ trưởng bộ phận kỹ thuật tòa nhà trực tiếp làm công việc điện: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ từ văn phòng sang lái xe, kỹ thuật tòa nhà) thì người lao động cần được huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Văn phòng – dịch vụ – tài chính thuộc nhóm “lĩnh vực khác” tại khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP, mức yêu '
        + 'cầu thấp hơn các ngành như xây dựng, hóa chất, khai khoáng. Mức tối thiểu:',
      bang: [
        ['Dưới 300 lao động', '01 người **bán chuyên trách**'],
        ['Từ 300 đến dưới 1.000', '01 người **chuyên trách**'],
        ['Từ 1.000 trở lên', 'Phòng ATVSLĐ hoặc ít nhất 02 người **chuyên trách**'],
      ],
      ghiChu: 'Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2 và đáp ứng tiêu chuẩn riêng về trình độ (khối kỹ thuật), '
        + 'kinh nghiệm theo Điều 36; người kiêm nhiệm từ khối kinh tế, xã hội cần chuyên viên rà soát. Cách tính số lao động '
        + 'khi có nhiều chi nhánh và việc bố trí y tế (Điều 37): chuyên viên Viện STP – DAKO xác nhận.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, chi nhánh, phòng giao dịch, phòng ban, trung tâm) hoặc phụ trách bộ phận kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp lái xe ô tô; làm điện, ắc quy, vận hành thang máy, thiết bị nghiêm ngặt; làm việc trên cao từ 2 m; vào bể, hầm, không gian hạn chế; dùng hóa chất nguy hiểm, khử trùng; nấu ăn ở bếp từ 300 suất/ngày?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ tịch HĐQT, HĐTV, chủ doanh nghiệp, Tổng giám đốc, Giám đốc', '1', 'Người đứng đầu đơn vị.'],
      ['Phó giám đốc; giám đốc khối, vùng, miền', '1', 'Bắt buộc khi được giao phụ trách; nên học cả cấp phó.'],
      ['Giám đốc chi nhánh, phòng giao dịch, trung tâm, văn phòng khu vực, văn phòng đại diện', '1', 'Nhiều chi nhánh: số người Nhóm 1 lớn.'],
      ['Trưởng phòng, ban hội sở (tài chính, nhân sự, kinh doanh, tín dụng, rủi ro, CNTT...)', '1', 'Phó phòng: Nhóm 1 nếu được giao phụ trách.'],
      ['Trưởng nhóm, giám sát ca, giám sát trung tâm liên hệ', '4 hoặc 1', 'Nhóm 1 khi phụ trách một bộ phận.'],
      ['B. NGHIỆP VỤ TÀI CHÍNH – NGÂN HÀNG – BẢO HIỂM'],
      ['Giao dịch viên, kiểm soát viên, thủ quỹ, nhân viên kho quỹ', '4', 'Thêm ứng phó khẩn cấp tại quầy, kho quỹ.'],
      ['Quan hệ khách hàng, tín dụng, thẩm định, rủi ro, thanh toán, kế toán ngân hàng', '4', 'Thẩm định tại hiện trường: xem khối G.'],
      ['Môi giới, tư vấn đầu tư, phân tích; kinh doanh bảo hiểm, quản lý đại lý', '4', 'Đại lý theo hợp đồng đại lý: chuyên viên xác nhận.'],
      ['C. CNTT VÀ VĂN PHÒNG HỖ TRỢ'],
      ['Lập trình viên, kiểm thử, phân tích dữ liệu; quản trị hệ thống, mạng, helpdesk', '4', 'Làm việc văn phòng với máy tính.'],
      ['Trực ca trung tâm điều hành hệ thống (NOC, SOC) qua màn hình', '4', 'Trường hợp ranh giới: chuyên viên rà soát.'],
      ['Kế toán, hành chính, nhân sự, văn thư, lễ tân, mua hàng, pháp chế, marketing', '4', 'Làm việc văn phòng.'],
      ['Chăm sóc khách hàng, telesales, nhân viên trung tâm liên hệ (BPO)', '4', 'Ngồi lâu, đeo tai nghe, làm theo ca.'],
      ['Lưu trữ, thủ thư hồ sơ, kho tài liệu', '4', 'Nhóm 3 nếu thường trèo kệ cao từ 2 m, bốc xếp nặng.'],
      ['D. AN TOÀN VÀ Y TẾ'],
      ['Trưởng bộ phận HSE, an toàn – an ninh – quản trị tòa nhà', '1 + 2', 'Quản lý bộ phận, làm công tác ATVSLĐ.'],
      ['Cán bộ ATVSLĐ chuyên trách, HSE; hành chính – nhân sự kiêm nhiệm ATVSLĐ', '2', 'Bằng cấp là điều kiện riêng (xem mục 1).'],
      ['Nhân viên y tế, y tá, phụ trách phòng y tế', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên ở chi nhánh, phòng giao dịch, tầng, ca trực', '6', 'Học thêm, ngoài nhóm của công việc chính.'],
      ['Đội sơ cấp cứu, đội phòng cháy chữa cháy cơ sở', 'Theo công việc', 'Thêm huấn luyện sơ cấp cứu; PCCC: Viện chưa cung cấp.'],
      ['E. BẢO VỆ, HẬU CẦN, TÒA NHÀ'],
      ['Bảo vệ văn phòng, chi nhánh, kho quỹ, tòa nhà', '4', 'Thêm thoát hiểm, ứng phó khẩn cấp.'],
      ['Lao công, tạp vụ; giao nhận, chuyển phát đi xe máy', '4', 'Hóa chất tẩy rửa, sàn trơn; an toàn đi lại.'],
      ['Nhân viên bếp ăn tập thể', '4 hoặc 3', 'Nhóm 3 nếu bếp từ 300 suất/ngày.'],
      ['Lái xe con, xe đưa đón nhân viên, xe chở tiền, hàng giá trị', '3', 'Lái xe ô tô các loại thuộc Danh mục.'],
      ['Kỹ thuật viên tòa nhà: điện, điều hòa, cấp thoát nước, PCCC, máy phát', '3', 'Thêm huấn luyện an toàn điện.'],
      ['Kỹ thuật viên trung tâm dữ liệu (điện, UPS, ắc quy); hạ tầng viễn thông, leo cột', '3', 'Thêm an toàn điện; trên cao từ 2 m.'],
      ['Vận hành, bảo trì thang máy, bình áp lực, nồi hơi (nếu có)', '3', 'Thiết bị thuộc danh mục kiểm định.'],
      ['Vệ sinh công nghiệp, lau kính mặt dựng, bể, hầm; khử trùng, diệt côn trùng', '3', 'Thêm an toàn hóa chất.'],
      ['F. QUẢNG CÁO, SỰ KIỆN, IN ẤN'],
      ['Lắp biển hiệu, bảng quảng cáo, dựng sân khấu, gian hàng; hàn, cắt khung', '3', 'Trên cao, điện, hàn cắt.'],
      ['Vận hành máy in công nghiệp, máy cắt, máy cán', '3', 'Máy in văn phòng thông thường không tính.'],
      ['Bốc xếp, chuyển văn phòng, vận chuyển thiết bị sự kiện', '3 hoặc 4', 'Nhóm 3 nếu bốc xếp thường xuyên từ 30 kg.'],
      ['Thiết kế, sáng tạo, biên tập, dựng phim, quản lý khách hàng', '4', 'Làm việc văn phòng.'],
      ['G. THỰC ĐỊA, THỜI VỤ, ĐỐI TÁC, KHÁCH'],
      ['Kinh doanh thị trường, thẩm định tài sản, giám định, thu hồi nợ, kiểm toán tại khách hàng', '4', 'Vào công trường thường xuyên: chuyên viên xem xét.'],
      ['Thời vụ, thử việc, học việc; thực tập sinh', '4', 'Thực tập sinh: chuyên viên xác nhận theo hình thức.'],
      ['Lao động thuê lại; bảo vệ, tạp vụ, kỹ thuật, lái xe thuê ngoài', 'Theo công việc', 'Đơn vị cung ứng huấn luyện; bên thuê kiểm tra hồ sơ.'],
      ['Khách giao dịch, khách thuê văn phòng, khách dự sự kiện', '—', 'Không thuộc 6 nhóm; nội quy, lối thoát hiểm.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG VĂN PHÒNG – TÀI CHÍNH: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao chỉ một bộ phận nhỏ thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông tư '
      + '06/2020/TT-BLĐTBXH) nêu lái xe ô tô; điện và ắc quy; vận hành thiết bị nghiêm ngặt như thang máy; làm việc trên cao từ '
      + '2 m; không gian hạn chế, vệ sinh công nghiệp; hóa chất nguy hiểm, khử trùng; bếp ăn tập thể từ 300 suất/ngày. Nhóm '
      + 'công việc “điều hành qua màn hình” chỉ công việc như kiểm soát không lưu, không phải mọi công việc dùng máy tính.',
    dan: 'Ngoài phần chung của Nhóm 3, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc:',
    nghe: [
      ['Lái xe', 'Xe con, xe đưa đón, chở tiền',
        'Mệt mỏi, điểm mù, thời tiết, lùi xe và biện pháp phòng ngừa; kiểm tra xe trước chuyến; an toàn khi rửa xe, bảo dưỡng, nạp nhiên liệu; xử lý tai nạn, cháy xe; sơ cấp cứu.'],
      ['Kỹ thuật tòa nhà', 'Điện, điều hòa, nước, thang máy',
        'Điện giật, ngã cao, thiết bị quay và áp lực; cô lập nguồn khi bảo trì (khóa và gắn thẻ); thang, sàn công tác, dây an toàn, làm việc trên mái; hầm kỹ thuật, bể nước: đo khí, thông gió, cứu hộ.'],
      ['Trung tâm dữ liệu, viễn thông', 'UPS, ắc quy; cột, trạm phát sóng',
        'Phòng ắc quy và UPS: axit, khí dễ cháy; điện giật, cô lập nguồn; làm việc trên cao ở cột, mái, trạm phát sóng; găng cách điện, dây an toàn; sơ cứu điện giật.'],
      ['Vệ sinh công nghiệp, lau kính', 'Mặt dựng; bể, hầm, hố ga',
        'Ngã cao, ngạt, khí độc, hóa chất, điện; sàn treo, dây đu: kiểm tra dây, móc, thiết bị trước khi làm; không gian hạn chế: đo khí, thông gió, người giám sát bên ngoài, cứu hộ.'],
      ['Khử trùng, diệt côn trùng', 'Hóa chất, thuốc diệt côn trùng',
        'Đọc nhãn, bảng dữ liệu an toàn hóa chất; pha chế, che chắn, thông báo khu vực xử lý; phương tiện bảo vệ cá nhân; xử lý đổ tràn; sơ cứu khi dính, hít hóa chất.'],
      ['Biển hiệu, sân khấu, in ấn', 'Lắp biển, sân khấu; máy in',
        'Giàn, thang, xe nâng người, dây an toàn, thời tiết xấu; điện tạm công suất lớn tại sự kiện: tủ điện, tiếp địa, chống nước; hàn cắt, chai khí; máy in, máy cắt: che chắn, khóa nguồn khi vệ sinh.'],
      ['Bếp ăn tập thể', 'Bếp từ 300 suất/ngày',
        'Bỏng, dao, gas hoặc điện; sàn trơn trượt; hóa chất tẩy rửa; mang vác đúng kỹ thuật; găng tay, giày chống trượt; sơ cấp cứu bỏng, vết cắt.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy quy mô, tòa nhà và bộ phận kỹ thuật của doanh nghiệp, có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu từng tòa nhà, chi nhánh; văn phòng chưa có nhân viên y tế chuyên trách.'],
      ['Huấn luyện an toàn điện', 'Kỹ thuật viên điện tòa nhà, trung tâm dữ liệu, thợ điện sự kiện. Không thay thế Nhóm 3.'],
      ['Huấn luyện an toàn hóa chất', 'Hóa chất vệ sinh công nghiệp, khử trùng, xử lý nước; mực in, dung môi.'],
      ['Kiểm định kỹ thuật an toàn', 'Thang máy, bình áp lực, nồi hơi, xe nâng, chai khí trong tòa nhà.'],
      ['Quan trắc môi trường lao động', 'Văn phòng đông người, trung tâm liên hệ, phòng máy: ánh sáng, tiếng ồn, vi khí hậu.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Tòa nhà, quầy giao dịch, kho quỹ, trung tâm dữ liệu; kế hoạch ứng phó khẩn cấp.'],
      ['Tư vấn ISO 45001', 'Khi đối tác quốc tế yêu cầu hoặc theo tiêu chí ESG; chuẩn hóa hệ thống quản lý.'],
      ['Đào tạo nghề ngắn hạn', 'Kỹ thuật viên điện, điều hòa, vận hành thiết bị, theo quy định giáo dục nghề nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Văn phòng thì có gì nguy hiểm mà phải huấn luyện?',
      'Mọi người lao động đều phải được huấn luyện theo một trong 6 nhóm; nhân viên văn phòng thuộc Nhóm 4 (tối thiểu 16 giờ, định kỳ hằng năm). Nội dung gắn với thực tế: điện, cháy và thoát hiểm trong tòa nhà, ecgônômi, trượt ngã, ứng phó khẩn cấp.'],
    ['Nhân viên ngồi máy tính cả ngày, trực ca qua màn hình có thuộc Nhóm 3?',
      'Không mặc nhiên. Nhóm công việc “điều hành, điều khiển từ xa qua màn hình” trong Danh mục chỉ công việc như kiểm soát không lưu, không phải mọi công việc dùng máy tính. Đội trực trung tâm điều hành hệ thống (NOC, SOC) là trường hợp ranh giới, chuyên viên rà soát.'],
    ['Hội sở đã có bộ phận an toàn, giám đốc chi nhánh còn phải học?',
      'Có. Người đứng đầu chi nhánh, phòng giao dịch thuộc Nhóm 1 dù hội sở có bộ phận phụ trách: Nhóm 1 học trách nhiệm quản lý, Nhóm 2 học nghiệp vụ thực hiện. Với mạng lưới nhiều chi nhánh, chuyên viên thiết kế lịch theo cụm vùng.'],
    ['Công ty nhỏ dưới 30 người, hồ sơ tối thiểu gồm những gì?',
      'Mọi người lao động đều thuộc một trong 6 nhóm; doanh nghiệp dưới 300 lao động cần ít nhất 01 người làm công tác ATVSLĐ bán chuyên trách. Gói gọn thường gồm: Nhóm 1 cho chủ doanh nghiệp, Nhóm 2 cho người kiêm nhiệm, Nhóm 4 cho nhân viên.'],
    ['Nhân viên hành chính – nhân sự tốt nghiệp kinh tế có kiêm nhiệm ATVSLĐ được không?',
      'Vẫn cần huấn luyện Nhóm 2, nhưng bằng cấp là điều kiện riêng: Điều 36 yêu cầu chuyên ngành khối kỹ thuật (hoặc trực tiếp làm công việc kỹ thuật và có số năm kinh nghiệm). Chuyên viên rà soát trình độ, kinh nghiệm của người được giao.'],
    ['Nhân viên đi xe máy gặp khách bị tai nạn trên đường thì sao?',
      'Người lao động tham gia bảo hiểm tai nạn lao động bị tai nạn trên tuyến đường và trong thời gian hợp lý từ nơi ở đến nơi làm việc có thể được hưởng chế độ tai nạn lao động (Điều 45 Luật ATVSLĐ); điều kiện chi tiết do chuyên viên giải thích. Huấn luyện an toàn giao thông là khóa riêng, Viện chưa cung cấp.'],
    ['Bảo vệ, tạp vụ, kỹ thuật, lái xe thuê ngoài; đại lý, thực tập sinh: ai huấn luyện?',
      'Đơn vị cung ứng dịch vụ là người sử dụng lao động của họ nên huấn luyện cho người của mình; doanh nghiệp kiểm tra hồ sơ, phổ biến nội quy. Cho thuê lại lao động, đại lý, cộng tác viên, thực tập sinh: chuyên viên xác nhận theo từng mô hình hợp đồng.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm, không xếp Nhóm 3 cho người chỉ làm văn phòng; có thể gộp phòng ban thành lớp lớn, chia đợt theo ca, theo cụm chi nhánh.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, chi nhánh, tòa nhà, thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, theo cụm chi nhánh.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Đối tác, khách hàng, cơ quan kiểm tra'),
      ['Huấn luyện tại doanh nghiệp',
        'Gộp các phòng ban thành lớp, chia đợt theo ca, theo cụm chi nhánh để không gián đoạn giao dịch; lịch cụ thể do chuyên viên thiết kế.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 30–32, 36, 37)', 'Trách nhiệm khi thuê lại lao động; bố trí người làm công tác ATVSLĐ (khoản 2 Điều 36) và bộ phận y tế theo quy mô.'],
      DANH_MUC,
      ['Thông tư 19/2016/TT-BYT; QCVN 22, 24, 26:2016/BYT', 'Quản lý vệ sinh lao động, sức khỏe người lao động, sơ cấp cứu; quan trắc môi trường lao động (ánh sáng, tiếng ồn, vi khí hậu).'],
      ['Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ số 55/2024/QH15', 'Phòng cháy, chữa cháy và thoát nạn trong tòa nhà. Huấn luyện nghiệp vụ PCCC là khóa riêng, Viện chưa cung cấp.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('16/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026, Ủy ban Thường vụ Quốc hội đã cho ý kiến ngày 23/9/2026, dự kiến trình '
      + 'Quốc hội tại Kỳ họp thứ Hai (tháng 10/2026) theo trình tự rút gọn; dự án chưa có hiệu lực'),
  },
};
