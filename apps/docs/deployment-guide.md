What You'll Need
GitHub account

MongoDB Atlas account (free)

Render.com account (free)

Vercel account (free)

Google account (for Colab)

Your Week 3 Colab notebook

🗓 Quick Timeline
Step	Component	Time
1	MongoDB Database	15 min
2	Backend API	10 min
3	Frontend Store	10 min
4	AI Assistant	10 min
5	Test Everything	10 min
Total: ~55 minutes

Part 1: Setup Your Database (MongoDB Atlas)
1.1 Create Your Free Database
Go to MongoDB Atlas

Click "Sign Up" and create your free account

Verify your email address

1.2 Create Your Cluster
Click "Create" or "Build a Database"

Select the M0 FREE option (512MB - always free)



Click "Create Cluster" (wait 5-10 minutes)

1.3 Setup Security
Create Database User:

Go to "Database Access" in left menu

Click "Add New Database User"

Enter:

Username: Gebran

Password: *YBdBy_4y9Rk68

Database User Privileges: "Read and write to any database"

Click "Add User"

Allow Network Access:

Go to "Network Access" in left menu

Click "Add IP Address"

Select "Allow Access from Anywhere"

Enter: 0.0.0.0/0

Click "Confirm"

1.4 Get Your Connection String
Go to "Clusters" in left menu

Click "Connect" on your cluster

Choose "Connect your application"

Select:

Driver: Node.js

Version: 5.5 or later

Copy the connection string

Add your database name to the connection string:

Replace:

text
mongodb+srv://week5admin:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
With:

text
MONGO_URI="mongodb+srv://Gebran:*YBdBy_4y9Rk68j@cluster0.5wqpvdw.mongodb.net/Storefront_v1?retryWrites=true&w=majority&appName=Cluster0"
✅ Save this connection string - you'll need it soon!

Part 2: Deploy Your Backend API (Render.com)
2.1 Prepare Your Code
Make sure your GitHub repository has this structure:

text
your-repo/
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── .env.example
│   │   └── src/
│   │       └── server.js
│   └── storefront/
2.2 Deploy to Render
Go to Render.com

Click "Sign Up" and create your free account

Verify your email address

Create Web Service:

Click "New+" button

Select "Web Service"

Connect your GitHub account

Choose your livedrop-Gebran

Configure Your Service:

Name: Storefront v1

Environment: Node


Branch: main

Root Directory: apps/api

Build Command: npm install

Start Command: npm start

2.3 Add Environment Variables
In your Render service, click "Environment" tab and add:

Name	Value
MONGODB_URI	MONGO_URI="mongodb+srv://Gebran:*YBdBy_4y9Rk68j@cluster0.5wqpvdw.mongodb.net/Storefront_v1?retryWrites=true&w=majority&appName=Cluster0"

NODE_ENV	production
LLM_ENDPOINT	https://your-ngrok-url.ngrok.io/generate
Example:

text
MONGO_URI="mongodb+srv://Gebran:*YBdBy_4y9Rk68j@cluster0.5wqpvdw.mongodb.net/Storefront_v1?retryWrites=true&w=majority&appName=Cluster0"

2.4 Deploy
Click "Create Web Service"

Wait 5-10 minutes for deployment

Note your API URL: https://week5-api.onrender.com

2.5 Test Your API
Open a new browser tab

Go to: https://week5-api.onrender.com/health

You should see: {"status":"OK","environment":"production"}

Part 3: Deploy Your Frontend Store (Vercel)
3.1 Prepare Your Frontend
Make sure your apps/storefront directory has:

package.json file

Next.js configuration (if using Next.js)

3.2 Deploy to Vercel
Go to Vercel.com

Click "Sign Up" and create your free account

Connect your GitHub account

Import Project:

Click "Add New..."

Select "Project"

Choose your Week 5 repository

Click "Import"

Configure Project:

Framework Preset: Next.js

Root Directory: apps/storefront

Build Command: npm run build (or leave default)

Output Directory: .next (for Next.js)

