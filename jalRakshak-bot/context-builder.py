import os
os.environ["GOOGLE_API_KEY"] = "AIzaSyAW2I_lpq3tNFBV0QvRpTWjiHxqHrlDaa8"

import faiss
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import PyPDFLoader

#content loading from the document

loader=PyPDFLoader('jalrakshak-context.pdf')

docs=loader.load()

print(len(docs))

context=" ".join(doc.page_content for doc in docs)

# print(context)

#text splitting using recursivetext splitter

splitter=RecursiveCharacterTextSplitter(
    chunk_size=160,
    chunk_overlap=30
)

chunks=splitter.create_documents([context])


#GENERATING EMBEDDINGS USING GEMINI AI MODEL AND SAVING TO VECTOR DB

embedding_model=GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")

vector_store=FAISS.from_documents(
    chunks,
    embedding_model
)

# print(vector_store.index_to_docstore_id)

#saving the vectorDB to local so as to avoid repetition

vector_store.save_local('jalrakshak-vectorDB')

