// Nội dung Phần 1–4. Ký hiệu độ tin cậy: ✅ đã có nguồn; ⚠ cần xác nhận; ✗ khoảng trống chưa có dữ liệu.
const A = [];
const h1 = (text) => A.push({ t: "h1", text });
const h2 = (text) => A.push({ t: "h2", text });
const p = (text) => A.push({ t: "p", text });
const bul = (items) => A.push({ t: "bul", items });
const num = (items) => A.push({ t: "num", items });
const note = (title, lines) => A.push({ t: "note", title, lines });
const table = (head, rows, widths, opt = {}) => A.push({ t: "table", head, rows, widths, ...opt });

// ===================== PHẦN 1 =====================
h1("PHẦN 1. TÓM TẮT ĐIỀU HÀNH");
p("Công ty TNHH MTV Đóng và Sửa tàu Hải Minh (Hai Minh Shipyard, phiên hiệu quân sự Nhà máy X51) là doanh nghiệp quân đội tại Nhà Bè, TP. Hồ Chí Minh, đóng mới và sửa chữa tàu quân sự, tàu chấp pháp và tàu kinh tế. Theo bộ tài liệu tư vấn ngành, Hải Minh thuộc loại hình “nhà máy đóng mới tàu” kiêm “cơ sở sửa chữa, đại tu tàu” (tài liệu số 12), có thêm xưởng cơ khí (tài liệu số 04) và xưởng mộc trang trí (tài liệu số 11).");
p("**Năm kết luận chính của báo cáo**");
num([
  "**Nhóm 3 là nhóm đông nhất và rủi ro cao nhất.** Phần lớn lao động trực tiếp của nhà máy làm công việc thuộc Danh mục nghiêm ngặt: hàn cắt thân tàu, làm việc trên cao và trong khoang, két, vận hành cẩu cổng trục, ụ và đốc nổi, phun bi và sơn tàu, điện tàu, làm việc trên mặt nước. Cần chia Nhóm 3 thành các cụm theo xưởng (Phần 4).",
  "**Nhóm 1 và Nhóm 2 là “cửa vào”.** Nhóm 1 gồm Chủ tịch, Giám đốc, bốn Phó giám đốc, trưởng các phòng và quản đốc các xưởng. Nhóm 2 gồm Phòng an toàn (HSE), đã có tên trong sơ đồ tổ chức năm 2019 ✅.",
  "**Chưa có số liệu tổng số lao động và phân bổ theo xưởng từ nguồn chính thống** ✗. Vì vậy báo cáo xếp nhóm theo vị trí và xưởng, chưa thể nêu số người hay báo giá. Bảng thu thập số liệu ở Phần 6 là việc đầu tiên cần làm khi gặp khách hàng.",
  "**Phần mềm: nên giới thiệu 5 cụm tính năng** gắn với việc Hải Minh đang quản lý hằng ngày: (1) Nhân sự – học viên và tra cứu chứng nhận; (2) Thiết bị – kiểm định; (3) Tai nạn – sự cố và giao việc khắc phục; (4) Cấp phát PPE và vật tư – hóa chất; (5) Dashboard và báo cáo cho lãnh đạo (Phần 5).",
  "**Ba điểm phải xác nhận trước khi gặp:** (a) người đại diện hiện tại (hồ sơ 2019 ghi Giám đốc Mai Quốc Trưởng; báo Sài Gòn Giải Phóng ngày 24/10/2025 ghi Đại tá Đinh Văn Tuân); (b) quy định áp dụng riêng cho doanh nghiệp quốc phòng đối với quân nhân và công nhân viên quốc phòng; (c) yêu cầu về lưu trữ và bảo mật dữ liệu, vì nhân viên kinh doanh không tự cam kết nội dung này."
]);
note("Cơ hội tiếp cận", [
  "Ngày 24/10/2025, tại lễ kỷ niệm 50 năm truyền thống Nhà máy X51, lãnh đạo Tổng cục Công nghiệp Quốc phòng yêu cầu nhà máy đẩy mạnh chuyển đổi số trong sản xuất và quản lý, đồng thời chú trọng nguồn nhân lực chất lượng cao (Báo Sài Gòn Giải Phóng, 24/10/2025) ✅. Phần mềm quản lý ATLĐ có thể được trình bày như một bước cụ thể của định hướng này."
]);
note("Cách đọc ký hiệu độ tin cậy", [
  "✅ Có nguồn: hồ sơ năng lực Hải Minh 2019, báo chí chính thống, hoặc bộ tài liệu tư vấn ngành của Viện STP – DAKO.",
  "⚠ Cần xác nhận: suy luận từ tài liệu ngành hoặc thông tin có thể đã thay đổi; chuyên viên Viện STP – DAKO xác nhận khi khảo sát.",
  "✗ Khoảng trống: chưa tìm được dữ liệu; không ước lượng thay."
]);

