export interface Place {
  id: string;
  city: string;
  memoryPhoto: string;
  state: string;
  label: string;
  coordinates: [number, number];
  offset: [number, number];
  lines: string[];
  experience?: string;
}
export const identity = {
  name: 'Shashi',
  fullName: 'Shashi Kant',
  role: 'Full-Stack Developer',
  intro:
    'I build Angular interfaces and Spring Boot APIs, with experience across enterprise applications and Android development.',
  email: 'shkt03@gmail.com',
  resume: 'https://drive.google.com/file/d/1gz7rl4VClDcXqsMiAT00YxTuBKIVeGXk/view?usp=sharing',
};
interface Qualification {
  city: 'Kolkata' | 'Jamshedpur';
  institution: string;
  qualification: string;
  dates: string;
  result: string;
}

export const education: Qualification[] = [
  {
    city: 'Kolkata',
    institution: 'St. Joseph’s College, Kolkata',
    qualification: 'Class 10',
    dates: '2016',
    result: '89%',
  },
  {
    city: 'Kolkata',
    institution: 'St. Lawrence High School, Kolkata',
    qualification: 'Class 12',
    dates: '2018',
    result: '69%',
  },
  {
    city: 'Kolkata',
    institution: 'George College, Kolkata',
    qualification: 'Bachelor of Computer Applications',
    dates: '2018–2021',
    result: '92%',
  },
  {
    city: 'Jamshedpur',
    institution: 'National Institute of Technology, Jamshedpur',
    qualification: 'Master of Computer Applications',
    dates: '2021–2024',
    result: 'CGPA: 8.31',
  },
];

function educationLines(city: Qualification['city']): string[] {
  return education
    .filter((entry) => entry.city === city)
    .map(
      (entry) => `${entry.institution} — ${entry.qualification}, ${entry.dates} — ${entry.result}`,
    );
}

export const journey: Place[] = [
  {
    id: 'gorakhpur',
    memoryPhoto: 'images/gorakhur.jpeg',
    city: 'Gorakhpur',
    state: 'Uttar Pradesh',
    label: 'Roots',
    coordinates: [83.380016, 26.750394],
    offset: [-45, -75],
    lines: ['Born in Gorakhpur, Uttar Pradesh, where I spent most of my summer vacations.'],
  },
  {
    id: 'kolkata',
    memoryPhoto: 'images/kolkata.jpeg',
    city: 'Kolkata',
    state: 'West Bengal',
    label: 'School years & BCA',
    coordinates: [88.369126, 22.569579],
    offset: [95, -25],
    lines: educationLines('Kolkata'),
  },
  {
    id: 'jamshedpur',
    memoryPhoto: 'images/jamshedpur.jpeg',
    city: 'Jamshedpur',
    state: 'Jharkhand',
    label: 'MCA at NIT',
    coordinates: [86.195573, 22.789481],
    offset: [-85, 65],
    lines: educationLines('Jamshedpur'),
  },
  {
    id: 'pune',
    memoryPhoto: 'images/pune.jpeg',
    city: 'Pune',
    state: 'Maharashtra',
    label: 'Android at TCS',
    coordinates: [73.851892, 18.516394],
    offset: [95, 25],
    lines: [
      'Engineer · Android App Developer',
      'September 2024–March 2025',
      'Worked on a Media Widget for in-vehicle infotainment systems on embedded Android.',
    ],
    experience: 'tcs-pune',
  },
  {
    id: 'mumbai',
    memoryPhoto: 'images/mumbai.jpeg',
    city: 'Mumbai',
    state: 'Maharashtra',
    label: 'Full-stack at TCS',
    coordinates: [72.875839, 19.068408],
    offset: [-95, -45],
    lines: [
      'Engineer · Full-Stack Developer',
      'July 2025–Present',
      'Angular interfaces and Spring Boot APIs for a global Business Continuity Planning platform.',
    ],
    experience: 'tcs-mumbai',
  },
];
export interface Experience {
  id: string;
  employer: string;
  location: string;
  role: string;
  title?: string;
  dates: string;
  points: string[];
  tech: string[];
  certificate?: string;
}
export const experience: Experience[] = [
  {
    id: 'tcs-mumbai',
    employer: 'Tata Consultancy Services',
    location: 'Mumbai',
    title: 'Engineer',
    role: 'Full-Stack Developer',
    dates: '28 July 2025–Present',
    points: [
      'Developed and maintained full-stack features for a global, audit-facing Business Continuity Planning (BCP) platform spanning 55 countries.',
      'Built responsive Angular interfaces and Spring Boot REST APIs for managing business continuity plans, drills, risk assessments, and compliance workflows.',
      'Developed interactive dashboards to visualise 40+ policy-defined KRAs across 6 organisational levels, enabling stakeholders to monitor compliance and performance.',
      'Collaborated with database, QA, and business teams to deliver enhancements, troubleshoot production issues, and resolve defects within defined SLAs.',
    ],
    tech: ['Java', 'Spring Boot', 'Angular', 'SQL'],
  },
  {
    id: 'tcs-pune',
    employer: 'Tata Consultancy Services',
    location: 'Pune',
    title: 'Engineer',
    role: 'Android App Developer',
    dates: '13 September 2024–31 March 2025',
    points: [
      'Contributed to automotive software solutions, including a Media Widget feature for in-vehicle infotainment systems.',
      'Worked on user engagement and interaction on embedded Android platforms.',
    ],
    tech: ['Android development'],
  },
  {
    id: 'perform',
    employer: 'Perform Digital Pvt. Ltd.',
    location: 'Remote',
    role: 'Android Developer Intern',
    dates: 'December 2020–January 2021',
    points: [
      'Groupalike: conducted app localization, contributing to 20% user growth.',
      'Optimized layout rendering, fixed memory leaks, and resolved bugs.',
    ],
    tech: ['Java', 'Kotlin', 'LeakCanary', 'GTranslate', 'MVVM', 'XML', 'Android Studio'],
    certificate:
      'https://drive.google.com/file/d/1YojW8B7tmdhq0IlHWtYpXSEZ4EtvaFzO/view?usp=sharing',
  },
];
export const training = '29 August 2024–8 September 2024';
export interface ProjectScreenshot {
  src: string;
  alt: string;
}

