import re

with open('/tmp/ScanResult_original.tsx', 'r') as f:
    orig = f.read()

with open('src/pages/user/ScanResult.tsx', 'r') as f:
    curr = f.read()

split_str = '        if (isCloudflare || isProxy) severity = "Low";'
idx = orig.find(split_str)
if idx != -1:
    rest_of_orig = orig[idx:]
    
    # We will append this to curr
    curr_stripped = curr.rstrip()
    
    fixed_content = curr_stripped + '\n' + rest_of_orig
    with open('src/pages/user/ScanResult.tsx', 'w') as f:
        f.write(fixed_content)
    print("Fixed!")
else:
    print("Could not find split point in orig")
