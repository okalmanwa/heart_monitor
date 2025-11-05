#!/usr/bin/env python
"""
Generate a Django secret key for production use.
Run: python generate_secret_key.py
"""
from django.core.management.utils import get_random_secret_key

if __name__ == '__main__':
    secret_key = get_random_secret_key()
    print("\n" + "="*60)
    print("Django Secret Key (copy this for Railway):")
    print("="*60)
    print(secret_key)
    print("="*60)
    print("\nAdd this to Railway as environment variable:")
    print("Variable Name: SECRET_KEY")
    print("Variable Value: (paste the key above)")
    print("\n")

