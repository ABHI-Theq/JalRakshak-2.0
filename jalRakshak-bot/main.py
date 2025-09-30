import os
os.environ["GOOGLE_API_KEY"] = "your_gemini_api_key"

import faiss
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_community.vectorstores import FAISS
from langchain_core.prompts import PromptTemplate
import logging
import asyncio
from functools import partial
import concurrent.futures

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def format_docs(retrieved_docs):
    """Format retrieved documents for context"""
    if not retrieved_docs:
        return "No relevant information found in the knowledge base."
    
    formatted = "\n".join([f"- {doc.page_content}" for doc in retrieved_docs])
    logger.info(f"Retrieved {len(retrieved_docs)} documents for context")
    return formatted

def invoke_llm_with_timeout(llm, final_prompt, timeout=30):
    """Invoke LLM with timeout to prevent hanging"""
    try:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(lambda: llm.invoke(final_prompt))
            return future.result(timeout=timeout)
    except concurrent.futures.TimeoutError:
        logger.error("LLM invocation timed out")
        raise TimeoutError("LLM response timed out after 30 seconds")
    except Exception as e:
        logger.error(f"LLM invocation failed: {str(e)}")
        raise

def generate(query, currConvo="", isEnd=False):
    """
    Generate response using RAG system
    
    Args:
        query (str): User's query
        currConvo (str): Formatted conversation history
        isEnd (bool): Whether this is the end of conversation
    
    Returns:
        LLM response object
    """
    try:
        logger.info(f"Generating response for query: '{query}'")
        
        # If conversation ended, return farewell message
        if isEnd:
            return type('obj', (object,), {'content': 'Thank you for using JalRakshak AI Assistant! Feel free to ask more questions about rainwater harvesting anytime.'})
        
        # Load vector database
        logger.info("Loading vector database...")
        embedding_model = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        vector_store = FAISS.load_local(
            'jalrakshak-vectorDB',
            embedding_model,
            allow_dangerous_deserialization=True
        )
        logger.info("Vector database loaded successfully")

        # Design retriever strategy
        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        )

        # Fetch most similar chunks
        logger.info("Retrieving relevant documents...")
        retrieved_docs = retriever.invoke(query)
        logger.info(f"Retrieved {len(retrieved_docs)} documents")

        # Initialize LLM with better configuration
        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",  # Try a more stable model
            temperature=0.3,
            max_tokens=1000,
            timeout=30,  # Add timeout
            # request_timeout=30  # Some versions use this parameter
        )

        # Enhanced prompt template - make it more concise
        prompt = PromptTemplate(
            template="""
You are JalRakshak AI Assistant for rainwater harvesting and water conservation.

CONTEXT:
{context}

CONVERSATION HISTORY:
{currConvo}

USER QUERY: {query}

Respond clearly and concisely using the context. If context is insufficient, say so politely and provide general guidance.
Keep responses under 300 words.
""",
            input_variables=["context", "currConvo", "query"]
        )

        # Format context
        context_content = format_docs(retrieved_docs)
        
        # Create final prompt - limit length to prevent token overflow
        final_prompt = prompt.format(
            context=context_content[:2000],  # Limit context length
            currConvo=currConvo[:1000] if currConvo else "No previous conversation.",
            query=query
        )

        logger.info(f"Invoking LLM with prompt (length: {len(final_prompt)})...")
        
        # Generate response with timeout
        response = invoke_llm_with_timeout(llm, final_prompt, timeout=30)
        
        logger.info("Successfully generated LLM response")
        return response

    except TimeoutError:
        logger.error("LLM request timed out")
        error_response = "I'm taking longer than expected to respond. Please try again with a simpler query or check your internet connection."
        return type('obj', (object,), {'content': error_response})
    except Exception as e:
        logger.error(f"Error in generate function: {str(e)}")
        error_response = "I apologize, but I'm experiencing technical difficulties. Please try again later or rephrase your question."
        return type('obj', (object,), {'content': error_response})

# Test function
if __name__ == "__main__":
    # Test the generate function
    try:
        test_response = generate("What is rainwater harvesting?", "")
        print("Test Response:")
        print(test_response.content)
    except Exception as e:
        print(f"Test failed: {e}")