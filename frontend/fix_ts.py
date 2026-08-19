import os, glob, re

frontend_dir = r'c:\Users\KIIT\Desktop\SRS se\frontend\src'

def replace_in_file(filepath, pattern, repl):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(pattern, repl, content)
    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

for ext in ('*.tsx', '*.ts'):
    for filepath in glob.glob(os.path.join(frontend_dir, '**', ext), recursive=True):
        # Fix React import
        replace_in_file(filepath, r'import React, \{', 'import {')
        replace_in_file(filepath, r'import React from \'react\';\n', '')
        
        # Fix api import path for donor pages
        if 'pages\\donor' in filepath or 'pages/donor' in filepath:
            replace_in_file(filepath, r'\.\./\.\./\.\./services/api', '../../services/api')

# Fix Profile.tsx Droplet import
profile_path = os.path.join(frontend_dir, 'pages', 'donor', 'Profile.tsx')
if os.path.exists(profile_path):
    replace_in_file(profile_path, r'import \{([^}]+)\} from \'lucide-react\';', lambda m: f'import {{{m.group(1)}{", Droplet" if "Droplet" not in m.group(1) else ""}}} from \'lucide-react\';')

# Fix Requests.tsx unused imports
requests_path = os.path.join(frontend_dir, 'pages', 'requests', 'Requests.tsx')
if os.path.exists(requests_path):
    replace_in_file(requests_path, r'Search,\s*Filter,\s*AlertCircle,\s*', '')

# Fix Dashboard.tsx unused entry
dashboard_path = os.path.join(frontend_dir, 'pages', 'dashboard', 'Dashboard.tsx')
if os.path.exists(dashboard_path):
    replace_in_file(dashboard_path, r'\(entry, index\)', '(_, index)')
