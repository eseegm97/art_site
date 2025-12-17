# Art Sharing Platform

A modern web application for sharing and discovering artwork built with Vite, HTML5, CSS3, and vanilla JavaScript.

## Features

- 🎨 Share artwork with title, artist, and description
- 🖼️ Browse artwork gallery with responsive grid layout
- 📱 Mobile-friendly responsive design
- 💾 Local storage for artwork persistence
- 🔍 Form validation and error handling
- ✨ Modern UI with smooth animations
- 🧪 Comprehensive testing with Vitest
- 📝 Code quality with ESLint and Prettier

## Tech Stack

- **Build System**: Vite
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+ modules)
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest with jsdom
- **Storage**: Browser localStorage API

## Project Structure

```
art_site/
├── src/
│   ├── components/
│   │   ├── ArtGallery.js      # Gallery component for displaying artwork
│   │   ├── ArtSubmissionForm.js # Form component for submitting art
│   │   └── Navigation.js       # Navigation component
│   ├── styles/
│   │   └── style.css          # Main stylesheet
│   ├── utils/
│   │   ├── storage.js         # localStorage management
│   │   └── validation.js      # Data validation utilities
│   └── main.js               # Application entry point
├── public/
│   └── favicon.svg           # Site favicon
├── tests/
│   ├── setup.js              # Test setup and mocks
│   ├── storage.test.js       # Storage tests
│   └── validation.test.js    # Validation tests
├── index.html               # Main HTML file
├── vite.config.js          # Vite configuration
├── vitest.config.js        # Vitest configuration
├── eslint.config.js        # ESLint configuration
├── .prettierrc             # Prettier configuration
└── package.json            # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Building for Production

Build the project:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests once (CI mode):

```bash
npm run test:run
```

Generate coverage report:

```bash
npm run coverage
```

### Code Quality

Check linting:

```bash
npm run lint
```

Fix linting issues:

```bash
npm run lint:fix
```

Format code:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

## Usage

1. **View Gallery**: Browse submitted artwork on the home page
2. **Submit Art**: Click "Submit Art" to share your artwork
3. **Navigation**: Use the navigation menu to jump between sections

## Development Guidelines

- Follow ES6+ module standards
- Use semantic HTML5 elements
- Implement responsive CSS with mobile-first approach
- Write comprehensive tests for utilities and components
- Follow consistent code formatting with Prettier
- Maintain code quality with ESLint rules

## Browser Support

- Modern browsers supporting ES2020+ features
- Chrome 80+, Firefox 80+, Safari 13+, Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details
