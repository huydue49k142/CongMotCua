import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User

def create_staff_user():
    username = 'ADMIN1'
    password = '123'
    
    if User.objects.filter(username=username).exists():
        user = User.objects.get(username=username)
        user.set_password(password)
        user.role = User.Role.STAFF
        user.save()
        print(f"User {username} already exists. Password has been reset and role set to STAFF.")
        return

    user = User.objects.create_user(
        username=username,
        password=password,
        role=User.Role.STAFF,
        first_name='Quản trị viên',
        last_name='Phòng Đào tạo'
    )
    print(f"Successfully created staff user: {username}")

if __name__ == "__main__":
    try:
        create_staff_user()
    except Exception as e:
        print(f"Error creating staff user: {e}")
