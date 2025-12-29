# LLM Usage Analyzer

- Note :-This the copy of the repositiory in order to hide API key privacy.
# 📊 LLM Usage Analyzer – Chrome Extension

[![Privacy First](https://img.shields.io/badge/Privacy-Local--Only-green.svg)](#-privacy-first-design)
[![Platform](https://img.shields.io/badge/Platform-Chrome%20Extension-blue.svg)](#)
[![AI](https://img.shields.io/badge/AI-Gemini%20API-orange.svg)](#)

A privacy-first Google Chrome extension that helps students reflect on how they use AI tools like ChatGPT and Gemini. It encourages learning-oriented behavior instead of blind copy-pasting, while providing supportive guidance during academic or career stress.

---

## 🚀 Overview

Large Language Models (LLMs) are powerful, but they don’t tell users whether they are actually learning. This extension fills that gap by tracking prompt behavior, identifying learning patterns, and nudging users toward better AI-assisted learning habits.

**It is not another chatbot. It is a behavior-aware learning companion.**

---

## 🎯 Problem Statement

Current AI tools:
* **Encourage solution-first usage** rather than conceptual understanding.
* **Provide no feedback loop** on how a student's learning habits are evolving.
* **Increase dependency** on direct answers and ready-made code.
* **Ignore academic stress** and the need for reflective practice.

**LLM Usage Analyzer** solves this by distinguishing **Learning Intent** (Why/How) from **Execution Intent** (Give Code) and nudging users toward intuition and reasoning.

---

## 🧠 Key Features

### 1. Cross-LLM Prompt Tracking
* **Support:** Works on both **Gemini** and **ChatGPT**.
* **Data:** Tracks prompt text, timestamp, and platform usage.
* **Privacy:** Fully opt-in; all data is stored **locally** on your browser.

### 2. Learning vs. Execution Detection
* Classifies prompts into **Learning Intent** (why, how, intuition, approach) or **Execution Intent** (give code, solve this).
* Helps users build awareness of their AI dependency patterns.

### 3. In-Page Behavioral Nudges
* **Detection:** Flags phrases like "give code" or "cpp solution."
* **Feedback:** Displays a gentle, non-blocking warning box to encourage "thinking before copying."

### 4. Prompt Improvement Coach
* Suggests better versions of your last prompt.
* Trains you to ask for explanations, reasoning, and examples instead of just the final answer.

### 5. Weekly Learning Wrap (Spotify-Style) 🎵
* Generates a structured **CSV report** including:
    * Daily prompts & Topic classification.
    * Learning-to-code ratio.
    * Top topics and engagement levels.

### 6. Google Sheets & NotebookLM Ready
* **Analytics:** Import the CSV into Google Sheets for visual charts.
* **Deep Reflection:** Built-in "Analyze in NotebookLM" button to cross-reference your AI usage with your syllabus or notes.

---

## 🔄 Workflow

1.  **Interact:** User uses ChatGPT or Gemini.
2.  **Capture:** Content script captures the prompt (locally).
3.  **Detect:** Internal logic determines if it's a "Learning" or "Execution" prompt.
4.  **Nudge:** If it's a direct code request, a subtle alert appears.
5.  **Review:** User checks the extension popup for daily insights.
6.  **Export:** User downloads a Weekly Wrap CSV for reflection.

---

## 🛠️ Tech Stack

* **Google Chrome Extension APIs:** Content scripts, `chrome.storage.local`, `chrome.tabs`.
* **Gemini API:** For generating supportive insights and prompt improvements.
* **Google Sheets:** For data visualization.
* **NotebookLM:** For document-grounded reflection.

---

## 🛡️ Privacy-First Design

* **No Cloud Sync:** No user accounts or background uploads.
* **Local Storage:** All analysis and history stay on your device.
* **Transparent:** Gemini API is only invoked when the user explicitly clicks the "Supportive Feedback" button.

---

## 🏁 Final Note

Most AI tools answer questions. **This extension helps users ask better ones.**

---

### ⚙️ Installation

1.  Clone this repository.
2.  Open `chrome://extensions/` in your browser.
3.  Enable **Developer Mode**.
4.  Click **Load Unpacked** and select this project folder.
