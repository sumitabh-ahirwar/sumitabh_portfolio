// Project case studies. Facts come from the resume and from each repository's README.
// To update a project: edit its entry here — cards, case-study views and the
// architecture explorer all read from this file.
//
// links.github / links.live: set to null to hide a button. Only add URLs you have verified.
// screenshots: optional array of { src, alt } (put files in /public/projects/<id>/).
//   When empty, the site shows the coded illustrative preview instead.

export const projects = [
  {
    id: 'researchos',
    number: '01',
    name: 'ResearchOS',
    title: 'AI Research Report Generator',
    tagline: 'A multi-agent research workspace that turns a question into a cited report.',
    summary:
      'An AI research workflow that combines live web research and PDF retrieval to generate structured reports — with every claim traceable to a source and page.',
    tech: ['Python', 'FastAPI', 'LangChain', 'Mistral AI', 'ChromaDB', 'RAG', 'Tavily', 'BeautifulSoup', 'React'],
    accent: 'cyan',
    links: {
      github: 'https://github.com/sumitabh-ahirwar/Researchos',
      live: null,
    },
    screenshots: [],
    caseStudy: {
      modesTitle: 'Research modes',
      problem:
        'General-purpose chat answers are hard to trust for research: sources are vague, and your own documents are rarely part of the context. ResearchOS treats research as a pipeline — plan, gather evidence from the web and/or an uploaded PDF, analyse, write, then check — so every report carries sources you can verify.',
      modes: [
        { name: 'Web', body: 'Live search with Tavily plus page scraping.' },
        { name: 'PDF', body: 'Retrieval-augmented generation over an uploaded document.' },
        { name: 'Hybrid', body: 'Both evidence sources merged into one context.' },
      ],
      implementation: [
        'Multi-agent pipeline: Query Planner, Web Search, PDF Retriever, Analyzer, Report Writer, Citation Checker and Critic.',
        'Web research via two tool-calling LangChain agents — a Search Agent (Tavily) and a Reader Agent that scrapes pages with BeautifulSoup.',
        'PDF RAG: PyPDFLoader (one document per page) → recursive chunking (1000 chars, 200 overlap) → Mistral embeddings → ChromaDB.',
        'Source- and page-level citation tracking: retrieved chunks keep filename and page metadata, surfaced as citation cards.',
        'React UI with PDF upload, progress tracking, Markdown report rendering, copy/download and API error handling.',
      ],
      challenges: [
        {
          title: 'Grounding over fluency',
          body: 'When PDF retrieval returns nothing relevant, a guard returns a fixed “not enough information” response instead of letting the model improvise. The writer prompt requires citations in the form [Source N, filename, page X].',
        },
        {
          title: 'LLM calls only where they add value',
          body: 'The planner, analyzer and citation checker are deterministic functions. Routing stays predictable and each run makes fewer model calls; the LLM is reserved for searching, reading, writing and critique.',
        },
        {
          title: 'Isolation inside one vector store',
          body: 'All documents share a single Chroma collection; every query is filtered by document_id (k = 8), and chunk ids are deterministic so re-ingesting a file overwrites rather than duplicates.',
        },
        {
          title: 'Synchronous by design',
          body: 'The pipeline runs in a thread pool so FastAPI keeps serving other requests. The trade-off: no streaming — progress steps are reported once the run completes.',
        },
      ],
      outcomes: [
        { value: '7', label: 'pipeline agents', note: 'planner → critic' },
        { value: '3', label: 'research modes', note: 'web · PDF · hybrid' },
        { value: 'Page', label: 'level citations', note: 'source + page metadata' },
      ],
      stack: ['Python', 'FastAPI', 'LangChain', 'Mistral AI', 'Mistral embeddings', 'ChromaDB', 'Tavily', 'BeautifulSoup', 'PyPDFLoader', 'React', 'Vite', 'MongoDB Atlas'],
    },
    architecture: {
      title: 'ResearchOS agent pipeline',
      caption: 'Hybrid mode shown — both retrieval branches run in parallel. Web mode uses only the upper branch.',
      legend: [
        { kind: 'llm', label: 'LLM call' },
        { kind: 'fn', label: 'Deterministic step' },
        { kind: 'io', label: 'Input / output' },
      ],
      nodes: [
        { id: 'query', label: ['User', 'Query'], col: 0, row: 1, kind: 'io', desc: 'A research question plus a mode — Web, PDF or Hybrid. PDF and Hybrid modes reference an uploaded document by id.' },
        { id: 'planner', label: ['Query', 'Planner'], col: 1, row: 1, kind: 'fn', desc: 'A deterministic router: from the mode it decides whether to run web research, PDF retrieval, or both. No model call, so routing stays predictable.' },
        { id: 'web', label: ['Web', 'Search'], col: 2, row: 0, kind: 'llm', desc: 'Two tool-calling agents: a Search Agent (Tavily, top results) and a Reader Agent that scrapes chosen pages with BeautifulSoup. A dead link degrades the context instead of crashing the run.' },
        { id: 'pdf', label: ['PDF', 'Retriever'], col: 2, row: 2, kind: 'fn', desc: 'Semantic search over the uploaded PDF in ChromaDB using Mistral embeddings (k = 8), filtered by document_id. Returns passages with filename and page metadata.' },
        { id: 'analyzer', label: ['Analyzer'], col: 3, row: 1, kind: 'fn', desc: 'Merges web and PDF evidence into one labelled context block for the writer.' },
        { id: 'writer', label: ['Report', 'Writer'], col: 4, row: 1, kind: 'llm', desc: 'A Mistral LLM chain that drafts a structured Markdown report, citing evidence as [Source N, filename, page X]. If retrieval finds nothing, a guard returns “not enough information” instead.' },
        { id: 'citation', label: ['Citation', 'Checker'], col: 5, row: 1, kind: 'fn', desc: 'Attaches the source list — number, filename, page and a short preview — which becomes the citation cards in the UI.' },
        { id: 'critic', label: ['Critic'], col: 6, row: 1, kind: 'llm', desc: 'A second LLM chain reviews the draft and returns feedback alongside the report.' },
        { id: 'report', label: ['Final', 'Report'], col: 7, row: 1, kind: 'io', desc: 'Rendered as Markdown in the React UI, with source cards and copy / download.' },
      ],
      edges: [
        ['query', 'planner'], ['planner', 'web'], ['planner', 'pdf'], ['web', 'analyzer'], ['pdf', 'analyzer'],
        ['analyzer', 'writer'], ['writer', 'citation'], ['citation', 'critic'], ['critic', 'report'],
      ],
    },
  },
  {
    id: 'data2model',
    number: '02',
    name: 'Data2Model',
    title: 'Distributed Deep Learning Platform',
    tagline: 'Distributed AutoML: a CSV and a plain-English goal in, a trained PyTorch model out.',
    summary:
      'A horizontally scalable ML pipeline with automated hyperparameter tuning and monitoring — built to train reliably on 512 MB cloud instances.',
    tech: ['Python', 'FastAPI', 'Celery', 'Redis', 'PyTorch', 'Optuna', 'Gemini API', 'Streamlit', 'MongoDB Atlas'],
    accent: 'blue',
    links: {
      github: 'https://github.com/sumitabh-ahirwar/Data2Model',
      live: null,
    },
    screenshots: [],
    caseStudy: {
      modesTitle: 'Workflow',
      problem:
        'Training a good neural network means choosing an architecture and hyperparameters — and on zero-cost cloud instances, doing it inside 512 MB of RAM. Data2Model automates the search and distributes the work across workers, so a user can go from a dataset and a described goal to a downloadable model.',
      modes: [
        { name: 'Submit', body: 'Upload a CSV, pick the target column, describe the use case.' },
        { name: 'Train', body: 'A queued job runs constraint generation, Optuna search and final training.' },
        { name: 'Ship', body: 'Download weights + config as a ZIP, or run predictions on new data.' },
      ],
      implementation: [
        'FastAPI backend with JWT auth; training jobs are queued to Celery workers through Redis so the API never trains in-process.',
        'Fault-tolerant, multi-node worker architecture designed for restrictive 512 MB cloud memory limits.',
        'PyTorch memory throttling and parallel execution — reducing training time by up to 50%.',
        'Gemini-powered adaptive constraint engine: generates dataset-specific neural-network bounds to help prevent out-of-memory crashes.',
        'Optuna search over layer sizes, activations, optimizer, learning rate, dropout and regularization.',
        'React dashboard (Streamlit kept as an alternate client) synchronised with MongoDB Atlas for job state and logs, with external-API fallbacks and scheduled keep-alive jobs.',
      ],
      challenges: [
        {
          title: 'Training inside 512 MB',
          body: 'Free-tier instances terminate processes that exceed memory. Throttling PyTorch memory use and splitting work across workers keeps each process inside the limit.',
        },
        {
          title: 'Preventing OOM before it happens',
          body: 'Instead of discovering memory limits by crashing, the Gemini constraint engine proposes dataset-specific bounds on network size before Optuna starts searching.',
        },
        {
          title: 'Keeping the API responsive',
          body: 'Long-running training is pushed to a Redis-backed Celery queue. The API only records the job, enqueues it and serves status, logs and downloads.',
        },
        {
          title: 'Reliability on zero-cost infrastructure',
          body: 'Job status and logs live in MongoDB Atlas, not in any single worker. External API calls have fallbacks, and scheduled keep-alive jobs stop free instances from sleeping.',
        },
      ],
      outcomes: [
        { value: '50%', label: 'shorter training', note: 'up to — throttling + parallel execution' },
        { value: '512', label: 'MB per worker', note: 'design memory constraint' },
        { value: 'N', label: 'horizontal workers', note: 'Celery + Redis broker' },
      ],
      stack: ['Python', 'FastAPI', 'Celery', 'Redis', 'PyTorch', 'Optuna', 'Scikit-learn', 'Pandas', 'NumPy', 'Gemini API', 'React', 'Streamlit', 'MongoDB Atlas', 'Cloudinary'],
    },
    architecture: {
      title: 'Data2Model distributed architecture',
      caption: 'Architectural illustration of how jobs are queued and processed — not a live trace.',
      legend: [
        { kind: 'io', label: 'Client / results' },
        { kind: 'fn', label: 'Service' },
        { kind: 'store', label: 'Queue / storage' },
        { kind: 'llm', label: 'ML / AI stage' },
      ],
      nodes: [
        { id: 'ui', label: ['React /', 'Streamlit UI'], col: 0, row: 1, kind: 'io', desc: 'React dashboard (Streamlit kept as an alternate client): upload a CSV, choose the target column, describe the use case and follow training logs.' },
        { id: 'api', label: ['FastAPI'], col: 1, row: 1, kind: 'fn', desc: 'JWT-authenticated API: stores submissions, enqueues training, and serves logs, ZIP downloads and predictions. It never trains in-process.' },
        { id: 'storage', label: ['Cloudinary'], col: 1, row: 0, kind: 'store', desc: 'Holds uploaded datasets so any worker can fetch them.' },
        { id: 'mongo', label: ['MongoDB', 'Atlas'], col: 1, row: 2, kind: 'store', desc: 'Users, submissions, status, logs and model artifacts — shared state the dashboard reads.' },
        { id: 'redis', label: ['Redis', 'Queue'], col: 2, row: 1, kind: 'store', desc: 'Message broker between the API and workers. Training jobs wait here until a worker picks them up.' },
        { id: 'w1', label: ['Celery', 'Worker 1'], col: 3, row: 0, kind: 'fn', desc: 'Workers are independent processes that pull jobs from Redis — add more to scale horizontally. Each is designed to run within a 512 MB memory limit.' },
        { id: 'w2', label: ['Celery', 'Worker 2'], col: 3, row: 1, kind: 'fn', desc: 'PyTorch memory throttling and parallel execution keep training inside the limit; training time dropped by up to 50%.' },
        { id: 'w3', label: ['Celery', 'Worker N'], col: 3, row: 2, kind: 'fn', desc: 'Because state lives in MongoDB rather than in a worker, a job is not tied to one machine.' },
        { id: 'gemini', label: ['Gemini', 'Constraints'], col: 4, row: 1, kind: 'llm', desc: 'Gemini turns the dataset profile and the described use case into structured constraints — dataset-specific bounds intended to prevent out-of-memory crashes.' },
        { id: 'optuna', label: ['Optuna', 'Tuning'], col: 5, row: 1, kind: 'llm', desc: 'Searches architecture and hyperparameters within those bounds: layer sizes, activations, optimizer, learning rate, dropout, regularization.' },
        { id: 'torch', label: ['PyTorch', 'Training'], col: 6, row: 1, kind: 'llm', desc: 'Trains the final MLP with the best configuration and evaluates it.' },
        { id: 'results', label: ['Monitoring', '& Results'], col: 7, row: 1, kind: 'io', desc: 'Weights (.pth) and config (JSON) are saved and packaged as a ZIP; logs and status are visible in the dashboard.' },
      ],
      edges: [
        ['ui', 'api'], ['api', 'storage'], ['api', 'mongo'], ['api', 'redis'],
        ['redis', 'w1'], ['redis', 'w2'], ['redis', 'w3'],
        ['w1', 'gemini'], ['w2', 'gemini'], ['w3', 'gemini'],
        ['gemini', 'optuna'], ['optuna', 'torch'], ['torch', 'results'],
      ],
    },
  },
  {
    id: 'jobportal',
    number: '03',
    name: 'JobPortal',
    title: 'AI-Driven Recruitment & Resume Analysis',
    tagline: 'A MERN recruitment platform with AI resume analysis and role-aware dashboards.',
    summary:
      'A full-stack recruitment platform with AI-powered resume parsing and candidate skill scoring, JWT authentication and role-based access for applicants, recruiters and admins.',
    tech: ['React', 'Vite', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Tailwind CSS', 'Gemini API', 'JWT', 'Cloudinary', 'Redux Toolkit'],
    accent: 'violet',
    links: {
      github: 'https://github.com/sumitabh-ahirwar/jobPortal',
      live: 'https://jobportal-y0dn.onrender.com/',
    },
    liveNote: 'Hosted on a free Render instance — the first load can take a little while to wake up.',
    screenshots: [],
    caseStudy: {
      modesTitle: 'Roles',
      problem:
        'Recruiters spend time writing job descriptions and screening resumes; applicants want a clear view of open roles and where their applications stand. JobPortal puts both sides on one platform, with role-aware access and AI assistance where it saves the most time.',
      modes: [
        { name: 'Applicant', body: 'Browse and filter jobs, apply, and track applications.' },
        { name: 'Recruiter', body: 'Set up companies, post jobs, review applicants.' },
        { name: 'Admin', body: 'Role-protected management views.' },
      ],
      implementation: [
        'MERN stack: React (Vite) + Tailwind CSS frontend, Node.js / Express.js REST API, MongoDB.',
        'Gemini-powered resume parsing with candidate skill scoring.',
        'Gemini generates professional job descriptions from recruiter inputs.',
        'JWT authentication with role-based access control for applicants, recruiters and administrators.',
        'Cloudinary for file uploads; Redux Toolkit for application state.',
      ],
      challenges: [
        {
          title: 'One API, three roles',
          body: 'Authorization lives in Express middleware: every protected route verifies the JWT and the caller’s role before a controller runs, so access rules aren’t scattered across the UI.',
        },
        {
          title: 'AI on the server side',
          body: 'Gemini calls go through dedicated backend routes and controllers, keeping the API key off the client and the prompts in one place.',
        },
        {
          title: 'Files without bloating the database',
          body: 'Uploads are handled by Multer and stored on Cloudinary, keeping binary files out of MongoDB.',
        },
        {
          title: 'Predictable client state',
          body: 'Redux Toolkit holds auth, jobs, companies and applications, so views for different roles read from the same store.',
        },
      ],
      outcomes: [
        { value: '3', label: 'access roles', note: 'applicant · recruiter · admin' },
        { value: '2', label: 'Gemini features', note: 'resume scoring · JD generation' },
        { value: 'Live', label: 'deployed demo', note: 'Render' },
      ],
      stack: ['React', 'Vite', 'Redux Toolkit', 'Tailwind CSS', 'Node.js', 'Express.js', 'MongoDB', 'JWT', 'Multer', 'Cloudinary', 'Gemini API'],
    },
    architecture: {
      title: 'JobPortal application architecture',
      caption: 'Where each integration sits in the request path.',
      legend: [
        { kind: 'io', label: 'Client' },
        { kind: 'fn', label: 'Server layer' },
        { kind: 'llm', label: 'AI integration' },
        { kind: 'store', label: 'Storage' },
      ],
      nodes: [
        { id: 'client', label: ['React', 'Frontend'], col: 0, row: 1, kind: 'io', desc: 'React (Vite) + Tailwind CSS with Redux Toolkit for state. Separate applicant and recruiter/admin views.' },
        { id: 'api', label: ['Express', 'API'], col: 1, row: 1, kind: 'fn', desc: 'Express.js REST API organised as routes → controllers for users, companies, jobs, applications and AI.' },
        { id: 'auth', label: ['Auth &', 'Roles'], col: 2, row: 1, kind: 'fn', desc: 'JWT authentication middleware with role-based access control for applicants, recruiters and admins.' },
        { id: 'logic', label: ['Business', 'Logic'], col: 3, row: 1, kind: 'fn', desc: 'Controllers for job posting, company setup, applications and applicant tracking.' },
        { id: 'gemini', label: ['Gemini', 'API'], col: 3, row: 0, kind: 'llm', desc: 'Resume parsing with candidate skill scoring, and job-description generation from recruiter inputs — called only from the server.' },
        { id: 'cloud', label: ['Cloudinary'], col: 3, row: 2, kind: 'store', desc: 'File uploads (via Multer) are stored on Cloudinary.' },
        { id: 'mongo', label: ['MongoDB'], col: 4, row: 1, kind: 'store', desc: 'Models for users, companies, jobs and applications.' },
      ],
      edges: [
        ['client', 'api'], ['api', 'auth'], ['auth', 'logic'], ['logic', 'gemini'], ['logic', 'cloud'], ['logic', 'mongo'],
      ],
    },
  },
];

export const getProject = (id) => projects.find((p) => p.id === id);
