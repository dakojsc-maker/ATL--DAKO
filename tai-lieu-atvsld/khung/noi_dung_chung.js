// Nội dung dùng chung cho mọi ngành: thời gian huấn luyện theo Nghị định 44/2016/NĐ-CP, căn cứ pháp lý chung,
// quy trình, liên hệ. File ngành dùng lại các phần này; ngành nào cần cách diễn đạt khác thì ghi đè trong file ngành.
// Thông tin pháp lý theo bộ cẩm nang tư vấn (kiểm tra đến ngày 15/10/2026).

const NGAY_PHAP_LY = '15/10/2026';

module.exports = {
  NGAY_PHAP_LY,

  // Thời gian tối thiểu lần đầu và định kỳ của 6 nhóm (dòng đầu in đậm, màu nhóm)
  THOI_GIAN: {
    1: ['16 giờ', 'Định kỳ 2 năm/lần'],
    2: ['48 giờ', 'gồm lý thuyết, thực hành, kiểm tra', 'Định kỳ 2 năm/lần'],
    3: ['24 giờ', 'Định kỳ 2 năm/lần'],
    4: ['16 giờ', 'Định kỳ hằng năm'],
    5: ['56 giờ', 'Định kỳ 2 năm/lần'],
    6: ['4 giờ', 'học thêm, ngoài nhóm của công việc chính', 'Định kỳ theo quy định'],
  },

  danSauNhom: (doanhNghiep) => 'Sáu nhóm đối tượng do Nghị định 44/2016/NĐ-CP (sửa đổi bởi Nghị định 140/2018/NĐ-CP) quy định, '
    + `diễn giải theo các vị trí thường gặp trong ${doanhNghiep}:`,

  ghiChuThoiGian: (noiLamViec) => 'Thời gian là mức tối thiểu theo quy định, đã gồm thời gian kiểm tra (trừ Nhóm 6). '
    + `Chương trình cụ thể do Viện STP – DAKO thiết kế theo đối tượng và công việc thực tế tại ${noiLamViec}.`,

  TRICH_DAN: '“Một khóa học có thể kết thúc sau vài ngày, nhưng công tác ATVSLĐ cần được quản lý mỗi ngày.”',

  // Hai ô đầu của "Quý Doanh nghiệp nhận được"; ô thứ ba (hình thức huấn luyện) do file ngành viết.
  // aiTraCuu: ai thường kiểm tra chứng nhận ở ngành đó (xây dựng: "Chủ đầu tư, tổng thầu").
  nhanDuocChung: (aiTraCuu = 'Đối tác, cơ quan kiểm tra') => [
    ['Chứng nhận tra cứu 24/7',
      `Thẻ an toàn hoặc Giấy chứng nhận huấn luyện theo quy định, mỗi chứng nhận có mã riêng. ${aiTraCuu} tự tra cứu, xác thực tại **daotao.vienstp.com** theo mã hoặc số CCCD.`],
    ['Tài khoản quản lý ATVSLĐ',
      'Cấp ngay khi ký hợp đồng đào tạo tại **doanhnghiep.vienstp.com**, không phải mua phần mềm riêng: theo dõi nhân sự theo Nhóm 1–6, hạn chứng nhận, thiết bị và hạn kiểm định, sự cố, cấp phát PPE; xuất báo cáo Excel.'],
  ],

  // Năm văn bản chung đứng đầu bảng "Căn cứ pháp lý chính"; file ngành nối thêm văn bản chuyên ngành
  PHAP_LY_CHUNG: [
    ['Luật An toàn, vệ sinh lao động số 84/2015/QH13', 'Trách nhiệm của người sử dụng lao động, quyền và nghĩa vụ của người lao động; huấn luyện ATVSLĐ; an toàn, vệ sinh viên (Điều 74).'],
    ['Nghị định 44/2016/NĐ-CP, sửa đổi bởi Nghị định 140/2018/NĐ-CP', 'Sáu nhóm đối tượng; nội dung, thời gian huấn luyện lần đầu và định kỳ; chứng nhận có hiệu lực 2 năm.'],
    ['Nghị định 39/2016/NĐ-CP (Điều 36)', 'Bố trí người làm công tác ATVSLĐ theo quy mô lao động.'],
    ['Thông tư 06/2020/TT-BLĐTBXH; Thông tư 36/2019/TT-BLĐTBXH', 'Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (căn cứ xác định Nhóm 3); danh mục máy, thiết bị, vật tư, chất có yêu cầu nghiêm ngặt về an toàn lao động.'],
  ],

  TINH_TRANG_PHAP_LY: `**Tình trạng pháp lý (cập nhật đến ngày ${NGAY_PHAP_LY}):** dự án Luật sửa đổi, bổ sung một số điều của Luật An toàn, vệ sinh `
    + 'lao động đã được Chính phủ thông qua ngày 17/9/2026 và trình Quốc hội, chưa có hiệu lực. Quy định hiện hành vẫn được áp dụng; '
    + 'khi văn bản mới có hiệu lực, Viện STP – DAKO sẽ cập nhật cho khách hàng.',

  CHAN_TRANG: 'Hotline: 0827.695.368 – 0968.702.701  ·  www.vienstp.com  ·  Tra cứu chứng nhận: daotao.vienstp.com',
};
