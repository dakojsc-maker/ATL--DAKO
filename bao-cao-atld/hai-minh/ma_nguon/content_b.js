// Nội dung Phần 5–6 và Phụ lục
const B = [];
const h1 = (text) => B.push({ t: "h1", text });
const h2 = (text) => B.push({ t: "h2", text });
const p = (text) => B.push({ t: "p", text });
const bul = (items) => B.push({ t: "bul", items });
const num = (items) => B.push({ t: "num", items });
const note = (title, lines) => B.push({ t: "note", title, lines });
const table = (head, rows, widths, opt = {}) => B.push({ t: "table", head, rows, widths, ...opt });
const feature = (f) => B.push({ t: "feature", ...f });

// ===================== PHẦN 5 =====================
h1("PHẦN 5. TÍNH NĂNG PHẦN MỀM QUẢN LÝ ATLĐ CHO HẢI MINH");
h2("5.1. Phần mềm gồm những gì");
p("Phần mềm số hóa ATLĐ của Viện STP chạy trên trình duyệt web. Theo hồ sơ Viện STP trong phần mềm, Viện STP trực thuộc Liên hiệp các Hội Khoa học và Kỹ thuật Việt Nam (VUSTA) nghiên cứu, xây dựng chương trình đào tạo; Công ty Cổ phần Kỹ thuật Hàng hải DAKO tổ chức huấn luyện, kiểm tra và cấp chứng chỉ ✅. Phần mềm có ba “cổng”:");
table(["Cổng", "Ai dùng", "Dùng để làm gì"], [
  ["Tài khoản doanh nghiệp (doanhnghiep.vienstp.com)", "Lãnh đạo, Phòng an toàn (HSE), Phòng tổ chức lao động, Phòng vật tư, quản đốc; mỗi người một tài khoản operator với quyền riêng", "Quản lý nhân sự và huấn luyện, thiết bị và kiểm định, sự cố, giao việc, PPE, vật tư và hóa chất, báo cáo. Gồm 31 màn hình trong tài liệu hướng dẫn"],
  ["Cổng người lao động (Learner Portal, daotao.vienstp.com)", "Từng công nhân, kỹ sư của Hải Minh sau khi được cấp tài khoản", "Xem khóa học và chứng chỉ của mình, xin cấp PPE, báo sự cố, nhận việc, gửi đơn từ"],
  ["Cổng tra cứu chứng chỉ (công khai)", "Hải Minh, chủ tàu, đối tác, cơ quan chức năng", "Kiểm tra chứng chỉ theo mã bằng hoặc số CCCD, bất kỳ lúc nào"]
], [2700, 2900, 3471], { labelCol: true });
note("Cách đọc các mục tính năng", [
  "**Mục đích**: tính năng sinh ra để giải quyết việc gì. **Lợi ích**: điều thay đổi trong công việc hằng ngày của Hải Minh. **Giá trị mang lại**: kết quả về quản trị, tuân thủ và uy tín với chủ tàu, cơ quan chức năng.",
  "Phần “Chức năng chính” lấy đúng từ hai tài liệu hướng dẫn sử dụng phần mềm. Phần “Lợi ích” và “Giá trị” gắn với bối cảnh Hải Minh là nhận định của chuyên gia, được đánh dấu khi cần khảo sát xác nhận ⚠.",
  "Hình ảnh lấy từ tài liệu hướng dẫn; dữ liệu trong hình (tên người, tên công ty) là dữ liệu mẫu. Cần thay bằng dữ liệu mô phỏng của Hải Minh trước khi gửi cho khách hàng (xem mục 5.17)."
]);

h2("5.2. Vì sao phần mềm phù hợp với bối cảnh Hải Minh");
table(["Việc Hải Minh phải quản lý", "Tính năng đáp ứng"], [
  ["Nhiều xưởng, nhiều tổ thợ, nhiều loại chứng chỉ (hồ sơ báo chí 2015 ghi hơn 80 thợ hàn đạt chứng chỉ Bureau Veritas) ✅", "Nhân sự – học viên: đính kèm văn bằng, chứng chỉ, giấy khám sức khỏe; Dashboard cảnh báo chứng chỉ sắp hết hạn trong 30 ngày"],
  ["Thiết bị nâng và thiết bị đặc thù: cẩu trục cổng 240T/10T và 25T/3,5T, xe cẩu 70 tấn, sàn nâng, đốc nổi, dây chuyền phun bi và sơn ✅", "Thiết bị – kiểm định: hồ sơ từng thiết bị, ngày kiểm định, ngày hết hạn, nhắc hạn (không thay đơn vị kiểm định)"],
  ["Công việc nhiều nguy cơ: trên cao, trong khoang, két, mặt nước, hàn cắt", "Tai nạn và sự cố (kể cả sự cố suýt xảy ra), Giao việc khắc phục có hạn và người chịu trách nhiệm"],
  ["PPE chuyên dụng và hóa chất sơn, dung môi, khí", "Cấp phát PPE, Vật tư và hóa chất (cảnh báo tồn kho tối thiểu), Nhập kho và chứng từ"],
  ["Lãnh đạo nhiều cấp cần số liệu để điều hành và trả lời khi chủ tàu, cơ quan chức năng hỏi", "Dashboard tổng quan, Báo cáo doanh nghiệp và báo cáo nhân sự, xuất Excel"],
  ["Làm việc với chủ tàu, đối tác liên danh, thầu phụ", "Cổng tra cứu chứng chỉ công khai; mô-đun Hợp đồng đào tạo và Lớp học"],
  ["Lao động biến động theo tàu và đợt sửa chữa", "Lớp học theo đợt (hình thức Hybrid, theo ca sáng, chiều), Cổng người lao động"]
], [4300, 4771], { labelCol: true });

