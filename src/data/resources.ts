export type ResourceAudience = "everyone" | "self-study" | "parents" | "teachers" | "schools";
export type ResourceFormat =
  | "Books"
  | "Videos"
  | "Games & Puzzles"
  | "Tasks & Lessons"
  | "Courses & Practice"
  | "Teaching Resources"
  | "Programs & Curriculum"
  | "Communities";

export interface ResourceFilter {
  id: ResourceAudience;
  label: string;
}

export interface ResourceItem {
  title: string;
  url: string;
  kind: string;
  source: string;
  section: string;
  blurb: string;
  audiences: ResourceAudience[];
}

export interface ResourceSourceProfile {
  name: string;
  bio: string;
  url?: string;
}

export const resourceFilters: ResourceFilter[] = [
  { id: "everyone", label: "For Everyone" },
  { id: "self-study", label: "For Self-Study" },
  { id: "parents", label: "For Parents" },
  { id: "teachers", label: "For Teachers" },
  { id: "schools", label: "For Schools" },
];

export const resourceFormatByKind: Record<string, ResourceFormat> = {
  Book: "Books",
  "Community feed": "Communities",
  "Course hub": "Courses & Practice",
  Curriculum: "Programs & Curriculum",
  "Family guide": "Teaching Resources",
  "Festival program": "Programs & Curriculum",
  Framework: "Teaching Resources",
  "Games collection": "Games & Puzzles",
  "Games library": "Games & Puzzles",
  "Interactive game": "Games & Puzzles",
  "Interactive lesson": "Tasks & Lessons",
  "Practice platform": "Courses & Practice",
  "Problem archive": "Courses & Practice",
  "Professional development": "Programs & Curriculum",
  "Puzzle archive": "Games & Puzzles",
  Routine: "Tasks & Lessons",
  "Routine library": "Tasks & Lessons",
  Talk: "Videos",
  "Task library": "Tasks & Lessons",
  Video: "Videos",
  "Video collection": "Videos",
  "Video series": "Videos",
  "Video talk": "Videos",
};

export const getResourceFormat = (kind: string): ResourceFormat =>
  resourceFormatByKind[kind] ?? "Teaching Resources";

