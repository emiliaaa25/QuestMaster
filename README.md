# Quest Master - Hobby Catalyst Application

## Project Description

**Quest Master** is a comprehensive hobby tracking and progression system that gamifies personal skill development. Users can explore a catalog of hobbies, create custom quests (tasks), and track their progress through an XP-based reward system.

The application enables users to:
- **Browse & Join Hobbies** from a preset catalog (Creative, Physical, Intellectual)
- **Create Custom Quests** with difficulty levels and time tracking
- **Track Progress** with status management (To Do → Doing → Done)
- **Earn XP & Stats** based on completed quests
- **View Global Analytics** across all hobbies and quests

**Domain:** Personal development & hobby gamification

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Quest Master Client                   │
│           (React + TypeScript + Vite)                   │
│                                                          │
│  Dashboard | Browse Hobbies | Quests | Mastery Tracks  │
│            | Analytics      |                           │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP REST API
                        │
┌───────────────────────▼─────────────────────────────────┐
│              FastAPI REST Backend                        │
│            (Python 3.9+ with uvicorn)                   │
│                                                          │
│  GET    /hobbies, /hobbies/{id}, /hobbies/{id}/stats   │
│  POST   /hobbies, /preset-hobbies/{slug}/join, /quests │
│  PATCH  /hobbies/{id}, /quests/{id}                    │
│  DELETE /hobbies/{id}, /quests/{id}                    │
│  GET    /preset-hobbies, /quests, /stats/global        │
└───────────────────────┬─────────────────────────────────┘
                        │ SQLModel ORM
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   SQLite Database                        │
│              (database.db file-based)                    │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- **Framework:** FastAPI 0.116+
- **ORM:** SQLModel 0.0.24+ (wraps SQLAlchemy)
- **Server:** Uvicorn 0.35+
- **Database:** SQLite (file-based, no external dependencies)

**Frontend:**
- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **Routing:** React Router v6
- **HTTP Client:** Fetch API / Axios
- **Styling:** Tailwind CSS

---

## Database Schema

### Tables

#### `hobby` Table
Represents user-created or preset hobbies.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY | Unique hobby identifier |
| `name` | VARCHAR | NOT NULL, INDEX | Hobby name (searchable) |
| `category` | VARCHAR | NOT NULL | CreativePhysicalIntellectual |
| `description` | TEXT | | Hobby details |
| `icon` | VARCHAR | DEFAULT: '🎯' | Emoji representation |
| `image_url` | VARCHAR | | Optional image URL |
| `preset_slug` | VARCHAR | INDEX, UNIQUE per user | Link to preset catalog (NULL if custom) |
| `is_mastered` | BOOLEAN | DEFAULT: FALSE | All quests completed? |
| `created_at` | DATETIME | DEFAULT: NOW | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT: NOW | Last modification |
| `last_activity_at` | DATETIME | | Last quest activity |

**Relationships:**
- Has many Quests (cascade delete enabled)

---

#### `quest` Table
Represents individual tasks/challenges within a hobby.

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | INTEGER | PRIMARY KEY | Unique quest identifier |
| `hobby_id` | INTEGER | FOREIGN KEY → hobby.id | Parent hobby |
| `title` | VARCHAR | NOT NULL | Quest name |
| `description` | TEXT | | Quest details |
| `difficulty` | VARCHAR | NOT NULL, DEFAULT: 'Medium' | Easy / Medium / Hard |
| `status` | VARCHAR | NOT NULL, DEFAULT: 'To Do' | To Do / Doing / Done |
| `xp_value` | INTEGER | DEFAULT: 0, ≥ 0 | XP reward when completed |
| `hours_spent` | FLOAT | DEFAULT: 0, ≥ 0 | Time tracking |
| `is_completed` | BOOLEAN | DEFAULT: FALSE | Legacy completion flag |
| `created_at` | DATETIME | DEFAULT: NOW | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT: NOW | Last modification |
| `completed_at` | DATETIME | | When marked as Done |

