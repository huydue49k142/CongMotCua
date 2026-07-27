import json
import uuid
import random
import datetime
import os

def generate_data():
    data = []
    
    # Ensure timezone-aware datetime
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    # Hashed password for '123456'
    password_hash = "pbkdf2_sha256$1200000$placeholder$oK9H1MD1r1pZrhNU27dYpSYwxsdk5PY26dPZ1xzkqik="

    # Generate Majors
    majors = []
    for i in range(50):
        major_pk = str(uuid.uuid4())
        major = {
            "model": "students.major",
            "pk": major_pk,
            "fields": {
                "name": f"Ngành {i+1}",
                "major_id": f"N{i+1:03d}",
                "created_at": now,
                "updated_at": now
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
                "major": random.choice(majors)['pk'],
                "created_at": now,
                "updated_at": now
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
        username = f"2311215142{i+1:02d}"
        
        user = {
            "model": "users.user",
            "pk": user_pk,
            "fields": {
                "password": password_hash,
                "is_superuser": False,
                "username": username,
                "first_name": first,
                "last_name": last,
                "email": f"{username}@example.com",
                "is_staff": False,
                "is_active": True,
                "date_joined": now,
                "role": "STUDENT"
            }
        }
        data.append(user)

        dob = (datetime.date.today() - datetime.timedelta(days=random.randint(18*365, 25*365))).isoformat()
        student = {
            "model": "students.student",
            "fields": {
                "user": user_pk,
                "student_id": username,
                "full_name": f"{last} {first}",
                "date_of_birth": dob,
                "student_class": random.choice(classes)['pk'],
                "created_at": now,
                "updated_at": now
            }
        }
        data.append(student)

    # Output to CongMotCua/seed_data.json
    output_path = os.path.join('CongMotCua', 'seed_data.json')

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Generated data successfully into {output_path}")

if __name__ == '__main__':
    generate_data()