export const resourceImageByTitle: Record<string, string> = {
  "Five Principles of Extraordinary Math Teaching | TEDxRainier":
    "https://ugc.production.linktr.ee/b083fdab-573b-4197-b08a-bebf52985792_maxresdefault.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Doodling in Math Class":
    "https://ugc.production.linktr.ee/dc1a8830-dea6-4903-8ded-e06e23328a17_unnamed.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Math Recess: Playful Learning in an Age of Disruption":
    "https://ugc.production.linktr.ee/62161058-8d99-41c3-a147-527651ea8c9e_44641435.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Alcumus (Pre-Algebra & Beyond)":
    "https://ugc.production.linktr.ee/10d3de55-95f5-4d03-a8a7-41e4a925d20c_alcumus-achievements.png?io=true&size=thumbnail-stack_v1_0",
  "Precalculus (UW Math 120)":
    "https://ugc.production.linktr.ee/8c1052c1-1bed-4529-8df1-5f566c6e6f99_hqdefault.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Math Twitter Blogosphere (#MTBoS, #ITeachMath)":
    "https://ugc.production.linktr.ee/73e6d972-4d94-4849-aea4-23929c9bc427_x-logo-twitter-elon-musk-dezeen-2364-col-0.webp?io=true&size=thumbnail-stack_v1_0",
  "Visual Patterns (Nguyen)":
    "https://ugc.production.linktr.ee/da2553f1-5f09-4eb3-964e-6e1c0c78d1dc_VP---Logo---Grey.png?io=true&size=thumbnail-stack_v1_0",
  "Slow Reveal Graphs (Laib)":
    "https://ugc.production.linktr.ee/4e535b84-fb8f-4db7-8124-e544fcc47658_slow-reveal-graph-2.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Openers (Math for Love)":
    "https://ugc.production.linktr.ee/b3e150bf-9d9b-46c2-a54d-d15afa7b0e48_logo.webp?io=true&size=thumbnail-stack_v1_0",
  "Games (Math For Love)":
    "https://ugc.production.linktr.ee/78febfe2-c483-4edc-9c54-86d66513eaaa_logo.webp?io=true&size=thumbnail-stack_v1_0",
  "Rich Tasks (Math for Love)":
    "https://ugc.production.linktr.ee/d10d9fb7-de0e-426e-b385-c3519474041f_logo.webp?io=true&size=thumbnail-stack_v1_0",
  "Conjectures and Counterexamples (Gafni)":
    "https://ugc.production.linktr.ee/33f4208e-f62a-4440-855a-f9235edfd73d_2bf19c99dc5278edd71591ec43622603e77c8581b3445e0e0221ac9991d81e69.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Progression Videos (Fletchy)":
    "https://ugc.production.linktr.ee/955a7128-ac13-4dde-886b-a7e4ce077799_blank.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Book: Building Thinking Classrooms":
    "https://ugc.production.linktr.ee/243f96f6-823d-424d-9651-f85457cb1ce2_53484824.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Book: Teaching with Your Mouth Shut":
    "https://ugc.production.linktr.ee/d26ece57-da65-41d2-9332-4c24efd6f787_1173459.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Book: Teaching as a Subversive Activity":
    "https://ugc.production.linktr.ee/5bc6ff3e-228f-4486-bb86-6cd51ea8e610_79681.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Exploding Dots (Global Math Project)":
    "https://ugc.production.linktr.ee/e489adaf-796e-47d5-8683-c36f45c74036_global-math-project.png?io=true&size=thumbnail-stack_v1_0",
  "Thinking Mathematics Volume 1 (Tanton)":
    "https://ugc.production.linktr.ee/44999181-c264-467e-8a80-d5d1564c4de9_19576n6d-front-shortedge-384.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Professional Development (Math for Love)":
    "https://ugc.production.linktr.ee/65d03207-f4bf-4934-a509-27688a91119a_logo.webp?io=true&size=thumbnail-stack_v1_0",
  "Curriculum (Math for Love)":
    "https://ugc.production.linktr.ee/a1e040cb-8859-45ba-99ef-847535f1bcb0_logo.webp?io=true&size=thumbnail-stack_v1_0",
  "Julia Robinson Mathematics Festival":
    "https://ugc.production.linktr.ee/44bb05b9-0290-4521-9bb7-910a2b053e13_CircleFestival2.png?io=true&size=thumbnail-stack_v1_0",
  "Award Winning Games (Math For Love)":
    "https://ugc.production.linktr.ee/355576d8-a7c8-4cae-a0d2-10bd68da8001_0863002000115-p0-v1-s1200x630.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Talking Math With Your Kids (Danielson)":
    "https://ugc.production.linktr.ee/b518c7f8-ef39-484a-8929-9f88abc3457d_TalkingMathwithYourKids-card.jpeg?io=true&size=thumbnail-stack_v1_0",
  "What is the Common Core?":
    "https://ugc.production.linktr.ee/73713e42-5734-4247-bd86-49f8c8b7aefa_hqdefault.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Logic-Grid Brain Teasers (Braingle)":
    "https://ugc.production.linktr.ee/54466024-fc32-4f1d-9e31-c38b99940cc1_br-512.png?io=true&size=thumbnail-stack_v1_0",
  "Beast Academy (Ages 6+)":
    "https://ugc.production.linktr.ee/2e60621e-d640-452c-ba17-ff7dac7dbf5b_images.jpeg?io=true&size=thumbnail-stack_v1_0",
  "The Number Devil: A Mathematical Adventure":
    "https://ugc.production.linktr.ee/21c526b7-b8f1-4631-a39b-cb4554eea337_91358.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Hard Math for Elementary School":
    "https://ugc.production.linktr.ee/45f76eae-eb18-4e25-9590-ccb8746ef61e_19933375.jpeg?io=true&size=thumbnail-stack_v1_0",
  "What Is the Name of This Book?":
    "https://ugc.production.linktr.ee/3590cee0-4a1c-4f96-aa3e-9b5730a60439_493576.jpeg?io=true&size=thumbnail-stack_v1_0",
  "The Man Who Counted: A Collection of Mathematical Adventures":
    "https://ugc.production.linktr.ee/1879d5bf-7599-41e2-adf2-f5ec21ad7747_1160800.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Family Math":
    "https://ugc.production.linktr.ee/50ac14b4-56e7-4cdb-8fcd-f6297fd3462e_489265.jpeg?io=true&size=thumbnail-stack_v1_0",
  "Without Words (Tanton)":
    "https://ugc.production.linktr.ee/577244d1-a11b-4e54-82bd-7bfe6de54bff_51AUhQzsV1L.-SY291-BO1-204-203-200-QL40-FMwebp-.webp?io=true&size=thumbnail-stack_v1_0",
  "Games for Math":
    "https://ugc.production.linktr.ee/a4ee08d4-79fd-4836-a85d-3d6f9ccdafd2_614638.jpeg?io=true&size=thumbnail-stack_v1_0",
};

