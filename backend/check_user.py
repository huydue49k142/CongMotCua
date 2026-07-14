import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.users.models import User

try:
    user = User.objects.get(username='sinhvien_test')
    print(f"User found: {user.username}, Role: {user.role}, Status: {user.status}, Active: {user.is_active}")
except User.DoesNotExist:
    print("User NOT found")
except Exception as e:
    print(f"Error: {e}")