h2("5.3. Năm cụm tính năng nên giới thiệu trước");
p("Mỗi buổi gặp chỉ nên trình bày 4 đến 5 tính năng, chọn theo người ngồi đối diện (tài liệu ngành số 12, mục 6.3).");
table(["Cụm", "Gặp ai", "Thông điệp ngắn", "Mục"], [
  ["1. Nhân sự – học viên và tra cứu chứng chỉ", "Phòng tổ chức lao động, Phòng an toàn", "Biết ngay ai đã huấn luyện, ai sắp hết hạn; chủ tàu tự kiểm tra chứng chỉ", "5.6, 5.7"],
  ["2. Thiết bị – kiểm định", "PGĐ Kỹ thuật, quản đốc đà đốc, Phòng kỹ thuật", "Hồ sơ và hạn kiểm định của từng thiết bị nâng, áp lực ở một chỗ", "5.10"],
  ["3. Tai nạn – sự cố và giao việc khắc phục", "Phòng an toàn, PGĐ Sản xuất", "Mỗi sự cố có người chịu trách nhiệm, hạn xử lý và minh chứng", "5.11, 5.12"],
  ["4. Cấp phát PPE và vật tư – hóa chất", "Phòng vật tư, quản đốc các xưởng", "Biết ai được cấp gì, hạn dùng, tồn kho còn bao nhiêu", "5.13, 5.14"],
  ["5. Dashboard và báo cáo", "Giám đốc, các phó giám đốc", "Một màn hình thấy toàn cảnh; xuất báo cáo khi cần", "5.4, 5.5"]
], [2500, 2200, 3300, 1071], { labelCol: true });

feature({
  title: "5.4. Dashboard tổng quan và cảnh báo",
  priority: "★★ Ưu tiên cao (lãnh đạo)",
  imgs: [
    { file: "s04.jpg", cap: "Hình 5.1. Dashboard: chỉ số an toàn, nhân sự và biểu đồ phân tích" },
    { file: "s05.jpg", cap: "Hình 5.2. Dashboard: cảnh báo và thao tác nhanh" }
  ],
  path: "Tổng quan (màn hình mặc định sau khi đăng nhập)",
  purpose: "Cho người quản lý thấy toàn cảnh an toàn lao động, nhân sự, thiết bị kiểm định và tiến độ đào tạo trên một màn hình, kèm các việc cần xử lý gấp.",
  funcs: [
    "Chỉ số: tổng lao động, đã huấn luyện, chưa huấn luyện, chứng chỉ sắp hết hạn (30 ngày), thiết bị cần kiểm định, tai nạn lao động đã ghi nhận.",
    "Cảnh báo: thiết bị cần kiểm định gấp, chứng chỉ sắp hết hạn, nhật ký sự cố gần đây, lớp đang diễn ra, kỳ thanh toán hợp đồng gần nhất.",
    "Biểu đồ: tình trạng huấn luyện, phân bố Nhóm 1 đến Nhóm 6, trạng thái kiểm định thiết bị, hiệu lực chứng chỉ, xu hướng sự cố 6 tháng.",
    "Thao tác nhanh: Đăng ký lớp, Thêm nhân sự, Báo cáo sự cố, Kiểm định thiết bị."
  ],
  benefit: ["Giám đốc, phó giám đốc và Phòng an toàn không phải gom số liệu từ mười xưởng và nhiều phòng trước mỗi cuộc họp giao ban.", "Biểu đồ phân bố Nhóm 1 đến 6 cho thấy ngay nhóm nào còn thiếu người huấn luyện."],
  value: ["Có số liệu theo thời gian thực để quyết định ưu tiên nguồn lực.", "Khi chủ tàu, đối tác hoặc đoàn kiểm tra hỏi về tình hình ATLĐ, trả lời bằng số liệu trên hệ thống."],
  users: "Chủ tịch, Giám đốc, 4 Phó giám đốc, trưởng Phòng an toàn (HSE), trưởng các phòng, quản đốc",
  caution: "Cảnh báo hiển thị trên màn hình; không hứa nhắn qua Zalo hay email vì hai tài liệu hướng dẫn không nêu."
});

feature({
  title: "5.5. Báo cáo doanh nghiệp và báo cáo nhân sự",
  priority: "★★ Ưu tiên cao (lãnh đạo, Phòng tổ chức lao động)",
  imgs: [
    { file: "s06.jpg", cap: "Hình 5.3. Báo cáo doanh nghiệp theo năm, quý, tháng" },
    { file: "s07.jpg", cap: "Hình 5.4. Báo cáo nhân sự theo từng cá nhân" }
  ],
  path: "Báo cáo, chọn Báo cáo doanh nghiệp hoặc Báo cáo nhân sự",
  purpose: "Tổng hợp tuân thủ, đào tạo, kiểm định thiết bị và sự cố của cả công ty theo kỳ chọn; và đi sâu vào từng người lao động.",
  funcs: [
    "Báo cáo doanh nghiệp: chọn năm và kỳ (cả năm, quý, tháng); chỉ số đào tạo và chứng chỉ, kiểm định thiết bị (còn hạn, sắp hết, quá hạn, chưa kiểm định), sự cố (đã và chưa khắc phục); bảng số liệu theo từng tháng; nút Xuất Excel.",
    "Báo cáo nhân sự: lọc theo phòng ban và trạng thái; tìm theo tên, mã nhân viên; cho từng người: nghỉ phép, sự cố, PPE đã cấp, chứng chỉ, đào tạo, công việc, đơn từ, lần đăng nhập cuối."
  ],
  benefit: ["Phòng an toàn và Phòng tổ chức lao động có báo cáo sẵn thay vì lập thủ công từ nhiều file.", "Lọc theo phòng ban giúp xem xưởng nào thiếu chứng chỉ hoặc chậm nhận PPE."],
  value: ["Hồ sơ có số liệu rõ ràng theo tháng để làm việc với chủ tàu và cơ quan chức năng.", "Dữ liệu xuất Excel dùng được cho báo cáo nội bộ lên Tổng công ty ⚠ (cách báo cáo cấp trên do khách hàng quyết định)."],
  users: "Giám đốc, PGĐ Kỹ thuật, PGĐ Sản xuất, Phòng an toàn (HSE), Phòng tổ chức lao động",
  caution: "Báo cáo hiển thị số liệu đã nhập vào hệ thống; chất lượng báo cáo phụ thuộc việc nhập đủ nhân sự và hồ sơ."
});

