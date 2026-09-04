import type { Skill, SkillCategory, SkillLevel, User } from '../types';
import { CAMPUS } from './constants';

/**
 * Peer seeds. Deterministic: no randomness, no Date.now().
 * karmaBalance / rating / reviewCount / hours are NOT set here — they are
 * derived from the ledger and reviews in store.ts, because spec section 2.4
 * requires them to be computed rather than client-authored.
 */

type SkillSeed = [title: string, category: SkillCategory, level: SkillLevel, description: string];

interface UserSeed {
  id: string;
  name: string;
  major: string;
  bio: string;
  campus?: string;
  offers: SkillSeed[];
  wants: SkillSeed[];
  availability: string[];
  hoursTaught: number;
  hoursLearned: number;
  joinedAt: string;
  status?: User['status'];
}

const AVAIL = {
  weekdayEve: ['Mon evening', 'Wed evening', 'Thu evening'],
  weekend: ['Sat morning', 'Sat afternoon', 'Sun afternoon'],
  mornings: ['Tue morning', 'Thu morning', 'Fri morning'],
  flexible: ['Mon evening', 'Wed afternoon', 'Sat morning', 'Sun evening'],
  lunch: ['Tue lunch', 'Wed lunch', 'Fri lunch']
};

const seeds: UserSeed[] = [
  {
    id: 'u-me',
    name: 'Aarav Mehta',
    major: 'Computer Science',
    bio: 'Third-year CS student. I build Flutter apps and I have wanted to play guitar since I was twelve. Happy to trade debugging help for chords.',
    offers: [
      ['Flutter Development', 'tech', 'expert', 'Widgets, state management, and shipping to both stores.'],
      ['Python', 'tech', 'intermediate', 'Scripting, pandas, and enough Django to be dangerous.'],
      ['Data Structures', 'academics', 'expert', 'Exam prep for the second-year algorithms paper.']
    ],
    wants: [
      ['Acoustic Guitar', 'music', 'beginner', 'Never held one properly. Start me at zero.'],
      ['Spanish', 'languages', 'beginner', 'Going on exchange to Valencia next year.'],
      ['Film Photography', 'arts', 'beginner', 'I have my dad old Pentax and no idea.']
    ],
    availability: AVAIL.weekdayEve,
    hoursTaught: 12,
    hoursLearned: 6,
    joinedAt: '2026-02-11T09:00:00.000Z'
  },
  {
    id: 'u-002',
    name: 'Priya Raghunathan',
    major: 'Music Performance',
    bio: 'Classical and folk guitarist, eight years. Teaching is how I pay for strings.',
    offers: [
      ['Acoustic Guitar', 'music', 'expert', 'Fingerpicking, chord theory, and your first full song in three sessions.'],
      ['Music Theory', 'music', 'intermediate', 'Reading notation and understanding why chords work.']
    ],
    wants: [
      ['Python', 'tech', 'beginner', 'I want to analyse my practice recordings.'],
      ['Video Editing', 'arts', 'beginner', 'For posting performances.']
    ],
    availability: AVAIL.weekend,
    hoursTaught: 24,
    hoursLearned: 4,
    joinedAt: '2026-01-20T09:00:00.000Z'
  },
  {
    id: 'u-003',
    name: 'Daniel Okonjo',
    major: 'Spanish & Linguistics',
    bio: 'Native Spanish speaker from Madrid, studying linguistics. Conversation practice over coffee is my favourite format.',
    offers: [
      ['Spanish', 'languages', 'expert', 'Conversational fluency, exam prep, or just surviving a semester abroad.'],
      ['Portuguese', 'languages', 'intermediate', 'Brazilian Portuguese, conversational level.']
    ],
    wants: [
      ['Flutter Development', 'tech', 'beginner', 'I have an app idea for language learners.'],
      ['Bouldering', 'fitness', 'beginner', 'Want to try the campus wall without embarrassing myself.']
    ],
    availability: AVAIL.lunch,
    hoursTaught: 31,
    hoursLearned: 9,
    joinedAt: '2026-01-14T09:00:00.000Z'
  },
  {
    id: 'u-004',
    name: 'Mei-Ling Chen',
    major: 'Visual Communication',
    bio: 'Designer, illustrator, and the person who will tell you your kerning is off.',
    offers: [
      ['Figma', 'arts', 'expert', 'From wireframe to a design system your engineers will not hate.'],
      ['Film Photography', 'arts', 'intermediate', 'Loading, exposure, and developing black and white at home.']
    ],
    wants: [
      ['Data Structures', 'academics', 'beginner', 'Switching to a design engineering masters, need the CS basics.'],
      ['Korean', 'languages', 'beginner', 'For a study exchange in Seoul.']
    ],
    availability: AVAIL.flexible,
    hoursTaught: 18,
    hoursLearned: 11,
    joinedAt: '2026-02-02T09:00:00.000Z'
  },
  {
    id: 'u-005',
    name: 'Jonas Weber',
    major: 'Mechanical Engineering',
    bio: 'Climbs four days a week. Will absolutely talk your ear off about beta.',
    offers: [
      ['Bouldering', 'fitness', 'expert', 'Movement fundamentals and reading routes. Campus wall or the gym in town.'],
      ['CAD Modelling', 'tech', 'intermediate', 'Fusion 360 for people who need a part printed by Friday.']
    ],
    wants: [
      ['Music Theory', 'music', 'beginner', 'Learning bass, want to understand what I am playing.'],
      ['Baking', 'cooking', 'beginner', 'Sourdough keeps defeating me.']
    ],
    availability: AVAIL.mornings,
    hoursTaught: 15,
    hoursLearned: 7,
    joinedAt: '2026-02-19T09:00:00.000Z'
  },
  {
    id: 'u-006',
    name: 'Sofia Almeida',
    major: 'Culinary Science',
    bio: 'Fermentation obsessive. My flat smells permanently of kimchi and I regret nothing.',
    offers: [
      ['Baking', 'cooking', 'expert', 'Sourdough, laminated dough, and why your oven is lying to you.'],
      ['Knife Skills', 'cooking', 'intermediate', 'Forty minutes and you will stop being scared of a chef knife.']
    ],
    wants: [
      ['Figma', 'arts', 'beginner', 'Building a recipe site and it looks terrible.'],
      ['Statistics', 'academics', 'intermediate', 'For my food-science dissertation.']
    ],
    availability: AVAIL.weekend,
    hoursTaught: 22,
    hoursLearned: 5,
    joinedAt: '2026-01-28T09:00:00.000Z'
  },
  {
    id: 'u-007',
    name: 'Tomas Nowak',
    major: 'Statistics',
    bio: 'R, Python, and an unreasonable fondness for well-labelled axes.',
    offers: [
      ['Statistics', 'academics', 'expert', 'Regression, inference, and making your dissertation defensible.'],
      ['R Programming', 'tech', 'expert', 'tidyverse, ggplot2, and reproducible reports.'],
      ['Python', 'tech', 'intermediate', 'pandas and matplotlib, from a statistician angle.']
    ],
    wants: [
      ['Acoustic Guitar', 'music', 'beginner', 'Bucket list item.'],
      ['Knife Skills', 'cooking', 'beginner', 'I eat far too much pasta.']
    ],
    availability: AVAIL.weekdayEve,
    hoursTaught: 27,
    hoursLearned: 3,
    joinedAt: '2026-01-09T09:00:00.000Z'
  },
  {
    id: 'u-008',
    name: 'Aisha Rahman',
    major: 'Biomedical Engineering',
    bio: 'Marathon runner, part-time yoga instructor, full-time under-slept.',
    offers: [
      ['Yoga', 'fitness', 'expert', 'Vinyasa and mobility work for people who sit at a desk all day.'],
      ['Running Coaching', 'fitness', 'intermediate', 'Couch to 10k without wrecking your knees.']
    ],
    wants: [
      ['Spanish', 'languages', 'intermediate', 'I have the grammar, I need the confidence.'],
      ['Video Editing', 'arts', 'beginner', 'To film class sequences properly.']
    ],
    availability: AVAIL.mornings,
    hoursTaught: 19,
    hoursLearned: 8,
    joinedAt: '2026-02-25T09:00:00.000Z'
  },
  {
    id: 'u-009',
    name: 'Ravi Chandrasekhar',
    major: 'Film & Media',
    bio: 'Editor. Premiere and DaVinci. I have opinions about jump cuts.',
    offers: [
      ['Video Editing', 'arts', 'expert', 'Premiere, DaVinci Resolve, colour grading, and pacing a cut.'],
      ['Sound Design', 'music', 'intermediate', 'Cleaning up dialogue and building an atmosphere.']
    ],
    wants: [
      ['Yoga', 'fitness', 'beginner', 'My back is a wreck from the edit suite.'],
      ['Python', 'tech', 'beginner', 'To automate the boring parts of my workflow.']
    ],
    availability: AVAIL.flexible,
    hoursTaught: 16,
    hoursLearned: 12,
    joinedAt: '2026-02-06T09:00:00.000Z'
  },
  {
    id: 'u-010',
    name: 'Hannah Lindqvist',
    major: 'Korean Studies',
    bio: 'Second-year, back from a year in Seoul. Happy to run conversation tables.',
    offers: [
      ['Korean', 'languages', 'expert', 'From hangul to holding a conversation about anything but the weather.'],
      ['Swedish', 'languages', 'expert', 'Native. Rarely requested. Available anyway.']
    ],
    wants: [
      ['Figma', 'arts', 'intermediate', 'Designing flashcard apps for my study group.'],
      ['Bouldering', 'fitness', 'beginner', 'New here, want to meet people.']
    ],
    availability: AVAIL.lunch,
    hoursTaught: 14,
    hoursLearned: 6,
    joinedAt: '2026-03-01T09:00:00.000Z'
  },
  {
    id: 'u-011',
    name: 'Marcus Bell',
    major: 'Jazz Studies',
    bio: 'Double bass and piano. I will make you count out loud and you will hate it briefly.',
    offers: [
      ['Music Theory', 'music', 'expert', 'Jazz harmony, voice leading, and reading a lead sheet.'],
      ['Piano', 'music', 'expert', 'Beginners very welcome. No, you are not too old.']
    ],
    wants: [
      ['Statistics', 'academics', 'beginner', 'Required module and I am drowning.'],
      ['CAD Modelling', 'tech', 'beginner', 'Want to design a custom bass bridge.']
    ],
    availability: AVAIL.weekdayEve,
    hoursTaught: 29,
    hoursLearned: 4,
    joinedAt: '2026-01-16T09:00:00.000Z'
  },
  {
    id: 'u-012',
    name: 'Yuki Tanaka',
    major: 'Software Engineering',
    bio: 'Backend, mostly Go. Learning to cook so I stop spending my loan on takeaway.',
    offers: [
      ['Go', 'tech', 'expert', 'Concurrency, HTTP services, and testing that actually helps.'],
      ['Databases', 'tech', 'intermediate', 'SQL, indexing, and why your query is slow.']
    ],
    wants: [
      ['Baking', 'cooking', 'beginner', 'Bread specifically.'],
      ['Japanese', 'languages', 'intermediate', 'Heritage speaker, cannot read well.']
    ],
    availability: AVAIL.weekend,
    hoursTaught: 21,
    hoursLearned: 10,
    joinedAt: '2026-02-14T09:00:00.000Z'
  },
  {
    id: 'u-013',
    name: 'Elena Petrova',
    major: 'Fine Art',
    bio: 'Oils and charcoal. I run a life drawing group on Thursdays, all levels.',
    offers: [
      ['Drawing', 'arts', 'expert', 'Observational drawing, proportion, and getting over the blank page.'],
      ['Oil Painting', 'arts', 'intermediate', 'Colour mixing and underpainting.']
    ],
    wants: [
      ['Running Coaching', 'fitness', 'beginner', 'Studio life is sedentary.'],
      ['Go', 'tech', 'beginner', 'Curious whether I can build my own portfolio site.']
    ],
    availability: AVAIL.flexible,
    hoursTaught: 17,
    hoursLearned: 5,
    joinedAt: '2026-02-21T09:00:00.000Z'
  },
  {
    id: 'u-014',
    name: 'Oliver Grant',
    major: 'Economics',
    bio: 'Debating society, terrible at anything involving my hands.',
    offers: [
      ['Econometrics', 'academics', 'expert', 'Panel data and instrumental variables without the panic.'],
      ['Public Speaking', 'academics', 'intermediate', 'Structure, delivery, and handling questions.']
    ],
    wants: [
      ['Knife Skills', 'cooking', 'beginner', 'I have cut myself twice this month.'],
      ['Piano', 'music', 'beginner', 'Always wanted to.']
    ],
    availability: AVAIL.mornings,
    hoursTaught: 13,
    hoursLearned: 7,
    joinedAt: '2026-03-04T09:00:00.000Z'
  },
  {
    id: 'u-015',
    name: 'Fatima Al-Sayed',
    major: 'Architecture',
    bio: 'Rhino, Revit, and a lot of very small foam models.',
    offers: [
      ['CAD Modelling', 'tech', 'expert', 'Rhino and Revit, from massing to construction detail.'],
      ['Arabic', 'languages', 'expert', 'Modern Standard and Levantine dialect.']
    ],
    wants: [
      ['Drawing', 'arts', 'intermediate', 'My hand drawing has atrophied since first year.'],
      ['Yoga', 'fitness', 'beginner', 'Studio all-nighters are destroying my posture.']
    ],
    availability: AVAIL.weekdayEve,
    hoursTaught: 20,
    hoursLearned: 9,
    joinedAt: '2026-01-31T09:00:00.000Z'
  },
  {
    id: 'u-016',
    name: 'Ben Carter',
    major: 'Sports Science',
    bio: 'Strength and conditioning. Will not let you skip the warm-up.',
    offers: [
      ['Strength Training', 'fitness', 'expert', 'Programming, form checks, and progressive overload explained properly.'],
      ['Nutrition Basics', 'fitness', 'intermediate', 'Practical, not faddy.']
    ],
    wants: [
      ['Econometrics', 'academics', 'beginner', 'My stats module is brutal.'],
      ['Sound Design', 'music', 'beginner', 'Making playlists for classes, badly.']
    ],
    availability: AVAIL.mornings,
    hoursTaught: 26,
    hoursLearned: 3,
    joinedAt: '2026-01-23T09:00:00.000Z'
  },
  {
    id: 'u-017',
    name: 'Nadia Hassan',
    major: 'Chemistry',
    bio: 'Organic synthesis by day. Learning to DJ by night, badly, in a shared flat.',
    offers: [
      ['Organic Chemistry', 'academics', 'expert', 'Mechanisms and how to actually revise them.'],
      ['Lab Technique', 'academics', 'intermediate', 'For anyone dreading their first practical.']
    ],
    wants: [
      ['Sound Design', 'music', 'beginner', 'Mixing and transitions.'],
      ['Strength Training', 'fitness', 'beginner', 'Never been in a gym.']
    ],
    availability: AVAIL.lunch,
    hoursTaught: 23,
    hoursLearned: 6,
    joinedAt: '2026-02-08T09:00:00.000Z'
  },
  {
    id: 'u-018',
    name: 'Lucas Ferreira',
    major: 'Game Design',
    bio: 'Unity, pixel art, and three unfinished roguelikes.',
    offers: [
      ['Unity', 'tech', 'expert', 'C# scripting, scenes, and shipping a small game jam entry.'],
      ['Pixel Art', 'arts', 'intermediate', 'Sprites, palettes, and animation frames.']
    ],
    wants: [
      ['Organic Chemistry', 'academics', 'beginner', 'Elective I very much regret.'],
      ['Public Speaking', 'academics', 'beginner', 'I have to pitch my final project.']
    ],
    availability: AVAIL.flexible,
    hoursTaught: 11,
    hoursLearned: 14,
    joinedAt: '2026-03-08T09:00:00.000Z'
  },
  {
    id: 'u-019',
    name: 'Grace Mwangi',
    major: 'Law',
    bio: 'Mooting, contract law, and a side habit of watercolour.',
    offers: [
      ['Legal Writing', 'academics', 'expert', 'Structure, citation, and arguing in writing.'],
      ['Public Speaking', 'academics', 'expert', 'Mooting-grade advocacy.']
    ],
    wants: [
      ['Pixel Art', 'arts', 'beginner', 'A hobby that is not reading.'],
      ['Databases', 'tech', 'beginner', 'Legal tech is where this is all going.']
    ],
    availability: AVAIL.weekdayEve,
    hoursTaught: 18,
    hoursLearned: 4,
    joinedAt: '2026-02-17T09:00:00.000Z'
  },
  {
    id: 'u-020',
    name: 'Ines Duarte',
    major: 'Psychology',
    bio: 'Research methods TA. Secretly the person who fixes everyone SPSS.',
    offers: [
      ['SPSS & Research Methods', 'academics', 'expert', 'Study design, analysis, and writing it up.'],
      ['Portuguese', 'languages', 'expert', 'European Portuguese, native.']
    ],
    wants: [
      ['Unity', 'tech', 'beginner', 'Want to build experiment stimuli myself.'],
      ['Oil Painting', 'arts', 'beginner', 'Pure escapism.']
    ],
    availability: AVAIL.weekend,
    hoursTaught: 25,
    hoursLearned: 8,
    joinedAt: '2026-01-27T09:00:00.000Z'
  },
  {
    id: 'u-021',
    name: 'Kwame Asante',
    major: 'Electrical Engineering',
    bio: 'Embedded systems, soldering irons, and a drawer of dead microcontrollers.',
    offers: [
      ['Embedded C', 'tech', 'expert', 'Microcontrollers, interrupts, and debugging without a debugger.'],
      ['Soldering', 'tech', 'intermediate', 'Through-hole and basic surface mount.']
    ],
    wants: [
      ['Legal Writing', 'academics', 'beginner', 'Patent applications, eventually.'],
      ['Nutrition Basics', 'fitness', 'beginner', 'Lab hours have wrecked my eating.']
    ],
    availability: AVAIL.mornings,
    hoursTaught: 12,
    hoursLearned: 5,
    joinedAt: '2026-03-11T09:00:00.000Z'
  },
  {
    id: 'u-022',
    name: 'Sarah Liu',
    major: 'Business Analytics',
    bio: 'Excel to the point of concern. Learning to draw to use the other half of my brain.',
    offers: [
      ['Excel & Modelling', 'academics', 'expert', 'Financial models that do not break when someone else opens them.'],
      ['Mandarin', 'languages', 'expert', 'Native speaker, patient with tones.']
    ],
    wants: [
      ['Drawing', 'arts', 'beginner', 'Absolute beginner.'],
      ['Embedded C', 'tech', 'beginner', 'Curious about hardware.']
    ],
    availability: AVAIL.lunch,
    hoursTaught: 15,
    hoursLearned: 6,
    joinedAt: '2026-02-12T09:00:00.000Z'
  },
  {
    id: 'u-023',
    name: 'Tom Bradshaw',
    major: 'History',
    bio: 'Archive rat. Also the person who fixes everyone bike.',
    campus: 'Riverside College',
    offers: [
      ['Essay Writing', 'academics', 'expert', 'Argument, evidence, and cutting your word count.'],
      ['Bike Maintenance', 'fitness', 'intermediate', 'Punctures, brakes, and gear indexing.']
    ],
    wants: [
      ['Mandarin', 'languages', 'beginner', 'For a research trip.'],
      ['Excel & Modelling', 'academics', 'beginner', 'Digital humanities, apparently.']
    ],
    availability: AVAIL.flexible,
    hoursTaught: 9,
    hoursLearned: 11,
    joinedAt: '2026-03-15T09:00:00.000Z'
  },
  {
    id: 'u-024',
    name: 'Amara Nwosu',
    major: 'Public Health',
    bio: 'Community health research. Runs the campus food co-op.',
    campus: 'Riverside College',
    offers: [
      ['Epidemiology Basics', 'academics', 'intermediate', 'Study design and reading a paper critically.'],
      ['Nutrition Basics', 'fitness', 'expert', 'Evidence-based, no supplements involved.']
    ],
    wants: [
      ['SPSS & Research Methods', 'academics', 'intermediate', 'Levelling up my analysis.'],
      ['Soldering', 'tech', 'beginner', 'Repair cafe volunteering.']
    ],
    availability: AVAIL.weekend,
    hoursTaught: 10,
    hoursLearned: 9,
    joinedAt: '2026-03-19T09:00:00.000Z'
  },
  {
    id: 'u-025',
    name: 'Jamie Roth',
    major: 'Undeclared',
    bio: 'First year, still figuring it out. Will try anything once.',
    offers: [['Chess', 'academics', 'intermediate', 'Openings and not hanging your queen.']],
    wants: [
      ['Flutter Development', 'tech', 'beginner', 'Heard it is a good place to start.'],
      ['Acoustic Guitar', 'music', 'beginner', 'Classic first-year ambition.']
    ],
    availability: AVAIL.weekdayEve,
    hoursTaught: 2,
    hoursLearned: 3,
    joinedAt: '2026-08-28T09:00:00.000Z',
    status: 'active'
  },
  {
    id: 'u-026',
    name: 'Victor Salt',
    major: 'Marketing',
    bio: 'Growth hacker. DM me about my course.',
    offers: [['Social Media Growth', 'academics', 'expert', 'Guaranteed results. Ask me how.']],
    wants: [['Python', 'tech', 'beginner', 'automation']],
    availability: AVAIL.flexible,
    hoursTaught: 1,
    hoursLearned: 0,
    joinedAt: '2026-08-30T09:00:00.000Z',
    status: 'suspended'
  }
];

