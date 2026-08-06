import os
import django
import uuid
import json
import random
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.hashers import make_password

# Original 37 majors from the file
majors = {
    "01": "Ngoại thương",
    "02": "Quản trị kinh doanh tổng quát",
    "03": "Quản trị kinh doanh du lịch",
    "04": "Kinh tế phát triển",
    "05": "Thống kê Kinh tế - Xã hội",
    "06": "Kế toán",
    "07": "Ngân hàng",
    "08": "Quản trị kinh doanh thương mại",
    "09": "Kinh tế chính trị",
    "11": "Kinh tế và Quản lý công",
    "12": "Quản trị Marketing",
    "13": "Luật kinh doanh",
    "14": "Tin học quản lý",
    "15": "Tài chính doanh nghiệp",
    "16": "Quản trị tài chính",
    "17": "Quản trị nguồn nhân lực",
    "18": "Kiểm toán",
    "19": "Luật học",
    "20": "Kinh tế đầu tư",
    "21": "Quản trị hệ thống thông tin",
    "22": "Thương mại điện tử",
    "23": "Quản trị khách sạn",
    "24": "Tài chính công",
    "25": "Quản trị chuỗi cung ứng và logistics",
    "26": "Quản trị sự kiện",
    "27": "Hành chính công",
    "28": "Truyền thông Marketing",
    "29": "Khoa học dữ liệu và phân tích kinh doanh",
    "30": "Kinh doanh số",
    "31": "Marketing số",
    "32": "Kinh tế quốc tế",
    "33": "Công nghệ tài chính",
    "34": "Tài chính quốc tế",
    "35": "Kinh doanh giao nhận và vận tải quốc tế",
    "36": "Trí tuệ nhân tạo trong kinh doanh",
    "37": "Luật Thương mại quốc tế"
}