feature({
  title: "5.6. Nhân sự – học viên",
  priority: "★★ Ưu tiên cao (nền tảng của mọi tính năng khác)",
  imgs: [
    { file: "s14.jpg", cap: "Hình 5.5. Danh sách nhân sự, học viên và phân nhóm huấn luyện" },
    { file: "s15.jpg", wcm: 9.5, cap: "Hình 5.6. Thêm nhân sự, chọn nhóm huấn luyện, đính kèm hồ sơ" }
  ],
  path: "Đào tạo, chọn Nhân sự / Học viên",
  purpose: "Quản lý danh sách nhân sự, gán nhóm huấn luyện ATVSLĐ và cấp tài khoản đăng nhập Learner Portal cho từng người.",
  funcs: [
    "Thẻ thống kê tổng số và số người theo Nhóm 1 đến Nhóm 6; bấm vào thẻ để xem danh sách từng nhóm.",
    "Tìm theo tên, email, CCCD, mã nhân viên, vị trí; lọc theo nhóm, phòng ban, trạng thái làm việc.",
    "Thêm nhân sự: thông tin cá nhân, mã nhân viên, vị trí, phòng ban; tích chọn một hoặc nhiều nhóm huấn luyện; tải lên văn bằng, chứng chỉ, giấy khám sức khỏe, hợp đồng (PDF hoặc ảnh)."
  ],
  benefit: ["Vị trí nhân sự ở Phần 4 chuyển trực tiếp thành nhóm huấn luyện trong hệ thống; người đứng đầu xưởng nhìn thấy ngay ai thuộc nhóm nào.", "Chứng chỉ chuyên môn của thợ hàn, thợ vận hành cẩu được lưu cùng hồ sơ."],
  value: ["Hồ sơ nhân sự và chứng chỉ tập trung, tìm trong vài giây.", "Làm nền cho nhắc hạn chứng chỉ, cấp PPE và giao việc theo nhóm."],
  users: "Phòng tổ chức lao động, Phòng an toàn, quản đốc (theo quyền được cấp)",
  caution: "Không hứa nhập danh sách hàng loạt từ Excel vì tài liệu hướng dẫn chưa nêu; hỏi bộ phận kỹ thuật khi Hải Minh có số lượng lớn. Không hứa tách dữ liệu riêng cho từng xưởng."
});

feature({
  title: "5.7. Tra cứu chứng chỉ 24/7",
  priority: "★★ Ưu tiên cao (đối tác, chủ tàu, thầu phụ)",
  imgs: [{ file: "h01.jpg", cap: "Hình 5.7. Khung tra cứu chứng chỉ trên trang chủ daotao.vienstp.com" }],
  path: "daotao.vienstp.com, khung Tra cứu chứng chỉ ở đầu trang chủ",
  purpose: "Cho học viên, doanh nghiệp và cơ quan chức năng kiểm tra tính hợp lệ của chứng chỉ nhanh và minh bạch, tránh chứng chỉ giả hoặc thất lạc.",
  funcs: [
    "Chọn hình thức tra cứu: theo mã bằng hoặc theo số CCCD.",
    "Nhập mã chứng chỉ hoặc số CCCD, nhập mã xác thực hiển thị trên màn hình, bấm Tra cứu ngay."
  ],
  benefit: ["Phòng an toàn kiểm tra chứng chỉ của thợ thầu phụ, thợ thời vụ trước khi cho vào đà, ụ, khoang.", "Chủ tàu hoặc đối tác tự kiểm tra, không phải gọi hỏi Hải Minh."],
  value: ["Tăng độ tin cậy của hồ sơ nhân lực khi làm việc với Hải quân, Cảnh sát biển, Kiểm ngư, đối tác liên danh ⚠.", "Không cần tài khoản đăng nhập."],
  users: "Phòng an toàn, Phòng bảo vệ khi tiếp nhận thợ ngoài, người quản lý hợp đồng thầu phụ",
  caution: "Chỉ tra cứu được chứng chỉ do Viện STP và DAKO cấp trên hệ thống; không dùng để tra chứng chỉ do đơn vị khác cấp."
});

feature({
  title: "5.8. Cổng người lao động (Learner Portal)",
  priority: "★★ Ưu tiên cao (người lao động)",
  imgs: [
    { file: "h04.jpg", cap: "Hình 5.8. Trang tài khoản của người lao động" },
    { file: "h05.jpg", cap: "Hình 5.9. Trang bị bảo hộ lao động: xin cấp mới, báo hỏng" },
    { file: "h06.jpg", cap: "Hình 5.10. Báo cáo sự cố do người lao động gửi" }
  ],
  path: "daotao.vienstp.com, Đăng nhập, tài khoản người lao động",
  purpose: "Để từng công nhân, kỹ sư theo dõi học tập, bảo hộ lao động và công việc của mình, đồng thời chủ động báo nguy cơ hoặc sự cố cho doanh nghiệp.",
  funcs: [
    "Khóa học của tôi (có nút Vào học), Bài thi sắp tới, Chứng chỉ của tôi, Bằng cấp của tôi.",
    "Trang bị BHLD: xem PPE được cấp và hạn dùng; Xin cấp mới PPE; Báo hỏng hoặc cấp đổi; theo dõi phiếu chờ duyệt, đã duyệt, từ chối.",
    "Báo cáo sự cố: gửi nguy cơ, sự cố, tai nạn; theo dõi trạng thái Chờ xử lý, Đã khắc phục.",
    "Công việc, Yêu cầu nhân sự (đơn nghỉ phép, trợ cấp và các mẫu khác), Tin tức và tài liệu, Hồ sơ cá nhân."
  ],
  benefit: ["Thợ ở xưởng báo hỏng dây an toàn, mặt nạ hàn hoặc báo nguy cơ ngay trên điện thoại hoặc máy tính qua trình duyệt, không đợi họp tổ.", "Người lao động tự xem chứng chỉ và hạn PPE của mình."],
  value: ["Sự cố và nguy cơ đến Phòng an toàn sớm, có lưu vết và trạng thái xử lý.", "Giảm việc giấy tờ cho tổ trưởng và Phòng tổ chức lao động."],
  users: "Toàn bộ người lao động có tài khoản; tổ trưởng, thợ chính, an toàn vệ sinh viên",
  caution: "Chỉ nói “mở bằng trình duyệt trên máy tính hoặc điện thoại”; không hứa ứng dụng di động riêng. Xác nhận với khách hàng việc cấp tài khoản cho công nhân (hạ tầng mạng, thiết bị tại xưởng) ⚠."
});

