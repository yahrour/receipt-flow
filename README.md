# ReceiptsFlow

ReceiptFlow is an AI-powered financial organizer that transforms messy paper receipts into structured, searchable data. By leveraging Google Gemini 2.5 Flash, the app automatically extracts merchant details, amounts, and dates with high accuracy.

## Features

- **AI Extraction:** Upload photos to automatically extract Merchant, Date, Amount, and Category.

- **Smart History:** Searchable archive with Cursor-based pagination for high-performance scrolling.

- **Mobile-First Design:** Fully responsive UI that adapts from a simple list on mobile to a data-heavy table on desktop.

- **Dockerized Environment:** One-command setup for the entire stack.

## Tech stack

- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **AI:** Google Gemini 2.5 Flash API
- **Image processing:** Sharp (for server-side optimization/resizing)

## Project structure

```
/
├── client/             # React frontend
├── server/             # Express backend
└── docker-compose.yml
```

## Demo

![demo](https://github.com/user-attachments/assets/d2d67720-866b-42dd-b1b8-1b54748aa7bb)

## Getting started

### Prerequisites

- Docker
- Docker Compose
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### 1. Clone the repo

```bash
git clone https://github.com/yahrour/receipt-flow
cd receipt-flow
```

### 2. Configure environment variables

Create a .env file in both /frontend and /backend (refer to .env.example).

### 3. Run the app

```bash
docker-compose up --build
```

The app will be running at `http://localhost:8080`.

## Technical Highlights

- **Pagination**: Implemented Cursor-based Pagination to ensure high query performance and prevent "data shifting" bugs.
- **Image Optimization**: Uses Sharp to compress and resize images before processing to reduce AI token costs and improve latency.

## Notes

- Supported file types: JPEG, PNG, WEBP
- Maximum file size: 5MB