// ===================== PHẦN 2 =====================
h1("PHẦN 2. HỒ SƠ KHÁCH HÀNG HẢI MINH");
h2("2.1. Nhận diện doanh nghiệp");
table(["Hạng mục", "Thông tin", "Độ tin cậy / nguồn"], [
  ["Tên pháp lý", "Công ty TNHH MTV Đóng và Sửa tàu Hải Minh (Hai Minh Shipyard)", "✅ Hồ sơ năng lực 2019"],
  ["Phiên hiệu quân sự", "Nhà máy X51", "✅ Hồ sơ 2019; báo SGGP 24/10/2025"],
  ["Thành lập và chuyển đổi", "Thành lập 26/10/1975. Chuyển thành Công ty TNHH MTV theo Quyết định 1380/QĐ-BQP ngày 30/4/2010 của Bộ Quốc phòng", "✅ Hồ sơ 2019"],
  ["Cơ quan chủ quản", "Bộ Quốc phòng, Tổng cục Công nghiệp Quốc phòng, Tổng công ty Ba Son", "✅ Báo Soha (từ báo Quân đội nhân dân) 23/10/2015 và báo SGGP 24/10/2025 cùng nêu; hồ sơ 2019 không nêu Ba Son"],
  ["Người đứng đầu", "Hồ sơ 2019: Giám đốc Mai Quốc Trưởng. Báo SGGP 24/10/2025: Đại tá Đinh Văn Tuân, Giám đốc Nhà máy X51", "⚠ Xác nhận trước khi ghi tên vào đề xuất"],
  ["Địa chỉ", "1042 Huỳnh Tấn Phát, Nhà Bè, TP. Hồ Chí Minh; mũi Nhà Bè, liền kề ngã ba sông Sài Gòn, Soài Rạp, Lòng Tàu; cách trung tâm thành phố khoảng 14 km", "✅ Hồ sơ 2019. ⚠ Tên phường, xã có thể đã đổi sau đợt sắp xếp đơn vị hành chính; kiểm tra khi lập hợp đồng"],
  ["Liên hệ theo hồ sơ 2019", "(028) 3782 9403; contact@haiminhshipyard.com; www.haiminhshipyard.com", "⚠ Kiểm tra còn hiệu lực"],
  ["Chứng nhận", "ISO 9001 do Bureau Veritas cấp (bản 2008 và 2015); giấy chứng nhận của Cục Đăng kiểm Việt Nam về năng lực chế tạo và cung cấp dịch vụ", "✅ Hồ sơ 2019. ⚠ Đối chiếu thời hạn hiện hành"],
  ["Khen thưởng", "Anh hùng Lực lượng vũ trang nhân dân (2013); 4 Huân chương Chiến công hạng Nhất; Huân chương Quân công hạng Nhì (2015); 2 Huân chương Bảo vệ Tổ quốc hạng Ba (trong đó đợt mới nhất 10/2025); 1 Huân chương Lao động hạng Ba", "✅ Báo SGGP 24/10/2025; hồ sơ 2019"],
  ["Tổng số lao động", "Chưa tìm được số liệu từ nguồn chính thống", "✗ Khoảng trống"]
], [2000, 4300, 2771], { labelCol: true });
note("Tránh nhầm lẫn tên", [
  "Công ty cổ phần Hải Minh (mã chứng khoán HMH, hoạt động tiếp vận, đại lý hàng hải, trụ sở Hải Phòng) là doanh nghiệp hoàn toàn khác. Khi tra cứu thông tin trực tuyến cần ghi đầy đủ “Đóng và Sửa tàu Hải Minh” hoặc “Nhà máy X51”."
]);

h2("2.2. Hoạt động và sản phẩm");
p("Hồ sơ 2019 cho biết Hải Minh sửa chữa tàu chiến, tàu Hải quân, tàu Cảnh sát biển, tàu Kiểm ngư có lượng giãn nước đến 2.000 tấn, và tàu kinh tế, tàu vận tải, tàu du lịch đến 6.500 tấn ✅. Các sản phẩm tiêu biểu:");
table(["Nhóm sản phẩm", "Ví dụ theo hồ sơ 2019", "Ý nghĩa đối với ATLĐ"], [
  ["Đóng mới tàu quân sự và chấp pháp", "Tàu tìm kiếm cứu nạn FC-624 (dài 63,1 m, bàn giao 9/2017); tàu kiểm ngư KN-750 (3 tàu); KN-3600 (KN-506, KN-508); tàu trinh sát TS-500CV (4 tàu, đã bàn giao 3); tàu kéo cứu hộ TKCN-2000 (5 tàu)", "Thân vỏ thép, thượng tầng nhôm: hàn cắt thép và nhôm, ghép tổng đoạn bằng cẩu, hạ thủy, chạy thử trên sông và biển"],
  ["Đóng mới liên danh với Piriou Việt Nam (SEAS)", "Tàu cá ngừ đại dương 90 m (6 tàu) và 80 m (2 tàu); tàu câu LongLiner 63 m và 21 m; tàu kéo 30 m (7 tàu trước 2014 và 8 tàu giai đoạn 2018–2020); tàu dịch vụ dàn khoan FPSV w53 bằng nhôm", "Nhiều tàu thương mại xuất khẩu; có đối tác cùng làm việc trên khu vực nhà máy ⚠"],
  ["Hiện đại hóa, sửa chữa, hoán cải", "Tàu Hải quân, Cảnh sát biển, Kiểm ngư; tàu dịch vụ, tàu du lịch, tàu tư nhân", "Lao động biến động theo từng tàu vào sửa; vào ụ, lên đà; vệ sinh két; phun bi và sơn"],
  ["Gia công kết cấu thép, kim loại", "Nêu trong lời ngỏ của hồ sơ 2019", "Hàn cắt, máy gia công, cầu trục, lắp dựng"]
], [2300, 3800, 2971], { labelCol: true });

