#!/usr/bin/env python3
"""
Shoplite RAG Chat Interface
A simple command-line interface for interacting with the Shoplite RAG API.
"""

import argparse
import requests
import json
import sys
import os
from datetime import datetime

class ShopLiteChatInterface:
    """
    A command-line interface for the Shoplite RAG system.
    Handles communication with the ngrok API and conversation logging.
    """
    
    def __init__(self, base_url, log_file="conversation_log.json"):
        """
        Initialize the chat interface.
        
        Args:
            base_url (str): The base URL of your ngrok tunnel (e.g., 'https://abc123.ngrok.io')
            log_file (str): File path for saving conversation logs
        """
        self.base_url = base_url.rstrip('/')
        self.log_file = log_file
        self.conversation_log = []
        self.session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
    def test_connection(self):
        """
        Test the connection to the RAG API health endpoint.
        
        Returns:
            bool: True if connection is successful, False otherwise
        """
        try:
            health_url = f"{self.base_url}/health"
            response = requests.get(health_url, timeout=10)
            return response.status_code == 200
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection error: {str(e)}")
            return False
    
    def send_message(self, question):
        """
        Send a question to the RAG API and return the response.
        
        Args:
            question (str): The user's question
            
        Returns:
            dict: The API response containing answer and sources
        """
        try:
            payload = {
                "question": question,
                "session_id": self.session_id
            }
            
            print("🔍 [Retrieving context...]")
            response = requests.post(
                f"{self.base_url}/chat", 
                json=payload, 
                timeout=30
            )
            print("🤖 [Calling LLM...]")
            
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": f"API returned status code {response.status_code}",
                    "details": response.text
                }
                
        except requests.exceptions.ConnectionError:
            return {"error": "Cannot connect to server. Please check your ngrok URL and ensure the server is running."}
        except requests.exceptions.Timeout:
            return {"error": "Request timed out. The server is taking too long to respond."}
        except requests.exceptions.RequestException as e:
            return {"error": f"Connection failed: {str(e)}"}
    
    def log_conversation(self, question, response):
        """
        Log the conversation to a JSON file for evaluation.
        
        Args:
            question (str): The user's question
            response (dict): The API response
        """
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "session_id": self.session_id,
            "question": question,
            "response": response,
            "retrieved_docs_count": response.get("retrieved_docs_count", 0) if isinstance(response, dict) else 0
        }
        
        self.conversation_log.append(log_entry)
        
        # Save to file
        try:
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(self.conversation_log, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"⚠️  Warning: Could not save log file: {str(e)}")
    
    def display_response(self, response):
        """
        Format and display the API response to the user.
        
        Args:
            response (dict): The API response to display
        """
        print("\n" + "="*60)
        
        if "error" in response:
            print(f"❌ ERROR: {response['error']}")
            if "details" in response:
                print(f"📋 Details: {response['details']}")
        else:
            print("🤖 SHOPLITE ASSISTANT RESPONSE:")
            print("-" * 40)
            
            # Display the main answer
            answer = response.get("answer", "No answer provided")
            print(f"Answer: {answer}")
            
            # Display sources
            sources = response.get("sources", [])
            if sources:
                print(f"\n📚 Sources:")
                for i, source in enumerate(sources, 1):
                    print(f"  {i}. {source}")
            else:
                print(f"\n📚 Sources: No sources retrieved")
            
            # Display additional metadata
            retrieved_count = response.get("retrieved_docs_count", 0)
            print(f"\n📊 Retrieved {retrieved_count} relevant documents")
        
        print("=" * 60)
    
    def run_interactive_mode(self):
        """
        Run the chat interface in interactive mode.
        """
        print("🛍️  Shoplite RAG Chat Interface")
        print(f"🌐 Connected to: {self.base_url}")
        print("💡 Type 'quit' to exit, 'save' to save conversation, 'help' for commands")
        print("-" * 50)
        
        # Test connection first
        if not self.test_connection():
            print("❌ Cannot connect to RAG API. Please check:")
            print("   1. Your ngrok tunnel is running in Colab")
            print("   2. The URL is correct")
            print("   3. The Flask server is running on port 5000")
            return
        
        print("✅ Connected to Shoplite RAG API successfully!")
        
        while True:
            try:
                user_input = input("\n💬 Your question: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'q']:
                    print("💾 Saving conversation log...")
                    self.save_conversation_summary()
                    print("👋 Thank you for using Shoplite Assistant!")
                    break
                
                elif user_input.lower() == 'save':
                    self.save_conversation_summary()
                    continue
                
                elif user_input.lower() == 'help':
                    self.show_help()
                    continue
                
                elif user_input.lower() == 'clear':
                    os.system('cls' if os.name == 'nt' else 'clear')
                    continue
                
                elif not user_input:
                    continue
                
                # Send the question and get response
                response = self.send_message(user_input)
                
                # Display the response
                self.display_response(response)
                
                # Log the conversation
                self.log_conversation(user_input, response)
                
            except KeyboardInterrupt:
                print("\n\n⚠️  Interrupted by user")
                self.save_conversation_summary()
                break
            except Exception as e:
                print(f"\n❌ Unexpected error: {str(e)}")
                continue
    
    def show_help(self):
        """Display help information for available commands."""
        print("\n📋 AVAILABLE COMMANDS:")
        print("  - Ask any question about Shoplite features, policies, or documentation")
        print("  - 'quit' or 'exit': Exit the chat interface")
        print("  - 'save': Force save the current conversation log")
        print("  - 'clear': Clear the screen")
        print("  - 'help': Show this help message")
    
    def save_conversation_summary(self):
        """Save and display conversation summary."""
        if self.conversation_log:
            print(f"💾 Conversation log saved to: {self.log_file}")
            print(f"📝 Total interactions in this session: {len(self.conversation_log)}")
        else:
            print("📝 No conversations to save.")

def main():
    """
    Main function to parse command line arguments and start the chat interface.
    """
    parser = argparse.ArgumentParser(
        description="Shoplite RAG Chat Interface - Connect to your deployed LLM",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s https://abc123.ngrok.io
  %(prog)s http://localhost:5000 --log my_conversation.json
  %(prog)s --url https://your-tunnel.ngrok.io --log eval_session_1.json
        """
    )
    
    parser.add_argument(
        'url', 
        nargs='?',
        help='URL of your ngrok tunnel (e.g., https://abc123.ngrok.io)'
    )
    
    parser.add_argument(
        '--url', 
        dest='api_url',
        help='Alternative way to specify the API URL'
    )
    
    parser.add_argument(
        '--log', 
        dest='log_file',
        default='conversation_log.json',
        help='File path for conversation logs (default: conversation_log.json)'
    )
    
    args = parser.parse_args()
    
    # Determine which URL to use
    target_url = args.api_url or args.url
    
    if not target_url:
        print("🔗 Please provide your ngrok tunnel URL:")
        print("   You can find this in your Colab notebook after starting ngrok")
        target_url = input("   Enter URL: ").strip()
    
    if not target_url:
        print("❌ No URL provided. Usage:")
        parser.print_help()
        sys.exit(1)
    
    # Ensure URL has protocol
    if not target_url.startswith(('http://', 'https://')):
        target_url = 'http://' + target_url
        print(f"🔗 Assuming HTTP protocol: {target_url}")
    
    # Create and run the chat interface
    chat_interface = ShopLiteChatInterface(target_url, args.log_file)
    chat_interface.run_interactive_mode()

if __name__ == "__main__":
    main()