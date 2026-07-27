import os
import sys
# Cấu hình Django
sys.path.append(os.path.join(os.getcwd(), 'CongMotCua', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from apps.users.models import User
for u in User.objects.all():
    print(f"Username: {u.username}, Password: {u.password}")