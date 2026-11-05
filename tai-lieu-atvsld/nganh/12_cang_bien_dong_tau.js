// Nội dung tài liệu số 12 – Ngành Cảng biển – Đóng tàu.
// Nguồn: “Cẩm nang tư vấn ATVSLĐ – Ngành Cảng biển – Đóng tàu” (bản cho nhân viên kinh doanh, thông tin pháp lý đến 17/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Bảng bố trí hai dòng như tài liệu 04: đóng, sửa chữa tàu biển (khoản 1 Điều 36) và khai thác cảng (khoản 2).
// Cẩm nang còn dẫn Thông tư 05/2021/TT-BCT và Nghị định 113/2017/NĐ-CP; hai văn bản này đã được thay thế nên không đưa vào.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '12',
  tenFile: '12_CangBienDongTau_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Cảng biển – Đóng tàu (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp cảng biển – đóng tàu – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Cảng biển – Đóng tàu',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH CẢNG BIỂN – ĐÓNG TÀU',
    gioiThieu: 'Cảng biển và nhà máy đóng, sửa chữa tàu làm việc ngoài trời, trên tàu và sát mặt nước, với thiết bị nâng rất '
      + 'lớn, trong hầm, két, theo ca kíp liên tục và có nhiều nhà thầu phụ cùng làm. Tài liệu này giúp Quý Doanh nghiệp nắm '
      + 'nhanh sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và '
      + 'chuẩn bị sẵn thông tin cho buổi làm việc với chuyên viên của Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP CẢNG BIỂN – ĐÓNG TÀU CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, học việc, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn lao động trực tiếp thuộc {{3}}:** lái cẩu, xe nâng, móc cáp, chằng buộc, xếp dỡ dưới hầm hàng, làm việc trên mặt nước, hàn cắt thân tàu, vệ sinh két, phun cát, sơn, giàn giáo, xăng dầu, hóa chất, điện, lái xe.',
      '**Nhà thầu phụ, tổ đội khoán phải có chứng nhận trước khi vào làm:** đơn vị sử dụng lao động của họ chịu trách nhiệm huấn luyện; cảng, nhà máy kiểm tra chứng nhận (tra cứu theo mã) trước khi cho lên tàu, vào khoang.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; người nghỉ việc hoặc cơ sở ngừng hoạt động từ 6 tháng trở lên phải huấn luyện lại.',
      '**Chứng chỉ nghề, chứng nhận thiết bị không thay thế huấn luyện ATVSLĐ:** chứng chỉ lái cẩu, thợ hàn, thuyền viên và giấy chứng nhận của thiết bị là yêu cầu riêng. Hồ sơ huấn luyện được xem khi thanh tra, khi có tai nạn và khi hãng tàu, chủ hàng đánh giá.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('cảng biển, dịch vụ cảng và nhà máy đóng, sửa chữa tàu'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ doanh nghiệp, tổng giám đốc, giám đốc cảng, nhà máy; phó giám đốc được giao phụ trách; trưởng phòng; giám đốc chi nhánh, bến cảng; quản đốc phân xưởng, đốc công đà tàu, ụ; đội trưởng xếp dỡ, cẩu, bãi, cầu bến.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu khi có tai nạn; tổ chức bộ máy ATVSLĐ theo ngành, quy mô; đánh giá rủi ro xếp dỡ, cẩu lắp, hàn cắt, hầm, két, mặt nước; quản lý thiết bị nghiêm ngặt, hàng nguy hiểm; quản lý nhà thầu phụ, ca kíp.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận HSE, cán bộ ATVSLĐ chuyên trách, bán chuyên trách, kiêm nhiệm; giám sát an toàn tại cầu bến, bãi, đà tàu, xưởng.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kỹ thuật an toàn xếp dỡ, thiết bị nâng, hàn cắt thân tàu, trên cao, mặt nước, hầm, két, hóa chất, xăng dầu, điện; quản lý công việc nguy hiểm, nhà thầu phụ; điều tra tai nạn, ứng cứu khẩn cấp, sự cố tràn đổ.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: lái cẩu, xe nâng, máy xúc; móc cáp, chằng buộc; xếp dỡ trên tàu, hầm hàng, cầu tàu; thuyền viên tàu lai, thợ lặn; thợ hàn, lắp ráp thân tàu, thợ máy, điện, ống; phun cát, sơn, vệ sinh két; giàn giáo; xăng dầu, hóa chất; lái xe.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học việc, thử việc, thời vụ: văn phòng, thương vụ, đại lý tàu, kế toán; kỹ sư thiết kế, kế hoạch, điều độ; KCS, kiểm đếm thông thường; thủ kho; nhân viên cổng, giao nhận; bảo vệ, tạp vụ, bếp ăn.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy cảng, nhà máy; giao thông nội bộ, điểm mù xe đầu kéo, xe nâng; vùng cấm dưới tải; mép nước, lối lên xuống tàu; PPE (mũ, giày, áo phản quang, áo phao); thoát hiểm; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, điều dưỡng phòng y tế cảng, nhà máy.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn (ngã cao, đuối nước, dập nát, bỏng, ngạt khí, điện giật); đưa nạn nhân khỏi hầm, két, tàu; bệnh nghề nghiệp do bụi, ồn, khói hàn.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng, thợ chính được cử ở từng tổ, ca, đội, kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ (cáp, móc, chằng buộc hỏng, lối lên tàu, khoang thiếu thông gió, chai khí không chống đổ); nhắc nhở dùng dây an toàn, áo phao; theo dõi thợ thầu phụ; báo cáo.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('đơn vị'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – ví dụ nhà máy ngừng sản xuất giữa hai hợp đồng đóng mới.',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ đội trưởng xếp dỡ điều hành tại hiện trường: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ từ bốc xếp sang lái cẩu, từ làm trên bờ sang làm trên tàu) thì cần huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Đóng, sửa chữa tàu biển áp dụng khoản 1 Điều 36 Nghị định 39/2016/NĐ-CP; khai thác cảng, dịch vụ cảng, kho bãi '
        + 'thường áp dụng khoản 2. Mức tối thiểu:',
      cot: ['Dưới 50 lao động', 'Từ 50 đến dưới 300', 'Từ 300 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['Đóng, sửa chữa tàu biển (khoản 1)',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '02 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 03 người **chuyên trách**'],
        ['Khai thác cảng, dịch vụ cảng, kho bãi (khoản 2)',
          '01 người **bán chuyên trách**', '01 người **bán chuyên trách**', '01 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 02 người **chuyên trách**'],
      ],
      ghiChu: 'Vừa khai thác cảng vừa sửa chữa tàu, đóng tàu thủy nội địa, tàu cá: chuyên viên Viện STP – DAKO xác định khoản '
        + 'áp dụng. Bộ phận y tế (Điều 37) cũng tổ chức theo quy mô, ngành nghề.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, cảng, nhà máy, chi nhánh, phòng ban, phân xưởng, đội) hoặc phụ trách bộ phận khai thác, sản xuất, kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp vận hành, bảo dưỡng thiết bị nâng, thiết bị áp lực; hàn cắt; làm việc trên cao từ 2 m, trên mặt nước, trong hầm, két, không gian hạn chế; hóa chất, xăng dầu; điện; lái xe; bốc xếp thủ công vật nặng; phun cát, làm sạch kim loại; lặn?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ HIỆN TRƯỜNG'],
      ['Chủ doanh nghiệp, chủ tịch HĐQT, tổng giám đốc, giám đốc cảng, nhà máy', '1', 'Người đứng đầu đơn vị.'],
      ['Phó giám đốc; trưởng phòng; giám đốc chi nhánh, bến cảng, xí nghiệp', '1', 'Cấp phó, phó phòng: khi được giao phụ trách.'],
      ['Quản đốc, phó quản đốc phân xưởng; đốc công đà tàu, ụ, triền', '1', 'Điều hành tại hiện trường: nên thêm Nhóm 3.'],
      ['Đội trưởng xếp dỡ, đội trưởng cẩu, bãi, cầu bến; trưởng bộ phận khai thác', '1 + 3', 'Phụ trách đội, điều hành tại hiện trường.'],
      ['Trưởng ca, tổ trưởng xếp dỡ, tổ trưởng sản xuất, thợ chính', '3', 'Nên cử làm an toàn, vệ sinh viên (Nhóm 6).'],
      ['B. KỸ THUẬT, VĂN PHÒNG, AN TOÀN, Y TẾ'],
      ['Kỹ sư thiết bị, cơ giới, cơ điện, bảo trì cẩu và thiết bị xếp dỡ', '3', 'Lên cẩu: thêm làm việc trên cao.'],
      ['Kỹ sư giám sát, kỹ sư hiện trường đóng, sửa tàu; kỹ sư chạy thử', '3 hoặc 4', 'Thường xuyên trên tàu, hầm, két: Nhóm 3.'],
      ['Thiết kế, công nghệ, kế hoạch; điều độ cầu bến, bãi', '4', 'Phổ biến nội quy khi xuống hiện trường.'],
      ['Điều khiển cẩu từ xa, trung tâm điều hành', 'Ranh giới', 'Điều khiển qua màn hình: chuyên viên xác nhận.'],
      ['KCS, QC, đăng kiểm nội bộ, giám định, kiểm đếm hàng (tally)', '4 hoặc 3', 'Thường xuyên trên tàu, hầm hàng: Nhóm 3.'],
      ['Kiểm tra không phá hủy (NDT); chụp bức xạ mối hàn', 'Theo công việc', 'Chụp bức xạ: Nhóm 3 và quy định riêng.'],
      ['Kế toán, hành chính, nhân sự, thương vụ, đại lý tàu, IT, mua hàng', '4', 'Làm việc văn phòng.'],
      ['Nhân viên cổng, giao nhận bãi; bảo vệ, tạp vụ, bếp ăn', '4', 'Bếp ăn từ 300 suất/ngày: xem xét Nhóm 3.'],
      ['Trưởng bộ phận HSE; cán bộ ATVSLĐ, giám sát an toàn', '2', 'Trưởng bộ phận: học thêm Nhóm 1.'],
      ['Bác sĩ, y sĩ, điều dưỡng, phòng y tế', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên tại tổ, ca, đội', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['Đội cứu hộ, cứu nạn chuyên trách', '3', 'Đội kiêm nhiệm: chuyên viên xem xét.'],
      ['C. THIẾT BỊ NÂNG, XẾP DỠ, CẦU BẾN, KHO'],
      ['Lái cẩu bờ, cẩu khung, cẩu chân đế, cẩu bánh lốp; cầu trục, cổng trục', '3', 'Lên cabin cao: thêm làm việc trên cao.'],
      ['Lái xe nâng container, xe nâng hàng; máy xúc, ủi, gầu ngoạm bãi hàng rời', '3', 'Thiết bị, công việc thuộc Danh mục.'],
      ['Người ra tín hiệu, móc cáp, buộc tải; vận hành băng tải hàng rời', '3', 'Gắn với thiết bị nâng, băng tải.'],
      ['Công nhân xếp dỡ trên tàu, dưới hầm hàng; chằng buộc container', '3', 'Trên cao, hầm hàng, mặt nước.'],
      ['Công nhân cầu tàu, buộc – cởi dây tàu', '3', 'Làm việc ở mép nước, cầu nổi.'],
      ['Đóng, rút hàng container (CFS); bốc xếp hàng bao, kiện', '3 hoặc 4', 'Bốc xếp thường xuyên từ 30 kg: Nhóm 3.'],
      ['Cắm, theo dõi điện container lạnh', 'Ranh giới', 'Thao tác thiết bị điện: chuyên viên xác nhận.'],
      ['Thủ kho vật tư, kho hàng, giao nhận', '4 hoặc 3', 'Bốc xếp nặng, xe nâng, hóa chất: Nhóm 3.'],
      ['Hàng nguy hiểm, kho hóa chất, sơn, khí; bơm xăng dầu, khí hóa lỏng tại bến', '3', 'Thêm huấn luyện an toàn hóa chất.'],
      ['Lái xe đầu kéo, xe tải, xe chở công nhân; thợ sửa xe', '3', 'Bằng lái xe không thay thế huấn luyện Nhóm 3.'],
      ['D. MẶT NƯỚC VÀ ĐÓNG, SỬA CHỮA TÀU'],
      ['Thuyền viên tàu lai, ca nô, xuồng; thợ trên sà lan, phao; thợ lặn', '3', 'Nghiệp vụ hàng hải, lặn: quy định riêng.'],
      ['Thợ hàn, cắt, gò; ghép tổng đoạn; lắp ráp thân tàu trên đà, bến trang bị', '3', 'Thêm trên cao, khoang kín nếu có.'],
      ['Thợ máy tàu, lắp máy chính, trục chân vịt; thợ điện tàu, lắp cáp', '3', 'Thợ điện: thêm huấn luyện an toàn điện.'],
      ['Thợ tiện, phay, mài, nguội; thợ lắp ống, hàn ống, thử áp lực', '3', 'Máy gia công, hàn cắt thuộc Danh mục.'],
      ['Thợ phun cát, phun bi, cạo gỉ, sơn tàu, pha sơn', '3', 'Thêm huấn luyện an toàn hóa chất.'],
      ['Vệ sinh hầm hàng, két dầu, két ballast; người canh gác miệng khoang', '3', 'Không gian hạn chế, kể cả người canh gác.'],
      ['Thợ giàn giáo, trên mạn tàu; hạ thủy, vận hành ụ; thử đường dài', '3', 'Chuyên viên xác nhận theo từng việc.'],
      ['Thợ điện cẩu, trạm biến áp, điện bờ; bảo trì cơ khí cẩu, xe nâng', '3', 'Thêm làm việc trên cao, an toàn điện.'],
      ['Vận hành nồi hơi, máy nén khí, hệ thống lạnh, trạm khí; trạm nạp ắc quy', '3', 'Thiết bị áp lực thuộc Danh mục.'],
      ['E. THỜI VỤ, NHÀ THẦU PHỤ, NGƯỜI NGOÀI'],
      ['Phụ hàn, phụ sơn, phụ giàn giáo, bốc xếp, vệ sinh xưởng, bãi', '3 hoặc 4', 'Trực tiếp làm việc thuộc Danh mục: Nhóm 3.'],
      ['Lao động thời vụ, học việc, thử việc, thực tập sinh', 'Theo công việc', 'Huấn luyện trước khi giao việc.'],
      ['Lao động thuê lại, nhà thầu phụ, tổ đội khoán (hàn, sơn, giàn giáo, vệ sinh két)', 'Theo công việc', 'Chuyên viên xác nhận bên huấn luyện.'],
      ['Thuyền viên tàu nước ngoài, đăng kiểm viên, tài xế xe ngoài, khách', '—', 'Không thuộc 6 nhóm; phổ biến nội quy, PPE.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới.',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 Ở CẢNG BIỂN, ĐÓNG TÀU: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao phần lớn lao động trực tiếp thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông tư '
      + '06/2020/TT-BLĐTBXH) nêu: vận hành thiết bị nâng, thiết bị áp lực; hàn, cắt kim loại; làm sạch bề mặt kim loại; làm '
      + 'việc trên cao từ 2 m, trên sông, biển, mặt nước, lặn; không gian hạn chế; hóa chất, xăng dầu; điện; lái xe; bốc xếp '
      + 'vật nặng. Văn phòng, cổng, kho thông thường thuộc Nhóm 4.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại cảng, nhà máy đóng tàu:',
    nghe: [
      ['Cẩu, xe nâng', 'Lái cẩu, xe nâng, móc cáp',
        'Kiểm tra phanh, cáp, móc, khóa góc trước ca; không vượt tải, không đi dưới tải; giới hạn khi gió mạnh; tín hiệu với người móc cáp; điểm mù xe nâng; cứu người trong cabin.'],
      ['Xếp dỡ, cầu bến', 'Trên tàu, hầm hàng, chằng buộc',
        'Ngã cao khi chằng buộc, đi trên container; dây chằng bật, đứt cáp; mép nước, cầu nổi: áo phao, cứu người rơi xuống nước; hầm hàng: thang, thông gió, hàng rơi.'],
      ['Mặt nước, lặn', 'Tàu lai, sà lan, phao',
        'Rơi xuống nước, sóng gió; áo phao, phao cứu sinh; lên xuống tàu, xuồng, cầu dẫn; buộc – cởi dây, vùng nguy hiểm khi dây căng đứt; báo động người rơi xuống nước.'],
      ['Hàn, lắp ráp thân tàu', 'Hàn cắt, gò, tổng đoạn',
        'Điện giật khi hàn trong khoang ẩm; khói hàn: thông gió, hút khói; cháy nổ gần két nhiên liệu, người canh lửa; chai oxy, axetylen; ghép tổng đoạn: chèn kê, vị trí đứng.'],
      ['Két, hầm, sơn', 'Vệ sinh két; sơn, phun cát',
        'Đo oxy, khí cháy, khí độc trước khi vào; thông gió, người canh gác, dây cứu hộ, không tự lao vào cứu; hơi dung môi dễ cháy, tĩnh điện; bụi, ồn, áp lực vòi phun.'],
      ['Trên cao, ụ, hạ thủy', 'Giàn giáo, mạn tàu, triền',
        'Dây an toàn, điểm neo, lan can; lắp dựng, kiểm tra giàn giáo; vật rơi, gió; ụ nổi, ụ khô: bơm, chèn kê; hạ thủy: tín hiệu, vùng cấm, tời, cáp; an toàn khi thử đường dài.'],
      ['Điện, máy, xăng dầu', 'Thợ điện, máy; bến xăng dầu',
        'Cách ly nguồn, khóa – gắn thẻ, kiểm tra không điện; điện bờ, nối đất; hầm máy nóng, ồn; nồi hơi, bình khí nén, trạm khí; nhập xuất xăng dầu: chống tĩnh điện, tràn đổ.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy quy mô, loại hình và thiết bị của cảng, nhà máy, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
      + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn điện', 'Thợ điện cẩu, điện tàu, điện container lạnh, trạm biến áp, máy hàn lớn.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu: ngã cao, đuối nước, dập chi, bỏng, điện giật, ngạt khí trong hầm.'],
      ['Huấn luyện an toàn hóa chất', 'Hàng nguy hiểm, bến xăng dầu, sơn tàu, dung môi, khí hàn, hóa chất vệ sinh két.'],
      ['Kiểm định kỹ thuật an toàn', 'Nồi hơi, bình áp lực, chai khí, hệ thống lạnh; cầu trục, xe nâng dùng chung.'],
      ['Quan trắc môi trường lao động', 'Xưởng hàn, phun cát, sơn tàu, hầm hàng: bụi, khói hàn, hơi dung môi, ồn, nhiệt.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Hàn cắt trong két, vệ sinh hầm, cẩu lắp tổng đoạn, hạ thủy, hàng siêu trường.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Cân hàng, cân xe; thiết bị đo phòng KCS; thiết bị đo khí, lực, nhiệt độ, điện.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Hãng tàu, chủ tàu, chủ hàng yêu cầu; dự thầu; nghề hàn, lắp ráp, vận hành thiết bị.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Cẩu bờ, cổng trục đà tàu có do Viện STP – DAKO kiểm định không?',
      'Thiết bị xếp dỡ chuyên dùng trong cảng và nhà máy đóng, sửa chữa tàu thuộc chế độ chứng nhận, kiểm định riêng của ngành giao thông vận tải, chưa thuộc phạm vi kiểm định của Viện. Viện kiểm định thiết bị thuộc danh mục chung (nồi hơi, bình áp lực, chai khí, cầu trục, xe nâng dùng chung); hạn của mọi thiết bị đều theo dõi được trên phần mềm.'],
    ['Lái cẩu, thợ hàn đã có chứng chỉ nghề, còn phải học Nhóm 3?',
      'Có. Chứng chỉ vận hành, chứng chỉ thợ hàn theo yêu cầu đăng kiểm, chủ tàu chứng minh tay nghề; huấn luyện Nhóm 3 là yêu cầu ATVSLĐ riêng cho công việc thuộc Danh mục. Hai việc không thay thế nhau; thiết bị đã được chứng nhận vẫn cần người vận hành được huấn luyện.'],
    ['Nhà thầu phụ, tổ đội khoán, lái cẩu thuê ngoài: ai huấn luyện?',
      'Đơn vị là người sử dụng lao động của họ chịu trách nhiệm huấn luyện; cảng, nhà máy kiểm tra chứng nhận trước khi cho lên tàu, vào khoang. Lao động thuê lại theo Điều 30–32 Nghị định 39/2016/NĐ-CP; tổ đội không có pháp nhân, thợ tự do: chuyên viên xác định theo hợp đồng.'],
    ['Công nhân xếp dỡ làm theo tàu, thời vụ, có phải huấn luyện không?',
      'Có, theo công việc thực tế và trước khi giao việc thuộc Danh mục. Người nghỉ từ 6 tháng trở lên rồi quay lại phải huấn luyện lại. Viện STP – DAKO huấn luyện theo đợt tại cảng, nhà máy; chứng nhận tra cứu theo mã giúp biết ngay ai đủ điều kiện vào làm.'],
    ['Kiểm đếm, kỹ sư giám sát chỉ thỉnh thoảng xuống tàu thì học nhóm nào?',
      'Tối thiểu Nhóm 4, nội dung gắn với làm việc cạnh cẩu, xe và mép nước. Người thường xuyên làm việc trên tàu, trên cao, trong hầm hàng, két được xem xét Nhóm 3. Đây là trường hợp ranh giới; chuyên viên rà soát theo mô tả công việc.'],
    ['Thuyền viên tàu lai đã có chứng chỉ hàng hải, có phải huấn luyện ATVSLĐ?',
      'Chứng chỉ chuyên môn hàng hải là yêu cầu chuyên ngành; huấn luyện ATVSLĐ cho công việc trên biển, mặt nước là yêu cầu của pháp luật lao động. Chuyên viên xác định phần đã đáp ứng, phần cần bổ sung. Huấn luyện thuyền viên, an ninh tàu biển, nghiệp vụ lặn nằm ngoài phạm vi của Viện.'],
    ['Cảng chạy 24/7, nhà máy chạy theo tiến độ tàu: tổ chức huấn luyện thế nào?',
      'Chia đợt nhỏ theo ca, kíp, tổ; chuyên viên sắp xếp theo lịch tàu và tiến độ do doanh nghiệp cung cấp, tổ chức ngay tại cảng, nhà máy. Thợ thầu phụ vào theo đợt có thể được huấn luyện nhanh trước khi tàu vào sửa.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm, không thừa; có thể chia đợt, ưu tiên Nhóm 1, 2 và lái cẩu, người làm trong hầm, két, hàn cắt, trên cao, trên mặt nước trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, nhà thầu phụ, thiết bị.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, kíp, lịch tàu.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Hãng tàu, chủ hàng, đoàn kiểm tra, nhà máy thuê thầu'),
      ['Huấn luyện tại cảng, nhà máy',
        'Chia đợt theo ca, kíp, theo lịch tàu để không gián đoạn khai thác; thực hành tại chỗ trên thiết bị và công việc thực tế của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 30–32, 36, 37, 38)', 'Thuê lại lao động (Điều 30–32); bố trí người làm công tác ATVSLĐ (đóng, sửa chữa tàu biển: khoản 1 Điều 36); y tế (Điều 37); hội đồng ATVSLĐ cơ sở (Điều 38).'],
      DANH_MUC,
      ['Thông tư 35/2011/TT-BGTVT (đã sửa đổi, bổ sung); QCVN 22:2018/BGTVT', 'Chứng nhận, kiểm định riêng của ngành giao thông vận tải cho thiết bị xếp dỡ chuyên dùng trong cảng, cơ sở đóng, sửa chữa tàu.'],
      ['Nghị quyết 66.18/2026/NQ-CP', 'Cơ chế tạm thời từ 01/7/2026 đến hết 28/02/2027: đơn giản hóa một số thủ tục ATVSLĐ; máy, thiết bị nghiêm ngặt khai báo khi đưa vào sử dụng.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('17/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026 và trình Quốc hội, dự kiến xem xét tại kỳ họp thứ 2 khai mạc ngày 17/10/2026, '
      + 'kèm dự thảo nghị định thay thế Nghị định 39/2016/NĐ-CP và Nghị định 44/2016/NĐ-CP; dự án chưa có hiệu lực'),
  },
};
