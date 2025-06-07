import json

# Step 1: Load the JSON file
with open("institution_data.json", "r") as f:
    universities = json.load(f)  # This should be a list of university dictionaries

# Step 2: Convert eligibility_criteria in each item
for uni in universities:
    criteria = uni.get("eligibility_criteria")
    if isinstance(criteria, dict):  # Only convert if it's a dictionary
        uni["eligibility_criteria"] = [
            {"name": key, "required": value} for key, value in criteria.items()
        ]

# Step 3: Save the updated data back to the file (or another file)
with open("universities_updated.json", "w") as f:
    json.dump(universities, f, indent=2)