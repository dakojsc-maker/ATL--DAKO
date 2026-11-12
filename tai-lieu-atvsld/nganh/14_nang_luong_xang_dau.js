// Nội dung tài liệu số 14 – Ngành Năng lượng – Xăng dầu.
// Nguồn: “Cẩm nang tư vấn ATVSLĐ – Ngành Năng lượng – Xăng dầu” (bản cho nhân viên kinh doanh, thông tin pháp lý đến 18/10/2026).
// Định dạng do tai-lieu-atvsld/khung/khung_tai_lieu.js quyết định; ở đây chỉ có chữ. Cú pháp: xem nganh/01_xay_dung.js.
// Bảng bố trí hai dòng như tài liệu 04: lọc hóa dầu, hóa chất (khoản 1 Điều 36) và kho, vận tải, bán lẻ, khí (khoản 2).
// Cẩm nang tự nêu Thông tư 05/2021/TT-BCT và Nghị định 113/2017/NĐ-CP đã được thay thế; tài liệu dẫn văn bản hiện hành.

const chung = require('../khung/noi_dung_chung');

const [LUAT, NGHI_DINH_44, , DANH_MUC] = chung.PHAP_LY_CHUNG;

module.exports = {
  so: '14',
  tenFile: '14_NangLuongXangDau_DoanhNghiep_ATVSLD_VienSTP_DAKO',
  tieuDeFile: 'Các nhóm huấn luyện ATVSLĐ – Ngành Năng lượng – Xăng dầu (tài liệu dành cho doanh nghiệp)',
  moTaFile: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp năng lượng – xăng dầu – Viện STP – DAKO',
  dauTrang: 'Các nhóm huấn luyện ATVSLĐ – Ngành Năng lượng – Xăng dầu',
  chanTrang: chung.CHAN_TRANG,

  // ------------------------------------------------------------ Trang 1
  bia: {
    nganh: 'NGÀNH NĂNG LƯỢNG – XĂNG DẦU',
    gioiThieu: 'Kho, cảng, cửa hàng xăng dầu, trạm nạp khí, nhà máy lọc hóa dầu và dự án năng lượng mới luôn có nguy cơ cháy '
      + 'nổ, hơi độc, áp lực, tĩnh điện; nhân viên làm theo ca, phân tán ở nhiều điểm. Tài liệu này giúp Quý Doanh nghiệp nắm '
      + 'nhanh sáu nhóm huấn luyện an toàn, vệ sinh lao động (ATVSLĐ) theo quy định, tự ước tính nhân sự thuộc từng nhóm và '
      + 'chuẩn bị sẵn thông tin cho buổi làm việc với chuyên viên của Viện STP – DAKO.',
    tieuDeDiemChinh: 'NĂM ĐIỀU DOANH NGHIỆP XĂNG DẦU, KHÍ CẦN BIẾT',
    diemChinh: [
      '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng, kể cả lao động thời vụ, học việc, thử việc. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
      '**Phần lớn nhân viên tuyến trước thuộc {{3}}:** Danh mục công việc nghiêm ngặt có nhóm riêng cho vận hành máy bơm xăng, dầu, khí hóa lỏng; sửa chữa bồn, bể; giao, nhận, bán buôn, bán lẻ xăng dầu. Nhân viên bơm, bán hàng, vận hành kho, nạp khí, lái xe bồn thường thuộc {{3}}.',
      '**Chứng chỉ chuyên ngành không thay thế huấn luyện ATVSLĐ:** chứng chỉ phòng cháy chữa cháy và bảo vệ môi trường theo điều kiện kinh doanh, tập huấn hàng hóa nguy hiểm, huấn luyện kỹ thuật an toàn kinh doanh khí là các yêu cầu riêng, song song với ATVSLĐ.',
      '**Nhiều cửa hàng, nhiều ca, nhân sự luân chuyển:** người mới phải được huấn luyện trước khi vào ca; người nghỉ từ 6 tháng trở lên phải huấn luyện lại; giấy chứng nhận, thẻ an toàn có thời hạn 2 năm, {{4}} định kỳ hằng năm.',
      '**Thầu phụ vệ sinh bồn, bảo trì, xe bồn thuê ngoài phải có hồ sơ:** đơn vị sử dụng lao động của họ chịu trách nhiệm huấn luyện; kho, cửa hàng kiểm tra chứng nhận (tra cứu theo mã) trước khi cho vào làm. Chi phí huấn luyện do người sử dụng lao động chi trả.',
    ],
  },

  // ------------------------------------------------------------ Mục 1
  muc1: {
    dan: chung.danSauNhom('kho, cửa hàng xăng dầu, trạm khí, nhà máy và dự án năng lượng'),
    nhom: [
      {
        n: 1,
        aiHoc: 'Người quản lý: chủ doanh nghiệp, tổng giám đốc, giám đốc công ty, chi nhánh, kho, nhà máy; phó giám đốc được giao phụ trách; trưởng phòng; trưởng kho, trưởng trạm nạp, trạm cấp khí, quản đốc; cửa hàng trưởng.',
        hocGi: 'Pháp luật, trách nhiệm người đứng đầu; tổ chức bộ máy ATVSLĐ cho kho, nhà máy và hệ thống cửa hàng; kế hoạch ATVSLĐ, ứng cứu khẩn cấp; đánh giá rủi ro cháy nổ, hơi độc, áp lực; quản lý thầu phụ, xe bồn bên ngoài; điều tra tai nạn, sự cố.',
      },
      {
        n: 2,
        aiHoc: 'Người làm công tác ATVSLĐ: trưởng phòng HSE, quản lý an toàn; cán bộ ATVSLĐ, HSE, môi trường; cán bộ phòng cháy hoặc quản lý kỹ thuật được giao kiêm nhiệm ATVSLĐ.',
        hocGi: 'Nghiệp vụ ATVSLĐ chuyên sâu; kiểm soát nguồn lửa, tĩnh điện, hơi độc; quản lý công việc vào bồn, làm việc nóng; thiết bị áp lực, chai khí; quản lý nhà thầu; kiểm tra hiện trường kho, cửa hàng; điều tra tai nạn; hồ sơ nhiều đơn vị.',
      },
      {
        n: 3,
        aiHoc: 'Người làm công việc có yêu cầu nghiêm ngặt: nhân viên bán hàng, bơm xăng dầu; vận hành bồn, bơm, xuất nhập; đo bồn, lấy mẫu; nạp chai, trạm khí; lái xe bồn, giao bình gas; vệ sinh, sửa chữa bồn bể; thợ hàn, điện; dầu khí; điện mặt trời, trạm sạc.',
        hocGi: 'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo công việc (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
      },
      {
        n: 4,
        aiHoc: 'Người lao động khác, kể cả thời vụ, học việc, thử việc: thu ngân không bán hàng; nhân viên cửa hàng tiện lợi; văn phòng, kinh doanh, kế toán, nhân sự; thủ kho vật tư thông thường; bảo vệ kho, cửa hàng.',
        hocGi: 'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ; quy tắc an toàn trong khu vực bơm, kho: nguồn lửa, tĩnh điện, điện thoại; ca đêm, cướp, khách gây gổ; hóa chất tẩy rửa; thoát nạn và báo cháy; sơ cấp cứu cơ bản.',
      },
      {
        n: 5,
        aiHoc: 'Người làm công tác y tế: nhân viên y tế của kho, nhà máy, trạm y tế.',
        hocGi: 'Nghiệp vụ y tế lao động; sơ cấp cứu, cấp cứu tai nạn (bỏng, ngạt hơi xăng, khí, ngộ độc, điện giật, tai nạn giao thông); quản lý sức khỏe; bệnh nghề nghiệp; ứng phó khẩn cấp.',
      },
      {
        n: 6,
        aiHoc: 'An toàn, vệ sinh viên: nhân viên có kinh nghiệm được cử ở từng ca, cửa hàng, kho, trạm, kiêm nhiệm.',
        hocGi: 'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ (khách hút thuốc, để máy nổ khi bơm, tràn đổ, dây nối đất hỏng, chai gas rò rỉ); nhắc nhở; báo cáo sự cố; kiến nghị.',
      },
    ].map((g) => ({ ...g, thoiGian: chung.THOI_GIAN[g.n] })),
    ghiChu: chung.ghiChuThoiGian('đơn vị'),
    luuY: [
      'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
      '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên (ví dụ nhân viên cửa hàng nghỉ rồi quay lại).',
      '**Một người có thể thuộc nhiều nhóm** (ví dụ cửa hàng trưởng trực tiếp bán hàng, giám sát bơm: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
      '**Chuyển sang công việc khác** (ví dụ thu ngân chuyển sang bơm xăng, nhân viên kho chuyển sang vệ sinh bồn) thì cần huấn luyện theo công việc mới.',
    ],
    canBo: {
      tieuDe: 'Doanh nghiệp cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?',
      dan: 'Lọc hóa dầu, hóa chất áp dụng khoản 1 Điều 36 Nghị định 39/2016/NĐ-CP; kho, vận tải, bán lẻ xăng dầu, kinh doanh '
        + 'khí thường áp dụng khoản 2. Mức tối thiểu:',
      cot: ['Dưới 50 lao động', 'Từ 50 đến dưới 300', 'Từ 300 đến dưới 1.000', 'Từ 1.000 trở lên'],
      dong: [
        ['Lọc hóa dầu, chế biến dầu mỏ, hóa chất (khoản 1)',
          '01 người **bán chuyên trách**', '01 người **chuyên trách**', '02 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 03 **chuyên trách**'],
        ['Kho, vận tải, bán lẻ xăng dầu, kinh doanh khí (khoản 2)',
          '01 người **bán chuyên trách**', '01 người **bán chuyên trách**', '01 người **chuyên trách**',
          'Phòng ATVSLĐ hoặc 02 **chuyên trách**'],
      ],
      ghiChu: 'Có chế biến, pha chế, chiết nạp, khai thác dầu khí; hệ thống nhiều cửa hàng: chuyên viên Viện STP – DAKO xác '
        + 'nhận mức áp dụng và cách tính số lao động.',
    },
  },

  // ------------------------------------------------------------ Mục 2
  muc2: {
    bonCauHoi: [
      'Đứng đầu một đơn vị (công ty, chi nhánh, kho, nhà máy, trạm, cửa hàng) hoặc phụ trách bộ phận kỹ thuật, kinh doanh, vận hành?  →  {{1}}',
      'Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
      'Trực tiếp vận hành máy bơm xăng, dầu, khí hóa lỏng; giao, nhận, bán xăng dầu; sửa chữa, vệ sinh bồn bể; nạp khí; làm việc trong không gian hạn chế, trên cao, trên biển; hóa chất; hàn, điện; lái xe; thiết bị áp lực, xe nâng; bốc xếp từ 30 kg?  →  {{3}}',
      'Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
    ],
    bangTra: [
      ['A. LÃNH ĐẠO VÀ QUẢN LÝ'],
      ['Chủ doanh nghiệp, tổng giám đốc, giám đốc công ty, chi nhánh, giám đốc khu vực', '1', 'Người đứng đầu đơn vị.'],
      ['Phó giám đốc (kỹ thuật, kinh doanh, vận hành, an toàn); trưởng phòng', '1', 'Cấp phó: khi được giao phụ trách.'],
      ['Giám đốc kho, trưởng kho, trưởng trạm nạp, trạm cấp khí, quản đốc', '1', 'Trực tiếp làm việc nghiêm ngặt: thêm Nhóm 3.'],
      ['Cửa hàng trưởng cửa hàng xăng dầu', '1 + 3', 'Đứng đầu cửa hàng và trực tiếp bán hàng.'],
      ['Trưởng ca vận hành kho, nhà máy, trạm', '3', 'Chỉ huy cả ca: chuyên viên xem xét Nhóm 1.'],
      ['Giám sát vùng (nhiều cửa hàng); trưởng đội xe, điều độ vận tải', '1 hoặc 4', 'Ranh giới: chuyên viên rà soát.'],
      ['B. CỬA HÀNG XĂNG DẦU, CỬA HÀNG KHÍ'],
      ['Nhân viên bán hàng, bơm xăng dầu, giao nhận xăng dầu tại cửa hàng', '3', 'Vận hành máy bơm, bán lẻ xăng dầu.'],
      ['Thu ngân, kế toán cửa hàng', '4 hoặc 3', 'Kiêm bán hàng, nhận hàng: Nhóm 3.'],
      ['Nhân viên cửa hàng tiện lợi', '4', 'Ca đêm, quy tắc khu vực bơm.'],
      ['Rửa xe, thay dầu, chăm sóc xe tại cửa hàng', '4 hoặc 3', 'Hóa chất, thiết bị nâng xe: ranh giới.'],
      ['Bán hàng cửa hàng gas, giao nhận bình gas', '3', 'Khí hóa lỏng; bốc xếp chai nặng.'],
      ['C. KHO, CẢNG, NHÀ MÁY'],
      ['Vận hành bồn, bơm, hệ thống xuất nhập (xe bồn, tàu, đường ống)', '3', 'Giao nhận, vận hành máy bơm xăng dầu.'],
      ['Đo bồn, lấy mẫu, kiểm soát chất lượng tại kho', '3', 'Hơi xăng, trên cao, giao nhận.'],
      ['Phòng thí nghiệm, phân tích mẫu', '3 hoặc 4', 'Dung môi, hóa chất nguy hiểm: ranh giới.'],
      ['Phòng điều khiển, vận hành hệ thống điều khiển (DCS, SCADA)', '3', 'Điều khiển từ xa: chuyên viên xác nhận.'],
      ['Vận hành nhà máy lọc hóa dầu, nhà máy chế biến', '3', 'Thiết bị áp lực, hóa chất.'],
      ['D. BẢO TRÌ, VỆ SINH BỒN, VẬN TẢI'],
      ['Thợ cơ khí, đường ống, sửa chữa bồn bể; vệ sinh bồn bể, hầm, đường ống', '3', 'Không gian hạn chế, hơi độc, hàn.'],
      ['Thợ hàn, cắt kim loại', '3', 'Làm việc có lửa gần khu vực nguy hiểm.'],
      ['Thợ điện, đo lường – tự động hóa, lắp cột bơm', '3', 'Thêm huấn luyện an toàn điện.'],
      ['Làm việc trên cao (đỉnh bồn, mái cửa hàng, trụ biển hiệu)', '3', 'Làm việc trên cao từ 2 m.'],
      ['Lái xe bồn, xe chở xăng dầu và khí, xe giao bình gas', '3', 'Hàng hóa nguy hiểm: tập huấn riêng.'],
      ['Phụ xe, người áp tải, người xếp dỡ', '3 hoặc 4', 'Giao nhận, bốc xếp xăng dầu: Nhóm 3.'],
      ['Thuyền trưởng, thuyền viên tàu dầu, sà lan; nhân viên bến', '3', 'Chuyên viên xác nhận; hàng hải: quy định riêng.'],
      ['E. KHÍ, DẦU KHÍ, NĂNG LƯỢNG MỚI'],
      ['Vận hành trạm nạp, nạp chai, kiểm tra, sửa chữa chai', '3', 'Khí hóa lỏng, áp lực, cháy nổ.'],
      ['Vận hành bồn LPG, trạm cấp khí, đường ống khí; lắp đặt hệ thống khí', '3', 'Đường ống khí, thiết bị áp lực.'],
      ['Nhân viên giàn khai thác, tàu, kho nổi, dịch vụ giếng; thợ lặn', '3', 'An toàn dầu khí chuyên ngành: quy định riêng.'],
      ['Lắp đặt, vận hành điện mặt trời, điện gió, trạm sạc, pin lưu trữ', '3', 'Điện, trên cao, ắc quy.'],
      ['Pha chế, vận hành nhiên liệu sinh học (ethanol)', '3', 'Hóa chất, cháy nổ: ranh giới.'],
      ['F. AN TOÀN, Y TẾ, HỖ TRỢ'],
      ['Trưởng phòng HSE, quản lý an toàn; cán bộ ATVSLĐ, HSE, môi trường', '2', 'Trưởng phòng: học thêm Nhóm 1.'],
      ['Cán bộ phòng cháy kiêm nhiệm ATVSLĐ', '2', 'Nghiệp vụ phòng cháy: quy định riêng.'],
      ['Nhân viên y tế kho, nhà máy, trạm y tế', '5', 'Người làm công tác y tế.'],
      ['An toàn, vệ sinh viên theo ca, cửa hàng, khu vực', '6', 'Học thêm, ngoài nhóm công việc chính.'],
      ['Bảo vệ kho, cửa hàng, nhà máy', '4', 'Ca đêm, kiểm soát nguồn lửa, ra vào.'],
      ['Thủ kho vật tư, mua hàng, logistics; bốc xếp phuy, thùng', '4 hoặc 3', 'Xe nâng, bốc xếp nặng, hóa chất: Nhóm 3.'],
      ['Kinh doanh, kế toán, nhân sự, IT, chăm sóc khách hàng', '4', 'Làm việc văn phòng.'],
      ['G. THỜI VỤ, THẦU PHỤ, KHÁCH'],
      ['Lao động thời vụ, học việc, thử việc', 'Theo công việc', 'Huấn luyện trước khi vào ca.'],
      ['Thầu phụ bảo trì, đại tu, vệ sinh bồn; lao động thuê lại', 'Theo công việc', 'Thường Nhóm 3; chuyên viên xác nhận bên huấn luyện.'],
      ['Lái xe bồn đối tác, khách, người giao hàng vào kho, cửa hàng', '—', 'Không thuộc 6 nhóm; hướng dẫn an toàn.'],
    ],
    ghiChu: 'Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
      + 'của từng người, nhất là các trường hợp ranh giới (thu ngân, rửa xe, phòng thí nghiệm, phòng điều khiển).',
  },

  // ------------------------------------------------------------ Mục 3
  muc3: {
    tieuDe: '3. NHÓM 3 TRONG XĂNG DẦU, KHÍ: HỌC GÌ THEO CÔNG VIỆC',
    viSao: '**Vì sao nhân viên cửa hàng xăng dầu cũng thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ '
      + '(Thông tư 06/2020/TT-BLĐTBXH) có nhóm riêng: vận hành máy bơm xăng, dầu, khí hóa lỏng; sửa chữa bồn, bể; giao, nhận, '
      + 'bán buôn, bán lẻ xăng dầu; cùng dầu khí, không gian hạn chế, đường ống khí, hóa chất, lái xe, công việc trên biển. Thu '
      + 'ngân, cửa hàng tiện lợi, văn phòng thuộc Nhóm 4.',
    dan: 'Ngoài phần chung, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại cửa hàng, kho, trạm, nhà máy:',
    nghe: [
      ['Cửa hàng xăng dầu', 'Bán hàng, bơm xăng dầu',
        'Hơi xăng dễ cháy nổ, hít phải, dính da; nguồn lửa, tĩnh điện; vận hành cột bơm, xử lý tràn đổ; giám sát xe bồn nhập bể ngầm; khách hút thuốc, để máy nổ; ca đêm, cướp.'],
      ['Kho, cảng, nhà máy', 'Bồn, bơm, xuất nhập, đo bồn',
        'Kiểm soát nguồn lửa, tĩnh điện, nối đất khi xuất nhập; vận hành bồn, bơm, van; xuất nhập xe bồn, tàu; đo bồn, lấy mẫu trên nóc bồn; quần áo, giày chống tĩnh điện.'],
      ['Bồn bể, bảo trì', 'Vệ sinh bồn; hàn; điện',
        'Vào bồn: đo oxy, khí cháy, khí độc, thông gió, người giám sát, cứu hộ; làm việc nóng: giấy phép, kiểm tra hơi xăng; khóa – gắn thẻ, xả áp; thiết bị điện phòng nổ.'],
      ['Kinh doanh khí', 'Nạp chai, trạm cấp khí',
        'LPG nặng hơn không khí, tích tụ chỗ thấp; phát hiện, xử lý rò rỉ; nạp, kiểm tra chai; xếp dỡ chai nặng; bồn, đường ống khí: áp lực, xả áp; sơ cứu bỏng lạnh, ngạt.'],
      ['Lái xe bồn, giao bình', 'Xe bồn, xe gas, áp tải',
        'Lái xe an toàn, mệt mỏi, kiểm tra xe trước khi đi; tĩnh điện, nối đất khi xuất nhập; xếp dỡ tại kho, cửa hàng; lật xe, rò rỉ: báo cáo, cảnh báo, giữ khoảng cách.'],
      ['Phòng điều khiển', 'Điều khiển; phòng thí nghiệm',
        'Sự cố tràn, quá áp, cháy; quy trình dừng khẩn cấp, giao nhận ca; dung môi, hóa chất, hơi xăng, tủ hút, PPE; lưu mẫu, xử lý chất thải; làm ca đêm, màn hình.'],
      ['Năng lượng mới', 'Điện mặt trời, trạm sạc',
        'Dòng một chiều của mảng pin, tủ điện, trạm sạc; khóa – gắn thẻ; điện giật, hồ quang; làm việc trên mái; ắc quy, hệ thống lưu trữ: cháy, hóa chất; nhiên liệu sinh học.'],
    ],
  },

  // ------------------------------------------------------------ Mục 4
  muc4: {
    dan: 'Tùy loại hình, quy mô và thiết bị, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên Viện STP – DAKO sẽ '
      + 'xác định cụ thể khi khảo sát.',
    dichVu: [
      ['Huấn luyện sơ cấp cứu', 'Mọi cơ sở xăng dầu, khí: bỏng, ngạt hơi xăng, ngộ độc, tai nạn giao thông.'],
      ['Huấn luyện an toàn điện', 'Thợ điện, thiết bị điện phòng nổ ở kho, cửa hàng; điện mặt trời, trạm sạc.'],
      ['Huấn luyện an toàn hóa chất', 'Phòng thí nghiệm, lọc hóa dầu, kho hóa chất, pha phụ gia, nhiên liệu sinh học.'],
      ['Kiểm định kỹ thuật an toàn', 'Chai, bồn khí, hệ thống nạp khí, đường ống khí, bình áp lực, nồi hơi, xe nâng.'],
      ['Quan trắc môi trường lao động', 'Hơi xăng, hơi dung môi, ồn máy bơm, máy nén, nhiệt tại kho, trạm nạp, nhà máy.'],
      ['Đánh giá rủi ro, biện pháp an toàn', 'Cửa hàng, kho, trạm nạp mới; đại tu, vệ sinh bồn; nhà thầu vào làm việc.'],
      ['Kiểm định, hiệu chuẩn thiết bị đo', 'Thiết bị đo áp suất, nhiệt độ, máy đo khí.'],
      ['Tư vấn ISO 45001; đào tạo nghề', 'Tập đoàn, thương nhân đầu mối, dự thầu; nghề bán hàng xăng dầu, vận hành kho, nạp khí.'],
    ],
  },

  // ------------------------------------------------------------ Mục 5 (8 câu)
  muc5: [
    ['Đã có chứng chỉ phòng cháy chữa cháy và môi trường, còn cần huấn luyện ATVSLĐ?',
      'Cần. Chứng chỉ phòng cháy chữa cháy và bảo vệ môi trường là điều kiện kinh doanh xăng dầu; huấn luyện ATVSLĐ là yêu cầu riêng theo Luật ATVSLĐ, nhân viên bơm, bán hàng thuộc Nhóm 3. Viện huấn luyện phần ATVSLĐ; nghiệp vụ phòng cháy chữa cháy nằm ngoài phạm vi, chuyên viên ghi nhận để phối hợp.'],
    ['Nhân viên bơm xăng chỉ đứng bơm, có phải Nhóm 3? Thu ngân thì sao?',
      'Danh mục ghi rõ vận hành máy bơm xăng dầu và bán lẻ xăng dầu là công việc nghiêm ngặt, nên nhân viên bơm, bán hàng thường thuộc Nhóm 3. Thu ngân, nhân viên tiện lợi thuộc Nhóm 4; người thỉnh thoảng ra bơm khi vắng người là ranh giới, chuyên viên xác nhận theo tần suất.'],
    ['Lái xe bồn đã có chứng nhận tập huấn hàng hóa nguy hiểm, còn cần huấn luyện này?',
      'Có. Hai chứng nhận có căn cứ khác nhau: tập huấn hàng hóa nguy hiểm theo Nghị định 34/2024/NĐ-CP; huấn luyện ATVSLĐ Nhóm 3 theo Nghị định 44/2016/NĐ-CP. Tương tự, huấn luyện kỹ thuật an toàn kinh doanh khí (Nghị định 87/2018/NĐ-CP) là yêu cầu riêng.'],
    ['Vệ sinh bồn, đại tu do thầu phụ làm: tôi có phải lo hồ sơ huấn luyện?',
      'Trách nhiệm chia giữa hai bên theo hợp đồng và Nghị định 39/2016/NĐ-CP; chuyên viên xác nhận theo từng hợp đồng. Cách làm tốt: yêu cầu thầu phụ xuất trình chứng nhận trước khi vào bồn và tra cứu mã chứng nhận trực tuyến.'],
    ['Hệ thống hơn 100 cửa hàng, nhân viên luân chuyển nhiều: quản lý thế nào?',
      'Người mới huấn luyện trước khi vào ca; người nghỉ từ 6 tháng trở lên phải huấn luyện lại. Phần mềm cho biết ai chưa huấn luyện, ai sắp hết hạn, lọc theo vị trí và nhóm, xuất báo cáo Excel. Lớp học chia nhỏ, ngoài giờ cao điểm hoặc ghép các cửa hàng gần nhau.'],
    ['Chai gas, bồn, xe nâng có phải kiểm định không?',
      'Chai chứa khí, bồn và hệ thống nạp khí, đường ống dẫn khí đốt cố định, bình áp lực, nồi hơi, xe nâng thuộc danh mục máy, thiết bị phải kiểm định. Điều kiện, chu kỳ cụ thể chuyên viên xác nhận theo thông số; hạn kiểm định theo dõi được trên phần mềm.'],
    ['Tập đoàn đã có chương trình HSE, sinh tồn trên biển: Viện hỗ trợ gì?',
      'Viện không thay thế hệ thống của tập đoàn mà hoàn thiện hồ sơ huấn luyện theo pháp luật Việt Nam cho Nhóm 1 đến Nhóm 6, quản lý tập trung chứng nhận, thiết bị nhiều đơn vị. An toàn dầu khí chuyên ngành, sinh tồn trên biển nằm ngoài phạm vi của Viện.'],
    ['Chi phí huấn luyện được tính thế nào?',
      'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; chi phí do người sử dụng lao động chi trả. Chuyên viên xếp đúng nhóm, không thừa; có thể chia đợt, ưu tiên Nhóm 1, 2 và người vào bồn, hàn sửa chữa, nạp khí, xuất nhập kho, lái xe bồn trước.'],
  ],

  // ------------------------------------------------------------ Mục 6
  muc6: {
    trichDan: chung.TRICH_DAN,
    quyTrinh: [
      ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự theo cửa hàng, kho, ca.'],
      ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
      ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch theo ca, theo cụm cửa hàng.'],
      ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
      ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
      ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
    ],
    nhanDuoc: [
      ...chung.nhanDuocChung('Thương nhân đầu mối, đối tác, đoàn kiểm tra'),
      ['Huấn luyện tại cửa hàng, kho',
        'Chia lớp nhỏ theo ca, ngoài giờ cao điểm, ghép các cửa hàng gần nhau; thực hành tại chỗ trên cột bơm, bồn, thiết bị của doanh nghiệp.'],
    ],
  },

  // ------------------------------------------------------------ Mục 7
  muc7: {
    vanBan: [
      LUAT,
      NGHI_DINH_44,
      ['Nghị định 39/2016/NĐ-CP (Điều 36, 38)', 'Bố trí người làm công tác ATVSLĐ (lọc hóa dầu, hóa chất: khoản 1 Điều 36); hội đồng ATVSLĐ cơ sở (Điều 38).'],
      DANH_MUC,
      ['Nghị định 83/2014/NĐ-CP (xăng dầu); Nghị định 87/2018/NĐ-CP (khí); Nghị định 34/2024/NĐ-CP (hàng hóa nguy hiểm)', 'Chứng chỉ phòng cháy, môi trường; huấn luyện kỹ thuật an toàn kinh doanh khí; tập huấn hàng hóa nguy hiểm: yêu cầu riêng, không thay thế huấn luyện ATVSLĐ.'],
      ['Luật Hóa chất số 69/2025/QH15, Nghị định 24, 25, 26/2026/NĐ-CP; Thông tư 02/2025/TT-BCT', 'Căn cứ hiện hành cho huấn luyện an toàn hóa chất và an toàn điện.'],
    ],
    tinhTrang: chung.tinhTrangPhapLy('18/10/2026',
      'đã được Chính phủ thông qua ngày 17/9/2026; giai đoạn 1 dự kiến được Quốc hội xem xét theo thủ tục rút gọn tại kỳ họp '
      + 'thứ 2 (tháng 10/2026), giai đoạn 2 dự kiến trình cuối năm 2027; dự án chưa có hiệu lực'),
  },
};