h2("2.3. Cơ sở hạ tầng, thiết bị và nguy cơ ATLĐ liên quan");
p("Bảng sau đối chiếu cơ sở vật chất trong hồ sơ năng lực với các nhóm công việc thuộc Danh mục nghiêm ngặt (Thông tư 06/2020/TT-BLĐTBXH). Cột cuối chỉ cụm thẻ tư vấn trong tài liệu ngành số 12 để chuyên viên tra cứu nội dung huấn luyện.");
table(["Hạng mục (hồ sơ 2019)", "Công việc và nguy cơ", "Nhóm và cụm tham chiếu"], [
  ["Ụ chìm 5.000 DWT: dài 120 m, rộng 21 m, sâu 6 m; cẩu trục cổng 240T/10T và cẩu trục 25T/3,5T", "Cẩu lắp tổng đoạn, vào ra ụ, chèn kê, làm việc trên cao, người rơi xuống nước", "Nhóm 3; cụm 11 và 18"],
  ["Đốc nổi 1.000T (60 x 19 x 9,7 m); sàn nâng thủy lực 2.270T (92,8 x 12,64 m)", "Vận hành đốc nổi, bơm ụ, kéo tàu lên triền, hạ thủy", "Nhóm 3; cụm 14 và 18"],
  ["Cầu tàu 10.000 DWT (220 x 18 m, sâu 8 m); cầu cảng 1.000T (294 x 40 m)", "Buộc, cởi dây tàu, bến trang bị, làm việc ở mép nước", "Nhóm 3; cụm 12 và 14"],
  ["Dây chuyền phun bi và sơn; dây chuyền phun bi di động", "Phun bi, phun cát, sơn, dung môi, bụi, tiếng ồn", "Nhóm 3 và an toàn hóa chất; cụm 17"],
  ["Máy cắt CNC gas và plasma; máy lốc 3 trụ; máy uốn ống; máy tiện trục", "Máy gia công, cắt kim loại, hàn", "Nhóm 3; cụm 15 và 16"],
  ["Xe cẩu 70 tấn", "Thiết bị nâng di động, người ra tín hiệu, móc cáp", "Nhóm 3; cụm 11"],
  ["Dàn thử bơm cao áp", "Thử áp lực, vùng nguy hiểm khi thử", "Nhóm 3; ⚠ xác nhận loại thiết bị"],
  ["Sửa chữa khí tài (hồ sơ 2019 có ảnh)", "Công việc đặc thù quân sự", "⚠ Ngoài phạm vi hồ sơ năng lực; ghi nhận và báo chuyên viên"],
  ["Tổng diện tích gần 16 ha: văn phòng 7.370 m2, nhà xưởng 10.600 m2, bãi đóng tàu 28.000 m2, kho bãi 2.630 m2", "Nhiều khu vực, nhiều xưởng cùng hoạt động", "Cần cấp tài khoản phần mềm theo bộ phận"]
], [3400, 3200, 2471], { labelCol: true });

h2("2.4. Cơ cấu tổ chức theo sơ đồ năm 2019");
table(["Cấp", "Đơn vị theo sơ đồ", "Ghi chú"], [
  ["Lãnh đạo", "Chủ tịch công ty; Giám đốc công ty; Kiểm soát viên", "✅"],
  ["Phó giám đốc", "PGĐ Nội chính – Đóng mới; PGĐ Công nghệ; PGĐ Sản xuất; PGĐ Kỹ thuật", "✅ Bốn phó giám đốc"],
  ["Phòng ban", "Thiết kế công nghệ; Hành chính – Hậu cần; An toàn (HSE); KCS; Kế hoạch sản xuất; Tài chính – Kế toán; Tổ chức lao động; Vật tư; Kỹ thuật; Chính trị", "✅ Mười phòng. Đã có Phòng an toàn (HSE)"],
  ["Xưởng", "Vỏ tàu I; Vỏ tàu II; Cơ khí; Đà đốc; Ống; Động lực; Điện – điện tử; Cơ điện; Cảng vụ; Mộc trang trí", "✅ Mười xưởng"],
  ["Đơn vị ngoài địa điểm", "Trạm Cam Ranh", "⚠ Sơ đồ ghi chú chưa rõ ràng; xác nhận chức năng và số người"]
], [1900, 4700, 2471], { labelCol: true });
p("Sơ đồ này có từ năm 2019. Cơ cấu hiện hành (tên phòng, số xưởng, phòng y tế nếu có) cần xác nhận lại ⚠.");

h2("2.5. Dữ liệu nhân lực đã biết và khoảng trống");
bul([
  "**Số liệu năm 2015** (báo Quân đội nhân dân, đăng lại trên Soha ngày 23/10/2015) ✅: 8 thạc sĩ, 110 cán bộ trình độ đại học, 147 thợ bậc cao; hơn 80 thợ hàn đạt chứng chỉ Bureau Veritas và hàng chục thợ hàn đạt chứng chỉ ABS. Đây là số liệu cũ, chỉ dùng để hình dung cơ cấu, không dùng để báo giá.",
  "**Hồ sơ 2019** ✅: đội ngũ kỹ sư, kỹ thuật viên được đào tạo hằng năm; quá trình thi công theo quy trình công nghệ và có giám sát viên hiện trường.",
  "**Chưa có** ✗: tổng số lao động; cơ cấu quân nhân, công nhân viên quốc phòng và lao động hợp đồng; số lao động theo từng xưởng; số tổ đội khoán và nhà thầu phụ; số ca làm việc.",
  "**Ý nghĩa với quy mô bộ phận ATVSLĐ:** Điều 36 Nghị định 39/2016/NĐ-CP xếp “đóng và sửa chữa tàu biển” vào nhóm cơ sở có yêu cầu cao hơn; số người làm công tác ATVSLĐ tối thiểu phụ thuộc tổng số lao động (xem mục 4.7). Cần có tổng số lao động mới kết luận được."
]);

