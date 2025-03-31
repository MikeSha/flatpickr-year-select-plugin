# Year Select Plugin for Flatpickr

A plugin for [flatpickr](https://flatpickr.js.org/) that transforms the date picker into a year selector with a decade-based navigation interface.

## Installation

```bash
npm install flatpickr
# or
yarn add flatpickr
```

The plugin is imported separately:

```typescript
import flatpickr from 'flatpickr';
import yearSelectPlugin from './path-to-yearSelectPlugin';
```

## Basic Usage

```typescript
import flatpickr from 'flatpickr';
import yearSelectPlugin from './yearSelectPlugin';

flatpickr('#my-input', {
  plugins: [
    yearSelectPlugin()
  ]
});
```

## Configuration

The plugin accepts an optional configuration object:

```typescript
interface Config {
  dateFormat: string;  // Format for storing date value
  altFormat: string;   // Format for displaying date
  theme: string;       // Theme for styling ('light' by default)
}
```

### Default Configuration

```typescript
const defaultConfig = {
  dateFormat: 'Y',     // Year format (YYYY)
  altFormat: 'Y',      // Display format (YYYY)
  theme: 'light'       // Default theme
};
```

### Example with Custom Configuration

```typescript
flatpickr('#year-picker', {
  plugins: [
    yearSelectPlugin({
      dateFormat: 'Y-m-d',
      altFormat: 'Y',
      theme: 'dark'
    })
  ]
});
```

## Features

### Decade Navigation

- Years are displayed in a decade view (e.g., 2020-2029)
- Previous button (←) navigates to the previous decade
- Next button (→) navigates to the next decade

### Year Selection

- Single Mode: Select a single year
- Range Mode: Select a range of years
- Multiple Mode: Select multiple years

### Keyboard Navigation

The plugin supports keyboard navigation:

- Arrow keys to navigate between years
- Enter to select the focused year

| Key | Action |
|-----|--------|
| ArrowLeft | Move left |
| ArrowRight | Move right |
| ArrowUp | Move up |
| ArrowDown | Move down |
| Enter | Select focused year |

## Examples

### Single Year Selection

```typescript
import flatpickr from 'flatpickr';
import yearSelectPlugin from './yearSelectPlugin';

flatpickr('#year-single', {
  plugins: [yearSelectPlugin()],
  mode: 'single'
});
```

### Year Range Selection

```typescript
import flatpickr from 'flatpickr';
import yearSelectPlugin from './yearSelectPlugin';

flatpickr('#year-range', {
  plugins: [yearSelectPlugin()],
  mode: 'range'
});
```

### With Min and Max Date Constraints

```typescript
import flatpickr from 'flatpickr';
import yearSelectPlugin from './yearSelectPlugin';

flatpickr('#year-constrained', {
  plugins: [yearSelectPlugin()],
  minDate: '2010-01-01',
  maxDate: '2030-12-31'
});
```

## Styling

The plugin adds the class `flatpickr-yearSelect-theme-{theme}` to the calendar container, where `{theme}` is the theme specified in the config (defaults to 'light').

### CSS Classes

The plugin uses the following CSS classes:

- `flatpickr-yearSelect-years`: Container for year elements
- `flatpickr-yearSelect-year`: Individual year element
- `flatpickr-yearSelect-range`: Element displaying current decade range (e.g., "2020 - 2029")
- `today`: Applied to the current year
- `selected`: Applied to selected year(s)
- `flatpickr-yearSelect-theme-light`: Applied when using the 'light' theme
- `flatpickr-yearSelect-theme-dark`: Applied when using the 'dark' theme

## Advanced Usage

### Integration with Form Submission

```typescript
import flatpickr from 'flatpickr';
import yearSelectPlugin from './yearSelectPlugin';

const yearPicker = flatpickr('#year-input', {
  plugins: [yearSelectPlugin()],
  onChange: (selectedDates, dateStr) => {
    console.log('Selected year:', dateStr);
    document.getElementById('hidden-year-value').value = dateStr;
  }
});

// Form submission example
document.getElementById('my-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const selectedYear = document.getElementById('hidden-year-value').value;
  // Process form data
});
```

### Custom Event Handling

```typescript
import flatpickr from 'flatpickr';
import yearSelectPlugin from './yearSelectPlugin';

const yearPicker = flatpickr('#year-custom', {
  plugins: [yearSelectPlugin()],
  onYearChange: (selectedDates, dateStr) => {
    // Custom logic when year changes
  },
  onClose: (selectedDates, dateStr) => {
    // Handle picker closing
  }
});
```

## API Integration

### Programmatically Set Year

```typescript
import flatpickr from 'flatpickr';
import yearSelectPlugin from './yearSelectPlugin';

const yearPicker = flatpickr('#year-api', {
  plugins: [yearSelectPlugin()]
});

// Set to current year
document.getElementById('set-current-year').addEventListener('click', () => {
  const now = new Date();
  yearPicker.setDate(now);
});

// Set to specific year
document.getElementById('set-specific-year').addEventListener('click', () => {
  yearPicker.setDate('2025');
});
```

### Getting Selected Year

```typescript
const selectedYear = yearPicker.selectedDates[0].getFullYear();
```

## Browser Compatibility

The plugin is compatible with all browsers supported by flatpickr. It uses modern JavaScript features, so older browsers may require appropriate polyfills.

## License

This plugin follows the same license as flatpickr.