**Relationships:**
- Belongs to one Hobby

---

### Data Constraints

- **Enum Types:**
  - `HobbyCategory`: Creative, Physical, Intellectual
  - `QuestDifficulty`: Easy, Medium, Hard
  - `QuestStatus`: To Do, Doing, Done
- **Validations:**
  - `xp_value` and `hours_spent` must be non-negative (≥ 0)
  - `preset_slug` is unique per hobby (prevent duplicate joins)
  - Hobby mastery calculated: ALL quests must be "Done"

---

## API Endpoints

### Base URL
```
http://localhost:8000
```

### 1. Hobby Management

#### GET /hobbies
**Description:** Retrieve all user hobbies  
**Method:** GET  
**Status:** 200 OK  
**Response:**
```json
[
  {
    "id": 1,
    "name": "Learning Piano",
    "category": "Creative",
    "description": "Master the piano",
    "icon": "🎹",
    "image_url": "https://...",
    "preset_slug": null,
    "is_mastered": false,
    "created_at": "2026-03-01T10:00:00",
    "updated_at": "2026-03-18T14:30:00",
    "last_activity_at": "2026-03-18T14:30:00"
  }
]
```

---

#### GET /hobbies/{hobby_id}
**Description:** Retrieve a specific hobby with all its quests  
**Method:** GET  
**Path Parameters:** `hobby_id` (integer)  
**Status:** 200 OK | 404 Not Found  
**Response:**
```json
{
  "id": 1,
  "name": "Learning Piano",
  "category": "Creative",
  "description": "Master the piano",
  "icon": "🎹",
  "image_url": "https://...",
  "preset_slug": null,
  "is_mastered": false,
  "created_at": "2026-03-01T10:00:00",
  "updated_at": "2026-03-18T14:30:00",
  "last_activity_at": "2026-03-18T14:30:00",
  "quests": [
    {
      "id": 1,
      "hobby_id": 1,
      "title": "Learn C Major Scale",
      "description": "Practice C major scale 10 times",
      "difficulty": "Easy",
      "status": "Done",
      "xp_value": 50,
      "hours_spent": 1.5,
      "is_completed": true,
      "created_at": "2026-03-05T10:00:00",
      "updated_at": "2026-03-10T10:00:00",
      "completed_at": "2026-03-10T10:00:00"
    }
  ]
}
```

---

#### POST /hobbies
**Description:** Create a new custom hobby or join a preset hobby  
**Method:** POST  
**Status:** 201 Created  
**Request Body:**
```json
{
  "name": "Learning Guitar",
  "category": "Creative",
  "description": "Master acoustic guitar",
  "icon": "🎸",
  "image_url": "https://...",
  "preset_slug": null
}
```
**Response:** Same as GET /hobbies/{hobby_id} (new hobby object)

---

#### PATCH /hobbies/{hobby_id}
**Description:** Update hobby details (name, description, icon, etc.)  
**Method:** PATCH  
**Path Parameters:** `hobby_id` (integer)  
**Status:** 200 OK | 404 Not Found  
**Request Body (partial):**
```json
{
  "name": "Advanced Piano",
  "description": "Master advanced pieces"
}
```
**Response:** Updated hobby object

---

#### DELETE /hobbies/{hobby_id}
**Description:** Delete a hobby (cascades to delete all related quests)  
**Method:** DELETE  
**Path Parameters:** `hobby_id` (integer)  
**Status:** 200 OK | 404 Not Found  
**Response:**
```json
{
  "message": "Hobby deleted successfully"
}
```

---

### 2. Preset Hobbies (Catalog)

