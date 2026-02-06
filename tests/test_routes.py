#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""测试路由导入"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

from backend.api.graph import router

print('OK graph.py imported')
print(f'Routes count: {len(router.routes)}')
for route in router.routes:
    print(f'   {list(route.methods)} {route.path}')