feature({
  title: "5.9. Lớp học và danh mục khóa học",
  priority: "★★ Ưu tiên cao (kế hoạch huấn luyện)",
  imgs: [
    { file: "s12.jpg", cap: "Hình 5.11. Danh mục khóa học huấn luyện ATVSLĐ" },
    { file: "s18.jpg", cap: "Hình 5.12. Quản lý lớp học: thẻ lớp, lịch, sĩ số" },
    { file: "s19.jpg", cap: "Hình 5.13. Chi tiết lớp: lịch từng buổi và danh sách học viên" }
  ],
  path: "Đào tạo, chọn Danh mục khóa học và Lớp học",
  purpose: "Cho doanh nghiệp xem chương trình huấn luyện, đăng ký tập trung cho nhân sự và theo dõi lịch, sĩ số, tài liệu từng lớp.",
  funcs: [
    "Danh mục: tìm theo tên, mã, nhóm; mỗi khóa có thời lượng, học phần và nút Đăng ký của doanh nghiệp.",
    "Lớp học: dạng thẻ hoặc dạng bảng; hình thức (ví dụ Hybrid), trạng thái, giảng viên, lịch, ghế đã đăng ký trên tổng số ghế.",
    "Chi tiết lớp: lịch từng buổi (ca sáng, ca chiều), địa điểm, tài liệu và video, danh sách học viên, thông tin chung."
  ],
  benefit: ["Chia đợt theo xưởng và theo kíp để không dừng sản xuất khi tàu đang vào tiến độ.", "Phòng tổ chức lao động xem lớp nào còn ghế, ai đã đăng ký."],
  value: ["Kế hoạch huấn luyện minh bạch từ Nhóm 1 đến Nhóm 6.", "Hồ sơ lớp, danh sách và tài liệu lưu trên hệ thống."],
  users: "Phòng tổ chức lao động, Phòng an toàn, quản đốc",
  caution: "Danh mục hiện có 19 khóa trong tài liệu hướng dẫn; chưa xác nhận có khóa riêng ngành đóng tàu. Chương trình thực tế do chuyên viên Viện STP – DAKO xác định ⚠."
});

feature({
  title: "5.10. Thiết bị – kiểm định",
  priority: "★★ Ưu tiên cao (kỹ thuật, đà đốc)",
  imgs: [
    { file: "s28.jpg", cap: "Hình 5.14. Danh sách thiết bị và trạng thái kiểm định" },
    { file: "s29.jpg", wcm: 9, cap: "Hình 5.15. Thêm thiết bị: thông tin, thông số, lịch sử kiểm định" }
  ],
  path: "An toàn và tài sản, chọn Thiết bị – Kiểm định",
  purpose: "Lưu hồ sơ từng thiết bị cần kiểm định, nhắc hạn kiểm định và theo dõi tình trạng còn hạn, sắp hết hạn, quá hạn.",
  funcs: [
    "Thẻ thống kê: tất cả thiết bị, còn hạn, sắp hết hạn (30 ngày), quá hạn kiểm định.",
    "Danh sách: mã thiết bị, loại, đơn vị kiểm định, ngày kiểm định, ngày hết hạn, nhãn màu trạng thái.",
    "Thêm thiết bị: mã tự sinh, tên, loại, số sê-ri, vị trí sử dụng, thông số kỹ thuật, ảnh; lịch sử kiểm định ban đầu với số tem hoặc giấy chứng nhận và file phiếu kiểm định."
  ],
  benefit: ["Mỗi cẩu, ụ, đốc nổi, sàn nâng, bình áp lực, máy nén khí, máy hàn có một hồ sơ; không bỏ lỡ hạn kiểm định.", "Quản đốc và Phòng kỹ thuật cùng xem một danh sách."],
  value: ["Thiết bị nhóm nâng hạ là rủi ro lớn nhất của nhà máy; hồ sơ đầy đủ giúp chứng minh tuân thủ.", "Rút ngắn thời gian chuẩn bị hồ sơ khi có đoàn kiểm tra."],
  users: "PGĐ Kỹ thuật, Phòng kỹ thuật, quản đốc Đà đốc, Cơ khí, Điện, Phòng an toàn",
  caution: "Phần mềm chỉ lưu hồ sơ và nhắc hạn, không thay đơn vị kiểm định. Thiết bị xếp dỡ chuyên dùng của cơ sở đóng, sửa chữa tàu theo chế độ giao thông vận tải riêng (xem mục 2.6). Không hứa cảnh báo ngoài màn hình."
});

feature({
  title: "5.11. Tai nạn và sự cố",
  priority: "★★ Ưu tiên cao (Phòng an toàn)",
  imgs: [
    { file: "s30.jpg", cap: "Hình 5.16. Danh sách tai nạn, sự cố và trạng thái khắc phục" }
  ],
  path: "An toàn và tài sản, chọn Tai nạn và Sự cố",
  purpose: "Ghi nhận, thống kê và lưu trữ tai nạn lao động và sự cố; phân tích nguyên nhân, đưa ra biện pháp khắc phục kịp thời.",
  funcs: [
    "Thẻ thống kê: tổng sự cố, chưa khắc phục, đã khắc phục, loại phổ biến.",
    "Loại sự cố chọn bằng nút: tai nạn lao động, sự cố suýt xảy ra, hành động không an toàn, điều kiện không an toàn, PPE, cháy nổ, rò rỉ, sự cố điện, hóa chất, khác.",
    "Biểu mẫu: ngày giờ, địa điểm, nội dung, nguyên nhân, biện pháp khắc phục, người chịu trách nhiệm, người báo cáo, trạng thái, file đính kèm (PDF, JPG, PNG, tối đa 10MB)."
  ],
  benefit: ["Ghi nhận ngay tại đà, ụ, cầu tàu, xưởng bằng một biểu mẫu thống nhất; có ảnh minh chứng.", "Sự cố suýt xảy ra (rơi vật, dây cáp, khí độc trong khoang) cũng được ghi để phòng ngừa."],
  value: ["Lưu vết đầy đủ nguyên nhân, biện pháp, người chịu trách nhiệm.", "Biểu đồ xu hướng 6 tháng trên Dashboard cho thấy khu vực, thời điểm có nguy cơ cao."],
  users: "Phòng an toàn (HSE), quản đốc, tổ trưởng, thợ chính, người lao động (qua Learner Portal)",
  caution: "Phần mềm ghi nhận và lưu hồ sơ nội bộ; không thay thủ tục khai báo, điều tra tai nạn lao động theo quy định pháp luật và quy định riêng của Bộ Quốc phòng ⚠."
});

