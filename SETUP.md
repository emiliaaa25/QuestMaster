# Quick Start Guide - Quest Master

## System Requirements
- Python 3.9+ (backend)
- Node.js 16+ with npm (frontend)
- SQLite (included with Python)

---

## Backend Setup

### 1. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Initialize Database (Optional - Auto-creates on first run)
```bash
python seed.py
```

### 3. Start the API Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Output:**
```
Uvicorn running on http://127.0.0.1:8000
Press CTRL+C to quit
```

**API Documentation Available At:**
- Swagger UI: http://localhost:8000/docs ✨
- ReDoc: http://localhost:8000/redoc

---

## Frontend Setup

### 1. Install Node Dependencies
```bash
cd frontend
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

**Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

**Access:** Open http://localhost:5173 in your browser

---

## Run Both Simultaneously

### Option A: Two Terminal Tabs
**Terminal 1:**
```bash
cd backend && uvicorn main:app --reload
```

**Terminal 2:**
```bash
cd frontend && npm run dev
```

### Option B: Using Concurrently
```bash
npm install -g concurrently
concurrently "cd backend && python -m uvicorn main:app --reload" "cd frontend && npm run dev"
```

---

## Testing with Postman

1. **Download Postman** from https://www.postman.com/downloads/
2. **Open Postman**
3. **Click Import** → Select `Quest_Master.postman_collection.json`
4. **Select Environment** (Optional) → Set variables if needed
5. **Run Requests** → Try any endpoint

**Recommended Test Order:**
1. `GET /preset-hobbies` - View hobby catalog
2. `POST /preset-hobbies/{slug}/join` - Join a hobby
3. `GET /hobbies/{id}` - View your hobby with quests
4. `PATCH /quests/{id}` - Update quest status to "Done"
5. `GET /hobbies/{id}/stats` - Check progress

---

## Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/hobbies` | List all hobbies |
| POST | `/hobbies` | Create new hobby |
| GET | `/hobbies/{id}` | Get hobby + quests |
| PATCH | `/hobbies/{id}` | Update hobby |
| DELETE | `/hobbies/{id}` | Delete hobby |
| GET | `/preset-hobbies` | Browse catalog |
| POST | `/preset-hobbies/{slug}/join` | Join preset hobby |
| GET | `/quests` | List all quests |
| POST | `/quests` | Add quest |
| PATCH | `/quests/{id}` | Update quest |
| DELETE | `/quests/{id}` | Delete quest |
| GET | `/hobbies/{id}/stats` | Hobby statistics |
| GET | `/stats/global` | Overall statistics |

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -i :8000

# Use different port
uvicorn main:app --port 8001
```

### Frontend Won't Start
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Issues
```bash
# Reset database (delete and recreate)
rm backend/database.db
python backend/seed.py
```

### CORS Issues
- Ensure backend runs on `localhost:8000`
- Ensure frontend runs on `localhost:5173` (or specified port)
- Check frontend's `apiUtils.ts` base URL

---

## Project Structure Reference

```
quest_master/
├── README.md (Full documentation)
├── SETUP.md (This file)
├── Quest_Master.postman_collection.json (API tests)
├── backend/
│   ├── main.py (REST API endpoints)
│   ├── models.py (Database schemas)
│   ├── database.py (DB connection)
│   ├── database.db (SQLite file)
│   ├── preset_hobbies.py (Hobby catalog)
│   ├── seed.py (Sample data)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/ (Dashboard, Browse, Quests, Analytics)
    │   ├── components/ (UI parts)
    │   └── routes.tsx (App routing)
    ├── package.json
    └── vite.config.js
```

---

## Key Features

✅ RESTful API (GET, POST, PATCH, DELETE)  
✅ SQLite Database with relationships  
✅ React + TypeScript frontend  
✅ Preset hobby catalog  
✅ Quest management & tracking  
✅ XP and statistics dashboard  
✅ Responsive UI with shadcn/ui  

---

## Next Steps

1. Start both backend and frontend servers
2. Open http://localhost:5173 in your browser
3. Click "Browse Hobbies" to view the preset catalog
4. Join a hobby and create some quests
5. Mark quests as "Done" to track progress
6. Check your stats in the Dashboard/Analytics pages

For detailed API documentation, see `README.md`
