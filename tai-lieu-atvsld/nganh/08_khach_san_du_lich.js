// Nội dung tài liệu số 08 – Ngành Khách sạn – Du lịch.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành Khách sạn – Du lịch" (bản cho nhân viên kinh doanh, thông tin pháp lý đến 17/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Ngành này áp dụng khoản 2 Điều 36 Nghị định 39/2016/NĐ-CP (bảng bố trí một dòng, 3 mức như tài liệu 02, 06).

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '08',
  tenFile: '08_KhachSanDuLich_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Khách sạn – Du lịch (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp khách sạn – du lịch – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Khách sạn – Du lịch',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH KHÁCH SẠN – DU LỊCH',
    gioiThieu: 'Khách sạn, resort, nhà hàng, khu du lịch có nhiều bộ phận với mức rủi ro rất khác nhau, làm việc theo ca 24/7 '
      + 'và biến động mạnh theo mùa vụ. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) '
      + 'theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin cho buổi làm việc với chuyên viên '
      + 'của Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP KHÁCH SẠN – DU LỊCH CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, thực tập, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn nhân viên thuộc {{4}}, {{3}} tập trung ở một số bộ phận:** kỹ thuật cơ điện, giặt là, hồ bơi và xử lý nước, lái xe, lau kính trên cao, kho hóa chất, vận hành trò chơi, cáp treo. Một số vị trí bếp, vệ sinh là trường hợp ranh giới.',
      '**“An toàn cho khách” khác ATVSLĐ cho nhân viên:** huấn luyện ATVSLĐ bảo vệ nhân viên; an toàn cho khách (hồ bơi, du lịch mạo hiểm), phòng cháy chữa cháy, an toàn thực phẩm là các nghĩa vụ riêng, không thay thế nhau.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; lao động thời vụ nghỉ từ 6 tháng trở lên quay lại phải huấn luyện lại.',
      '**Chương trình của tập đoàn không thay thế hồ sơ theo pháp luật Việt Nam:** hồ sơ huấn luyện được xem khi thanh tra, khi xảy ra tai nạn và khi thương hiệu, đối tác đánh giá. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('khách sạn, resort, nhà hàng, khu du lịch, lữ hành'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ doanh nghiệp, tổng giám đốc, giám đốc khách sạn, resort, phó giám đốc được giao phụ trách; trưởng các bộ phận (tiền sảnh, buồng phòng, ăn uống, bếp, kỹ thuật, an ninh, spa, lữ hành).',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu khi nhân viên bị tai nạn; tổ chức bộ máy ATVSLĐ; kế hoạch hằng năm; đánh giá rủi ro đặc thù (bếp, buồng phòng, giặt là, kỹ thuật, hồ bơi, giải trí, vận chuyển); điều tra tai nạn; văn hóa an toàn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: quản lý an ninh – an toàn, cán bộ ATVSLĐ, HSE chuyên trách hoặc kiêm nhiệm (thường là giám đốc kỹ thuật, quản lý an ninh).',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kỹ thuật an toàn đặc thù khách sạn (bếp, giặt là, hồ bơi, cơ điện, hóa chất); kiểm tra, đánh giá rủi ro; điều tra tai nạn, ứng cứu khẩn cấp; quản lý hồ sơ, thiết bị nghiêm ngặt.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: thợ điện, điều hòa, nước, sửa chữa; vận hành máy giặt, sấy công nghiệp, nồi hơi; xử lý nước hồ bơi; lau kính trên cao; lái xe; kho hóa chất, xe nâng; trò chơi, cáp treo; chăm sóc thú dữ.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả thời vụ, thực tập, thử việc: lễ tân, hành lý, buồng phòng, phục vụ nhà hàng, bar, phần lớn nhân viên bếp; spa; bảo vệ; hướng dẫn viên, điều hành tour; văn phòng.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; trơn trượt, nâng vác đúng tư thế; bỏng, cắt; hóa chất tẩy rửa; an toàn điện; ứng xử khi khách say, gây gổ; nhận biết, báo cáo sự cố (cháy, mất điện); sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, y tá phòng y tế khách sạn, resort.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn lao động (bỏng, cắt, trượt ngã, đuối nước, điện giật); quản lý sức khỏe người lao động làm ca đêm; bệnh nghề nghiệp; xử lý tình huống khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: nhân viên được chọn ở từng bộ phận, ca (buồng phòng, bếp, kỹ thuật, giặt là...), kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ ở bộ phận (sàn ướt, hóa chất, thiết bị hỏng, lối thoát bị chặn); nhắc nhở; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('khách sạn, resort'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – rất hay gặp với lao động thời vụ: hết mùa nghỉ, đến mùa tuyển lại.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ giám đốc kỹ thuật trực tiếp làm công việc điện: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang bộ phận khác** (ví dụ từ lễ tân sang kỹ thuật) thì người lao động cần được huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Khách sạn, resort cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Khách sạn, resort, nhà hàng, khu du lịch và lữ hành thuộc nhóm “cơ sở khác” tại khoản 2 Điều 36 Nghị định '
        + '39/2016/NĐ-CP, mức yêu cầu thấp hơn các ngành như xây dựng, hóa chất, khai khoáng. Mức tối thiểu:',
      bang: [
        ['Dưới 300 lao động', '01 người **bán chuyên trách**'],
        ['Từ 300 đến dưới 1.000', '01 người **chuyên trách**'],
        ['Từ 1.000 trở lên', 'Phòng ATVSLĐ hoặc ít nhất 02 người **chuyên trách**'],
      ],
      ghiChu: 'Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2 và đáp ứng tiêu chuẩn riêng về trình độ, kinh nghiệm '
        + '(Điều 36). Cách tính số lao động khi có nhiều thời vụ, thực tập, thuê lại: chuyên viên Viện STP – DAKO xác nhận theo '
        + 'số lao động bình thường và cao điểm.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (khách sạn, resort, công ty, bộ phận, phòng ban) hoặc phụ trách bộ phận ăn uống, buồng phòng, kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp làm điện; vận hành máy giặt, sấy công nghiệp, nồi hơi, hệ thống lạnh, thang máy, trò chơi, cáp treo, xe nâng; dùng hóa chất nguy hiểm; làm việc trên cao từ 2 m, trên mặt nước, trong bể, hầm; lái xe; bốc xếp từ 30 kg; bếp từ 300 suất/ngày?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ doanh nghiệp, Tổng giám đốc, Giám đốc khách sạn, resort; phó giám đốc, giám đốc khu vực', '1', 'Cấp phó: khi được giao phụ trách.'],
      ['Trưởng bộ phận: tiền sảnh, buồng phòng, ăn uống, bếp, kỹ thuật, an ninh, spa, lữ hành', '1', 'Giám đốc kỹ thuật trực tiếp làm: thêm Nhóm 3.'],
      ['Quản lý ca, trực (Duty Manager)', '1 hoặc 4', 'Chỉ huy cả cơ sở ngoài giờ: xem xét Nhóm 1.'],
      ['Giám sát, trưởng ca tiền sảnh, buồng phòng, nhà hàng, bar; bếp phó; tổ trưởng kỹ thuật', '4', 'Thêm Nhóm 3 nếu làm công việc nghiêm ngặt.'],
      ['B. TIỀN SẢNH, BUỒNG PHÒNG, CẢNH QUAN'],
      ['Lễ tân, đặt phòng, tổng đài, concierge; hành lý, nhân viên cửa', '4', 'Hành lý bốc xếp thường xuyên từ 30 kg: Nhóm 3.'],
      ['Buồng phòng, minibar, đồ vải; là ủi thủ công, gấp đồ vải', '4', 'Nâng đệm, đẩy xe, hóa chất tẩy rửa nhẹ.'],
      ['Vệ sinh khu công cộng, tạp vụ', '4 hoặc 3', 'Hóa chất nguy hiểm, vệ sinh hầm, bể: Nhóm 3.'],
      ['Lau kính, vệ sinh mặt dựng, sửa chữa trên cao', '3', 'Làm việc trên cao từ 2 m.'],
      ['Cây xanh, cảnh quan (cắt cỏ, phun thuốc)', '4 hoặc 3', 'Máy cắt cỏ, phun thuốc: chuyên viên xác định.'],
      ['C. GIẶT LÀ, BẾP, NHÀ HÀNG, TIỆC'],
      ['Vận hành máy giặt, vắt ly tâm, sấy, là cán công nghiệp', '3 hoặc 4', 'Thường Nhóm 3; chuyên viên xác nhận theo máy.'],
      ['Vận hành nồi hơi, hệ thống hơi giặt là', '3', 'Thiết bị áp lực thuộc Danh mục.'],
      ['Bếp trưởng, bếp phó, đầu bếp, bếp bánh, phụ bếp, sơ chế', '4 hoặc 3', 'Máy bếp công nghiệp lớn: ranh giới.'],
      ['Bếp ăn nhân viên hoặc bếp từ 300 suất/ngày trở lên', '3', 'Xác nhận số suất ăn.'],
      ['Rửa chén, vệ sinh bếp (steward)', '4 hoặc 3', 'Hóa chất rửa, máy rửa: ranh giới.'],
      ['Phục vụ nhà hàng, bar, pha chế, phục vụ phòng', '4', 'Bỏng, trơn trượt, khách say.'],
      ['Bố trí tiệc, hội nghị, sân khấu; âm thanh – ánh sáng', '4 hoặc 3', 'Nhóm 3 nếu treo đèn, phông trên cao, làm điện.'],
      ['D. KỸ THUẬT CƠ ĐIỆN'],
      ['Thợ điện, tủ điện, máy phát, trạm biến áp; điều hòa, hệ thống lạnh', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Thợ nước, xử lý nước thải, thông tắc, bể ngầm, hố ga', '3', 'Không gian hạn chế.'],
      ['Thợ mộc, sơn, sửa chữa, hàn; làm việc trên cao', '3', 'Hàn cắt, trên cao, hóa chất sơn.'],
      ['Giám sát tòa nhà (BMS), vận hành thang máy, thang cuốn', '3 hoặc 4', 'Điều khiển qua màn hình: chuyên viên xác nhận.'],
      ['E. HỒ BƠI, SPA, THỂ THAO, GIẢI TRÍ'],
      ['Nhân viên hồ bơi, kỹ thuật viên xử lý nước', '3 hoặc 4', 'Nhóm 3 khi pha chế, châm hóa chất (clo...).'],
      ['Cứu hộ hồ bơi, bãi biển; thể thao nước, cano, lặn', 'Ranh giới', 'Chuyên viên xác định; cứu hộ chuyên môn: Viện chưa cung cấp.'],
      ['Kỹ thuật viên spa, massage, phòng xông hơi', '4', 'Nhóm 3 nếu dùng hóa chất nguy hiểm.'],
      ['Phòng tập, huấn luyện viên golf, tennis, caddie; kids club, hoạt náo', '4', 'Thể thao chuyên nghiệp, xiếc: chuyên viên xác định.'],
      ['Vận hành trò chơi, cáp treo, thang cuốn khu vui chơi; chăm sóc thú dữ', '3', 'Thiết bị thuộc danh mục kiểm định.'],
      ['F. AN NINH, Y TẾ, VẬN CHUYỂN, KHO'],
      ['Bảo vệ, giám sát an ninh, camera', '4', 'Ca đêm, khách xung đột.'],
      ['Quản lý an ninh – an toàn, cán bộ ATVSLĐ, HSE kiêm nhiệm', '2', 'Kiêm trưởng bộ phận: thêm Nhóm 1.'],
      ['Nhân viên y tế khách sạn, resort', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên theo bộ phận, ca', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['Lái xe ô tô, xe du lịch, xe đưa đón khách, xe tải giao nhận; nhân viên giữ xe (valet)', '3', 'Valet chỉ lái trong khuôn viên: chuyên viên xác nhận.'],
      ['Lái xe điện, xe golf trong khuôn viên; thuyền viên, bến tàu', 'Ranh giới', 'Chuyên viên xác nhận.'],
      ['Thủ kho thực phẩm, vật tư, đồ vải; nhận hàng, mua hàng', '4', 'Nhóm 3 nếu bốc xếp nặng, lái xe nâng.'],
      ['Kho hóa chất, gas, thuốc diệt côn trùng; lái xe nâng', '3', 'Gas: chuyên viên xác nhận.'],
      ['G. LỮ HÀNH, VĂN PHÒNG, THỜI VỤ, KHÁCH'],
      ['Điều hành tour, bán tour, vé; hướng dẫn viên, trưởng đoàn', '4', 'Sản phẩm mạo hiểm: huấn luyện riêng, Viện chưa cung cấp.'],
      ['Kinh doanh, kế toán, nhân sự, đào tạo, IT, quản lý doanh thu', '4', 'Làm việc văn phòng.'],
      ['Lao động thời vụ, sinh viên thực tập, học việc, thử việc', '4 hoặc 3', 'Theo công việc; huấn luyện trước khi vào ca.'],
      ['Lao động thuê lại; thuê ngoài bảo vệ, vệ sinh, giặt là; nhà thầu bảo trì', 'Theo công việc', 'Chuyên viên xác nhận trách nhiệm hai bên.'],
      ['Khách lưu trú, khách tham quan, nhân viên giao hàng', '—', 'Không thuộc 6 nhóm; an toàn cho khách là nghĩa vụ riêng.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG KHÁCH SẠN – DU LỊCH: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao Nhóm 3 chỉ tập trung ở một số bộ phận?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông tư '
      + '06/2020/TT-BLĐTBXH) gồm: máy, thiết bị nghiêm ngặt (nồi hơi, thang máy, trò chơi, cáp treo); hóa chất nguy hiểm; máy '
      + 'giặt, sấy công nghiệp; làm việc trên cao, trên mặt nước; không gian hạn chế, xử lý nước thải; điện; lái xe; bếp ăn '
      + 'tập thể từ 300 suất/ngày. Lễ tân, buồng phòng, phục vụ, văn phòng thuộc Nhóm 4.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại khách sạn, resort:',
    nghe: [
      ['Kỹ thuật cơ điện', 'Điện, điều hòa, nước',
        'Khóa và gắn thẻ, kiểm tra không điện, nối đất; điện giật, hồ quang; thiết bị áp lực, hệ thống lạnh, rò rỉ môi chất; trên mái; bể ngầm, hố ga: đo khí, giám sát, cứu hộ; bảo trì khi khách đang ở.'],
      ['Giặt là', 'Máy giặt, sấy; nồi hơi',
        'Che chắn, dừng khẩn cấp, khóa – gắn thẻ khi bảo trì; kẹt tay vào trục cuốn, lồng vắt; nhiệt, hơi nước, đường ống hơi; vận hành nồi hơi an toàn; hóa chất giặt là; ồn, sàn ướt.'],
      ['Hồ bơi, xử lý nước', 'Clo, hóa chất chỉnh pH',
        'Nhãn, bảo quản riêng, không trộn hóa chất (khí độc), pha và châm an toàn, đổ tràn; điện ở khu ướt, phòng máy bơm; trơn trượt; vào bể cân bằng, hố bơm; nhận biết đuối nước.'],
      ['Làm việc trên cao', 'Mặt dựng, mái, sân khấu',
        'Thang, giàn treo lau kính, dây an toàn; kiểm tra thiết bị trước khi làm; làm việc trên mái, thay bảng hiệu; treo đèn, phông khi bố trí tiệc; điện sân khấu, âm thanh.'],
      ['Bếp lớn, rửa chén', 'Bếp từ 300 suất, steward',
        'Bỏng dầu, hơi, lò nướng; dao, máy thái, máy xay: kẹt tay, dừng khẩn cấp; bếp gas; điện ở khu ướt; trơn trượt; hóa chất rửa chén, không trộn hóa chất; sơ cấp cứu bỏng, cắt.'],
      ['Trò chơi, cáp treo, động vật', 'Khu vui chơi, vườn thú',
        'Vận hành theo quy trình, kiểm tra đầu ca, dừng khẩn cấp; bảo trì: khóa – gắn thẻ, trên cao, hồ sơ kiểm định; tiếp xúc động vật, rào chắn, động vật thoát chuồng; sơ cứu vết cắn.'],
      ['Lái xe, kho hóa chất', 'Xe đưa đón; kho; xe nâng',
        'Lái xe an toàn, mệt mỏi, kiểm tra xe trước khi đi; chằng buộc hành lý, hỗ trợ khách lên xuống; kho hóa chất, gas: nhãn, cách ly, thông gió, đổ tràn; xe nâng: tải trọng, tín hiệu.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy quy mô, bộ phận và thiết bị của khách sạn, resort, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu theo ca; hồ bơi, bãi biển, spa, bếp; nơi chưa có nhân viên y tế.'],
      ['Huấn luyện an toàn điện', 'Tổ kỹ thuật cơ điện, thợ điện, máy phát, trạm biến áp. Không thay thế Nhóm 3.'],
      ['Huấn luyện an toàn hóa chất', 'Clo và hóa chất hồ bơi, chất tẩy rửa, hóa chất giặt là, diệt côn trùng, gas.'],
      ['Kiểm định kỹ thuật an toàn', 'Thang máy, thang cuốn, nồi hơi, bình áp lực, hệ thống lạnh, cáp treo, trò chơi.'],
      ['Quan trắc môi trường lao động', 'Bếp (nhiệt, hơi dầu mỡ), giặt là (nhiệt, ồn), phòng máy, spa, xông hơi.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Cơ sở mới, mở thêm spa, hồ bơi, khu vui chơi, bếp mới; trước mùa cao điểm.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Nhiệt kế kho lạnh, áp kế nồi hơi, thiết bị đo chất lượng nước hồ bơi.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Chuỗi, thương hiệu quốc tế, resort cao cấp; đào tạo nghề buồng phòng, bếp, lễ tân.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Huấn luyện ATVSLĐ có phải là “an toàn cho khách” không?',
      'Không. Huấn luyện ATVSLĐ bảo vệ nhân viên theo Nghị định 44/2016/NĐ-CP. An toàn cho khách (hồ bơi, du lịch mạo hiểm), phòng cháy chữa cháy, an toàn thực phẩm là nghĩa vụ riêng theo pháp luật chuyên ngành, Viện chưa cung cấp; chuyên viên ghi nhận để phối hợp đơn vị phù hợp.'],
    ['Thương hiệu quốc tế đã có chương trình an toàn riêng, còn cần huấn luyện theo Việt Nam?',
      'Có. Chương trình của tập đoàn không thay thế hồ sơ huấn luyện theo pháp luật Việt Nam. Viện STP – DAKO không thay thế hệ thống của tập đoàn mà giúp hoàn thiện hồ sơ Nhóm 1 đến Nhóm 6 và quản lý tập trung chứng nhận cho nhiều cơ sở.'],
    ['Lễ tân, buồng phòng, phục vụ có phải huấn luyện không?',
      'Có, họ thuộc Nhóm 4 (tối thiểu 16 giờ, định kỳ hằng năm). Nội dung gắn với công việc: trơn trượt, nâng vác, hóa chất tẩy rửa, bỏng, điện, ứng xử khi khách say, báo cáo sự cố, sơ cấp cứu cơ bản.'],
    ['Bếp khách sạn có phải “bếp ăn tập thể 300 suất” (Nhóm 3)?',
      'Danh mục ghi bếp ăn tập thể từ 300 suất ăn một ngày trở lên. Bếp ăn nhân viên của khách sạn lớn thường thuộc diện này; bếp phục vụ khách là trường hợp ranh giới. Chuyên viên xác nhận theo số suất ăn và loại bếp.'],
    ['Máy giặt, sấy công nghiệp, thang máy, cáp treo có phải kiểm định?',
      'Nồi hơi, thang máy, thang cuốn, bình áp lực, hệ thống lạnh, cáp treo, thiết bị trò chơi thuộc danh mục phải kiểm định. Máy giặt, sấy, là và thiết bị cụ thể: chuyên viên xác nhận. Người vận hành máy giặt là công nghiệp thường thuộc Nhóm 3.'],
    ['Cứu hộ, huấn luyện viên thể thao, lái xe điện trong resort thuộc nhóm nào?',
      'Đây là các trường hợp ranh giới: Danh mục có cứu hộ chuyên nghiệp, công việc trên mặt nước, huấn luyện viên thể thao chuyên nghiệp, lái xe ô tô. Chuyên viên xác nhận theo công việc thực tế; huấn luyện cứu hộ chuyên môn là khóa riêng, Viện chưa cung cấp.'],
    ['Mùa cao điểm tuyển hàng trăm thời vụ, nhân viên làm ca đêm: tổ chức thế nào?',
      'Chia đợt nhỏ trước khi vào ca, theo ca (kể cả ca đêm) và theo bộ phận; nên tận dụng mùa thấp điểm. Lao động thời vụ nghỉ từ 6 tháng trở lên quay lại phải huấn luyện lại; chuyên viên thiết kế lịch theo kế hoạch tuyển dụng.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm cho từng bộ phận, không thừa; có thể chia đợt, ưu tiên Nhóm 1, 2 và bộ phận kỹ thuật, giặt là, hồ bơi trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo bộ phận, thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, theo mùa vụ.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Thương hiệu, đối tác, đoàn kiểm tra'),
      ['Huấn luyện tại khách sạn, resort',
        'Chia lớp nhỏ theo ca, theo bộ phận, ưu tiên mùa thấp điểm để không ảnh hưởng phục vụ khách; lý thuyết kết hợp thực hành tại chỗ.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 36, 38)', 'Bố trí người làm công tác ATVSLĐ theo quy mô (khách sạn, du lịch: khoản 2 Điều 36); hội đồng ATVSLĐ cơ sở.'],
      DANH_MUC,
      ['Luật Điện lực số 61/2024/QH15; Nghị định 62/2025/NĐ-CP; Thông tư 02/2025/TT-BCT', 'An toàn điện cho người làm việc về điện, trạm biến áp, tủ trung thế của khách sạn, resort.'],
      ['Luật Du lịch số 09/2017/QH14', 'Bảo đảm an toàn cho khách du lịch: nghĩa vụ riêng, không thay thế huấn luyện ATVSLĐ cho nhân viên.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('17/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026, giai đoạn 1 dự kiến được Quốc hội xem xét theo thủ tục rút gọn trong tháng '
      + '10/2026; dự án chưa được thông qua, chưa có hiệu lực'),
  },
};
