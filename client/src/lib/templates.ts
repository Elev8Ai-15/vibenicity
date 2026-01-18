export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'api' | 'game' | 'utility';
  icon: string;
  prompt: string;
  tags: string[];
}

export const projectTemplates: ProjectTemplate[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // WEB APPS (10 templates)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'Modern marketing landing page with hero, features, pricing, and CTA sections',
    category: 'web',
    icon: '🚀',
    prompt: 'Build a modern landing page with a hero section, feature highlights, pricing table, testimonials, and a call-to-action footer. Make it responsive and visually appealing with smooth animations.',
    tags: ['marketing', 'responsive', 'animation']
  },
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    description: 'Data visualization dashboard with charts, tables, and analytics widgets',
    category: 'web',
    icon: '📊',
    prompt: 'Create an admin dashboard with a sidebar navigation, data visualization charts (line, bar, pie), stats cards, a data table with sorting and filtering, and a responsive layout.',
    tags: ['analytics', 'charts', 'data']
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    description: 'Product catalog with cart, checkout flow, and product details',
    category: 'web',
    icon: '🛒',
    prompt: 'Build an e-commerce storefront with product grid, product detail pages, shopping cart, checkout form, and order confirmation. Include filters, search, and responsive design.',
    tags: ['shopping', 'payments', 'catalog']
  },
  {
    id: 'social-feed',
    name: 'Social Feed',
    description: 'Social media style feed with posts, likes, comments, and user profiles',
    category: 'web',
    icon: '💬',
    prompt: 'Create a social media feed with post cards, like/comment functionality, user avatars, infinite scroll simulation, and a compose post modal. Make it mobile-friendly.',
    tags: ['social', 'interactive', 'feed']
  },
  {
    id: 'portfolio',
    name: 'Portfolio Site',
    description: 'Personal portfolio showcasing projects, skills, and contact info',
    category: 'web',
    icon: '🎨',
    prompt: 'Build a portfolio website with an about section, project showcase gallery, skills/tech stack display, contact form, and smooth scroll navigation. Add subtle animations.',
    tags: ['personal', 'showcase', 'creative']
  },
  {
    id: 'chat-app',
    name: 'Chat Interface',
    description: 'Real-time chat UI with message threads and user presence',
    category: 'web',
    icon: '💭',
    prompt: 'Build a chat application UI with conversation list, message thread view, typing indicators, read receipts, emoji picker, and file attachment preview. Make it responsive.',
    tags: ['messaging', 'realtime', 'communication']
  },
  {
    id: 'blog',
    name: 'Blog Platform',
    description: 'Content publishing platform with articles, categories, and comments',
    category: 'web',
    icon: '📝',
    prompt: 'Create a blog platform with article listing, article detail pages, category filtering, author profiles, comment sections, and a clean reading experience. Add share buttons.',
    tags: ['content', 'publishing', 'articles']
  },
  {
    id: 'booking-system',
    name: 'Booking System',
    description: 'Appointment scheduling with calendar view and time slots',
    category: 'web',
    icon: '📅',
    prompt: 'Build an appointment booking system with a calendar view, available time slots, booking form, confirmation page, and booking management dashboard. Include email confirmation mockup.',
    tags: ['scheduling', 'calendar', 'appointments']
  },
  {
    id: 'learning-platform',
    name: 'Learning Platform',
    description: 'Online course platform with lessons, progress tracking, and quizzes',
    category: 'web',
    icon: '🎓',
    prompt: 'Create an e-learning platform with course catalog, lesson viewer with video placeholder, progress tracking, quiz components, and certificate generation mockup.',
    tags: ['education', 'courses', 'learning']
  },
  {
    id: 'job-board',
    name: 'Job Board',
    description: 'Job listing platform with search, filters, and application flow',
    category: 'web',
    icon: '💼',
    prompt: 'Build a job board with job listings, detailed job view, search and filter functionality, company profiles, and job application form. Include salary range filters.',
    tags: ['careers', 'hiring', 'jobs']
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // UTILITY APPS (8 templates)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'todo-app',
    name: 'Task Manager',
    description: 'Productivity app with task lists, categories, and due dates',
    category: 'utility',
    icon: '✅',
    prompt: 'Create a task manager app with task creation, categories/tags, due dates, priority levels, drag-and-drop reordering, and completion tracking. Include dark mode.',
    tags: ['productivity', 'organization', 'tasks']
  },
  {
    id: 'weather-app',
    name: 'Weather App',
    description: 'Weather dashboard with forecasts, location search, and visual conditions',
    category: 'utility',
    icon: '🌤️',
    prompt: 'Build a weather app with current conditions display, 5-day forecast, location search, weather icons/animations, temperature units toggle, and a beautiful gradient background based on conditions.',
    tags: ['weather', 'api', 'location']
  },
  {
    id: 'music-player',
    name: 'Music Player',
    description: 'Audio player with playlist management and playback controls',
    category: 'utility',
    icon: '🎵',
    prompt: 'Create a music player UI with album art display, playback controls (play/pause/skip), progress bar, volume control, playlist view, and shuffle/repeat modes. Use a sleek dark design.',
    tags: ['audio', 'media', 'entertainment']
  },
  {
    id: 'recipe-app',
    name: 'Recipe Book',
    description: 'Cooking recipes with ingredients, steps, and meal planning',
    category: 'utility',
    icon: '🍳',
    prompt: 'Build a recipe app with recipe cards, detailed recipe view with ingredients and steps, search and filter by cuisine/diet, save favorites, and a meal planning calendar view.',
    tags: ['cooking', 'food', 'lifestyle']
  },
  {
    id: 'fitness-tracker',
    name: 'Fitness Tracker',
    description: 'Workout logging with exercise library and progress charts',
    category: 'utility',
    icon: '💪',
    prompt: 'Create a fitness tracking app with workout logging, exercise library, progress charts, personal records, workout history, and goal setting. Include motivational stats.',
    tags: ['health', 'exercise', 'tracking']
  },
  {
    id: 'note-taking',
    name: 'Note Taking App',
    description: 'Rich text notes with folders, tags, and markdown support',
    category: 'utility',
    icon: '📓',
    prompt: 'Build a note-taking app with rich text editor, folder organization, tagging system, search functionality, markdown preview, and dark mode. Include note pinning and archiving.',
    tags: ['notes', 'productivity', 'writing']
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'Personal finance app with budgets, categories, and spending charts',
    category: 'utility',
    icon: '💰',
    prompt: 'Create an expense tracking app with transaction logging, category breakdown, monthly budget setting, spending charts, and recurring expense management. Include export functionality.',
    tags: ['finance', 'budgeting', 'money']
  },
  {
    id: 'password-manager',
    name: 'Password Manager',
    description: 'Secure password vault with generator and category organization',
    category: 'utility',
    icon: '🔐',
    prompt: 'Build a password manager UI with password vault, password generator with strength indicator, category folders, search, and secure notes. Include copy-to-clipboard and reveal toggle.',
    tags: ['security', 'passwords', 'vault']
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // MOBILE APPS (6 templates)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'mobile-banking',
    name: 'Banking App',
    description: 'Mobile banking interface with accounts, transfers, and transaction history',
    category: 'mobile',
    icon: '🏦',
    prompt: 'Create a mobile banking app UI with account overview, recent transactions, money transfer flow, bill pay, and spending insights. Use a clean, trustworthy design with bottom navigation.',
    tags: ['fintech', 'banking', 'payments']
  },
  {
    id: 'food-delivery',
    name: 'Food Delivery App',
    description: 'Restaurant ordering with menu browsing, cart, and order tracking',
    category: 'mobile',
    icon: '🍔',
    prompt: 'Build a food delivery app with restaurant listings, menu browsing, cart management, checkout flow, and order tracking simulation. Include cuisine filters and delivery estimates.',
    tags: ['food', 'delivery', 'ordering']
  },
  {
    id: 'dating-app',
    name: 'Dating App',
    description: 'Match-based dating interface with profiles and messaging',
    category: 'mobile',
    icon: '❤️',
    prompt: 'Create a dating app UI with swipeable profile cards, match screen, messaging interface, and profile editing. Include photo gallery and interest tags. Make it visually appealing.',
    tags: ['social', 'dating', 'matching']
  },
  {
    id: 'ride-sharing',
    name: 'Ride Sharing App',
    description: 'Transportation app with map view, ride booking, and driver matching',
    category: 'mobile',
    icon: '🚗',
    prompt: 'Build a ride-sharing app with map placeholder, pickup/dropoff selection, ride type options, fare estimation, driver matching screen, and ride tracking view.',
    tags: ['transportation', 'maps', 'booking']
  },
  {
    id: 'health-app',
    name: 'Health & Wellness',
    description: 'Health tracking with vitals, medications, and wellness goals',
    category: 'mobile',
    icon: '🩺',
    prompt: 'Create a health tracking app with vital stats dashboard, medication reminders, symptom logging, doctor appointment scheduling, and wellness goal tracking. Include health tips.',
    tags: ['health', 'wellness', 'medical']
  },
  {
    id: 'travel-app',
    name: 'Travel Planner',
    description: 'Trip planning with itineraries, bookings, and destination guides',
    category: 'mobile',
    icon: '✈️',
    prompt: 'Build a travel planning app with trip itinerary builder, flight/hotel booking mockup, destination guides, packing checklist, and expense tracking. Include photo gallery for trips.',
    tags: ['travel', 'planning', 'vacation']
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // API / BACKEND (5 templates)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'rest-api',
    name: 'REST API',
    description: 'RESTful API with CRUD operations, authentication, and documentation',
    category: 'api',
    icon: '🔌',
    prompt: 'Create a REST API with user authentication, CRUD endpoints for a resource (e.g., posts or products), validation, error handling, and API documentation page. Include rate limiting.',
    tags: ['backend', 'rest', 'authentication']
  },
  {
    id: 'api-dashboard',
    name: 'API Dashboard',
    description: 'Developer dashboard with API keys, usage stats, and documentation',
    category: 'api',
    icon: '🔑',
    prompt: 'Build an API developer dashboard with API key management, usage statistics charts, endpoint documentation, webhook configuration, and billing/quota display.',
    tags: ['developer', 'api', 'management']
  },
  {
    id: 'webhook-manager',
    name: 'Webhook Manager',
    description: 'Webhook configuration with event types, logs, and retry handling',
    category: 'api',
    icon: '🪝',
    prompt: 'Create a webhook management interface with endpoint configuration, event type selection, delivery logs, retry settings, and signature verification display. Include test webhook button.',
    tags: ['webhooks', 'events', 'integration']
  },
  {
    id: 'graphql-explorer',
    name: 'GraphQL Explorer',
    description: 'GraphQL playground with schema browser and query builder',
    category: 'api',
    icon: '🔮',
    prompt: 'Build a GraphQL explorer UI with query editor, schema browser, variables panel, response viewer, and query history. Include syntax highlighting and auto-complete simulation.',
    tags: ['graphql', 'developer', 'tools']
  },
  {
    id: 'integration-hub',
    name: 'Integration Hub',
    description: 'Third-party integration management with OAuth and sync status',
    category: 'api',
    icon: '🔗',
    prompt: 'Create an integration hub with available integrations grid, OAuth connection flow mockup, sync status indicators, data mapping interface, and connection logs.',
    tags: ['integrations', 'oauth', 'sync']
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // GAMES (6 templates)
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 'snake-game',
    name: 'Snake Game',
    description: 'Classic snake game with growing snake and score tracking',
    category: 'game',
    icon: '🐍',
    prompt: 'Build a classic snake game with keyboard controls, growing snake mechanics, food spawning, collision detection, score tracking, and game over screen. Include difficulty levels.',
    tags: ['arcade', 'classic', 'casual']
  },
  {
    id: 'memory-game',
    name: 'Memory Match',
    description: 'Card matching game with flip animations and move counter',
    category: 'game',
    icon: '🃏',
    prompt: 'Create a memory matching game with card grid, flip animations, match detection, move counter, timer, and win condition. Include multiple difficulty levels with different grid sizes.',
    tags: ['puzzle', 'memory', 'casual']
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Two-player tic-tac-toe with win detection and score history',
    category: 'game',
    icon: '⭕',
    prompt: 'Build a tic-tac-toe game with two-player mode, win/draw detection, score tracking, game reset, and optional AI opponent. Include animated winning line and sound effects toggle.',
    tags: ['strategy', 'multiplayer', 'classic']
  },
  {
    id: 'quiz-game',
    name: 'Trivia Quiz',
    description: 'Multiple choice quiz with categories, timer, and leaderboard',
    category: 'game',
    icon: '❓',
    prompt: 'Create a trivia quiz game with category selection, multiple choice questions, countdown timer, score calculation, streak bonuses, and results screen with leaderboard.',
    tags: ['trivia', 'educational', 'multiplayer']
  },
  {
    id: 'word-game',
    name: 'Word Puzzle',
    description: 'Word guessing game similar to Wordle with hints and statistics',
    category: 'game',
    icon: '🔤',
    prompt: 'Build a word guessing game (Wordle-style) with 5-letter words, color-coded feedback, keyboard display, hint system, streak tracking, and share results feature.',
    tags: ['word', 'puzzle', 'daily']
  },
  {
    id: 'breakout-game',
    name: 'Breakout',
    description: 'Brick breaker game with paddle, ball physics, and power-ups',
    category: 'game',
    icon: '🧱',
    prompt: 'Create a breakout/brick breaker game with paddle controls, ball physics, brick destruction, score system, lives, levels progression, and power-ups like multi-ball or wide paddle.',
    tags: ['arcade', 'physics', 'action']
  }
];

export function getTemplatesByCategory(category: ProjectTemplate['category']) {
  return projectTemplates.filter(t => t.category === category);
}

export function searchTemplates(query: string) {
  const lower = query.toLowerCase();
  return projectTemplates.filter(t => 
    t.name.toLowerCase().includes(lower) ||
    t.description.toLowerCase().includes(lower) ||
    t.tags.some(tag => tag.toLowerCase().includes(lower))
  );
}