#### GET /preset-hobbies
**Description:** Browse the preset hobby catalog with join status  
**Method:** GET  
**Status:** 200 OK  
**Response:**
```json
[
  {
    "slug": "piano-mastery",
    "name": "Piano Mastery",
    "category": "Creative",
    "description": "Learn piano from beginner to advanced",
    "icon": "🎹",
    "image_url": "https://...",
    "total_quests": 10,
    "total_xp": 1000,
    "estimated_hours": 50,
    "joined": false,
    "joined_hobby_id": null,
    "quests": [
      {
        "title": "Learn C Major Scale",
        "description": "Practice C major scale",
        "difficulty": "Easy",
        "xp_value": 50,
        "estimated_hours": 2
      }
    ]
  }
]
```

---

#### POST /preset-hobbies/{preset_slug}/join
**Description:** Join a preset hobby (creates hobby + auto-populates quests)  
**Method:** POST  
**Path Parameters:** `preset_slug` (string)  
**Status:** 201 Created | 404 Not Found | 409 Conflict (already joined)  
**Request Body:** Empty  
**Response:**
```json
{
  "already_joined": false,
  "hobby": {
    "id": 2,
    "name": "Piano Mastery",
    "category": "Creative",
    ...
    "quests": [
      {
        "id": 5,
        "hobby_id": 2,
        "title": "Learn C Major Scale",
        "status": "To Do",
        "difficulty": "Easy",
        "xp_value": 50,
        ...
      }
    ]
  }
}
```

---

### 3. Quest Management

#### GET /quests
**Description:** Retrieve all quests across all hobbies  
**Method:** GET  
**Status:** 200 OK  
**Response:** Array of quest objects

---

#### POST /quests
**Description:** Create a new quest for a specific hobby  
**Method:** POST  
**Status:** 201 Created | 404 Not Found (hobby not found)  
**Request Body:**
```json
{
  "hobby_id": 1,
  "title": "Practice Beethoven's Moonlight Sonata",
  "description": "Learn the first movement",
  "difficulty": "Hard",
  "status": "To Do",
  "xp_value": 250,
  "hours_spent": 0
}
```
**Response:** Created quest object

---

#### PATCH /quests/{quest_id}
**Description:** Update quest status, hours spent, or other fields  
**Method:** PATCH  
**Path Parameters:** `quest_id` (integer)  
**Status:** 200 OK | 404 Not Found  
**Request Body (partial):**
```json
{
  "status": "Done",
  "hours_spent": 5.5
}
```
**Response:** Updated quest object  
**Note:** Automatically updates `completed_at` when status changes to "Done"

---

#### DELETE /quests/{quest_id}
**Description:** Delete a quest  
**Method:** DELETE  
**Path Parameters:** `quest_id` (integer)  
**Status:** 200 OK | 404 Not Found  
**Response:**
```json
{
  "message": "Quest deleted successfully"
}
```

---

### 4. Statistics & Analytics

#### GET /hobbies/{hobby_id}/stats
**Description:** Get computed statistics for a specific hobby  
**Method:** GET  
**Path Parameters:** `hobby_id` (integer)  
**Status:** 200 OK | 404 Not Found  
**Response:**
```json
{
  "total_quests": 5,
  "completed_quests": 3,
  "doing_quests": 1,
  "todo_quests": 1,
  "progress_percentage": 60.0,
  "total_hours_invested": 12.5,
  "last_activity_at": "2026-03-18T14:30:00",
  "total_xp_earned": 350
}
```

---

#### GET /stats/global
**Description:** Get aggregate statistics across all hobbies and quests  
**Method:** GET  
**Status:** 200 OK  
**Response:**
```json
{
  "total_hobbies": 3,
  "total_quests": 15,
  "completed_quests": 8,
  "global_progress_percentage": 53.33,
  "total_hours_invested": 42.75,
  "total_xp_earned": 1200
}
```

---

## How to Run the Application

### Prerequisites

- **Python 3.9+** (for backend)
- **Node.js 16+ & npm** (for frontend)
- **Git** (to clone or manage the project)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize the database** (optional - auto-created on first run):
   ```bash
   python seed.py
   ```

