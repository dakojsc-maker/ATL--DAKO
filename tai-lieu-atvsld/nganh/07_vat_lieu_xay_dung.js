// Nội dung tài liệu số 07 – Ngành Vật liệu xây dựng.
// Nguồn: "Cẩm nang tư vấn ATVSLĐ – Ngành Vật liệu xây dựng" (bản cho nhân viên kinh doanh, thông tin pháp lý đến 16/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Mục 1: ngành này vừa thuộc nhóm có yêu cầu cao ở Điều 36 (người làm công tác ATVSLĐ, 4 mức) vừa thuộc danh sách phải tổ
// chức y tế ở Điều 37 (4 mức, mốc khác), nên bảng bố trí dùng dạng nhiều dòng với 5 cột quy mô và cột nhãn hẹp hơn.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '07',
  tenFile: '07_VatLieuXayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Vật liệu xây dựng (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp vật liệu xây dựng – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Vật liệu xây dựng',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH VẬT LIỆU XÂY DỰNG',
    gioiThieu: 'Nhà máy, mỏ, trạm sản xuất vật liệu xây dựng là môi trường nhiều bụi, nóng, ồn, có lò nung, máy nghiền và băng '
      + 'tải lớn, thiết bị nâng và xe chuyên dùng, thường chạy nhiều ca liên tục. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh '
      + 'sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị '
      + 'sẵn thông tin cho buổi làm việc với chuyên viên Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP VẬT LIỆU XÂY DỰNG CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, học nghề, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Công nhân sản xuất trực tiếp phần lớn thuộc {{3}}:** Danh mục công việc nghiêm ngặt nêu rõ việc trực tiếp sản xuất, chế biến vật liệu xây dựng, sành, sứ, thủy tinh, nhựa; làm việc ở khu vực lò nung; vận hành trạm trộn, nghiền, sàng, máy ép, đóng bao, băng tải. Văn phòng, kho, bảo vệ, bán hàng thuộc {{4}}.',
      '**Phải bố trí người làm công tác ATVSLĐ ({{2}}) và y tế ({{5}}) ở mức cao:** sản xuất sản phẩm từ khoáng phi kim, vật liệu xây dựng, khai khoáng, kim loại có yêu cầu cao hơn tại Điều 36 và Điều 37 Nghị định 39/2016/NĐ-CP.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; công nhân nghỉ từ 6 tháng trở lên (dừng lò đại tu, nghỉ mùa mưa) phải huấn luyện lại.',
      '**Chứng nhận khác không thay thế huấn luyện ATVSLĐ:** ISO 9001, giấy phép sản xuất, khai thác, hướng dẫn vận hành của hãng, bằng nghề, bằng lái đều là yêu cầu riêng. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('doanh nghiệp vật liệu xây dựng'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý, chỉ huy: giám đốc, phó giám đốc được giao phụ trách; giám đốc nhà máy, mỏ, trạm; trưởng phòng; quản đốc; trưởng trạm trộn, nghiền sàng.',
        hocGi: 'Pháp luật, trách nhiệm người quản lý; tổ chức bộ máy ATVSLĐ và y tế; kế hoạch hằng năm; đánh giá rủi ro (lò nung, bụi, máy nghiền, băng tải, silo, thiết bị nâng, xe chuyên dùng); điều tra tai nạn; ứng cứu khẩn cấp.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận, cán bộ ATVSLĐ, HSE chuyên trách hoặc bán chuyên trách; người giám sát ATVSLĐ ở xưởng, mỏ, trạm.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kiểm tra hiện trường lò, nghiền sàng, silo, băng tải, trạm trộn, mỏ; đánh giá rủi ro; kế hoạch, nội quy; huấn luyện tại chỗ; điều tra tai nạn.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: công nhân sản xuất trực tiếp; vận hành lò, máy nghiền, sàng, ép, băng tải; trạm trộn, xe bồn, xe tự đổ; nồi hơi, cầu trục, xe nâng; điện, hàn; mỏ; bốc xếp từ 30 kg.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, thử việc: văn phòng, kinh doanh, bán hàng; QA, QC không vận hành máy; thủ kho; bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy; điện, cháy, trượt ngã; nguy cơ khi vào khu sản xuất, mỏ, bãi (xe chạy, vật liệu rơi, bụi, ồn); PPE; thoát hiểm; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, y tá, điều dưỡng phòng y tế nhà máy, mỏ.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu bỏng, bỏng kiềm do xi măng ướt, đè kẹp, điện giật, ngạt, say nắng; quản lý sức khỏe, bệnh nghề nghiệp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng, công nhân lâu năm được chọn ở từng tổ, ca, trạm (kiêm nhiệm).',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ tại tổ (thiếu che chắn máy, rơi vãi vật liệu, thiếu PPE, đứng sai vị trí khi xe chạy); nhắc nhở; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('nhà máy, mỏ, trạm'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – hay gặp khi dừng lò đại tu, nghỉ mùa mưa rồi công nhân quay lại.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản đốc trực tiếp vận hành lò, máy thuộc Danh mục: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Không xếp tất cả công nhân vào {{3}} “cho chắc”:** xếp đúng người, đúng công việc; xếp thừa làm đội chi phí, xếp thiếu là rủi ro cho doanh nghiệp.',
    ],
    canBo: {
      tieuDe: 'Cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2) và y tế (Nhóm 5)?',
      dan: 'Khoáng phi kim, vật liệu xây dựng, khai khoáng, kim loại có yêu cầu cao hơn về ATVSLĐ (Điều 36) và phải tổ chức '
        + 'y tế (Điều 37 Nghị định 39/2016/NĐ-CP). Mức tối thiểu:',
      tieuDeCotNhan: 'Bố trí',
      rongCotNhan: 1750,
      cot: ['Dưới 50 lao động', 'Từ 50 đến dưới 300', 'Từ 300 đến dưới 500', 'Từ 500 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['ATVSLĐ',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '02 người **chuyên trách**', '02 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 03 **chuyên trách**'],
        ['Y tế',
          '01 người trung cấp y', '01 người trung cấp y', '01 bác sĩ hoặc y sĩ, 01 trung cấp y', '01 bác sĩ; mỗi ca 01 trung cấp y',
          'Thành lập cơ sở y tế'],
      ],
      ghiChu: 'Cơ sở chỉ kinh doanh vật liệu không áp dụng mức này; không tự bố trí được y tế thì có thể hợp đồng với cơ sở '
        + 'khám bệnh, chữa bệnh. Chuyên viên Viện STP – DAKO xác nhận mức áp dụng.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, nhà máy, mỏ, trạm, phòng ban, phân xưởng) hoặc phụ trách sản xuất, kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp sản xuất, chế biến vật liệu; vận hành lò, trạm, máy nghiền, sàng, trộn, ép, đóng bao, băng tải, nồi hơi, cầu trục, xe nâng; hóa chất nguy hiểm; vào silo, bồn; trên cao; bốc xếp từ 30 kg; lái xe, hàn, điện?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ tịch HĐQT, Tổng giám đốc, Giám đốc, phó giám đốc; giám đốc nhà máy, mỏ, trạm', '1', 'Chủ tịch không điều hành: chuyên viên xác nhận.'],
      ['Trưởng, phó phòng: nhân sự, kế toán, kế hoạch, R&D, IT, an toàn – môi trường', '1', 'Người đứng đầu phòng, ban.'],
      ['B. QUẢN LÝ SẢN XUẤT, MỎ, TRẠM'],
      ['Quản đốc, phó quản đốc; chỉ huy trưởng mỏ, trưởng trạm trộn, trạm nghiền sàng', '1', 'Thêm Nhóm 3 nếu trực tiếp vận hành lò, máy.'],
      ['Trưởng ca, trưởng kíp vận hành, giám sát sản xuất', '1 hoặc 3', 'Không chỉ huy bộ phận: Nhóm 3 hoặc 4 theo việc.'],
      ['Tổ trưởng, chuyền trưởng, đội trưởng', '3', 'Nên chọn làm an toàn, vệ sinh viên (thêm Nhóm 6).'],
      ['Vận hành viên phòng điều khiển trung tâm (xi măng, kính)', '3', 'Chỉ giám sát từ xa: chuyên viên xác nhận.'],
      ['C. CHẤT LƯỢNG, THÍ NGHIỆM, KẾ HOẠCH'],
      ['QA, ISO, R&D, thiết kế bao bì; kế hoạch, điều độ sản xuất', '4', 'Làm việc văn phòng.'],
      ['QC, KCS lấy mẫu tại dây chuyền, mỏ, trạm; phòng thí nghiệm vật liệu', '4', 'Nhóm 3 nếu thao tác máy, lò, hóa chất nguy hiểm.'],
      ['D. CƠ ĐIỆN, BẢO TRÌ, THIẾT BỊ'],
      ['Trưởng phòng cơ điện; kỹ sư cơ khí, điện, tự động hóa, kỹ thuật lò', '1 hoặc 3', 'Trưởng phòng Nhóm 1; làm việc Danh mục: Nhóm 3.'],
      ['Thợ điện, trạm biến áp; thợ cơ khí bảo trì máy nghiền, băng tải; thợ hàn, cắt', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Thợ xây, sửa lò, vật liệu chịu lửa; làm việc trên cao (tháp, silo, mái)', '3', 'Vào lò nguội: thêm không gian hạn chế.'],
      ['Nồi hơi, nồi chưng áp, bình áp lực, máy nén khí; cầu trục, pa lăng, cần cẩu, móc cáp', '3', 'Thiết bị thuộc danh mục kiểm định.'],
      ['E. ATVSLĐ, Y TẾ, MÔI TRƯỜNG'],
      ['Trưởng bộ phận ATVSLĐ, HSE; cán bộ ATVSLĐ chuyên trách, bán chuyên trách', '2', 'Trưởng phòng thêm Nhóm 1; số người: xem mục 1.'],
      ['Nhân viên môi trường, quản lý chất thải, vận hành thu bụi', '4', 'Xử lý nước thải, vào bể, silo: Nhóm 3.'],
      ['Bác sĩ, y sĩ, y tá phòng y tế nhà máy, mỏ', '5', 'Bắt buộc tổ chức y tế: xem mục 1.'],
      ['An toàn, vệ sinh viên ở từng tổ, ca, trạm', '6', 'Học thêm, ngoài nhóm của công việc chính.'],
      ['Đội sơ cấp cứu, đội phòng cháy chữa cháy cơ sở (kiêm nhiệm)', 'Theo công việc', 'Thêm sơ cấp cứu; PCCC: Viện chưa cung cấp.'],
      ['F. KHO, BÃI, VẬN CHUYỂN'],
      ['Thủ kho nguyên liệu, nhiên liệu, phụ tùng, thành phẩm; cân xe', '4', 'Nhóm 3 nếu bốc xếp thường xuyên từ 30 kg.'],
      ['Kho hóa chất, phụ gia; pha chế, sử dụng hóa chất, dung môi', '3', 'Thêm an toàn hóa chất.'],
      ['Bốc xếp bao xi măng, tấm kính, đá tấm, bó thép, kiện hàng', '3 hoặc 4', 'Nhóm 3 nếu bốc tay thường xuyên từ 30 kg.'],
      ['Lái xe nâng; lái xe tải, xe đầu kéo, xe bồn trộn, xe công ty', '3', 'Lái xe thuê ngoài thuộc nhà thầu.'],
      ['Lái xe tự đổ trên 5 tấn; vận hành máy xúc, ủi, gạt, san', '3', 'Hỏi danh sách xe, máy và tải trọng.'],
      ['G. LÒ VÀ DÂY CHUYỀN SẢN XUẤT'],
      ['Vận hành lò quay, lò nung, lò nấu kính, lò luyện; xếp goòng, dỡ lò', '3', 'Khu vực lò, cấp liệu, ra sản phẩm.'],
      ['Vận hành máy nghiền, sàng, băng tải, phễu cấp liệu, silo, xuất xi măng rời', '3', 'Silo: thêm không gian hạn chế.'],
      ['Vận hành máy trộn, ép gạch, đùn, cán, đóng bao, xếp pallet; cắt, mài gạch, đá, kính', '3', 'Máy móc và sản xuất vật liệu.'],
      ['Trực tiếp sản xuất gạch, gốm sứ, kính, nhựa, gỗ công nghiệp, thép, sơn, keo', '3', 'Sơn, keo: thêm an toàn hóa chất.'],
      ['Đóng gói, xếp pallet thành phẩm cuối chuyền', '3 hoặc 4', 'Trường hợp ranh giới: chuyên viên xác nhận.'],
      ['H. BÊ TÔNG, KHAI THÁC MỎ'],
      ['Vận hành trạm trộn bê tông; lái xe bồn trộn, vận hành bơm bê tông', '3', 'Bỏng kiềm do xi măng ướt.'],
      ['Đúc cấu kiện, cọc, ống cống; cốt thép, ván khuôn; cẩu ở bãi đúc', '3', 'Thêm trên cao, hàn nếu có.'],
      ['Khoan, nổ mìn; khai thác đá, đất sét, cát, tàu hút cát; nghiền sàng tại mỏ', '3', 'Mỏ, vật liệu nổ: quy định chuyên ngành riêng.'],
      ['I. VỆ SINH, VĂN PHÒNG, THỜI VỤ, KHÁCH'],
      ['Vệ sinh silo, bồn, bể, hầm, lò nguội; xử lý nước thải, bụi, chất thải', '3', 'Không gian hạn chế.'],
      ['Vệ sinh nhà xưởng, quét bụi, vệ sinh thiết bị', '4 hoặc 3', 'Ranh giới: chuyên viên rà soát.'],
      ['Văn phòng, kế toán, nhân sự, IT; kinh doanh, bán hàng, showroom; bảo vệ, tạp vụ', '4', 'Bảo vệ, tạp vụ thuê ngoài: nhà thầu huấn luyện.'],
      ['Giao hàng, phụ xe, bốc dỡ tại điểm giao; đầu bếp, phụ bếp', '4 hoặc 3', 'Bốc xếp từ 30 kg, lái xe, bếp từ 300 suất/ngày: Nhóm 3.'],
      ['Lao động thời vụ, theo đợt đại tu; học nghề, thử việc', '3 hoặc 4', 'Theo công việc; huấn luyện lại sau nghỉ từ 6 tháng.'],
      ['Lao động thuê lại; nhà thầu bảo trì, sửa lò, vệ sinh, vận chuyển', 'Theo công việc', 'Theo hợp đồng; yêu cầu minh chứng huấn luyện.'],
      ['Khách, tài xế bên ngoài, đoàn kiểm tra vào khu sản xuất', '—', 'Không thuộc 6 nhóm; phổ biến nội quy.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới giữa Nhóm 3 và Nhóm 4.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG VẬT LIỆU XÂY DỰNG: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao phần lớn công nhân sản xuất thuộc Nhóm 3?** Khác nhiều ngành, Danh mục công việc có yêu cầu nghiêm ngặt '
      + 'về ATVSLĐ (Thông tư 06/2020/TT-BLĐTBXH) nêu rõ việc trực tiếp sản xuất, chế biến vật liệu xây dựng, sành, sứ, thủy '
      + 'tinh, nhựa; làm việc ở khu vực lò nung; trạm trộn, nghiền, sàng; vận hành máy nghiền, trộn, ép, đóng bao, băng tải; '
      + 'khai thác khoáng sản. Văn phòng, kho, bảo vệ, bán hàng thuộc Nhóm 4.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại nhà máy, mỏ, trạm:',
    nghe: [
      ['Vận hành lò', 'Lò quay, lò nung, lò nấu kính',
        'Nhiệt độ cao, bức xạ nhiệt, vật liệu nóng chảy, khí lò; than nghiền, gas, dầu: nổ bụi, cháy ngược; khởi động, dừng, cấp liệu, ra sản phẩm, xử lý kẹt; PPE chịu nhiệt, phòng say nóng.'],
      ['Nghiền, sàng, băng tải', 'Nghiền, sàng, ép, đóng bao',
        'Che chắn, nút dừng khẩn cấp, dây giật dọc băng tải; khóa nguồn khi vệ sinh, tháo kẹt, thay má nghiền; kẹt vật liệu ở phễu, silo: sập, ngạt; bụi, ồn; cháy băng tải.'],
      ['Gạch, kính, nhựa, gỗ', 'Tạo hình, cắt, mài, men',
        'Bụi silic, bụi gỗ, nhiệt, vỡ kính; máy ép, đùn, cắt, mài: khóa nguồn khi thay khuôn, lưỡi; tấm lớn, vật sắc: giá chữ A, găng, tạp dề; men, sơn, dung môi.'],
      ['Bê tông, đúc sẵn', 'Trạm trộn, xe bồn, bơm',
        'Máy trộn, băng tải, silo xi măng; xe bồn: quay thùng, lùi xe, vùng xả; cần bơm, ống áp lực, điện lưới trên cao; bỏng kiềm do xi măng ướt; móc cáp, vùng cấm dưới tải.'],
      ['Khai thác mỏ', 'Đá, cát, đất sét',
        'Sạt lở, rơi đá, bay đá khi nổ mìn, bụi, nắng nóng; máy xúc, xe tự đổ: chống lật, vùng nguy hiểm; trạm nghiền sàng; tàu hút cát: áo phao, cứu đuối nước.'],
      ['Cơ điện, sửa lò', 'Điện, cơ khí, hàn, xây lò',
        'Điện áp cao ở trạm, động cơ lớn; khóa nguồn, gắn thẻ khi sửa chữa; vào lò nguội, silo, bồn: đo khí, nhiệt, thông gió, giám sát, cứu hộ; trên cao; hàn cắt gần vật liệu dễ cháy.'],
      ['Vệ sinh, silo, hóa chất', 'Silo, bồn, bể; phụ gia',
        'Không gian hạn chế: khí độc, thiếu oxy, sập vật liệu; xin phép vào, giám sát bên ngoài, cứu hộ; nổ bụi; phụ gia, dung môi: nhãn, pha chế, không trộn lẫn, rửa mắt.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy dây chuyền, thiết bị và công việc tại nhà máy, mỏ, trạm, doanh nghiệp có thể cần thêm các nội dung sau; chuyên '
      + 'viên Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện, trạm điện, động cơ lớn. Không thay thế Nhóm 3.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu ở xưởng, mỏ, trạm, ca đêm: bỏng, bỏng kiềm, đè kẹp, điện giật.'],
      ['Huấn luyện an toàn hóa chất', 'Phụ gia, dung môi, sơn, keo, axit, kiềm, hóa chất tráng men, xử lý nước.'],
      ['Kiểm định kỹ thuật an toàn', 'Nồi hơi, nồi chưng áp, bình áp lực, cầu trục, pa lăng, xe nâng, chai khí.'],
      ['Quan trắc môi trường lao động', 'Xưởng nhiều bụi, ồn, nóng; khu lò nung, nghiền sàng, đóng bao.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Lò nung, silo, làm việc trên cao, máy nghiền, xe chuyên dùng.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Cân xe, cân băng tải, cân trạm trộn; thiết bị đo nhiệt, lực, độ cứng.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Khi chủ đầu tư, đối tác yêu cầu minh chứng; đào tạo nghề cho thợ vận hành, điện, hàn.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Đã có ISO 9001, giấy phép sản xuất, khai thác, còn phải huấn luyện ATVSLĐ?',
      'Có. ISO 9001 và các giấy phép là về chất lượng và điều kiện hoạt động; huấn luyện ATVSLĐ là nghĩa vụ riêng của người sử dụng lao động theo Luật An toàn, vệ sinh lao động. Chứng nhận này không thay thế nghĩa vụ kia.'],
    ['Có nên xếp tất cả công nhân nhà máy vào Nhóm 3 cho chắc?',
      'Không nên. Công nhân sản xuất trực tiếp, vận hành lò, máy, trạm là Nhóm 3; văn phòng, kho, bảo vệ, tạp vụ là Nhóm 4. Đóng gói, xếp thành phẩm cuối chuyền là trường hợp ranh giới; chuyên viên rà danh sách để không thừa, không thiếu.'],
    ['Máy nghiền, băng tải tự động, công nhân chỉ đứng giám sát có thuộc Nhóm 3?',
      'Nếu họ khởi động, điều chỉnh, xử lý kẹt, vệ sinh hay bảo dưỡng máy thì thuộc Nhóm 3. Người chỉ quan sát, không can thiệp, và vận hành viên phòng điều khiển trung tâm: chuyên viên xác nhận theo công việc thực tế.'],
    ['Lò do hãng nước ngoài lắp và đã hướng dẫn vận hành, còn cần Nhóm 3?',
      'Có. Hướng dẫn của nhà sản xuất là nội dung kỹ thuật vận hành; huấn luyện Nhóm 3 là nghĩa vụ ATVSLĐ theo quy định, có chương trình, kiểm tra và chứng nhận. Hai việc bổ sung cho nhau, không thay thế nhau.'],
    ['Bao xi măng 50 kg, tấm kính, gạch: bốc xếp thế nào thì thuộc Nhóm 3?',
      'Danh mục xét bốc xếp thủ công thường xuyên vật nặng từ 30 kg trở lên: bao 50 kg bốc tay thường xuyên thường thuộc Nhóm 3. Gạch lẻ nhẹ không thuộc chỉ vì số lượng nhiều; tấm kính, đá tấm bốc bằng cẩu, xe nâng thì xét theo công việc đó.'],
    ['Nhà máy 400 công nhân cần bao nhiêu người ATVSLĐ và y tế?',
      'Từ 300 đến dưới 1.000 lao động: tối thiểu 02 người làm công tác ATVSLĐ chuyên trách (Nhóm 2). Từ 300 đến dưới 500 lao động: 01 bác sĩ hoặc y sĩ và 01 người trình độ trung cấp y (Nhóm 5). Chuyên viên xác nhận theo hồ sơ thực tế.'],
    ['Lò chạy liên tục, đại tu có nhiều nhà thầu: tổ chức huấn luyện thế nào?',
      'Huấn luyện tại doanh nghiệp, chia lớp nhỏ luân phiên theo ca, kíp; quản đốc, trưởng ca học trước; tận dụng thời điểm dừng lò đại tu. Nhà thầu nên xuất trình minh chứng huấn luyện trước khi vào; Viện có thể huấn luyện cho cả đợt.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên rà danh sách theo máy và công việc để không thừa; có thể chia đợt, ưu tiên máy rủi ro cao trước (băng tải dài, máy nghiền, máy ép).'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, sơ đồ dây chuyền, danh sách thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, kíp, đợt đại tu.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Chủ đầu tư, đối tác, cơ quan kiểm tra'),
      ['Huấn luyện tại nhà máy, mỏ, trạm',
        'Chia lớp nhỏ luân phiên theo ca, kíp để không dừng lò, dây chuyền; lý thuyết kết hợp thực hành tại chỗ trên thiết bị của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 36, 37)', 'Bố trí người làm công tác ATVSLĐ và bộ phận y tế; khoáng phi kim, vật liệu xây dựng, khai khoáng, kim loại có yêu cầu cao hơn.'],
      DANH_MUC,
      ['Thông tư 19/2016/TT-BYT', 'Quản lý vệ sinh lao động, sức khỏe người lao động, sơ cấp cứu; quan trắc môi trường lao động.'],
      ['Luật Hóa chất 2025 (hiệu lực từ 01/01/2026) và văn bản hướng dẫn', 'Quản lý an toàn hóa chất: phụ gia, dung môi, sơn, keo, hóa chất tráng men, xử lý nước.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('16/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026 (Nghị quyết 275/NQ-CP), Ủy ban Thường vụ Quốc hội đã cho ý kiến ngày '
      + '23/9/2026; dự án chưa có hiệu lực'),
  },
};
