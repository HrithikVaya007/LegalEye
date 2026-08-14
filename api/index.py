import sys
import os

# Add server directory to sys.path so 'app' and other modules can be imported
server_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "server"))
if server_dir not in sys.path:
    sys.path.insert(0, server_dir)

from main import app