5. **Start the FastAPI server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   - Server will run at: **http://localhost:8000**
   - Interactive API docs: **http://localhost:8000/docs** (Swagger UI)
   - Alternative docs: **http://localhost:8000/redoc**

---

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   - Application will run at: **http://localhost:5173** (or similar)
   - Hot Module Replacement (HMR) enabled for instant updates

4. **Build for production:**
   ```bash
   npm run build
   ```

---

### Running Both Together

**Option 1: Separate Terminals**
- Terminal 1: `cd backend && uvicorn main:app --reload`
- Terminal 2: `cd frontend && npm run dev`

**Option 2: Using a Process Manager** (like concurrently):
```bash
npm install -g concurrently  # Install once globally
concurrently "cd backend && uvicorn main:app --reload" "cd frontend && npm run dev"
```

---

## Postman Testing

### Import Postman Collection

1. Open **Postman** (download from [postman.com](https://www.postman.com/downloads/))
2. Click **Import** (top left)
3. Select the file: `Quest_Master.postman_collection.json`
4. All API endpoints will be ready for testing

### Collection Structure

The collection includes:
- **Hobby Endpoints** - Create, read, update, delete hobbies
- **Preset Hobbies** - Browse and join preset hobbies
- **Quest Endpoints** - Manage quests
- **Statistics** - Fetch hobby and global stats

### Example Test Workflow

1. **GET /hobbies** - List all hobbies
2. **POST /hobbies** - Create a new hobby
3. **GET /preset-hobbies** - Browse preset catalog
4. **POST /preset-hobbies/{slug}/join** - Join a preset
5. **POST /quests** - Add a quest to the hobby
6. **PATCH /quests/{id}** - Mark quest as "Doing" or "Done"
7. **GET /hobbies/{id}/stats** - Check hobby progress
8. **GET /stats/global** - View global statistics
9. **DELETE /hobbies/{id}** - Clean up test data

---

## Features Implemented

✅ **REST API** - Full CRUD operations with proper HTTP methods and status codes  
✅ **Database** - SQLite schema with relationships and validations  
✅ **Client Interface** - React app with pages for Dashboard, Browse, Quests, Analytics  
✅ **Gamification** - XP system, quest difficulty levels, mastery tracking  
✅ **Preset Catalog** - Pre-made hobbies with quest templates  
✅ **Statistics** - Per-hobby and global progress metrics  
✅ **UI Components** - shadcn/ui for modern, accessible interface  

---

## File Structure

```
quest_master/
├── backend/
│   ├── main.py                 # FastAPI application & endpoints
│   ├── models.py               # SQLModel schemas & database tables
│   ├── database.py             # Database connection & initialization
│   ├── database.db             # SQLite database file
│   ├── preset_hobbies.py       # Preset catalog data
│   ├── seed.py                 # Database seeding script
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Root component
│   │   ├── routes.tsx          # Router & layout
│   │   ├── main.jsx            # Entry point
│   │   ├── pages/              # Page components
│   │   ├── components/         # UI components
│   │   │   └── ui/            # shadcn/ui primitives
│   │   ├── lib/                # Utilities
│   │   └── styles/             # Tailwind & CSS
│   ├── package.json            # Node dependencies
│   ├── vite.config.js          # Vite configuration
│   └── tsconfig.json           # TypeScript configuration
└── README.md                   # This file
```

---

## Notes & References

- **Cascading Deletes:** Deleting a hobby automatically removes all associated quests
- **Auto-Timestamps:** `created_at`, `updated_at`, and `completed_at` are managed automatically
- **Legacy Compatibility:** `is_completed` boolean synced with `status` enum for backward compatibility
- **Validation:** XP and hours spent cannot be negative; preset joins are idempotent (409 conflict on duplicate)

---

## Contact & Support

For issues or questions about the application, refer to the API documentation at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
