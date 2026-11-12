// Nội dung tài liệu số 15 – Ngành Logistics – Kho vận.
// Nguồn: “Cẩm nang tư vấn ATVSLĐ – Ngành Logistics – Kho vận” (bản cho nhân viên kinh doanh, thông tin pháp lý đến 17/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Ngành này áp dụng khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP (bảng bố trí một dòng, 3 mức như tài liệu 08, 10).
// Cẩm nang còn dẫn Thông tư 05/2021/TT-BCT và Nghị định 113/2017/NĐ-CP; hai văn bản này đã được thay thế nên không đưa vào.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '15',
  tenFile: '15_LogisticsKhoVan_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Logistics – Kho vận (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp logistics – kho vận – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Logistics – Kho vận',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH LOGISTICS – KHO VẬN',
    gioiThieu: 'Đội xe, kho bãi, kho lạnh, cảng cạn và trung tâm chuyển phát tập trung nhiều thiết bị nặng, di chuyển và bốc xếp '
      + 'liên tục theo ca 24/7, với nhiều lao động thời vụ, thuê lại và đối tác. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh '
      + 'sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị '
      + 'sẵn thông tin cho buổi làm việc với chuyên viên của Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP LOGISTICS – KHO VẬN CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ cao điểm, thử việc, học nghề. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**{{3}} rất đông nhưng không phải ai trong kho cũng là {{3}}:** lái xe ô tô, vận hành xe nâng, cần trục, bốc xếp thường xuyên vật nặng từ 30 kg, làm hàng nguy hiểm thuộc {{3}}; nhân viên kho, soạn hàng, đóng gói, shipper thường thuộc {{4}}.',
      '**Bằng lái, chứng chỉ vận hành xe nâng không thay thế huấn luyện ATVSLĐ:** đó là điều kiện chuyên môn; huấn luyện theo nhóm là yêu cầu riêng của pháp luật ATVSLĐ.',
      '**Thời vụ, thuê lại, đối tác cần làm rõ trước:** lao động thuê lại, nhà thầu, tài xế và shipper đối tác không có hợp đồng lao động là các trường hợp chuyên viên xác nhận ai chịu trách nhiệm huấn luyện.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} định kỳ hằng năm; người nghỉ hoặc kho tạm dừng từ 6 tháng trở lên phải huấn luyện lại. Chi phí do người sử dụng lao động chi trả.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('đội xe, kho bãi, cảng cạn và trung tâm chuyển phát'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ doanh nghiệp, tổng giám đốc, giám đốc; phó giám đốc được giao phụ trách; giám đốc vận hành, kho, trung tâm phân phối, cảng, hub, chi nhánh; trưởng phòng; quản lý kho, quản đốc, trưởng đội xe, đội trưởng bốc xếp.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu; tổ chức bộ máy ATVSLĐ cho nhiều kho, hub; kế hoạch ATVSLĐ theo ca, mùa cao điểm; đánh giá rủi ro xe nâng, hàng đổ, giao thông, hàng nguy hiểm; quản lý thời vụ, thuê lại, nhà thầu; điều tra tai nạn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận HSE, cán bộ ATVSLĐ chuyên trách; người bán chuyên trách, kiêm nhiệm (thường là quản lý kho, trưởng đội xe, cán bộ kỹ thuật).',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kỹ thuật an toàn xe nâng, cần trục, giá kệ, kho lạnh, hàng nguy hiểm, bãi container; tách làn người và xe; kiểm tra hiện trường; điều tra tai nạn, ứng cứu khẩn cấp; quản lý hồ sơ số lượng lớn.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: lái xe tải, đầu kéo, xe bồn, xe lạnh, xe giao hàng ô tô; vận hành xe nâng, cần trục, cầu trục; bốc xếp thường xuyên từ 30 kg; kho hóa chất; vận hành băng tải, hệ thống lạnh; sạc ắc quy; thợ sửa xe, điện, hàn.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả thời vụ, thử việc: nhân viên kho nhập, xuất, kiểm đếm, soạn hàng, đóng gói; công nhân kho lạnh; shipper, bưu tá có hợp đồng lao động; phụ xe; điều phối, chứng từ, văn phòng; bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; đi bộ an toàn trong kho (làn đi bộ, không băng qua trước xe nâng); xếp hàng, không leo giá kệ; mang vác đúng kỹ thuật; lạnh, nóng, bụi, ồn; ca đêm; thoát hiểm; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: nhân viên y tế, y tá, người phụ trách phòng y tế của kho, trung tâm phân phối.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn lao động (xe nâng va chạm, kẹp tay, ngã, hàng đổ, tai nạn giao thông, hạ thân nhiệt); quản lý sức khỏe người làm ca đêm; bệnh nghề nghiệp; xử lý tình huống khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: nhân viên được cử ở từng kho, ca, khu vực, đội xe, bưu cục, kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ (xe nâng chạy sai làn, hàng xếp lệch, giá kệ quá tải, lối thoát bị chặn, sàn trơn); nhắc nhở; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('kho, bãi, đội xe'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – gặp ở nhân sự nghỉ dài hạn quay lại và kho, hub tạm dừng rồi mở lại.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản lý kho trực tiếp lái xe nâng: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ nhân viên kho chuyển sang lái xe nâng, phụ xe chuyển sang lái xe) thì cần huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp logistics cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Vận tải, kho bãi, giao nhận, chuyển phát thuộc nhóm “cơ sở khác” tại khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP (trừ '
        + 'cơ sở có thêm hoạt động thuộc ngành đặc thù như đóng, sửa chữa tàu). Mức tối thiểu:',
      bang: [
        ['Dưới 300 lao động', '01 người **bán chuyên trách**'],
        ['Từ 300 đến dưới 1.000', '01 người **chuyên trách**'],
        ['Từ 1.000 trở lên', 'Phòng ATVSLĐ hoặc ít nhất 02 người **chuyên trách**'],
      ],
      ghiChu: 'Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2 và đáp ứng tiêu chuẩn riêng về trình độ, kinh nghiệm '
        + '(Điều 36). Cách tính lao động khi có nhiều kho, hub, lao động thời vụ, thuê lại, đối tác; bộ phận y tế (Điều 37): '
        + 'chuyên viên Viện STP – DAKO xác nhận.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, kho, cảng, hub, bưu cục, phòng ban) hoặc phụ trách bộ phận vận hành, kỹ thuật, quản lý kho, đội xe?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ tại nơi làm việc?  →  {{2}}',
      'Trực tiếp lái xe ô tô; vận hành xe nâng, cần trục thuộc Danh mục; bốc xếp thủ công thường xuyên vật nặng từ 30 kg; làm hàng hóa chất, xăng dầu; làm việc trên cao từ 2 m, trên mặt nước; điện, sạc ắc quy; hàn cắt; vận hành băng tải?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ doanh nghiệp, chủ tịch HĐQT, tổng giám đốc, giám đốc', '1', 'Người đứng đầu đơn vị.'],
      ['Phó giám đốc; giám đốc vận hành, kho, trung tâm phân phối, cảng, hub, chi nhánh', '1', 'Cấp phó: khi được giao phụ trách.'],
      ['Trưởng phòng; quản lý kho, quản đốc, trưởng đội xe, đội trưởng bốc xếp', '1', 'Phó phòng: khi được giao phụ trách.'],
      ['Trưởng ca, tổ trưởng, trưởng nhóm kho, trưởng nhóm bốc xếp', '4 hoặc 1', 'Phụ trách một bộ phận: Nhóm 1; ranh giới.'],
      ['B. VĂN PHÒNG, AN TOÀN, Y TẾ'],
      ['Điều phối vận tải, chứng từ, giao nhận, hải quan, kinh doanh, kế toán, nhân sự', '4', 'Ra kho, cảng: theo nội quy, PPE nơi đến.'],
      ['Trực giám sát hành trình, trung tâm điều hành qua màn hình', '4 hoặc 3', 'Ranh giới: chuyên viên rà soát.'],
      ['Kiểm đếm (tally), giám sát hiện trường kho, bãi', '4', 'Phổ biến nội quy bãi, PPE.'],
      ['Trưởng bộ phận HSE; cán bộ ATVSLĐ chuyên trách, kiêm nhiệm', '2', 'Trưởng bộ phận: học thêm Nhóm 1.'],
      ['Nhân viên y tế, y tá, phụ trách phòng y tế', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên (kho, ca, khu vực, đội xe, bưu cục)', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['C. VẬN TẢI ĐƯỜNG BỘ'],
      ['Lái xe tải, đầu kéo container, xe lạnh, xe giao hàng ô tô, xe đưa đón', '3', 'Lái xe ô tô thuộc Danh mục.'],
      ['Lái xe chở hàng nguy hiểm, xe bồn xăng dầu, hóa chất', '3', 'Thêm huấn luyện an toàn hóa chất.'],
      ['Phụ xe, lơ xe', '4 hoặc 3', 'Bốc xếp thường xuyên từ 30 kg: Nhóm 3.'],
      ['Áp tải hàng giá trị', '4', 'Vũ khí, công cụ hỗ trợ: quy định riêng.'],
      ['D. KHO, KHO LẠNH, HÀNG NGUY HIỂM'],
      ['Nhân viên kho nhập, xuất; thủ kho; kiểm đếm; soạn hàng; đóng gói; QC kho', '4', 'Lên giá kệ cao từ 2 m: ranh giới.'],
      ['Vận hành xe nâng hàng dùng động cơ từ 1.000 kg; xe nâng người tự hành', '3', 'Thiết bị phải kiểm định.'],
      ['Xe nâng tay không động cơ, xe đẩy; xe nâng điện đi bộ tải trọng nhỏ', '4', 'Xe nâng điện đi bộ: chuyên viên xác nhận.'],
      ['Vận hành cần trục, cầu trục, palăng từ 1.000 kg', '3', 'Thiết bị thuộc Danh mục.'],
      ['Bốc xếp thủ công thường xuyên vật nặng từ 30 kg', '3', 'Hỏi khối lượng, tần suất, số người.'],
      ['Vận hành, bảo trì băng tải, hệ thống phân loại, kho tự động', '3', 'Chỉ đặt, lấy hàng trên băng tải: ranh giới.'],
      ['Công nhân kho lạnh (soạn hàng, đóng gói, xếp hàng)', '4', 'Nhiệt độ thấp có trong nội dung huấn luyện.'],
      ['Vận hành, bảo dưỡng hệ thống lạnh, bình áp lực', '3', 'Hệ thống lạnh: chuyên viên xác nhận.'],
      ['Thủ kho, công nhân kho hóa chất, hàng nguy hiểm', '3', 'Thêm huấn luyện an toàn hóa chất.'],
      ['Vận hành trạm sạc, thay, bảo dưỡng ắc quy xe nâng', '3', 'Thêm huấn luyện an toàn điện.'],
      ['E. CẢNG, CẢNG CẠN, BÃI CONTAINER, KỸ THUẬT'],
      ['Lái cẩu bờ, cẩu RTG, cần trục; reach stacker, xe nâng container', '3', 'Thiết bị phải kiểm định.'],
      ['Buộc, tháo chằng container; làm việc trên cầu tàu, xà lan, trên cao', '3', 'Trên cao, trên mặt nước.'],
      ['Lái xe đầu kéo nội bộ cảng; xe nâng trong bãi', '3', 'Lái xe ô tô, thiết bị thuộc Danh mục.'],
      ['Vận hành máy soi container', '3 hoặc 4', 'Thiết bị có bức xạ: chuyên viên xác nhận.'],
      ['Thợ sửa chữa ô tô, thợ lốp, điện ô tô; thợ điện, cơ khí, hàn', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Kỹ thuật viên bảo trì xe nâng, cần trục, băng tải', '3', 'Theo thiết bị thuộc Danh mục.'],
      ['Nhân viên rửa xe; thủ kho phụ tùng', '4', 'Hóa chất nguy hiểm: chuyên viên xem xét.'],
      ['F. CHUYỂN PHÁT, HẬU CẦN, THỜI VỤ, ĐỐI TÁC'],
      ['Shipper, bưu tá có hợp đồng lao động; nhân viên bưu cục, phân loại tại hub', '4', 'Đứng ở băng tải phân loại: ranh giới.'],
      ['Bảo vệ kho, cổng, bãi, trạm cân; lao công, tạp vụ; bếp ăn tập thể', '4 hoặc 3', 'Bếp ăn từ 300 suất/ngày trở lên: Nhóm 3.'],
      ['Lao động thời vụ cao điểm có hợp đồng lao động', 'Theo công việc', 'Lái xe nâng, bốc xếp nặng: Nhóm 3.'],
      ['Lao động thuê lại; nhà thầu bốc xếp, bảo vệ, vệ sinh, sửa chữa', 'Theo công việc', 'Chuyên viên xác nhận bên huấn luyện.'],
      ['Chủ xe độc lập, tài xế, shipper đối tác (không có hợp đồng lao động)', 'Ranh giới', 'Chuyên viên xác nhận; không bán thừa, không bỏ sót.'],
      ['Tài xế của khách, đối tác vào kho nhận hàng; khách tham quan', '—', 'Không thuộc 6 nhóm; hướng dẫn tại cổng.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG LOGISTICS – KHO VẬN: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao làm việc trong kho không mặc nhiên là Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông '
      + 'tư 06/2020/TT-BLĐTBXH) chỉ nêu một số việc: lái xe ô tô; vận hành xe nâng, cần trục thuộc Danh mục; bốc xếp thủ công '
      + 'thường xuyên vật nặng từ 30 kg; hóa chất nguy hiểm, xăng dầu; trên cao, trên mặt nước; điện, ắc quy; hàn cắt; băng '
      + 'tải. Nhân viên kho, soạn hàng, đóng gói, shipper thường thuộc Nhóm 4.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại kho, bãi, đội xe:',
    nghe: [
      ['Lái xe tải, đầu kéo', 'Xe tải, container, xe lạnh',
        'Mệt mỏi, điểm mù, lùi xe, hàng xếp lệch, quá tải; kiểm tra xe trước chuyến; lên xuống cabin, mở cửa thùng, chằng buộc hàng, trên nóc container; nạp nhiên liệu, thay lốp, kê kích.'],
      ['Xe nâng, cần trục', 'Xe nâng, cầu trục, palăng',
        'Lật xe, va chạm người đi bộ, hàng rơi; kiểm tra trước ca; tải trọng, tâm tải, chiều cao nâng; không chở người trên càng; dock, container; tín hiệu, vùng nguy hiểm dưới tải.'],
      ['Bốc xếp, băng tải', 'Bốc xếp nặng, phân loại',
        'Kỹ thuật nâng, mang vác, nâng chung; dụng cụ hỗ trợ; lên xuống thùng xe, container, hàng đổ khi mở cửa; băng tải: che chắn, nút dừng khẩn cấp, không với tay vào chỗ chuyển động.'],
      ['Hàng nguy hiểm', 'Kho hóa chất, xe bồn',
        'Phân loại theo GHS, nhãn, bảng dữ liệu an toàn; không để lẫn hàng xung khắc; thông gió, tĩnh điện; kiểm tra bao bì, rò rỉ; cô lập khu vực, xử lý ban đầu khi tràn đổ; sơ cứu.'],
      ['Kho lạnh', 'Kho lạnh, hệ thống lạnh',
        'Quần áo, găng chống lạnh; thời gian làm, nghỉ; hạ thân nhiệt; mở cửa từ bên trong, nút báo động; rò rỉ môi chất lạnh (amoniac); xe nâng trong kho lạnh; trơn trượt, đọng sương.'],
      ['Cảng, bãi container', 'Chằng buộc, cầu tàu, xà lan',
        'Va chạm xe, container rơi, vùng dưới cần cẩu; buộc, tháo chằng trên cao, trên tàu, xà lan; áo phao, cứu người rơi xuống nước; tín hiệu với lái cẩu; nhãn hàng nguy hiểm.'],
      ['Kỹ thuật, bảo trì', 'Sửa xe, điện, sạc ắc quy',
        'Cầu nâng, kích: kê chống, không làm dưới gầm khi chưa chắc chắn; axit ắc quy, khí nổ, phòng sạc thông gió; cô lập nguồn khi bảo trì băng tải; hàn, cắt: cháy nổ, chai khí.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy quy mô, loại hình và thiết bị của kho, bãi, đội xe, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Kiểm định kỹ thuật an toàn', 'Xe nâng hàng dùng động cơ từ 1.000 kg, cần trục, cầu trục, palăng, bình áp lực, hệ thống lạnh.'],
      ['Huấn luyện an toàn điện', 'Trạm sạc ắc quy xe nâng, tủ điện kho, băng tải, hệ thống kho lạnh, thợ điện bảo trì.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu từng kho, hub: tai nạn xe nâng, kẹp, ngã, hàng đổ; kho xa cơ sở y tế.'],
      ['Huấn luyện an toàn hóa chất', 'Kho hóa chất, hàng nguy hiểm theo phân loại GHS, xe bồn, hóa chất rửa xe, bảo dưỡng.'],
      ['Quan trắc môi trường lao động', 'Nóng ở kho mái tôn, lạnh ở kho lạnh, bụi, ồn xe nâng, băng tải, khí thải xe nâng.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Kho, bãi, cảng, hub, kho lạnh, kho hàng nguy hiểm; luồng người và xe nâng.'],
      ['Tư vấn ISO 45001', '3PL, cảng, hãng giao nhận có yêu cầu của chủ hàng, đối tác quốc tế, tiêu chí ESG.'],
      ['Đào tạo nghề ngắn hạn', 'Người vận hành thiết bị, thợ sửa chữa theo quy định giáo dục nghề nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Tài xế đã có bằng lái, công nhân có chứng chỉ xe nâng, còn phải học Nhóm 3?',
      'Có. Bằng lái là điều kiện theo luật giao thông, chứng chỉ vận hành xe nâng là chuyên môn; Nhóm 3 là huấn luyện ATVSLĐ cho người làm công việc thuộc Danh mục. Hai việc khác nhau, không thay thế nhau.'],
    ['Nhân viên kho ngày nào cũng làm gần xe nâng, có phải Nhóm 3 không?',
      'Không. Nhân viên kho thuộc Nhóm 4, trừ khi trực tiếp vận hành thiết bị thuộc Danh mục, thường xuyên bốc xếp từ 30 kg hoặc làm việc trên cao từ 2 m. Họ học nội quy an toàn khi làm việc cùng xe nâng: làn đi bộ, không đứng dưới tải, không băng qua trước xe.'],
    ['Bốc xếp thùng 10–15 kg cả ngày, đứng ở băng tải phân loại có phải Nhóm 3?',
      'Danh mục nêu bốc xếp thủ công thường xuyên vật nặng từ 30 kg, và vận hành, bảo dưỡng, vệ sinh băng tải. Hàng nhẹ hơn thường là Nhóm 4; người chỉ đặt, lấy hàng trên băng tải là ranh giới. Chuyên viên xác nhận theo khối lượng, tần suất, mô tả công việc.'],
    ['Xe nâng, cần trục, hệ thống kho lạnh có phải kiểm định không?',
      'Xe nâng hàng dùng động cơ có tải trọng nâng từ 1.000 kg trở lên, cần trục, cầu trục, palăng, bình áp lực phải kiểm định; hệ thống lạnh theo điều kiện về môi chất và lượng nạp. Xe nâng tay không động cơ không thuộc danh mục. Viện STP – DAKO có dịch vụ kiểm định.'],
    ['Mùa cao điểm thuê hàng trăm người qua công ty cung ứng: ai huấn luyện?',
      'Tùy mô hình: cho thuê lại lao động (Điều 30–32 Nghị định 39/2016/NĐ-CP) hay hợp đồng dịch vụ; chuyên viên xác nhận theo hợp đồng. Công việc thuộc Danh mục vẫn là Nhóm 3 dù thời vụ. Nên yêu cầu nhà cung ứng nộp hồ sơ; Viện huấn luyện theo đợt trước cao điểm.'],
    ['Tài xế, shipper là đối tác, chủ xe độc lập: có phải huấn luyện?',
      'Quy định hiện hành nêu đối tượng là người lao động theo hợp đồng lao động, thử việc, học nghề; Nhà nước có chính sách hỗ trợ huấn luyện cho người làm việc không theo hợp đồng lao động. Chuyên viên xác nhận theo từng mô hình hợp tác, không bán thừa, không bỏ sót.'],
    ['Có huấn luyện lái xe an toàn, phòng cháy chữa cháy kho không?',
      'Nhóm 3 có nội dung nguy hiểm khi lái xe và biện pháp phòng ngừa. Huấn luyện lái xe an toàn, thời gian lái xe, giám sát hành trình, nghiệp vụ phòng cháy chữa cháy, vận chuyển hàng nguy hiểm là quy định chuyên ngành, Viện chưa cung cấp; chuyên viên ghi nhận để phối hợp.'],
    ['Đội xe chạy tuyến dài, kho làm 3 ca: tổ chức huấn luyện và chi phí thế nào?',
      'Chia đợt nhỏ khi xe về bãi, theo ca, theo kho; chuyên viên thiết kế lịch. Chi phí theo nhóm, số học viên, địa điểm, hình thức; do người sử dụng lao động chi trả. Có thể ưu tiên Nhóm 1, 2 và lái xe, xe nâng, hàng nguy hiểm trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo kho, ca, đội xe.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, theo mùa cao điểm.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Chủ hàng, cảng, đối tác vận tải'),
      ['Huấn luyện tại kho, bãi',
        'Chia đợt theo ca, theo kho, khi xe về bãi; huấn luyện nhanh trước mùa cao điểm; thực hành tại chỗ trên xe nâng, giá kệ, dock của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 2, 30–32, 36, 37)', 'Đối tượng áp dụng (Điều 2); lao động thuê lại (Điều 30–32); bố trí người làm công tác ATVSLĐ (khoản 2 Điều 36) và y tế (Điều 37).'],
      DANH_MUC,
      ['Thông tư 19/2016/TT-BYT', 'Quản lý vệ sinh lao động, sức khỏe người lao động, sơ cấp cứu; quan trắc môi trường lao động.'],
      ['Pháp luật giao thông đường bộ, kinh doanh vận tải; Luật Phòng cháy, chữa cháy và cứu nạn, cứu hộ số 55/2024/QH15', 'Giấy phép lái xe, thời gian lái xe, giám sát hành trình; phòng cháy chữa cháy kho, bãi: quy định riêng, không thay thế huấn luyện ATVSLĐ.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('17/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026, Ủy ban Thường vụ Quốc hội đã cho ý kiến ngày 23/9/2026, dự kiến trình Quốc '
      + 'hội tại Kỳ họp thứ Hai (tháng 10/2026) theo trình tự rút gọn; dự án chưa có hiệu lực'),
  },
};
