// Nội dung tài liệu số 11 – Ngành Gỗ – Nội thất.
// Nguồn: “Cẩm nang tư vấn ATVSLĐ – Ngành Gỗ – Nội thất” (bản cho nhân viên kinh doanh, thông tin pháp lý đến 17/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Ngành này áp dụng khoản 2 Điều 36 và khoản 2 Điều 37 Nghị định 39/2016/NĐ-CP (bảng bố trí hai dòng ATVSLĐ + y tế như tài liệu 05).
// Cẩm nang còn dẫn Thông tư 05/2021/TT-BCT và Nghị định 113/2017/NĐ-CP; hai văn bản này đã được thay thế nên không đưa vào.
// Cẩm nang nêu Nghị định 283/2026/NĐ-CP về xử phạt; tài liệu gửi doanh nghiệp không nêu mức phạt nên không đưa vào.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '11',
  tenFile: '11_GoNoiThat_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Gỗ – Nội thất (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp gỗ – nội thất – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Gỗ – Nội thất',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH GỖ – NỘI THẤT',
    gioiThieu: 'Nhà máy gỗ – nội thất dùng nhiều máy có lưỡi cắt quay, sơn và keo dung môi, lò hơi, lò sấy, và có '
      + 'bụi gỗ dễ cháy. Tài liệu này giúp Quý Doanh nghiệp nắm nhanh sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) '
      + 'theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin cho buổi làm việc với chuyên viên của '
      + 'Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP GỖ – NỘI THẤT CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả thợ lâu năm, lao động thời vụ, học nghề, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh hay thâm niên.',
      '**Thợ vận hành máy gỗ thường thuộc {{3}}:** Danh mục công việc nghiêm ngặt nêu thẳng công việc cưa, xẻ, chế biến gỗ và các máy cưa, bào, phay, đục, đánh nhám, ép, sấy, súng khí nén. Số người {{3}} ở nhà máy gỗ thường lớn hơn dự tính ban đầu.',
      '**Sơn, keo, lò hơi, xe nâng cũng là công việc {{3}}:** thợ sơn, pha sơn, kho hóa chất, vận hành lò hơi, xe nâng, cần trục, thợ điện, hàn, lái xe, bốc xếp từ 30 kg; văn phòng, QC, may bọc, đóng gói thường thuộc {{4}}.',
      '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; người nghỉ việc hoặc xưởng ngừng hoạt động từ 6 tháng trở lên phải huấn luyện lại.',
      '**Đánh giá của khách hàng nước ngoài không thay thế hồ sơ theo pháp luật Việt Nam:** hồ sơ huấn luyện được xem khi thanh tra, khi ban quản lý khu công nghiệp kiểm tra, khi xảy ra tai nạn và khi khách hàng đánh giá nhà máy. Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('nhà máy, xưởng gỗ – nội thất'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ doanh nghiệp, tổng giám đốc, giám đốc nhà máy; phó giám đốc được giao phụ trách; giám đốc sản xuất, giám đốc xưởng; trưởng phòng; quản đốc, phó quản đốc, trưởng bộ phận sản xuất, trưởng ca.',
        hocGi: 'Pháp luật, trách nhiệm người quản lý; tổ chức bộ máy ATVSLĐ và y tế theo quy mô; kế hoạch hằng năm, nội quy từng công đoạn (xẻ, gia công, sơn, sấy, hút bụi, lò hơi); rủi ro cháy nổ do bụi gỗ, dung môi; quản lý thợ khoán, nhà thầu; điều tra tai nạn.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng bộ phận HSE, cán bộ ATVSLĐ chuyên trách, nhân viên HSE, giám sát an toàn xưởng; người bán chuyên trách, kiêm nhiệm (thường từ bộ phận kỹ thuật, nhân sự, cơ điện).',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; đánh giá rủi ro theo công đoạn (máy gỗ, chà nhám và bụi, sơn – keo, lò hơi – lò sấy, kho); kiểm soát hóa chất; an toàn máy khi bảo trì; đọc kết quả quan trắc; điều tra tai nạn; hồ sơ cho thanh tra, đánh giá.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: thợ cưa, xẻ, bào, phay, khoan, đục, tiện, chà nhám bằng máy, CNC; công nhân ván nhân tạo; thợ sơn, pha sơn, kho hóa chất; lò hơi, lò sấy; xe nâng, cần trục, lái xe; thợ điện, hàn, bảo trì; bốc xếp từ 30 kg.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả học nghề, thử việc, thời vụ: văn phòng, thiết kế, kế hoạch, kinh doanh, showroom; QC, KCS; thủ kho thông thường; thợ may bọc, đóng gói, kiểm hàng; thợ lắp ráp chỉ dùng dụng cụ cầm tay; bảo vệ, tạp vụ.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; nội quy khu sản xuất; nhận biết nguy hiểm từ máy gỗ, bụi gỗ, sơn – keo, xe nâng; trơn trượt do dăm bào, mùn cưa; mang vác, tư thế làm việc; thoát hiểm, ứng phó cháy; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: bác sĩ, y sĩ, điều dưỡng, nhân viên phòng y tế nhà máy.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn lao động (đứt, dập tay, dằm gỗ văng vào mắt, bỏng, dính sơn – keo, hít hơi dung môi); quản lý sức khỏe; bệnh nghề nghiệp; xử lý tình huống khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: tổ trưởng hoặc thợ có kinh nghiệm ở từng tổ, xưởng, ca, kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ (máy thiếu che chắn, bụi gỗ tích tụ, hóa chất để sai chỗ, lối thoát bị chặn); nhắc nhở; báo cáo, kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('nhà máy'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên (ví dụ xưởng ngừng theo đơn hàng).',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ quản đốc trực tiếp vận hành máy cưa: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ từ tổ lắp ráp sang tổ cưa, phay) thì người lao động cần được huấn luyện theo công việc mới trước khi làm.',
    ],
    canBo: {
      tieuDe: 'Nhà máy cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2) và y tế (Nhóm 5)?',
      dan: 'Chế biến gỗ, sản xuất nội thất áp dụng khoản 2 Điều 36 (người làm công tác ATVSLĐ) và khoản 2 Điều 37 (người làm '
        + 'công tác y tế) Nghị định 39/2016/NĐ-CP. Mức tối thiểu:',
      tieuDeCotNhan: 'Bố trí',
      rongCotNhan: 2000,
      cot: ['Dưới 300 lao động', 'Từ 300 đến dưới 500', 'Từ 500 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['Người làm công tác ATVSLĐ ({{2}})',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '01 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 02 người **chuyên trách**'],
        ['Người làm công tác y tế ({{5}})',
          '01 người trung cấp y', '01 người trung cấp y', '01 y sĩ và 01 người trung cấp y',
          '01 bác sĩ và 01 người làm y tế khác'],
      ],
      ghiChu: 'Có thêm ngành nghề thuộc nhóm phải bố trí cao hơn (ví dụ gia công cơ khí) thì có thể áp dụng mức cao hơn; '
        + 'không tự bố trí người làm y tế thì hợp đồng với cơ sở khám bệnh, chữa bệnh. Chuyên viên xác nhận mức cụ thể.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, nhà máy, phòng ban, xưởng, bộ phận) hoặc phụ trách sản xuất, kỹ thuật, kinh doanh?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp cưa, xẻ, bào, phay, khoan, đục, chà nhám bằng máy; dùng sơn, keo, dung môi nguy hiểm; vận hành lò hơi, lò sấy, bình áp lực, xe nâng, cần trục; làm điện, hàn; lái xe; bốc xếp từ 30 kg; làm việc trên cao từ 2 m, trong không gian hạn chế?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ SẢN XUẤT'],
      ['Chủ doanh nghiệp, chủ tịch HĐQT, tổng giám đốc, giám đốc công ty, nhà máy', '1', 'Người đứng đầu đơn vị.'],
      ['Phó giám đốc; giám đốc sản xuất, giám đốc xưởng, chi nhánh; trưởng phòng', '1', 'Cấp phó, phó phòng: khi được giao phụ trách.'],
      ['Quản đốc, phó quản đốc xưởng; trưởng bộ phận sản xuất, trưởng ca', '1', 'Trực tiếp vận hành máy: thêm Nhóm 3.'],
      ['Tổ trưởng, tổ phó, thợ cả (xẻ, gia công, sơn, lắp ráp, bọc)', '3 hoặc 4', 'Trực tiếp chạy máy: Nhóm 3; nên thêm Nhóm 6.'],
      ['B. VĂN PHÒNG, KỸ THUẬT, QC, AN TOÀN, Y TẾ'],
      ['Thiết kế, kế hoạch, kế toán, nhân sự, IT, mua hàng, kinh doanh, showroom', '4', 'Phổ biến nội quy khi xuống xưởng.'],
      ['Lập trình viên CNC, kỹ sư công nghệ gỗ', '4 hoặc 3', 'Thường xuyên chạy, chỉnh máy: Nhóm 3.'],
      ['QC, KCS, kiểm gỗ; kỹ thuật viên phòng thí nghiệm', '4 hoặc 3', 'Bốc vác nặng, trên cao, hóa chất nguy hiểm: Nhóm 3.'],
      ['Trưởng bộ phận HSE; cán bộ ATVSLĐ chuyên trách, kiêm nhiệm', '2', 'Trưởng bộ phận: học thêm Nhóm 1.'],
      ['Bác sĩ, y sĩ, điều dưỡng, phòng y tế nhà máy', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên (tổ, xưởng, ca)', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['Bảo vệ, lao công, tạp vụ; nhân viên bếp ăn tập thể', '4 hoặc 3', 'Bếp ăn từ 300 suất/ngày trở lên: Nhóm 3.'],
      ['C. XẺ, SƠ CHẾ, SẤY, GIA CÔNG, LẮP RÁP'],
      ['Thợ cưa xẻ, cắt khúc, cưa bàn, cưa panel; bào, phay, tupi, khoan, đục, tiện', '3', 'Cưa, xẻ gỗ và các máy này thuộc Danh mục.'],
      ['Thợ chà nhám bằng máy (băng, trống, rung)', '3', 'Máy đánh nhám, đánh bóng.'],
      ['Thợ vận hành CNC, router, máy dán cạnh, khoan nhiều trục', '3', 'Chuyên viên xác nhận theo loại máy.'],
      ['Thợ ghép thanh, ghép ván (máy ép, ép cao tần); vận hành lò sấy gỗ', '3', 'Chuyên viên xác nhận theo thiết bị.'],
      ['Thợ lắp ráp, thợ mộc; chà nhám, chạm khắc thủ công', '4 hoặc 3', 'Súng khí nén, máy cầm tay thường xuyên: Nhóm 3.'],
      ['D. SƠN, BỌC NỆM, ĐÓNG GÓI'],
      ['Thợ sơn phun, pha sơn, pha keo; vận hành phòng sấy sơn, sơn UV', '3', 'Theo phân loại nguy hiểm của sơn, dung môi.'],
      ['Thợ sơn thủ công, lau màu, bả mattit, trét', '3 hoặc 4', 'Chuyên viên đối chiếu bảng dữ liệu an toàn.'],
      ['Thợ cắt mút bằng máy; dán mút, keo xịt; bọc bằng súng bắn ghim', '3', 'Chuyên viên xác nhận theo máy, loại keo.'],
      ['Thợ may bọc; đóng gói, đóng thùng, kiểm tra thành phẩm', '4', 'Kiêm bốc xếp nặng thường xuyên: Nhóm 3.'],
      ['Thợ đóng pallet, đóng kiện gỗ', '3 hoặc 4', 'Cưa cắt gỗ, súng bắn đinh: Nhóm 3.'],
      ['E. VÁN NHÂN TẠO (MDF, VÁN DĂM, VÁN ÉP, VENEER)'],
      ['Băm dăm, nghiền, sấy; trộn keo; ép nóng; bóc veneer; chà nhám, cưa ván', '3', 'Thợ keo: thêm huấn luyện an toàn hóa chất.'],
      ['Vận hành băng tải, nạp liệu; nhân viên phòng điều khiển trung tâm', '3 hoặc 4', 'Chỉ quan sát, bấm nút: chuyên viên xác nhận.'],
      ['F. KHO, XE NÂNG, LÁI XE'],
      ['Thủ kho, nhân viên kho gỗ, kho ván, thành phẩm; giao nhận', '4 hoặc 3', 'Bốc xếp từ 30 kg, kệ cao từ 2 m: Nhóm 3.'],
      ['Bốc xếp gỗ, xếp lò sấy, xếp container; chọn, phân loại, đóng bó gỗ', '3 hoặc 4', 'Bốc xếp thủ công thường xuyên từ 30 kg: Nhóm 3.'],
      ['Nhân viên kho hóa chất (sơn, dung môi, keo)', '3', 'Thêm huấn luyện an toàn hóa chất.'],
      ['Lái xe ô tô, xe tải chở gỗ; vận hành xe nâng, cần trục, palăng', '3', 'Sạc ắc quy xe nâng: chuyên viên xác nhận.'],
      ['G. CƠ ĐIỆN, LÒ HƠI, MÔI TRƯỜNG'],
      ['Thợ điện, trực trạm biến áp, tủ điện; thợ điện lạnh', '3', 'Thêm huấn luyện an toàn điện.'],
      ['Thợ cơ khí, hàn – cắt; mài lưỡi cưa, dao bào; làm việc trên cao từ 2 m', '3', 'Hàn, mài, bảo dưỡng máy gỗ thuộc Danh mục.'],
      ['Vận hành lò hơi, lò dầu, đường ống hơi, máy nén khí, bình áp lực', '3', 'Người cấp liệu lò hơi: chuyên viên xác nhận.'],
      ['Hút bụi, cyclone; xử lý nước thải; vệ sinh silo, bunker, bể, hầm', '3', 'Không gian hạn chế: chuyên viên xác nhận.'],
      ['H. LẮP ĐẶT, THỜI VỤ, NHÀ THẦU, KHÁCH'],
      ['Đội lắp đặt, hoàn thiện nội thất tại công trình', '3', 'Đội trưởng phụ trách: thêm Nhóm 1.'],
      ['Giao hàng, lắp ráp tại nhà khách hàng', '4 hoặc 3', 'Lái xe ô tô, làm trên cao thường xuyên: Nhóm 3.'],
      ['Công nhân mới, học nghề, thử việc, thời vụ theo đơn hàng', 'Theo công việc', 'Huấn luyện trước khi vận hành máy.'],
      ['Thợ khoán, tổ đội; lao động thuê lại; nhà thầu dịch vụ (bảo vệ, bếp ăn, bảo trì)', 'Theo công việc', 'Chuyên viên làm rõ bên nào huấn luyện.'],
      ['Khách vào nhà máy (đoàn đánh giá, khách hàng, nhà cung cấp gỗ)', '—', 'Không thuộc 6 nhóm; phổ biến nội quy, PPE.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới (máy CNC, súng khí nén, sơn gốc nước, tổ trưởng).',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG GỖ – NỘI THẤT: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao nhà máy gỗ có nhiều người thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông tư '
      + '06/2020/TT-BLĐTBXH) nêu thẳng công việc cưa, xẻ, chế biến gỗ công nghiệp và các máy cưa, phay, bào, tiện, đục, ép, '
      + 'sấy, đánh nhám, băng tải, súng khí nén. Văn phòng, QC, may bọc, đóng gói thường thuộc Nhóm 4.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại nhà máy, xưởng gỗ:',
    nghe: [
      ['Xẻ, sơ chế, sấy', 'Cưa xẻ, bào, ghép; lò sấy',
        'Đứt, dập tay, gỗ bật ngược, lưỡi cưa gãy; che chắn, dụng cụ đẩy gỗ; khóa nguồn khi thay lưỡi; kê xếp gỗ chống đổ; lò sấy: nhiệt, hơi nước, cháy; sơ cứu cầm máu.'],
      ['Gia công, lắp ráp', 'Phay, tupi, CNC, chà nhám',
        'Kẹp, cắt, văng mảnh, vùng đầu cắt CNC; dừng khẩn cấp, kiểm tra máy trước ca; bụi gỗ, hút bụi cục bộ; súng bắn đinh, ghim: bắn nhầm, giật; khiêng tấm lớn.'],
      ['Sơn, hoàn thiện', 'Sơn phun, pha sơn, sấy sơn',
        'Nhãn GHS, bảng dữ liệu an toàn; buồng sơn, thông gió; mặt nạ lọc hơi hữu cơ, găng; pha, chuyển sơn chống tràn đổ; cháy nổ hơi dung môi, giẻ lau dính sơn; sơ cứu hóa chất.'],
      ['Bọc nệm, đóng gói', 'Cắt mút, keo xịt, bắn ghim',
        'Lưỡi cắt, kim, vật sắc; keo xịt: hơi, cháy, thông gió; mút xốp dễ cháy, lưu kho, lối thoát; súng bắn ghim khí nén; đóng pallet: cưa cắt, bắn đinh, mang vác.'],
      ['Ván nhân tạo', 'Băm dăm, ép nóng, veneer',
        'Kẹp, cuốn ở máy nghiền, băng tải; nhiệt, áp lực máy ép; cô lập năng lượng khi xử lý kẹt liệu; bụi nổ; hơi keo; vào silo, bunker: xin phép, đo khí, người giám sát.'],
      ['Lò hơi, thiết bị nâng', 'Lò hơi, máy nén khí; xe nâng',
        'Nổ, bỏng hơi, quá áp; van an toàn, áp kế, mức nước, nhật ký vận hành; đốt dăm, mùn cưa; xe nâng, cần trục: tải trọng, điểm mù, tín hiệu, chằng buộc gỗ; ắc quy xe nâng.'],
      ['Cơ điện, môi trường', 'Điện, hàn, hút bụi, bể',
        'Cô lập nguồn, khóa và gắn thẻ, kiểm tra không điện; hàn cắt cạnh bụi gỗ, dăm bào; mài lưỡi cưa; trên cao; hút bụi: nổ bụi; bể, hầm, silo: đo khí, thông gió, cứu hộ.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy quy mô, công đoạn và thiết bị của nhà máy, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên Viện STP – '
      + 'DAKO sẽ xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện an toàn hóa chất', 'Sơn, dung môi, keo dán, thuốc chống mối mọt, hóa chất xử lý nước thải.'],
      ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện – bảo trì, trạm biến áp, tủ điện xưởng, hệ thống hút bụi.'],
      ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu theo ca: đứt, dập tay, dằm gỗ vào mắt, bỏng, dính hóa chất.'],
      ['Kiểm định kỹ thuật an toàn', 'Nồi hơi, đường ống hơi, bình khí nén, xe nâng, cầu trục, palăng, thang máy.'],
      ['Quan trắc môi trường lao động', 'Bụi gỗ, tiếng ồn, nhiệt; hơi dung môi ở phòng sơn, khu dán keo, ép nóng.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Theo công đoạn: xẻ, gia công, chà nhám, sơn, sấy, hút bụi, kho gỗ và hóa chất.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Cân, thước đo, nhiệt ẩm kế, thiết bị đo điện ở phòng QC, lò sấy.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Khách hàng yêu cầu hệ thống quản lý ATLĐ; nghề mộc, máy gỗ, sơn.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Thợ làm nghề lâu năm, quen tay rồi, có cần huấn luyện không?',
      'Có. Huấn luyện là yêu cầu của pháp luật với mọi người lao động, không phụ thuộc thâm niên; người trực tiếp vận hành máy cưa, bào, phay thường thuộc Nhóm 3. Nhiều tai nạn máy xảy ra ở người quen tay; Viện STP – DAKO huấn luyện gọn theo ca, có thực hành tại chỗ.'],
    ['Thợ bào, phay, CNC, lắp ráp có phải Nhóm 3 như thợ cưa?',
      'Danh mục nêu cả các máy cưa, phay, bào, tiện, đục, đánh nhám và súng khí nén, nên thợ vận hành các máy này thường thuộc Nhóm 3. Máy CNC, thợ lắp ráp dùng súng bắn đinh, thợ chà nhám tay là trường hợp ranh giới; chuyên viên xác nhận theo từng loại máy, dụng cụ.'],
    ['Dùng sơn gốc nước thì thợ sơn có phải Nhóm 3?',
      'Phụ thuộc phân loại nguy hiểm theo GHS của từng loại sơn, dung môi, keo và mức tiếp xúc. Doanh nghiệp chuẩn bị danh sách hóa chất kèm bảng dữ liệu an toàn để chuyên viên đánh giá. Huấn luyện an toàn hóa chất là dịch vụ riêng; tùy đối tượng có thể cần cả hai.'],
    ['Máy CNC, lò sấy, máy nén khí có phải kiểm định không?',
      'Danh mục công việc quyết định ai thuộc Nhóm 3; danh mục máy, thiết bị quyết định thiết bị phải kiểm định. Nồi hơi, đường ống hơi, bình áp lực, xe nâng, cầu trục, thang máy thuộc diện kiểm định. Máy cưa, CNC, lò sấy cụ thể: chuyên viên đối chiếu theo loại máy, thông số.'],
    ['Thợ khoán, tổ đội, lao động thời vụ có phải huấn luyện không?',
      'Doanh nghiệp có trách nhiệm huấn luyện người làm việc cho mình, kể cả học nghề, thử việc, thời vụ, và huấn luyện trước khi giao việc, nhất là trước khi vận hành máy. Với thợ khoán, lao động thuê lại, trách nhiệm phụ thuộc quan hệ lao động và hợp đồng; chuyên viên làm rõ.'],
    ['Khách hàng nước ngoài đã đánh giá nhà máy, còn cần huấn luyện theo Việt Nam?',
      'Có. Huấn luyện theo pháp luật Việt Nam là nghĩa vụ riêng và là nền hồ sơ cho mọi đoàn đánh giá, thanh tra. Viện không tư vấn chứng nhận gỗ hợp pháp, chuỗi hành trình sản phẩm và không cam kết kết quả đánh giá của khách hàng.'],
    ['Nhà máy gỗ rất dễ cháy, Viện có huấn luyện phòng cháy chữa cháy?',
      'Huấn luyện nghiệp vụ phòng cháy chữa cháy chưa nằm trong phạm vi của Viện; chuyên viên ghi nhận để phối hợp đơn vị phù hợp. Viện hỗ trợ đánh giá rủi ro cháy nổ do bụi gỗ, dung môi; nội dung ứng phó khẩn cấp có trong Nhóm 1, Nhóm 2 và thoát hiểm trong Nhóm 4.'],
    ['Chi phí và lịch huấn luyện được tính thế nào?',
      'Chi phí theo nhóm huấn luyện, số học viên, địa điểm, hình thức tổ chức; do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm, không thừa; chia đợt theo xưởng, theo ca, tránh cao điểm đơn hàng; có thể ưu tiên Nhóm 1, 2, 5 và thợ sơn, lò hơi, xe nâng trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo xưởng, máy, hóa chất.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công đoạn nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo đợt, ca, xưởng.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Khách hàng, đoàn đánh giá, cơ quan kiểm tra'),
      ['Huấn luyện tại nhà máy',
        'Chia đợt theo xưởng, theo ca, tránh cao điểm đơn hàng; thực hành tại chỗ trên máy và quy trình của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 30–32, 35, 36, 37)', 'Lao động thuê lại (Điều 30–32); ban quản lý khu công nghiệp kiểm tra (Điều 35); bố trí người làm công tác ATVSLĐ và y tế theo quy mô (khoản 2 Điều 36, 37).'],
      DANH_MUC,
      ['Thông tư 19/2016/TT-BYT; các quy chuẩn kỹ thuật quốc gia về vệ sinh lao động', 'Quản lý vệ sinh lao động, sức khỏe người lao động, sơ cấp cứu; quan trắc bụi, tiếng ồn, vi khí hậu, hơi hóa chất.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('17/10/2026',
      'đang được trình Quốc hội, dự kiến xem xét tại kỳ họp tháng 10/2026 theo trình tự rút gọn; dự án chưa có hiệu lực'),
  },
};
