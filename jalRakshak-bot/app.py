from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import logging
import asyncio
import concurrent.futures

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1️⃣ FastAPI app
app = FastAPI(
    title="JalRakshak RAG Chatbot API",
    description="RAG-powered chatbot for rainwater harvesting assistance"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Your Next.js app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2️⃣ Request model - Updated to match frontend
class ChatRequest(BaseModel):
    query: str
    conversation_history: List[Dict[str, Any]] = []
    is_end: bool = Field(default=False)

# 3️⃣ Response model
class ChatResponse(BaseModel):
    response: str
    conversation_id: Optional[str] = None

# Import your generate function
try:
    from main import generate
    logger.info("Successfully imported generate function")
except ImportError as e:
    logger.error(f"Failed to import generate function: {e}")
    raise

def format_conversation_history(conversation_history: List[Dict[str, Any]]) -> str:
    """Convert conversation history to string format for the RAG system"""
    if not conversation_history:
        return ""
    
    convo_text = ""
    for msg in conversation_history[-6:]:  # Last 6 messages for context
        role = "User" if msg.get("role") == "user" else "Assistant"
        content = msg.get("content", "")
        # Truncate long messages to prevent token overflow
        if len(content) > 200:
            content = content[:200] + "..."
        convo_text += f"{role}: {content}\n"
    
    return convo_text.strip()

def run_generate_with_timeout(query: str, currConvo: str, isEnd: bool, timeout: int = 45):
    """Run generate function with timeout in a separate thread"""
    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(generate, query, currConvo, isEnd)
            return future.result(timeout=timeout)
    except concurrent.futures.TimeoutError:
        logger.error("Generate function timed out")
        raise TimeoutError("Request timed out after 45 seconds")
    except Exception as e:
        logger.error(f"Generate function failed: {str(e)}")
        raise

# 4️⃣ API endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received request - Query: '{request.query}', Is End: {request.is_end}")
        
        # Handle conversation end
        if request.is_end:
            logger.info("Conversation ended by client")
            return ChatResponse(
                response="Conversation ended. Thank you for using JalRakshak AI Assistant!",
                conversation_id=None
            )
        
        # Format conversation history for the RAG system
        currConvo = format_conversation_history(request.conversation_history)
        logger.info(f"Formatted conversation history length: {len(currConvo)}")
        
        # Call your generate function with timeout
        logger.info("Calling RAG system...")
        rag_response = run_generate_with_timeout(
            query=request.query,
            currConvo=currConvo,
            isEnd=request.is_end,
            timeout=45
        )
        
        logger.info("Successfully generated response from RAG system")
        
        return ChatResponse(
            response=rag_response.content,
            conversation_id=None
        )
        
    except TimeoutError as e:
        logger.error(f"Request timeout: {str(e)}")
        raise HTTPException(status_code=408, detail="Request timeout. Please try again.")
    except Exception as e:
        logger.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "JalRakshak RAG Chatbot"}

@app.get("/test")
async def test_endpoint():
    """Test endpoint to check if RAG system is working"""
    try:
        from main import generate
        test_response = generate("What is rainwater harvesting?", "")
        return {
            "status": "working", 
            "test_response": test_response.content[:100] + "..." if len(test_response.content) > 100 else test_response.content
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "JalRakshak RAG Chatbot API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "POST /chat",
            "health": "GET /health",
            "test": "GET /test"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)