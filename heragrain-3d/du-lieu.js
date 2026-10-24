/* Dữ liệu nhà máy Heragrain theo hiện trạng: khu nhà ở và xưởng cũ ở trên, cách khoảng 200 m là lô xưởng mới biệt lập
   ở dưới (ngang 17 m, chạy dài từ đường trước đến đường sau), đúng thứ tự trong ảnh tổng quan.
   Sửa nội dung, thêm hoặc dời khu ở file này; nha-may.js chỉ đọc dữ liệu để dựng cảnh 3D.
   Đơn vị: mét. Nguồn: ba ảnh phác thảo tay của HTX, mô tả của HTX và bộ slide tai-lieu/Heragrain_Lo-trinh-dau-tu-giai-doan-dau.pptx. */
(function () {
"use strict";

/* 4 giai đoạn (slide 4–8), chỉnh theo hiện trạng nhà xưởng */
const PH = [
  { n: 1, name: 'Giai đoạn 1 · Thu mua', tab: 'Thu mua', when: 'Q4/2026 – Q1/2027', people: '9–12 người',
    model: 'Gia công tại xưởng cũ: nhận hàng đã sấy, sao, đóng bao kín từ nhà vườn và cơ sở liên kết; chia túi, hàn túi, dán nhãn, đóng thùng, lưu kho.',
    cert: 'Đăng ký HTX, mã số mã vạch GS1, tự công bố sản phẩm.',
    build: 'Không xây mới. Sắp xếp lại 5 phòng xưởng cũ: kệ, pallet, bàn đóng gói, máy hàn túi, bồn rửa tay.',
    goal: 'Chốt bản vẽ xưởng mới 17 × 10 m; có nguồn hàng ổn định từ nhà vườn.' },
  { n: 2, name: 'Giai đoạn 2 · Chế biến', tab: 'Chế biến', when: 'Q2 – Q3/2027', people: '19–27 người',
    model: 'Xây xưởng mới ở lô riêng cách nhà khoảng 200 m, làm cả trà sao bếp củi và trái cây sấy (sầu riêng, chanh dây, gừng, mãng cầu). Túi đã hàn kín chở về xưởng cũ đóng thùng, lưu kho.',
    cert: 'Giấy chứng nhận cơ sở đủ điều kiện ATTP (NĐ 15/2018); xây HACCP.',
    build: 'Xưởng 17 × 10 m có tủ sấy hai cửa xuyên vách; dãy phòng kéo dài thêm bếp, nhà ăn, nhà vệ sinh (bồn nước trên mái); khu sao trà bếp củi và lán củi; nhà phơi kín; cuối lô là bể tự hoại, hố lắng, điểm rác.',
    goal: 'Dây chuyền ổn định, truy xuất đến nhà vườn.' },
  { n: 3, name: 'Giai đoạn 3 · Sản xuất đạt chuẩn', tab: 'Đạt chuẩn xuất khẩu', when: 'Q4/2027 – Q1/2028', people: '25–35 người',
    model: 'Không xây thêm nhà. Ngăn nửa kho để đồ làm phòng QC và khu giữ lô; xuất Trung Quốc qua nhà nhập khẩu.',
    cert: 'HACCP/ISO 22000 do tổ chức độc lập chứng nhận; mã GACC trên CIFER (Lệnh 280).',
    build: 'Vách ngăn phòng QC, tủ lưu mẫu; máy dò kim loại; lưới chắn côn trùng các cửa, kể cả cửa vào xưởng cũ.',
    goal: 'Lô đầu sang Trung Quốc thông quan.' },
  { n: 4, name: 'Giai đoạn 4 · Xuất khẩu', tab: 'Xuất khẩu', when: 'từ Q2/2028', people: '28–40 người',
    model: 'Tự chủ xuất khẩu Trung Quốc và Châu Âu; thêm buồng sấy để sấy trà khi trời mưa và tăng công suất. Nhân sự đông thì ăn, nghỉ chia ca.',
    cert: 'BRCGS hoặc FSSC 22000; EUR.1 hưởng thuế EVFTA.',
    build: 'Buồng sấy bơm nhiệt cuối nhà phơi; hàng rào, cổng trước, cổng sau, camera lô xưởng mới.',
    goal: 'Lô đầu sang EU kèm EUR.1.' }
];

/* 7 bộ phận (slide 9, 12) */
const D = { gd: 'Giám đốc điều hành', sx: 'Sản xuất và kỹ thuật', qa: 'QA/QC và ATTP', vn: 'Vùng nguyên liệu, TXNG', kho: 'Kho và logistics', xk: 'Xuất khẩu, thị trường', hc: 'Hành chính, kế toán' };

/* Khu nhà ở và xưởng cũ vẽ theo tọa độ riêng (như ảnh vẽ tay) rồi dời DX_CU, DZ_CU mét để nằm phía trên lô xưởng mới.
   Hai khu thật cách nhau khoảng 200 m; sơ đồ rút ngắn khoảng cách để cả hai cùng vừa màn hình. */
const DX_CU = -2, DZ_CU = -32;
const P = (x, z) => [x + DX_CU, z + DZ_CU]; // điểm theo tọa độ riêng của khu cũ -> tọa độ sơ đồ
const DO_KHOANG = { ke: 1, cui: 1, gian: 1, long: 1, vach: 1 }; // đồ khai báo x0, x1, z0, z1; các đồ khác khai báo x, z
function doiKhu(z, dx, dz) {
  z.box = [z.box[0] + dx, z.box[1] + dx, z.box[2] + dz, z.box[3] + dz];
  (z.doors || []).forEach((d) => { d.at += d.side === 'N' || d.side === 'S' ? dx : dz; });
  if (z.pin) z.pin = [z.pin[0] + dx, z.pin[1], z.pin[2] + dz];
  (z.do || []).forEach((p) => {
    if (DO_KHOANG[p[0]]) { p[1] += dx; p[2] += dx; p[3] += dz; p[4] += dz; } else { p[1] += dx; p[2] += dz; }
  });
  return z;
}

/* Mỗi khu:
   id      mã khu, dùng trong STEPS và ROUTES
   n       số hiện trên nhãn và trong danh sách
   kind    kiểu dựng: hall (nhà có tường thấp, mái trong), block (khối nhà kín), house (nhà ở mái dốc),
           door (cửa lớn có cánh kẻ sọc), path (lối đi lộ thiên), dryhouse (nhà phơi lưới), woodshed (lán có mái),
           septic (bể tự hoại, hố lắng), utility (bồn nước trên chân, bể tự hoại), bins (điểm rác),
           passdryer (tủ sấy hai cửa), detector (máy dò kim loại), equip (buồng sấy), cont (xe container),
           fence (hàng rào), trees (vườn cây)
   phase   giai đoạn bắt đầu hoạt động (1–4)
   until   (tùy chọn) giai đoạn cuối còn chạy chính; sau đó chuyển sang dự phòng
   sanCo   (tùy chọn) công trình có sẵn, không tính là hạng mục mới của giai đoạn 1
   box     [x0, x1, z0, z1] tính bằng mét: x từ tây sang đông, z từ bắc xuống nam
   h       chiều cao mái; wallH (tùy chọn) chiều cao tường hiện trên sơ đồ
   open    (tùy chọn) các mặt không vẽ tường vì khu bên cạnh đã có tường chung
   doors   (tùy chọn) lối đi trổ trên tường {side: N/S/W/E, at: tọa độ tâm lối, w: bề rộng}
   cua     (chỉ block) mặt có cửa: N/S/W/E, mặc định S
   lines, gates (chỉ hàng rào) các đoạn rào [[[x, z], ...], ...] và cổng {at: [x, z], w}
   noFloor, noRoof (tùy chọn) khu nằm trong khu khác, hoặc khu không có mái
   xay     (tùy chọn) hạng mục xây mới, cộng vào tổng diện tích xây của giai đoạn
   kt      (tùy chọn) nguồn kích thước: 'phac' theo số đo trên phác thảo, 'uoc' ước theo tỷ lệ ảnh vẽ tay, 'de' đề xuất
   noArea  (tùy chọn) không hiện diện tích
   pin     (tùy chọn) [x, y, z] vị trí nhãn số; bỏ trống thì đặt giữa nóc khu
   do      (tùy chọn) đồ đạc, thiết bị: ['ban', x, z, rộng, sâu], ['ghe', x, z, rộng, sâu], ['may', x, z, rộng, cao, sâu],
           ['bon', x, z, bán kính, cao, độ cao chân], ['ke', x0, x1, z0, z1, số tầng], ['thung', x, z, số cột, số hàng],
           ['pallet', x, z], ['bep', x, z, khoảng dời ống khói theo z], ['cui', x0, x1, z0, z1],
           ['gian', x0, x1, z0, z1], ['long', x0, x1, z0, z1], ['vach', x0, x1, z0, z1] (nét chấm trên sàn)
   dept, role, req, basis: bộ phận phụ trách, công năng, yêu cầu, căn cứ bố trí (hiện ở bảng bên phải) */

/* ---------- Khu nhà ở và xưởng cũ (tọa độ riêng theo ảnh vẽ tay, dời bằng doiKhu) ---------- */
const KHU_CU = [
  { id: 'nha', n: 2, name: 'Nhà ở gia đình (phòng 7)', kind: 'house', phase: 1, sanCo: true, box: [-5, 11, -15, -7.5], h: 6, wallH: 2.6, kt: 'uoc', dept: [],
    doors: [{ side: 'S', at: -1.5, w: 3.6 }, { side: 'N', at: -1.5, w: 3.6 }],
    do: [['ban', 6, -11.5, 2.2, 1], ['ghe', 6, -12.6, 2.2, 0.5], ['ghe', 8.8, -9, 2.4, 0.8]],
    role: 'Mặt tiền ra đường. Muốn vào xưởng cũ phải đi xuyên qua nhà, ra sân sau rồi qua cửa vào xưởng. Vì vậy chỉ cho hàng đã đóng bao, đóng túi kín và bao bì còn nguyên kiện đi qua.',
    req: 'Hàng qua nhà phải đóng kín, đi theo lối cố định, không để lại trong nhà.', basis: 'GB 14881 §3.2.2 (tách khu sinh hoạt với khu sản xuất); đề xuất của tư vấn.' },
  { id: 'sansau', n: 3, name: 'Sân sau nhà ở', kind: 'hall', phase: 1, sanCo: true, box: [-5, 4, -19.6, -15], h: 2.6, wallH: 2, kt: 'uoc', open: ['E', 'S'], noRoof: true, pin: [-3.2, 4, -17.3], dept: [],
    doors: [{ side: 'N', at: -1.75, w: 3.5 }, { side: 'N', at: 2, w: 4 }],
    role: 'Ô không đánh số trên bản vẽ, có tường bao, nằm giữa nhà ở, nhà vệ sinh có sẵn và xưởng cũ. Từ nhà ở ra sân này là tới cửa vào xưởng.',
    req: 'Giữ sạch, không để rác hay vật nuôi gần cửa xưởng.', basis: 'Bản vẽ hiện trạng; đề xuất của tư vấn.' },
  { id: 'cuaxuong', n: 4, name: 'Cửa vào xưởng (cửa chính xưởng cũ)', kind: 'door', phase: 1, box: [-3.5, 0, -19.85, -19.35], h: 3, noArea: true, pin: [-1.75, 5.4, -19.6], dept: [D.kho],
    role: 'Ô gạch chéo trên bản vẽ: cửa duy nhất vào xưởng cũ, rộng bằng lối đi (khoảng 3,5 m), ở đầu nam lối đi phía tây, mở ra sân sau nhà. Mọi người và hàng vào ra xưởng cũ đều qua cửa này.',
    req: 'Đóng cửa khi không chuyển hàng; từ GĐ3 thêm rèm nhựa hoặc lưới chắn côn trùng.', basis: 'Bản vẽ hiện trạng; GB 14881 §6.4 (kiểm soát côn trùng).' },
  { id: 'loidi', n: 5, name: 'Lối đi trong xưởng cũ', kind: 'hall', phase: 1, box: [-3.5, 0, -34.2, -19.6], h: 2.6, wallH: 2.2, kt: 'uoc', open: ['E', 'S'], noRoof: true, pin: [-1.75, 3.6, -31.5], dept: [D.kho],
    do: [['vach', -1.75, -1.75, -33.8, -20.2]],
    role: 'Lối đi dọc phía tây xưởng (nét chấm trên bản vẽ), có tường bao phía tây và phía bắc; từ cửa vào xưởng dẫn tới cửa phòng 1, phòng 3 và phòng 5.',
    req: 'Giữ thông thoáng, không để hàng trên lối đi.', basis: 'Bản vẽ hiện trạng.' },
  { id: 'wc1', n: 6, name: 'Nhà vệ sinh có sẵn (phòng 6)', kind: 'block', phase: 1, sanCo: true, box: [4, 10.7, -19.6, -15], h: 3.2, kt: 'uoc', cua: 'W', dept: [D.hc],
    role: 'Dùng cho người làm ở xưởng cũ, cửa mở ra sân sau. Công nhân xưởng mới dùng nhà vệ sinh cuối dãy phòng bên đó.',
    req: 'Cửa không mở thẳng vào kho hay khu đóng gói; có chỗ rửa tay.', basis: 'GB 14881 §5.1.5.3.' },
  { id: 'kbb', n: 7, name: 'Kho bao bì (phòng 1)', kind: 'hall', phase: 1, box: [0, 10.2, -24.2, -19.6], h: 4.2, wallH: 2, kt: 'uoc', dept: [D.kho],
    doors: [{ side: 'N', at: 8.5, w: 1.5 }, { side: 'W', at: -21.9, w: 1.2 }],
    do: [['ke', 1, 7.2, -23.8, -23.1, 2], ['pallet', 3, -20.5], ['pallet', 5, -20.5], ['thung', 7, -20.8, 2, 1]],
    role: 'Lưu hộp, thùng, nhãn in sẵn. Từ GĐ2 túi tiếp xúc trực tiếp với sản phẩm chỉ để dự trữ ở đây, phần dùng hằng ngày cất trong tủ ở khu sạch xưởng mới.',
    req: 'Bao bì để trên kệ, cách sàn, cách tường; tách khỏi hàng hóa khác.', basis: 'GB 14881 §5.1.8.3: lưu riêng bao bì.' },
  { id: 'dg', n: 8, name: 'Khu gia công đóng gói (phòng 3)', kind: 'hall', phase: 1, box: [0, 5.5, -29, -24.2], h: 4.2, wallH: 2, kt: 'uoc', open: ['S'], dept: [D.kho, D.qa],
    doors: [{ side: 'N', at: 3.8, w: 1.2 }, { side: 'W', at: -27, w: 1.2 }, { side: 'E', at: -27.6, w: 1.2 }],
    do: [['ban', 3.2, -28.2, 3, 0.9], ['ban', 3.9, -25.3, 2.2, 0.9], ['may', 1.1, -28.4, 0.8, 1, 0.6], ['bon', 5, -24.8, 0.22, 0.85]],
    role: 'GĐ1: chia túi, hàn túi, dán nhãn, đóng hộp hàng nhận từ nhà vườn và cơ sở liên kết. Từ GĐ2: chỉ dán nhãn, đóng hộp, đóng thùng túi đã hàn kín chở từ xưởng mới về (bước 10).',
    req: 'GĐ1 chia túi trong phòng đóng cửa, rửa tay trước khi làm, mặc tạp dề, đội mũ. Từ GĐ2 không mở túi tại đây; mã lô trên nhãn khớp với túi.',
    basis: 'Slide 14, 20; lối vào xưởng cũ đi qua nhà ở nên phần để hở sản phẩm dồn về xưởng mới từ GĐ2.' },
  { id: 'dc', n: 9, name: 'Phòng dụng cụ đóng gói (phòng 4)', kind: 'hall', phase: 1, box: [0, 1.9, -26.2, -24.2], h: 3, wallH: 2, kt: 'uoc', open: ['W', 'S'], noFloor: true, noRoof: true, pin: [1, 4.6, -25.2], dept: [D.kho],
    doors: [{ side: 'N', at: 1.3, w: 0.8 }],
    do: [['ke', 0.2, 1.7, -26, -25.5, 2]],
    role: 'Cất máy dán nhãn, máy in date, băng keo, dao cắt thùng. Bản vẽ không ghi cửa phòng 4; sơ đồ giả định cửa mở sang phòng 3.',
    req: 'Dụng cụ có sổ theo dõi; dao, lưỡi cắt kiểm đếm đầu và cuối ca.', basis: 'Kiểm soát dị vật kim loại trong HACCP; đề xuất của tư vấn.' },
  { id: 'ktp', n: 10, name: 'Kho thành phẩm (phòng 2)', kind: 'hall', phase: 1, box: [5.5, 10.2, -29, -24.2], h: 4.2, wallH: 2, kt: 'uoc', open: ['W', 'S'], dept: [D.kho],
    doors: [{ side: 'N', at: 7.7, w: 1.4 }],
    do: [['ke', 6, 9.9, -28.7, -28, 3], ['pallet', 6.6, -25.3], ['pallet', 9.5, -25.9]],
    role: 'Lưu thùng thành phẩm trên pallet, xuất theo FIFO/FEFO, theo dõi nhiệt độ và độ ẩm kho (bước 11). Cửa vào từ phòng 3 và từ phòng 1, đúng như bản vẽ.',
    req: 'Mã lô và hồ sơ truy xuất; tách khỏi bao bì và hàng chờ kết quả.', basis: 'GB 14881 §5.1.8.1–5.1.8.4; Codex §4.4.8.' },
  { id: 'kdd', n: 11, name: 'Kho để đồ (nửa tây phòng 5)', kind: 'hall', phase: 1, box: [0, 5.1, -34.2, -29], h: 4.2, wallH: 2, kt: 'uoc', open: ['S', 'E'], dept: [D.hc],
    doors: [{ side: 'W', at: -31.6, w: 1.2 }],
    do: [['ke', 0.4, 4.7, -33.9, -33.2, 2], ['thung', 2.2, -31.2, 3, 2]],
    role: 'Đồ dùng chung, vật tư không tiếp xúc thực phẩm. Từ GĐ3 nửa phía đông ngăn ra làm phòng QC.',
    req: 'Không để hóa chất chung với bao bì, thành phẩm.', basis: 'GB 14881 §5.1.8.4.' },
  { id: 'qc', n: 28, name: 'Phòng QC, lưu mẫu, giữ lô (nửa đông phòng 5)', kind: 'hall', phase: 3, box: [5.1, 10.2, -34.2, -29], h: 4.2, wallH: 2, kt: 'uoc', open: ['S'], dept: [D.qa],
    doors: [{ side: 'W', at: -31.6, w: 1 }],
    do: [['ban', 7.6, -33.6, 3.6, 0.8], ['may', 9.7, -32.2, 0.6, 1.8, 1.2], ['long', 5.6, 8.7, -31.5, -29.5], ['thung', 6, -31, 3, 2]],
    role: 'Ngăn nửa đông kho để đồ: bàn kiểm, tủ lưu mẫu, khu rào giữ lô chờ kết quả kiểm nghiệm và mã GACC. Cửa thông sang kho thành phẩm. Mẫu gửi phòng thí nghiệm bên ngoài, không xây lab.',
    req: 'Chỉ xuất lô khi có kết quả đạt; hàng không đạt tách riêng, ghi rõ.', basis: 'GB 14881 §4.1.4, §7.2.2, §9.2–9.3; slide 7.' }
].map((z) => doiKhu(z, DX_CU, DZ_CU));

const ZONES = [
  /* ---------- Giai đoạn 1: vùng nguyên liệu, khu nhà ở và xưởng cũ ---------- */
  { id: 'vung', n: 1, name: 'Vùng nguyên liệu, nhà vườn và cơ sở liên kết', kind: 'trees', phase: 1, box: [-40, -26, -30, -16], h: 6, noArea: true, dept: [D.vn],
    role: 'GĐ1 cung cấp hàng đã sấy, sao, đóng bao kín để xưởng cũ gia công đóng gói. Từ GĐ2 cung cấp trà tươi và trái cây (sầu riêng, chanh dây, gừng, mãng cầu) cho xưởng mới.',
    req: 'Hợp đồng thu mua, danh sách vùng nguyên liệu, nhật ký sản xuất; kiểm dư lượng từng lô.', basis: 'Luật ATTP 2010 Điều 19; slide 13.' },
  ...KHU_CU.filter((z) => z.phase === 1),

  /* ---------- Giai đoạn 2: lô xưởng mới, ngang 17 m, chạy dài từ đường trước đến đường sau ---------- */
  { id: 'vp', n: 12, name: 'Phòng kế toán và họp', kind: 'hall', phase: 2, xay: true, box: [-4, 0, 0, 3], h: 4.5, wallH: 2, kt: 'phac', dept: [D.gd, D.hc, D.xk],
    doors: [{ side: 'E', at: 1.5, w: 1 }],
    do: [['ban', -2.2, 1.6, 2.2, 1.1], ['may', -3.6, 0.6, 0.5, 1.8, 0.9]],
    role: 'Kế toán, hồ sơ HACCP và truy xuất, tiếp khách và họp. Cửa mở ra hành lang nên khách không đi qua khu chế biến.',
    req: 'Lưu hồ sơ pháp lý, GS1, tự công bố, hồ sơ HACCP.', basis: 'Phác thảo xưởng mới (ô văn phòng 4 × 3 m); GB 14881 §3.2.2.' },
  { id: 'nghi', n: 13, name: 'Phòng nghỉ công nhân', kind: 'hall', phase: 2, xay: true, box: [-4, 0, 3, 8], h: 4.5, wallH: 2, kt: 'phac', open: ['N'], dept: [D.hc],
    doors: [{ side: 'E', at: 5.5, w: 1 }],
    do: [['ghe', -3.3, 5.5, 0.9, 3.6], ['ghe', -1.9, 5.5, 0.9, 3.6]],
    role: 'Chỗ nghỉ trưa, tách khỏi khu chế biến bằng hành lang và vách ngăn. Khoảng 10–15 người một lượt; khi đông người thì nghỉ chia ca.',
    req: 'Không mang thức ăn, đồ cá nhân vào khu chế biến.', basis: 'Phác thảo (ô phòng nghỉ 4 × 5 m); GB 14881 §3.2.6.' },
  { id: 'thay', n: 14, name: 'Phòng thay bảo hộ, rửa tay', kind: 'hall', phase: 2, xay: true, box: [-4, 0, 8, 10], h: 4.5, wallH: 2, kt: 'phac', open: ['N'], dept: [D.qa],
    doors: [{ side: 'E', at: 9, w: 1 }],
    do: [['may', -3, 8.4, 1.6, 1.8, 0.5], ['bon', -1, 9.5, 0.25, 0.85]],
    role: 'Ô 4 × 2 m trên phác thảo vốn là nhà vệ sinh; đổi thành chỗ thay áo, mũ, ủng, cất đồ cá nhân và rửa tay trước khi vào khu chế biến. Nhà vệ sinh dời xuống cuối dãy phòng.',
    req: 'Vệ sinh cá nhân; khám sức khỏe và tập huấn công nhân.', basis: 'GB 14881 §5.1.5.1, §5.1.5.3; Codex §4.4.4.' },
  { id: 'hl', n: 15, name: 'Hành lang 2 m (lối người)', kind: 'hall', phase: 2, xay: true, box: [0, 2, 0, 10], h: 4.5, wallH: 2, kt: 'phac', open: ['W'], pin: [1, 6.4, 4.5], dept: [D.hc],
    doors: [{ side: 'N', at: 1, w: 1.6 }, { side: 'S', at: 1, w: 1.6 }, { side: 'E', at: 9, w: 1.2 }],
    role: 'Lối cho người: cửa bắc (ô gạch chéo trên phác thảo) ra đường cho nhân viên và khách; cửa nam ra bếp, nhà ăn, nhà vệ sinh và nhà phơi. Thêm vách ngăn phía đông (phác thảo để mở) để hành lang không thông thẳng vào khu chế biến.',
    req: 'Không chuyển nguyên liệu, thành phẩm qua hành lang.', basis: 'Codex CAC/RCP 1 §4.2.1; GB 14881 §4.1.3.' },
  { id: 'tn', n: 16, name: 'Khu tiếp nhận nguyên liệu (khu bẩn)', kind: 'hall', phase: 2, xay: true, box: [2, 7.5, 0, 4], h: 4.5, wallH: 2, kt: 'de', open: ['W', 'S'], dept: [D.vn, D.qa],
    doors: [{ side: 'N', at: 4.75, w: 3 }],
    do: [['thung', 2.5, 0.7, 1, 4], ['may', 6.7, 0.9, 1, 0.8, 0.8], ['ban', 6.7, 2.9, 1.2, 0.8]],
    role: 'Cửa nhập riêng từ đường trước. Cân, lấy mẫu, kiểm cảm quan, gắn mã lô cho trà tươi và trái cây trước khi sơ chế (bước 1).',
    req: 'Kiểm dư lượng, kim loại nặng từng lô; lô không đạt để riêng, ghi rõ.', basis: 'Codex CAC/RCP 1 §4.2.1; GB 14881 §7.2.2.' },
  { id: 'sc', n: 17, name: 'Khu sơ chế (khu bẩn)', kind: 'hall', phase: 2, xay: true, box: [2, 7.5, 4, 10], h: 4.5, wallH: 2, kt: 'de', open: ['W', 'N'], dept: [D.sx],
    doors: [{ side: 'S', at: 4.75, w: 2 }, { side: 'E', at: 5.8, w: 3 }, { side: 'E', at: 8.75, w: 1.2 }],
    do: [['may', 3.1, 5.4, 1, 0.9, 1.8], ['bon', 3.1, 7.6, 0.45, 0.9], ['ban', 6, 4.8, 1.2, 0.8], ['ban', 6.1, 8.6, 1.2, 0.8]],
    role: 'Rửa, phân loại, gọt, cắt (bước 2–3). Trái cây nạp thẳng vào tủ sấy xuyên vách; trà đi cửa nam xuống nhà phơi. Không có cửa người thông thẳng sang khu sạch.',
    req: 'Nước đạt quy chuẩn; thoát nước sàn theo rãnh kín xuống hố lắng cuối lô.', basis: 'GB 14881 §4.1.3, §5.1.1–5.1.2; Luật ATTP Điều 19.' },
  { id: 'say', n: 18, name: 'Tủ sấy hai cửa xuyên vách', kind: 'passdryer', phase: 2, box: [6.6, 8.4, 4.3, 7.3], h: 2.6, noArea: true, pin: [7.5, 5.2, 5.8], dept: [D.sx],
    role: 'Sấy sầu riêng, chanh dây, gừng, mãng cầu (bước 4). Tủ đặt xuyên vách giữa khu sơ chế và khu sạch: nạp khay bên bẩn, lấy khay bên sạch, sản phẩm không quay lại khu bẩn và không tốn thêm diện tích.',
    req: 'HACCP: nhiệt độ, thời gian sấy, độ ẩm thành phẩm.', basis: 'GB 14881 §4.1.3; slide 6 (lắp dây chuyền sấy ở GĐ2), slide 14.' },
  { id: 'dem', n: 19, name: 'Phòng đệm vào khu sạch', kind: 'hall', phase: 2, box: [7.5, 9.5, 7.5, 10], h: 2.6, wallH: 2, kt: 'de', open: ['W', 'S'], noFloor: true, noRoof: true, pin: [8.5, 5.4, 8.9], dept: [D.qa],
    doors: [{ side: 'N', at: 8.5, w: 1 }],
    do: [['bon', 8, 9.5, 0.25, 0.85], ['may', 8.9, 8.4, 0.8, 0.12, 0.6]],
    role: 'Ô 2 × 2,5 m giữa khu bẩn và khu sạch: rửa tay, nhúng ủng, thay tạp dề. Người đi từ khu bẩn sang khu sạch bắt buộc qua đây.',
    req: 'Bồn rửa tay không chạm tay, xà phòng, khăn giấy.', basis: 'GB 14881 §5.1.5; Codex §5.2.4.' },
  { id: 'sach', n: 20, name: 'Khu sạch: làm nguội, chọn lọc, đóng túi', kind: 'hall', phase: 2, xay: true, box: [7.5, 13, 0, 10], h: 4.5, wallH: 2, kt: 'de', open: ['W'], pin: [9.4, 7, 2.6], dept: [D.sx, D.qa],
    doors: [{ side: 'N', at: 11, w: 2.4 }, { side: 'S', at: 11, w: 2 }],
    do: [['ban', 12.4, 8.3, 0.9, 2.4], ['ban', 12.4, 5.2, 0.9, 1.8], ['may', 9.4, 1.6, 1.4, 1.1, 0.9], ['ban', 12.4, 1.6, 0.9, 1.4], ['may', 8, 2.4, 0.7, 1.8, 1.4]],
    role: 'Nhận trà từ khu sao và trái cây từ tủ sấy: làm nguội, nhặt dị vật, cân, hàn miệng túi, in mã lô (bước 7, 9). Cửa xuất riêng ra đường trước; túi kín xếp thùng có nắp, chở về xưởng cũ.',
    req: 'Người và không khí đi từ sạch sang bẩn, không ngược lại; tủ túi bao bì đặt ngay trong khu.', basis: 'GB 14881 §4.1.3, §5.1.6.1.' },
  { id: 'an', n: 21, name: 'Bếp và nhà ăn', kind: 'hall', phase: 2, xay: true, box: [-4, 0, 10, 14], h: 3.8, wallH: 2, kt: 'de', open: ['N'], pin: [-2, 6, 12], dept: [D.hc],
    doors: [{ side: 'E', at: 12, w: 1 }],
    do: [['ban', -2.6, 11.6, 1, 2.2], ['ghe', -3.4, 11.6, 0.35, 2.2], ['ghe', -1.8, 11.6, 0.35, 2.2], ['bep', -2.8, 13.3, 0]],
    role: 'Nối tiếp dãy phòng bên trái, ngay dưới phòng thay bảo hộ, để lô không phải mở rộng bề ngang. Bếp nấu ở góc trong, khoảng 8–10 chỗ ngồi, ăn chia ca; củi lấy từ lán củi.',
    req: 'Thức ăn của công nhân không mang vào khu chế biến.', basis: 'GB 14881 §3.2.6: nhà ăn ngăn cách khu sản xuất.' },
  { id: 'wc', n: 22, name: 'Nhà vệ sinh, bồn nước trên mái', kind: 'block', phase: 2, xay: true, box: [-4, 0, 14, 16.5], h: 3.2, kt: 'de', cua: 'E', pin: [-2, 6.6, 15.25], dept: [D.hc],
    do: [['bon', -2, 15.25, 0.65, 1.2, 3.35], ['bon', -0.8, 15.25, 0.25, 0.9, 3.35]],
    role: 'Cuối dãy phòng bên trái: hai buồng vệ sinh và chỗ rửa tay, cửa mở ra sân phía đông, không mở vào khu sản xuất. Bồn nước sạch có lọc đặt trên mái, cấp xuống sơ chế và các chỗ rửa tay, không chiếm đất.',
    req: 'Công nhân cởi tạp dề trước khi vào nhà vệ sinh, rửa tay trước khi quay lại xưởng. Nước đạt quy chuẩn nước sạch sinh hoạt; xét nghiệm định kỳ.',
    basis: 'GB 14881 §5.1.5.3, §5.1.1; Luật ATTP Điều 19.' },
  { id: 'sao', n: 23, name: 'Khu sao trà bếp củi', kind: 'hall', phase: 2, xay: true, box: [8, 13, 10, 14], h: 4.2, wallH: 2, kt: 'uoc', open: ['N'], dept: [D.sx],
    doors: [{ side: 'W', at: 12, w: 1.4 }],
    do: [['bep', 9.4, 13.2, 1.3], ['bep', 11.7, 13.2, 1.3], ['ban', 10.5, 10.8, 2.4, 0.7]],
    role: 'Sao trà trên chảo bếp củi (bước 6). Củi nạp và tro rút từ lán củi phía ngoài tường nam; ống khói cao hơn mái nên khói, tro không vào phòng sao. Cửa bắc mở thẳng vào khu sạch.',
    req: 'HACCP: nhiệt độ, thời gian sao, độ ẩm thành phẩm; theo dõi nhiễm khói (PAH) khi người mua yêu cầu.',
    basis: 'Codex CAC/RCP 68-2009 (giảm nhiễm PAH khi hun khói, sấy trực tiếp); phác thảo khu sao trà.' },
  { id: 'cui', n: 24, name: 'Lán củi', kind: 'woodshed', phase: 2, xay: true, box: [8, 13, 14, 15.5], h: 2.6, kt: 'de', pin: [10.5, 4.8, 14.8], dept: [D.sx],
    do: [['cui', 8.4, 12.7, 14.6, 15.3]],
    role: 'Lán củi sát mặt ngoài tường nam khu sao, cũng là chỗ đứng nạp củi và rút tro; bếp nhà ăn lấy củi từ đây.',
    req: 'Củi khô, không sơn, không tẩm hóa chất.', basis: 'Codex CAC/RCP 68-2009 (chọn nhiên liệu); đề xuất của tư vấn.' },
  { id: 'phoi', n: 25, name: 'Nhà phơi kín', kind: 'dryhouse', phase: 2, xay: true, box: [-2.5, 13, 17, 21], h: 3.4, wallH: 2.3, kt: 'uoc', dept: [D.sx],
    doors: [{ side: 'N', at: 4.75, w: 2 }, { side: 'N', at: 7.5, w: 1.6 }],
    do: [['gian', -1.8, 9, 18.3, 19.2], ['gian', -1.8, 9, 19.9, 20.7]],
    role: 'Phơi trà trên giàn (bước 5). Gần hết bề ngang lô, chừa lối 1,5 m phía tây xuống khu sau. Mái lấy sáng, vách lưới chắn côn trùng, giàn cách đất; hai cửa riêng: khay vào từ khu sơ chế, khay ra sang khu sao trà.',
    req: 'Không phơi trên sân đất; khay có nắp khi chuyển.', basis: 'GB 14881 §6.4 (kiểm soát côn trùng); phác thảo nhà phơi trà.' },
  { id: 'xlnt', n: 26, name: 'Bể tự hoại, hố lắng nước thải', kind: 'septic', phase: 2, box: [2.5, 11, 22, 25], h: 1.2, kt: 'de', dept: [D.sx],
    role: 'Cuối lô, sát đường sau nhà phơi như yêu cầu: bể tự hoại cho nhà vệ sinh, hố lắng nước rửa của khu sơ chế. Xe hút bể phốt vào bằng cổng sau, không đi qua cổng trước nơi nhập nguyên liệu và xuất thành phẩm.',
    req: 'Nước thải xử lý đạt yêu cầu trước khi xả ra mương đường sau.', basis: 'GB 14881 §5.1.2.5; Luật ATTP Điều 19.' },
  { id: 'rac', n: 27, name: 'Điểm tập kết rác, bã', kind: 'bins', phase: 2, box: [-3.5, -0.5, 22, 24.5], h: 2.2, kt: 'de', open: ['N', 'S'], dept: [D.sx],
    role: 'Thùng có nắp cho rác, vỏ, bã sau sơ chế; cuối lô cạnh cổng sau, xe rác lấy từ đường sau, xa khu sạch.',
    req: 'Đổ hằng ngày, rửa thùng định kỳ.', basis: 'GB 14881 §5.1.4, §6.5.2.' },

  /* ---------- Giai đoạn 3: đạt chuẩn, không xây thêm nhà ---------- */
  ...KHU_CU.filter((z) => z.phase === 3),
  { id: 'dkl', n: 29, name: 'Máy dò kim loại', kind: 'detector', phase: 3, box: [10.4, 11.6, 3, 6], h: 1.7, noArea: true, pin: [11.9, 4.6, 4.5], dept: [D.sx, D.qa],
    role: 'Đặt trên đường đi của sản phẩm trong khu sạch, trước máy hàn túi (bước 8). Lùi từ GĐ2 (theo bộ slide) sang GĐ3, khi xây HACCP, để giảm vốn ban đầu.',
    req: 'HACCP: CCP dò kim loại; thử mẫu chuẩn đầu ca.', basis: 'Slide 14.' },
  { id: 'cn', n: 30, name: 'Xuất khẩu: Trung Quốc', kind: 'cont', phase: 3, box: [5, 18, -33.4, -31], h: 3.2, noArea: true, pin: [11.5, 5.4, -32.2], dept: [D.xk],
    role: 'Xe container đỗ ở bãi xe trước khu nhà (giả định), nhận hàng từ kho thành phẩm xưởng cũ; lô đầu qua nhà nhập khẩu (GĐ3), sau đó tự chủ.',
    req: 'Mã GACC trên CIFER; nhãn tiếng Trung; HACCP/ISO 22000.', basis: 'Lệnh 280; slide 16–17.' },

  /* ---------- Giai đoạn 4: xuất khẩu, mở rộng ---------- */
  { id: 'say2', n: 31, name: 'Buồng sấy bơm nhiệt', kind: 'equip', phase: 4, box: [9.6, 12.6, 17.8, 20.6], h: 2.4, noArea: true, pin: [11.1, 5.6, 19.2], dept: [D.sx],
    role: 'Đặt cuối nhà phơi: sấy trà khi trời mưa để không chậm đơn hàng xuất khẩu, thêm công suất sấy trái cây khi đơn hàng tăng.',
    req: 'Ghi nhiệt độ, độ ẩm từng mẻ.', basis: 'Đề xuất của tư vấn.' },
  { id: 'rao', n: 32, name: 'Hàng rào, cổng trước, cổng sau, camera', kind: 'fence', phase: 4, box: [-4, 13, -2, 25.5], h: 2, noArea: true, pin: [-4.6, 4.5, 21], dept: [D.hc, D.kho],
    lines: [[[-4, 0], [-4, -2], [13, -2], [13, 0]], [[-4, 16.5], [-4, 25.5], [13, 25.5], [13, 15.5]]],
    gates: [{ at: [1, -2], w: 2.4 }, { at: [4.75, -2], w: 3.6 }, { at: [11, -2], w: 3 }, { at: [-2, 25.5], w: 3 }],
    cams: [[-4, -2], [13, -2], [-4, 25.5], [13, 25.5], [7.9, -2], [-4, 17]],
    role: 'Lô xưởng mới: hai bên đã là tường xưởng, chỉ rào mặt trước và phần sau. Cổng trước có khóa cho nhập nguyên liệu, xuất thành phẩm; cổng sau cho xe rác, xe hút bể phốt. Camera ở các cổng, cửa nhập, cửa xuất, nhà phơi.',
    req: 'Nhóm yêu cầu an ninh thực phẩm (food defence) trong BRCGS và FSSC 22000.', basis: 'Chưa đối chiếu bản tiêu chuẩn hiện hành; xác nhận theo phiên bản khi đánh giá.' },
  { id: 'eu', n: 33, name: 'Xuất khẩu: Châu Âu', kind: 'cont', phase: 4, box: [5, 18, -30.6, -28.2], h: 3.2, noArea: true, pin: [11.5, 5.4, -29.4], dept: [D.xk],
    role: 'Lô đầu sang EU kèm EUR.1; nhà nhập khẩu EU chịu trách nhiệm pháp lý.',
    req: 'BRCGS hoặc FSSC 22000 theo yêu cầu người mua; nhãn Quy định 1169/2011; EUR.1.', basis: 'CBI; Thông tư 11/2020/TT-BCT.' }
];

/* 11 bước quy trình, hai nhánh: trái cây sấy (bước 4) và trà phơi, sao bếp củi (bước 5–6); p = [x, z] vị trí số bước */
const STEPS = [
  { n: 1, name: 'Tiếp nhận, kiểm nguyên liệu', zone: 'tn', p: [3.6, 2.4] },
  { n: 2, name: 'Rửa, phân loại', zone: 'sc', p: [3.2, 5.4] },
  { n: 3, name: 'Gọt, cắt, tách', zone: 'sc', p: [6.1, 8.6] },
  { n: 4, name: 'Sấy trái cây (tủ sấy hai cửa)', zone: 'say', p: [7.5, 5.4] },
  { n: 5, name: 'Phơi trà trong nhà phơi kín', zone: 'phoi', p: [1, 19.5] },
  { n: 6, name: 'Sao trà trên bếp củi', zone: 'sao', p: [10.5, 13] },
  { n: 7, name: 'Làm nguội, chọn lọc', zone: 'sach', p: [12.4, 7.6] },
  { n: 8, name: 'Dò kim loại', zone: 'dkl', p: [11, 4.5] },
  { n: 9, name: 'Hàn túi kín, in mã lô', zone: 'sach', p: [9.6, 2.4] },
  { n: 10, name: 'Dán nhãn, đóng hộp, đóng thùng', zone: 'dg', p: P(3, -27.8) },
  { n: 11, name: 'Kho thành phẩm, xuất hàng', zone: 'ktp', p: P(7.8, -26.4) }
];

/* Tuyến luồng hàng: sáng khi khu need đang hoạt động (và giai đoạn ≤ den nếu có); pts = các điểm [x, z].
   Vào xưởng cũ: đường trước nhà → xuyên nhà ở → sân sau → cửa vào xưởng → lối đi → cửa phòng. */
const ROUTES = [
  { id: 'gd1', need: 'dg', den: 1, pts: [[-26, -24], [-15, -24], [-15, -35], P(-2.7, -3), P(-2.7, -27.2), P(0.4, -27.2)] },
  { id: 'in', need: 'tn', pts: [[-26, -20], [-13.7, -20], [-13.7, -3.1], [4.75, -3.1], [4.75, 1.6]] },
  { id: 'sc', need: 'sc', pts: [[4.75, 1.6], [4.75, 7.2]] },
  { id: 'say', need: 'say', pts: [[5.2, 6.6], [10.6, 6.6]] },
  { id: 'phoi', need: 'phoi', pts: [[4.75, 7.2], [4.75, 18]] },
  { id: 'sao', need: 'sao', pts: [[7.5, 18], [7.5, 12], [10.4, 12]] },
  { id: 'sach', need: 'sach', pts: [[10.4, 12], [11, 9.4], [11, 0.6]] },
  { id: 'out', need: 'sach', pts: [[11, 0.6], [11, -4.4], [-12.4, -4.4], [-12.4, -36.2], P(-1.6, -4.2), P(-1.6, -26.8), P(0.4, -26.8)] },
  { id: 'kho', need: 'ktp', pts: [P(0.6, -27.6), P(7.4, -27.6)] },
  { id: 'xuat', need: 'ktp', pts: [P(8.5, -25.6), P(8.5, -21.9), P(-0.5, -21.9), P(-0.5, -6.7), [-20, -38.7]] },
  { id: 'cn', need: 'cn', pts: [P(-0.5, -6.7), [3.5, -38.7], [4.6, -32.2]] },
  { id: 'eu', need: 'eu', pts: [[1.5, -38.7], [4.6, -29.4]] }
];

/* Mặt bằng: nền các lô, đường ranh, đường, chỗ rút ngắn khoảng cách */
const MAT_BANG = {
  nen: [{ box: [DX_CU - 6.5, DX_CU + 12.5, DZ_CU - 35.5, DZ_CU - 7.5] }, { box: [4, 19, -34, -27.8] }, { box: [-4, 13, -2, 25.5] }],
  vien: [
    [P(-6.5, -35.5), P(12.5, -35.5), P(12.5, -7.5), P(-6.5, -7.5)],
    [[-4, -2], [13, -2], [13, 25.5], [-4, 25.5]]
  ],
  duong: [{ box: [-32, 22, DZ_CU - 7.5, DZ_CU - 2] }, { box: [-16, -10.5, DZ_CU - 2, -7.5] }, { box: [-30, 22, -7.5, -2] }, { box: [-12, 21, 25.5, 29.5] }],
  ngat: [{ z: -21, x0: -16, x1: -10.5 }]
};

/* Nhãn phụ trên mặt đất */
const NHAN_PHU = [
  { t: 'Đường trước nhà', p: [-26, 0.3, DZ_CU - 4.75] },
  { t: 'Hai khu cách nhau khoảng 200 m (sơ đồ rút ngắn)', p: [-1.5, 0.3, -21] },
  { t: 'Đường trước lô xưởng mới', p: [-23, 0.3, -4.75] },
  { t: 'Đường phía sau', p: [-7, 0.3, 27.5] },
  { t: 'Lô xưởng mới, ngang 17 m', p: [24, 0.3, 12] },
  { t: 'Bãi xe (giả định)', p: [11.5, 0.3, -26.6] },
  { t: 'Khu nhà ở và xưởng cũ', p: [P(3, 0)[0], 0.3, DZ_CU - 37.4] }
];

/* Khung nhìn: bề rộng, chiều cao tối thiểu (mét) cần vừa màn hình */
const KHUNG = { w: 94, h: 62 };

/* Góc nhìn có sẵn: dir = hướng đặt camera, tgt = điểm nhìn, zoom = độ phóng */
const GOC_NHIN = {
  iso: { dir: [-1, 0.95, 1], tgt: [5.5, 0, -19], zoom: 1, label: 'toàn cảnh' },
  plan: { dir: [0, 1, 0.02], tgt: [-9, 0, -20], zoom: 0.66, label: 'mặt bằng' },
  moi: { dir: [-0.85, 1, 1.1], tgt: [4.5, 0, 12], zoom: 1.9, label: 'xưởng mới' },
  cu: { dir: [-0.75, 1.5, 0.95], tgt: [P(3, -24)[0], 0, P(3, -24)[1]], zoom: 2.4, label: 'xưởng cũ' }
};

/* Phân tích: điều chỉnh so với phác thảo tay */
const DIEU_CHINH = [
  { t: 'Thêm vách ngăn hành lang.', d: 'Phác thảo để hành lang 2 m mở thẳng vào khu chế biến (nét đứt), văn phòng và phòng nghỉ cùng mở ra hành lang này. Thêm vách dọc nét đứt để khách họp, người nghỉ không đi qua khu chế biến.', cc: 'GB 14881 §3.2.2, §4.1.3' },
  { t: 'Gom bếp, nhà ăn, nhà vệ sinh vào dãy phòng bên trái.', d: 'Lô xưởng mới chỉ ngang khoảng 17 m, bằng bề ngang xưởng, nên không đặt nhà ăn, nhà vệ sinh lấn sang bên. Dãy phòng 4 m kéo thẳng xuống: văn phòng → phòng nghỉ → thay bảo hộ → bếp, nhà ăn → nhà vệ sinh; bồn nước đặt trên mái nhà vệ sinh.', cc: 'Tiết kiệm đất' },
  { t: 'Ô nhà vệ sinh 4 × 2 m thành phòng thay bảo hộ.', d: 'Ô này nằm sát hành lang thông vào xưởng nên đổi thành chỗ thay áo, ủng, rửa tay; nhà vệ sinh xuống cuối dãy phòng, cửa quay ra sân, không mở vào khu sản xuất.', cc: 'GB 14881 §5.1.5' },
  { t: 'Tách cửa nhập nguyên liệu và cửa xuất thành phẩm.', d: 'Phác thảo có một cửa chính ở đầu hành lang. Giữ cửa này cho người, thêm cửa nhập vào khu bẩn và cửa xuất từ khu sạch, cùng mở ra đường trước.', cc: 'Codex CAC/RCP 1 §4.2.1' },
  { t: 'Chia khu chế biến 11 × 10 m làm khu bẩn và khu sạch.', d: 'Khu bẩn (tiếp nhận, sơ chế) sát hành lang; khu sạch (làm nguội, chọn lọc, đóng túi) phía đông, sát cửa ra của sao trà. Người sang khu sạch qua phòng đệm rửa tay.', cc: 'GB 14881 §4.1.3' },
  { t: 'Tủ sấy hai cửa xuyên vách cho trái cây.', d: 'Tủ đặt trong vách giữa khu bẩn và khu sạch: nạp bên bẩn, lấy bên sạch, không tốn thêm diện tích. Trà đi vòng khu bẩn → nhà phơi → sao trà → khu sạch.', cc: 'GB 14881 §4.1.3' },
  { t: 'Bếp sao nạp củi từ ngoài tường.', d: 'Miệng lò quay ra lán củi, ống khói cao hơn mái nên khói, tro không vào phòng sao.', cc: 'Codex CAC/RCP 68-2009' },
  { t: 'Nhà phơi kín thay cho phơi sân.', d: 'Mái lấy sáng, vách lưới chắn côn trùng, giàn cách đất; hai cửa riêng cho khay vào và khay ra.', cc: 'GB 14881 §6.4' },
  { t: 'Nước thải, rác ra cổng sau.', d: 'Bể tự hoại, hố lắng và điểm rác đặt cuối lô sát đường sau nhà phơi; xe hút bể phốt, xe rác vào cổng sau, tách hẳn cổng trước nơi nhập nguyên liệu và xuất thành phẩm.', cc: 'GB 14881 §5.1.2.5, §5.1.4' },
  { t: 'Xưởng cũ: GĐ1 gia công đóng gói, từ GĐ2 chỉ nhận túi kín.', d: 'Lối vào đi qua nhà ở và sân sau nên hàng qua nhà luôn đóng bao, đóng túi kín. Xưởng mới cách khoảng 200 m: túi kín xếp thùng có nắp, chở bằng xe có mui về xưởng cũ.', cc: 'GB 14881 §5.1.8' },
  { t: 'Giai đoạn 3, 4 không xây thêm nhà.', d: 'Ngăn nửa đông kho để đồ làm phòng QC, lưu mẫu, giữ lô; mẫu gửi phòng thí nghiệm bên ngoài. Máy dò kim loại lùi sang GĐ3, buồng sấy bơm nhiệt thứ hai đặt trong nhà phơi ở GĐ4.', cc: 'Tối ưu vốn' }
];

/* Cách ước kích thước các công trình chưa có số đo */
const UOC_KICH_THUOC = [
  'Tỷ lệ lấy từ chính ảnh xưởng mới có số đo: ô văn phòng 4 m vẽ 2 ô vở, phòng nghỉ 5 m vẽ 2,5 ô, ô 2 m vẽ 1 ô, nên mỗi ô vở khoảng 2 m.',
  'Áp cùng tỷ lệ cho ảnh xưởng cũ (cùng cuốn vở): 5 phòng xưởng 10,2 × 14,6 m, khoảng 149 m² (phòng 5 sâu 5,2 m; dãy phòng 3, 4, 2 sâu 4,8 m; phòng 1 sâu 4,6 m); lối đi phía tây rộng 3,5 m, cửa vào xưởng rộng bằng lối đi; sân sau 9 × 4,6 m; nhà vệ sinh có sẵn 6,7 × 4,6 m; nhà ở 16 × 7,5 m.',
  'Lô xưởng mới ngang 17 m, bằng bề ngang xưởng; dài khoảng 27,5 m từ mép đường trước đến đường sau, vừa đủ xếp xưởng, dãy bếp và nhà vệ sinh, nhà phơi, bể tự hoại.',
  'Khu sao trà rộng 5 m, đo trên ảnh xưởng mới theo cạnh 17 m; sâu 4 m để đặt hai bếp. Nhà phơi 15,5 × 4 m, chừa lối 1,5 m phía tây.'
];

/* Giả định cần HTX xác nhận */
const CAN_XAC_NHAN = [
  'Vị trí hai khu theo ảnh tổng quan: khu nhà ở và xưởng cũ ở trên, lô xưởng mới ở dưới, nối với nhau bằng đường (thực tế khoảng 200 m, sơ đồ vẽ rút ngắn). Hướng đường nối và bãi xe container trước khu nhà là giả định.',
  'Chiều dài lô xưởng mới (khoảng 27,5 m) và đường phía sau nhà phơi là giả định theo mô tả.',
  'Bản vẽ không ghi cửa của phòng 4 và cửa từ nhà ở ra sân sau; sơ đồ giả định phòng 4 mở sang phòng 3, nhà ở có cửa sau ra sân.',
  'GĐ1 "gia công ở xưởng cũ" đang hiểu là chia túi, đóng gói hàng đã sấy, sao từ nhà vườn và cơ sở liên kết. Nếu GĐ1 còn sơ chế, sấy hoặc sao tại xưởng cũ, cần thêm chỗ cho các công đoạn này và tính lại lối qua nhà ở.',
  'Loại trà sao bếp củi, để chốt chỉ tiêu kiểm nghiệm; nguồn nước (giếng khoan hay nước máy).',
  'Đo thực tế xưởng cũ, nhà ở và lô xưởng mới trước khi thiết kế; số trên sơ đồ là số ước.'
];

window.HERAGRAIN = { PH, D, ZONES, STEPS, ROUTES, MAT_BANG, NHAN_PHU, KHUNG, GOC_NHIN, DIEU_CHINH, UOC_KICH_THUOC, CAN_XAC_NHAN };
})();