h2("2.6. Lưu ý khi tiếp cận khách hàng này");
bul([
  "**Doanh nghiệp quốc phòng** ⚠: khi ký hợp đồng và triển khai cần làm việc với đầu mối do nhà máy chỉ định. Quy định riêng của Bộ Quốc phòng đối với quân nhân, công nhân viên quốc phòng không nằm trong tài liệu tư vấn; chuyên viên Viện xác nhận.",
  "**Thiết bị xếp dỡ chuyên dùng** trong cơ sở đóng, sửa chữa tàu (cẩu cổng trục, cẩu bờ...) có chế độ chứng nhận, kiểm định riêng của ngành giao thông vận tải (Thông tư 35/2011/TT-BGTVT và các văn bản sửa đổi, QCVN 22:2018/BGTVT). Nhân viên kinh doanh không hứa kiểm định loại thiết bị này; phần mềm chỉ lưu hồ sơ và nhắc hạn ✅ (tài liệu ngành số 12, mục 3.3).",
  "**Hiệu lực pháp lý ngày 22/10/2026** ✅: vẫn áp dụng sáu nhóm huấn luyện theo Nghị định 44/2016/NĐ-CP (sửa đổi bởi Nghị định 140/2018/NĐ-CP). Dự án Luật sửa đổi, bổ sung một số điều của Luật ATVSLĐ đã được Ủy ban Thường vụ Quốc hội cho ý kiến ngày 23/9/2026 và chưa có hiệu lực. Tài liệu ngành số 12 còn nêu Nghị quyết 66.18/2026/NQ-CP (cơ chế tạm thời từ 01/7/2026 đến hết 28/02/2027). Khi văn bản mới có hiệu lực, mục 4.7 và Phần 3 cần cập nhật.",
  "**Không có dữ liệu** về tai nạn lao động hay vi phạm của Hải Minh trong các nguồn đã tra cứu; báo cáo không suy diễn về tình hình an toàn hiện tại của nhà máy."
]);

// ===================== PHẦN 3 =====================
h1("PHẦN 3. SÁU NHÓM HUẤN LUYỆN ATVSLĐ");
p("Sáu nhóm do Nghị định 44/2016/NĐ-CP (sửa đổi bởi Nghị định 140/2018/NĐ-CP) quy định. Số giờ là mức tối thiểu, đã gồm thời gian kiểm tra (trừ Nhóm 6); chương trình và thời lượng thực tế do Viện STP – DAKO xác định ✅.");
table(["Nhóm", "Đối tượng", "Lần đầu", "Định kỳ"], [
  ["Nhóm 1", "Người quản lý, chỉ huy sản xuất: người đứng đầu đơn vị, phòng, ban; người phụ trách bộ phận; quản đốc; cấp phó được giao phụ trách ATVSLĐ", "16 giờ", "2 năm/lần, tối thiểu 50% thời gian lần đầu"],
  ["Nhóm 2", "Người làm công tác ATVSLĐ: chuyên trách, bán chuyên trách; người giám sát ATVSLĐ tại nơi làm việc", "48 giờ", "2 năm/lần, tối thiểu 50%"],
  ["Nhóm 3", "Người làm công việc có yêu cầu nghiêm ngặt về ATVSLĐ theo Danh mục (Thông tư 06/2020/TT-BLĐTBXH)", "24 giờ", "2 năm/lần, tối thiểu 50%"],
  ["Nhóm 4", "Người lao động khác, kể cả người học nghề, tập nghề, thử việc", "16 giờ", "Hằng năm, ít nhất 1 lần, tối thiểu 50%"],
  ["Nhóm 5", "Người làm công tác y tế tại đơn vị", "56 giờ", "2 năm/lần, tối thiểu 50%"],
  ["Nhóm 6", "An toàn, vệ sinh viên (Điều 74 Luật ATVSLĐ); học thêm, vẫn giữ nhóm của công việc chính", "4 giờ", "Theo quy định về cập nhật kiến thức"]
], [1100, 4400, 1300, 2271], { labelCol: true });
bul([
  "Giấy chứng nhận huấn luyện và Thẻ an toàn có thời hạn 2 năm.",
  "Người lao động nghỉ từ 6 tháng trở lên, hoặc cơ sở ngừng hoạt động từ 6 tháng trở lên, phải huấn luyện lại (tối thiểu 50% thời gian lần đầu). Tình huống này gặp ở nhà máy đóng tàu ngừng giữa hai hợp đồng, và ở lao động thời vụ theo tàu.",
  "Một người có thể thuộc nhiều nhóm, ví dụ quản đốc xưởng vừa Nhóm 1 vừa Nhóm 3 khi trực tiếp điều hành công việc nghiêm ngặt. Khi đó huấn luyện đủ các nhóm tương ứng.",
  "Các nhóm công việc trong Danh mục liên quan đóng, sửa chữa tàu: máy, thiết bị thuộc danh mục; hóa chất nguy hiểm; làm sạch bề mặt kim loại; làm việc trên cao từ 2 m; trên sông, biển, mặt nước và máy trong hầm tàu; không gian hạn chế; điện; hàn, cắt kim loại; lái xe ô tô; bốc xếp thủ công vật nặng; máy gia công, băng tải."
]);

