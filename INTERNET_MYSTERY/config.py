# -*- coding: utf-8 -*-
import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'internet-mystery-secret-key-2026'
    STATIC_FOLDER = 'static'
    TEMPLATES_FOLDER = 'templates'
    DEBUG = True
