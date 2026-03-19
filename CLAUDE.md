# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

DebateAI — a Python project (Python 3.14.2). The virtual environment is at `venv/`.

## Environment Setup

```bash
# Activate the virtual environment
source venv/Scripts/activate   # Windows (bash/Git Bash)
# or
venv\Scripts\activate.bat      # Windows (cmd)

# Install dependencies (once requirements.txt exists)
pip install -r requirements.txt
```

# 🧠 Claude Development Guide — AI Debate App Backend

## 📌 Project Overview

This is a backend for a mobile AI-based training app where users practice:

* debate
* negotiation
* persuasion
* communication skills

The app uses:

* chat-based scenarios
* AI roleplay
* scoring and feedback system

Goal:
Build a clean, production-ready MVP backend that is simple, modular, and scalable.

---

## ⚙️ Tech Stack

* FastAPI
* PostgreSQL
* SQLModel
* Alembic
* OpenAI API

---

## 🏗️ Architecture Rules (VERY IMPORTANT)

* Keep strict separation of concerns:

  * `api/` → routes only (no business logic)
  * `services/` → business logic
  * `models/` → database models
  * `schemas/` → request/response models
  * `ai/` → AI logic only

* NEVER put business logic inside route files

* NEVER mix database logic with API logic

* Keep each file focused on one responsibility

---

## 📁 Project Structure

```
app/
 ├── api/
 ├── models/
 ├── schemas/
 ├── services/
 ├── core/
 ├── db/
 └── ai/
```

---

## 🧱 Database Models (Core Entities)

You will implement models for:

* User
* Profile
* Scenario
* Session
* Message
* Score
* Feedback

Rules:

* Keep models simple
* Use clear relationships
* Do NOT overcomplicate schema
* Do NOT add extra unnecessary fields

---

## 🔌 API Design Rules

* Use RESTful endpoints
* Keep endpoints simple and predictable

Examples:

* POST /auth/register
* POST /auth/login
* GET /scenarios
* POST /sessions/start
* POST /sessions/{id}/message
* POST /sessions/{id}/finish

Rules:

* No complex nested endpoints
* No unnecessary abstraction layers

---

## 🧠 Service Layer Rules

All logic MUST be in services.

Required services:

* AuthService
* ScenarioService
* SessionService
* MessageService
* AIService
* EvaluationService
* ProfileService

Rules:

* Services should be small and focused
* One service = one responsibility
* Do not mix responsibilities

---

## 🤖 AI System Design

AI must be separated into 3 parts:

1. Roleplay Engine (chat)
2. Evaluation Engine (scoring)
3. Feedback Engine (coaching)

Rules:

* NEVER combine these into one function
* ALWAYS return structured JSON for evaluation
* Keep prompts modular (separate files)

---

## ✍️ Coding Style Rules (CRITICAL)

* Write CLEAN and SIMPLE code
* Avoid complex or clever solutions
* Prefer readability over optimization

### DO:

* Use clear variable names
* Write short functions
* Keep logic easy to understand

### DO NOT:

* Write overly complex functions
* Add unnecessary abstractions
* Add unnecessary comments
* Add “smart tricks” or hacks

Code should be:

* obvious
* readable
* easy to modify

---

## 🧾 Comments Policy

* DO NOT add excessive comments
* Only add comments when absolutely necessary
* Code should explain itself through naming

---

## ⚠️ Constraints

* Do NOT overengineer
* Do NOT add features that were not requested
* Do NOT introduce microservices
* Do NOT use advanced patterns unless explicitly asked

---

## 🧪 Development Approach

You MUST follow step-by-step development.

Never build everything at once.

Build in phases:

1. Project setup
2. Models
3. Database migrations
4. Auth
5. Scenarios
6. Session system
7. AI integration
8. Evaluation
9. Leaderboard

---

## 💬 AI Prompt Rules

* Keep prompts structured and clear
* Do not generate overly long prompts
* Always enforce output format (JSON where needed)
* Do not mix multiple responsibilities in one prompt

---

## 📉 Performance & Cost Awareness

* Limit chat history size
* Keep responses short
* Avoid unnecessary AI calls

---

## 🎯 Final Goal

Deliver a working backend that:

* is clean and understandable
* follows architecture rules
* supports real app usage (not toy MVP)
* is easy to extend later

---

## 🚨 IMPORTANT FINAL RULE

If something is not explicitly requested:
👉 DO NOT IMPLEMENT IT

Always follow instructions strictly.
