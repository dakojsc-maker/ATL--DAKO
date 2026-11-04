/* Dữ liệu sơ đồ 3D xưởng ca cao Heragrain: xưởng cũ (5 phòng, lối đi phía tây, vào qua nhà ở và sân sau) được bố trí lại
   thành dây chuyền ca cao một chiều: kho hạt → rang, tách vỏ → nibs, nghiền, ép → khu sạch socola → kho mát → xuất hàng.
   Sửa nội dung, thêm hoặc dời khu ở file này; nha-may.js chỉ đọc dữ liệu để dựng cảnh 3D.
   Đơn vị: mét. Tọa độ giữ đúng hệ tọa độ riêng của ảnh vẽ tay xưởng cũ (như heragrain-3d), không dời.
   Nguồn hiện trạng: ba ảnh phác thảo tay của HTX (phiên Sơ đồ 3D nhà máy Heragrain); quy trình ca cao theo mô tả của HTX. */
(function () {
"use strict";

/* 4 giai đoạn của dòng ca cao */
const PH = [
  { n: 1, name: 'Giai đoạn 1 · Hàng thô', tab: 'Hàng thô (nibs)', when: 'Q1 – Q2/2027', people: '9–10 người',
    model: 'Thu mua hạt ca cao đã lên men, phơi khô từ nông hộ và HTX; kiểm nhận, làm sạch, rang theo tiêu chuẩn, nghiền vỡ, tách vỏ. Bán hạt rang và nibs (nhân ca cao) cho nhà máy socola, công ty bánh kẹo; gửi mẫu chào đơn vị xuất khẩu.',
    cert: 'Bổ sung ngành nghề HTX (1073, 4632); GCN cơ sở đủ điều kiện ATTP; tự công bố hạt rang, nibs; mã số mã vạch GS1; nộp đơn nhãn hiệu; đăng ký môi trường; hồ sơ PCCC.',
    build: 'Không xây mới. Lợp mái sân sau và lối đi; ngăn phòng 6 thành nhà vệ sinh và phòng thay bảo hộ; phòng 1 kho hạt và làm sạch; phòng 2 rang, tách vỏ (chụp hút, ống khói qua mái); phòng 3 phân cỡ, đóng gói nibs; nửa đông phòng 5 kho thành phẩm.',
    goal: 'Hợp đồng thu mua với HTX trồng ca cao; lô nibs đạt kiểm nghiệm; khách B2B đầu tiên.' },
  { n: 2, name: 'Giai đoạn 2 · Socola', tab: 'Socola', when: 'Q3 – Q4/2027', people: '15–17 người',
    model: 'Nghiền mịn nibs với đường thành khối ca cao và socola đen; tôi, đổ khuôn, làm lạnh, gói. Bán socola thanh 70–100% trong nước, giữ kênh bán nibs.',
    cert: 'Tự công bố socola; nhãn theo NĐ 37/2026; kiểm nghiệm định kỳ; bắt đầu xây HACCP.',
    build: 'Nửa tây phòng 5 thành khu sạch socola: trần kín, điều hòa 18–20 °C; vách ngăn và trạm rửa tay ở đầu bắc lối đi; 3 máy nghiền đá (melanger) dọc tường bắc phòng 3.',
    goal: 'Socola đen ổn định chất lượng; có điểm bán và kênh thương mại điện tử.' },
  { n: 3, name: 'Giai đoạn 3 · Bột, bơ ca cao, đạt chuẩn', tab: 'Bột, bơ · HACCP', when: 'Q1 – Q2/2028', people: '18–22 người',
    model: 'Ép khối ca cao tách bơ ca cao và bánh ca cao; nghiền, rây bánh thành bột ca cao nguyên chất. Áp dụng HACCP hoặc ISO 22000 cho toàn xưởng.',
    cert: 'HACCP hoặc ISO 22000:2018 do tổ chức độc lập chứng nhận; tự công bố bột, bơ ca cao; OCOP (tùy chọn).',
    build: 'Máy ép thủy lực, máy nghiền bột và rây trong phòng 3; máy dò kim loại trong khu sạch; ngăn góc tây bắc kho thành phẩm làm phòng QC, tủ lưu mẫu.',
    goal: 'Đủ 4 dòng nibs, socola, bột, bơ; hệ thống chất lượng được chứng nhận.' },
  { n: 4, name: 'Giai đoạn 4 · Mix vị, xuất khẩu', tab: 'Mix vị · Xuất khẩu', when: 'từ Q3/2028', people: '24–30 người',
    model: 'Socola mix vị đặc sản Tây Nguyên (cà phê Robusta, tiêu, mắc ca, trái cây sấy Heragrain); trà vỏ ca cao; hộp quà. Xuất khẩu qua nhà nhập khẩu Trung Quốc, EU.',
    cert: 'FSSC 22000 hoặc BRCGS theo người mua; hồ sơ EUDR; đăng ký GACC nếu bán Trung Quốc; C/O EUR.1 hoặc mẫu E; tùy chọn hữu cơ, Rainforest Alliance, Fairtrade.',
    build: 'Nồi bao (panning) bọc socola trong khu sạch; tủ sấy vỏ ca cao làm trà ở phòng rang; góc trưng bày, nếm thử ở phòng trước nhà ở (nếu gia đình đồng ý).',
    goal: 'Lô xuất khẩu đầu tiên; 6–8 sản phẩm chủ lực.' }
];

/* 8 bộ phận */
const D = { gd: 'Ban điều hành', tm: 'Thu mua, vùng nguyên liệu', sx: 'Sản xuất', qa: 'QA/QC và ATTP', rd: 'R&D sản phẩm', kho: 'Kho và logistics', kd: 'Kinh doanh, xuất khẩu', hc: 'Hành chính, kế toán' };

/* Mỗi khu:
   id, n, name     mã, số nhãn, tên
   kind            hall (phòng tường thấp, mái trong), block (khối kín), house (nhà ở mái dốc), door (cửa lớn), cont (xe),
                   detector (máy dò kim loại), cacao (vườn ca cao), lenmen (thùng ủ, giàn phơi của HTX),
                   thietbi (chỉ vẽ thiết bị khai báo trong do, dùng cho máy lắp thêm ở giai đoạn sau)
   phase, sanCo    giai đoạn bắt đầu hoạt động; công trình có sẵn
   box             [x0, x1, z0, z1] mét: x tây → đông, z bắc → nam; h chiều cao; wallH chiều cao tường hiện trên sơ đồ
   open            các mặt không vẽ tường (khu bên cạnh đã vẽ tường chung)
   doors           lối trổ trên tường {side: N/S/W/E, at: tọa độ tâm, w: bề rộng}
   do              đồ đạc, thiết bị: ['ban', x, z, rộng, sâu], ['ghe', x, z, rộng, sâu], ['may', x, z, rộng, cao, sâu],
                   ['bon', x, z, bán kính, cao, độ cao chân], ['ke', x0, x1, z0, z1, số tầng], ['thung', x, z, số cột, số hàng],
                   ['pallet', x, z], ['vach', x0, x1, z0, z1], ['bao', x, z, số lớp] (pallet bao đay hạt ca cao),
                   ['rang', x, z] (máy rang trống, sàng làm nguội, ống khói), ['tachvo', x, z] (máy nghiền vỡ, quạt tách vỏ, cyclone),
                   ['melanger', x, z] (máy nghiền đá), ['ep', x, z] (máy ép thủy lực), ['nghienbot', x, z] (máy nghiền bột, rây),
                   ['temper', x, z] (máy tôi socola), ['tumat', x, z, rộng, sâu] (tủ mát làm cứng), ['dieuhoa', x, z, mặt],
                   ['panning', x, z] (nồi bao), ['can', x, z] (cân sàn)
   dept, role, req, basis: bộ phận phụ trách, công năng, yêu cầu, căn cứ bố trí */
const ZONES = [
  /* ---------- Giai đoạn 1: vùng nguyên liệu, nhà ở, xưởng cũ chuyển sang ca cao ---------- */
  { id: 'vung', n: 1, name: 'Vùng ca cao: nông hộ, HTX liên kết', kind: 'cacao', phase: 1, sanCo: true, box: [-42, -24, -36, -14], h: 5, noArea: true, dept: [D.tm],
    role: 'Nông hộ và HTX trồng ca cao (Krông Ana, Ea Kar, Buôn Đôn… là các vùng đang có liên kết sản xuất ca cao ở Đắk Lắk, theo báo Nông nghiệp và Môi trường) hái quả chín, tách hạt. Heragrain ký hợp đồng thu mua, cấp sổ nhật ký vườn và ghi tọa độ từng vườn để truy xuất, chuẩn bị hồ sơ EUDR.',
    req: 'Hợp đồng thu mua; danh sách vườn kèm tọa độ; nhật ký phân bón, thuốc BVTV (chỉ hoạt chất được phép ở thị trường đích); không mở rộng vườn bằng phá rừng.',
    basis: 'Luật ATTP 2010 Điều 19; Quy định (EU) 2023/1115 (EUDR), sửa đổi bởi (EU) 2025/2650.' },
  { id: 'lenmen', n: 2, name: 'Điểm lên men, phơi của HTX (đối tác)', kind: 'lenmen', phase: 1, sanCo: true, box: [-22, -10, -19, -10], h: 2.6, noArea: true, dept: [D.tm, D.qa],
    role: 'Hạt tươi ủ trong thùng gỗ nhiều ngăn, đảo theo ngày, rồi phơi trên giàn cách đất đến khi khô. Việc lên men, phơi do HTX, nông hộ làm; Heragrain chỉ mua hạt đã khô, đưa quy trình mẫu và kiểm từng lô bằng cut test.',
    req: 'Giàn phơi cách đất, có mái che mưa; không phơi trên đường, sân đất; bao đay sạch, không dùng bao đã đựng phân, hóa chất.',
    basis: 'TCVN 7519:2020 (ISO 2451:2017) về chất lượng hạt ca cao; mô tả quy trình của HTX.' },
  { id: 'nha', n: 3, name: 'Nhà ở gia đình, văn phòng tạm (phòng 7)', kind: 'house', phase: 1, sanCo: true, box: [-5, 11, -15, -7.5], h: 6, wallH: 2.6, kt: 'uoc', dept: [D.gd, D.hc, D.kd],
    doors: [{ side: 'S', at: -1.5, w: 3.6 }, { side: 'N', at: -1.5, w: 3.6 }],
    do: [['ban', 6, -12.4, 2.2, 1], ['ghe', 6, -13.4, 2.2, 0.5], ['may', 9.9, -14.4, 0.6, 1.8, 0.5]],
    role: 'Mặt tiền ra đường. Phòng phía đông làm văn phòng tạm: kế toán, hồ sơ pháp lý, hồ sơ truy xuất, tiếp khách. Lối vào xưởng đi xuyên qua nhà, ra sân sau; chỉ bao hạt khô buộc kín và thùng thành phẩm dán kín được đi qua.',
    req: 'Hàng qua nhà đi theo lối cố định, không để lại trong nhà; giờ nhập hạt và giờ xuất hàng tách nhau.', basis: 'Codex CXC 1-1969 (tách khu sinh hoạt với khu sản xuất); đề xuất của tư vấn.' },
  { id: 'sansau', n: 4, name: 'Sân sau có mái: nhận hạt, xuất hàng', kind: 'hall', phase: 1, box: [-5, 4, -19.6, -15], h: 3.2, wallH: 2, kt: 'uoc', open: ['E', 'S'], pin: [-3.6, 4.4, -17.3], dept: [D.kho, D.qa],
    doors: [{ side: 'N', at: -1.75, w: 3.5 }, { side: 'N', at: 2, w: 4 }],
    do: [['can', -4.1, -17.4], ['pallet', 2.7, -16.3], ['vach', -2.6, -2.6, -19.2, -15.4], ['vach', -0.9, -0.9, -19.2, -15.4]],
    role: 'Lợp mái tôn sân sau làm chỗ nhận hạt: cân từng bao, lấy mẫu, ghi mã lô trước khi đưa vào kho. Buổi chiều dùng làm chỗ tập kết thùng thành phẩm chờ xe.',
    req: 'Nhập và xuất khác giờ; quét dọn giữa hai lượt; không để bao trực tiếp trên nền, không để qua đêm ngoài kho.', basis: 'Codex CXC 1-1969; Thông tư 38/2018/TT-BNNPTNT (điều kiện cơ sở).' },
  { id: 'cuaxuong', n: 5, name: 'Cửa vào xưởng (rèm nhựa, lưới chắn côn trùng)', kind: 'door', phase: 1, box: [-3.5, 0, -19.85, -19.35], h: 3, noArea: true, pin: [-1.75, 5.4, -19.6], dept: [D.kho],
    role: 'Cửa duy nhất vào xưởng cũ, rộng khoảng 3,5 m, ở đầu nam lối đi. Người, hạt nguyên liệu và thành phẩm đều qua cửa này nên chia giờ và giữ hàng luôn đóng kín.',
    req: 'Rèm nhựa và lưới chắn côn trùng ngay từ GĐ1 (mọt, ngài hại kho); đóng cửa khi không chuyển hàng.', basis: 'Codex CXC 1-1969 (kiểm soát động vật gây hại).' },
  { id: 'loidi', n: 6, name: 'Lối đi chung (có mái)', kind: 'hall', phase: 1, box: [-3.5, 0, -34.2, -19.6], h: 3.2, wallH: 2.2, kt: 'uoc', open: ['E', 'S'], pin: [-1.75, 4.2, -26.5], dept: [D.kho],
    do: [['vach', -1.75, -1.75, -30.2, -20.2]],
    role: 'Lối đi dọc phía tây xưởng, lợp mái. Hạt vào phòng 1 qua cửa gần đầu nam; thành phẩm từ phòng 5 đi ra theo vạch phân làn. Không để hàng trên lối đi.',
    req: 'Vạch phân làn; vệ sinh lối đi sau mỗi lượt nhập hạt; đèn có chụp chống vỡ.', basis: 'Bản vẽ hiện trạng; Codex CXC 1-1969.' },
  { id: 'wc1', n: 7, name: 'Nhà vệ sinh, phòng thay bảo hộ (phòng 6)', kind: 'block', phase: 1, sanCo: true, box: [4, 10.7, -19.6, -15], h: 3.2, kt: 'uoc', cua: 'W', dept: [D.hc, D.qa],
    role: 'Ngăn phòng 6 có sẵn làm hai phần: hai buồng vệ sinh và phòng thay bảo hộ có tủ cá nhân, bồn rửa tay. Cửa mở ra sân sau, không mở vào kho hay khu chế biến.',
    req: 'Thay áo, mũ, khẩu trang, rửa tay trước khi vào xưởng; khám sức khỏe, tập huấn kiến thức ATTP cho người lao động.', basis: 'Luật ATTP 2010 Điều 19; Codex CXC 1-1969 (vệ sinh cá nhân).' },
  { id: 'kho', n: 8, name: 'Kho hạt nguyên liệu, kiểm nhận, làm sạch (phòng 1)', kind: 'hall', phase: 1, box: [0, 10.2, -24.2, -19.6], h: 4.2, wallH: 2, kt: 'uoc', dept: [D.kho, D.qa, D.tm],
    doors: [{ side: 'N', at: 7.2, w: 1.5 }, { side: 'W', at: -21.9, w: 1.2 }],
    do: [['bao', 0.9, -23.4, 5], ['bao', 2.2, -23.4, 5], ['bao', 3.5, -23.4, 4], ['bao', 4.8, -23.4, 3], ['bao', 1.6, -20.4, 4],
      ['ban', 4.2, -20.25, 1.4, 0.7], ['may', 6.3, -20.5, 1.4, 1.3, 0.9], ['ban', 8.7, -20.3, 2.0, 0.8], ['thung', 5.9, -23.6, 2, 1], ['can', 9.3, -23.4]],
    role: 'Bao hạt khô xếp trên pallet theo mã lô. Bàn kiểm nhận: đo độ ẩm, cut test (thông lệ cắt 300 hạt: hạt mốc, hạt đá, hạt sâu), đếm số hạt/100 g. Sàng rung loại đá, cành, vỏ, hạt dính chùm; bàn nhặt tay; cân hạt sạch trước khi sang phòng rang.',
    req: 'Nhận lô khi độ ẩm, cut test đạt mức ghi trong hợp đồng (đề xuất độ ẩm ≤ 7,5 %, cần đối chiếu bảng yêu cầu của TCVN 7519:2020); lô không đạt để riêng, ghi rõ; pallet cách tường; bẫy côn trùng, theo dõi mọt.',
    basis: 'TCVN 7519:2020 (ISO 2451:2017), TCVN 7521:2020 (lấy mẫu); Codex CXC 1-1969. Ngưỡng độ ẩm, khoảng cách pallet là đề xuất.' },
  { id: 'rang', n: 9, name: 'Phòng rang, nghiền vỡ, tách vỏ (phòng 2)', kind: 'hall', phase: 1, box: [5.5, 10.2, -29, -24.2], h: 4.2, wallH: 2, kt: 'uoc', open: ['W', 'S'], pin: [7.9, 5.2, -26.4], dept: [D.sx, D.qa],
    do: [['rang', 9.0, -28.3], ['tachvo', 9.4, -25.1]],
    role: 'Máy rang trống (khuyến nghị dùng điện, 15–30 kg/mẻ), sàng làm nguội, chụp hút và ống khói qua mái. Hạt rang nguội vào máy nghiền vỡ, quạt tách vỏ lụa, cyclone thu vỏ. Nibs sang phòng 3 qua cửa phía tây.',
    req: 'CCP rang: ghi nhiệt độ, thời gian từng mẻ để diệt vi sinh vật (Salmonella); thông số chốt bằng thẩm định quá trình. Bịt cửa cũ sang phòng 5 để khói, bụi vỏ không vào kho thành phẩm; bình chữa cháy cạnh máy rang.',
    basis: 'Codex HACCP (CXC 1-1969, phụ lục); đề xuất của tư vấn.' },
  { id: 'nibs', n: 10, name: 'Phòng nibs, nghiền, ép (phòng 3)', kind: 'hall', phase: 1, box: [0, 5.5, -29, -24.2], h: 4.2, wallH: 2, kt: 'uoc', open: ['S'], pin: [1.0, 5.0, -27.6], dept: [D.sx, D.kho],
    doors: [{ side: 'N', at: 1.0, w: 1.2 }, { side: 'W', at: -27, w: 1.2 }, { side: 'E', at: -27.6, w: 1.2 }],
    do: [['may', 2.5, -25.9, 1.0, 1.2, 0.8], ['ban', 4.5, -24.75, 1.8, 0.7]],
    role: 'GĐ1: sàng phân cỡ nibs, cân, đóng túi kín hoặc bao lót PE (hàng thô bán B2B, gói mẫu chào hàng). Từ GĐ2 thêm máy nghiền đá dọc tường bắc; GĐ3 thêm máy ép thủy lực và máy nghiền bột, rây.',
    req: 'Nibs là sản phẩm ăn được sau rang: tay, dụng cụ sạch, đóng túi kín ngay; máy hàn túi kiểm tra mối hàn; ghi mã lô khớp lô rang.', basis: 'Codex CXS 141-1983 (khối, bánh ca cao); đề xuất của tư vấn.' },
  { id: 'dc', n: 11, name: 'Phòng dụng cụ, phụ tùng (phòng 4)', kind: 'hall', phase: 1, box: [0, 1.9, -26.2, -24.2], h: 3, wallH: 2, kt: 'uoc', open: ['W', 'S'], noFloor: true, noRoof: true, pin: [1, 4.6, -25.2], dept: [D.sx],
    doors: [{ side: 'N', at: 1.3, w: 0.8 }],
    do: [['ke', 0.2, 1.7, -26, -25.5, 2]],
    role: 'Sàng thay thế, dao, chổi, phụ tùng máy rang và máy nghiền. Hóa chất vệ sinh để tủ khóa riêng, không cất chung với bao bì.',
    req: 'Sổ theo dõi dụng cụ; dao, lưỡi, lưới sàng kiểm đếm đầu và cuối ca (kiểm soát dị vật kim loại).', basis: 'Kiểm soát dị vật trong HACCP; đề xuất của tư vấn.' },
  { id: 'tp', n: 12, name: 'Kho thành phẩm mát, bao bì sạch (nửa đông phòng 5)', kind: 'hall', phase: 1, box: [5.1, 10.2, -34.2, -29], h: 4.2, wallH: 2, kt: 'uoc', open: ['S'], pin: [8.4, 5.2, -31.2], dept: [D.kho],
    doors: [{ side: 'W', at: -31.6, w: 1.0 }],
    do: [['ke', 9.5, 10.0, -33.8, -29.4, 3], ['pallet', 7.6, -30.0], ['pallet', 8.9, -30.0], ['ke', 7.6, 9.1, -34.0, -33.5, 3], ['dieuhoa', 8.4, -34.05, 'N']],
    role: 'Điều hòa giữ khoảng 15–18 °C cho socola (đề xuất), độ ẩm thấp; nibs, bột trong túi kín, bao bì sạch trên kệ riêng. Xuất theo FIFO/FEFO, ghi nhiệt độ, độ ẩm hằng ngày.',
    req: 'Tách khu hàng chờ kết quả kiểm nghiệm; bao bì tiếp xúc trực tiếp với sản phẩm để kệ có che phủ.', basis: 'Codex CXC 1-1969; Codex CXS 87-1981 (socola).' },
  { id: 'xe', n: 13, name: 'Xe giao hàng trong nước (B2B)', kind: 'cont', phase: 1, box: [7, 14, 1.6, 3.8], h: 3, noArea: true, pin: [10.5, 4.6, 2.7], dept: [D.kho, D.kd],
    role: 'Giao bao nibs, hạt rang cho nhà máy socola, công ty bánh kẹo; từ GĐ2 giao socola cho điểm bán. Bãi xe trước nhà là giả định.',
    req: 'Thùng xe sạch, có mui; socola chở bằng thùng giữ nhiệt khi trời nóng.', basis: 'Đề xuất của tư vấn.' },

  /* ---------- Giai đoạn 2: socola ---------- */
  { id: 'melanger', n: 14, name: 'Máy nghiền đá (melanger) 3 × 20 kg', kind: 'thietbi', phase: 2, box: [2.0, 4.8, -28.9, -28.1], h: 1.2, noArea: true, pin: [3.4, 3.4, -28.5], dept: [D.sx, D.rd],
    do: [['melanger', 2.45, -28.5], ['melanger', 3.4, -28.5], ['melanger', 4.35, -28.5]],
    role: 'Nghiền nibs thành khối ca cao lỏng, thêm đường (và bơ ca cao khi cần), nghiền tiếp nhiều giờ để mịn và đánh hương (conche); thời gian chốt theo thử nghiệm công thức. Một máy chạy khối ca cao nguyên chất cho GĐ3.',
    req: 'Ghi thời gian, nhiệt độ mẻ; đo độ mịn; nắp máy đậy kín; không dùng chung máy cho mẻ có sữa, hạt (mắc ca) khi chưa vệ sinh xác nhận.', basis: 'Codex CXS 87-1981; Codex CXC 80-2020 (quản lý chất gây dị ứng).' },
  { id: 'socola', n: 15, name: 'Khu sạch socola: tôi, đổ khuôn, làm lạnh, gói (nửa tây phòng 5)', kind: 'hall', phase: 2, box: [0, 5.1, -34.2, -29], h: 4.2, wallH: 2, kt: 'uoc', open: ['S', 'E'], pin: [2.6, 5.2, -31.6], dept: [D.sx, D.qa, D.rd],
    doors: [{ side: 'W', at: -31.6, w: 1.2 }],
    do: [['tumat', 0.7, -33.7, 1.2, 0.7], ['ban', 2.6, -33.75, 2.0, 0.8], ['temper', 4.45, -33.7], ['ban', 3.3, -29.6, 2.4, 0.7], ['bon', 0.35, -32.9, 0.22, 0.85], ['dieuhoa', 2.6, -34.05, 'N']],
    role: 'Nhận khối socola từ phòng 3 qua cửa phía nam: máy tôi socola, bàn đổ khuôn và rung khuôn, tủ mát làm cứng, tách khuôn, gói giấy bạc, cho vào hộp, dán nhãn có mã lô. Từ GĐ3 đóng gói cả bột ca cao tại đây.',
    req: 'Trần kín, điều hòa khoảng 18–20 °C, độ ẩm thấp (thông lệ ngành, đề xuất; chốt theo thử nghiệm công thức); người vào qua trạm rửa tay ở đầu bắc lối đi; khuôn polycarbonate rửa, sấy khô trước ca.', basis: 'Codex CXC 1-1969; Codex CXS 87-1981.' },
  { id: 'dem', n: 16, name: 'Trạm rửa tay vào khu sạch (đầu bắc lối đi)', kind: 'hall', phase: 2, box: [-3.5, 0, -34.2, -30.6], h: 2.6, wallH: 2.2, kt: 'de', open: ['N', 'W', 'E'], noFloor: true, noRoof: true, pin: [-1.75, 3.8, -32.6], dept: [D.qa],
    doors: [{ side: 'S', at: -1.75, w: 1.2 }],
    do: [['bon', -3.1, -33.6, 0.25, 0.85], ['may', -3.15, -31.6, 0.6, 1.8, 0.5]],
    role: 'Vách ngăn đầu bắc lối đi tạo phòng đệm trước cửa khu sạch: bồn rửa tay không chạm tay, tủ tạp dề, mũ trùm tóc. Người từ kho hạt, phòng rang sang khu sạch bắt buộc qua đây.',
    req: 'Xà phòng, khăn giấy, dung dịch sát khuẩn; đổi tạp dề khi vào khu sạch.', basis: 'Codex CXC 1-1969 (vệ sinh cá nhân).' },

  /* ---------- Giai đoạn 3: bột, bơ ca cao, đạt chuẩn ---------- */
  { id: 'ep', n: 17, name: 'Máy ép thủy lực tách bơ ca cao', kind: 'thietbi', phase: 3, box: [3.4, 4.6, -26.5, -25.4], h: 1.9, noArea: true, pin: [4.0, 3.6, -25.95], dept: [D.sx],
    do: [['ep', 4.0, -25.95]],
    role: 'Ép khối ca cao nóng thành bơ ca cao (lọc, đổ khuôn hoặc rót hũ) và bánh ca cao. Bánh ca cao chuyển sang máy nghiền bột.',
    req: 'Ghi áp suất, nhiệt độ, tỷ lệ bơ thu hồi; vệ sinh túi lọc sau mẻ.', basis: 'Codex CXS 86-1981 (bơ ca cao), CXS 141-1983 (bánh ca cao).' },
  { id: 'bot', n: 18, name: 'Máy nghiền bột, rây ca cao', kind: 'thietbi', phase: 3, box: [2.0, 3.0, -25.3, -24.45], h: 1.8, noArea: true, pin: [2.5, 3.4, -24.9], dept: [D.sx],
    do: [['nghienbot', 2.5, -24.9]],
    role: 'Nghiền bánh ca cao, rây thành bột ca cao nguyên chất; bột cho vào thùng kín, chuyển sang khu sạch đóng gói.',
    req: 'Hút bụi tại chỗ; lưới rây kiểm tra nguyên vẹn đầu và cuối ca; độ ẩm bột theo hồ sơ công bố.', basis: 'Codex CXS 105-1981 (bột ca cao).' },
  { id: 'dkl', n: 19, name: 'Máy dò kim loại', kind: 'detector', phase: 3, box: [4.0, 5.0, -30.9, -30.3], h: 1.7, noArea: true, pin: [4.5, 3.2, -30.6], dept: [D.sx, D.qa],
    role: 'Sản phẩm đã gói đi qua máy dò kim loại trước khi cho vào thùng (bước 10).',
    req: 'CCP đề xuất: thử mẫu chuẩn Fe, non-Fe, inox đầu ca và định kỳ trong ca (tần suất chốt trong kế hoạch HACCP); loại riêng sản phẩm bị báo.', basis: 'Codex HACCP; yêu cầu thường gặp của người mua.' },
  { id: 'qc', n: 20, name: 'Phòng QC, tủ lưu mẫu (góc kho thành phẩm)', kind: 'hall', phase: 3, box: [5.1, 7.3, -34.2, -32.4], h: 2.6, wallH: 2, kt: 'de', open: ['N', 'W'], noFloor: true, noRoof: true, pin: [6.2, 3.6, -33.3], dept: [D.qa],
    doors: [{ side: 'S', at: 6.2, w: 0.9 }],
    do: [['ban', 6.2, -33.85, 1.8, 0.6], ['may', 6.9, -33.0, 0.6, 1.8, 0.5]],
    role: 'Bàn kiểm cảm quan, cân phân tích, máy đo độ ẩm; tủ lưu mẫu từng lô. Mẫu kiểm nghiệm định kỳ gửi phòng thử nghiệm được công nhận ISO/IEC 17025, không xây lab hóa.',
    req: 'Chỉ xuất lô khi có kết quả đạt; lưu mẫu đến hết hạn sử dụng; hồ sơ HACCP lưu tại đây và văn phòng.', basis: 'ISO 22000:2018; Thông tư 38/2018/TT-BNNPTNT.' },

  /* ---------- Giai đoạn 4: mix vị, xuất khẩu ---------- */
  { id: 'panning', n: 21, name: 'Nồi bao (panning): bọc socola', kind: 'thietbi', phase: 4, box: [1.8, 2.8, -31.0, -30.1], h: 1.5, noArea: true, pin: [2.3, 3.2, -30.55], dept: [D.sx, D.rd],
    do: [['panning', 2.3, -30.55]],
    role: 'Bọc socola cho nibs, hạt mắc ca, cà phê rang, trái cây sấy Heragrain (sầu riêng, chanh dây gừng, mãng cầu).',
    req: 'Quản lý chất gây dị ứng (mắc ca là hạt cây): lịch sản xuất riêng, vệ sinh xác nhận, ghi trên nhãn.', basis: 'Codex CXC 80-2020; NĐ 37/2026/NĐ-CP (nhãn hàng hóa).' },
  { id: 'travo', n: 22, name: 'Tủ sấy vỏ ca cao làm trà', kind: 'thietbi', phase: 4, box: [5.75, 7.15, -28.9, -28.2], h: 1.8, noArea: true, pin: [6.45, 3.6, -28.55], dept: [D.sx, D.rd],
    do: [['may', 6.45, -28.55, 1.3, 1.8, 0.6]],
    role: 'Vỏ lụa từ máy tách vỏ được sàng, sấy, đóng túi lọc làm trà vỏ ca cao. Trước GĐ4 vỏ bán làm phân bón, than sinh học.',
    req: 'Kiểm nghiệm kim loại nặng, độc tố vi nấm, vi sinh trước khi bán; hỏi lại quy định thực phẩm của thị trường đích với vỏ ca cao.', basis: 'Đề xuất của tư vấn; QCVN 8-2:2011/BYT.' },
  { id: 'trungbay', n: 23, name: 'Góc trưng bày, nếm thử (phòng trước nhà ở)', kind: 'thietbi', phase: 4, box: [6.4, 10.6, -10.4, -7.8], h: 2, noArea: true, pin: [8.5, 3.6, -9.1], dept: [D.kd],
    do: [['ke', 6.6, 10.4, -8.2, -7.85, 3], ['ban', 8.5, -9.6, 1.6, 0.8]],
    role: 'Kệ sản phẩm, bàn nếm thử socola cho khách và đối tác ghé xưởng. Chỉ làm khi gia đình đồng ý dùng phòng trước.',
    req: 'Không chế biến tại đây; sản phẩm bày bán còn hạn, có nhãn đầy đủ.', basis: 'Đề xuất của tư vấn.' },
  { id: 'xk', n: 24, name: 'Xuất khẩu: container (Trung Quốc, EU)', kind: 'cont', phase: 4, box: [6.5, 19.5, -1.4, 1.0], h: 3.2, noArea: true, pin: [13, 5.2, -0.2], dept: [D.kd],
    role: 'Đóng thùng tại kho thành phẩm, đưa ra xe container ở bãi trước nhà (giả định); lô đầu qua nhà nhập khẩu.',
    req: 'EU: hồ sơ EUDR, giới hạn cadimi trong socola, bột ca cao (Quy định (EU) 2023/915); Trung Quốc: đăng ký GACC theo nhóm sản phẩm; C/O.', basis: 'Quy định (EU) 2023/1115, 2023/915; Lệnh 280 GACC.' }
];

/* 11 bước quy trình; p = [x, z] vị trí số bước */
const STEPS = [
  { n: 1, name: 'Nhận hạt khô, cân, lấy mẫu', zone: 'sansau', p: [-4.1, -16.2] },
  { n: 2, name: 'Kiểm nhận: độ ẩm, cut test', zone: 'kho', p: [4.2, -21.2] },
  { n: 3, name: 'Làm sạch, phân loại', zone: 'kho', p: [6.3, -21.6] },
  { n: 4, name: 'Rang (CCP)', zone: 'rang', p: [8.0, -28.3] },
  { n: 5, name: 'Nghiền vỡ, tách vỏ', zone: 'rang', p: [9.4, -24.8] },
  { n: 6, name: 'Phân cỡ, đóng gói nibs', zone: 'nibs', p: [2.5, -26.7] },
  { n: 7, name: 'Nghiền mịn với đường', zone: 'melanger', p: [3.4, -27.7] },
  { n: 8, name: 'Ép bơ, nghiền rây bột', zone: 'ep', p: [4.1, -25.2] },
  { n: 9, name: 'Tôi, đổ khuôn, làm lạnh', zone: 'socola', p: [2.6, -33.0] },
  { n: 10, name: 'Gói, dò kim loại, dán nhãn', zone: 'socola', p: [3.3, -30.1] },
  { n: 11, name: 'Kho mát, xuất hàng', zone: 'tp', p: [8.4, -31.6] }
];

/* Tuyến luồng hàng: sáng khi khu need đang hoạt động; pts = các điểm [x, z].
   Vào xưởng: đường trước nhà → xuyên nhà ở → sân sau → cửa vào xưởng → lối đi → cửa phòng 1. */
const ROUTES = [
  { id: 'in', need: 'kho', pts: [[-10, -14.5], [-7, -4.75], [-1.5, -4.75], [-1.5, -18.2], [-1.75, -21.9], [1.6, -21.9]] },
  { id: 'sach', need: 'kho', pts: [[1.6, -21.9], [6.3, -21.6], [7.2, -23.4], [7.2, -25.6]] },
  { id: 'rang', need: 'rang', pts: [[7.2, -25.6], [8.0, -27.4], [9.3, -25.6]] },
  { id: 'r3', need: 'nibs', pts: [[9.3, -25.6], [6.3, -27.6], [3.6, -27.4], [2.5, -26.6]] },
  { id: 'nibs', need: 'nibs', pts: [[2.5, -26.6], [1.0, -28.2], [1.0, -31.6], [7.6, -31.6]] },
  { id: 'mel', need: 'melanger', pts: [[3.6, -27.4], [3.4, -28.0]] },
  { id: 'soc', need: 'socola', pts: [[3.4, -28.0], [1.4, -28.4], [1.4, -30.6], [2.6, -33.0], [3.3, -30.2], [6.2, -31.2]] },
  { id: 'ep', need: 'ep', pts: [[3.4, -28.0], [4.0, -26.6], [2.5, -25.4]] },
  { id: 'out', need: 'tp', pts: [[7.6, -31.6], [0, -31.6], [-1.75, -30.9], [-1.75, -19.6], [-1.5, -15], [-1.5, -4.75], [8, -4.75], [10.5, 1.4]] },
  { id: 'xk', need: 'xk', pts: [[8, -4.75], [12, -1.6]] },
  { id: 'vo', need: 'travo', pts: [[9.3, -25.6], [6.45, -27.9]] }
];

/* Mặt bằng */
const MAT_BANG = {
  nen: [{ box: [-6.5, 12.5, -35.5, -7.5] }, { box: [6, 21, -2, 4.4] }, { box: [-23, -9, -20, -9] }],
  vien: [[[-6.5, -35.5], [12.5, -35.5], [12.5, -7.5], [-6.5, -7.5]]],
  duong: [{ box: [-46, 28, -7.5, -2] }, { box: [-17.5, -13.5, -9, -7.5] }],
  ngat: []
};

const NHAN_PHU = [
  { t: 'Đường trước nhà', p: [-24, 0.3, -4.75] },
  { t: 'Bãi xe, giao nhận (giả định)', p: [13.5, 0.3, 5.4] },
  { t: 'Vùng ca cao (minh họa, cách xưởng nhiều km)', p: [-33, 0.3, -37.4] },
  { t: 'Xưởng mới (trái cây sấy, trà) ở lô riêng cách ~200 m', p: [-10, 0.3, 1.5] }
];

const KHUNG = { w: 70, h: 46 };

const GOC_NHIN = {
  iso: { dir: [-1, 0.95, 1], tgt: [-6, 0, -20], zoom: 1.2, label: 'toàn cảnh' },
  xuong: { dir: [-0.75, 1.5, 0.95], tgt: [3.0, 0, -25.5], zoom: 2.05, label: 'xưởng ca cao' },
  sach: { dir: [-0.5, 1.8, 1.0], tgt: [3.4, 0, -29.6], zoom: 3.0, label: 'chế biến sâu' },
  plan: { dir: [0, 1, 0.02], tgt: [-12, 0, -16], zoom: 0.95, label: 'mặt bằng' },
  vung: { dir: [-1, 1.1, 1], tgt: [-24, 0, -20], zoom: 1.7, label: 'vùng nguyên liệu' }
};

/* Điều chỉnh so với hiện trạng xưởng cũ */
const DIEU_CHINH = [
  { t: 'Xưởng cũ chuyển hẳn sang ca cao.', d: 'Năm phòng xếp theo dòng một chiều: phòng 1 kho hạt → phòng 2 rang, tách vỏ → phòng 3 nibs, nghiền, ép → nửa tây phòng 5 khu sạch socola → nửa đông phòng 5 kho mát. Hạt chưa rang không đi qua phòng 3, phòng 5.', cc: 'Codex CXC 1-1969' },
  { t: 'Hàng qua nhà ở luôn đóng kín, chia giờ.', d: 'Lối duy nhất vào xưởng đi xuyên nhà ở. Hạt khô trong bao đay buộc kín vào buổi sáng; thùng thành phẩm dán kín ra buổi chiều; giữa hai lượt quét dọn sân sau và lối đi.', cc: 'Đề xuất của tư vấn' },
  { t: 'Lợp mái sân sau và lối đi.', d: 'Sân sau thành chỗ nhận hạt, cân, lấy mẫu và tập kết thùng chờ xe; lối đi có mái để bao hạt, thùng hàng không bị mưa.', cc: 'Codex CXC 1-1969' },
  { t: 'Ngăn phòng 6 làm nhà vệ sinh và phòng thay bảo hộ.', d: 'Phòng 6 có sẵn đủ rộng (khoảng 31 m²) cho hai buồng vệ sinh, tủ cá nhân và bồn rửa tay; cửa mở ra sân sau.', cc: 'Luật ATTP Điều 19' },
  { t: 'Bịt cửa giữa phòng 2 và phòng 5.', d: 'Khói rang, bụi vỏ lụa không được vào kho thành phẩm. Phòng 2 chỉ còn cửa nhận hạt sạch từ phòng 1 và cửa giao hạt đã tách vỏ sang phòng 3.', cc: 'Codex CXC 1-1969' },
  { t: 'Dời hai cửa trong.', d: 'Cửa phòng 1 → phòng 2 dời về x = 7,2 m để chừa chỗ máy tách vỏ; cửa phòng 3 → phòng 5 dời về phía tây (x = 1 m) để đặt máy nghiền đá dọc tường bắc phòng 3.', cc: 'Bố trí thiết bị' },
  { t: 'Máy rang điện, chụp hút, ống khói.', d: 'Khuyến nghị máy rang điện để không trữ bình gas trong khu dân cư; chụp hút và cyclone thu vỏ, ống khói cao hơn mái; xin ý kiến hàng xóm về mùi rang.', cc: 'Luật PCCC và CNCH 2024; Luật BVMT 2020' },
  { t: 'Khu sạch socola có điều hòa, trạm rửa tay riêng.', d: 'Nửa tây phòng 5 làm trần kín, điều hòa 18–20 °C; vách ngăn đầu bắc lối đi làm phòng đệm rửa tay, đổi tạp dề.', cc: 'Codex CXC 1-1969' },
  { t: 'Không lên men, phơi tại xưởng.', d: 'Lên men, phơi do HTX, nông hộ làm ở vùng trồng; Heragrain đưa quy trình mẫu, kiểm từng lô bằng độ ẩm và cut test. Xưởng không có chỗ phơi và không nên có mùi giấm lên men trong khu dân cư.', cc: 'TCVN 7519:2020' },
  { t: 'Vỏ lụa không bỏ đi.', d: 'GĐ1–3 bán vỏ làm phân bón, than sinh học; GĐ4 sấy, sàng làm trà vỏ ca cao sau khi kiểm nghiệm đạt.', cc: 'Kinh tế tuần hoàn' }
];

const UOC_KICH_THUOC = [
  'Kích thước xưởng cũ ước theo tỷ lệ ảnh xưởng mới có số đo (khoảng 2 m mỗi ô vở): 5 phòng 10,2 × 14,6 m, khoảng 149 m²; lối đi phía tây rộng 3,5 m; sân sau 9 × 4,6 m; phòng 6 khoảng 6,7 × 4,6 m; nhà ở 16 × 7,5 m.',
  'Diện tích sản xuất ca cao khoảng 200 m² (5 phòng và lối đi). Ước tính của tư vấn, chưa có định mức tham chiếu: máy rang 15–30 kg/mẻ, 3 máy nghiền đá 20 kg, máy ép thủy lực cỡ nhỏ, khoảng 100–200 kg hạt/ngày một ca; chốt theo catalogue và chạy thử.',
  'Vị trí thiết bị là đề xuất; chốt lại theo catalogue máy thật (kích thước, công suất điện, khoảng cách an toàn).'
];

const CAN_XAC_NHAN = [
  'Gia đình đồng ý cho bao hạt và thùng hàng đi qua nhà ở theo giờ cố định; có thể mở lối hàng riêng ở tường tây lối đi hay không.',
  'Xưởng cũ chuyển hẳn sang ca cao thì phần đóng gói trái cây sấy, trà (GĐ1 của sơ đồ cũ) dồn về xưởng mới hoặc thuê gia công.',
  'Nguồn điện (1 pha hay 3 pha, công suất trạm) cho máy rang điện, máy nghiền, điều hòa; nếu dùng gas thì chỗ đặt bình ngoài nhà.',
  'Chiều cao trần phòng 2 để lắp chụp hút, ống khói; nhà xung quanh có bị ảnh hưởng mùi rang không.',
  'Công suất mục tiêu (kg hạt/ngày) và quy cách nibs khách B2B cần (cỡ hạt, độ ẩm, bao bì) để chọn cỡ máy.',
  'Đo thực tế xưởng cũ, nhà ở, sân sau trước khi đặt máy; số trên sơ đồ là số ước.'
];

window.HERAGRAIN = { PH, D, ZONES, STEPS, ROUTES, MAT_BANG, NHAN_PHU, KHUNG, GOC_NHIN, DIEU_CHINH, UOC_KICH_THUOC, CAN_XAC_NHAN };
})();
