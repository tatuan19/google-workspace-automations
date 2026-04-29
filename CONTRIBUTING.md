# Contributing

## Repository Conventions

- Group scripts by Google service in top-level folders such as `calendar/`, `gmail/`, `sheets/`, and `drive/`.
- Use lowercase kebab-case filenames.
- Prefer clear, descriptive function names over abbreviations.
- Keep scripts self-contained and easy to understand without extra tooling.

## Script Documentation

Each script should begin with a short header comment that covers:

- what the script does
- which Google services or APIs it depends on
- any configuration values, calendar IDs, spreadsheet IDs, or other required identifiers
- whether it should be run manually, on a trigger, or both

## Updating the Repository

When adding a script:

1. Add the new `.js` file under the Google service folder that best matches the script.
2. Create a new top-level service folder only when the script clearly belongs to a new Google Workspace service.
3. Document setup requirements in the script header.
4. Add a short entry to `README.md` so visitors can discover it quickly.

## Pull Requests

- Keep changes focused.
- Update documentation when behavior or setup expectations change.
- Avoid introducing tooling or structural complexity unless there is a clear repository-wide benefit.
