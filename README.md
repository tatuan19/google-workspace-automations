# Google Workspace Automations

Reusable Google Workspace automations built with Google Apps Script.

This repository is intended to hold small, focused automation scripts for Google Workspace environments. It is organized by Google service so new scripts can be added across multiple categories without changing the repository structure.

## Included Scripts

No scripts are published yet.

Future additions should remain self-contained and easy to copy, review, and adapt.

## Repository Structure

Scripts are grouped by Google service:

- `calendar/`
- `gmail/`
- `sheets/`
- `drive/`

## Getting Started

When adding a new script:

1. Choose the Google service folder that best matches the script.
2. Create a JavaScript file using lowercase kebab-case, such as `calendar/sync-holiday-calendar-out-of-office.js`.
3. Keep the script self-contained unless a shared helper becomes clearly necessary.
4. Add a short header comment describing:
   - purpose
   - required Google services or APIs
   - configuration values or IDs
   - trigger expectations
5. Update this README with a brief description of the new script.

## Available Scripts

- Calendar:
  - `calendar/sync-holiday-calendar-out-of-office.js`: syncs holidays from the Holidays in Japan calendar into the primary calendar as Out of Office events with silent auto-decline for conflicting invitations

Future entries should be listed by service as they are added.

## Planned Examples

This repository may include automations such as syncing holiday calendars with personal out-of-office calendars, along with other useful Google Workspace scripts.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for repository conventions and contribution guidance.
