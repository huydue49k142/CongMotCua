import os
import django
import uuid
import json
import random
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.hashers import make_password

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

last_names = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Phan", "Vũ", "Võ", "Đặng", "Bùi", "Đỗ", "Hồ", "Ngô", "Dương", "Lý"]
middle_names = ["Văn", "Thị", "Hữu", "Thanh", "Minh", "Thu", "Ngọc", "Hải", "Xuân", "Quang", "Hồng", "Đức", "Công", "Bá"]
first_names = ["An", "Anh", "Bình", "Cường", "Dũng", "Dương", "Đạt", "Đức", "Giang", "Hải", "Hiếu", "Hòa", "Hoàng", "Hùng", "Hương", "Huyền", "Khang", "Khánh", "Khoa", "Kiên", "Lâm", "Lan", "Linh", "Long", "Ly", "Mai", "Minh", "Nam", "Nga", "Ngọc", "Nhi", "Nhung", "Oanh", "Phong", "Phú", "Phương", "Quân", "Quang", "Quyên", "Sơn", "Tài", "Tâm", "Thảo", "Thắng", "Thành", "Thủy", "Tiến", "Trang", "Trí", "Tú", "Tuấn", "Uyên", "Vân", "Việt", "Vy", "Yến"]

seed_data = []
now = datetime.utcnow().isoformat() + "Z"
pwd_hash = make_password("1") # The password for all students is "1"

for code, name in majors.items():
    major_id = str(uuid.uuid4())
    seed_data.append({
        "model": "students.major",
        "pk": major_id,
        "fields": {
            "name": name,
            "major_id": f"N{code}",
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
            
            seed_data.append({
                "model": "students.student",
                "pk": user_id,
                "fields": {
                    "user": user_id,
                    "student_id": student_code,
                    "full_name": full_name,
                    "date_of_birth": "2005-01-01",
                    "student_class": class_id,
                    "created_at": now,
                    "updated_at": now
                }
            })

with open("../seed_data.json", "w", encoding="utf-8") as f:
    json.dump(seed_data, f, ensure_ascii=False, indent=2)

print(f"Generated {len(seed_data)} items in seed_data.json.")