function toSkill(seed: SkillSeed, ownerId: string, index: number, isOffering: boolean): Skill {
  return {
    id: `${ownerId}-${isOffering ? 'o' : 'w'}${index}`,
    title: seed[0],
    category: seed[1],
    level: seed[2],
    description: seed[3],
    isOffering
  };
}

function slugEmail(name: string, id: string): string {
  const ascii = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z\s]/g, '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const local = ascii.length ? ascii.join('.') : id;
  return `${local}@northgate.ac.uk`;
}

/**
 * Users WITHOUT derived reputation fields. store.ts fills in karmaBalance,
 * rating and reviewCount from the ledger and the review set.
 */
export const userSeeds = seeds.map((s, i) => ({
  id: s.id,
  name: s.name,
  email: slugEmail(s.name, s.id),
  phoneNumber: `+44 7700 9000${String(i).padStart(2, '0')}`,
  campus: s.campus ?? CAMPUS,
  major: s.major,
  bio: s.bio,
  avatarUrl: '',
  hoursTaught: s.hoursTaught,
  hoursLearned: s.hoursLearned,
  skillsOffered: s.offers.map((o, idx) => toSkill(o, s.id, idx, true)),
  skillsWanted: s.wants.map((w, idx) => toSkill(w, s.id, idx, false)),
  availability: s.availability,
  notificationSettings: {
    all: true,
    sessionReminders: true,
    karmaAlerts: true,
    swapRequests: true,
    emailDigest: false,
    smsAlerts: false
  },
  status: s.status ?? ('active' as const),
  joinedAt: s.joinedAt
}));

export const CURRENT_USER_ID = 'u-me';