// ===================== PHẦN 4 =====================
h1("PHẦN 4. VỊ TRÍ NHÂN SỰ VÀ NHÓM HUẤN LUYỆN TẠI HẢI MINH");
h2("4.1. Cách xếp nhóm");
p("Bốn câu hỏi trong tài liệu ngành dùng để xếp nhóm cho từng người ✅:");
num([
  "Có đứng đầu một đơn vị (công ty, phòng, phân xưởng, đội) hoặc phụ trách bộ phận sản xuất, kỹ thuật, kinh doanh không? Có: Nhóm 1.",
  "Có làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hay giám sát ATVSLĐ trực tiếp không? Có: Nhóm 2.",
  "Có trực tiếp làm công việc thuộc Danh mục nghiêm ngặt không (thiết bị nâng, thiết bị áp lực, hàn cắt, trên cao từ 2 m, mặt nước, khoang và két, hóa chất, điện, lái xe, máy gia công, làm sạch bề mặt kim loại)? Có: Nhóm 3.",
  "Làm công tác y tế: Nhóm 5. Được cử làm an toàn, vệ sinh viên: thêm Nhóm 6. Còn lại: Nhóm 4."
]);
p("Một người rơi vào nhiều câu thì huấn luyện đủ các nhóm tương ứng. Trường hợp ranh giới ghi vào bảng thu thập số liệu (Phần 6) để chuyên viên rà soát.");

h2("4.2. Lãnh đạo, phòng chức năng và hỗ trợ");
p("Bảng xếp nhóm theo sơ đồ tổ chức năm 2019 (mục 2.4) và Phần 4 của tài liệu ngành số 12.");
table(["Vị trí nhân sự", "Nhóm", "Ghi chú xếp nhóm"], [
  ["Chủ tịch công ty; Giám đốc", "Nhóm 1", "Người đứng đầu đơn vị ✅"],
  ["Bốn Phó giám đốc: Nội chính – Đóng mới, Công nghệ, Sản xuất, Kỹ thuật", "Nhóm 1", "Bắt buộc nếu phụ trách ATVSLĐ hoặc bộ phận sản xuất, kỹ thuật; khuyến nghị huấn luyện cho tất cả cấp phó ✅"],
  ["Kiểm soát viên", "Nhóm 4 ⚠", "Không thuộc nhóm nào nêu rõ trong tài liệu; xếp mặc định Nhóm 4, chuyên viên xác nhận"],
  ["Trưởng phòng: Kỹ thuật, Thiết kế công nghệ, Kế hoạch sản xuất, Vật tư, KCS, Tổ chức lao động, Hành chính – Hậu cần, Tài chính – Kế toán, Chính trị; Trạm trưởng Cam Ranh", "Nhóm 1", "Người đứng đầu phòng, ban. Phó phòng: Nhóm 1 nếu phụ trách ATVSLĐ hoặc bộ phận, còn lại Nhóm 4 ✅"],
  ["Trưởng Phòng an toàn (HSE)", "Nhóm 1 và Nhóm 2", "Vừa đứng đầu bộ phận, vừa làm công tác ATVSLĐ ✅"],
  ["Cán bộ ATVSLĐ chuyên trách, kiêm nhiệm; giám sát an toàn tại đà, ụ, cầu tàu, xưởng", "Nhóm 2", "Gồm cả người kiêm nhiệm. Huấn luyện Nhóm 2 không thay bằng cấp theo Điều 36 ✅"],
  ["Nhân viên y tế, y tá, bác sĩ (nếu có phòng y tế)", "Nhóm 5", "⚠ Sơ đồ 2019 không thể hiện phòng y tế; hỏi khách hàng"],
  ["Kỹ sư thiết kế tàu, thiết kế công nghệ, kế hoạch tiến độ, định mức, quản lý tài liệu", "Nhóm 4", "Khi xuống hiện trường vẫn phải phổ biến nội quy và cấp PPE ✅"],
  ["Kỹ sư thiết bị, cơ giới, cơ điện, bảo trì cẩu và thiết bị", "Nhóm 3", "Khi trực tiếp kiểm tra, bảo dưỡng thiết bị thuộc Danh mục; thêm nhóm trên cao khi lên cẩu ✅"],
  ["Kỹ sư giám sát thi công, kỹ sư hiện trường đóng, sửa chữa tàu; kỹ sư lắp đặt, chạy thử", "Nhóm 3 hoặc Nhóm 4", "Nhóm 3 nếu thường xuyên lên tàu, trên cao, trong hầm, két, đi thử máy; Nhóm 4 nếu chủ yếu làm văn phòng ✅"],
  ["Nhân viên KCS, QC, kiểm tra chất lượng", "Nhóm 4", "Xem xét Nhóm 3 nếu thường xuyên làm việc trên tàu, trên mặt nước, trên cao, trong hầm ✅"],
  ["Nhân viên kiểm tra không phá hủy (NDT) mối hàn", "Theo công việc ⚠", "Chụp bằng bức xạ: Nhóm 3 kèm quy định an toàn bức xạ riêng, ngoài phạm vi hồ sơ năng lực. Hồ sơ 2019 không nêu có đơn vị NDT"],
  ["Kế toán, thủ quỹ, hành chính, nhân sự, văn thư, thư ký, mua hàng, IT", "Nhóm 4", "Lao động văn phòng ✅"],
  ["Thủ kho vật tư, kho dụng cụ", "Nhóm 4", "Nhóm 3 nếu thường xuyên bốc xếp thủ công vật nặng từ 30 kg, vận hành xe nâng, cầu trục ✅"],
  ["Thủ kho hóa chất, sơn, dung môi, khí công nghiệp", "Nhóm 3", "Bổ sung huấn luyện an toàn hóa chất ✅"],
  ["Lái xe con, xe tải, xe chở công nhân; thợ sửa chữa, bảo dưỡng ô tô", "Nhóm 3", "Lái, sửa chữa ô tô thuộc Danh mục ✅"],
  ["Bảo vệ, tạp vụ, nhân viên cổng; nhân viên bếp ăn", "Nhóm 4", "Bếp ăn tập thể từ 300 suất/ngày trở lên, trực tiếp nấu: xem xét Nhóm 3 ⚠. Bảo vệ thuê ngoài do đơn vị cung ứng huấn luyện ✅"],
  ["Đội phòng cháy chữa cháy cơ sở, an ninh, đội cứu hộ", "Ngoài phạm vi ⚠", "Huấn luyện nghiệp vụ PCCC và an ninh theo quy định riêng. Chỉ đội cứu hộ, cứu nạn chuyên nghiệp mới thuộc Nhóm 3 ✅"]
], [3900, 1500, 3671], { labelCol: false, boldCol: 1 });

