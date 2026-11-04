// Tạo tự động bởi tools/build.py từ tour.config.json – đừng sửa tay.
window.TOUR = {
 "title": "Tour 360° căn hộ CT1-11.10 · Sky9",
 "unit": {
  "code": "CT1-11.10",
  "type": "Căn hộ loại E",
  "bedrooms": 3,
  "bathrooms": 2,
  "areaCenterLine": 74.25,
  "areaInternal": 69.08,
  "internalWall": 2.29,
  "note": "Số liệu theo bản vẽ mặt bằng căn hộ loại E."
 },
 "video": {
  "src": "",
  "driveUrl": "https://drive.google.com/file/d/1O0UhZJMXGjpk1afDFcUhSVlEX1Xp3MJt/view",
  "name": "20250629_093934.mp4"
 },
 "levels": [
  {
   "id": 1,
   "name": "Vị trí"
  },
  {
   "id": 2,
   "name": "Dự án"
  },
  {
   "id": 3,
   "name": "Căn hộ"
  },
  {
   "id": 4,
   "name": "Các phòng"
  }
 ],
 "firstScene": "ban-do",
 "plan": {
  "file": "images/mat-bang.jpg",
  "W": 2000,
  "H": 1200,
  "crop": [
   0,
   0,
   1000,
   600
  ],
  "scale": 2,
  "tx": 0.466308,
  "ty": 0.279785,
  "haov": 50.0,
  "vaov": 31.262,
  "minimapCrop": [
   392,
   82,
   930,
   520
  ]
 },
 "minimap": "images/minimap.jpg",
 "keyPlan": "images/so-do-tang.jpg",
 "scenes": [
  {
   "id": "ban-do",
   "level": 1,
   "title": "Vị trí dự án Sky9",
   "crumb": "Vị trí",
   "lead": "Khu vực Phú Hữu, gần nút giao Vành đai 2 với cao tốc TP.HCM – Long Thành – Dầu Giây.",
   "mode": "flat",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/ban-do.jpg",
    "haov": 72.0,
    "vaov": 54.333,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": -36.0,
    "maxYaw": 36.0,
    "minPitch": -27.166,
    "maxPitch": 27.166,
    "yaw": 7.338,
    "pitch": 3.775,
    "hfov": 54.583,
    "maxHfov": 72.0,
    "minHfov": 13.862
   },
   "hotspots": [
    {
     "kind": "link",
     "label": "Dự án Sky9",
     "yaw": 13.029,
     "pitch": 6.863,
     "to": "tong-the",
     "sub": "Vào xem tổng thể"
    },
    {
     "kind": "info",
     "label": "Khu Công nghệ cao",
     "yaw": -0.245,
     "pitch": 11.286,
     "text": "Khu Công nghệ cao TP.HCM, phía tây bắc dự án."
    },
    {
     "kind": "info",
     "label": "Nhà máy Samsung",
     "yaw": 8.673,
     "pitch": 14.335,
     "text": "Nhà máy Samsung trong Khu Công nghệ cao."
    },
    {
     "kind": "info",
     "label": "Khu đô thị Vin Group",
     "yaw": 17.684,
     "pitch": 0.623,
     "text": "Khu đô thị nằm phía đông nam dự án."
    },
    {
     "kind": "info",
     "label": "Khu đô thị Đông Tăng Long",
     "yaw": 24.318,
     "pitch": 3.864,
     "text": "Khu đô thị phía đông dự án."
    },
    {
     "kind": "info",
     "label": "Vườn Thiên Thanh",
     "yaw": 28.675,
     "pitch": 9.142,
     "text": "Khu du lịch sinh thái Vườn Thiên Thanh."
    },
    {
     "kind": "info",
     "label": "The Boat Club",
     "yaw": 33.539,
     "pitch": -0.363,
     "text": "Khu vui chơi The Boat Club."
    },
    {
     "kind": "info",
     "label": "Nút giao Vành đai 2",
     "yaw": 5.618,
     "pitch": -6.689,
     "text": "Vành đai 2 giao cao tốc TP.HCM – Long Thành – Dầu Giây."
    },
    {
     "kind": "info",
     "label": "UBND phường Phú Hữu",
     "yaw": 10.262,
     "pitch": -11.007,
     "text": "Trụ sở UBND phường Phú Hữu (theo bản đồ vị trí)."
    },
    {
     "kind": "info",
     "label": "Thảo Điền",
     "yaw": -31.01,
     "pitch": 0.7,
     "text": "Hướng về trung tâm thành phố theo cao tốc và Xa lộ Hà Nội."
    }
   ],
   "thumb": "images/thumbs/ban-do.jpg"
  },
  {
   "id": "tong-the",
   "level": 2,
   "title": "Phối cảnh tổng thể Sky9",
   "crumb": "Sky9",
   "lead": "Ba block CT1, CT2, CT3 bao quanh hồ bơi nội khu. Căn CT1-11.10 ở tầng 11 Block CT1, khối chữ U bên phải (dải màu cam).",
   "mode": "flat",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/tong-the.jpg",
    "haov": 72.0,
    "vaov": 47.125,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": -36.0,
    "maxYaw": 36.0,
    "minPitch": -23.563,
    "maxPitch": 23.563,
    "yaw": -0.027,
    "pitch": -0.054,
    "hfov": 68.175,
    "maxHfov": 72.0,
    "minHfov": 17.631
   },
   "hotspots": [
    {
     "kind": "link",
     "label": "Block CT1",
     "yaw": 25.259,
     "pitch": 5.197,
     "to": "can-ho",
     "sub": "Vào căn CT1-11.10 · tầng 11"
    },
    {
     "kind": "info",
     "label": "Tầng 11 · Block CT1",
     "yaw": 33.218,
     "pitch": -4.563,
     "text": "Dải màu cam đánh dấu tầng 11. Trên phối cảnh, khối đế là tầng 1, tầng 11 là hàng cửa sổ thứ 4 tính từ mái."
    },
    {
     "kind": "info",
     "label": "Tầng 11 · Block CT1",
     "yaw": 10.625,
     "pitch": -3.502,
     "text": "Đầu hồi cánh trái của Block CT1, dải màu cam là tầng 11."
    },
    {
     "kind": "info",
     "label": "Block CT2",
     "yaw": -3.657,
     "pitch": 7.56,
     "text": "Khối tháp ở giữa dự án."
    },
    {
     "kind": "info",
     "label": "Block CT3",
     "yaw": -23.631,
     "pitch": 10.202,
     "text": "Khối tháp cao nhất, phía bên trái, có khối đế thương mại."
    },
    {
     "kind": "info",
     "label": "Hồ bơi nội khu",
     "yaw": 4.808,
     "pitch": -8.207,
     "text": "Hồ bơi và sân vườn nằm giữa các block."
    },
    {
     "kind": "info",
     "label": "Sân vườn trong lòng Block CT1",
     "yaw": 19.392,
     "pitch": -8.372,
     "text": "Mảng xanh bên trong khối chữ U của Block CT1."
    }
   ],
   "thumb": "images/thumbs/tong-the.jpg"
  },
  {
   "id": "can-ho",
   "level": 3,
   "title": "Mặt bằng căn CT1-11.10",
   "crumb": "CT1-11.10",
   "lead": "Căn hộ loại E · 3 phòng ngủ · 2 phòng tắm. Bấm vào từng phòng để đi vào.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": -25.0,
    "maxYaw": 25.0,
    "minPitch": -15.631,
    "maxPitch": 15.631,
    "yaw": 0.0,
    "pitch": 0.0,
    "hfov": 47.338,
    "maxHfov": 50.0,
    "minHfov": 6.406
   },
   "hotspots": [
    {
     "kind": "info",
     "label": "Cửa chính",
     "yaw": -3.309,
     "pitch": -10.548,
     "text": "Lối vào căn hộ, mở ra khu bàn ăn và bếp."
    },
    {
     "kind": "room",
     "to": "phong-khach",
     "label": "Phòng khách & phòng ăn",
     "sub": "20,42 m²",
     "yaw": -1.603,
     "pitch": 3.84
    },
    {
     "kind": "room",
     "to": "bep",
     "label": "Bếp",
     "sub": "4,48 m²",
     "yaw": 1.496,
     "pitch": -6.91
    },
    {
     "kind": "room",
     "to": "ban-cong",
     "label": "Ban công",
     "sub": "3,63 m²",
     "yaw": 4.904,
     "pitch": -7.412
    },
    {
     "kind": "room",
     "to": "wc-chung",
     "label": "Phòng tắm chung",
     "sub": "4,22 m²",
     "yaw": 8.8,
     "pitch": -7.352
    },
    {
     "kind": "room",
     "to": "pn1",
     "label": "Phòng ngủ 1",
     "sub": "8,48 m²",
     "yaw": 7.229,
     "pitch": 6.335
    },
    {
     "kind": "room",
     "to": "pn-master",
     "label": "Phòng ngủ master",
     "sub": "11,27 m²",
     "yaw": 17.106,
     "pitch": -7.113
    },
    {
     "kind": "room",
     "to": "wc-master",
     "label": "WC phòng master",
     "sub": "3,82 m²",
     "yaw": 17.884,
     "pitch": -0.254
    },
    {
     "kind": "room",
     "to": "pn2",
     "label": "Phòng ngủ 2",
     "sub": "10,47 m²",
     "yaw": 17.593,
     "pitch": 6.592
    }
   ],
   "thumb": "images/thumbs/can-ho.jpg"
  },
  {
   "id": "phong-khach",
   "level": 4,
   "title": "Phòng khách & phòng ăn",
   "crumb": "Phòng khách",
   "lead": "Sofa và kệ TV ở đầu căn, bàn ăn 4 chỗ gần cửa chính. Hành lang dẫn tới các phòng ngủ và phòng tắm.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": -13.124,
    "maxYaw": 22.311,
    "minPitch": -15.63,
    "maxPitch": 15.63,
    "yaw": -1.069,
    "pitch": 2.669,
    "hfov": 42.97,
    "maxHfov": 50.0,
    "minHfov": 12.277
   },
   "hotspots": [
    {
     "kind": "door",
     "to": "pn1",
     "label": "Phòng ngủ 1",
     "yaw": 4.692,
     "pitch": 0.533
    },
    {
     "kind": "door",
     "to": "pn2",
     "label": "Phòng ngủ 2",
     "yaw": 13.124,
     "pitch": 1.977
    },
    {
     "kind": "door",
     "to": "pn-master",
     "label": "Phòng ngủ master",
     "yaw": 13.023,
     "pitch": -2.601
    },
    {
     "kind": "door",
     "to": "wc-chung",
     "label": "Phòng tắm chung",
     "yaw": 10.048,
     "pitch": -2.734
    },
    {
     "kind": "door",
     "to": "bep",
     "label": "Bếp",
     "yaw": 0.267,
     "pitch": -6.386
    }
   ],
   "thumb": "images/thumbs/phong-khach.jpg",
   "room": true,
   "area": 20.42,
   "neighbors": [
    "pn1",
    "pn2",
    "pn-master",
    "wc-chung",
    "bep"
   ],
   "shape": [
    [
     2.416,
     2.283,
     32.156,
     61.187
    ],
    [
     2.416,
     61.187,
     16.357,
     98.174
    ],
    [
     32.156,
     47.032,
     62.268,
     62.329
    ],
    [
     62.268,
     39.954,
     70.632,
     62.329
    ]
   ],
   "shapePx": [
    [
     405,
     92,
     565,
     350
    ],
    [
     405,
     350,
     480,
     512
    ],
    [
     565,
     288,
     727,
     355
    ],
    [
     727,
     257,
     772,
     355
    ]
   ],
   "pin": [
    14.498,
    33.333
   ]
  },
  {
   "id": "bep",
   "level": 4,
   "title": "Bếp",
   "crumb": "Bếp",
   "lead": "Bếp chữ I dọc tường, mở ra khu bàn ăn.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": -9.113,
    "maxYaw": 11.697,
    "minPitch": -15.627,
    "maxPitch": 5.856,
    "yaw": 1.336,
    "pitch": -6.779,
    "hfov": 26.0,
    "maxHfov": 39.0,
    "minHfov": 6.0
   },
   "hotspots": [
    {
     "kind": "door",
     "to": "phong-khach",
     "label": "Phòng khách & phòng ăn",
     "yaw": -0.321,
     "pitch": -3.841
    },
    {
     "kind": "door",
     "to": "ban-cong",
     "label": "Ban công",
     "yaw": 3.363,
     "pitch": -8.211
    }
   ],
   "thumb": "images/thumbs/bep.jpg",
   "room": true,
   "area": 4.48,
   "neighbors": [
    "phong-khach",
    "ban-cong"
   ],
   "shape": [
    [
     16.357,
     61.187,
     31.599,
     98.174
    ]
   ],
   "shapePx": [
    [
     480,
     350,
     562,
     512
    ]
   ],
   "pin": [
    25.279,
    79.452
   ]
  },
  {
   "id": "ban-cong",
   "level": 4,
   "title": "Ban công",
   "crumb": "Ban công",
   "lead": "Ban công cạnh bếp, dùng làm khu giặt phơi.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": -5.434,
    "maxYaw": 14.735,
    "minPitch": -15.631,
    "maxPitch": 5.857,
    "yaw": 4.798,
    "pitch": -6.758,
    "hfov": 26.0,
    "maxHfov": 39.0,
    "minHfov": 6.0
   },
   "hotspots": [
    {
     "kind": "door",
     "to": "bep",
     "label": "Bếp",
     "yaw": 3.096,
     "pitch": -8.214
    }
   ],
   "thumb": "images/thumbs/ban-cong.jpg",
   "room": true,
   "area": 3.63,
   "neighbors": [
    "bep"
   ],
   "shape": [
    [
     32.156,
     61.187,
     43.123,
     96.575
    ]
   ],
   "shapePx": [
    [
     565,
     350,
     624,
     505
    ]
   ],
   "pin": [
    37.175,
    81.735
   ]
  },
  {
   "id": "wc-chung",
   "level": 4,
   "title": "Phòng tắm chung",
   "crumb": "Phòng tắm",
   "lead": "Lavabo, bồn cầu và khu tắm đứng.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": -1.87,
    "maxYaw": 18.847,
    "minPitch": -15.629,
    "maxPitch": 5.857,
    "yaw": 8.774,
    "pitch": -6.702,
    "hfov": 26.0,
    "maxHfov": 39.0,
    "minHfov": 6.0
   },
   "hotspots": [
    {
     "kind": "door",
     "to": "phong-khach",
     "label": "Phòng khách & phòng ăn",
     "yaw": 10.048,
     "pitch": -2.524
    }
   ],
   "thumb": "images/thumbs/wc-chung.jpg",
   "room": true,
   "area": 4.22,
   "neighbors": [
    "phong-khach"
   ],
   "shape": [
    [
     43.123,
     61.187,
     58.736,
     96.575
    ]
   ],
   "shapePx": [
    [
     624,
     350,
     708,
     505
    ]
   ],
   "pin": [
    50.929,
    81.735
   ]
  },
  {
   "id": "pn1",
   "level": 4,
   "title": "Phòng ngủ 1",
   "crumb": "Phòng ngủ 1",
   "lead": "Giường đôi, tủ đầu giường và tủ sát tường.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": -5.01,
    "maxYaw": 18.847,
    "minPitch": -7.857,
    "maxPitch": 15.628,
    "yaw": 7.229,
    "pitch": 5.706,
    "hfov": 26.0,
    "maxHfov": 39.0,
    "minHfov": 6.0
   },
   "hotspots": [
    {
     "kind": "door",
     "to": "phong-khach",
     "label": "Phòng khách & phòng ăn",
     "yaw": 4.692,
     "pitch": 0.533
    }
   ],
   "thumb": "images/thumbs/pn1.jpg",
   "room": true,
   "area": 8.48,
   "neighbors": [
    "phong-khach"
   ],
   "shape": [
    [
     32.156,
     2.283,
     58.736,
     47.032
    ]
   ],
   "shapePx": [
    [
     565,
     92,
     708,
     288
    ]
   ],
   "pin": [
    45.353,
    22.374
   ]
  },
  {
   "id": "pn-master",
   "level": 4,
   "title": "Phòng ngủ master",
   "crumb": "PN master",
   "lead": "Phòng ngủ lớn ở góc căn, giường đôi và tủ đầu giường. WC riêng nằm ngay phía trên, cửa mở ra sảnh nhỏ trước phòng.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": 2.776,
    "maxYaw": 25.0,
    "minPitch": -15.613,
    "maxPitch": 8.999,
    "yaw": 16.224,
    "pitch": -6.133,
    "hfov": 26.0,
    "maxHfov": 39.0,
    "minHfov": 6.599
   },
   "hotspots": [
    {
     "kind": "door",
     "to": "phong-khach",
     "label": "Phòng khách & phòng ăn",
     "yaw": 12.616,
     "pitch": -2.71
    },
    {
     "kind": "door",
     "to": "wc-master",
     "label": "WC phòng master",
     "yaw": 14.535,
     "pitch": 0.0
    }
   ],
   "thumb": "images/thumbs/pn-master.jpg",
   "room": true,
   "area": 11.27,
   "neighbors": [
    "phong-khach",
    "wc-master"
   ],
   "shape": [
    [
     58.736,
     61.644,
     98.141,
     98.174
    ]
   ],
   "shapePx": [
    [
     708,
     352,
     920,
     512
    ]
   ],
   "pin": [
    81.413,
    81.735
   ]
  },
  {
   "id": "wc-master",
   "level": 4,
   "title": "WC phòng master",
   "crumb": "WC master",
   "lead": "Lavabo, bồn cầu và vòi sen. Cửa mở ra sảnh nhỏ trước phòng ngủ master.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": 3.522,
    "maxYaw": 25.0,
    "minPitch": -11.369,
    "maxPitch": 10.752,
    "yaw": 16.666,
    "pitch": -0.307,
    "hfov": 26.0,
    "maxHfov": 39.0,
    "minHfov": 6.167
   },
   "hotspots": [
    {
     "kind": "door",
     "to": "pn-master",
     "label": "Phòng ngủ master",
     "yaw": 13.226,
     "pitch": -1.976
    }
   ],
   "thumb": "images/thumbs/wc-master.jpg",
   "room": true,
   "area": 3.82,
   "neighbors": [
    "pn-master"
   ],
   "shape": [
    [
     70.632,
     39.498,
     97.77,
     61.644
    ]
   ],
   "shapePx": [
    [
     772,
     255,
     918,
     352
    ]
   ],
   "pin": [
    84.387,
    50.913
   ]
  },
  {
   "id": "pn2",
   "level": 4,
   "title": "Phòng ngủ 2",
   "crumb": "Phòng ngủ 2",
   "lead": "Phòng góc phía trên, giường đôi, bàn làm việc và tủ quần áo sát tường.",
   "mode": "plan",
   "pannellum": {
    "type": "equirectangular",
    "panorama": "images/mat-bang.jpg",
    "haov": 50.0,
    "vaov": 31.262,
    "vOffset": 0,
    "avoidShowingBackground": true,
    "minYaw": 2.776,
    "maxYaw": 25.0,
    "minPitch": -7.85,
    "maxPitch": 15.613,
    "yaw": 16.371,
    "pitch": 6.382,
    "hfov": 26.0,
    "maxHfov": 39.0,
    "minHfov": 6.599
   },
   "hotspots": [
    {
     "kind": "door",
     "to": "phong-khach",
     "label": "Phòng khách & phòng ăn",
     "yaw": 13.124,
     "pitch": 1.977
    }
   ],
   "thumb": "images/thumbs/pn2.jpg",
   "room": true,
   "area": 10.47,
   "neighbors": [
    "phong-khach"
   ],
   "shape": [
    [
     59.48,
     2.283,
     98.141,
     39.498
    ]
   ],
   "shapePx": [
    [
     712,
     92,
     920,
     255
    ]
   ],
   "pin": [
    83.271,
    20.091
   ]
  }
 ]
};
