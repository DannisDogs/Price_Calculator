# Paw-some Pet Care Calculator 🐾

A friendly and intuitive web calculator for dog sitting services that helps calculate costs based on drop-off and pick-up times.

![Dog Sitting Calculator](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- 📅 Easy date/time selection for drop-off and pick-up
- 💰 Automatic cost calculation with detailed breakdown
- 🌙 Separate pricing for day and overnight sessions
- ⏰ Hourly rates for extended stays
- 📱 Mobile-responsive design
- 🎨 Playful, pet-themed interface with animations

## Pricing Structure

- **☀️ Daytime Sessions** (9:00 AM - 5:00 PM): $35 flat rate
- **🌙 Overnight Stays** (5:00 PM - 9:00 AM): $50 flat rate
- **⏰ Extra Hours**: $4 per hour
  - Applied when picking up after 5:00 PM (same day, no overnight)
  - Applied when picking up after 9:00 AM (following an overnight stay)

### Example Calculations
- Drop off at 9am, pick up at 7pm same day: $35 (day) + $8 (2 extra hours) = $43
- Drop off at 9am, pick up at 10am next day: $35 (day) + $50 (overnight) + $4 (1 extra hour) = $89

## Getting Started

### Prerequisites
- A modern web browser
- Python 3.x (for local development server)

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/dog-sitting-calculator.git
   cd dog-sitting-calculator
   ```

2. Start a local web server:
   ```bash
   python3 -m http.server 8080
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

## Deployment

This application is designed to be hosted on GitHub Pages:

1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose "main" branch and "/ (root)" folder
5. Your calculator will be live at `https://[username].github.io/[repository-name]/`

## Project Structure

```
/
├── index.html      # Main HTML file with form and layout
├── style.css       # Styling with animations and responsive design
├── script.js       # Calculator logic and form handling
├── README.md       # This file
├── CLAUDE.md       # Development guidance for AI assistants
└── .gitignore      # Git ignore file
```

## Technologies Used

- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript
- Google Fonts (Quicksand)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with ❤️ for our furry friends
- Emoji icons for a friendly user experience
- Quicksand font for playful typography