h2("4.3. Các xưởng sản xuất");
p("Bảng xếp nhóm theo từng xưởng trong sơ đồ năm 2019. Cột cuối chỉ thẻ tư vấn trong tài liệu ngành để chuyên viên lấy nội dung huấn luyện. Quản đốc và phó quản đốc của mọi xưởng là Nhóm 1; khuyến nghị thêm Nhóm 3 khi trực tiếp điều hành và kiểm tra công việc nghiêm ngặt. Tổ trưởng, thợ chính là Nhóm 3 và nên được cử làm an toàn, vệ sinh viên (thêm Nhóm 6) ✅.");
table(["Xưởng", "Vị trí tiêu biểu và nhóm", "Nội dung trọng tâm và tham chiếu"], [
  ["Vỏ tàu I và Vỏ tàu II (Hull)", ["Thợ hàn hồ quang, MIG/MAG, TIG; thợ cắt gas, plasma; thợ gò; thợ ghép tổng đoạn; thợ lắp ráp thân tàu: Nhóm 3 (hàn cắt; thêm trên cao, không gian hạn chế nếu có)", "Phụ hàn, phụ việc: Nhóm 3 nếu trực tiếp làm việc thuộc Danh mục, còn lại Nhóm 4"], "Điện giật khi hàn trong khoang ẩm, khói hàn, cháy nổ khi hàn gần két, chai khí, ghép tổng đoạn bằng cẩu. Thẻ 5.15 (tài liệu 12). Nhà máy đào tạo thợ hàn đạt chứng chỉ BV và ABS để đóng tàu kim loại nhẹ ✅ (Soha 2015); yêu cầu thông gió, hút khói hàn riêng cho hàn nhôm là nhận định cần khảo sát ⚠"],
  ["Đà đốc (Docking)", ["Đốc công, công nhân hạ thủy, kéo tàu lên triền, vận hành ụ chìm, đốc nổi, sàn nâng, bơm ụ: Nhóm 3", "Lái cẩu cổng trục 240T/10T, 25T/3,5T, xe cẩu 70T; người ra tín hiệu, thợ móc cáp: Nhóm 3 (thêm trên cao khi lên cabin)", "Thợ dựng giàn giáo, làm việc trên mạn tàu: Nhóm 3"], "Thẻ 5.11 và 5.18. Kiểm tra thiết bị trước ca, vùng cấm dưới tải, vào ra ụ, hạ thủy, người rơi xuống nước"],
  ["Ống (Piping)", ["Thợ lắp ống, hàn ống, thợ thử áp lực: Nhóm 3"], "Thẻ 5.16. Thử thủy lực, lắp ống trên cao và trong khoang"],
  ["Động lực (Machinery)", ["Thợ máy tàu, thợ lắp máy chính, trục chân vịt, thợ cơ khí hầm máy: Nhóm 3"], "Thẻ 5.16. Hầm máy là không gian hạn chế, cô lập năng lượng khi sửa chữa"],
  ["Điện – điện tử và Cơ điện", ["Thợ điện tàu, thợ lắp cáp, điện – điện tử hàng hải, điện cấp bờ, thợ tự động hóa (PLC): Nhóm 3", "Bổ sung huấn luyện an toàn điện (Thông tư 05/2021/TT-BCT)"], "Thẻ 5.16 và 5.19. Khóa – gắn thẻ, kiểm tra không điện, hồ quang"],
  ["Cơ khí (Mechanical)", ["Thợ tiện, phay, bào, mài, nguội; thợ vận hành máy cắt CNC, máy lốc 3 trụ, máy uốn ống: Nhóm 3", "Thợ vận hành máy dập, chấn, cuốn, ép: Nhóm 3"], "Thẻ 5.16 và khối H tài liệu ngành Cơ khí – Chế tạo (số 04): che chắn, dừng khẩn cấp, xử lý phoi"],
  ["Cảng vụ (Port service)", ["Công nhân cầu tàu, buộc – cởi dây tàu, bến trang bị: Nhóm 3 (mặt nước)", "Thuyền viên tàu công vụ, xuồng, thợ lặn (nếu có): Nhóm 3 và nghiệp vụ riêng"], "Thẻ 5.12 và 5.14. ⚠ Hồ sơ không mô tả chức năng xưởng này; xác nhận công việc thực tế. Nghiệp vụ hàng hải, lặn ngoài phạm vi hồ sơ năng lực"],
  ["Mộc trang trí (Carpentry)", ["Thợ cưa, bào, phay, khoan, đục, chà nhám bằng máy: Nhóm 3", "Thợ sơn phun, pha sơn, keo: Nhóm 3 (hóa chất); thợ lắp ráp, chà nhám tay: Nhóm 4 hoặc Nhóm 3 tùy máy sử dụng"], "Khối I đến K tài liệu ngành Gỗ – Nội thất (số 11). ⚠ Cần liệt kê máy gỗ thực tế để xếp nhóm chính xác"],
  ["Trạm Cam Ranh", ["Xếp nhóm theo công việc tương tự các xưởng trên"], "⚠ Xác nhận loại công việc, số người; huấn luyện cần lịch riêng vì khác địa điểm"],
  ["Công việc xuyên xưởng: phun bi, phun cát, sơn tàu, vệ sinh két, vào khoang", ["Thợ phun bi, phun cát, sơn tàu, pha sơn: Nhóm 3 (làm sạch bề mặt kim loại, hóa chất) và an toàn hóa chất", "Thợ vệ sinh két, người vào khoang kín, người canh gác bên ngoài: Nhóm 3 (không gian hạn chế)"], "Thẻ 5.17. Kiểm tra khí trước khi vào, thông gió, người canh gác, kế hoạch cứu nạn. ⚠ Xác định đơn vị phụ trách (xưởng hay tổ đội thuê ngoài)"],
  ["Thiết bị áp lực và khí", ["Vận hành nồi hơi, máy nén khí, bình khí nén, trạm khí oxy, axetylen, LPG: Nhóm 3"], "Thẻ 5.19. ⚠ Hồ sơ 2019 không nêu; hỏi khách hàng có hay không"]
], [1800, 3900, 3371], { labelCol: true });

