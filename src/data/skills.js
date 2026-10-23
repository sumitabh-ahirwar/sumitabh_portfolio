// Skills from the resume's "Technical Skills" section.
// `uses` links a skill to projects (ids from projects.js) or 'cp' (competitive programming).
// No proficiency ratings by design.

export const skillFilters = [
  { id: 'all', label: 'All' },
  { id: 'researchos', label: 'ResearchOS' },
  { id: 'data2model', label: 'Data2Model' },
  { id: 'jobportal', label: 'JobPortal' },
  { id: 'cp', label: 'Competitive programming' },
];

export const skillGroups = [
  {
    id: 'languages',
    index: '01',
    title: 'Languages',
    blurb: 'Everyday tools for systems, ML and the web.',
    skills: [
      { name: 'C++', uses: ['cp'] },
      { name: 'Python', uses: ['researchos', 'data2model'] },
      { name: 'JavaScript', uses: ['jobportal', 'researchos', 'data2model'] },
    ],
  },
  {
    id: 'ai',
    index: '02',
    title: 'AI, ML & GenAI',
    blurb: 'From training loops to retrieval and agents.',
    skills: [
      { name: 'PyTorch', uses: ['data2model'] },
      { name: 'TensorFlow', uses: [] },
      { name: 'Scikit-learn', uses: ['data2model'] },
      { name: 'NumPy', uses: ['data2model'] },
      { name: 'Pandas', uses: ['data2model'] },
      { name: 'LangChain', uses: ['researchos'] },
      { name: 'RAG', uses: ['researchos'] },
      { name: 'AI agents', uses: ['researchos'] },
      { name: 'Embeddings & vector DBs', uses: ['researchos'] },
    ],
  },
  {
    id: 'web',
    index: '03',
    title: 'Web & Databases',
    blurb: 'APIs, interfaces and the data underneath.',
    skills: [
      { name: 'React.js', uses: ['researchos', 'data2model', 'jobportal'] },
      { name: 'Node.js', uses: ['jobportal'] },
      { name: 'Express.js', uses: ['jobportal'] },
      { name: 'FastAPI', uses: ['researchos', 'data2model'] },
      { name: 'REST APIs', uses: ['researchos', 'data2model', 'jobportal'] },
      { name: 'MongoDB', uses: ['researchos', 'data2model', 'jobportal'] },
      { name: 'MySQL', uses: [] },
    ],
  },
  {
    id: 'cs',
    index: '04',
    title: 'CS Fundamentals',
    blurb: 'The foundations behind the systems.',
    skills: [
      { name: 'Data Structures & Algorithms', uses: ['cp'] },
      { name: 'Object-Oriented Programming', uses: [] },
      { name: 'Operating Systems', uses: [] },
      { name: 'DBMS', uses: [] },
      { name: 'Computer Networks', uses: [] },
      { name: 'Deep Learning', uses: ['data2model'] },
    ],
  },
  {
    id: 'tools',
    index: '05',
    title: 'Developer Tools',
    blurb: 'Where the work happens.',
    skills: [
      { name: 'Git', uses: ['researchos', 'data2model', 'jobportal'] },
      { name: 'GitHub', uses: ['researchos', 'data2model', 'jobportal'] },
      { name: 'VS Code', uses: [] },
      { name: 'Google Colab', uses: [] },
    ],
  },
];
