#!/usr/bin/env python3
"""
ProduktAI Credit Manager
Einfaches Tool zum Verwalten von User-Credits
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def list_users():
    """Liste alle User mit ihren Credits auf"""
    print("📋 Alle ProduktAI User:")
    print("-" * 80)
    
    users = await db.users.find({}, {
        "email": 1, 
        "username": 1, 
        "credits": 1, 
        "created_at": 1
    }).sort("created_at", -1).to_list(20)
    
    for i, user in enumerate(users, 1):
        email = user.get('email', 'N/A')
        username = user.get('username', 'N/A')
        credits = user.get('credits', 0)
        created = user.get('created_at', 'N/A')
        
        print(f"{i:2d}. {email:<35} | {username:<20} | {credits:3d} Credits | {created}")
    
    print("-" * 80)
    return users

async def set_credits(email=None, username=None, credits=300):
    """Setze Credits für einen bestimmten User"""
    query = {}
    if email:
        query["email"] = email
    elif username:
        query["username"] = username
    else:
        print("❌ Bitte E-Mail oder Username angeben!")
        return False
    
    result = await db.users.update_one(query, {"$set": {"credits": credits}})
    
    if result.matched_count > 0:
        print(f"✅ Credits erfolgreich auf {credits} gesetzt!")
        
        # Bestätigung anzeigen
        user = await db.users.find_one(query, {"email": 1, "username": 1, "credits": 1})
        if user:
            print(f"   User: {user.get('email')} ({user.get('username')})")
            print(f"   Neue Credits: {user.get('credits')}")
        return True
    else:
        print(f"❌ User nicht gefunden!")
        return False

async def set_all_credits(credits=300):
    """Setze Credits für alle User"""
    result = await db.users.update_many({}, {"$set": {"credits": credits}})
    print(f"✅ Credits für {result.modified_count} User auf {credits} gesetzt!")
    return result.modified_count

async def main():
    print("🚀 ProduktAI Credit Manager")
    print("=" * 50)
    
    # Zeige alle User
    users = await list_users()
    
    print("\n🎯 Verfügbare Aktionen:")
    print("1. Credits für alle User auf 300 setzen")
    print("2. Credits für spezifischen User setzen")
    print("3. Nur Liste anzeigen (bereits gemacht)")
    
    choice = input("\nWählen Sie eine Aktion (1-3): ").strip()
    
    if choice == "1":
        confirm = input("Alle User-Credits auf 300 setzen? (ja/nein): ").strip().lower()
        if confirm in ['ja', 'j', 'yes', 'y']:
            count = await set_all_credits(300)
            print(f"\n🎉 Fertig! {count} User haben jetzt 300 Credits.")
        else:
            print("Abgebrochen.")
    
    elif choice == "2":
        print("\nUser auswählen:")
        for i, user in enumerate(users[:10], 1):
            email = user.get('email', 'N/A')
            username = user.get('username', 'N/A')
            credits = user.get('credits', 0)
            print(f"{i}. {email} ({username}) - {credits} Credits")
        
        try:
            user_choice = int(input("\nUser-Nummer eingeben (1-10): ").strip())
            if 1 <= user_choice <= min(10, len(users)):
                selected_user = users[user_choice - 1]
                email = selected_user.get('email')
                
                new_credits = input(f"Neue Credits für {email} (Enter für 300): ").strip()
                credits = int(new_credits) if new_credits else 300
                
                await set_credits(email=email, credits=credits)
                print(f"\n🎉 Credits für {email} aktualisiert!")
            else:
                print("❌ Ungültige Auswahl!")
        except ValueError:
            print("❌ Ungültige Eingabe!")
    
    print("\n✅ Credit Manager beendet.")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())