export const resourceSourceProfiles: Record<string, ResourceSourceProfile> = {
  "Art of Problem Solving": {
    name: "Art of Problem Solving",
    bio: "Art of Problem Solving is a math enrichment organization known for deep problem solving, contest preparation, and challenging materials for curious students.",
    url: "https://artofproblemsolving.com",
  },
  "Beast Academy": {
    name: "Beast Academy",
    bio: "Beast Academy is the elementary branch of Art of Problem Solving, built around comic-style lessons and rich mathematical challenge for younger learners.",
    url: "https://beastacademy.com",
  },
  Braingle: {
    name: "Braingle",
    bio: "Braingle is a long-running puzzle site with logic grids, brainteasers, and other deduction-heavy challenges.",
    url: "https://www.braingle.com",
  },
  "Donald L. Finkel": {
    name: "Donald L. Finkel",
    bio: "Donald L. Finkel was an educator and author best known for writing about discovery-driven teaching and intellectual independence in the classroom.",
  },
  "Euclid: The Game": {
    name: "Euclid: The Game",
    bio: "Euclid: The Game turns classical geometry constructions into interactive puzzles that reward experimentation and elegant thinking.",
    url: "https://kasperpeulen.github.io",
  },
  "Glenn Ellison": {
    name: "Glenn Ellison",
    bio: "Glenn Ellison is an economist and enrichment author whose problem collections are widely used by families looking for deeper elementary math challenge.",
  },
  "Global Math Project": {
    name: "Global Math Project",
    bio: "Global Math Project shares joyful, accessible mathematical experiences designed to help more people encounter real mathematical beauty.",
    url: "https://globalmathproject.org",
  },
  "Graham Fletcher": {
    name: "Graham Fletcher",
    bio: "Graham Fletcher is a math educator known for visual lessons, number strings, and progression resources that support strong conceptual understanding.",
    url: "https://gfletchy.com",
  },
  "Hans Magnus Enzensberger": {
    name: "Hans Magnus Enzensberger",
    bio: "Hans Magnus Enzensberger was a German author and intellectual whose The Number Devil introduced many readers to playful mathematical imagination.",
  },
  JRMF: {
    name: "Julia Robinson Mathematics Festival",
    bio: "The Julia Robinson Mathematics Festival is a nonprofit organization that helps communities host joyful, problem-rich mathematical events for students and families.",
    url: "https://jrmf.org",
  },
  "James Tanton": {
    name: "James Tanton",
    bio: "James Tanton is a mathematician and educator celebrated for making mathematics playful, visual, and deeply human through books, videos, and puzzles.",
    url: "https://www.jamestanton.com",
  },
  "Jean Kerr Stenmark": {
    name: "Jean Kerr Stenmark",
    bio: "Jean Kerr Stenmark is a math educator and co-author of Family Math, a foundational resource for bringing meaningful math activity into family life.",
  },
  "Malba Tahan": {
    name: "Malba Tahan",
    bio: "Malba Tahan was the pen name of Julio Cesar de Mello e Souza, the Brazilian writer behind The Man Who Counted and its story-driven mathematical adventures.",
  },
  "Math for Love": {
    name: "Math for Love",
    bio: "Math for Love is an organization co-founded by Dan Finkel that creates lessons, games, and professional learning centered on joy, play, and real mathematical thinking.",
    url: "https://mathforlove.com",
  },
  "Neil Postman": {
    name: "Neil Postman",
    bio: "Neil Postman was a writer and educator whose work challenged schools to put inquiry, questioning, and intellectual vitality at the center of learning.",
  },
  "Open Middle": {
    name: "Open Middle",
    bio: "Open Middle is a task library built to provoke discussion and flexible thinking through short problems with many possible approaches.",
    url: "https://www.openmiddle.com",
  },
  "Paul Gafni": {
    name: "Paul Gafni",
    bio: "Paul Gafni is the educator behind The Number Garden, with a focus on playful rigor, conjecture, and helping learners experience mathematics as a living discipline.",
    url: "https://paulgafni.com",
  },
  "Peggy Kaye": {
    name: "Peggy Kaye",
    bio: "Peggy Kaye is an educator and author known for practical, family-friendly books that turn games and everyday activity into mathematical thinking.",
  },
  "Peter Liljedahl": {
    name: "Peter Liljedahl",
    bio: "Peter Liljedahl is a mathematics education researcher best known for Building Thinking Classrooms and his work on collaborative problem-solving environments.",
    url: "https://www.peterliljedahl.com",
  },
  "Project Euler": {
    name: "Project Euler",
    bio: "Project Euler is a long-running archive of programming-based math problems that reward persistence, pattern spotting, and clever problem solving.",
    url: "https://projecteuler.net",
  },
  "Raymond Smullyan": {
    name: "Raymond Smullyan",
    bio: "Raymond Smullyan was a logician, puzzle writer, and philosopher whose books made formal logic feel mischievous, elegant, and irresistible.",
  },
  "Robert Kaplinsky": {
    name: "Robert Kaplinsky",
    bio: "Robert Kaplinsky is a math educator who shares classroom tasks, planning tools, and professional resources aimed at richer mathematical thinking.",
    url: "https://robertkaplinsky.com",
  },
  "Slow Reveal Graphs": {
    name: "Slow Reveal Graphs",
    bio: "Slow Reveal Graphs is a visual classroom routine that builds curiosity by letting learners make sense of a graph before seeing the whole picture.",
    url: "https://slowrevealgraphs.com",
  },
  "Sunil Singh": {
    name: "Sunil Singh",
    bio: "Sunil Singh is a math teacher, speaker, and writer who advocates for humane, creative, and deeply engaging mathematics education.",
  },
  "Talking Math With Your Kids": {
    name: "Talking Math With Your Kids",
    bio: "Talking Math With Your Kids is a family-facing project devoted to helping adults notice, name, and enjoy the mathematics already present in daily life.",
    url: "https://talkingmathwithkids.com",
  },
  "Vi Hart": {
    name: "Vi Hart",
    bio: "Vi Hart is a mathemusician and video creator whose doodles, songs, and playful explanations have inspired many people to see math differently.",
    url: "https://vihart.com",
  },
  "Visual Patterns": {
    name: "Visual Patterns",
    bio: "Visual Patterns is a widely used collection of prompts that invite learners to notice structure, generalize patterns, and explain their reasoning.",
    url: "https://www.visualpatterns.org",
  },
  X: {
    name: "X",
    bio: "X is a social platform where many math educators still share tasks, questions, classroom experiments, and live professional conversation.",
  },
};