3.3 Add Environment Variable
Click "Settings" tab

Select "Environment Variables"

Add:

Name: NEXT_PUBLIC_API_URL

Value: https://week5-api.onrender.com (your Render API URL)

3.4 Deploy
Click "Deploy"

Wait 3-5 minutes for deployment

Note your frontend URL: https://your-project.vercel.app

3.5 Test Your Store
Visit your Vercel URL

You should see your storefront loading

Note: Some features may show errors until we complete setup

Part 4: Setup AI Assistant (Google Colab)
4.1 Update Your Week 3 Colab
Open your Week 3 Google Colab notebook

Add this code to a new cell at the end:

python
# ==================== WEEK 5 ADDITION ====================
# Add these new endpoints - keep your existing RAG code!

from datetime import datetime

@app.route('/generate', methods=['POST'])
def generate():
    """Simple text completion for Week 5"""
    try:
        data = request.get_json()
        prompt = data.get('prompt')
        max_tokens = data.get('max_tokens', 500)
        
        if not prompt:
            return jsonify({"error": "No prompt provided"}), 400
        
        print(f"Processing prompt: {prompt[:100]}...")
        
        # Use your existing model - adjust based on your setup
        response = "I understand you're asking about: " + prompt + ". As a support specialist, I'd be happy to help with your inquiry about our products and services."
        
        return jsonify({
            "text": response,
            "model": "week5-assistant",
            "usage": {
                "prompt_tokens": len(prompt),
                "completion_tokens": len(response)
            }
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy", 
        "service": "llm-api",
        "timestamp": str(datetime.now())
    })

print("✅ Week 5 endpoints added successfully!")
Run the cell by clicking the play button

4.2 Get Your ngrok URL
Find the ngrok output in your Colab (look for text like):

text
Forwarding https://abcd-1234-5678.ngrok.io -> http://localhost:5000
Copy your ngrok URL: https://abcd-1234-5678.ngrok.io

4.3 Test Your LLM Endpoint
Open Postman or Hoppscotch

Create a new POST request

Set URL to: https://your-ngrok-url.ngrok.io/generate

Set Headers: Content-Type: application/json

Set Body (raw JSON):

json
{
  "prompt": "Hello, how are you?",
  "max_tokens": 50
}
Send the request - you should get a response

4.4 Update Your Backend
Go back to Render.com

Open your week5-api service

Click "Environment" tab

Update the LLM_ENDPOINT variable with your ngrok URL:

text
LLM_ENDPOINT = https://your-ngrok-url.ngrok.io/generate
Save the changes

Part 5: Seed Your Database & Test
5.1 Seed Your Database
Option A: Use MongoDB Compass (Recommended)

Download MongoDB Compass

Connect using your MongoDB connection string

Create database: week5store

Create collections: customers, products, orders

Add sample data using the Import feature

Option B: Use Temporary API Route

Add this temporary route to your apps/api/src/routes/ folder

Deploy to Render

Visit: https://week5-api.onrender.com/api/seed once

Remove the route after seeding

5.2 Test User Account
Test Email: demo@example.com

This test user comes with:

2-3 existing orders

Complete order history

Access to all features

5.3 Test Complete System
Step 1: User Identification

Visit your Vercel storefront URL

Enter email: demo@example.com

Click "Continue Shopping" - should work!

Step 2: Browse Products

Click on Products or Shop

Use search bar: type "wireless"

Apply filters - should see products

Step 3: Create Order

Add 2-3 products to cart

Proceed to checkout

Create order - note your order number

Step 4: Order Tracking

Go to order tracking page

Enter your order number

Watch real-time status updates (updates every 5-10 seconds)

Step 5: AI Assistant

Open support chat

Test these questions:

"What's your return policy?" → Should give policy answer

"Where is my order?" → Should check order status

"Find me headphones" → Should search products

"Hello!" → Should respond briefly

Step 6: Admin Dashboard

Visit: https://your-frontend.vercel.app/admin

Verify you see:

Business metrics cards

Performance monitoring

Assistant analytics

Charts and graphs

