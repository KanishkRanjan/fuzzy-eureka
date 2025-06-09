from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv
import json
import os
import time

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')

def save_to_mongodb(data, db_name='shiksha_data', collection_name='institutions'):
    try:
        client = MongoClient(MONGO_URI)
        db = client[db_name]
        collection = db[collection_name]
        result = collection.insert_one(data)
        print(f"Data inserted with ID: {result.inserted_id}")
        inserted_doc = collection.find_one({'_id': result.inserted_id})
        print("Inserted document:")
        print(json.dumps(inserted_doc, indent=4, default=str))
    except ConnectionError as e:
        print(f"Error connecting to MongoDB: {e}")
    except OperationFailure as e:
        print(f"Error performing MongoDB operation: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        client.close()


# Sample data for M.S. Ramaiah Institute of Technology (MSRIT)
with open('updated.json', 'r') as f:
    set = {}
    institutions_data = json.load(f)
    for institution_data in institutions_data:
        if institution_data['name'] in set:
            print(f"Duplicate institution found: {institution_data['name']}")
            continue
        set[institution_data['name']] = True

        institution_data['score'] = float(institution_data['placements']['average_salary']) * float(institution_data['placements']['placement_rate']) // 100 + (float(institution_data['rating']) // 2) * 1000
        save_to_mongodb(institution_data)
        time.sleep(.01)
        print(f"Data for institution {institution_data['name']} saved successfully.\n")
        print("-" * 50)
        print("\n")