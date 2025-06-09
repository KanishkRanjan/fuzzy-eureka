import json

# Step 1: Read JSON data from a file
input_file = "universities_updated.json"  # Replace with your file name
with open(input_file, "r", encoding="utf-8") as f:
    data = json.load(f)

# Loop through each entry and update image URL
for idx, college in enumerate(data):
    name = college["name"]
    print(f"\n{idx + 1}. College: {name}")
    print(f"Current image URL: {college['image_url']}")
    new_url = input("Enter new image URL (or press Enter to keep current): ").strip()
    
    if new_url:
        college["image_url"] = new_url
        print("✅ Image URL updated.")
    else:
        print("⏭️ Skipped, image URL kept unchanged.")

# Optional: Print the final updated JSON
print(json.dumps(data, indent=2))
with open("updated.json", "w") as f:
    json.dump(data, f, indent=2)