feature({
  title: "5.12. Giao việc và theo dõi công việc",
  priority: "★★ Ưu tiên cao (khắc phục sau kiểm tra)",
  imgs: [
    { file: "s24.jpg", cap: "Hình 5.18. Giao và theo dõi công việc: việc đang mở, sắp đến hạn, quá hạn" },
    { file: "s25.jpg", cap: "Hình 5.19. Giao công việc mới theo nhóm hoặc cá nhân" }
  ],
  path: "Cộng tác và công việc, chọn Quản lý công việc",
  purpose: "Cho nhà quản lý giao việc, kiểm soát thời hạn và duyệt kết quả công việc của nhân viên trong doanh nghiệp.",
  funcs: [
    "Thẻ: việc đang hoạt động, sắp đến hạn, quá hạn, chờ duyệt, tỷ lệ hoàn thành.",
    "Giao việc: tiêu đề, mô tả, mức ưu tiên, thời hạn; chọn người nhận theo nhóm hoặc từng cá nhân, tự loại trùng.",
    "Lọc theo ưu tiên, tiến độ, thời hạn, nhóm, nhân viên; nhân viên nộp kết quả, quản lý duyệt hoặc yêu cầu làm lại."
  ],
  benefit: ["Sau mỗi đợt kiểm tra của Phòng an toàn, KCS, đăng kiểm hay chủ tàu, việc khắc phục được giao đúng người, có hạn, có kết quả nộp lại.", "Giao theo nhóm giúp giao một việc cho cả tổ."],
  value: ["Không còn việc khắc phục “treo” không ai theo dõi.", "Tỷ lệ hoàn thành là số liệu quản trị rõ ràng."],
  users: "Phòng an toàn, PGĐ Sản xuất, PGĐ Kỹ thuật, quản đốc, tổ trưởng",
  caution: "Đây là công cụ giao việc chung, không phải “giấy phép làm việc an toàn” cho hàn nóng hay vào không gian hạn chế; không hứa tính năng này."
});

feature({
  title: "5.13. Cấp phát PPE",
  priority: "★★ Ưu tiên cao (Phòng vật tư, quản đốc)",
  imgs: [
    { file: "s37.jpg", cap: "Hình 5.20. Danh sách cấp phát PPE, hạn sử dụng theo từng người" },
    { file: "s38.jpg", wcm: 7.5, cap: "Hình 5.21. Tạo phiếu cấp phát: chọn trang bị từ kho, tính hạn nhanh" }
  ],
  path: "An toàn và tài sản, chọn Cấp phát PPE",
  purpose: "Số hóa quy trình cấp phát đồ bảo hộ lao động cho từng người hoặc bộ phận, bảo đảm trang bị đầy đủ và đúng chuẩn.",
  funcs: [
    "Thẻ: tổng cấp phát, còn hạn, sắp hết hạn (30 ngày), hết hạn.",
    "Ba cách xem: gom theo nhân sự, bảng tổng hợp, yêu cầu từ nhân sự.",
    "Phiếu cấp phát: chọn nhân sự, ngày cấp, người cấp, chọn trang bị từ kho, nút tính hạn nhanh (+3 tháng, +6 tháng, +1 năm), tải biên bản giao nhận."
  ],
  benefit: ["Biết từng thợ đã nhận dây an toàn, mặt nạ hàn, mặt nạ lọc khí sơn, áo phao, mũ, giày, găng, nút tai; ai quá hạn cần thu hồi, cấp mới.", "Phiếu cấp phát tự trừ kho."],
  value: ["Hồ sơ cấp phát có biên bản, có chữ ký, truy xuất theo từng người.", "Hạn chế thiếu PPE khi vào đà, ụ, khoang."],
  users: "Phòng vật tư, thủ kho, Phòng an toàn, quản đốc",
  caution: "Hệ thống ghi nhận cấp phát và hạn dùng; không kiểm tra chất lượng, tiêu chuẩn PPE thay chuyên viên."
});

feature({
  title: "5.14. Vật tư, hóa chất và nhập kho",
  priority: "★★ Ưu tiên cao (kho vật tư, hóa chất sơn)",
  imgs: [
    { file: "s32.jpg", cap: "Hình 5.22. Danh mục vật tư, PPE, hóa chất và tồn kho" },
    { file: "s34.jpg", cap: "Hình 5.23. Nhập kho và chứng từ" },
    { file: "s35.jpg", cap: "Hình 5.24. Nhật ký nhập, xuất, tồn trước và sau" }
  ],
  path: "An toàn và tài sản, chọn Vật tư / Hóa chất và Nhập kho / Chứng từ",
  purpose: "Kiểm soát danh mục vật tư, PPE, hóa chất và dụng cụ; lưu phiếu nhập, hóa đơn, chứng từ và biến động kho.",
  funcs: [
    "Vật tư: tìm theo tên, mã; lọc PPE, hóa chất, dụng cụ, phụ tùng; số lượng tồn; nhãn Sắp hết hàng theo ngưỡng tồn tối thiểu; thuộc tính tùy chọn (size, tiêu chuẩn, màu).",
    "Nhập kho: ngày, nhà cung cấp, số hóa đơn, tải chứng từ, nhiều dòng hàng, tự tính tổng giá trị.",
    "Nhật ký kho: thời gian, vật tư, loại biến động (nhập kho, xuất cấp phát PPE), số lượng, tồn trước và sau, ghi chú."
  ],
  benefit: ["Kho sơn, dung môi, que hàn, khí, PPE hàn có ngưỡng cảnh báo khi sắp hết.", "Mỗi lần cấp PPE ghi vào nhật ký, không phải đối chiếu thủ công."],
  value: ["Truy xuất xuất nhập kho và chứng từ.", "Đáp ứng yêu cầu lưu hồ sơ hóa chất, vật tư phục vụ đánh giá nội bộ và đối tác ⚠."],
  users: "Phòng vật tư, thủ kho, kế toán vật tư, Phòng an toàn",
  caution: "Phần mềm là sổ theo dõi vật tư ATLĐ, không phải phần mềm kế toán hay ERP; không hứa tích hợp với hệ thống kế toán của Hải Minh."
});

