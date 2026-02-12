#!/usr/bin/env python3
"""
ingest-kb-chroma.py
Ingests KB chunks into Chroma persistent storage directly.
Uses the same data dir as the chroma-mcp server.

Usage: python3 scripts/ingest-kb-chroma.py

Prerequisites: pip install chromadb
"""

import json
import sys
import os

# Use the same Chroma data dir as the MCP server
CHROMA_DIR = os.path.expanduser("~/.claude-mem/chroma")
CHUNKS_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kb-chunks.json")
COLLECTION_NAME = "kb_knowledge"

def main():
    try:
        import chromadb
    except ImportError:
        print("ERROR: chromadb not installed.")
        print("Install with: pip install chromadb")
        sys.exit(1)

    if not os.path.exists(CHUNKS_FILE):
        print(f"ERROR: {CHUNKS_FILE} not found. Run ingest-kb-chroma.js first.")
        sys.exit(1)

    print(f"Loading chunks from {CHUNKS_FILE}...")
    with open(CHUNKS_FILE) as f:
        data = json.load(f)

    total_chunks = data["total_chunks"]
    batches = data["batches"]
    print(f"  {total_chunks} chunks in {len(batches)} batches")

    print(f"Connecting to Chroma at {CHROMA_DIR}...")
    client = chromadb.PersistentClient(path=CHROMA_DIR)

    # Delete existing collection if present
    try:
        client.delete_collection(COLLECTION_NAME)
        print(f"  Deleted existing '{COLLECTION_NAME}' collection")
    except Exception:
        pass

    collection = client.create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "KnowledgeBase semantic search index"}
    )
    print(f"  Created '{COLLECTION_NAME}' collection")

    ingested = 0
    for batch in batches:
        collection.add(
            ids=batch["ids"],
            documents=batch["documents"],
            metadatas=batch["metadatas"]
        )
        ingested += batch["count"]
        if ingested % 500 == 0 or ingested == total_chunks:
            print(f"  Ingested {ingested}/{total_chunks} chunks")

    print(f"\nDone! {collection.count()} chunks in '{COLLECTION_NAME}'")
    print(f"Query with: chroma_query_documents('kb_knowledge', ['your question'], n_results=5)")

if __name__ == "__main__":
    main()
