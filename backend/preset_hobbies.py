from dataclasses import dataclass
from typing import Optional

from models import HobbyCategory, QuestDifficulty


@dataclass(frozen=True)
class PresetQuestDefinition:
    title: str
    description: str
    difficulty: QuestDifficulty
    xp_value: int
    estimated_hours: float


@dataclass(frozen=True)
class PresetHobbyDefinition:
    slug: str
    name: str
    category: HobbyCategory
    description: str
    icon: str
    quests: tuple[PresetQuestDefinition, ...]
    image_url: Optional[str] = None

    @property
    def total_xp(self) -> int:
        return sum(quest.xp_value for quest in self.quests)

    @property
    def estimated_hours(self) -> float:
        return round(sum(quest.estimated_hours for quest in self.quests), 1)


PRESET_HOBBIES: tuple[PresetHobbyDefinition, ...] = (
    PresetHobbyDefinition(
        slug="guitar-mastery",
        name="Guitar Mastery",
        category=HobbyCategory.CREATIVE,
        description="Build a strong guitar foundation, learn songs, and develop confident rhythm and lead skills.",
        icon="🎸",
        quests=(
            PresetQuestDefinition("Learn guitar anatomy", "Identify string names, tuning pegs, fret numbers, and basic maintenance.", QuestDifficulty.EASY, 20, 1.0),
            PresetQuestDefinition("Master standard tuning", "Tune by ear and with a tuner until it becomes second nature.", QuestDifficulty.EASY, 25, 1.5),
            PresetQuestDefinition("Practice core open chords", "Switch smoothly between G, C, D, Em, and Am.", QuestDifficulty.MEDIUM, 35, 3.0),
            PresetQuestDefinition("Lock in rhythm strumming", "Play multiple strumming patterns with a metronome.", QuestDifficulty.MEDIUM, 35, 3.0),
            PresetQuestDefinition("Play your first full song", "Perform a full beginner-friendly song without stopping.", QuestDifficulty.MEDIUM, 40, 4.0),
            PresetQuestDefinition("Train finger independence", "Work through finger exercises to improve dexterity and timing.", QuestDifficulty.MEDIUM, 30, 2.5),
            PresetQuestDefinition("Learn barre chord basics", "Form and transition between simple barre shapes cleanly.", QuestDifficulty.HARD, 50, 5.0),
            PresetQuestDefinition("Record a mini performance", "Record a polished 60-second performance of a song section.", QuestDifficulty.HARD, 50, 4.0),
        ),
    ),
    PresetHobbyDefinition(
        slug="digital-art",
        name="Digital Art",
        category=HobbyCategory.CREATIVE,
        description="Develop drawing confidence, workflow discipline, and polished digital illustrations from sketch to finish.",
        icon="🎨",
        quests=(
            PresetQuestDefinition("Set up your art workspace", "Configure brushes, canvas presets, layers, and shortcuts in your chosen app.", QuestDifficulty.EASY, 20, 1.0),
            PresetQuestDefinition("Practice line confidence", "Fill a page with controlled strokes, curves, and clean silhouettes.", QuestDifficulty.EASY, 25, 1.5),
            PresetQuestDefinition("Study basic forms", "Draw spheres, cubes, and cylinders with believable perspective.", QuestDifficulty.MEDIUM, 35, 2.5),
            PresetQuestDefinition("Create a value study", "Paint a grayscale still life focusing on light and shadow.", QuestDifficulty.MEDIUM, 35, 3.0),
            PresetQuestDefinition("Design a character concept", "Combine shape language, costume, and pose into one clean concept sheet.", QuestDifficulty.HARD, 45, 4.0),
            PresetQuestDefinition("Finish a full illustration", "Take a sketch through line art, color, and final rendering.", QuestDifficulty.HARD, 50, 5.0),
        ),
    ),
    PresetHobbyDefinition(
        slug="web-development",
        name="Web Development",
        category=HobbyCategory.INTELLECTUAL,
        description="Go from frontend basics to shipping a small full-stack web feature with production mindset.",
        icon="💻",
        quests=(
            PresetQuestDefinition("Build a semantic HTML page", "Create a responsive page structure with accessible landmarks.", QuestDifficulty.EASY, 20, 1.5),
            PresetQuestDefinition("Style with modern CSS", "Use flexbox, grid, spacing, and typography to polish the layout.", QuestDifficulty.MEDIUM, 35, 2.5),
            PresetQuestDefinition("Add JavaScript interactions", "Implement DOM events, validation, and stateful UI behavior.", QuestDifficulty.MEDIUM, 40, 3.0),
            PresetQuestDefinition("Consume an API", "Fetch remote data, handle loading states, and render the results.", QuestDifficulty.MEDIUM, 45, 3.0),
            PresetQuestDefinition("Build a React feature", "Create reusable components with predictable props and local state.", QuestDifficulty.HARD, 50, 4.0),
            PresetQuestDefinition("Create a backend endpoint", "Expose validated data through a small API route.", QuestDifficulty.HARD, 55, 4.0),
            PresetQuestDefinition("Ship a mini full-stack project", "Deliver a deployed project with one polished user flow.", QuestDifficulty.HARD, 65, 6.0),
        ),
    ),
    PresetHobbyDefinition(
        slug="running-fitness",
        name="Running & Fitness",
        category=HobbyCategory.PHYSICAL,
        description="Build a sustainable running routine with mobility, strength support, and measurable endurance gains.",
        icon="🏃",
        quests=(
            PresetQuestDefinition("Baseline your fitness", "Record current pace, distance, resting heart rate, and mobility notes.", QuestDifficulty.EASY, 25, 1.0),
            PresetQuestDefinition("Complete three run-walk sessions", "Establish consistency with short structured sessions.", QuestDifficulty.MEDIUM, 40, 3.0),
            PresetQuestDefinition("Add a strength routine", "Complete two lower-body and core workouts that support running form.", QuestDifficulty.MEDIUM, 45, 2.5),
            PresetQuestDefinition("Run a continuous 5K", "Finish a 5K without walking while maintaining steady pacing.", QuestDifficulty.HARD, 60, 4.0),
            PresetQuestDefinition("Review and improve recovery", "Dial in sleep, stretching, hydration, and post-run mobility habits.", QuestDifficulty.MEDIUM, 65, 2.0),
        ),
    ),
    PresetHobbyDefinition(
        slug="meditation-mindfulness",
        name="Meditation & Mindfulness",
        category=HobbyCategory.INTELLECTUAL,
        description="Establish a calm daily mindfulness practice and learn simple techniques for focus, stress, and awareness.",
        icon="🧘",
        quests=(
            PresetQuestDefinition("Create a quiet ritual", "Choose a consistent time, place, and cue for daily practice.", QuestDifficulty.EASY, 20, 0.5),
            PresetQuestDefinition("Try breath-focused meditation", "Complete three short sessions centered on breath awareness.", QuestDifficulty.EASY, 25, 1.0),
            PresetQuestDefinition("Practice body scan awareness", "Run guided scans to notice tension and release it intentionally.", QuestDifficulty.MEDIUM, 30, 1.5),
            PresetQuestDefinition("Add mindful journaling", "Reflect on mood, distractions, and patterns after each session.", QuestDifficulty.MEDIUM, 30, 1.0),
            PresetQuestDefinition("Handle difficult thoughts", "Practice labeling emotions and returning attention without judgment.", QuestDifficulty.MEDIUM, 35, 2.0),
            PresetQuestDefinition("Complete a 7-day streak", "Maintain a full week of uninterrupted mindfulness practice.", QuestDifficulty.HARD, 45, 2.0),
        ),
    ),
    PresetHobbyDefinition(
        slug="photography",
        name="Photography",
        category=HobbyCategory.CREATIVE,
        description="Learn to shoot with intention, control exposure, and create stronger visual stories through editing.",
        icon="📸",
        quests=(
            PresetQuestDefinition("Understand exposure triangle", "Practice balancing shutter speed, aperture, and ISO in different scenes.", QuestDifficulty.EASY, 25, 1.5),
            PresetQuestDefinition("Shoot with composition rules", "Capture images using leading lines, framing, and rule of thirds.", QuestDifficulty.MEDIUM, 35, 2.0),
            PresetQuestDefinition("Photograph in manual mode", "Take a short set of photos using manual settings only.", QuestDifficulty.MEDIUM, 40, 3.0),
            PresetQuestDefinition("Run a portrait session", "Direct a subject, adjust light, and capture a cohesive portrait set.", QuestDifficulty.HARD, 45, 3.5),
            PresetQuestDefinition("Edit a photo series", "Apply consistent color, crop, and contrast edits to 5 images.", QuestDifficulty.MEDIUM, 50, 3.0),
            PresetQuestDefinition("Publish a themed collection", "Curate and share a mini story-driven set of final images.", QuestDifficulty.HARD, 65, 4.0),
        ),
    ),
    PresetHobbyDefinition(
        slug="language-learning",
        name="Language Learning",
        category=HobbyCategory.INTELLECTUAL,
        description="Build vocabulary, listening, speaking, and habit consistency toward real-world communication.",
        icon="🌍",
        quests=(
            PresetQuestDefinition("Learn survival phrases", "Memorize greetings, introductions, and daily essentials.", QuestDifficulty.EASY, 25, 1.0),
            PresetQuestDefinition("Build a 100-word core vocab", "Study and review the most common words with spaced repetition.", QuestDifficulty.MEDIUM, 40, 3.0),
            PresetQuestDefinition("Practice pronunciation daily", "Shadow native audio and record short speaking drills.", QuestDifficulty.MEDIUM, 45, 2.5),
            PresetQuestDefinition("Write simple journal entries", "Write short entries using new vocabulary and grammar patterns.", QuestDifficulty.MEDIUM, 45, 2.5),
            PresetQuestDefinition("Hold a 5-minute conversation", "Prepare prompts and sustain a basic exchange with a partner or tutor.", QuestDifficulty.HARD, 55, 3.0),
            PresetQuestDefinition("Complete a listening challenge", "Understand the main idea of beginner podcasts or videos.", QuestDifficulty.HARD, 60, 3.0),
            PresetQuestDefinition("Finish a 14-day streak", "Maintain daily study without missing a session.", QuestDifficulty.HARD, 65, 2.5),
        ),
    ),
    PresetHobbyDefinition(
        slug="cooking-mastery",
        name="Cooking Mastery",
        category=HobbyCategory.CREATIVE,
        description="Learn kitchen fundamentals, improve timing, and gain confidence creating complete meals from scratch.",
        icon="👨‍🍳",
        quests=(
            PresetQuestDefinition("Master knife basics", "Practice safe grip, slicing, dicing, and mise en place habits.", QuestDifficulty.EASY, 25, 1.5),
            PresetQuestDefinition("Cook three breakfast staples", "Prepare eggs, oats, and one quick high-protein option well.", QuestDifficulty.EASY, 25, 2.0),
            PresetQuestDefinition("Build sauces and seasoning", "Learn salt balance, acid, fat, and one simple pan sauce.", QuestDifficulty.MEDIUM, 35, 2.5),
            PresetQuestDefinition("Make a balanced lunch", "Cook a complete lunch with protein, carb, and vegetables.", QuestDifficulty.MEDIUM, 35, 2.5),
            PresetQuestDefinition("Cook a dinner for others", "Plan, time, and serve a meal for friends or family.", QuestDifficulty.HARD, 40, 3.5),
            PresetQuestDefinition("Create your signature dish", "Develop and document one repeatable dish you can own.", QuestDifficulty.HARD, 50, 4.0),
        ),
    ),
)


def get_preset_hobby(slug: str) -> Optional[PresetHobbyDefinition]:
    for preset in PRESET_HOBBIES:
        if preset.slug == slug:
            return preset
    return None