feature({
  title: "5.15. Quản lý operator và phân quyền",
  priority: "★ Giới thiệu thêm",
  imgs: [{ file: "s10.jpg", cap: "Hình 5.25. Thêm tài khoản operator và phân quyền theo tính năng" }],
  path: "Doanh nghiệp, chọn Quản lý operator",
  purpose: "Cho quản trị viên tạo tài khoản vận hành và phân quyền từng người được vào tính năng nào.",
  funcs: [
    "Thông tin tài khoản: họ tên, số điện thoại, email đăng nhập, mật khẩu ban đầu, trạng thái.",
    "Phân quyền theo 14 tính năng: Tổng quan, Báo cáo doanh nghiệp, Nhân sự / Học viên, Hợp đồng, Lớp học, Hồ sơ Viện STP, Bảng tin, Tin tức và Tài liệu, Quản lý công việc, Thiết bị – Kiểm định, Tai nạn và Sự cố, Vật tư / Hóa chất, Nhập kho và Chứng từ, Cấp phát PPE; nút Chọn tất cả."
  ],
  benefit: ["Phòng vật tư chỉ thấy vật tư, kho, PPE; Phòng an toàn thấy sự cố, thiết bị, nhân sự.", "Mỗi người một tài khoản riêng."],
  value: ["Giảm rủi ro nhập nhầm hoặc xem dữ liệu không thuộc phạm vi công việc.", "Dễ phân công trách nhiệm nhập liệu."],
  users: "Quản trị viên của Hải Minh (thường Phòng an toàn hoặc Phòng tổ chức lao động ⚠)",
  caution: "Phân quyền theo tính năng, không theo xưởng; không hứa tách dữ liệu riêng cho từng xưởng. Chính sách bảo mật và nơi lưu trữ dữ liệu do chuyên viên kỹ thuật trả lời, đặc biệt với doanh nghiệp quốc phòng ⚠."
});

feature({
  title: "5.16. Bảng tin, tin tức và tài liệu",
  priority: "★ Giới thiệu thêm",
  imgs: [
    { file: "s22.jpg", cap: "Hình 5.26. Bảng tin doanh nghiệp" },
    { file: "s23.jpg", cap: "Hình 5.27. Tin tức, thông tư, nghị định và tài liệu" }
  ],
  path: "Cộng tác và công việc, chọn Bảng tin; Tin tức và Tài liệu",
  purpose: "Bảng tin để cập nhật thông báo nhanh trong doanh nghiệp; Tin tức và Tài liệu là kho thông tư, nghị định, tài liệu chính thống từ Viện STP.",
  funcs: [
    "Bảng tin: thông báo, timeline tương tác, thông tin gấp.",
    "Tin tức và Tài liệu: lọc theo Tin tức, Thông tư/Nghị định, Tài liệu; ô tìm kiếm bài viết."
  ],
  benefit: ["Phổ biến nội quy, nhắc an toàn, thông báo thời tiết xấu đến toàn nhà máy; Hải Minh nằm ở mũi Nhà Bè, nơi ba con sông gặp nhau, nên thời tiết và thủy triều ảnh hưởng công việc ngoài trời, trên mặt nước ⚠.", "Người lao động tra văn bản pháp luật ngay trên hệ thống."],
  value: ["Thông tin an toàn đến đúng người, có lưu trên hệ thống."],
  users: "Phòng an toàn, Phòng chính trị, Phòng hành chính – hậu cần",
  caution: "Bảng tin là nơi đăng thông báo nội bộ, không phải hệ thống báo động khẩn cấp."
});

h2("5.17. Các màn hình còn lại và lưu ý trước khi gửi cho khách hàng");
table(["Tính năng", "Mô tả ngắn", "Ưu tiên cho Hải Minh"], [
  ["Hồ sơ doanh nghiệp", "Thông tin định danh, người đại diện pháp lý, giới thiệu; một số trường cố định chỉ Viện STP sửa", "○ Dùng khi khởi tạo tài khoản"],
  ["Hợp đồng đào tạo", "Xem hợp đồng đã ký với Viện STP, khóa học, số học viên, trạng thái thanh toán, tài liệu đính kèm", "★ Dành cho Phòng tài chính – kế toán và người quản lý hợp đồng"],
  ["Quản lý đơn từ", "Tiếp nhận, duyệt, từ chối, hoàn tất đơn nghỉ phép, trợ cấp, công tác và các đề nghị nhân sự", "○ Chưa cần nhấn mạnh; cân nhắc quy trình nhân sự riêng của doanh nghiệp quân đội ⚠"],
  ["Hồ sơ Viện STP", "Giới thiệu, hồ sơ năng lực và pháp lý, đội ngũ giảng viên, liên hệ", "★ Dùng khi khách hàng muốn kiểm tra năng lực đơn vị huấn luyện"],
  ["Chi tiết khóa học", "Học phần, bài học, thời lượng từng khóa", "★ Dùng khi trao đổi nội dung huấn luyện"]
], [2300, 4300, 2471], { labelCol: true });
bul([
  "**Thay dữ liệu mẫu:** các hình trong tài liệu hướng dẫn chứa tên người, tên công ty và số liệu mẫu (ví dụ tên công ty khác ở phần lớp học). Chuẩn bị tài khoản dùng thử với dữ liệu mô phỏng của Hải Minh (tên xưởng, vị trí, thiết bị như cẩu cổng trục, đốc nổi, sàn nâng) và không dùng dữ liệu của doanh nghiệp khác trước mặt khách ⚠.",
  "**Hình chưa có:** hai tài liệu hướng dẫn không có hình riêng cho trang tra cứu kết quả sau khi nhập mã; nên chụp bổ sung từ hệ thống thật ✗."
]);