# New threshold and combo map: (Admission Threshold, Transfer Threshold, Combos)
spec_map = {
    "Kinh tế phát triển": (24.50, 20.00, ["A00", "A01", "D01", "D90"]),
    "Kinh tế và Quản lý công": (24.50, 20.00, ["A00", "A01", "D01", "D90"]),
    "Kinh tế đầu tư": (24.50, 20.00, ["A00", "A01", "D01", "D90"]),
    "Thống kê Kinh tế - Xã hội": (23.50, 20.00, ["A00", "A01", "D01", "D90"]),
    "Thống kê tin học": (23.50, 20.00, ["A00", "A01", "D01", "D90"]),
    "Kinh tế chính trị": (23.00, 20.00, ["A00", "A01", "D01", "D96"]),
    "Hành chính công": (23.00, 20.00, ["A00", "A01", "D01", "D96"]),
    "Quản trị kinh doanh tổng quát": (24.75, 21.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị doanh nghiệp": (24.75, 21.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị tài chính": (24.75, 21.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị chuỗi cung ứng và logistics": (24.75, 21.00, ["A00", "A01", "D01", "D90"]),
    "Kinh doanh số": (24.75, 21.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị Marketing": (25.75, 22.50, ["A00", "A01", "D01", "D90"]),
    "Truyền thông Marketing": (25.75, 22.50, ["A00", "A01", "D01", "D90"]),
    "Marketing số": (25.75, 22.50, ["A00", "A01", "D01", "D90"]),
    "Ngoại thương": (26.50, 24.00, ["A00", "A01", "D01", "D90"]),
    "Kinh doanh giao nhận và vận tải quốc tế": (26.50, 24.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị kinh doanh thương mại": (26.00, 21.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị bán hàng": (26.00, 21.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị chuỗi cung ứng": (26.00, 21.00, ["A00", "A01", "D01", "D90"]),
    "Thương mại điện tử": (26.50, 22.00, ["A00", "A01", "D01", "D90"]),
    "Tài chính doanh nghiệp": (24.00, 20.25, ["A00", "A01", "D01", "D90"]),
    "Ngân hàng": (24.00, 20.25, ["A00", "A01", "D01", "D90"]),
    "Thị trường tài chính": (24.00, 20.25, ["A00", "A01", "D01", "D90"]),
    "Tài chính quốc tế": (24.00, 20.25, ["A00", "A01", "D01", "D90"]),
    "Công nghệ tài chính": (24.25, 21.50, ["A00", "A01", "D01", "D90"]),
    "Công nghệ tài chính (Fintech)": (24.25, 21.50, ["A00", "A01", "D01", "D90"]),
    "Kế toán doanh nghiệp": (23.85, 20.25, ["A00", "A01", "D01", "D90"]),
    "Kế toán công": (23.85, 20.25, ["A00", "A01", "D01", "D90"]),
    "Kế toán": (23.85, 20.25, ["A00", "A01", "D01", "D90"]),
    "Kiểm toán": (24.25, 20.25, ["A00", "A01", "D01", "D90"]),
    "Quản trị nhân lực": (24.75, 20.50, ["A00", "A01", "D01", "D90"]),
    "Quản trị nguồn nhân lực": (24.75, 20.50, ["A00", "A01", "D01", "D90"]),
    "Quản trị hệ thống thông tin": (23.75, 20.00, ["A00", "A01", "D01", "D90"]),
    "Tin học quản lý": (23.75, 20.00, ["A00", "A01", "D01", "D90"]),
    "Trí tuệ nhân tạo trong kinh doanh": (23.75, 20.00, ["A00", "A01", "D01", "D90"]),
    "Luật học": (23.50, 20.00, ["A00", "A01", "D01", "D96"]),
    "Luật kinh doanh": (25.25, 20.00, ["A00", "A01", "D01", "D96"]),
    "Luật Thương mại quốc tế": (25.25, 20.00, ["A00", "A01", "D01", "D96"]),
    "Luật thương mại quốc tế": (25.25, 20.00, ["A00", "A01", "D01", "D96"]),
    "Khoa học dữ liệu và phân tích kinh doanh": (24.60, 21.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị du lịch": (24.50, 20.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị kinh doanh du lịch": (24.50, 20.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị sự kiện": (24.50, 20.00, ["A00", "A01", "D01", "D90"]),
    "Quản trị khách sạn": (23.50, 20.00, ["A00", "A01", "D01", "D90"])
}

last_names = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
middle_names = ["Văn", "Thị", "Hữu", "Thanh", "Minh", "Thu", "Ngọc", "Hải", "Xuân", "Quang", "Hồng", "Đức", "Công", "Bá"]
first_names = ["An", "Anh", "Bình", "Cường", "Dũng", "Dương", "Đạt", "Đức", "Giang", "Hải", "Hiếu", "Hòa", "Hoàng", "Hùng", "Hương", "Huyền", "Khang", "Khánh", "Khoa", "Kiên", "Lâm", "Lan", "Linh", "Long", "Ly", "Mai", "Minh", "Nam", "Nga", "Ngọc", "Nhi", "Nhung", "Oanh", "Phong", "Phú", "Phương", "Quân", "Quang", "Quyên", "Sơn", "Tài", "Tâm", "Thảo", "Thắng", "Thành", "Thủy", "Tiến", "Trang", "Trí", "Tú", "Tuấn", "Uyên", "Vân", "Việt", "Vy", "Yến"]

seed_data = []
now = datetime.utcnow().isoformat() + "Z"
pwd_hash = make_password("1") # The password for all students is "1"

for code, name in majors.items():
    major_id = str(uuid.uuid4())
    
    if name in spec_map:
        adm_thresh, trans_thresh, combos = spec_map[name]
    else:
        adm_thresh = round(random.uniform(20.0, 27.0), 1)
        trans_thresh = round(adm_thresh - random.uniform(1.0, 3.0), 1)
        combos = ["A00", "A01", "D01", "D90"]
        
    seed_data.append({
        "model": "students.major",
        "pk": major_id,
        "fields": {
            "name": name,
            "major_id": f"N{code}",
            "admission_threshold": trans_thresh,
            "created_at": now,
            "updated_at": now
        }
    })
    
    for b in [1, 2]:
        class_id = str(uuid.uuid4())
        class_name = f"{name} - Lớp {b}"
        class_code = f"49K{code}.{b}"
        seed_data.append({
            "model": "students.class",
            "pk": class_id,
            "fields": {
                "name": class_name,
                "class_id": class_code,
                "major": major_id,
                "created_at": now,
                "updated_at": now
            }
        })
        
        for c in range(1, 51):
            user_id = str(uuid.uuid4())
            student_code = f"2311215{code}{b}{c:02d}"
            
            # Generate random realistic name
            last = random.choice(last_names)
            middle = random.choice(middle_names)
            first = random.choice(first_names)
            full_name = f"{last} {middle} {first}"
            
            seed_data.append({
                "model": "users.user",
                "pk": user_id,
                "fields": {
                    "password": pwd_hash,
                    "is_superuser": False,
                    "username": student_code,
                    "first_name": first,
                    "last_name": f"{last} {middle}",
                    "email": f"{student_code}@example.com",
                    "is_staff": False,
                    "is_active": True,
                    "date_joined": now,
                    "role": "STUDENT"
                }
            })
            
            # Generate score: adm_thresh + (0.25 * random steps), max 30.0
            max_steps = int((30.0 - adm_thresh) / 0.25)
            steps = random.randint(0, min(10, max_steps))
            score = round(adm_thresh + (steps * 0.25), 2)
            
            # Random combo
            combo = random.choice(combos)
            
            seed_data.append({
                "model": "students.student",
                "pk": user_id,
                "fields": {
                    "user": user_id,
                    "student_id": student_code,
                    "full_name": full_name,
                    "date_of_birth": "2005-01-01",
                    "student_class": class_id,
                    "admission_score": score,
                    "admission_combo": combo,
                    "created_at": now,
                    "updated_at": now
                }
            })

with open("../seed_data.json", "w", encoding="utf-8") as f:
    json.dump(seed_data, f, ensure_ascii=False, indent=2)

print(f"Generated {len(seed_data)} items in seed_data.json.")
