# 🎓 TechGurukul AI

An AI-powered RAG-based college chatbot that helps students quickly find accurate information about their college, including admissions, courses, fees, schedules, facilities, and other frequently asked questions.

## 📌 Project Overview

TechGurukul AI solves the problem of students having to search through multiple college documents and websites to find information. The chatbot uses **Retrieval-Augmented Generation (RAG)** to retrieve relevant information from college documents and generate context-aware answers.

Users can simply ask questions in natural language through a chat interface and receive accurate responses based on the available college knowledge base.

---

## ✨ Features

- 💬 AI-powered conversational chatbot
- 📄 Upload and process college documents
- 🔍 RAG-based document retrieval
- 🧠 Context-aware AI responses
- 🎓 Answer college-related queries
- 📚 Knowledge base using college documents
- ⚡ Fast and user-friendly interface
- 📝 Conversation history
- 🔒 Secure API key management using environment variables

---

## 🏗️ How It Works

```text
User Question
      ↓
Chat Interface
      ↓
Convert Question into Embedding
      ↓
Vector Database Search
      ↓
Retrieve Relevant College Information
      ↓
Send Context + Question to LLM
      ↓
Generate Accurate Answer
      ↓
Display Response to User