h2("5.18. Kịch bản giới thiệu 10 đến 12 phút");
num([
  "**Mở đầu (1 phút), Dashboard:** “Đây là màn hình ban giám đốc nhìn mỗi sáng.” Chỉ vào chứng chỉ sắp hết hạn và thiết bị cần kiểm định gấp.",
  "**Nhân sự (2 phút):** thêm một thợ hàn mẫu, tích Nhóm 3, đính kèm chứng chỉ thợ hàn. Chuyển sang cổng tra cứu: nhập mã để chủ tàu tự kiểm tra.",
  "**Thiết bị (2 phút):** mở hồ sơ một cẩu cổng trục; nhìn ngày hết hạn và nhãn màu; nhấn mạnh phần mềm nhắc hạn, không thay kiểm định.",
  "**Sự cố và giao việc (3 phút):** từ Learner Portal báo một sự cố suýt xảy ra ở đốc nổi, Phòng an toàn giao việc khắc phục có hạn, quản đốc nộp kết quả.",
  "**PPE và vật tư (2 phút):** cấp mặt nạ hàn cho thợ; xem tồn kho giảm và nhật ký.",
  "**Báo cáo (1 phút):** xuất Excel báo cáo doanh nghiệp. Chốt: xin bảng số liệu nhân sự theo xưởng (Phần 6)."
]);

h2("5.19. Những điều nhân viên kinh doanh không hứa");
table(["Chủ đề", "Cách trả lời"], [
  ["Nhập danh sách nhân sự hàng loạt từ Excel", "Ghi nhận; hỏi bộ phận kỹ thuật, không cam kết"],
  ["Tách dữ liệu riêng từng xưởng", "Phân quyền theo tính năng, chưa nêu theo xưởng; hỏi bộ phận kỹ thuật"],
  ["Ứng dụng di động riêng, nhắn Zalo, email", "Chỉ nói mở bằng trình duyệt; cảnh báo hiển thị trên màn hình"],
  ["Giấy phép làm việc an toàn (hàn nóng, vào không gian hạn chế), nhật ký ca", "Không nằm trong 31 màn hình hiện có"],
  ["Tích hợp với phần mềm nhân sự, kế toán, ERP, hệ thống của Tổng công ty", "Không nêu trong tài liệu; chuyên viên kỹ thuật trả lời"],
  ["Nơi lưu trữ, bảo mật dữ liệu, máy chủ nội bộ", "Không nêu trong tài liệu; chuyên viên kỹ thuật và pháp chế trả lời, quan trọng với doanh nghiệp quốc phòng"],
  ["Thay thế kiểm định, thanh tra, khai báo tai nạn", "Phần mềm lưu hồ sơ và nhắc việc, không thay thủ tục pháp lý"]
], [3700, 5371], { labelCol: true });

// ===================== PHẦN 6 =====================
h1("PHẦN 6. VIỆC CẦN LÀM TIẾP THEO VÀ NGUỒN THAM KHẢO");
h2("6.1. Câu hỏi xác nhận khi gặp Hải Minh");
table(["Nhóm câu hỏi", "Câu hỏi", "Để làm gì"], [
  ["Quy mô", "Tổng số lao động hiện nay? Chia theo quân nhân, công nhân viên quốc phòng, hợp đồng? Mỗi xưởng bao nhiêu người, mấy ca?", "Báo giá, quy mô bộ phận ATVSLĐ, chia đợt"],
  ["Cơ cấu", "Sơ đồ tổ chức hiện hành? Có phòng y tế, đội PCCC, đội cứu hộ không? Trạm Cam Ranh làm gì?", "Xếp nhóm 5, ngoài phạm vi, lịch riêng"],
  ["Hiện trạng ATLĐ", "Đã huấn luyện nhóm nào, đơn vị nào, còn hạn bao nhiêu người? Đang quản lý bằng gì?", "Biết số người cần huấn luyện lại; phần mềm thay gì"],
  ["Thầu phụ", "Thầu phụ, tổ đội khoán, đối tác liên danh làm ở đâu, bao nhiêu người, ai huấn luyện?", "Phạm vi huấn luyện, tra cứu chứng chỉ"],
  ["Thiết bị", "Danh mục thiết bị nâng, áp lực, bình khí; thiết bị nào kiểm định theo chế độ giao thông vận tải?", "Xác định phạm vi hồ sơ trong phần mềm"],
  ["Quy định riêng", "Quy định nội bộ của Tổng công ty Ba Son, Tổng cục Công nghiệp Quốc phòng về ATLĐ và về dữ liệu? Ai phê duyệt?", "Phạm vi áp dụng, bảo mật, quy trình mua sắm"],
  ["Người quyết định", "Ai là Giám đốc hiện nay? Ai đầu mối? Ai ký hợp đồng huấn luyện và phần mềm?", "Đúng đối tượng trình bày"],
  ["Hạ tầng", "Công nhân có điện thoại, máy tính, mạng ở xưởng không?", "Triển khai Learner Portal"]
], [1800, 4700, 2571], { labelCol: true });

