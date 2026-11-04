/* Điểm đứng, điểm nóng và trang trí cho tham quan 360° xưởng ca cao Heragrain (xưởng cũ bố trí cho ca cao).
   Mặt bằng các khu lấy từ ../3-so-do-3d/du-lieu.js (window.HERAGRAIN); file này chỉ thêm phần riêng của bản tham quan.
   Tọa độ tính bằng mét, cùng hệ với du-lieu.js: x từ tây sang đông, z từ bắc xuống nam, y là độ cao. */
(function () {
"use strict";

/* Bản ca cao chỉ có khu nhà ở và xưởng cũ nên không dời tọa độ */
const DOI_CU = 0;
const KHU_CU = ['nha', 'sansau', 'cuaxuong', 'loidi', 'wc1', 'kho', 'rang', 'nibs', 'dc', 'tp', 'socola', 'dem', 'qc', 'xe', 'xk'];

/* Vật liệu từng phòng: loai (kiểu đồ đạc, màu trên bản đồ), tuong (tường trong), san (sàn), ngoai (tường ngoài),
   cuaSo ('thuong' cửa sổ thấp, 'cao' cửa sổ thông gió cao), tuongKin (mặt không trổ cửa sổ), sx (cửa dùng rèm nhựa) */
const PHONG = {
  nha: { loai: 'nha', tuong: 'son', san: 'gachLat', ngoai: 'sonVang', cuaSo: 'thuong' },
  sansau: { loai: 'ngoai', tuong: 'sonVang', san: 'epoxyXam' },
  loidi: { loai: 'hanhlang', tuong: 'sonXanhChan', san: 'epoxyXam' },
  kho: { loai: 'kho', tuong: 'son', san: 'epoxyBan', cuaSo: 'cao', sx: true },
  rang: { loai: 'sao', tuong: 'gachMen', san: 'epoxyBan', cuaSo: 'cao', sx: true },
  nibs: { loai: 'ban', tuong: 'gachMen', san: 'epoxyXam', cuaSo: 'cao', sx: true },
  dc: { loai: 'kho', tuong: 'son', san: 'betong' },
  socola: { loai: 'sach', tuong: 'gachMen', san: 'epoxySach', sx: true },
  dem: { loai: 'thay', tuong: 'gachMen', san: 'epoxyXam', sx: true },
  tp: { loai: 'kho', tuong: 'son', san: 'epoxyXam', cuaSo: 'cao' },
  qc: { loai: 'qc', tuong: 'gachMen', san: 'epoxyXam' },
  wc1: { ngoai: 'sonVang' }
};

/* Mái dốc: tuong = khung tường [x0, x1, z0, z1], cao = cao độ đỉnh tường, dua = mái đua, noc = cao độ nóc, truc = hướng nóc */
const MAI = [
  { tuong: [0, 10.2, -34.2, -19.6], cao: 3.57, dua: 0.4, noc: 4.85, truc: 'z', vl: 'tonXam' },     // 5 phòng xưởng cũ
  { tuong: [-3.5, 0, -34.2, -19.6], cao: 2.8, dua: 0.3, noc: 3.35, truc: 'z', vl: 'tonXam' },      // lối đi lợp mái
  { tuong: [-5, 4, -19.6, -15], cao: 2.8, dua: 0.3, noc: 3.4, truc: 'x', vl: 'tonXanh' }           // sân sau lợp mái
];

/* Biển hiệu ngoài nhà: tex = tên hình, p = tâm, w, h = kích thước (m), quay = hướng mặt biển nhìn ra */
const BIEN_NGOAI = [
  { tex: 'bangHTX', p: [1.6, 1.75, -7.38], w: 1.3, h: 0.55, quay: 'S' },
  { tex: 'logoKem', p: [-6.5, 2.3, -2.6], w: 3.6, h: 1.35, quay: 'S', khung: true }
];

/* Trang trí từng khu. Treo tường: ['bien', mặt, t, y, rộng, cao, chữ, chữ phụ, kiểu] hoặc ['tranh', mặt, t, y, rộng, cao, tên hình]
   (t = khoảng cách từ đầu bức tường: từ x0 với mặt N/S, từ z0 với mặt W/E). Đặt sàn: ['cay', dx, dz, cỡ]. */
const TRANG_TRI = {
  nha: [['tranh', 'S', 13.6, 1.7, 0.8, 1.1, 'sanPham']],
  sansau: [['bien', 'N', 0.75, 2.0, 1.3, 0.32, 'Lối vào xưởng →', '', 'xanh'], ['bien', 'W', 2.3, 2.1, 1.7, 0.42, 'NHẬN HẠT · XUẤT HÀNG', 'Sáng nhập · Chiều xuất', 'vang'], ['cay', 8.3, 4.0, 1.0]],
  loidi: [['tranh', 'W', 6.3, 1.55, 4.4, 1.1, 'quytrinh'], ['tranh', 'W', 11.6, 1.55, 5.5, 1.1, 'lotrinh'], ['tranh', 'N', 1.2, 1.5, 0.6, 0.85, 'ruaTay'], ['tranh', 'N', 2.4, 1.5, 0.6, 0.85, 'baoHo'], ['cay', 0.45, 13.9, 0.9]],
  kho: [['bien', 'S', 5.2, 1.95, 2.6, 0.5, 'KHO HẠT CA CAO', 'Kiểm nhận · Làm sạch', 'xanh'], ['tranh', 'E', 2.6, 1.55, 0.8, 1.1, 'cutTest']],
  rang: [['bien', 'N', 2.0, 2.65, 2.6, 0.5, 'PHÒNG RANG · TÁCH VỎ', 'CCP: nhiệt độ, thời gian từng mẻ', 'vang'], ['tranh', 'E', 2.3, 2.3, 0.6, 0.6, 'ccp']],
  nibs: [['bien', 'N', 3.4, 2.45, 2.6, 0.5, 'PHÒNG NIBS · NGHIỀN · ÉP', 'Đóng túi kín ngay sau phân cỡ', 'xanh']],
  socola: [['bien', 'W', 1.2, 2.5, 2.0, 0.45, 'KHU SẠCH SOCOLA', '18–20 °C · Rửa tay trước khi vào', 'la'], ['tranh', 'W', 4.3, 1.5, 0.6, 0.85, 'ruaTay'], ['tranh', 'N', 4.4, 2.6, 0.6, 0.6, 'ccp']],
  tp: [['bien', 'N', 3.3, 2.75, 2.4, 0.45, 'KHO THÀNH PHẨM MÁT', '15–18 °C · FIFO/FEFO', 'xanh']],
  qc: [['bien', 'N', 1.1, 2.1, 1.6, 0.36, 'PHÒNG QC', 'Lưu mẫu từng lô', 'la']]
};

/* Đường, sân bê tông */
const DUONG = [[-46, 28, -7.5, -2], [-17.5, -13.5, -9, -7.5]];
const NEN = [[-6.5, 12.5, -35.5, -7.5], [6, 21, -2, 4.4], [-23, -9, -20, -9]];

/* Hai khung bản đồ nhỏ */
const KHU = {
  cu: { ten: 'Xưởng ca cao và nhà ở', box: [-7, 13, -36.5, -5] },
  ngoai: { ten: 'Toàn khu', box: [-25, 22, -38, 6] }
};

/* Điểm đứng. p = vị trí mắt nhìn, nhin = điểm nhìn ban đầu, nhom = nhóm trong dải ảnh, gd = giai đoạn đưa vào hoạt động,
   zones = các khu trong du-lieu.js liên quan.
   di: mũi tên đi tới điểm khác {toi, p = vị trí mũi tên, nhan, qua = các điểm [x, z] đi qua trước mũi tên, sau = sau mũi tên, thang = đi thẳng}.
   tt: điểm thông tin {p, zone (lấy nội dung từ du-lieu.js) hoặc ten, noidung}. */
const SCENES = [
  { id: 'tren-cao', ten: 'Toàn cảnh khu xưởng ca cao', nhom: 'tong', khu: 'ngoai', gd: 1, p: [-21, 21, 6], nhin: [2, 0, -22], fov: 72, zones: [],
    mota: 'Nhà ở mặt tiền ra đường; phía sau là sân sau có mái, nhà vệ sinh và xưởng cũ 5 phòng chuyển sang ca cao. Bên trái là điểm lên men, phơi của HTX đối tác (vẽ gần lại để dễ xem).',
    di: [{ toi: 'nha-o', p: [-1.5, 1.4, -4.6], nhan: 'Xuống trước nhà', thang: true },
      { toi: 'lenmen', p: [-12, 1.4, -8.6], nhan: 'Điểm lên men của HTX', thang: true },
      { toi: 'tren-cao-xuong', p: [4, 6, -27], nhan: 'Nhìn gần xưởng', thang: true }],
    tt: [{ p: [5, 5.6, -27], ten: 'Xưởng ca cao 5 phòng', noidung: 'Phòng 1 kho hạt, phòng 2 rang và tách vỏ, phòng 3 nibs, nghiền, ép, nửa tây phòng 5 khu sạch socola, nửa đông phòng 5 kho mát. Vào xưởng qua nhà ở và sân sau.' },
      { p: [-16, 3.4, -14], zone: 'lenmen' }, { p: [10.5, 3.8, 2.7], zone: 'xe' }] },

  { id: 'lenmen', ten: 'Điểm lên men, phơi của HTX', nhom: 'ngoai', khu: 'ngoai', gd: 1, p: [-12.2, 1.65, -8.4], nhin: [-17, 0.9, -15], fov: 78, zones: ['lenmen'],
    mota: 'Thùng gỗ ủ nhiều ngăn và giàn phơi cách đất của HTX trồng ca cao. Heragrain mua hạt đã khô, đưa quy trình lên men, phơi mẫu và kiểm từng lô bằng độ ẩm, cut test.',
    di: [{ toi: 'nha-o', p: [-6, 1.2, -4.8], nhan: 'Về xưởng ca cao' },
      { toi: 'tren-cao', p: [-12, 8, -6], nhan: 'Bay lên toàn cảnh', thang: true }],
    tt: [{ p: [-19.8, 1.6, -16.6], ten: 'Thùng ủ hạt', noidung: 'Hạt tươi ủ trong thùng gỗ, đảo sang ngăn dưới theo ngày để lên men đều. Hạt lên men đủ cho màu nâu, mùi thơm; hạt không lên men cho màu tím, vị chát (thấy rõ khi cut test).' },
      { p: [-13.5, 1.3, -13.5], ten: 'Giàn phơi cách đất', noidung: 'Phơi đến độ ẩm khoảng 7 % hoặc thấp hơn; có mái che mưa; không phơi trên đường, sân đất. Hạt khô cho vào bao đay sạch, buộc kín, ghi tên vườn và ngày phơi.' },
      { p: [-16, 2.6, -11], zone: 'lenmen' }] },

  { id: 'nha-o', ten: 'Trước nhà ở', nhom: 'ngoai', khu: 'cu', gd: 1, p: [-1.5, 1.65, -4.4], nhin: [-1.5, 2.2, -12], zones: ['nha', 'xe'],
    mota: 'Lối duy nhất vào xưởng đi xuyên qua nhà ở, nên bao hạt khô buộc kín vào buổi sáng, thùng thành phẩm dán kín ra buổi chiều. Bên kia đường là bãi xe giao nhận (giả định).',
    di: [{ toi: 'san-sau', p: [-1.5, 1.2, -7.5], nhan: 'Qua nhà ra sân sau', sau: [[-1.5, -15]] },
      { toi: 'lenmen', p: [-6.5, 1.2, -4.8], nhan: 'Điểm lên men của HTX' },
      { toi: 'tren-cao', p: [-1.5, 9, -3], nhan: 'Bay lên toàn cảnh', thang: true }],
    tt: [{ p: [-1.5, 3.3, -7.4], zone: 'nha' }, { p: [10.5, 2.2, 2.7], zone: 'xe' }, { p: [8.5, 1.6, -7.6], zone: 'trungbay' }] },

  { id: 'san-sau', ten: 'Sân sau có mái: nhận hạt, xuất hàng', nhom: 'ngoai', khu: 'cu', gd: 1, p: [-0.4, 1.6, -16.0], nhin: [-1.75, 1.6, -20], fov: 80, zones: ['sansau', 'cuaxuong', 'wc1'],
    mota: 'Sân sau lợp mái: cân từng bao hạt, lấy mẫu, ghi mã lô; buổi chiều tập kết thùng thành phẩm chờ xe. Bên phải là phòng 6 ngăn làm nhà vệ sinh và phòng thay bảo hộ.',
    di: [{ toi: 'loi-di', p: [-1.75, 1.2, -19.6], nhan: 'Vào cửa xưởng' },
      { toi: 'nha-o', p: [-1.5, 1.2, -15], nhan: 'Qua nhà ra đường', sau: [[-1.5, -7.5]] }],
    tt: [{ p: [-1.75, 3.2, -19.7], zone: 'cuaxuong' }, { p: [4.1, 1.7, -17.3], zone: 'wc1' }, { p: [-4.1, 1.2, -17.4], zone: 'sansau', ten: 'Cân sàn, lấy mẫu' }] },

  { id: 'loi-di', ten: 'Lối đi chung', nhom: 'xuong', khu: 'cu', gd: 1, p: [-1.75, 1.6, -21.0], nhin: [-1.6, 1.5, -33], zones: ['loidi', 'dem'],
    mota: 'Lối đi có mái dọc phía tây xưởng. Tường trái có sơ đồ quy trình 11 bước và lộ trình 4 giai đoạn. Cửa bên phải lần lượt vào kho hạt (phòng 1), phòng nibs (phòng 3); cuối lối đi là trạm rửa tay vào khu sạch.',
    di: [{ toi: 'kho-hat', p: [0, 1.2, -21.9], nhan: 'Kho hạt (phòng 1)' },
      { toi: 'phong-nibs', p: [0, 1.2, -27], nhan: 'Phòng nibs, nghiền, ép (phòng 3)', qua: [[-1.4, -27]] },
      { toi: 'tram-rua-tay', p: [-1.75, 1.2, -30.6], nhan: 'Trạm rửa tay vào khu sạch', qua: [[-1.75, -29.6]] },
      { toi: 'san-sau', p: [-1.75, 1.2, -19.6], nhan: 'Ra sân sau' }],
    tt: [{ p: [-3.35, 1.9, -27.9], ten: 'Sơ đồ quy trình 11 bước', noidung: 'Nhận hạt → kiểm nhận → làm sạch → rang (CCP) → tách vỏ → nibs → nghiền mịn → ép bơ, nghiền bột → tôi, đổ khuôn → gói, dò kim loại → kho mát. Sản phẩm không quay lại phòng trước.' },
      { p: [-3.35, 1.9, -22.6], ten: 'Lộ trình 4 giai đoạn', noidung: 'Hàng thô (nibs) → Socola → Bột, bơ ca cao và HACCP → Mix vị, xuất khẩu. Mỗi giai đoạn ghi thời gian, chứng nhận và nhân sự, giống thẻ giai đoạn trên sơ đồ 3D.' },
      { p: [-1.75, 2.4, -25], zone: 'loidi' }] },

  { id: 'kho-hat', ten: 'Kho hạt, kiểm nhận, làm sạch (phòng 1)', nhom: 'xuong', khu: 'cu', gd: 1, p: [2.4, 1.6, -21.6], nhin: [5.5, 1.0, -23.4], fov: 80, zones: ['kho'],
    mota: 'Bao đay hạt khô trên pallet theo mã lô. Bàn kiểm nhận đo độ ẩm, cut test 300 hạt; sàng rung loại tạp chất; bàn nhặt tay; hạt sạch cân lại rồi sang phòng rang qua cửa phía bắc.',
    di: [{ toi: 'phong-rang', p: [7.2, 1.2, -24.2], nhan: 'Phòng rang (phòng 2)', qua: [[7.2, -23.0]] },
      { toi: 'loi-di', p: [0, 1.2, -21.9], nhan: 'Ra lối đi', sau: [[-1.6, -21.6]] }],
    tt: [{ p: [3, 1.6, -23.4], zone: 'kho' },
      { p: [4.2, 1.2, -20.25], ten: 'Bàn kiểm nhận', noidung: 'Lấy mẫu mỗi lô: độ ẩm (nhận khi ≤ 7,5 %), cut test 300 hạt đếm hạt mốc, hạt đá (chưa lên men), hạt sâu, hạt nảy mầm; đếm số hạt trên 100 g. Ghi phiếu, gắn mã lô.' },
      { p: [6.3, 1.6, -20.5], ten: 'Sàng làm sạch', noidung: 'Sàng rung, quạt hút bụi loại đá, sỏi, cành, vỏ quả, hạt dính chùm trước khi rang.' }] },

  { id: 'phong-rang', ten: 'Phòng rang, nghiền vỡ, tách vỏ (phòng 2)', nhom: 'xuong', khu: 'cu', gd: 1, p: [7.0, 1.6, -25.4], nhin: [9.2, 1.2, -28.2], fov: 80, zones: ['rang', 'travo'],
    mota: 'Máy rang trống, sàng làm nguội và ống khói qua mái. Hạt rang nguội vào máy nghiền vỡ, quạt tách vỏ lụa; nibs đi sang phòng 3 qua cửa phía tây, vỏ thu vào bao.',
    di: [{ toi: 'phong-nibs', p: [5.5, 1.2, -27.6], nhan: 'Sang phòng nibs', qua: [[6.3, -27.4]], sau: [[4.0, -27.4]] },
      { toi: 'kho-hat', p: [7.2, 1.2, -24.2], nhan: 'Về kho hạt', sau: [[7.2, -23.0]] }],
    tt: [{ p: [9.0, 1.7, -28.3], zone: 'rang' }, { p: [9.6, 1.6, -25.1], ten: 'Máy nghiền vỡ, tách vỏ', noidung: 'Hạt rang được bẻ vỡ, quạt gió thổi vỏ lụa nhẹ sang cyclone; nibs rơi xuống sàng. Vỏ: bán làm phân bón, than sinh học; từ GĐ4 sấy làm trà vỏ ca cao.' },
      { p: [6.45, 1.6, -28.55], zone: 'travo' }] },

  { id: 'phong-nibs', ten: 'Phòng nibs, nghiền, ép (phòng 3)', nhom: 'xuong', khu: 'cu', gd: 1, p: [3.7, 1.6, -27.2], nhin: [2.6, 1.0, -25.0], fov: 82, zones: ['nibs', 'melanger', 'ep', 'bot', 'dc'],
    mota: 'GĐ1 phân cỡ, đóng gói nibs bán thô. GĐ2 thêm 3 máy nghiền đá dọc tường bắc làm khối ca cao và socola. GĐ3 thêm máy ép thủy lực tách bơ ca cao và máy nghiền bột, rây.',
    di: [{ toi: 'khu-sach', p: [1.0, 1.2, -29], nhan: 'Khối socola sang khu sạch', qua: [[1.0, -28.2]], sau: [[1.0, -30.4], [1.6, -31.4]] },
      { toi: 'phong-rang', p: [5.5, 1.2, -27.6], nhan: 'Phòng rang', sau: [[6.3, -27.4], [7.0, -25.4]] },
      { toi: 'loi-di', p: [0, 1.2, -27], nhan: 'Ra lối đi', sau: [[-1.4, -27], [-1.75, -21.6]] }],
    tt: [{ p: [2.5, 1.6, -25.9], zone: 'nibs' }, { p: [3.4, 1.3, -28.5], zone: 'melanger' }, { p: [4.0, 2.1, -25.95], zone: 'ep' }, { p: [2.5, 1.7, -24.9], zone: 'bot' }] },

  { id: 'tram-rua-tay', ten: 'Trạm rửa tay vào khu sạch', nhom: 'xuong', khu: 'cu', gd: 2, p: [-1.2, 1.6, -30.9], nhin: [-2.3, 1.2, -34.2], zones: ['dem'],
    mota: 'Vách ngăn cuối lối đi tạo phòng đệm: rửa tay, đội mũ trùm tóc, đổi tạp dề trước khi vào khu sạch socola ở bên phải.',
    di: [{ toi: 'khu-sach', p: [0, 1.2, -31.6], nhan: 'Vào khu sạch socola', sau: [[1.6, -31.6]] },
      { toi: 'loi-di', p: [-1.75, 1.2, -30.6], nhan: 'Ra lối đi', sau: [[-1.75, -29.4], [-1.75, -21.2]] }],
    tt: [{ p: [-3.1, 1.3, -33.6], zone: 'dem' }] },

  { id: 'khu-sach', ten: 'Khu sạch socola (nửa tây phòng 5)', nhom: 'xuong', khu: 'cu', gd: 2, p: [1.7, 1.6, -31.5], nhin: [3.2, 1.0, -33.7], fov: 82, zones: ['socola', 'dkl', 'panning'],
    mota: 'Điều hòa 18–20 °C. Máy tôi socola, bàn đổ khuôn và rung khuôn, tủ mát làm cứng; bàn gói phía nam; máy dò kim loại (GĐ3) và nồi bao bọc socola (GĐ4).',
    di: [{ toi: 'kho-tp', p: [5.1, 1.2, -31.6], nhan: 'Kho thành phẩm mát', sau: [[6.4, -31.5]] },
      { toi: 'tram-rua-tay', p: [0, 1.2, -31.6], nhan: 'Trạm rửa tay', sau: [[-1.4, -31.0]] },
      { toi: 'phong-nibs', p: [1.0, 1.2, -29], nhan: 'Phòng nibs, nghiền', qua: [[1.0, -30.4]], sau: [[1.0, -28.2], [3.7, -27.2]] }],
    tt: [{ p: [2.6, 1.5, -33.7], zone: 'socola' }, { p: [4.45, 1.5, -33.7], ten: 'Máy tôi socola', noidung: 'Nâng, hạ nhiệt theo đường cong tôi để bơ ca cao kết tinh đúng dạng: thanh socola bóng, giòn, không nở hoa trắng.' },
      { p: [4.5, 1.4, -30.6], zone: 'dkl' }, { p: [2.3, 1.6, -30.55], zone: 'panning' }, { p: [0.7, 2.2, -33.7], ten: 'Tủ mát làm cứng', noidung: 'Khuôn socola vào tủ 10–15 °C cho cứng rồi tách khuôn, gói ngay trong phòng.' }] },

  { id: 'kho-tp', ten: 'Kho thành phẩm mát (nửa đông phòng 5)', nhom: 'xuong', khu: 'cu', gd: 1, p: [6.5, 1.6, -31.4], nhin: [9.4, 1.3, -31.4], fov: 80, zones: ['tp', 'qc'],
    mota: 'Kho giữ 15–18 °C: thùng socola, túi nibs, bột ca cao trên kệ và pallet, xuất theo FIFO/FEFO. Góc tây bắc ngăn làm phòng QC, tủ lưu mẫu từ GĐ3.',
    di: [{ toi: 'khu-sach', p: [5.1, 1.2, -31.6], nhan: 'Về khu sạch', sau: [[3.6, -31.6]] }],
    tt: [{ p: [9.6, 1.8, -31.4], zone: 'tp' }, { p: [6.2, 1.5, -33.6], zone: 'qc' }] },

  { id: 'tren-cao-xuong', ten: 'Nhìn gần xưởng ca cao từ trên cao', nhom: 'tong', khu: 'cu', gd: 1, p: [-8.5, 12.5, -13.5], nhin: [4, 0, -27], fov: 70, zones: [],
    mota: 'Dòng hàng một chiều qua 5 phòng: kho hạt → phòng rang, tách vỏ → phòng nibs, nghiền, ép → khu sạch socola → kho mát; thành phẩm ra theo lối đi, qua sân sau, nhà ở.',
    di: [{ toi: 'loi-di', p: [-1.75, 1.4, -21], nhan: 'Xuống lối đi', thang: true },
      { toi: 'tren-cao', p: [-6, 6, -10], nhan: 'Toàn cảnh khu', thang: true }],
    tt: [{ p: [8, 5.2, -22], zone: 'kho' }, { p: [8, 5.2, -26.6], zone: 'rang' }, { p: [2.7, 5.2, -26.6], zone: 'nibs' }, { p: [2.5, 5.2, -31.6], zone: 'socola' }, { p: [8, 5.2, -31.6], zone: 'tp' }] }
];

/* Thứ tự tham quan tự động */
const TOUR = ['tren-cao', 'lenmen', 'nha-o', 'san-sau', 'loi-di', 'kho-hat', 'phong-rang', 'phong-nibs', 'tram-rua-tay', 'khu-sach', 'kho-tp', 'tren-cao-xuong'];

const NHOM = [{ id: 'tong', ten: 'Toàn cảnh' }, { id: 'ngoai', ten: 'Bên ngoài' }, { id: 'xuong', ten: 'Trong xưởng' }];

window.HERAGRAIN_360 = { DOI_CU, KHU_CU, PHONG, MAI, BIEN_NGOAI, TRANG_TRI, DUONG, NEN, KHU, SCENES, TOUR, NHOM };
})();
