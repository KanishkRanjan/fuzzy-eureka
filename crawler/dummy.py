import random
from faker import Faker
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
import time
import json

from random import randint

# Initialize Faker for realistic data
fake = Faker('en_IN')

# Lists for random data generation
institution_types = ['Private', 'Government', 'Public-Private Partnership']
entrance_exams = ['JEE Main', 'NEET', 'CAT', 'MAT', 'GATE', 'CLAT', 'SAAT', 'BITSAT', 'VITEEE', 'CET']
document_types = ['10th Marksheet', '12th Marksheet', 'Entrance Exam Scorecard', 'Identity Proof (Aadhaar/Passport)', 
                  'Caste Certificate (if applicable)', 'Domicile Certificate', 'Passport-size Photos', 'Transfer Certificate']
courses = ['BTech', 'MBA', 'MBBS', 'BBA', 'BCA', 'MTech', 'LLB', 'BSc', 'MSc', 'BCom']
companies = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'HCL', 'Amazon', 'Microsoft', 'Deloitte', 'IBM', 
             'Capgemini', 'Adani', 'Reliance', 'Tata Motors', 'L&T']
institution_images = [
    'https://images.pexels.com/photos/256381/pexels-photo-256381.jpeg',
    'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg',  
    'https://images.pexels.com/photos/5669619/pexels-photo-5669619.jpeg',
    'https://images.pexels.com/photos/3845807/pexels-photo-3845807.jpeg',
]

City = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow']
States = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'West Bengal', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh']

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

acceptance_exams = [ 'JEE Main', 'NEET', 'CAT', 'MAT', 'GATE', 'CLAT', 'SAAT', 'BITSAT', 'VITEEE', 'CET']

recruiters  = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'HCL', 'Amazon', 'Microsoft', 'Deloitte', 'IBM',
               'Capgemini', 'Adani', 'Reliance', 'Tata Motors', 'L&T']

courses_type = [ 'engineering', 'management', 'medical', 'commerce', 'arts', 'science' ]

# Function to generate random institution data
def generate_institution_data():
    # Generate course and fee structure

    image = random.choice(institution_images)
    institution_name = fake.company() + ' University'  # Random institution name
    institution_type = random.choice(institution_types)
    location = {
        'city': random.choice(City),
        'state': random.choice(States),
        'country': 'India',
        'pincode': str(random.randint(100000, 999999))
    }
    established_year = random.randint(1950, 2023)  # Random year between 1950 and 2023
    accreditation = random.choice(['NAAC A+', 'NAAC A', 'NBA Accredited', 'UGC Approved', 'AICTE Approved'])
    total_students = random.randint(1000, 20000)  # Random number of students
    admission_process = (
        f"The admission process at {institution_name} is merit-based and considers the following criteria:\n\n"
        "- Academic performance in 10+2 or equivalent examination\n"
        f"- Valid entrance examination scores ({'/'.join(random.sample(entrance_exams, random.randint(2, 3)))})\n"
        "- Counselling and seat allocation process\n"
        "- Document verification and fee payment\n"
    )
    required_documents = (random.sample(document_types, random.randint(4, 7)))
    contact_info = {
        'email': fake.email(),
        'phone': fake.phone_number(),
        'address': fake.address(),
        'website': fake.url()
    }

    taugth_courses = random.sample(courses, random.randint(3, 6))  # Randomly select 3 to 6 courses

    courses_details = [ {'name': course, 'duration' : random.randint(4, 5), 'annual_fees' : randint(25000,35000)} for course in taugth_courses]

    college_eligibility = [ {'course': course, 'eligibility': eligibility[course]} for course in taugth_courses ]

    college_acceptance_exams = random.sample(acceptance_exams, random.randint(2, 4))

    top_recruiters = random.sample(recruiters, 6) 
    placements = {
        'average_salary': round(random.uniform(3, 10), 1),  # Average salary in LPA
        'highest_salary': round(random.uniform(15, 50), 1),  # Highest salary in LPA
        'placement_rate': random.randint(70, 95)  # Placement rate in percentage
    }   
    
    college_rating = round(random.uniform(1, 5), 1)  # Random rating between 1 and 5

    courses_offered = random.sample(courses_type, random.randint(1, 3))  # Randomly select 1 to 3 course types
    # Generate institution data
    institution_data = {
        'name': institution_name,
        'type': institution_type,
        'location': location,
        'established_year': established_year,
        'accreditation': accreditation,
        'total_students': total_students,
        'admission_process': admission_process,
        'required_documents': required_documents,
        'contact_info': contact_info,
        'courses_offered': courses_details,
        'eligibility_criteria': college_eligibility,
        'acceptance_exams': college_acceptance_exams,
        'top_recruiters': top_recruiters,
        'placements': placements,
        'image_url': image,
        'rating': college_rating,
        'field_taught': courses_offered
    }


    institution_data['score'] = institution_data['placements']['average_salary'] * institution_data['placements']['placement_rate'] / 100 + institution_data['rating'] * 1000
    
    return institution_data

# Function to save data to MongoDB
def save_to_mongodb(data, db_name='shiksha_data', collection_name='institutions'):
    try:
        # Connect to MongoDB (replace with your MongoDB Atlas connection string if needed)
        client = MongoClient('')
        
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

# Main execution
if __name__ == "__main__":
    # Generate random institution data
    # print(generate_institution_data())
    print("Starting data generation and insertion into MongoDB...\n")
    for i in range(50):
        print(f"Generating data for institution {i+1}...")
        data = generate_institution_data()
        save_to_mongodb(data)
        time.sleep(.2)  # Sleep to avoid overwhelming the database with requests
        print(f"Data for institution {i+1} saved successfully.\n")
        print("-" * 50)
        print("\n")