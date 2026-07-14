import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User

def create_simple_user():
    username = 'user1'
    password = '1'
    user_code = '1'
    
    if User.objects.filter(username=username).exists():
        # If user exists, just update the password and ensure it's active
        user = User.objects.get(username=username)
        user.set_password(password)
        user.user_code = user_code
        user.status = User.Status.ACTIVE
        user.save()
        print(f"User {username} already exists. Password has been reset and account activated.")
        return

    user = User.objects.create_user(
        username=username,
        password=password,
        user_code=user_code,
        role=User.Role.STUDENT, # Defaulting to student for simplicity
        status=User.Status.ACTIVE
    )
    print(f"Successfully created simple user: {username} | Code: {user_code}")

if __name__ == "__main__":
    try:
        create_simple_user()
    except Exception as e:
        print(f"Error creating user: {e}")
