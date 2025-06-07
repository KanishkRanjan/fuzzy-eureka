from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

import json
import os

load_dotenv() 

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')  # Default to local MongoDB if not set


def save_to_mongodb(data, db_name='shiksha_data', collection_name='institutions'):
    try:
        # Connect to MongoDB (replace with your MongoDB Atlas connection string if needed)
        client = MongoClient(MONGO_URI)
        
        # Access database and collection
        db = client[db_name]
        collection = db[collection_name]
        
        # Insert data
        result = collection.insert_one(data)
        print(f"Data inserted with ID: {result.inserted_id}")
        
        # Verify insertion by retrieving and printing the document
        inserted_doc = collection.find_one({'_id': result.inserted_id})
        print("Inserted document:")
        print(json.dumps(inserted_doc, indent=4, default=str))  # Convert ObjectId to string for printing
        
    except ConnectionError as e:
        print(f"Error connecting to MongoDB: {e}")
    except OperationFailure as e:
        print(f"Error performing MongoDB operation: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        # Close the MongoDB connection
        client.close()


eligibility = {
    'BTech': '10+2 with PCM',
    'MBA': 'Graduation with any stream',
    'MBBS': '10+2 with PCB',
    'BBA': '10+2 with any stream',
    'BCA': '10+2 with any stream',
    'MTech': 'BTech in relevant field',
    'LLB': 'Graduation with any stream',
    'BSc': '10+2 with PCM/PCB',
    'MSc': 'BSc in relevant field',
    'BCom': '10+2 with any stream'
}


if __name__ == "__main__":
    name = input('Enter institution name: ')
    institution_types = ['Private', 'Government', 'Deemed University', 'Public University', 'Autonomous Institution', 'Other']
    institution_type = institution_types[int(input('Enter institution type:\n1. Private\n2. Government\n3. Deemed University\n4. Public University\n5. Autonomous Institution\n6. Other\n'))]
    # location = input('Enter institution location: ')
    city = input('Enter city: ')
    state = input('Enter state: ')
    country = input('Enter country: ')
    pincode = input('Enter pincode: ')

    established_year = input('Enter established year: ')
    accreditation = input('Enter accreditation: ')
    total_students = int(input('Enter total students: '))
    entrance_exams = input('Enter entrance exams: ').split(',')
    required_documents = input('Enter required documents: ').split(',')
    email = input('Enter email: ')
    phone = input('Enter phone number: ')
    address = input('Enter address: ')
    website = input('Enter website: ')
    contact_info = {
        'email': email,
        'phone': phone,
        'address': address,
        'website': website
    }
    no_of_courses = int(input('Enter number of courses offered: '))
    courses_offered = []
    for _ in range(no_of_courses):
        course_name = input('Enter course name: ')
        course_duration = input('Enter course duration: ')
        course_fee = float(input('Enter course fee: '))
        eligibility = input(f'Enter eligibility for {course_name}: ')
        courses_offered.append({
            'name': course_name,
            'duration': course_duration,
            'fee': course_fee,
            'eligibility': eligibility
        })
    

    top_recruiters = input('Enter top recruiters: ').split(',')
    placements = {
        'average_salary': float(input('Enter average salary: ')),
        'highest_salary': float(input('Enter highest salary: ')),
        'placement_rate': float(input('Enter placement rate: '))
    }
    image = input('Enter image URL: ')
    college_rating = float(input('Enter college rating: '))
    field_taught = input('Enter field taught: ').split(',')

    institution_data = { 
        'name': name,
        'type': institution_type,
        'location':{
            'city': city,
            'state': state,
            'country': country,
            'pincode': pincode
        },
        "established_year": established_year,
        'accreditation': accreditation,
        'total_students': total_students,
        'admission_process': f"The admission process at {name} is merit-based and considers the following criteria:\n\n"
                          f"- Academic performance in 10+2 or equivalent examination\n"
                          f"- Valid entrance examination scores ({', '.join(entrance_exams)})\n"
                          f"- Counselling and seat allocation process\n"
                          f"- Document verification and fee payment\n",
        'required_documents': required_documents,
        'contact_info': {
            'email': email,
            'phone': phone,
            'address': address,
            'website': website
        },
        'courses_offered': courses_offered,
        'eligibility_criteria': college_eligibility,
        'acceptance_exams': entrance_exams,
        'top_recruiters': top_recruiters,
        'placements': placements,
        'image_url': image,
        'rating': college_rating,
        'field_taught': field_taught
    }

    institution_data['score'] = institution_data['placements']['average_salary'] * institution_data['placements']['placement_rate'] / 100 + institution_data['rating'] * 1000

    print(institution_data)

    save_to_mongodb(institution_data)


    # Example data to insert