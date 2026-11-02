/* Điểm đứng, điểm nóng và trang trí cho tham quan 360° nhà máy Heragrain.
   Mặt bằng các khu lấy từ heragrain-3d/du-lieu.js (window.HERAGRAIN); file này chỉ thêm phần riêng của bản tham quan.
   Tọa độ tính bằng mét: x từ tây sang đông, z từ bắc xuống nam, y là độ cao. */
(function () {
"use strict";

/* Khu cũ: du-lieu.js đã dời tọa độ riêng của ảnh vẽ tay đi (-2, -32). Bản tham quan dời thêm DOI_CU theo trục z
   để khu nhà ở, xưởng cũ cách lô xưởng mới đúng khoảng 200 m như thực tế. */
const DOI_CU = -170;
const CZ = (z) => z - 32 + DOI_CU;
const C = (x, z) => [x - 2, CZ(z)];          // điểm [x, z] theo tọa độ riêng của khu cũ
const C3 = (x, y, z) => [x - 2, y, CZ(z)];   // điểm [x, y, z] theo tọa độ riêng của khu cũ
const CB = (x0, x1, z0, z1) => [x0 - 2, x1 - 2, CZ(z0), CZ(z1)];
const KHU_CU = ['nha', 'sansau', 'cuaxuong', 'loidi', 'wc1', 'kbb', 'dg', 'dc', 'ktp', 'kdd', 'qc', 'cn', 'eu'];

/* Vật liệu từng phòng: loai (kiểu đồ đạc), tuong (tường trong), san (sàn), ngoai (tường ngoài), cuaSo ('thuong' cửa sổ thấp, 'cao' cửa sổ thông gió cao),
   tuongKin (các mặt không trổ cửa sổ, ví dụ tường treo logo), sx (khu sản xuất: cửa dùng rèm nhựa) */
const PHONG = {
  vp: { loai: 'vanphong', tuong: 'sonXanhChan', san: 'go', cuaSo: 'thuong', tuongKin: ['W'] },
  nghi: { loai: 'nghi', tuong: 'son', san: 'gachLat', cuaSo: 'thuong' },
  thay: { loai: 'thay', tuong: 'gachMen', san: 'epoxyXam', cuaSo: 'cao' },
  hl: { loai: 'hanhlang', tuong: 'sonXanhChan', san: 'epoxyXam' },
  tn: { loai: 'ban', tuong: 'gachMen', san: 'epoxyBan', cuaSo: 'cao', sx: true },
  sc: { loai: 'ban', tuong: 'gachMen', san: 'epoxyBan', cuaSo: 'cao', sx: true },
  dem: { loai: 'sach', tuong: 'gachMen', san: 'epoxyXam', sx: true },
  sach: { loai: 'sach', tuong: 'gachMen', san: 'epoxySach', cuaSo: 'cao', sx: true },
  sao: { loai: 'sao', tuong: 'gach', san: 'betong', cuaSo: 'cao', sx: true },
  an: { loai: 'an', tuong: 'son', san: 'gachLat', cuaSo: 'thuong' },
  nha: { loai: 'nha', tuong: 'son', san: 'gachLat', ngoai: 'sonVang', cuaSo: 'thuong' },
  sansau: { loai: 'ngoai', tuong: 'sonVang', san: 'san' },
  loidi: { loai: 'ngoai', tuong: 'sonNgoai', san: 'san' },
  kbb: { loai: 'kho', tuong: 'son', san: 'betong', cuaSo: 'cao' },
  dg: { loai: 'dg', tuong: 'son', san: 'epoxyXam', cuaSo: 'cao' },
  dc: { loai: 'kho', tuong: 'son', san: 'betong' },
  ktp: { loai: 'kho', tuong: 'son', san: 'betong', cuaSo: 'cao' },
  kdd: { loai: 'kho', tuong: 'son', san: 'betong', cuaSo: 'cao' },
  qc: { loai: 'qc', tuong: 'gachMen', san: 'epoxyXam', cuaSo: 'cao' },
  wc: { ngoai: 'sonNgoai' },
  wc1: { ngoai: 'sonVang' }
};

/* Mái dốc: tuong = khung tường [x0, x1, z0, z1], cao = cao độ đỉnh tường, dua = mái đua ra ngoài tường, noc = cao độ nóc, truc = hướng nóc */
const MAI = [
  { tuong: [-4, 13, 0, 10], cao: 3.78, dua: 0.45, noc: 5.3, truc: 'x', vl: 'tonXanh' },             // xưởng mới 17 × 10 m
  { tuong: CB(0, 10.2, -34.2, -19.6), cao: 3.57, dua: 0.4, noc: 4.85, truc: 'z', vl: 'tonXam' }     // xưởng cũ 5 phòng
];

/* Biển hiệu ngoài nhà: tex = tên hình, p = tâm, w, h = kích thước (m), quay = hướng mặt biển nhìn ra */
const BIEN_NGOAI = [
  { tex: 'matTien', p: [4.5, 4.5, -0.55], w: 17.4, h: 1.4, quay: 'N', khung: true },
  { tex: 'logoKem', p: [13.14, 2.2, 5], w: 5.4, h: 2.0, quay: 'E' },
  { tex: 'bangHTX', p: C3(1.6, 1.75, -7.38), w: 1.3, h: 0.55, quay: 'S' }
];

/* Trang trí từng khu. Treo tường: ['bien', mặt, t, y, rộng, cao, chữ, chữ phụ, kiểu] hoặc ['tranh', mặt, t, y, rộng, cao, tên hình]
   (t = khoảng cách từ đầu bức tường: từ x0 với mặt N/S, từ z0 với mặt W/E). Đặt sàn: ['cay', dx, dz, cỡ], ['ketui', dx, dz, rộng, sâu, cao]
   (dx, dz tính từ góc x0, z0 của khu). */
const TRANG_TRI = {
  vp: [['tranh', 'W', 1.8, 1.85, 2.1, 1.3, 'tuongLogo'], ['ketui', 0.4, 2.62, 2.2, 0.32, 1.9], ['cay', 3.55, 0.4, 0.9], ['tranh', 'E', 2.55, 1.55, 0.6, 0.85, 'sanPham']],
  hl: [['tranh', 'E', 4.3, 1.75, 7.6, 1.5, 'lotrinh'],
    ['bien', 'W', 1.5, 2.5, 1.2, 0.26, 'Kế toán · Họp', '', 'xanh'], ['bien', 'W', 5.5, 2.5, 1.2, 0.26, 'Phòng nghỉ', '', 'xanh'],
    ['bien', 'W', 9, 2.5, 1.2, 0.26, 'Thay bảo hộ', '', 'xanh'], ['bien', 'E', 9, 2.55, 1.4, 0.3, 'Vào khu chế biến', 'Thay bảo hộ, rửa tay trước', 'vang'],
    ['tranh', 'W', 3.5, 1.5, 0.8, 1.1, 'khauhieu'], ['tranh', 'W', 7.25, 1.5, 0.8, 1.1, 'baoHo'], ['cay', 1.65, 0.35, 0.9]],
  nghi: [['tranh', 'E', 1.1, 1.7, 1.3, 0.6, 'tranhPhongCanh'], ['cay', 3.6, 0.35, 1]],
  thay: [['tranh', 'W', 1, 1.5, 0.7, 1.0, 'baoHo']],
  tn: [['bien', 'W', 2, 2.85, 3.0, 0.6, 'KHU BẨN', 'Tiếp nhận · Sơ chế', 'vang'], ['tranh', 'E', 2, 1.75, 3.4, 0.85, 'quytrinh']],
  sc: [['tranh', 'S', 0.9, 1.5, 0.7, 1.0, 'ruaTay'], ['bien', 'E', 4.75, 2.5, 1.3, 0.3, 'Phòng đệm → Khu sạch', '', 'la']],
  dem: [['tranh', 'E', 1.25, 1.45, 0.6, 0.85, 'ruaTay']],
  sach: [['bien', 'E', 5, 2.15, 3.6, 0.6, 'KHU SẠCH', 'Làm nguội · Chọn lọc · Đóng gói', 'la'], ['tranh', 'N', 1.1, 1.6, 0.9, 1.25, 'sanPham'], ['tranh', 'W', 3.0, 2.6, 0.6, 0.6, 'ccp']],
  sao: [['bien', 'E', 2, 1.95, 3.0, 0.5, 'KHU SAO TRÀ BẾP CỦI', 'Nạp củi từ ngoài tường', 'xanh'], ['tranh', 'W', 0.65, 1.6, 0.6, 0.6, 'ccp']],
  an: [['tranh', 'N', 1.6, 1.6, 0.9, 1.2, 'khauhieu'], ['cay', 3.6, 0.4, 0.8]],
  phoi: [['bien', 'N', 9.6, 2.0, 3.0, 0.5, 'NHÀ PHƠI KÍN', 'Lưới chắn côn trùng · Giàn cách đất', 'xanh']],
  loidi: [['tranh', 'W', 7, 1.35, 11.5, 1.5, 'tuongTayNguyen'], ['cay', 0.45, 1.6, 0.9], ['cay', 0.45, 13.6, 0.9]],
  sansau: [['bien', 'N', 0.75, 2.0, 1.3, 0.32, 'Lối vào xưởng →', '', 'xanh'], ['cay', 0.5, 4.0, 1.1], ['cay', 8.3, 4.0, 1.0]],
  dg: [['bien', 'N', 1.6, 2.55, 2.6, 0.5, 'KHU GIA CÔNG ĐÓNG GÓI', 'Chỉ mở túi ở GĐ1', 'xanh'], ['tranh', 'S', 4.0, 1.7, 0.8, 1.1, 'sanPham'], ['tranh', 'W', 3.6, 1.5, 0.7, 1.0, 'ruaTay']],
  ktp: [['bien', 'W', 1.8, 2.6, 2.4, 0.5, 'KHO THÀNH PHẨM', 'Xuất theo FIFO/FEFO', 'xanh']],
  kbb: [['bien', 'S', 5, 1.95, 2.6, 0.5, 'KHO BAO BÌ', 'Bao bì để trên kệ, cách sàn', 'xanh']],
  kdd: [['bien', 'N', 2.5, 1.95, 2.2, 0.45, 'KHO ĐỂ ĐỒ', '', 'xanh']],
  qc: [['bien', 'N', 2.5, 1.95, 2.4, 0.5, 'PHÒNG QC', 'Lưu mẫu · Giữ lô chờ kết quả', 'la']]
};

/* Đường, sân bê tông (cho bản tham quan, khu cũ đã dời thêm DOI_CU) */
const DUONG = [[-34, 24, CZ(-7.5), CZ(-2)], [-16, -10.5, CZ(-2), -7.5], [-34, 24, -7.5, -2], [-14, 24, 25.5, 29.5]];
const NEN = [CB(-6.5, 12.5, -35.5, -7.5), CB(6, 21, -2, 4.4), [-4, 13, -2, 25.5]];

/* Hai khu cho bản đồ nhỏ */
const KHU = {
  moi: { ten: 'Lô xưởng mới', box: [-8, 17, -9, 31] },
  cu: { ten: 'Khu nhà ở và xưởng cũ', box: CB(-9, 14, -38, -1) }
};

/* Điểm đứng. p = vị trí mắt nhìn, nhin = điểm nhìn ban đầu, nhom = nhóm trong dải ảnh, gd = giai đoạn đưa vào hoạt động,
   zones = các khu trong du-lieu.js liên quan.
   di: mũi tên đi tới điểm khác {toi, p = vị trí mũi tên, nhan, qua = các điểm [x, z] đi qua trước mũi tên, sau = sau mũi tên, thang = đi thẳng}.
   tt: điểm thông tin {p, zone (lấy nội dung từ du-lieu.js) hoặc ten, noidung}. */
const SCENES = [
  { id: 'tren-cao', ten: 'Toàn cảnh lô xưởng mới', nhom: 'tong', khu: 'moi', gd: 2, p: [-9.5, 19, -13], nhin: [4.5, 0, 9.5], fov: 74, zones: [],
    mota: 'Lô xưởng mới ngang 17 m, chạy dài từ đường trước đến đường sau. Xưởng 17 × 10 m ở mặt đường; phía sau là dãy bếp, nhà vệ sinh, khu sao trà, nhà phơi và khu nước thải sát đường sau.',
    di: [{ toi: 'cong-truoc', p: [4.75, 1.4, -4.6], nhan: 'Xuống cổng trước', thang: true },
      { toi: 'san-sau', p: [4.5, 1.2, 23.5], nhan: 'Khu nước thải, cổng sau', thang: true },
      { toi: 'tren-cao-cu', p: [-13.2, 1.5, -40], nhan: 'Sang khu xưởng cũ (cách 200 m)' }],
    tt: [{ p: [4.5, 6.2, 5], ten: 'Xưởng 17 × 10 m', noidung: 'Dãy phòng 4 m bên trái (văn phòng, phòng nghỉ, thay bảo hộ), hành lang 2 m, khu chế biến 11 × 10 m chia khu bẩn và khu sạch. Mái tôn xanh, biển hiệu mặt tiền theo bộ nhận diện Heragrain.' },
      { p: [5.2, 4.2, 19], zone: 'phoi' }, { p: [10.5, 5.2, 12], zone: 'sao' }, { p: [-2, 4.6, 13], zone: 'an' }, { p: [6.75, 1.6, 23.5], zone: 'xlnt' }] },

  { id: 'cong-truoc', ten: 'Mặt tiền và cổng trước', nhom: 'moi', khu: 'moi', gd: 2, p: [4.75, 1.65, -5.4], nhin: [4.75, 2.6, 3], zones: ['tn', 'sach', 'hl', 'rao'],
    mota: 'Ba cửa ra đường trước: cửa hành lang cho người, cửa nhập nguyên liệu vào khu bẩn, cửa xuất thành phẩm từ khu sạch. Nguyên liệu bẩn và thành phẩm không dùng chung lối.',
    di: [{ toi: 'hanh-lang', p: [1, 1.2, -0.3], nhan: 'Hành lang (lối người)' },
      { toi: 'so-che', p: [4.75, 1.2, -0.3], nhan: 'Cửa nhập nguyên liệu' },
      { toi: 'tren-cao', p: [4.75, 8.5, -3.6], nhan: 'Bay lên toàn cảnh', thang: true },
      { toi: 'nha-o', p: [-13.2, 1.2, -4.8], nhan: 'Về khu xưởng cũ (200 m)' }],
    tt: [{ p: [4.5, 4.5, -0.6], ten: 'Biển hiệu mặt tiền', noidung: 'Biển dựng che mái tôn: logo Heragrain Foods, khẩu hiệu "Thấy tận mắt, ăn yên tâm.", màu xanh lá đậm và vàng nghệ của bộ nhận diện.' },
      { p: [11, 1.7, -0.3], zone: 'sach', ten: 'Cửa xuất thành phẩm', noidung: 'Túi đã hàn kín ra cửa này, xếp thùng có nắp, chở bằng xe có mui về kho thành phẩm ở xưởng cũ, cách khoảng 200 m.' },
      { p: [-3.6, 1.6, -2], zone: 'rao' }] },

  { id: 'hanh-lang', ten: 'Hành lang và tranh lộ trình', nhom: 'moi', khu: 'moi', gd: 2, p: [1, 1.6, 1.3], nhin: [1.6, 1.5, 7], zones: ['hl', 'nghi', 'thay'],
    mota: 'Hành lang 2 m chỉ cho người, có vách ngăn với khu chế biến. Tường đông là tranh lộ trình 4 giai đoạn đầu tư; bên trái là cửa phòng kế toán, phòng nghỉ, phòng thay bảo hộ.',
    di: [{ toi: 'van-phong', p: [0, 1.2, 1.5], nhan: 'Phòng kế toán và họp', qua: [[0.7, 1.5]] },
      { toi: 'so-che', p: [2, 1.2, 9], nhan: 'Vào khu chế biến', qua: [[1, 8.7]], sau: [[4.6, 8.5]] },
      { toi: 'san-giua', p: [1, 1.2, 10], nhan: 'Ra sân giữa, nhà ăn, nhà phơi', qua: [[1, 9.3]] },
      { toi: 'cong-truoc', p: [1, 1.2, 0], nhan: 'Ra cổng trước' }],
    tt: [{ p: [1.9, 2.3, 4.3], ten: 'Tranh lộ trình 4 giai đoạn', noidung: 'Thu mua → Chế biến → Sản xuất đạt chuẩn → Xuất khẩu. Mỗi giai đoạn ghi thời gian, nhân sự và chứng nhận cần đạt, giống thẻ giai đoạn trên sơ đồ 3D.' },
      { p: [0.1, 1.6, 5.5], zone: 'nghi' }, { p: [0.1, 1.6, 9], zone: 'thay' }, { p: [1, 2.9, 6.5], zone: 'hl' }] },

  { id: 'van-phong', ten: 'Phòng kế toán và họp', nhom: 'moi', khu: 'moi', gd: 2, p: [-0.9, 1.6, 2.3], nhin: [-4, 1.6, 1.3], zones: ['vp'],
    mota: 'Kế toán, hồ sơ HACCP và truy xuất, tiếp khách. Tường nhận diện xanh lá đậm với logo Heragrain, kệ trưng bày túi sản phẩm và hộp quà.',
    di: [{ toi: 'hanh-lang', p: [0, 1.2, 1.5], nhan: 'Ra hành lang', sau: [[0.8, 1.4]] }],
    tt: [{ p: [-3.85, 2.0, 1.5], ten: 'Tường nhận diện', noidung: 'Logo Heragrain Foods trên nền xanh lá đậm, nét vẽ núi Tây Nguyên màu vàng nghệ, đúng bộ nhận diện của HTX.' },
      { p: [-2.5, 1.3, 2.75], ten: 'Kệ trưng bày sản phẩm', noidung: 'Túi sầu riêng sấy, chanh dây gừng sấy, trà mãng cầu và hộp quà cao cấp với cửa sổ chữ H để thấy sản phẩm thật bên trong.' },
      { p: [-2.2, 1.0, 1.6], zone: 'vp' }] },

  { id: 'so-che', ten: 'Khu tiếp nhận và sơ chế (khu bẩn)', nhom: 'moi', khu: 'moi', gd: 2, p: [4.4, 1.6, 2.2], nhin: [5.6, 1.3, 8.6], zones: ['tn', 'sc', 'say'],
    mota: 'Nguyên liệu vào cửa nhập riêng, được cân, kiểm, gắn mã lô rồi rửa, phân loại, gọt, cắt. Trái cây nạp vào tủ sấy xuyên vách; trà đi cửa nam xuống nhà phơi.',
    di: [{ toi: 'cong-truoc', p: [4.75, 1.2, 0], nhan: 'Ra đường trước' },
      { toi: 'hanh-lang', p: [2, 1.2, 9], nhan: 'Ra hành lang', qua: [[4.6, 8.5]], sau: [[1, 8.7]] },
      { toi: 'khu-sach', p: [7.5, 1.2, 8.75], nhan: 'Qua phòng đệm vào khu sạch', qua: [[4.8, 8.6], [6.8, 8.75]], sau: [[8.5, 8.75], [8.5, 7.1]] },
      { toi: 'san-giua', p: [4.75, 1.2, 10], nhan: 'Ra sân giữa, nhà phơi', qua: [[4.6, 9.3]] }],
    tt: [{ p: [4.75, 1.4, 1.4], zone: 'tn' }, { p: [3.1, 1.4, 6.4], zone: 'sc' }, { p: [7.3, 1.6, 5.8], zone: 'say' },
      { p: [7.4, 2.4, 2], ten: 'Sơ đồ quy trình 11 bước', noidung: 'Hai nhánh: trái cây sấy (tiếp nhận → sơ chế → tủ sấy → khu sạch) và trà (tiếp nhận → sơ chế → nhà phơi → sao bếp củi → khu sạch). Sản phẩm không đi ngược từ khu sạch về khu bẩn.' },
      { p: [8.3, 1.5, 8.75], zone: 'dem' }] },

  { id: 'khu-sach', ten: 'Khu sạch: làm nguội, chọn lọc, đóng túi', nhom: 'moi', khu: 'moi', gd: 2, p: [10.2, 1.6, 7.7], nhin: [11, 1.2, 1.2], zones: ['sach', 'dkl', 'say', 'dem'],
    mota: 'Trà từ khu sao và trái cây từ tủ sấy vào đây: làm nguội, nhặt dị vật, dò kim loại (từ GĐ3), cân, hàn túi, in mã lô. Người vào chỉ qua phòng đệm rửa tay.',
    di: [{ toi: 'sao-tra', p: [11, 1.2, 10], nhan: 'Khu sao trà', qua: [[10.8, 9.2]], sau: [[10.9, 10.4]] },
      { toi: 'so-che', p: [8.5, 1.2, 7.5], nhan: 'Về khu sơ chế (qua phòng đệm)', qua: [[8.6, 7.1]], sau: [[8.5, 8.75], [7.2, 8.75], [4.8, 8.6]] },
      { toi: 'cong-truoc', p: [11, 1.2, 0], nhan: 'Cửa xuất thành phẩm', qua: [[11.75, 6.8], [11.75, 2.6]] }],
    tt: [{ p: [11, 1.6, 4.5], zone: 'dkl' }, { p: [8.6, 1.6, 5.8], zone: 'say', ten: 'Cửa lấy khay của tủ sấy' },
      { p: [9.4, 1.5, 1.6], ten: 'Máy hàn miệng túi, in mã lô', noidung: 'Bước 9: cân, hàn kín túi, in mã lô nối với nhà vườn. Túi tiếp xúc sản phẩm cất trong tủ ngay cạnh, không mang qua nhà ở.' },
      { p: [12.4, 1.4, 8.3], ten: 'Bàn làm nguội, chọn lọc', noidung: 'Bước 7: làm nguội, nhặt dị vật trên bàn inox trước khi dò kim loại và đóng túi.' },
      { p: [12.8, 2.9, 5], zone: 'sach' }] },

  { id: 'sao-tra', ten: 'Khu sao trà bếp củi', nhom: 'moi', khu: 'moi', gd: 2, p: [8.7, 1.65, 10.6], nhin: [11.6, 0.8, 13.4], fov: 80, zones: ['sao', 'cui'],
    mota: 'Hai bếp củi sao trà. Miệng lò nạp củi và rút tro nằm ngoài tường nam, ống khói vượt mái, nên khói và tro không vào phòng sao. Cửa bắc mở thẳng vào khu sạch.',
    di: [{ toi: 'khu-sach', p: [11, 1.2, 10], nhan: 'Về khu sạch', qua: [[10.8, 10.4]], sau: [[10.8, 9]] },
      { toi: 'san-giua', p: [8, 1.2, 12], nhan: 'Ra sân giữa', qua: [[8.6, 12]] }],
    tt: [{ p: [9.4, 1.4, 13.2], zone: 'sao', ten: 'Bếp sao trà' }, { p: [10.5, 2.3, 14.2], zone: 'cui' },
      { p: [8.1, 1.9, 10.65], ten: 'Điểm kiểm soát tới hạn', noidung: 'HACCP: theo dõi nhiệt độ, thời gian sao và độ ẩm thành phẩm từng mẻ; kiểm khói (PAH) khi người mua yêu cầu.' }] },

  { id: 'san-giua', ten: 'Sân giữa: bếp, nhà vệ sinh, lán củi', nhom: 'moi', khu: 'moi', gd: 2, p: [4.6, 1.6, 13.6], nhin: [0, 1.9, 16.8], zones: ['an', 'wc', 'phoi', 'cui'],
    mota: 'Khoảng sân sau xưởng, gọn trong bề ngang 17 m: bên trái là bếp, nhà ăn, nhà vệ sinh nối tiếp dãy phòng; bên phải là khu sao trà và lán củi; phía trước là nhà phơi kín.',
    di: [{ toi: 'nha-an', p: [0, 1.2, 12], nhan: 'Bếp và nhà ăn' },
      { toi: 'nha-phoi', p: [4.75, 1.2, 17], nhan: 'Nhà phơi kín' },
      { toi: 'sao-tra', p: [8, 1.2, 12], nhan: 'Khu sao trà' },
      { toi: 'hanh-lang', p: [1, 1.2, 10], nhan: 'Vào hành lang', sau: [[1, 8.5]] },
      { toi: 'so-che', p: [4.75, 1.2, 10], nhan: 'Vào khu sơ chế (cửa chuyển khay)' },
      { toi: 'san-sau', p: [-3.25, 1.2, 18.2], nhan: 'Lối xuống khu sau', qua: [[0.5, 16.8], [-3.25, 16.8]], sau: [[-3.25, 21.6]] }],
    tt: [{ p: [-2, 2.1, 15.25], zone: 'wc' }, { p: [-2, 4.4, 15.25], ten: 'Bồn nước trên mái', noidung: 'Bồn nước sạch có lọc đặt trên mái nhà vệ sinh, cấp xuống khu sơ chế và các chỗ rửa tay, không chiếm thêm đất.' },
      { p: [10.5, 1.8, 14.75], zone: 'cui' }] },

  { id: 'nha-an', ten: 'Bếp và nhà ăn', nhom: 'moi', khu: 'moi', gd: 2, p: [-0.6, 1.65, 13.5], nhin: [-3.4, 1.0, 11.0], zones: ['an'],
    mota: 'Nối tiếp dãy phòng bên trái nên lô không phải mở rộng bề ngang. Khoảng 8–10 chỗ, ăn chia ca khi đông người.',
    di: [{ toi: 'san-giua', p: [0, 1.2, 12], nhan: 'Ra sân giữa' }],
    tt: [{ p: [-2.8, 1.4, 13.3], ten: 'Bếp nấu', noidung: 'Bếp củi lấy củi từ lán củi bên khu sao trà; thức ăn của công nhân không mang vào khu chế biến.' }, { p: [-2.6, 1.1, 11.4], zone: 'an' }] },

  { id: 'nha-phoi', ten: 'Nhà phơi kín', nhom: 'moi', khu: 'moi', gd: 2, p: [3, 1.6, 17.65], nhin: [9, 1.1, 19.6], zones: ['phoi', 'say2'],
    mota: 'Phơi trà trên giàn cách đất, mái lấy sáng, vách lưới chắn côn trùng. Khay vào một cửa, ra cửa khác sang khu sao trà. Cuối nhà là buồng sấy bơm nhiệt (GĐ4) cho ngày mưa.',
    di: [{ toi: 'san-giua', p: [4.75, 1.2, 17], nhan: 'Ra sân giữa' }],
    tt: [{ p: [1.5, 1.6, 18.75], zone: 'phoi', ten: 'Giàn phơi trà' }, { p: [11.1, 1.8, 19.2], zone: 'say2' }] },

  { id: 'san-sau', ten: 'Khu nước thải và cổng sau', nhom: 'moi', khu: 'moi', gd: 2, p: [1, 1.6, 21.6], nhin: [6.8, 0.6, 23.6], zones: ['xlnt', 'rac', 'rao'],
    mota: 'Cuối lô, sát đường sau nhà phơi: bể tự hoại, hố lắng nước thải, điểm rác có nắp. Xe rác, xe hút bể phốt vào cổng sau, không đi qua cổng trước.',
    di: [{ toi: 'san-giua', p: [-3.25, 1.2, 21.6], nhan: 'Lên sân giữa', sau: [[-3.25, 16.8], [0.5, 16.8]] },
      { toi: 'tren-cao', p: [4, 7, 24], nhan: 'Bay lên toàn cảnh', thang: true }],
    tt: [{ p: [6.75, 0.9, 23.5], zone: 'xlnt' }, { p: [-2, 1.3, 23.25], zone: 'rac' },
      { p: [-2, 1.8, 25.5], ten: 'Cổng sau', noidung: 'Chỉ dành cho xe rác và xe hút bể phốt, tách hẳn cổng trước nơi nhập nguyên liệu và xuất thành phẩm.' }] },

  { id: 'tren-cao-cu', ten: 'Toàn cảnh khu nhà ở và xưởng cũ', nhom: 'tong', khu: 'cu', gd: 1, p: C3(-17, 21, 5), nhin: C3(4, 0, -21), fov: 72, zones: [],
    mota: 'Nhà ở mặt tiền ra đường; phía sau là sân sau, nhà vệ sinh có sẵn và xưởng cũ 5 phòng có lối đi dọc phía tây. Lô xưởng mới cách khoảng 200 m về phía nam.',
    di: [{ toi: 'nha-o', p: C3(-1.5, 1.4, -4.6), nhan: 'Xuống trước nhà', thang: true },
      { toi: 'tren-cao', p: [-13.2, 1.5, -180], nhan: 'Sang lô xưởng mới (cách 200 m)' }],
    tt: [{ p: C3(5, 5.4, -27), ten: 'Xưởng cũ 5 phòng', noidung: 'Kho bao bì, khu gia công đóng gói, phòng dụng cụ, kho thành phẩm, kho để đồ (nửa đông thành phòng QC từ GĐ3). Vào xưởng phải qua nhà ở và sân sau.' },
      { p: C3(3, 6.2, -11), zone: 'nha' }, { p: C3(13.5, 3.8, 1.2), zone: 'cn', ten: 'Bãi xe container' }] },

  { id: 'nha-o', ten: 'Trước nhà ở', nhom: 'cu', khu: 'cu', gd: 1, p: C3(-1.5, 1.65, -4.4), nhin: C3(-1.5, 2.2, -12), zones: ['nha'],
    mota: 'Lối duy nhất vào xưởng cũ đi xuyên qua nhà ở, nên hàng qua đây luôn đóng bao, đóng túi kín. Bên kia đường là bãi xe container (giả định) cho hàng xuất khẩu.',
    di: [{ toi: 'cua-xuong', p: C3(-1.5, 1.2, -7.5), nhan: 'Qua nhà ra sân sau', sau: [C(-1.5, -15)] },
      { toi: 'tren-cao-cu', p: C3(-1.5, 9, -3), nhan: 'Bay lên toàn cảnh', thang: true },
      { toi: 'cong-truoc', p: C3(-12, 1.2, -4.6), nhan: 'Về lô xưởng mới (200 m)' }],
    tt: [{ p: C3(-1.5, 3.3, -7.4), zone: 'nha' }, { p: C3(13.5, 2.2, 1.2), zone: 'cn', ten: 'Bãi xe container (GĐ3, GĐ4)' }] },

  { id: 'cua-xuong', ten: 'Sân sau và cửa vào xưởng', nhom: 'cu', khu: 'cu', gd: 1, p: C3(-0.2, 1.6, -16.2), nhin: C3(-1.75, 1.8, -20), zones: ['sansau', 'cuaxuong', 'wc1'],
    mota: 'Ô gạch chéo trên bản vẽ: cửa duy nhất vào xưởng cũ, rộng bằng lối đi, mở ra sân sau nhà. Bên phải là nhà vệ sinh có sẵn.',
    di: [{ toi: 'loi-di', p: C3(-1.75, 1.2, -19.6), nhan: 'Vào cửa xưởng' },
      { toi: 'nha-o', p: C3(-1.5, 1.2, -15), nhan: 'Qua nhà ra đường', sau: [C(-1.5, -7.5)] }],
    tt: [{ p: C3(-1.75, 3.5, -19.7), zone: 'cuaxuong' }, { p: C3(4.1, 1.7, -17.3), zone: 'wc1' }, { p: C3(-4.6, 1.5, -17.3), zone: 'sansau' }] },

  { id: 'loi-di', ten: 'Lối đi trong xưởng cũ', nhom: 'cu', khu: 'cu', gd: 1, p: C3(-1.75, 1.6, -21.2), nhin: C3(-1.4, 1.5, -34), zones: ['loidi'],
    mota: 'Lối đi dọc phía tây có tường bao, tranh phong cảnh Tây Nguyên chạy dọc tường. Cửa bên phải lần lượt vào phòng 1, phòng 3, phòng 5.',
    di: [{ toi: 'kho-bb', p: C3(0, 1.2, -21.9), nhan: 'Kho bao bì (phòng 1)' },
      { toi: 'dong-goi', p: C3(0, 1.2, -27), nhan: 'Khu gia công đóng gói (phòng 3)', qua: [C(-1.4, -27)] },
      { toi: 'qc', p: C3(0, 1.2, -31.6), nhan: 'Phòng 5: kho để đồ, phòng QC', qua: [C(-1.4, -31.6)], sau: [C(2.5, -32.2), C(5.1, -31.6)] },
      { toi: 'cua-xuong', p: C3(-1.75, 1.2, -19.6), nhan: 'Ra sân sau' }],
    tt: [{ p: C3(-3.35, 1.8, -27.2), ten: 'Tranh Tây Nguyên', noidung: 'Tranh tường đồi núi Tây Nguyên và khẩu hiệu "Thấy tận mắt, ăn yên tâm." theo bộ nhận diện.' }, { p: C3(-1.75, 2.4, -30), zone: 'loidi' }] },

  { id: 'kho-bb', ten: 'Kho bao bì (phòng 1)', nhom: 'cu', khu: 'cu', gd: 1, p: C3(4.6, 1.6, -21.6), nhin: C3(4, 1.2, -23.9), zones: ['kbb'],
    mota: 'Hộp, thùng, nhãn in sẵn để trên kệ cách sàn. Cửa phải thông sang kho thành phẩm.',
    di: [{ toi: 'kho-tp', p: C3(8.5, 1.2, -24.2), nhan: 'Kho thành phẩm (phòng 2)' }, { toi: 'loi-di', p: C3(0, 1.2, -21.9), nhan: 'Ra lối đi' }],
    tt: [{ p: C3(4, 1.6, -23.4), zone: 'kbb' }] },

  { id: 'dong-goi', ten: 'Khu gia công đóng gói (phòng 3)', nhom: 'cu', khu: 'cu', gd: 1, p: C3(3.3, 1.6, -26.4), nhin: C3(2.2, 1.0, -28.6), zones: ['dg', 'dc'],
    mota: 'GĐ1 chia túi, hàn túi, dán nhãn, đóng hộp tại đây. Từ GĐ2 chỉ dán nhãn, đóng hộp quà, đóng thùng túi đã hàn kín chở từ xưởng mới về.',
    di: [{ toi: 'kho-tp', p: C3(5.5, 1.2, -27.6), nhan: 'Kho thành phẩm (phòng 2)' },
      { toi: 'loi-di', p: C3(0, 1.2, -27), nhan: 'Ra lối đi' },
      { toi: 'qc', p: C3(3.8, 1.2, -29), nhan: 'Phòng 5', sau: [C(3.8, -30.3), C(4.6, -31.6), C(5.1, -31.6)] }],
    tt: [{ p: C3(2.3, 1.2, -27.6), zone: 'dg' }, { p: C3(1, 1.6, -25.2), zone: 'dc' },
      { p: C3(1.1, 1.4, -28.4), ten: 'Máy hàn miệng túi', noidung: 'Dùng ở GĐ1 khi chia túi tại xưởng cũ; từ GĐ2 việc hàn túi chuyển sang khu sạch xưởng mới.' }] },

  { id: 'kho-tp', ten: 'Kho thành phẩm (phòng 2)', nhom: 'cu', khu: 'cu', gd: 1, p: C3(7.9, 1.6, -26.3), nhin: C3(9.4, 1.3, -27), zones: ['ktp'],
    mota: 'Thùng thành phẩm trên pallet và kệ, xuất theo FIFO/FEFO. Ba cửa: sang phòng 3, sang phòng 1 và sang phòng QC.',
    di: [{ toi: 'dong-goi', p: C3(5.5, 1.2, -27.6), nhan: 'Khu gia công đóng gói' },
      { toi: 'kho-bb', p: C3(8.5, 1.2, -24.2), nhan: 'Kho bao bì (phòng 1)' },
      { toi: 'qc', p: C3(7.7, 1.2, -29), nhan: 'Phòng QC (GĐ3)' }],
    tt: [{ p: C3(9.6, 1.7, -27), zone: 'ktp' }] },

  { id: 'qc', ten: 'Phòng QC, lưu mẫu, giữ lô', nhom: 'cu', khu: 'cu', gd: 3, p: C3(8.4, 1.6, -31.2), nhin: C3(6.2, 1.2, -32.6), zones: ['qc', 'kdd'],
    mota: 'Từ GĐ3 ngăn nửa đông kho để đồ làm phòng QC: bàn kiểm, tủ lưu mẫu, khu rào giữ lô chờ kết quả kiểm nghiệm. Mẫu gửi phòng thí nghiệm bên ngoài.',
    di: [{ toi: 'kho-tp', p: C3(7.7, 1.2, -29), nhan: 'Kho thành phẩm' },
      { toi: 'loi-di', p: C3(5.1, 1.2, -31.6), nhan: 'Qua kho để đồ ra lối đi', sau: [C(2.5, -32.2), C(0, -31.6), C(-1.4, -31.4)] }],
    tt: [{ p: C3(7.6, 1.3, -33.6), zone: 'qc', ten: 'Bàn kiểm, tủ lưu mẫu' },
      { p: C3(6.4, 1.7, -30.5), ten: 'Khu giữ lô chờ kết quả', noidung: 'Lô thành phẩm dừng ở đây đến khi có kết quả kiểm nghiệm đạt và mã GACC; hàng không đạt tách riêng, ghi rõ.' },
      { p: C3(2.5, 1.5, -31.6), zone: 'kdd' }] }
];

/* Thứ tự tham quan tự động */
const TOUR = ['tren-cao', 'cong-truoc', 'hanh-lang', 'van-phong', 'so-che', 'khu-sach', 'sao-tra', 'san-giua', 'nha-phoi', 'nha-an', 'san-sau',
  'tren-cao-cu', 'nha-o', 'cua-xuong', 'loi-di', 'kho-bb', 'dong-goi', 'kho-tp', 'qc'];

const NHOM = [{ id: 'tong', ten: 'Toàn cảnh' }, { id: 'moi', ten: 'Xưởng mới' }, { id: 'cu', ten: 'Xưởng cũ' }];

window.HERAGRAIN_360 = { DOI_CU, KHU_CU, PHONG, MAI, BIEN_NGOAI, TRANG_TRI, DUONG, NEN, KHU, SCENES, TOUR, NHOM };
})();
