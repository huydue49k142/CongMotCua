import json
import uuid
import random
import datetime

def generate_data():
    data = []
    
    # Generate Majors
    majors = []
    for i in range(50):
        major_pk = str(uuid.uuid4())
        major = {
            "model": "students.major",
            "pk": major_pk,
            "fields": {
                "name": f"Ngành {i+1}",
                "major_id": f"N{i+1:03d}"
            }
        }
        majors.append(major)
        data.append(major)

    # Generate Classes
    classes = []
    for i in range(50):
        class_pk = str(uuid.uuid4())
        class_item = {
            "model": "students.class",
            "pk": class_pk,
            "fields": {
                "name": f"Lớp {i+1}",
                "class_id": f"L{i+1:03d}",
                "major": random.choice(majors)['pk']
            }
        }
        classes.append(class_item)
        data.append(class_item)

    # Generate Users and Students
    first_names = ["An", "Bình", "Cường", "Dung", "Hà", "Hải", "Hương", "Khánh", "Linh", "Minh"]
    last_names = ["Nguyễn", "Trần", "Lê", "Phạm", "Hoàng", "Huỳnh", "Võ", "Đặng", "Bùi", "Đỗ"]

    for i in range(50):
        user_pk = str(uuid.uuid4())
        first = random.choice(first_names)
        last = random.choice(last_names)
        
        user = {
            "model": "users.user",
            "pk": user_pk,
            "fields": {
                "password": "pbkdf2_sha256$720000$placeholder$hash", # Placeholder
                "is_superuser": False,
                "username": f"sv{i+1:03d}",
                "first_name": first,
                "last_name": last,
                "email": f"sv{i+1:03d}@example.com",
                "is_staff": False,
                "is_active": True,
                "date_joined": datetime.datetime.now().isoformat(),
                "role": "STUDENT"
            }
        }
        data.append(user)

        dob = (datetime.date.today() - datetime.timedelta(days=random.randint(18*365, 25*365))).isoformat()
        student = {
            "model": "students.student",
            "fields": {
                "user": user_pk,
                "student_id": f"SV{i+1:03d}",
                "full_name": f"{last} {first}",
                "date_of_birth": dob,
                "student_class": random.choice(classes)['pk']
            }
        }
        data.append(student)

    with open('seed_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    generate_data()
    print("Generated seed_data.json successfully. Remember to replace password hashes.")