h2("4.4. Lao động thuê ngoài, thời vụ và người ngoài");
table(["Đối tượng", "Xếp nhóm", "Việc của Hải Minh và của Viện"], [
  ["Tổ đội khoán (hàn, sơn, giàn giáo, vệ sinh két, bảo trì), lao động thuê lại, thợ thuê theo tàu ⚠", "Theo công việc; thường Nhóm 3", "Trách nhiệm huấn luyện theo hợp đồng và Điều 30 đến 32 Nghị định 39/2016/NĐ-CP. Nhà máy kiểm tra chứng nhận trước khi cho vào; dùng cổng tra cứu chứng nhận"],
  ["Lao động thời vụ, học việc, thử việc, thực tập sinh, sinh viên thực tập", "Nhóm 3 hoặc Nhóm 4 theo công việc", "Huấn luyện trước khi giao việc thuộc Danh mục"],
  ["Nhân sự của đối tác cùng khu vực, ví dụ Piriou Việt Nam (SEAS) ⚠", "Do đơn vị sử dụng lao động của họ huấn luyện", "Hồ sơ 2019 nêu liên danh với Piriou Việt Nam; một số trang tuyển dụng ghi cùng địa chỉ 1042 Huỳnh Tấn Phát (nguồn thứ cấp). Xác nhận mô hình làm việc chung"],
  ["Đại diện chủ tàu (Hải quân, Cảnh sát biển, Kiểm ngư), đăng kiểm viên, giám định viên, khách vào nhà máy", "Không thuộc sáu nhóm", "Phổ biến nội quy và cấp PPE trước khi vào khu vực làm việc ✅"]
], [3300, 2000, 3771], { labelCol: true });

h2("4.5. Tổng hợp theo nhóm huấn luyện");
table(["Nhóm", "Đối tượng tại Hải Minh", "Mức ưu tiên"], [
  ["Nhóm 1", "Chủ tịch, Giám đốc, 4 Phó giám đốc, trưởng các phòng, quản đốc và phó quản đốc 10 xưởng, trạm trưởng; trưởng Phòng an toàn", "Cao: cửa vào, người quyết định nguồn lực"],
  ["Nhóm 2", "Trưởng và cán bộ Phòng an toàn (HSE); cán bộ kiêm nhiệm; giám sát an toàn tại đà, ụ, cầu tàu, xưởng", "Cao: người dùng phần mềm nhiều nhất"],
  ["Nhóm 3", "Thợ hàn, cắt, gò, lắp ráp; thợ máy, điện, ống, cơ khí; phun bi, sơn, vệ sinh két; vận hành cẩu, ụ, đốc nổi, sàn nâng; công nhân cầu tàu; thợ mộc dùng máy; lái xe; thủ kho hóa chất; kỹ sư thiết bị và hiện trường; tổ trưởng, thợ chính", "Cao nhất về số lượng và rủi ro; chia đợt theo xưởng và theo kíp"],
  ["Nhóm 4", "Văn phòng, thiết kế, KCS, kế toán, vật tư, hành chính, bảo vệ, tạp vụ; người học nghề, thử việc làm việc không thuộc Danh mục", "Trung bình: huấn luyện theo đợt lớn, nhắc hạn hằng năm"],
  ["Nhóm 5", "Nhân viên y tế nếu nhà máy có phòng y tế", "⚠ Chưa xác định"],
  ["Nhóm 6", "An toàn, vệ sinh viên của từng xưởng, tổ, ca: tổ trưởng, thợ chính, công nhân có kinh nghiệm", "Trung bình: học thêm sau Nhóm 3"]
], [1200, 5300, 2571], { labelCol: true });