export const projects = [
  {
    name: 'NewsDozz',
    tagline: 'Get your daily dose of news.',
    screenshots: [
      { src: 'images/newsdozz/1.jpg', alt: 'NewsDozz welcome screen with its flame logo' },
      { src: 'images/newsdozz/2.jpg', alt: 'Breaking news feed with short article summaries' },
      { src: 'images/newsdozz/3.jpg', alt: 'Technology selected in the news category tabs' },
      { src: 'images/newsdozz/4.jpg', alt: 'Language selection dialog over the news feed' },
      { src: 'images/newsdozz/5.jpg', alt: 'Swipe gesture for bookmarking an article' },
      { src: 'images/newsdozz/6.jpg', alt: 'Bookmarks screen displaying saved news articles' },
    ] satisfies ProjectScreenshot[],
    description:
      'An Android news delivery application that presents articles in concise, one-line summaries using the GNews API.',
    features: [
      'Concise news presentation',
      'User authentication',
      'Bookmarking',
      'Multiple-language support',
    ],
    tech: [
      'Kotlin',
      'Glide',
      'RecyclerView',
      'Volley',
      'JSON API',
      'SharedPreferences',
      'Firebase Authentication',
      'Firestore',
    ],
    url: 'https://github.com/kt-shashi/newsdozz',
  },
  {
    name: 'WordWise',
    tagline: 'Your online wordbook.',
    screenshots: [
      { src: 'images/wordwise/1.png', alt: 'WordWise dictionary lookup interface' },
    ] satisfies ProjectScreenshot[],
    description: 'A responsive web application that retrieves word details using a dictionary API.',
    features: [
      'Word lookup using a dictionary API',
      'Client-side validation',
      'Responsive interface',
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Dictionary API', 'Git'],
    url: 'https://github.com/kt-shashi/word-wise',
  },
];
export const skills = [
  { name: 'Languages', items: ['C', 'C++ — proficient', 'Java', 'SQL', 'Kotlin'] },
  { name: 'Frontend', items: ['Angular', 'HTML, CSS, JavaScript — basic'] },
  { name: 'Backend', items: ['Spring Boot'] },
  { name: 'Android', items: ['Android development', 'XML layouts'] },
  { name: 'Databases & services', items: ['MySQL', 'Firebase'] },
  { name: 'Tools & testing', items: ['Git', 'GitHub', 'Jira', 'Mockito', 'Espresso'] },
  {
    name: 'Computer science fundamentals',
    items: [
      'Data Structures & Algorithms',
      'Object-Oriented Programming',
      'Operating Systems',
      'DBMS',
    ],
  },
];
export const about =
  'I’m Shashi, a full-stack developer at TCS in Mumbai. My work now connects Angular interfaces with Spring Boot APIs, building on earlier experience in Android development. From school and a BCA in Kolkata to an MCA at NIT Jamshedpur, then work in Pune and Mumbai, each place has been part of that journey. Away from software, I make time for games, badminton, and Rubik’s Cubes.';
export const hobbies = [
  {
    name: 'Badminton',
    detail: 'Away from the screen, I enjoy playing badminton.',
    image: 'images/badminton.jpeg',
  },
  {
    name: 'Solving Rubik’s Cubes',
    detail: 'Another kind of problem-solving I enjoy: solving Rubik’s Cubes.',
    image: 'images/rubiks-cube.jpeg',
  },
  {
    name: 'Playing video games',
    detail: 'In-game, I go by DEVTA.',
    image: 'images/gaming.jpeg',
    expandable: true,
  },
];