export const resources: ResourceItem[] = [
  {
    title: "Five Principles of Extraordinary Math Teaching | TEDxRainier",
    url: "https://www.youtube.com/watch?v=ytVneQUA5-c",
    kind: "Video talk",
    source: "Math for Love",
    section: "For Everyone",
    blurb: "A short talk on curiosity, challenge, and mathematical agency.",
    audiences: ["everyone"],
  },
  {
    title: "Doodling in Math Class",
    url: "https://www.youtube.com/playlist?list=PLF7CBA45AEBAD18B8",
    kind: "Video series",
    source: "Vi Hart",
    section: "For Everyone",
    blurb: "A playful series that makes mathematical ideas feel alive.",
    audiences: ["everyone"],
  },
  {
    title: "Math Recess: Playful Learning in an Age of Disruption",
    url: "https://www.goodreads.com/book/show/44641435-math-recess",
    kind: "Book",
    source: "Sunil Singh",
    section: "For Everyone",
    blurb: "A book about humane, playful math learning in modern classrooms.",
    audiences: ["everyone"],
  },
  {
    title: "Alcumus (Pre-Algebra & Beyond)",
    url: "https://artofproblemsolving.com/alcumus",
    kind: "Practice platform",
    source: "Art of Problem Solving",
    section: "For Self-Study",
    blurb: "Problem practice with feedback for students ready to stretch.",
    audiences: ["self-study"],
  },
  {
    title: "Euclid: The Game (Geometry)",
    url: "https://kasperpeulen.github.io",
    kind: "Interactive game",
    source: "Euclid: The Game",
    section: "For Self-Study",
    blurb: "Geometry puzzles that turn construction into experimentation.",
    audiences: ["self-study"],
  },
  {
    title: "Project Euler (Programming)",
    url: "https://projecteuler.net",
    kind: "Problem archive",
    source: "Project Euler",
    section: "For Self-Study",
    blurb: "Programming-flavored math challenges for persistent problem solvers.",
    audiences: ["self-study"],
  },
  {
    title: "Precalculus (UW Math 120)",
    url: "https://linktr.ee/precalculus",
    kind: "Course hub",
    source: "Paul Gafni",
    section: "For Self-Study",
    blurb: "A compact course hub for precalculus topics and review.",
    audiences: ["self-study"],
  },
  {
    title: "Math Twitter Blogosphere (#MTBoS, #ITeachMath)",
    url: "https://x.com/search?q=%23iteachmath%20%23mtbos",
    kind: "Community feed",
    source: "X",
    section: "For Teachers",
    blurb: "A live stream of math teacher ideas, tasks, and debate.",
    audiences: ["teachers"],
  },
  {
    title: "Visual Patterns (Nguyen)",
    url: "https://www.visualpatterns.org",
    kind: "Task library",
    source: "Visual Patterns",
    section: "For Teachers",
    blurb: "Pattern prompts that invite noticing, generalizing, and justification.",
    audiences: ["teachers"],
  },
  {
    title: "Open Middle® (Johnson & Kaplinsky)",
    url: "https://www.openmiddle.com",
    kind: "Task library",
    source: "Open Middle",
    section: "For Teachers",
    blurb: "Short problems with many entry points and rich discussion.",
    audiences: ["teachers"],
  },
  {
    title: "Slow Reveal Graphs (Laib)",
    url: "https://slowrevealgraphs.com",
    kind: "Routine",
    source: "Slow Reveal Graphs",
    section: "For Teachers",
    blurb: "Graph routines that build curiosity before explanation.",
    audiences: ["teachers"],
  },
  {
    title: "Openers (Math for Love)",
    url: "https://mathforlove.com/lessons/openers/",
    kind: "Routine library",
    source: "Math for Love",
    section: "For Teachers",
    blurb: "Warm starts that get students thinking right away.",
    audiences: ["teachers"],
  },
  {
    title: "Games (Math For Love)",
    url: "https://mathforlove.com/lessons/games/",
    kind: "Games library",
    source: "Math for Love",
    section: "For Teachers",
    blurb: "Classroom-friendly games that build strategy and number sense.",
    audiences: ["teachers"],
  },
  {
    title: "Rich Tasks (Math for Love)",
    url: "https://mathforlove.com/lessons/rich-tasks/",
    kind: "Task library",
    source: "Math for Love",
    section: "For Teachers",
    blurb: "Open-ended lessons built for reasoning, discussion, and depth.",
    audiences: ["teachers"],
  },
  {
    title: "Conjectures and Counterexamples (Gafni)",
    url: "https://paulgafni.com/conjectures/",
    kind: "Talk",
    source: "Paul Gafni",
    section: "For Teachers",
    blurb: "A talk about centering student thinking in math conversations.",
    audiences: ["teachers"],
  },
  {
    title: "Depth of Knowledge (Kaplinsky)",
    url: "https://robertkaplinsky.com/tag/open-middle-math-depth-of-knowledge-matrix/",
    kind: "Framework",
    source: "Robert Kaplinsky",
    section: "For Teachers",
    blurb: "A matrix for increasing cognitive demand in familiar tasks.",
    audiences: ["teachers"],
  },
  {
    title: "Progression Videos (Fletchy)",
    url: "https://gfletchy.com/progression-videos/",
    kind: "Video collection",
    source: "Graham Fletcher",
    section: "For Teachers",
    blurb: "Visual progressions for big ideas across grade bands.",
    audiences: ["teachers"],
  },
  {
    title: "Book: Building Thinking Classrooms",
    url: "https://www.goodreads.com/book/show/53484824-building-thinking-classrooms-in-mathematics-grades-k-12",
    kind: "Book",
    source: "Peter Liljedahl",
    section: "For Teachers",
    blurb: "A widely used book on collaborative problem-solving routines.",
    audiences: ["teachers", "schools"],
  },
  {
    title: "Book: Teaching with Your Mouth Shut",
    url: "https://www.goodreads.com/book/show/1173459.Teaching_with_Your_Mouth_Shut",
    kind: "Book",
    source: "Donald L. Finkel",
    section: "For Teachers",
    blurb: "A classic argument for discovery-rich teaching.",
    audiences: ["teachers"],
  },
  {
    title: "Book: Teaching as a Subversive Activity",
    url: "https://www.goodreads.com/book/show/79681.Teaching_as_a_Subversive_Activity",
    kind: "Book",
    source: "Neil Postman",
    section: "For Teachers",
    blurb: "A provocative classic on inquiry-centered education.",
    audiences: ["teachers", "schools"],
  },
  {
    title: "Exploding Dots (Global Math Project)",
    url: "https://globalmathproject.org/exploding-dots/",
    kind: "Interactive lesson",
    source: "Global Math Project",
    section: "For Teachers",
    blurb: "A beautiful model for place value and algebraic structure.",
    audiences: ["teachers"],
  },
  {
    title: "Thinking Mathematics Volume 1 (Tanton)",
    url: "https://www.lulu.com/shop/james-tanton/thinking-mathematics-1-arithmeticgateway-to-all/paperback/product-11906443.html",
    kind: "Book",
    source: "James Tanton",
    section: "For Teachers",
    blurb: "A playful text full of problems, puzzles, and explanations.",
    audiences: ["teachers", "self-study"],
  },
  {
    title: "Professional Development (Math for Love)",
    url: "https://mathforlove.com/pd/",
    kind: "Professional development",
    source: "Math for Love",
    section: "For Schools",
    blurb: "Support for schools building richer math instruction.",
    audiences: ["schools", "teachers"],
  },
  {
    title: "Curriculum (Math for Love)",
    url: "https://mathforlove.com/curriculum/",
    kind: "Curriculum",
    source: "Math for Love",
    section: "For Schools",
    blurb: "Full curriculum materials shaped by play and problem solving.",
    audiences: ["schools", "teachers"],
  },
  {
    title: "Julia Robinson Mathematics Festival",
    url: "https://jrmf.org/host-a-festival/",
    kind: "Festival program",
    source: "JRMF",
    section: "For Schools",
    blurb: "A model for joyful, communal mathematical experiences.",
    audiences: ["schools", "teachers", "parents"],
  },
  {
    title: "Award Winning Games (Math For Love)",
    url: "https://mathforlove.com/games/",
    kind: "Games collection",
    source: "Math for Love",
    section: "For Parents",
    blurb: "Family-friendly games worth bringing to the table.",
    audiences: ["parents"],
  },
  {
    title: "Talking Math With Your Kids (Danielson)",
    url: "https://talkingmathwithkids.com",
    kind: "Family guide",
    source: "Talking Math With Your Kids",
    section: "For Parents",
    blurb: "Simple ways to notice and talk about math at home.",
    audiences: ["parents"],
  },
  {
    title: "What is the Common Core?",
    url: "https://www.youtube.com/watch?v=j4I-jkUt49I",
    kind: "Video",
    source: "James Tanton",
    section: "For Parents",
    blurb: "A plainspoken take on what the standards are trying to do.",
    audiences: ["parents"],
  },
  {
    title: "Logic-Grid Brain Teasers (Braingle)",
    url: "https://www.braingle.com/brainteasers/Logic-Grid.html",
    kind: "Puzzle archive",
    source: "Braingle",
    section: "For Parents",
    blurb: "Deduction puzzles that reward patience and organized thinking.",
    audiences: ["parents", "self-study"],
  },
  {
    title: "Beast Academy (Ages 6+)",
    url: "https://beastacademy.com",
    kind: "Curriculum",
    source: "Beast Academy",
    section: "For Parents",
    blurb: "A challenging, comic-styled curriculum for elementary learners.",
    audiences: ["parents", "self-study"],
  },
  {
    title: "The Number Devil: A Mathematical Adventure",
    url: "https://www.goodreads.com/book/show/91358.The_Number_Devil",
    kind: "Book",
    source: "Hans Magnus Enzensberger",
    section: "For Parents",
    blurb: "A whimsical novel that turns numbers into adventure.",
    audiences: ["parents", "everyone"],
  },
  {
    title: "Hard Math for Elementary School",
    url: "https://www.goodreads.com/book/show/19933375-hard-math-for-elementary-school",
    kind: "Book",
    source: "Glenn Ellison",
    section: "For Parents",
    blurb: "Problem collections for younger students who enjoy challenge.",
    audiences: ["parents", "self-study"],
  },
  {
    title: "What Is the Name of This Book?",
    url: "https://www.goodreads.com/book/show/493576.What_Is_the_Name_of_This_Book_",
    kind: "Book",
    source: "Raymond Smullyan",
    section: "For Parents",
    blurb: "Classic logic puzzles and paradoxes from Raymond Smullyan.",
    audiences: ["parents", "everyone"],
  },
  {
    title: "The Man Who Counted: A Collection of Mathematical Adventures",
    url: "https://www.goodreads.com/book/show/1160800.The_Man_Who_Counted",
    kind: "Book",
    source: "Malba Tahan",
    section: "For Parents",
    blurb: "Story-based math adventures with charm and ingenuity.",
    audiences: ["parents", "everyone"],
  },
  {
    title: "Family Math",
    url: "https://www.goodreads.com/book/show/489265.Family_Math",
    kind: "Book",
    source: "Jean Kerr Stenmark",
    section: "For Parents",
    blurb: "Hands-on family activities for mathematical conversation.",
    audiences: ["parents"],
  },
  {
    title: "Without Words (Tanton)",
    url: "https://www.amazon.com/Without-Words-Mathematical-Puzzles-Confound/dp/1907550232/",
    kind: "Book",
    source: "James Tanton",
    section: "For Parents",
    blurb: "Visual puzzles that spark conjecture before language.",
    audiences: ["parents", "everyone"],
  },
  {
    title: "Games for Math",
    url: "https://www.goodreads.com/book/show/614638",
    kind: "Book",
    source: "Peggy Kaye",
    section: "For Parents",
    blurb: "A practical collection of mathematical games and investigations.",
    audiences: ["parents"],
  },
];