h2("4.6. Trường hợp ranh giới cần xác nhận khi gặp khách hàng");
num([
  "Kiểm soát viên và các chức danh đặc thù của doanh nghiệp quân đội (Chủ tịch công ty, cán bộ chính trị): đã giữ vị trí quản lý hay chỉ phụ trách công tác đảng, chính trị.",
  "Kỹ sư hiện trường, giám sát thi công: tần suất lên tàu, vào hầm, két, đi thử máy để quyết định Nhóm 3 hay Nhóm 4.",
  "Nhân viên KCS, kiểm tra không phá hủy: có chụp bằng bức xạ không.",
  "Xưởng Cảng vụ: công việc thực tế (cầu tàu, tàu công vụ, lặn).",
  "Xưởng Mộc trang trí: danh mục máy gỗ và có phòng sơn không.",
  "Trạm Cam Ranh: loại công việc, số người, khoảng cách.",
  "Phun bi, sơn, vệ sinh két: tự làm hay giao thầu phụ.",
  "Nồi hơi, máy nén khí, trạm khí oxy, axetylen: có hay không và do bộ phận nào quản lý.",
  "Bếp ăn tập thể: số suất ăn mỗi ngày và tự nấu hay thuê ngoài.",
  "Lực lượng PCCC cơ sở, cứu hộ, an ninh: đơn vị và chương trình huấn luyện riêng."
]);

h2("4.7. Số người làm công tác ATVSLĐ theo Điều 36 Nghị định 39/2016/NĐ-CP");
p("Nhà máy đóng và sửa chữa tàu biển thuộc nhóm cơ sở có yêu cầu cao hơn (khoản 1 Điều 36). Mỗi người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2 ✅.");
table(["Tổng số lao động của doanh nghiệp", "Người làm công tác ATVSLĐ tối thiểu"], [
  ["Dưới 50 người", "01 người bán chuyên trách"],
  ["Từ 50 đến dưới 300 người", "01 người chuyên trách"],
  ["Từ 300 đến dưới 1.000 người", "02 người chuyên trách"],
  ["Trên 1.000 người", "Phòng ATVSLĐ hoặc tối thiểu 03 người chuyên trách"]
], [4500, 4571], { labelCol: true });
p("⚠ Hải Minh đã có Phòng an toàn (HSE). Việc áp dụng bảng trên và tiêu chuẩn bằng cấp của người làm ATVSLĐ do chuyên viên xác định sau khi có tổng số lao động và ngành nghề đăng ký thực tế.");

h2("4.8. Thứ tự đề xuất và dịch vụ đi kèm");
num([
  "Nhóm 1 cho ban giám đốc, trưởng phòng, quản đốc: nắm trách nhiệm và quyết định nguồn lực.",
  "Nhóm 2 cho Phòng an toàn (HSE): người dùng phần mềm hằng ngày.",
  "Nhóm 3 theo cụm xưởng và theo kíp: ưu tiên hàn cắt, đà đốc và cẩu, khoang và két, phun bi và sơn, điện.",
  "Nhóm 4 cho toàn bộ người còn lại, theo đợt lớn; Nhóm 6 cho an toàn, vệ sinh viên mỗi xưởng, tổ."
]);
p("Dịch vụ có thể gợi ý khi phù hợp (theo hồ sơ năng lực Viện STP – DAKO) ✅:");
bul([
  "Huấn luyện an toàn điện (Thông tư 05/2021/TT-BCT): xưởng điện, cơ điện, điện cấp bờ.",
  "Huấn luyện an toàn hóa chất (Nghị định 113/2017/NĐ-CP): phun bi, sơn tàu, kho sơn và khí.",
  "Huấn luyện sơ cấp cứu (Thông tư 19/2016/TT-BYT): ngã cao, đuối nước, ngạt khí trong khoang, điện giật, bỏng.",
  "Quan trắc môi trường lao động: khói hàn, phun bi, hơi sơn, tiếng ồn.",
  "Đánh giá rủi ro, xây dựng biện pháp: hạ thủy, vào ụ, hàn trong két, cẩu lắp tổng đoạn, thử đường dài.",
  "Tư vấn ISO 45001 khi chủ tàu hoặc đối tác nước ngoài yêu cầu."
]);
p("Ngoài phạm vi hồ sơ năng lực, nhân viên kinh doanh chỉ ghi nhận nhu cầu và báo chuyên viên: huấn luyện PCCC và cứu nạn cứu hộ, an toàn bức xạ, nghiệp vụ thuyền viên và hàng hải, an ninh bến cảng, nghiệp vụ lặn, kiểm định thiết bị xếp dỡ thuộc chế độ giao thông vận tải ✅.");

module.exports = A;
