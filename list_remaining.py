import os
files = sorted([f for f in os.listdir('stuff-screen') if f.endswith('.png')])
print(f"Total files: {len(files)}")
target = "Capture d'écran 2026-05-10 142411.png"
if target in files:
    idx = files.index(target)
    print(f"Index of {target}: {idx}")
    remaining = files[idx+1:]
    print(f"Remaining files count: {len(remaining)}")
    for f in remaining:
        print(f)
else:
    print(f"{target} not found")
