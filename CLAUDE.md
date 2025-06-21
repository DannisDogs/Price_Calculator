# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a dog sitting cost calculator web application designed for a pet care business. It's a single-page application built with vanilla HTML, CSS, and JavaScript, intended to be hosted on GitHub Pages.

## Development Commands

To run the application locally:
```bash
python3 -m http.server 8080
```
Then navigate to http://localhost:8080

## Architecture & Pricing Logic

### Core Pricing Structure
- **Day rate**: $35 (9:00 AM - 5:00 PM)
- **Overnight rate**: $50 (5:00 PM - 9:00 AM next day)
- **Hourly rate**: $4/hour for:
  - Pickup after 5pm on same day (without overnight stay)
  - Pickup after 9am the next day (after overnight stay)

### Key Components

1. **index.html**: Main page with datetime inputs for drop-off/pick-up times
   - Form with ID `calculator-form`
   - Results section that shows/hides based on calculation status
   - Pricing breakdown display with day sessions, overnight stays, and extra hours

2. **script.js**: Contains the pricing calculation logic
   - `calculatePricing()` function handles all pricing scenarios:
     - Same-day visits
     - Multi-day stays with proper session counting
     - Extra hourly charges beyond standard sessions
   - Console logging is currently enabled for debugging

3. **style.css**: Friendly, playful design with:
   - Gradient backgrounds and animations
   - Responsive layout
   - Z-index layering to prevent decorative elements from blocking interactions

### Important Implementation Details

- The calculator uses ceiling rounding for hourly charges (any partial hour counts as full hour)
- Form submission is prevented; calculation happens client-side
- Default datetime values are set: current time for drop-off, 24 hours later for pick-up
- Error handling for invalid date selections

## Known Issues & Considerations

- Console.log statements are present for debugging - remove before production
- The rotating background animation previously blocked button clicks (fixed with z-index)
- Mobile responsive design centers header text on small screens