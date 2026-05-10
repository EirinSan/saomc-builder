import os

files = [f for f in os.listdir("C:\\Users\\Isaac\\saomc-builder\\stuff-screen") if f.endswith(".png")]
files.sort()

# These are the files I read in batch 1 to 10
# I read exactly 200 files. The last one in batch 10 was "Capture d'écran 2026-05-10 142411.png" (index 199 perhaps?)
# Wait, let's just find the index of "Capture d'écran 2026-05-10 142411.png" and get the rest.

try:
    idx = files.index("Capture d'écran 2026-05-10 142411.png")
    print(f"Index is {idx}")
    print("Next 20 files:")
    print(files[idx+1:idx+21])
except Exception as e:
    print(e)
