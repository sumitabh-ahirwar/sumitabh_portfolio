// Single source of truth for personal details and links.
// Every value here comes from the resume (public/resume/Sumitabh_Ahirwar.pdf).
// Edit this file to update contact details or links across the whole site.

export const profile = {
  name: 'Sumitabh Ahirwar',
  firstName: 'Sumitabh',
  lastName: 'Ahirwar',
  monogram: 'SA',
  label: 'Computer Science Engineer · AI & Software Systems',
  roles: ['AI Engineer', 'Software Developer', 'Full-Stack Developer', 'Competitive Programmer'],
  headline: ['Building intelligent systems.', 'Engineering what’s next.'],
  summary:
    'I build AI-powered applications, distributed ML systems, and full-stack products that turn complex ideas into practical software.',
  // Shown in the hero status chip. Keep it factual.
  status: 'B.Tech CSE · MNNIT Allahabad · Class of 2027',
  location: 'Prayagraj, India',
  email: 'sumitabhah7869@gmail.com',
  // href must match the file name in public/resume/ (the build fails if it doesn't).
  // fileName is the name the visitor's download is saved as.
  resume: {
    href: '/resume/Sumitabh_Ahirwar.pdf',
    fileName: 'Sumitabh_Ahirwar_Resume.pdf',
  },
};

// Verified from the hyperlinks embedded in the resume PDF.
export const socials = {
  github: { label: 'GitHub', handle: 'sumitabh-ahirwar', href: 'https://github.com/sumitabh-ahirwar' },
  linkedin: {
    label: 'LinkedIn',
    handle: 'sumitabh-ahirwar',
    href: 'https://www.linkedin.com/in/sumitabh-ahirwar/',
  },
  leetcode: { label: 'LeetCode', handle: 'sumitabh2005', href: 'https://leetcode.com/u/sumitabh2005/' },
  codeforces: { label: 'Codeforces', handle: 'Sumitabh', href: 'https://codeforces.com/profile/Sumitabh' },
  codechef: { label: 'CodeChef', handle: 'sumitabh', href: 'https://www.codechef.com/users/sumitabh' },
};

export const navItems = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'contact', label: 'Contact' },
];

export const education = [
  {
    school: 'Motilal Nehru National Institute of Technology Allahabad',
    short: 'MNNIT Allahabad',
    degree: 'B.Tech, Computer Science and Engineering',
    period: '2023 — 2027',
    metric: { value: '8.30', label: 'CPI', note: 'through 6th semester' },
  },
  {
    school: 'Govt. Excellence Higher Secondary School',
    short: 'Class XII',
    degree: 'Board of Secondary Education, Madhya Pradesh',
    period: '2022',
    metric: { value: '91.2%', label: 'Class XII' },
  },
  {
    school: 'Govt. Excellence Higher Secondary School',
    short: 'Class X',
    degree: 'Board of Secondary Education, Madhya Pradesh',
    period: '2020',
    metric: { value: '96.7%', label: 'Class X' },
  },
];

export const responsibilities = [{ role: 'Member', org: 'Jigyasa Club', period: 'Aug 2023' }];
