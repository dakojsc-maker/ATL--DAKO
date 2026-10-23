/* Dữ liệu nhà máy Heragrain: 4 giai đoạn, các khu, 10 bước quy trình, tuyến luồng.
   Sửa nội dung, thêm hoặc dời khu ở file này; nha-may.js chỉ đọc dữ liệu để dựng cảnh 3D.
   Nguồn: bộ slide tai-lieu/Heragrain_Lo-trinh-dau-tu-giai-doan-dau.pptx (slide 4–9, 14, 15). */
(function () {
"use strict";

/* 4 giai đoạn (slide 4–8) */
const PH = [
  { n: 1, name: 'Giai đoạn 1 · Thu mua', tab: 'Thu mua', when: 'Q4/2026 – Q1/2027', people: '9–12 người',
    model: 'Heragrain tự thu mua; chế biến thuê gia công liên kết.',
    cert: 'Đăng ký HTX, mã số mã vạch GS1, tự công bố sản phẩm.',
    goal: 'Chọn đơn vị gia công, chốt địa điểm xưởng riêng.' },
  { n: 2, name: 'Giai đoạn 2 · Chế biến', tab: 'Chế biến', when: 'Q2 – Q3/2027', people: '19–27 người',
    model: 'Có xưởng riêng, tự chế biến; chuyển dần từ gia công.',
    cert: 'Giấy chứng nhận cơ sở đủ điều kiện ATTP (NĐ 15/2018), hoặc miễn khi đã có HACCP/ISO 22000; xây HACCP.',
    goal: 'Dây chuyền ổn định, truy xuất đến nhà vườn.' },
  { n: 3, name: 'Giai đoạn 3 · Sản xuất đạt chuẩn', tab: 'Đạt chuẩn xuất khẩu', when: 'Q4/2027 – Q1/2028', people: '25–35 người',
    model: 'Xưởng đủ điều kiện xin mã GACC; xuất qua nhà nhập khẩu Trung Quốc.',
    cert: 'HACCP/ISO 22000 do tổ chức độc lập chứng nhận; mã GACC trên CIFER (Lệnh 280).',
    goal: 'Lô đầu sang Trung Quốc thông quan.' },
  { n: 4, name: 'Giai đoạn 4 · Xuất khẩu', tab: 'Xuất khẩu', when: 'từ Q2/2028', people: '28–40 người',
    model: 'Tự chủ xuất khẩu Trung Quốc và Châu Âu; Châu Á xét sau.',
    cert: 'BRCGS hoặc FSSC 22000; EUR.1 hưởng thuế EVFTA.',
    goal: 'Lô đầu sang EU kèm EUR.1.' }
];

/* 7 bộ phận (slide 9, 12) */
const D = { gd: 'Giám đốc điều hành', sx: 'Sản xuất và kỹ thuật', qa: 'QA/QC và ATTP', vn: 'Vùng nguyên liệu, TXNG', kho: 'Kho và logistics', xk: 'Xuất khẩu, thị trường', hc: 'Hành chính, kế toán' };

/* Mỗi khu:
   id     mã khu, dùng trong STEPS và ROUTES
   n      số hiện trên nhãn và trong danh sách
   kind   kiểu dựng: hall (nhà xưởng có tường, mái trong), block (khối nhà kín), canopy (mái che),
          gate, shed, tanks, cage, cont (container), equip, fence, trees, pad (đất trống)
   phase  giai đoạn bắt đầu hoạt động (1–4; 5 = dự trữ sau giai đoạn 4)
   until  (tùy chọn) giai đoạn cuối còn chạy chính; sau đó chuyển sang dự phòng
   box    [x0, x1, z0, z1]: x theo hướng dòng chảy từ tây sang đông, z từ bắc xuống nam
   h      chiều cao
   doors  (tùy chọn) lối đi trổ trên tường {side: N/S/W/E, at: tọa độ tâm lối, w: bề rộng}
   pin    (tùy chọn) [x, y, z] vị trí nhãn số; bỏ trống thì đặt giữa nóc khu
   dept, role, req, basis: bộ phận phụ trách, công năng, yêu cầu, căn cứ bố trí (hiện ở bảng bên phải) */
const ZONES = [
  { id: 'vung', n: 1, name: 'Vùng nguyên liệu, nhà vườn liên kết', kind: 'trees', phase: 1, box: [-126, -96, -12, 26], h: 6, pin: [-111, 9, -2], dept: [D.vn],
    role: 'Nguồn trái cây theo hợp đồng thu mua; nhật ký sản xuất và mã lô vườn nối với truy xuất nguồn gốc.',
    req: 'Hợp đồng thu mua, danh sách vùng nguyên liệu, nhật ký sản xuất.', basis: 'Luật ATTP 2010 Điều 19: lưu hồ sơ nguồn gốc nguyên liệu.' },
  { id: 'gate', n: 2, name: 'Cổng chính và trạm cân xe', kind: 'gate', phase: 1, box: [-86, -64, 6, 16], h: 4.5, pin: [-75, 8, 11], dept: [D.kho],
    role: 'Cân xe nhận hàng, ghi biển số, kiểm soát người và xe vào khu nhà máy; cổng riêng cho xe nguyên liệu.',
    req: 'Ghi khối lượng từng lô nhận để truy xuất.', basis: 'Đề xuất của tư vấn.' },
  { id: 'recv', n: 3, name: 'Khu tiếp nhận nguyên liệu (mái che)', kind: 'canopy', phase: 1, box: [-62, -44, -14, 14], h: 7, pin: [-53, 9, 8], dept: [D.vn, D.kho],
    role: 'Dỡ hàng, lấy mẫu, kiểm cảm quan và dư lượng nhanh trước khi nhập kho (bước 1).',
    req: 'Kiểm nghiệm dư lượng và kim loại nặng từng lô trước khi nhận; mỗi lô gắn một mã lô duy nhất.',
    basis: 'Codex CAC/RCP 1 §4.2.1: dòng chảy có trật tự từ khi nguyên liệu về; GB 14881 §7.2.2: nguyên liệu không đạt phải tách riêng và ghi rõ.' },
  { id: 'qc1', n: 4, name: 'Phòng QC tiếp nhận', kind: 'hall', phase: 1, box: [-62, -52, 18, 26], h: 5, pin: [-57, 7, 22], dept: [D.qa],
    role: 'Lấy mẫu, đo độ ẩm, đánh giá cảm quan; gửi mẫu dư lượng đến phòng kiểm nghiệm bên ngoài.',
    req: 'Kiểm nghiệm tại chỗ hoặc qua cơ quan kiểm nghiệm đủ năng lực.', basis: 'GB 14881 §9.1–9.2; phòng kiểm tra tách khỏi khu sản xuất (§4.1.4).' },
  { id: 'rawst', n: 5, name: 'Kho nguyên liệu mát', kind: 'hall', phase: 1, box: [-44, -26, -22, 16], h: 9, dept: [D.kho],
    doors: [{ side: 'W', at: -4, w: 8 }, { side: 'E', at: -4, w: 8 }],
    role: 'Lưu tạm nguyên liệu đã nhận, thông gió, xếp theo lô, xuất theo FIFO. Giai đoạn 1: chuyển nguyên liệu đi gia công.',
    req: 'Lưu riêng nguyên liệu, bán thành phẩm, thành phẩm và bao bì.', basis: 'GB 14881 §5.1.8.3–5.1.8.4; Codex §4.4.8 (lưu kho, luân chuyển hàng).' },
  { id: 'office', n: 6, name: 'Khối văn phòng điều hành (2 tầng)', kind: 'block', phase: 1, box: [-44, -24, 32, 46], h: 11, dept: [D.gd, D.hc, D.xk, D.qa],
    role: 'Giám đốc điều hành, hành chính kế toán, xuất khẩu và thị trường, hồ sơ QA và truy xuất. Đặt phía trước, tách khỏi khu sản xuất.',
    req: 'Hồ sơ pháp lý, GS1, tự công bố, hồ sơ HACCP và truy xuất lưu tại đây.', basis: 'GB 14881 §3.2.2: chia khu chức năng bằng khoảng cách hoặc vách ngăn.' },
  { id: 'toller', n: 7, name: 'Đơn vị gia công liên kết (ngoài khuôn viên)', kind: 'hall', phase: 1, until: 2, box: [-114, -92, 28, 46], h: 8, dept: [D.sx, D.qa],
    doors: [{ side: 'N', at: -100, w: 6 }],
    role: 'Giai đoạn 1: sấy và đóng gói theo hợp đồng, Heragrain giữ quyền duyệt chất lượng. Giai đoạn 2: chuyển dần sang tự chế biến. Từ giai đoạn 3: giữ làm phương án dự phòng.',
    req: 'Đơn vị gia công phải có ATTP/HACCP; thẩm định trước khi ký hợp đồng.', basis: 'Mô hình giai đoạn do tư vấn đề xuất.' },
  { id: 'prep', n: 8, name: 'Khu sơ chế (khu nguy cơ cao)', kind: 'hall', phase: 2, box: [-26, -6, -22, 16], h: 9, dept: [D.sx],
    doors: [{ side: 'W', at: -4, w: 8 }, { side: 'E', at: -4, w: 8 }],
    role: 'Rửa, phân loại, gọt, tách, cắt và xử lý trước khi sấy (bước 2–4). Nước sạch đạt chuẩn, thoát nước riêng.',
    req: 'Cơ sở đủ điều kiện ATTP theo NĐ 15/2018 (hoặc miễn khi có HACCP/ISO 22000); HACCP.',
    basis: 'GB 14881 §4.1.3 (phân khu theo mức sạch), §5.1.1–5.1.2 (nước, thoát nước); Luật ATTP Điều 19 (nước đạt quy chuẩn).' },
  { id: 'dry1', n: 9, name: 'Khu sấy, dây chuyền 1', kind: 'hall', phase: 2, box: [-6, 16, -22, 16], h: 10, dept: [D.sx],
    doors: [{ side: 'W', at: -4, w: 8 }, { side: 'E', at: -4, w: 8 }],
    role: 'Sấy sản phẩm (bước 5); điểm kiểm soát tới hạn là nhiệt độ và độ ẩm. Nhà sấy chừa sẵn chỗ cho dây chuyền 2.',
    req: 'HACCP: CCP nhiệt độ, độ ẩm.', basis: 'Quy trình 10 bước trong bộ slide; GB 14881 §4.1.5: diện tích khớp công suất.' },
  { id: 'airlock', n: 10, name: 'Phòng thay bảo hộ và phòng đệm', kind: 'hall', phase: 2, box: [16, 28, 16, 26], h: 5, pin: [22, 7, 21], dept: [D.qa],
    doors: [{ side: 'N', at: 22, w: 5 }],
    role: 'Lối vào khu sạch: thay đồ bảo hộ, rửa và sát khuẩn tay, qua phòng đệm. Nhà vệ sinh không mở thẳng vào khu sản xuất.',
    req: 'Vệ sinh cá nhân; khám sức khỏe và tập huấn công nhân.',
    basis: 'GB 14881 §5.1.5.1, §5.1.5.3, §5.1.5.4; Codex §4.4.4 và §5.2.4 (phòng thay đồ khi rủi ro cao).' },
  { id: 'clean', n: 11, name: 'Khu sạch (nguy cơ thấp)', kind: 'hall', phase: 2, box: [16, 50, -22, 16], h: 8, dept: [D.sx, D.qa],
    doors: [{ side: 'W', at: -4, w: 8 }, { side: 'E', at: -4, w: 8 }, { side: 'N', at: 33, w: 6 }, { side: 'S', at: 22, w: 5 }],
    role: 'Làm nguội, chọn lọc, dò kim loại, đóng gói kín hút chân không, dán nhãn gắn mã lô (bước 6–9). Khí đi từ khu sạch sang khu kém sạch, không ngược lại.',
    req: 'HACCP: CCP dò kim loại; mã lô nối với truy xuất.',
    basis: 'GB 14881 §4.1.3, §5.1.6.1; Vikan: khí đi từ khu thành phẩm về phía khu nguyên liệu.' },
  { id: 'pack', n: 12, name: 'Kho bao bì và nhãn', kind: 'hall', phase: 2, box: [24, 42, -36, -22], h: 7, pin: [33, 9, -29], dept: [D.kho],
    doors: [{ side: 'S', at: 33, w: 6 }],
    role: 'Lưu túi, thùng, nhãn tách khỏi nguyên liệu; cửa thông sang khu đóng gói để không đi qua khu sơ chế.',
    req: 'Nhãn đúng thị trường; bao bì theo PPWR khi vào EU.', basis: 'GB 14881 §5.1.8.3: lưu riêng bao bì.' },
  { id: 'fg', n: 13, name: 'Kho thành phẩm', kind: 'hall', phase: 2, box: [50, 70, -22, 16], h: 9, dept: [D.kho],
    doors: [{ side: 'W', at: -4, w: 8 }, { side: 'E', at: -4, w: 8 }],
    role: 'Lưu thành phẩm đã đóng gói, xếp pallet, xuất theo FIFO/FEFO, kiểm soát nhiệt độ và độ ẩm kho (bước 10).',
    req: 'Mã lô và hồ sơ truy xuất; lưu riêng với nguyên liệu và bao bì.', basis: 'GB 14881 §5.1.8.1–5.1.8.4; Codex §4.4.8.' },
  { id: 'welfare', n: 14, name: 'Nhà phúc lợi công nhân', kind: 'block', phase: 2, box: [-6, 14, 34, 46], h: 6, dept: [D.hc],
    role: 'Nhà ăn, nhà vệ sinh, tủ đồ cá nhân; cách khu sản xuất, công nhân đi vào qua phòng thay bảo hộ.',
    req: 'Vệ sinh cá nhân; khám sức khỏe công nhân.', basis: 'GB 14881 §3.2.6: nhà ăn và khu nghỉ cách xa hoặc ngăn cách khu sản xuất; §5.1.5.3.' },
  { id: 'util', n: 15, name: 'Khu tiện ích (điện, khí nén, nước)', kind: 'shed', phase: 2, box: [-6, 16, -44, -30], h: 6, dept: [D.sx],
    role: 'Máy phát điện dự phòng, máy nén khí, bồn nước sạch; đặt sau nhà sấy để gần máy sấy.',
    req: 'Nước đạt quy chuẩn kỹ thuật.', basis: 'Luật ATTP Điều 19; GB 14881 §5.1.1; vị trí do tư vấn đề xuất.' },
  { id: 'waste', n: 16, name: 'Khu tập kết rác và phế phẩm hữu cơ', kind: 'shed', phase: 2, box: [-30, -14, -44, -30], h: 4, dept: [D.sx],
    role: 'Vỏ, hạt, phế phẩm sau sơ chế đưa ra ngoài bằng đường riêng ở phía bắc, không đi qua khu thành phẩm.',
    req: 'Hệ thống xử lý chất thải vận hành thường xuyên.', basis: 'GB 14881 §5.1.4, §6.5.2; Luật ATTP Điều 19.' },
  { id: 'wwtp', n: 17, name: 'Trạm xử lý nước thải', kind: 'tanks', phase: 2, box: [-72, -50, -46, -26], h: 5, pin: [-61, 7, -36], dept: [D.sx],
    role: 'Thu gom, lắng, xử lý nước thải rửa trước khi xả; đặt ở góc phía đầu nguyên liệu, xa kho thành phẩm.',
    req: 'Xử lý nước thải đạt yêu cầu trước khi xả.', basis: 'GB 14881 §5.1.2.5; Luật ATTP Điều 19.' },
  { id: 'lab', n: 18, name: 'Phòng QC/lab và lưu mẫu', kind: 'hall', phase: 3, box: [50, 62, 18, 28], h: 5, pin: [56, 7, 23], dept: [D.qa],
    role: 'Kiểm nghiệm đầu ra từng lô, lưu mẫu, giữ hồ sơ kết quả; tách khỏi khu sản xuất.',
    req: 'Kiểm nghiệm đầu ra từng lô trước khi chạy lô đầu sang Trung Quốc.', basis: 'GB 14881 §4.1.4, §9.2–9.3 (nhân sự đủ năng lực, lưu mẫu).' },
  { id: 'hold', n: 19, name: 'Khu giữ lô chờ kết quả kiểm nghiệm', kind: 'cage', phase: 3, box: [52, 60, -20, -8], h: 3.6, pin: [56, 6, -14], dept: [D.qa],
    role: 'Lô thành phẩm dừng tại đây đến khi có kết quả đạt và mã GACC; hàng không đạt tách riêng, ghi rõ.',
    req: 'Chỉ xuất lô đầu khi có mã GACC và kết quả kiểm nghiệm đạt.', basis: 'Quy tắc xuất lô đầu trong bộ slide; tương tự GB 14881 §7.2.2.' },
  { id: 'dock', n: 20, name: 'Khu đóng thùng và xuất hàng', kind: 'hall', phase: 3, box: [70, 86, -22, 16], h: 8, dept: [D.kho, D.xk],
    doors: [{ side: 'W', at: -4, w: 8 }, { side: 'E', at: -14, w: 6 }, { side: 'E', at: -4, w: 6 }, { side: 'E', at: 6, w: 6 }],
    role: 'Đóng thùng, dán nhãn tiếng Trung và mã GACC, soạn chứng từ, bốc hàng lên container; cửa xuất tách khỏi cửa nhận nguyên liệu.',
    req: 'Nhãn tiếng Trung, mã GACC, khai báo lô hàng.', basis: 'Lệnh 280: mã đăng ký in trên bao bì; tách cửa nhận và cửa xuất do tư vấn đề xuất.' },
  { id: 'cn', n: 21, name: 'Xuất khẩu: Trung Quốc', kind: 'cont', phase: 3, box: [90, 106, -14, -3], h: 3, pin: [98, 6, -9], dept: [D.xk],
    role: 'Lô đầu sang Trung Quốc qua nhà nhập khẩu (giai đoạn 3), sau đó tự chủ (giai đoạn 4).',
    req: 'Mã GACC trên CIFER; HACCP/ISO 22000.', basis: 'Lệnh 280 (SFA Singapore, China Briefing).' },
  { id: 'dry2', n: 22, name: 'Dây chuyền sấy 2 (mở rộng công suất)', kind: 'equip', phase: 4, box: [-2, 13, 5, 14], h: 4.5, pin: [5.5, 9, 9.5], dept: [D.sx],
    role: 'Lắp thêm dây chuyền khi đơn hàng ổn định; chỗ đã chừa sẵn trong nhà sấy.',
    req: 'Mở rộng công suất sau khi có đơn hàng EU ổn định.', basis: 'Đề xuất của tư vấn; GB 14881 §4.1.5.' },
  { id: 'sec', n: 23, name: 'Hàng rào, cổng kiểm soát ra vào, camera', kind: 'fence', phase: 4, box: [-88, 92, -50, 52], h: 6, pin: [-88, 8, 30], dept: [D.hc, D.kho],
    role: 'Kiểm soát người và xe ra vào, camera ở cổng, kho và khu nhận; chống xâm nhập cố ý.',
    req: 'Nhóm yêu cầu an ninh thực phẩm (food defence) trong BRCGS và FSSC 22000.', basis: 'Chưa đối chiếu bản tiêu chuẩn hiện hành; xác nhận theo phiên bản khi đánh giá.' },
  { id: 'eu', n: 24, name: 'Xuất khẩu: Châu Âu', kind: 'cont', phase: 4, box: [90, 106, 1, 12], h: 3, pin: [98, 6, 6], dept: [D.xk],
    role: 'Lô đầu sang EU kèm EUR.1 (giai đoạn 4); nhà nhập khẩu EU chịu trách nhiệm pháp lý.',
    req: 'BRCGS hoặc FSSC 22000 theo yêu cầu người mua; nhãn Quy định 1169/2011; EUR.1.', basis: 'CBI; Thông tư 11/2020/TT-BCT.' },
  { id: 'land', n: 25, name: 'Đất dự trữ mở rộng (sau giai đoạn 4)', kind: 'pad', phase: 5, box: [52, 90, 24, 48], h: 0.3, pin: [71, 2, 36], dept: [],
    role: 'Chừa sẵn cho sản phẩm mới, Châu Á hoặc mở rộng kho; không xây trong 4 giai đoạn đầu.',
    req: 'Không có.', basis: 'Đề xuất của tư vấn.' }
];

/* 10 bước quy trình (cùng thứ tự với slide 14); p = [x, z] vị trí số bước trên cảnh */
const STEPS = [
  { n: 1, name: 'Tiếp nhận, kiểm nguyên liệu', zone: 'recv', p: [-53, -4] },
  { n: 2, name: 'Rửa, phân loại', zone: 'prep', p: [-22, -4] },
  { n: 3, name: 'Gọt, tách, cắt', zone: 'prep', p: [-16, -4] },
  { n: 4, name: 'Xử lý trước khi sấy', zone: 'prep', p: [-10, -4] },
  { n: 5, name: 'Sấy', zone: 'dry1', p: [5.5, -4] },
  { n: 6, name: 'Làm nguội, chọn lọc', zone: 'clean', p: [25, -4] },
  { n: 7, name: 'Dò kim loại', zone: 'clean', p: [33, -4] },
  { n: 8, name: 'Đóng gói kín, hút chân không', zone: 'clean', p: [39, -4] },
  { n: 9, name: 'Dán nhãn, gắn mã lô', zone: 'clean', p: [45, -4] },
  { n: 10, name: 'Kho thành phẩm, xuất hàng', zone: 'fg', p: [60, -4] }
];

/* Tuyến luồng: hiện sáng khi khu đích (need) đang hoạt động (mới hoặc đang chạy); pts = các điểm [x, z] */
const ROUTES = [
  { id: 'in', need: 'recv', pts: [[-112, 11], [-70, 11], [-56, -4]] },
  { id: 'raw', need: 'rawst', pts: [[-56, -4], [-35, -4]] },
  { id: 'prep', need: 'prep', pts: [[-35, -4], [-6, -4]] },
  { id: 'dry', need: 'dry1', pts: [[-6, -4], [16, -4]] },
  { id: 'clean', need: 'clean', pts: [[16, -4], [50, -4]] },
  { id: 'fg', need: 'fg', pts: [[50, -4], [70, -4]] },
  { id: 'dock', need: 'dock', pts: [[70, -4], [86, -4]] },
  { id: 'cn', need: 'cn', pts: [[86, -4], [98, -8]] },
  { id: 'eu', need: 'eu', pts: [[86, -4], [98, 6]] },
  { id: 'toller', need: 'toller', pts: [[-56, -4], [-62, 3], [-70, 11], [-100, 11], [-100, 27]] }
];

/* Ranh giới khuôn viên nhà máy (sân bê tông, hàng rào) */
const SITE = { x0: -88, x1: 92, z0: -50, z1: 52 };

window.HERAGRAIN = { PH, D, ZONES, STEPS, ROUTES, SITE };
})();
