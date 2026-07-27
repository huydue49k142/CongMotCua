import os
import sys
# Add backend to path so we can import settings
sys.path.append(os.path.join(os.getcwd(), 'CongMotCua', 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()

from django.contrib.auth.hashers import make_password
print(make_password('123456', salt='placeholder', hasher='pbkdf2_sha256'))