h2("6.2. Bảng thu thập số liệu nhân sự");
p("Điền số người theo xưởng, phòng và nhóm huấn luyện. N1 đến N6 là Nhóm 1 đến Nhóm 6; một người ở nhiều nhóm thì tính ở mỗi nhóm.");
const dataRows = [
  "Ban lãnh đạo, Kiểm soát viên", "Phòng an toàn (HSE)", "Các phòng chức năng còn lại",
  "Xưởng vỏ tàu I", "Xưởng vỏ tàu II", "Xưởng cơ khí", "Xưởng đà đốc", "Xưởng ống", "Xưởng động lực",
  "Xưởng điện – điện tử", "Xưởng cơ điện", "Xưởng cảng vụ", "Xưởng mộc trang trí", "Trạm Cam Ranh",
  "Thầu phụ, thời vụ", "Tổng cộng"
].map((n) => [n, "", "", "", "", "", ""]);
table(["Đơn vị", "Tổng", "N1", "N2", "N3", "N4", "N5–6"], dataRows, [3100, 900, 800, 800, 800, 800, 1871], { labelCol: true, blankRows: true });
p("Thông tin bổ sung nên thu thập: số thợ hàn có chứng chỉ và loại chứng chỉ; số người vận hành cẩu, xe nâng; số người làm việc trong khoang, két; số người dùng máy gỗ; số người nghỉ từ 6 tháng trở lên cần huấn luyện lại.");

h2("6.3. Nguồn tham khảo và độ tin cậy");
table(["Nguồn", "Nội dung dùng", "Ghi chú"], [
  ["Hồ sơ năng lực Hải Minh Shipyard (PDF, 2019)", "Tên, lịch sử, cơ cấu, cơ sở vật chất, thiết bị, sản phẩm, khách hàng", "✅ Do khách hàng phát hành; số liệu năm 2019"],
  ["Báo Sài Gòn Giải Phóng, 24/10/2025", "Hải Minh thuộc Tổng công ty Ba Son; Giám đốc hiện nay; khen thưởng; định hướng chuyển đổi số", "✅ Báo chính thống"],
  ["Soha.vn (từ báo Quân đội nhân dân), 23/10/2015", "Số liệu trình độ, thợ hàn có chứng chỉ", "✅ Số liệu cũ; chỉ tham khảo"],
  ["Trang tuyển dụng (Careerviet, Vieclam Tuổi Trẻ) về Piriou Việt Nam", "Địa chỉ cùng 1042 Huỳnh Tấn Phát", "⚠ Nguồn thứ cấp; xác nhận với khách hàng"],
  ["Báo cáo thường niên Công ty cổ phần Hải Minh (HMH) trên Vietstock", "Chỉ dùng để phân biệt doanh nghiệp khác tên", "✅"],
  ["Báo Đại biểu Nhân dân, 23/9/2026 và các báo khác", "Tình trạng dự án Luật ATVSLĐ sửa đổi", "✅ Dự án chưa có hiệu lực"],
  ["Tài liệu tư vấn ngành số 12 (Cảng biển – Đóng tàu), số 04 (Cơ khí – Chế tạo), số 11 (Gỗ – Nội thất) của Viện STP – DAKO", "Phần 4 và 5: xếp nhóm, thẻ cụm, khung pháp lý đến 17/10/2026, giới hạn tư vấn", "✅ Tài liệu nội bộ"],
  ["File PPT hướng dẫn phần mềm; hai file hướng dẫn sử dụng cho doanh nghiệp và học viên", "Mô tả, hình ảnh tính năng", "✅ Tài liệu của Viện STP"]
], [3400, 3600, 2071], { labelCol: true });
p("**Khoảng trống chưa lấp** ✗: tổng số lao động và cơ cấu; sơ đồ tổ chức hiện hành; danh mục thiết bị cụ thể; chức năng xưởng Cảng vụ và Trạm Cam Ranh; hiện trạng huấn luyện và quản lý ATLĐ hiện nay; quy định riêng của Tổng công ty Ba Son về ATLĐ và dữ liệu; số liệu tai nạn lao động.");

// ===================== PHỤ LỤC =====================
h1("PHỤ LỤC. DANH MỤC 31 MÀN HÌNH VÀ MỨC ƯU TIÊN CHO HẢI MINH");
p("Số thứ tự theo file PPT hướng dẫn phần mềm. ★★ giới thiệu trước; ★ giới thiệu thêm; ○ chưa cần nhấn mạnh.");
const screens = [
  ["1–2", "Dashboard: chỉ số, cảnh báo, thao tác nhanh", "★★", "5.4"],
  ["3", "Báo cáo doanh nghiệp", "★★", "5.5"],
  ["4", "Báo cáo nhân sự", "★★", "5.5"],
  ["5", "Hồ sơ doanh nghiệp", "○", "5.17"],
  ["6", "Quản lý operator", "★", "5.15"],
  ["7–8", "Danh mục khóa học, chi tiết khóa học", "★★", "5.9"],
  ["9–10", "Nhân sự – học viên, thêm nhân sự", "★★", "5.6"],
  ["11–12", "Hợp đồng đào tạo, chi tiết hợp đồng", "★", "5.17"],
  ["13–14", "Lớp học, chi tiết lớp", "★★", "5.9"],
  ["15", "Hồ sơ Viện STP", "★", "5.17"],
  ["16", "Bảng tin", "★", "5.16"],
  ["17", "Tin tức và tài liệu", "★", "5.16"],
  ["18–19", "Quản lý công việc, giao việc mới", "★★", "5.12"],
  ["20", "Quản lý đơn từ", "○", "5.17"],
  ["21–22", "Thiết bị – kiểm định, thêm thiết bị", "★★", "5.10"],
  ["23–24", "Tai nạn và sự cố, thêm sự cố", "★★", "5.11"],
  ["25–26", "Vật tư và hóa chất, thêm vật tư", "★★", "5.14"],
  ["27–29", "Nhập kho, nhật ký nhập – xuất, tạo phiếu nhập kho", "★★", "5.14"],
  ["30–31", "Cấp phát PPE, tạo phiếu cấp phát", "★★", "5.13"],
  ["Cổng người lao động", "Trang tài khoản, trang bị BHLD, báo cáo sự cố, yêu cầu nhân sự, công việc, tin tức, hồ sơ cá nhân", "★★", "5.8"],
  ["Cổng công khai", "Tra cứu chứng chỉ theo mã bằng hoặc CCCD", "★★", "5.7"]
];
table(["Màn hình", "Tên", "Ưu tiên", "Mục"], screens, [1500, 5000, 1200, 1371], { labelCol: true });

module.exports = B;
