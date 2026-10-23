/* Dữ liệu nhà máy Heragrain theo hiện trạng: xưởng có sẵn (đi qua nhà ở) và xưởng mới 17 × 10 m.
   Sửa nội dung, thêm hoặc dời khu ở file này; nha-may.js chỉ đọc dữ liệu để dựng cảnh 3D.
   Đơn vị: mét. Nguồn: ba ảnh phác thảo tay của HTX và bộ slide tai-lieu/Heragrain_Lo-trinh-dau-tu-giai-doan-dau.pptx. */
(function () {
"use strict";

/* 4 giai đoạn (slide 4–8), chỉnh theo hiện trạng nhà xưởng */
const PH = [
  { n: 1, name: 'Giai đoạn 1 · Thu mua', tab: 'Thu mua', when: 'Q4/2026 – Q1/2027', people: '9–12 người',
    model: 'Thu mua tại vườn, thuê gia công phơi và sao. Xưởng có sẵn chỉ nhận túi thành phẩm đã hàn kín để dán nhãn, đóng thùng, lưu kho.',
    cert: 'Đăng ký HTX, mã số mã vạch GS1, tự công bố sản phẩm.',
    build: 'Không xây mới. Sắp xếp lại 5 phòng xưởng có sẵn: kệ, pallet, bàn đóng gói.',
    goal: 'Chọn đơn vị gia công, chốt bản vẽ xưởng mới 17 × 10 m.' },
  { n: 2, name: 'Giai đoạn 2 · Chế biến', tab: 'Chế biến', when: 'Q2 – Q3/2027', people: '19–27 người',
    model: 'Xây xưởng mới đối diện nhà để tự chế biến; xưởng có sẵn giữ vai trò đóng thùng và kho thành phẩm.',
    cert: 'Giấy chứng nhận cơ sở đủ điều kiện ATTP (NĐ 15/2018); xây HACCP.',
    build: 'Xưởng 17 × 10 m, khu sao trà bếp củi và kho củi, nhà ăn, nhà vệ sinh, nhà phơi kín, bồn nước và bể tự hoại.',
    goal: 'Dây chuyền ổn định, truy xuất đến nhà vườn.' },
  { n: 3, name: 'Giai đoạn 3 · Sản xuất đạt chuẩn', tab: 'Đạt chuẩn xuất khẩu', when: 'Q4/2027 – Q1/2028', people: '25–35 người',
    model: 'Không xây thêm nhà. Ngăn nửa kho để đồ làm phòng QC và khu giữ lô; xuất Trung Quốc qua nhà nhập khẩu.',
    cert: 'HACCP/ISO 22000 do tổ chức độc lập chứng nhận; mã GACC trên CIFER (Lệnh 280).',
    build: 'Vách ngăn phòng QC, tủ lưu mẫu; máy dò kim loại; lưới chắn côn trùng các cửa.',
    goal: 'Lô đầu sang Trung Quốc thông quan.' },
  { n: 4, name: 'Giai đoạn 4 · Xuất khẩu', tab: 'Xuất khẩu', when: 'từ Q2/2028', people: '28–40 người',
    model: 'Tự chủ xuất khẩu Trung Quốc và Châu Âu; sấy bằng máy khi trời mưa để không chậm đơn hàng.',
    cert: 'BRCGS hoặc FSSC 22000; EUR.1 hưởng thuế EVFTA.',
    build: 'Buồng sấy bơm nhiệt cuối nhà phơi; hàng rào, cổng khóa, camera lô xưởng mới.',
    goal: 'Lô đầu sang EU kèm EUR.1.' }
];

/* 7 bộ phận (slide 9, 12) */
const D = { gd: 'Giám đốc điều hành', sx: 'Sản xuất và kỹ thuật', qa: 'QA/QC và ATTP', vn: 'Vùng nguyên liệu, TXNG', kho: 'Kho và logistics', xk: 'Xuất khẩu, thị trường', hc: 'Hành chính, kế toán' };

/* Mỗi khu:
   id      mã khu, dùng trong STEPS và ROUTES
   n       số hiện trên nhãn và trong danh sách
   kind    kiểu dựng: hall (nhà có tường thấp, mái trong), block (khối nhà kín), house (nhà ở mái dốc),
           path (lối đi), dryhouse (nhà phơi lưới), woodshed (lán có mái), utility (bồn nước, bể tự hoại),
           bins (điểm rác), detector (máy dò kim loại), equip (buồng sấy), cont (xe container),
           fence (hàng rào), trees (vườn cây)
   phase   giai đoạn bắt đầu hoạt động (1–4)
   until   (tùy chọn) giai đoạn cuối còn chạy chính; sau đó chuyển sang dự phòng
   sanCo   (tùy chọn) công trình có sẵn, không tính là hạng mục mới của giai đoạn 1
   box     [x0, x1, z0, z1] tính bằng mét: x từ tây sang đông, z từ bắc xuống nam
   h       chiều cao mái; wallH (tùy chọn) chiều cao tường hiện trên sơ đồ
   open    (tùy chọn) các mặt không vẽ tường vì khu bên cạnh đã có tường chung
   doors   (tùy chọn) lối đi trổ trên tường {side: N/S/W/E, at: tọa độ tâm lối, w: bề rộng}
   noFloor, noRoof (tùy chọn) khu nằm trong khu khác
   xay     (tùy chọn) hạng mục xây mới, cộng vào tổng diện tích xây của giai đoạn
   kt      (tùy chọn) nguồn kích thước: 'phac' theo số đo trên phác thảo, 'uoc' ước từ ảnh vẽ tay, 'de' đề xuất
   noArea  (tùy chọn) không hiện diện tích
   pin     (tùy chọn) [x, y, z] vị trí nhãn số; bỏ trống thì đặt giữa nóc khu
   do      (tùy chọn) đồ đạc, thiết bị: ['ban', x, z, rộng, sâu], ['ghe', x, z, rộng, sâu], ['may', x, z, rộng, cao, sâu],
           ['bon', x, z, bán kính, cao], ['ke', x0, x1, z0, z1, số tầng], ['thung', x, z, số cột, số hàng],
           ['pallet', x, z], ['bep', x, z, khoảng dời ống khói theo z], ['cui', x0, x1, z0, z1],
           ['gian', x0, x1, z0, z1], ['long', x0, x1, z0, z1]
   dept, role, req, basis: bộ phận phụ trách, công năng, yêu cầu, căn cứ bố trí (hiện ở bảng bên phải) */
const ZONES = [
  /* ---------- Giai đoạn 1: vùng nguyên liệu, gia công, xưởng có sẵn ---------- */
  { id: 'vung', n: 1, name: 'Vùng nguyên liệu, nhà vườn liên kết', kind: 'trees', phase: 1, box: [-42, -28, 1, 15], h: 6, noArea: true, dept: [D.vn],
    role: 'Nguồn nguyên liệu theo hợp đồng thu mua; nhật ký sản xuất và mã lô vườn nối với truy xuất nguồn gốc.',
    req: 'Hợp đồng thu mua, danh sách vùng nguyên liệu, nhật ký sản xuất; kiểm dư lượng từng lô.', basis: 'Luật ATTP 2010 Điều 19; slide 13.' },
  { id: 'toller', n: 2, name: 'Đơn vị gia công liên kết (ngoài khuôn viên)', kind: 'hall', phase: 1, until: 2, box: [-42, -30, -22, -11], h: 4.5, noArea: true, dept: [D.sx, D.qa],
    doors: [{ side: 'S', at: -34, w: 3 }],
    do: [['ban', -38.5, -18.5, 3, 1], ['ban', -33.5, -18.5, 3, 1], ['bep', -38, -14.5, 0], ['bep', -35.5, -14.5, 0]],
    role: 'GĐ1: phơi, sao, hàn túi kín theo hợp đồng; Heragrain duyệt chất lượng từng lô. GĐ2 chuyển dần về xưởng mới; từ GĐ3 giữ làm phương án dự phòng.',
    req: 'Đơn vị gia công có GCN ATTP hoặc HACCP; thẩm định trước khi ký hợp đồng.', basis: 'Slide 5; mô hình giai đoạn do tư vấn đề xuất.' },
  { id: 'nha', n: 3, name: 'Nhà ở gia đình (phòng 7)', kind: 'house', phase: 1, sanCo: true, box: [-5.5, 11, -15, -7.5], h: 6, wallH: 2.6, kt: 'uoc', dept: [],
    doors: [{ side: 'S', at: -1.5, w: 3.6 }, { side: 'N', at: -1.5, w: 3.6 }],
    do: [['ban', 6, -11.5, 2.2, 1], ['ghe', 6, -12.6, 2.2, 0.5], ['ghe', 8.8, -9, 2.4, 0.8]],
    role: 'Lối duy nhất vào xưởng có sẵn đi xuyên qua nhà. Vì vậy chỉ cho túi đã hàn kín và bao bì còn nguyên kiện đi qua; không mang nguyên liệu hay sản phẩm hở qua nhà.',
    req: 'Hàng qua nhà phải đóng kín, đi theo lối cố định, không để lại trong nhà.', basis: 'GB 14881 §3.2.2 (tách khu sinh hoạt với khu sản xuất); đề xuất của tư vấn.' },
  { id: 'wc1', n: 4, name: 'Nhà vệ sinh có sẵn (phòng 6)', kind: 'block', phase: 1, sanCo: true, box: [4, 10.5, -19.5, -15], h: 3.2, kt: 'uoc', dept: [D.hc],
    role: 'Dùng cho người làm ở xưởng có sẵn. Từ GĐ2 công nhân chế biến dùng nhà vệ sinh mới cạnh nhà ăn.',
    req: 'Cửa không mở thẳng vào kho hay khu đóng gói; có chỗ rửa tay.', basis: 'GB 14881 §5.1.5.3.' },
  { id: 'loidi', n: 5, name: 'Lối đi và cửa vào xưởng có sẵn', kind: 'path', phase: 1, sanCo: true, box: [-3.5, 0, -33.5, -19.5], h: 2.8, kt: 'uoc', pin: [-1.75, 3.5, -31], dept: [D.kho],
    role: 'Lối đi dọc phía tây xưởng (nét chấm trên bản vẽ) từ cửa vào xưởng đến cửa từng phòng; mọi hàng vào ra xưởng có sẵn đi trên lối này.',
    req: 'Giữ thông thoáng, không để hàng trên lối đi.', basis: 'Bản vẽ hiện trạng.' },
  { id: 'kbb', n: 6, name: 'Kho bao bì (phòng 1)', kind: 'hall', phase: 1, box: [0, 10, -24, -19.5], h: 4.2, wallH: 2, kt: 'uoc', dept: [D.kho],
    doors: [{ side: 'N', at: 8.5, w: 1.5 }, { side: 'W', at: -21.75, w: 1.2 }],
    do: [['ke', 1, 7.2, -23.6, -22.9, 2], ['pallet', 3, -20.4], ['pallet', 5, -20.4], ['thung', 7, -20.6, 2, 1]],
    role: 'Lưu hộp, thùng, nhãn in sẵn. Túi tiếp xúc trực tiếp với sản phẩm chỉ để dự trữ ở đây, phần dùng hằng ngày cất trong tủ ở khu sạch xưởng mới.',
    req: 'Bao bì để trên kệ, cách sàn, cách tường; tách khỏi hàng hóa khác.', basis: 'GB 14881 §5.1.8.3: lưu riêng bao bì.' },
  { id: 'dg', n: 7, name: 'Khu đóng gói thành phẩm (phòng 3)', kind: 'hall', phase: 1, box: [0, 5.5, -28.5, -24], h: 4.2, wallH: 2, kt: 'uoc', open: ['S'], dept: [D.kho, D.qa],
    doors: [{ side: 'N', at: 3.8, w: 1.2 }, { side: 'W', at: -26.75, w: 1.2 }, { side: 'E', at: -26.75, w: 1.2 }],
    do: [['ban', 3.2, -27.8, 3, 0.9], ['ban', 3.8, -25, 2.2, 0.9]],
    role: 'Nhận túi đã hàn kín, dán nhãn, đóng hộp quà, đóng thùng (bước 9). GĐ1 nhận hàng từ đơn vị gia công; từ GĐ2 nhận từ xưởng mới.',
    req: 'Không mở túi tại đây; nhãn đúng thị trường, mã lô khớp với túi.', basis: 'Slide 14, 20; xưởng có sẵn chỉ nhận thành phẩm đã đóng kín vì lối vào đi qua nhà ở.' },
  { id: 'dc', n: 8, name: 'Phòng dụng cụ đóng gói (phòng 4)', kind: 'hall', phase: 1, box: [0, 2, -26, -24], h: 3, wallH: 2, kt: 'uoc', open: ['W', 'S'], noFloor: true, noRoof: true, pin: [1, 4.6, -25], dept: [D.kho],
    doors: [{ side: 'N', at: 1.4, w: 0.8 }],
    do: [['ke', 0.2, 1.8, -25.8, -25.3, 2]],
    role: 'Cất máy dán nhãn, máy in date, băng keo, dao cắt thùng.',
    req: 'Dụng cụ có sổ theo dõi; dao, lưỡi cắt kiểm đếm đầu và cuối ca.', basis: 'Kiểm soát dị vật kim loại trong HACCP; đề xuất của tư vấn.' },
  { id: 'ktp', n: 9, name: 'Kho thành phẩm (phòng 2)', kind: 'hall', phase: 1, box: [5.5, 10, -28.5, -24], h: 4.2, wallH: 2, kt: 'uoc', open: ['W', 'S'], dept: [D.kho],
    doors: [{ side: 'N', at: 7.6, w: 1.4 }],
    do: [['ke', 6, 9.7, -28.2, -27.5, 3], ['pallet', 6.5, -25], ['pallet', 9.4, -25.6]],
    role: 'Lưu thùng thành phẩm trên pallet, xuất theo FIFO/FEFO, theo dõi nhiệt độ và độ ẩm kho (bước 10).',
    req: 'Mã lô và hồ sơ truy xuất; tách khỏi bao bì và hàng chờ kết quả.', basis: 'GB 14881 §5.1.8.1–5.1.8.4; Codex §4.4.8.' },
  { id: 'kdd', n: 10, name: 'Kho để đồ (nửa tây phòng 5)', kind: 'hall', phase: 1, box: [0, 5, -33.5, -28.5], h: 4.2, wallH: 2, kt: 'uoc', open: ['S', 'E'], dept: [D.hc],
    doors: [{ side: 'W', at: -31, w: 1.2 }],
    do: [['ke', 0.4, 4.6, -33.2, -32.5, 2], ['thung', 2.2, -30.6, 3, 2]],
    role: 'Đồ dùng chung, vật tư không tiếp xúc thực phẩm. Từ GĐ3 nửa phía đông ngăn ra làm phòng QC.',
    req: 'Không để hóa chất chung với bao bì, thành phẩm.', basis: 'GB 14881 §5.1.8.4.' },

  /* ---------- Giai đoạn 2: xưởng mới 17 × 10 m và các hạng mục phụ ---------- */
  { id: 'vp', n: 11, name: 'Phòng kế toán và họp', kind: 'hall', phase: 2, xay: true, box: [-4, 0, 0, 3], h: 4.5, wallH: 2, kt: 'phac', dept: [D.gd, D.hc, D.xk],
    doors: [{ side: 'E', at: 1.5, w: 1 }],
    do: [['ban', -2.2, 1.6, 2.2, 1.1], ['may', -3.6, 0.6, 0.5, 1.8, 0.9]],
    role: 'Kế toán, hồ sơ HACCP và truy xuất, tiếp khách và họp. Cửa mở ra hành lang nên khách không đi qua khu chế biến.',
    req: 'Lưu hồ sơ pháp lý, GS1, tự công bố, hồ sơ HACCP.', basis: 'Phác thảo xưởng mới (ô văn phòng 4 × 3 m); GB 14881 §3.2.2.' },
  { id: 'nghi', n: 12, name: 'Phòng nghỉ công nhân', kind: 'hall', phase: 2, xay: true, box: [-4, 0, 3, 8], h: 4.5, wallH: 2, kt: 'phac', open: ['N'], dept: [D.hc],
    doors: [{ side: 'E', at: 5.5, w: 1 }],
    do: [['ghe', -3.3, 5.5, 0.9, 3.6], ['ghe', -1.9, 5.5, 0.9, 3.6]],
    role: 'Chỗ nghỉ trưa cho công nhân, tách khỏi khu chế biến bằng hành lang và vách ngăn.',
    req: 'Không mang thức ăn, đồ cá nhân vào khu chế biến.', basis: 'Phác thảo (ô phòng nghỉ 4 × 5 m); GB 14881 §3.2.6.' },
  { id: 'thay', n: 13, name: 'Phòng thay bảo hộ, rửa tay', kind: 'hall', phase: 2, xay: true, box: [-4, 0, 8, 10], h: 4.5, wallH: 2, kt: 'phac', open: ['N'], dept: [D.qa],
    doors: [{ side: 'E', at: 9, w: 1 }],
    do: [['may', -3, 8.4, 1.6, 1.8, 0.5], ['bon', -1, 9.5, 0.25, 0.85]],
    role: 'Ô 4 × 2 m trên phác thảo vốn là nhà vệ sinh; đổi thành chỗ thay áo, mũ, ủng, cất đồ cá nhân và rửa tay trước khi vào khu chế biến. Nhà vệ sinh dời ra cạnh nhà ăn.',
    req: 'Vệ sinh cá nhân; khám sức khỏe và tập huấn công nhân.', basis: 'GB 14881 §5.1.5.1, §5.1.5.3; Codex §4.4.4.' },
  { id: 'hl', n: 14, name: 'Hành lang 2 m (lối người)', kind: 'hall', phase: 2, xay: true, box: [0, 2, 0, 10], h: 4.5, wallH: 2, kt: 'phac', open: ['W'], pin: [1, 6.4, 4.5], dept: [D.hc],
    doors: [{ side: 'N', at: 1, w: 1.6 }, { side: 'S', at: 1, w: 1.6 }, { side: 'E', at: 9, w: 1.2 }],
    role: 'Lối cho người: cửa bắc ra đường cho nhân viên và khách; cửa nam ra nhà phơi, nhà ăn. Thêm vách ngăn phía đông (phác thảo để mở) để hành lang không thông thẳng vào khu chế biến.',
    req: 'Không chuyển nguyên liệu, thành phẩm qua hành lang.', basis: 'Codex CAC/RCP 1 §4.2.1; GB 14881 §4.1.3.' },
  { id: 'tn', n: 15, name: 'Khu tiếp nhận nguyên liệu (khu bẩn)', kind: 'hall', phase: 2, xay: true, box: [2, 7.5, 0, 4], h: 4.5, wallH: 2, kt: 'de', open: ['W', 'S'], dept: [D.vn, D.qa],
    doors: [{ side: 'N', at: 4.75, w: 3 }],
    do: [['thung', 2.5, 0.7, 1, 4], ['may', 6.7, 0.9, 1, 0.8, 0.8], ['ban', 6.7, 2.9, 1.2, 0.8]],
    role: 'Cửa nhập riêng từ đường. Cân, lấy mẫu, kiểm cảm quan, gắn mã lô trước khi sơ chế (bước 1).',
    req: 'Kiểm dư lượng, kim loại nặng từng lô; lô không đạt để riêng, ghi rõ.', basis: 'Codex CAC/RCP 1 §4.2.1; GB 14881 §7.2.2.' },
  { id: 'sc', n: 16, name: 'Khu sơ chế (khu bẩn)', kind: 'hall', phase: 2, xay: true, box: [2, 7.5, 4, 10], h: 4.5, wallH: 2, kt: 'de', open: ['W', 'N'], dept: [D.sx],
    doors: [{ side: 'S', at: 4.75, w: 2 }, { side: 'E', at: 8.75, w: 1.2 }],
    do: [['may', 3.1, 5.4, 1, 0.9, 1.8], ['bon', 3.1, 7.4, 0.45, 0.9], ['ban', 6.3, 5.6, 1.6, 0.8], ['ban', 6.3, 7.2, 1.6, 0.8]],
    role: 'Rửa, phân loại, cắt (bước 2–3). Cửa nam đưa khay sang nhà phơi; không thông thẳng sang khu sạch.',
    req: 'Nước đạt quy chuẩn; thoát nước sàn riêng ra hố lắng.', basis: 'GB 14881 §4.1.3, §5.1.1–5.1.2; Luật ATTP Điều 19.' },
  { id: 'dem', n: 17, name: 'Phòng đệm vào khu sạch', kind: 'hall', phase: 2, box: [7.5, 9.5, 7.5, 10], h: 2.6, wallH: 2, kt: 'de', open: ['W', 'S'], noFloor: true, noRoof: true, pin: [8.5, 5.4, 8.75], dept: [D.qa],
    doors: [{ side: 'N', at: 8.5, w: 1 }],
    do: [['bon', 8, 9.5, 0.25, 0.85], ['may', 8.9, 8.4, 0.8, 0.12, 0.6]],
    role: 'Ô 2 × 2,5 m giữa khu bẩn và khu sạch: rửa tay, nhúng ủng, thay tạp dề. Người đi từ khu bẩn sang khu sạch bắt buộc qua đây.',
    req: 'Bồn rửa tay không chạm tay, xà phòng, khăn giấy.', basis: 'GB 14881 §5.1.5; Codex §5.2.4.' },
  { id: 'sach', n: 18, name: 'Khu sạch: làm nguội, chọn lọc, đóng túi', kind: 'hall', phase: 2, xay: true, box: [7.5, 13, 0, 10], h: 4.5, wallH: 2, kt: 'de', open: ['W'], pin: [9.2, 7, 5], dept: [D.sx, D.qa],
    doors: [{ side: 'N', at: 11, w: 2.4 }, { side: 'S', at: 11, w: 2 }],
    do: [['ban', 12.4, 8.3, 0.9, 2.4], ['ban', 8.6, 6, 0.9, 2.4], ['ban', 12.4, 5.4, 0.9, 1.6], ['may', 9.4, 1.6, 1.4, 1.1, 0.9], ['ban', 12.4, 1.6, 0.9, 1.4], ['may', 8, 3.6, 0.7, 1.8, 1.4]],
    role: 'Nhận trà từ khu sao, làm nguội, nhặt dị vật, cân, hàn miệng túi và in mã lô (bước 6, 8). Cửa xuất riêng ra đường; túi kín mang sang xưởng có sẵn.',
    req: 'Người và không khí đi từ sạch sang bẩn, không ngược lại; tủ túi bao bì đặt ngay trong khu.', basis: 'GB 14881 §4.1.3, §5.1.6.1.' },
  { id: 'sao', n: 19, name: 'Khu sao trà bếp củi', kind: 'hall', phase: 2, xay: true, box: [8, 13, 10, 14], h: 4.2, wallH: 2, kt: 'uoc', open: ['N'], dept: [D.sx],
    doors: [{ side: 'W', at: 12, w: 1.4 }],
    do: [['bep', 9.4, 13.2, 1.3], ['bep', 11.7, 13.2, 1.3], ['ban', 10.5, 10.8, 2.4, 0.7]],
    role: 'Sao trên chảo bếp củi (bước 5). Củi nạp và tro rút từ ngoài tường phía kho củi; ống khói cao hơn mái nên khói, tro không vào phòng sao. Cửa bắc mở thẳng vào khu sạch.',
    req: 'HACCP: nhiệt độ, thời gian sao, độ ẩm thành phẩm; theo dõi nhiễm khói (PAH) khi người mua yêu cầu.',
    basis: 'Codex CAC/RCP 68-2009 (giảm nhiễm PAH khi hun khói, sấy trực tiếp); phác thảo khu sao trà.' },
  { id: 'cui', n: 20, name: 'Kho củi', kind: 'woodshed', phase: 2, xay: true, box: [8, 13, 14, 16.5], h: 2.8, kt: 'de', pin: [10.5, 5, 15.6], dept: [D.sx],
    do: [['cui', 8.4, 12.7, 15.1, 16.2]],
    role: 'Lán củi có mái, sát mặt ngoài bếp sao để nạp củi; dùng chung cho bếp nhà ăn.',
    req: 'Củi khô, không sơn, không tẩm hóa chất; cách xa nhà phơi.', basis: 'Codex CAC/RCP 68-2009 (chọn nhiên liệu); đề xuất của tư vấn.' },
  { id: 'an', n: 21, name: 'Nhà ăn và bếp nấu', kind: 'hall', phase: 2, xay: true, box: [13, 18, 10, 14], h: 3.8, wallH: 2, kt: 'de', open: ['W'], dept: [D.hc],
    doors: [{ side: 'E', at: 12, w: 1.2 }],
    do: [['ban', 15.8, 11.4, 3, 0.9], ['ghe', 15.8, 10.65, 3, 0.35], ['ghe', 15.8, 12.15, 3, 0.35], ['bep', 13.9, 13.2, 0]],
    role: 'Nấu ăn cho công nhân, đặt sát khu sao trà như yêu cầu để dùng chung kho củi và cụm ống khói; ngăn với phòng sao bằng tường kín, cửa mở ra sân phía đông.',
    req: 'Thức ăn của công nhân không mang vào khu chế biến.', basis: 'GB 14881 §3.2.6: nhà ăn ngăn cách khu sản xuất.' },
  { id: 'wc', n: 22, name: 'Nhà vệ sinh công nhân', kind: 'block', phase: 2, xay: true, box: [13, 18, 14, 16.5], h: 3.2, kt: 'de', dept: [D.hc],
    role: 'Hai buồng vệ sinh và chỗ rửa tay, sát nhà ăn, cửa quay ra sân phía nam; không mở vào khu sao trà hay khu chế biến. Dùng chung bể tự hoại với nhà ăn.',
    req: 'Công nhân cởi tạp dề trước khi vào nhà vệ sinh, rửa tay trước khi quay lại xưởng.', basis: 'GB 14881 §5.1.5.3.' },
  { id: 'phoi', n: 23, name: 'Nhà phơi kín', kind: 'dryhouse', phase: 2, xay: true, box: [-3.5, 12.5, 18, 23], h: 3.6, wallH: 2.4, kt: 'uoc', dept: [D.sx],
    doors: [{ side: 'N', at: 4.75, w: 2 }, { side: 'N', at: 7.5, w: 1.6 }],
    do: [['gian', -2.8, 8.3, 19.6, 20.6], ['gian', -2.8, 8.3, 21.4, 22.4]],
    role: 'Phơi trà trên giàn (bước 4). Mái lấy sáng, vách lưới chắn côn trùng, giàn cách đất; hai cửa riêng: khay vào từ khu sơ chế, khay ra sang khu sao trà.',
    req: 'Không phơi trên sân đất; khay có nắp khi chuyển.', basis: 'GB 14881 §6.4 (kiểm soát côn trùng); phác thảo nhà phơi trà.' },
  { id: 'nuoc', n: 24, name: 'Bồn nước sạch, bể tự hoại, hố lắng', kind: 'utility', phase: 2, box: [18.5, 22, 10, 16.5], h: 4, kt: 'de', pin: [20, 7, 11.5], dept: [D.sx],
    role: 'Bồn nước có lọc cấp cho sơ chế và rửa tay; bể tự hoại cho nhà vệ sinh; hố lắng nước rửa trước khi xả.',
    req: 'Nước đạt quy chuẩn nước sạch sinh hoạt; xét nghiệm định kỳ.', basis: 'Luật ATTP Điều 19; GB 14881 §5.1.1, §5.1.2.5.' },
  { id: 'rac', n: 25, name: 'Điểm tập kết rác, bã', kind: 'bins', phase: 2, box: [-7.5, -4.5, 11, 13.5], h: 2.2, kt: 'de', open: ['E'], dept: [D.sx],
    role: 'Thùng có nắp cho rác, bã sau sơ chế; đặt góc tây nam, xa khu sạch và nhà phơi.',
    req: 'Đổ hằng ngày, rửa thùng định kỳ.', basis: 'GB 14881 §5.1.4, §6.5.2.' },

  /* ---------- Giai đoạn 3: đạt chuẩn, không xây thêm nhà ---------- */
  { id: 'qc', n: 26, name: 'Phòng QC, lưu mẫu, giữ lô (nửa đông phòng 5)', kind: 'hall', phase: 3, box: [5, 10, -33.5, -28.5], h: 4.2, wallH: 2, kt: 'uoc', open: ['S'], dept: [D.qa],
    doors: [{ side: 'W', at: -31, w: 1 }],
    do: [['ban', 7.4, -32.9, 3.6, 0.8], ['may', 9.5, -31.6, 0.6, 1.8, 1.2], ['long', 5.5, 8.6, -30.9, -29], ['thung', 5.9, -30.4, 3, 2]],
    role: 'Ngăn nửa đông kho để đồ: bàn kiểm, tủ lưu mẫu, khu rào giữ lô chờ kết quả kiểm nghiệm và mã GACC. Cửa thông sang kho thành phẩm. Mẫu gửi phòng thí nghiệm bên ngoài, không xây lab.',
    req: 'Chỉ xuất lô khi có kết quả đạt; hàng không đạt tách riêng, ghi rõ.', basis: 'GB 14881 §4.1.4, §7.2.2, §9.2–9.3; slide 7.' },
  { id: 'dkl', n: 27, name: 'Máy dò kim loại', kind: 'detector', phase: 3, box: [10.4, 11.6, 3, 6], h: 1.7, noArea: true, pin: [11.9, 4.6, 4.5], dept: [D.sx, D.qa],
    role: 'Đặt trên đường đi của sản phẩm trong khu sạch, trước máy hàn túi (bước 7). Lùi từ GĐ2 (theo bộ slide) sang GĐ3, khi xây HACCP, để giảm vốn ban đầu.',
    req: 'HACCP: CCP dò kim loại; thử mẫu chuẩn đầu ca.', basis: 'Slide 14.' },
  { id: 'cn', n: 28, name: 'Xuất khẩu: Trung Quốc', kind: 'cont', phase: 3, box: [15, 28, -7.3, -4.9], h: 3.2, noArea: true, pin: [21.5, 5.4, -6.1], dept: [D.xk],
    role: 'Xe container đón hàng ở đường trước nhà; lô đầu qua nhà nhập khẩu (GĐ3), sau đó tự chủ.',
    req: 'Mã GACC trên CIFER; nhãn tiếng Trung; HACCP/ISO 22000.', basis: 'Lệnh 280; slide 16–17.' },

  /* ---------- Giai đoạn 4: xuất khẩu, mở rộng ---------- */
  { id: 'say', n: 29, name: 'Buồng sấy bơm nhiệt', kind: 'equip', phase: 4, box: [9, 12, 18.8, 22.2], h: 2.4, noArea: true, pin: [10.5, 5.8, 20.5], dept: [D.sx],
    role: 'Đặt cuối nhà phơi, sấy thay phơi khi trời mưa để không chậm đơn hàng xuất khẩu.',
    req: 'Ghi nhiệt độ, độ ẩm từng mẻ.', basis: 'Đề xuất của tư vấn.' },
  { id: 'rao', n: 30, name: 'Hàng rào, cổng khóa, camera', kind: 'fence', phase: 4, box: [-9, 23.5, -1.2, 25.5], h: 2, noArea: true, pin: [-9, 4.5, 6], dept: [D.hc, D.kho],
    doors: [{ side: 'N', at: 1, w: 2.4 }, { side: 'N', at: 4.75, w: 4 }, { side: 'N', at: 11, w: 3.2 }],
    cams: [[-9, -1.2], [23.5, -1.2], [-9, 25.5], [23.5, 25.5], [7.9, -1.2], [-3.6, 17.6]],
    role: 'Rào lô xưởng mới, cổng có khóa ở mặt đường, camera ở cửa nhập, cửa xuất và nhà phơi.',
    req: 'Nhóm yêu cầu an ninh thực phẩm (food defence) trong BRCGS và FSSC 22000.', basis: 'Chưa đối chiếu bản tiêu chuẩn hiện hành; xác nhận theo phiên bản khi đánh giá.' },
  { id: 'eu', n: 31, name: 'Xuất khẩu: Châu Âu', kind: 'cont', phase: 4, box: [15, 28, -4.6, -2.2], h: 3.2, noArea: true, pin: [21.5, 5.4, -3.4], dept: [D.xk],
    role: 'Lô đầu sang EU kèm EUR.1; nhà nhập khẩu EU chịu trách nhiệm pháp lý.',
    req: 'BRCGS hoặc FSSC 22000 theo yêu cầu người mua; nhãn Quy định 1169/2011; EUR.1.', basis: 'CBI; Thông tư 11/2020/TT-BCT.' }
];

/* 10 bước quy trình: trà sao bếp củi; p = [x, z] vị trí số bước trên cảnh */
const STEPS = [
  { n: 1, name: 'Tiếp nhận, kiểm nguyên liệu', zone: 'tn', p: [3.6, 2.4] },
  { n: 2, name: 'Rửa, phân loại', zone: 'sc', p: [3.4, 6.4] },
  { n: 3, name: 'Cắt, tách', zone: 'sc', p: [6.3, 6.4] },
  { n: 4, name: 'Phơi trong nhà phơi kín', zone: 'phoi', p: [2.5, 21] },
  { n: 5, name: 'Sao trên bếp củi', zone: 'sao', p: [10.5, 13] },
  { n: 6, name: 'Làm nguội, chọn lọc', zone: 'sach', p: [12.4, 7.6] },
  { n: 7, name: 'Dò kim loại', zone: 'dkl', p: [11, 4.5] },
  { n: 8, name: 'Hàn túi kín, in mã lô', zone: 'sach', p: [9.6, 2.4] },
  { n: 9, name: 'Dán nhãn, đóng hộp, đóng thùng', zone: 'dg', p: [3, -27] },
  { n: 10, name: 'Kho thành phẩm, xuất hàng', zone: 'ktp', p: [7.8, -26] }
];

/* Tuyến luồng hàng: sáng khi khu need đang hoạt động; pts = các điểm [x, z] */
const ROUTES = [
  { id: 'gc1', need: 'toller', pts: [[-35, 1.5], [-35, -10.6]] },
  { id: 'gc2', need: 'toller', pts: [[-33, -10.6], [-33, -6.6], [-2.7, -6.6], [-2.7, -26.95], [0.4, -26.95]] },
  { id: 'in', need: 'tn', pts: [[-28.5, 8], [-26, -3.1], [4.75, -3.1], [4.75, 1.6]] },
  { id: 'sc', need: 'sc', pts: [[4.75, 1.6], [4.75, 7.2]] },
  { id: 'phoi', need: 'phoi', pts: [[4.75, 7.2], [4.75, 19.2]] },
  { id: 'sao', need: 'sao', pts: [[7.5, 19.2], [7.5, 12], [10.4, 12]] },
  { id: 'sach', need: 'sach', pts: [[10.4, 12], [11, 9.4], [11, 0.6]] },
  { id: 'out', need: 'sach', pts: [[11, 0.6], [11, -4.4], [-1.6, -4.4], [-1.6, -26.55], [0.4, -26.55]] },
  { id: 'kho', need: 'ktp', pts: [[0.4, -26.75], [7.4, -26.75]] },
  { id: 'xuat', need: 'ktp', pts: [[8.5, -25.6], [8.5, -21.75], [-0.5, -21.75], [-0.5, -5.6], [10.5, -5.6]] },
  { id: 'cn', need: 'cn', pts: [[10.5, -5.6], [14.6, -6.1]] },
  { id: 'eu', need: 'eu', pts: [[10.5, -5.6], [14.6, -3.4]] }
];

/* Mặt bằng: sân bê tông các lô và đường */
const MAT_BANG = {
  nen: [{ box: [-7, 12, -35, -7.5] }, { box: [-9.5, 24, -1.5, 26] }],
  duong: [{ box: [-52, 52, -7.5, -2] }]
};

/* Nhãn phụ trên mặt đất */
const NHAN_PHU = [
  { t: 'Đường liên thôn (giả định)', p: [-17, 0.3, -4.75] },
  { t: 'Sân trong nhà', p: [-4.6, 0.3, -17.2] },
  { t: 'Lô nhà ở và xưởng có sẵn', p: [-4, 0.3, -37] },
  { t: 'Lô xưởng mới', p: [24, 0.3, 21] }
];

/* Khung nhìn: bề rộng, chiều cao tối thiểu (mét) cần vừa màn hình */
const KHUNG = { w: 88, h: 60 };

/* Góc nhìn có sẵn: dir = hướng đặt camera, tgt = điểm nhìn, zoom = độ phóng */
const GOC_NHIN = {
  iso: { dir: [-1, 0.95, 1], tgt: [-3, 0, -5], zoom: 1, label: 'toàn cảnh' },
  plan: { dir: [0, 1, 0.02], tgt: [-6, 0, -5], zoom: 0.95, label: 'mặt bằng' },
  moi: { dir: [-0.85, 1, 1.1], tgt: [7, 0, 10], zoom: 2.3, label: 'xưởng mới' },
  cu: { dir: [-1, 1, 0.85], tgt: [4, 0, -23], zoom: 2.5, label: 'xưởng có sẵn' }
};

/* Phân tích: điều chỉnh so với phác thảo tay */
const DIEU_CHINH = [
  { t: 'Thêm vách ngăn hành lang.', d: 'Phác thảo để hành lang 2 m mở thẳng vào khu chế biến (nét đứt), văn phòng và phòng nghỉ cùng mở ra hành lang này. Thêm vách dọc nét đứt để khách họp, người nghỉ không đi qua khu chế biến.', cc: 'GB 14881 §3.2.2, §4.1.3' },
  { t: 'Ô nhà vệ sinh 4 × 2 m thành phòng thay bảo hộ.', d: 'Nhà vệ sinh dời ra sát khu sao trà, cạnh nhà ăn như yêu cầu, cửa quay ra sân. Ô cũ dùng để thay áo, ủng, rửa tay trước khi vào xưởng, không tốn thêm diện tích.', cc: 'GB 14881 §5.1.5' },
  { t: 'Tách cửa nhập nguyên liệu và cửa xuất thành phẩm.', d: 'Cả hai mở ra đường nhưng vào hai nửa khác nhau của khu chế biến; cửa hành lang chỉ cho người.', cc: 'Codex CAC/RCP 1 §4.2.1' },
  { t: 'Chia khu chế biến 11 × 10 m làm khu bẩn và khu sạch.', d: 'Khu bẩn (tiếp nhận, sơ chế) sát hành lang; khu sạch (làm nguội, chọn lọc, đóng túi) phía đông, sát cửa ra của sao trà. Sản phẩm đi một vòng khu bẩn → nhà phơi → sao trà → khu sạch, không quay ngược. Người sang khu sạch qua phòng đệm rửa tay.', cc: 'GB 14881 §4.1.3' },
  { t: 'Bếp sao nạp củi từ ngoài tường.', d: 'Miệng lò quay ra kho củi, ống khói cao hơn mái nên khói, tro không vào phòng sao. Bếp nhà ăn dùng chung kho củi.', cc: 'Codex CAC/RCP 68-2009' },
  { t: 'Nhà phơi kín thay cho phơi sân.', d: 'Mái lấy sáng, vách lưới chắn côn trùng, giàn cách đất; hai cửa riêng cho khay vào và khay ra.', cc: 'GB 14881 §6.4' },
  { t: 'Xưởng có sẵn chỉ nhận túi đã hàn kín.', d: 'Vì lối vào đi qua nhà ở, mọi công đoạn để hở sản phẩm làm ở xưởng mới; xưởng có sẵn dán nhãn, đóng hộp, đóng thùng, lưu kho. Túi tiếp xúc sản phẩm cất ngay trong khu sạch.', cc: 'GB 14881 §5.1.8' },
  { t: 'Giai đoạn 3, 4 không xây thêm nhà.', d: 'Ngăn nửa đông kho để đồ làm phòng QC, lưu mẫu, giữ lô; mẫu gửi phòng thí nghiệm bên ngoài. Máy dò kim loại lùi sang GĐ3, buồng sấy bơm nhiệt đặt trong nhà phơi ở GĐ4.', cc: 'Tối ưu vốn' }
];

/* Giả định cần HTX xác nhận */
const CAN_XAC_NHAN = [
  'Vị trí xưởng mới: sơ đồ đặt xưởng mới bên kia đường, đối diện nhà ở, theo thứ tự trong ảnh tổng quan. Nếu xưởng mới nằm cạnh hoặc sau nhà, cần dời lô và tuyến đi.',
  'Kích thước xưởng có sẵn, nhà ở, nhà vệ sinh có sẵn, khu sao trà và nhà phơi ước từ ảnh vẽ tay, khoảng 2 m mỗi ô vở; chỉ xưởng mới 17 × 10 m có số đo.',
  'Sản phẩm sao bếp củi là loại trà gì, và các sản phẩm sấy trong bộ slide (sầu riêng, chanh dây, gừng, mãng cầu) làm ở xưởng mới hay vẫn thuê gia công. Điều này quyết định điểm kiểm soát tới hạn và chỉ tiêu kiểm nghiệm.',
  'Sức chứa: nhà ăn và phòng nghỉ mỗi nơi 20 m², hợp khoảng 10–15 người một lượt. Bộ slide dự kiến 28–40 người ở GĐ4 nên cần ăn chia ca hoặc chốt lại nhân sự theo công suất.',
  'Nguồn nước (giếng khoan hay nước máy) và nơi xả nước thải sau hố lắng.'
];

window.HERAGRAIN = { PH, D, ZONES, STEPS, ROUTES, MAT_BANG, NHAN_PHU, KHUNG, GOC_NHIN, DIEU_CHINH, CAN_XAC_NHAN };
})();
