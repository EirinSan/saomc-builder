import os

files = [f for f in os.listdir("C:\\Users\\Isaac\\saomc-builder\\stuff-screen") if f.endswith(".png")]
files.sort()

# Compare against processed files
# For simplicity, we just dump them
print(f"Total files: {len(files)}")
print(files)
