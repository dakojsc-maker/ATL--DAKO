// Nội dung tài liệu số 17 – Ngành Y tế.
// Nguồn: “Cẩm nang tư vấn ATVSLĐ – Ngành Y tế” (bản cho nhân viên kinh doanh, thông tin pháp lý đến 20/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Ngành này thường áp dụng khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP (bảng bố trí một dòng, 3 mức như tài liệu 08, 10, 15).
// Điểm riêng: nhân viên chuyên môn y tế có thể thuộc Nhóm 3 và/hoặc Nhóm 5 (ghi "3/5" trong bảng tra); chuyên viên chốt.
// Cẩm nang còn dẫn Thông tư 05/2021/TT-BCT và Nghị định 113/2017/NĐ-CP; hai văn bản này đã được thay thế nên không đưa vào.

const chung = require('../khung/noi_dung_chung');

const [, , , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '17',
  tenFile: '17_YTe_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Y tế (tài liệu dành cho cơ sở y tế)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho cơ sở y tế – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Y tế',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH Y TẾ',
    gioiThieu: 'Bệnh viện, phòng khám, trung tâm y tế, cơ sở xét nghiệm, chẩn đoán hình ảnh, dược và chăm sóc người bệnh làm '
      + 'việc 24/7, với nguy cơ phơi nhiễm máu và dịch cơ thể, vật sắc nhọn, hóa chất khử khuẩn, thuốc độc hại, bức xạ, nâng '
      + 'người bệnh và bạo lực nơi làm việc. Tài liệu này giúp Quý Cơ sở nắm nhanh sáu nhóm huấn luyện an toàn, vệ sinh lao '
      + 'động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin cho buổi làm việc với '
      + 'chuyên viên của Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU CƠ SỞ Y TẾ CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động của cơ sở y tế đều phải được huấn luyện ATVSLĐ**, kể cả viên chức của bệnh viện, trung tâm y tế công lập, người thử việc, thời vụ. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Bác sĩ, điều dưỡng, kỹ thuật viên có thể thuộc {{3}} và/hoặc {{5}}:** Danh mục công việc nghiêm ngặt có khám, chữa bệnh, chăm sóc người bệnh, xét nghiệm, giải phẫu bệnh, dược; đồng thời họ là người làm công tác y tế. Phương án xếp nhóm do chuyên viên xác định.',
      '**Nhiều vị trí hỗ trợ cũng thuộc {{3}}:** vệ sinh môi trường, chất thải y tế, xử lý nước thải; tiệt khuẩn, giặt là; nhà xác; chẩn đoán hình ảnh; kỹ thuật điện, khí y tế, thang máy; lái xe cứu thương.',
      '**Chứng chỉ hành nghề, quy định chuyên ngành không thay thế huấn luyện ATVSLĐ:** chứng chỉ hành nghề, đào tạo liên tục, kiểm soát nhiễm khuẩn, an toàn bức xạ, quản lý chất thải y tế là yêu cầu riêng của ngành y tế.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} định kỳ hằng năm; người nghỉ từ 6 tháng trở lên (thai sản, ốm đau, đi học) phải huấn luyện lại. Chi phí do người sử dụng lao động chi trả.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('bệnh viện, phòng khám, trung tâm y tế và cơ sở dược'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ tịch HĐQT, giám đốc, chủ phòng khám, giám đốc trung tâm y tế; phó giám đốc được giao phụ trách; trưởng phòng chức năng; giám đốc chi nhánh, phòng khám vệ tinh; trưởng khoa, phó khoa.',
        hocGi: 'Pháp luật, trách nhiệm người quản lý với an toàn của nhân viên; tổ chức công tác ATVSLĐ; kế hoạch hằng năm; đánh giá rủi ro theo khoa, phòng (phòng mổ, cấp cứu, xét nghiệm, chẩn đoán hình ảnh, tiệt khuẩn, chất thải); quản lý nhà thầu; trực 24/7.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận HSE, trưởng phòng ATVSLĐ; cán bộ ATVSLĐ chuyên trách, bán chuyên trách; người kiêm nhiệm ở phòng Tổ chức – Hành chính hoặc Vật tư – Thiết bị.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; đánh giá rủi ro khoa, phòng nguy cơ cao; phơi nhiễm nghề nghiệp, hóa chất, thiết bị áp lực, khí y tế, thang máy; phối hợp với kiểm soát nhiễm khuẩn, quản lý chất lượng; quản lý nhà thầu; điều tra tai nạn.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: khám, chữa bệnh, chăm sóc người bệnh, xét nghiệm, giải phẫu bệnh, dược (theo phương án chuyên viên); hộ lý; chẩn đoán hình ảnh, xạ trị; tiệt khuẩn, giặt là; vệ sinh, chất thải; kỹ thuật điện, khí y tế; lái xe cứu thương.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả thử việc, thời vụ: kế toán, thu ngân, viện phí, bảo hiểm y tế, tổ chức, hành chính; tiếp đón, tổng đài, CNTT; quản lý thiết bị, vật tư; bảo vệ, tạp vụ khu hành chính; nhân viên bếp ăn.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy cơ sở; phòng ngừa lây nhiễm cơ bản khi tiếp xúc người bệnh, người nhà; bạo lực nơi làm việc, xử lý xung đột; điện, cháy, thoát nạn; trơn trượt; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: cán bộ y tế lao động chăm sóc sức khỏe người lao động của cơ sở; nhân viên chuyên môn y tế theo phương án chuyên viên.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn lao động (kim đâm, phơi nhiễm, bỏng hóa chất, điện giật, chấn thương khi nâng người bệnh); quản lý sức khỏe, bệnh nghề nghiệp của nhân viên; xử lý tình huống khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: điều dưỡng trưởng, kỹ thuật viên trưởng hoặc nhân viên có kinh nghiệm ở từng khoa, phòng, tổ, ca, kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ (vật sắc nhọn để sai chỗ, thiếu PPE, hóa chất đổ tràn, sàn trơn, thiết bị hỏng); nhắc nhở; báo cáo sự cố, phơi nhiễm.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('cơ sở'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – hay gặp khi nhân viên nghỉ thai sản, ốm đau, đi học dài ngày.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ trưởng khoa trực tiếp khám, chữa bệnh: {{1}} và nhóm theo công việc chuyên môn) – huấn luyện đủ các nhóm tương ứng.',
      '**Sinh viên, học viên thực tập lâm sàng, bác sĩ nội trú:** trách nhiệm huấn luyện giữa trường và cơ sở thực tập theo thỏa thuận; chuyên viên xác nhận.',
    ],
    canBo: {
      tieuDe: 'Cơ sở y tế cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Ngành y tế không thuộc nhóm có yêu cầu cao ở khoản 1 Điều 36 Nghị định 39/2016/NĐ-CP nên thường áp dụng khoản 2 '
        + '(cơ sở có xưởng sản xuất thuốc, giặt là công nghiệp, lò đốt riêng: chuyên viên xem xét). Mức tối thiểu:',
      bang: [
        ['Dưới 300 lao động', '01 người **bán chuyên trách**'],
        ['Từ 300 đến dưới 1.000', '01 người **chuyên trách**'],
        ['Từ 1.000 trở lên', 'Phòng ATVSLĐ hoặc ít nhất 02 người **chuyên trách**'],
      ],
      ghiChu: 'Cán bộ ATVSLĐ khác với cán bộ khám chữa bệnh và người phụ trách y tế lao động; phải học Nhóm 2 và đáp ứng tiêu '
        + 'chuẩn trình độ (Điều 36), bằng y khoa có phù hợp hay không do chuyên viên Viện STP – DAKO xác nhận. Bộ phận y tế lao '
        + 'động tổ chức theo Điều 37.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (bệnh viện, trung tâm, phòng khám, phòng chức năng, khoa) hoặc phụ trách bộ phận chuyên môn, kỹ thuật, hành chính?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp khám, chữa bệnh, chăm sóc người bệnh, xét nghiệm, giải phẫu bệnh, dược; làm việc với bức xạ; hóa chất, khử trùng; vệ sinh môi trường, chất thải, nước thải; vận hành thiết bị áp lực, thang máy; điện; lái xe; trên cao; bếp từ 300 suất/ngày?  →  {{3}}',
      'Làm công tác y tế  →  xem xét {{5}} (nhân viên chuyên môn: chuyên viên chốt cùng câu 3). Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ tịch HĐQT, giám đốc, tổng giám đốc, chủ phòng khám, giám đốc trung tâm y tế', '1', 'Trực tiếp khám bệnh: thêm nhóm theo công việc.'],
      ['Phó giám đốc (chuyên môn, kế hoạch, hành chính, kỹ thuật, điều dưỡng)', '1', 'Cấp phó: khi được giao phụ trách.'],
      ['Trưởng phòng chức năng (tổ chức, hành chính, kế hoạch, điều dưỡng, vật tư, dược...)', '1', 'Phó phòng: khi được giao phụ trách.'],
      ['Giám đốc chi nhánh, phòng khám vệ tinh, trạm y tế trực thuộc', '1', 'Người đứng đầu đơn vị trực thuộc.'],
      ['Trưởng khoa, phó khoa (lâm sàng, cận lâm sàng, dược)', '1 + 3/5', 'Đứng đầu khoa và trực tiếp làm chuyên môn.'],
      ['Điều dưỡng trưởng khoa, kỹ thuật viên trưởng, hộ sinh trưởng', '3/5', 'Phụ trách bộ phận độc lập: xem xét Nhóm 1.'],
      ['B. KHÁM, CHỮA BỆNH, CHĂM SÓC NGƯỜI BỆNH'],
      ['Bác sĩ, y sĩ, bác sĩ răng hàm mặt, y học cổ truyền, nhân viên khám bệnh', '3/5', 'Chuyên viên chốt Nhóm 3 và/hoặc Nhóm 5.'],
      ['Điều dưỡng, hộ sinh, kỹ thuật viên vật lý trị liệu, phục hồi chức năng, gây mê', '3/5', 'Chuyên viên chốt Nhóm 3 và/hoặc Nhóm 5.'],
      ['Nhân viên cấp cứu, hồi sức, phòng mổ, phòng đẻ, nhi sơ sinh', '3/5', 'Phơi nhiễm, khí gây mê, bạo lực cao.'],
      ['Hộ lý, điều dưỡng hỗ trợ, chăm sóc người cao tuổi, người khuyết tật; vận chuyển người bệnh', '3', 'Chăm sóc người bệnh, người khuyết tật.'],
      ['C. XÉT NGHIỆM, CHẨN ĐOÁN HÌNH ẢNH, DƯỢC'],
      ['Kỹ thuật viên, bác sĩ xét nghiệm (huyết học, hóa sinh, vi sinh); ngân hàng máu', '3/5', 'Xét nghiệm vi sinh vật; hóa chất.'],
      ['Giải phẫu bệnh, giám định pháp y, nhà xác', '3', 'Hóa chất bảo quản, lây nhiễm.'],
      ['Kỹ thuật viên, bác sĩ X-quang, CT, can thiệp, siêu âm, thăm dò chức năng', '3/5', 'An toàn bức xạ: quy định riêng.'],
      ['Cộng hưởng từ; xạ trị, y học hạt nhân, kỹ sư vật lý y học', '3', 'Bức xạ, điện từ trường: chuyên viên xác nhận.'],
      ['Dược sĩ, kỹ thuật viên dược, thủ kho thuốc, pha chế (kể cả thuốc gây độc tế bào)', '3/5', 'Công việc trong lĩnh vực dược; hóa chất.'],
      ['Kho lạnh dược, vắc-xin, kho vật tư y tế tiêu hao', '4', 'Hóa chất nguy hiểm, hệ thống lạnh: Nhóm 3.'],
      ['D. TIỆT KHUẨN, GIẶT LÀ, VỆ SINH, CHẤT THẢI'],
      ['Trung tâm tiệt khuẩn: nồi hấp, máy rửa, hóa chất khử khuẩn mức độ cao', '3', 'Khử trùng; nồi hấp có thể là thiết bị áp lực.'],
      ['Nhân viên kiểm soát nhiễm khuẩn', '3/5', 'Lâm sàng và giám sát: chuyên viên xác nhận.'],
      ['Giặt là đồ vải y tế (máy giặt công nghiệp, ly tâm, sấy)', '3', 'Đồ vải lây nhiễm; chuyên viên xác nhận.'],
      ['Vệ sinh bệnh viện, hộ lý vệ sinh khu chuyên môn', '3', 'Chỉ vệ sinh khu hành chính: có thể Nhóm 4.'],
      ['Thu gom, vận chuyển chất thải y tế; xử lý nước thải; lò đốt', '3', 'Không gian hạn chế, lò thiêu.'],
      ['E. KỸ THUẬT, AN TOÀN, HÀNH CHÍNH, HẬU CẦN'],
      ['Kỹ sư, kỹ thuật viên thiết bị y tế, điện, cơ điện, điều hòa, thang máy, máy phát', '3', 'Thêm huấn luyện an toàn điện.'],
      ['Vận hành khí y tế (oxy trung tâm, bình, bồn oxy), nồi hơi, hệ thống lạnh', '3', 'Thiết bị áp lực, đường ống khí.'],
      ['Quản lý thiết bị, vật tư (hồ sơ, đấu thầu, kho)', '4', 'Trực tiếp kiểm tra thiết bị nghiêm ngặt: Nhóm 3.'],
      ['Trưởng bộ phận HSE; cán bộ ATVSLĐ chuyên trách, kiêm nhiệm', '2', 'Trưởng bộ phận: học thêm Nhóm 1.'],
      ['Cán bộ y tế lao động (chăm sóc sức khỏe người lao động)', '5', 'Đồng thời khám bệnh: chuyên viên xem xét.'],
      ['An toàn, vệ sinh viên tại khoa, phòng, tổ, ca', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['Kế toán, thu ngân, viện phí, bảo hiểm y tế, tổ chức, hành chính, mua sắm', '4', 'Làm việc văn phòng.'],
      ['Tiếp đón, đăng ký khám, chăm sóc khách hàng, tổng đài, CNTT', '4', 'Phòng ngừa lây nhiễm, bạo lực nơi làm việc.'],
      ['Lái xe cứu thương, xe đưa đón, xe vận chuyển', '3', 'Lái xe ô tô thuộc Danh mục.'],
      ['Bảo vệ, tạp vụ khu hành chính; nhân viên bếp ăn', '4 hoặc 3', 'Bếp từ 300 suất/ngày: xem xét Nhóm 3.'],
      ['F. ĐÀO TẠO, THỜI VỤ, NHÀ THẦU, KHÁCH'],
      ['Sinh viên, học viên thực tập lâm sàng, bác sĩ nội trú', 'Theo công việc', 'Theo thỏa thuận với trường; chuyên viên xác nhận.'],
      ['Hợp đồng thời vụ, thử việc, học việc, tình nguyện viên', 'Theo công việc', 'Huấn luyện trước khi giao việc.'],
      ['Nhà thầu vệ sinh, giặt là, chất thải, bảo vệ, suất ăn, bảo trì; lao động thuê lại', 'Theo công việc', 'Nhà thầu huấn luyện người của mình.'],
      ['Kỹ sư hãng thiết bị, trình dược viên, đoàn kiểm tra, người bệnh, người nhà', '—', 'Không thuộc 6 nhóm; phổ biến nội quy, PPE.'],
    ],
    ghiChu: '“3/5”: Nhóm 3 và/hoặc Nhóm 5, phương án chính thức do chuyên viên Viện STP – DAKO xác định theo vị trí, khoa, phòng. '
      + 'Bảng dùng để ước tính ban đầu; danh sách chính thức được rà soát theo công việc thực tế của từng người.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG CƠ SỞ Y TẾ: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao nhiều nhân viên y tế thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông tư '
      + '06/2020/TT-BLĐTBXH) nêu: khám, chữa bệnh; chăm sóc người bệnh, người khuyết tật; giải phẫu bệnh, xét nghiệm vi sinh '
      + 'vật; công việc trong lĩnh vực dược; bức xạ; hóa chất, khử trùng; vệ sinh môi trường, xử lý chất thải, nước thải; '
      + 'thiết bị áp lực, điện, lái xe. Hành chính, tiếp đón thuộc Nhóm 4.',
    dan: 'Viện STP – DAKO bổ sung nội dung ATVSLĐ theo đúng công việc tại cơ sở y tế (không thay chuyên môn y khoa, kiểm soát '
      + 'nhiễm khuẩn, an toàn bức xạ):',
    nghe: [
      ['Khám, chữa bệnh', 'Bác sĩ, điều dưỡng, hộ lý',
        'Phòng ngừa chuẩn, vệ sinh tay, PPE; vật sắc nhọn: không đậy lại nắp kim, hộp đựng tại nơi dùng; xử trí khi kim đâm, dịch bắn; nâng, di chuyển người bệnh; bạo lực, trực đêm.'],
      ['Cấp cứu, phòng mổ', 'Hồi sức, phòng mổ, đỡ đẻ',
        'Phơi nhiễm máu, dịch tần suất cao; vật sắc nhọn trong mổ; khí gây mê, thông gió; dao điện, thiết bị điện; cháy nổ khi dùng oxy; bức xạ trong phòng mổ: thời gian, khoảng cách, che chắn.'],
      ['Xét nghiệm, nhà xác', 'Xét nghiệm, giải phẫu bệnh',
        'Xử lý mẫu bệnh phẩm, tràn đổ; formalin, thuốc nhuộm, hóa chất; tủ an toàn sinh học; máy ly tâm, nồi hấp, tủ lạnh sâu; mảnh thủy tinh; nâng thi thể, hóa chất bảo quản.'],
      ['Chẩn đoán hình ảnh', 'X-quang, CT, MRI, xạ trị',
        'Nhận biết nguy cơ bức xạ, trường điện từ; thời gian, khoảng cách, che chắn, áo chì; biển cảnh báo; thiết bị công suất lớn; khí heli, oxy; nâng người bệnh lên bàn chụp; mất điện.'],
      ['Dược, pha chế', 'Dược sĩ, kho thuốc',
        'Thuốc gây độc tế bào: tủ pha chế, PPE, xử lý đổ tràn, chất thải; cồn, dung môi: nhãn, bảng dữ liệu an toàn, thông gió; kho lạnh: nhiệt độ thấp, rò môi chất; nâng, xếp hàng.'],
      ['Tiệt khuẩn, giặt là', 'Nồi hấp, hóa chất khử khuẩn',
        'Hóa chất khử khuẩn mức độ cao: thông gió, PPE hô hấp, rửa mắt; nồi hấp: không mở khi còn áp, bỏng hơi; dụng cụ, đồ vải nhiễm khuẩn; máy giặt, vắt, sấy: kẹp, cuốn, nhiệt.'],
      ['Chất thải, kỹ thuật', 'Chất thải, nước thải; cơ điện',
        'Vật sắc nhọn lọt vào túi, thùng; hố ga, bể nước thải: đo khí, người canh gác, cứu hộ; lò đốt: nhiệt, tro; khí y tế: rò rỉ oxy, dầu mỡ; khóa – gắn thẻ; thang máy: cứu người kẹt.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy loại hình, quy mô và thiết bị của cơ sở, có thể cần thêm các nội dung sau; chuyên viên Viện STP – DAKO sẽ xác '
      + 'định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu cho nhân viên không chuyên môn y: hành chính, bảo vệ, hộ lý, nhà thầu.'],
      ['Huấn luyện an toàn hóa chất', 'Hóa chất khử khuẩn, formalin, cồn, thuốc gây độc tế bào, khí y tế, hóa chất xét nghiệm.'],
      ['Huấn luyện an toàn điện', 'Thợ điện, kỹ thuật viên thiết bị y tế, trạm biến áp, máy phát, tủ điện khu mổ, hồi sức.'],
      ['Kiểm định kỹ thuật an toàn', 'Nồi hấp tiệt trùng, bình, bồn oxy, nồi hơi, hệ thống lạnh, thang máy, đường ống khí.'],
      ['Quan trắc môi trường lao động', 'Xét nghiệm, pha chế, xử lý chất thải, giặt là, kho hóa chất: hơi hóa chất, ồn, nhiệt.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Phòng mổ, cấp cứu, hồi sức, xét nghiệm, tiệt khuẩn, chất thải; khoa, thiết bị mới.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Thiết bị đo nhiệt độ, độ ẩm, khối lượng, điện ở phòng xét nghiệm, kho lạnh, kho thuốc.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Bệnh viện, chuỗi phòng khám, đối tác bảo hiểm có yêu cầu; nghề hộ lý, vệ sinh, bảo trì.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Bác sĩ, điều dưỡng học Nhóm 3 hay Nhóm 5?',
      'Có hai căn cứ cùng áp dụng cho nhân viên chuyên môn: Danh mục có công việc khám, chữa bệnh, chăm sóc người bệnh, xét nghiệm, dược (Nhóm 3, tối thiểu 24 giờ), và họ là người làm công tác y tế (Nhóm 5, tối thiểu 56 giờ). Chuyên viên xác định phương án chính thức theo vị trí, khoa, phòng trước khi báo giá.'],
    ['Bác sĩ đã có chứng chỉ hành nghề, học đào tạo liên tục, còn phải học ATVSLĐ?',
      'Có. Chứng chỉ hành nghề và đào tạo liên tục là yêu cầu chuyên môn y khoa; huấn luyện ATVSLĐ là yêu cầu về an toàn của chính người lao động theo Luật ATVSLĐ. Nội dung khác nhau, không thay thế nhau.'],
    ['Đã có khoa Kiểm soát nhiễm khuẩn, phòng Quản lý chất lượng, còn cần ATVSLĐ?',
      'Cần. Kiểm soát nhiễm khuẩn, quản lý chất lượng là hệ thống chuyên môn của ngành y tế; huấn luyện ATVSLĐ và cán bộ ATVSLĐ là yêu cầu của pháp luật lao động về an toàn của nhân viên. Các bộ phận phối hợp với nhau, không thay thế nhau.'],
    ['Bệnh viện công lập, nhân viên là viên chức, có thuộc đối tượng không?',
      'Có. Luật ATVSLĐ áp dụng cả với cán bộ, công chức, viên chức, nên bệnh viện, trung tâm y tế công lập cũng thuộc đối tượng. Đơn vị công lập mua dịch vụ theo quy định về mua sắm, dự toán; Viện cung cấp hồ sơ năng lực, báo giá theo quy trình của đơn vị.'],
    ['Nhân viên X-quang đã có chứng chỉ an toàn bức xạ, còn phải học Nhóm 3?',
      'Chứng chỉ an toàn bức xạ là yêu cầu chuyên ngành; huấn luyện Nhóm 3 là yêu cầu ATVSLĐ riêng cho công việc bức xạ thuộc Danh mục. Viện không cấp chứng chỉ an toàn bức xạ, không đo liều; chuyên viên đối chiếu chứng nhận cũ để đề xuất phần còn thiếu.'],
    ['Nồi hấp, hệ thống oxy, thang máy, máy thở có phải kiểm định?',
      'Thang máy, nồi hơi, bình chịu áp lực, chai khí, đường ống áp lực thuộc danh mục kiểm định chung; nồi hấp, bình và bồn oxy tùy thông số, chuyên viên đối chiếu. Trang thiết bị y tế chuyên dụng (máy thở, máy gây mê) chịu quy định riêng của ngành y tế, ngoài phạm vi của Viện.'],
    ['Khoa trực 24/7, nhà thầu vệ sinh, giặt là, chất thải: tổ chức thế nào?',
      'Chia đợt nhỏ theo ca, theo khoa, vẫn giữ đủ người trực; huấn luyện tại chỗ theo lịch trực do cơ sở cung cấp. Nhà thầu là người sử dụng lao động của công nhân, chịu trách nhiệm huấn luyện; cơ sở kiểm tra chứng nhận (tra cứu theo mã) trước khi cho vào khu vực.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm, không thừa; có thể ưu tiên Nhóm 1, 2 và vệ sinh, chất thải, tiệt khuẩn, xét nghiệm, chẩn đoán hình ảnh, kỹ thuật, lái xe cứu thương trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo khoa, phòng, ca trực.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca trực, theo khoa.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Đoàn kiểm tra, đánh giá chất lượng, đối tác bảo hiểm'),
      ['Huấn luyện tại cơ sở y tế',
        'Chia đợt nhỏ theo ca, theo khoa, vẫn giữ đủ người trực; thực hành tại chỗ với PPE, vật sắc nhọn, hóa chất, thiết bị của cơ sở.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      ['Luật An toàn, vệ sinh lao động số 84/2015/QH13', 'Trách nhiệm của người sử dụng lao động; áp dụng cả với cán bộ, công chức, viên chức (Điều 2); an toàn, vệ sinh viên (Điều 74).'],
      ['Nghị định 44/2016/NĐ-CP, sửa đổi bởi Nghị định 140/2018/NĐ-CP', 'Sáu nhóm đối tượng (Nhóm 5: người làm công tác y tế); nội dung, thời gian huấn luyện; chứng nhận có hiệu lực 2 năm.'],
      ['Nghị định 39/2016/NĐ-CP (Điều 30–32, 36, 37, 38)', 'Thuê lại lao động; bố trí người làm công tác ATVSLĐ (khoản 2 Điều 36), bộ phận y tế (Điều 37), hội đồng ATVSLĐ cơ sở (Điều 38).'],
      DANH_MUC,
      ['Luật Khám bệnh, chữa bệnh số 15/2023/QH15; Thông tư 16/2018/TT-BYT, 20/2021/TT-BYT; quy định an toàn bức xạ', 'Hành nghề, kiểm soát nhiễm khuẩn, chất thải y tế, an toàn bức xạ: quy định chuyên ngành, không thay thế huấn luyện ATVSLĐ.'],
      ['Nghị quyết 66.18/2026/NQ-CP', 'Cơ chế tạm thời từ 01/7/2026 đến hết 28/02/2027: đơn giản hóa một số thủ tục ATVSLĐ; máy, thiết bị nghiêm ngặt khai báo khi đưa vào sử dụng.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('20/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026 và trình Quốc hội, dự kiến xem xét tại kỳ họp thứ 2 khai mạc ngày 17/10/2026, '
      + 'kèm dự thảo nghị định thay thế Nghị định 39/2016/NĐ-CP và Nghị định 44/2016/NĐ-CP; dự án chưa có hiệu lực'),
  },
};
