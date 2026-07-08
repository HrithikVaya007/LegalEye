import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_users():
    uri = os.getenv("MONGODB_URI")
    db_name = os.getenv("DATABASE_NAME")
    client = AsyncIOMotorClient(uri)
    db = client[db_name]
    
    user = await db.users.find_one({})
    if user:
        print(f"Found a user: {user.get('email')}")
    else:
        print("No users found.")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_users())
