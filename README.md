# AI Commit Helper

This VS Code extension uses the power of Google's Gemini API to generate concise and informative Git commit messages based on your staged changes.  It helps streamline your workflow by automating the often tedious task of writing commit messages.

## Features

* **Automatic Commit Message Generation:** Analyzes your staged changes using `git diff --cached` and sends them to the Gemini API to generate a relevant commit message.
* **Error Handling:** Provides informative error messages if issues occur fetching staged changes, generating the commit message, or committing the changes.
* **API Key Management:** Uses the `GOOGLE_API_KEY` environment variable for secure API key storage.  Prompts the user to set the key if it's not found.
* **Seamless Integration:**  Directly commits the generated message using `git commit`.

## Requirements

* **VS Code:**  This extension is designed for Visual Studio Code.
* **Git:**  Requires Git to be installed and configured in your project.
* **Google Cloud Project:** You need a Google Cloud project with the Gemini API enabled.
* **Google API Key:** An API key is required to access the Gemini API. Store this securely as an environment variable named `GOOGLE_API_KEY`.

## Extension Settings

This extension currently does not utilize any VS Code specific settings.

## Known Issues

* **Dependency on Environment Variable:** The extension relies on the `GOOGLE_API_KEY` environment variable.  Setting this up can be challenging for some users.  Future improvements could explore alternative key storage mechanisms.
* **Limited Customization:** Currently, the commit message prompt sent to the Gemini API is fixed.  Adding options for customization could enhance the extension's flexibility.
* **Handling Large Diffs:**  Very large diffs might cause issues with the API request or generate less effective commit messages.  Investigating performance and potential limitations with large diffs is recommended for future development.

## Release Notes

### 1.0.0

Initial release of the AI Commit Helper extension.

## Future Enhancements

* **Customizable Prompts:** Allow users to modify the prompt sent to the Gemini API to tailor the generated commit messages.
* **Alternative API Key Storage:** Explore options for securely storing the API key within VS Code settings rather than relying on an environment variable.
* **Diff Chunking:**  Implement logic to handle large diffs by breaking them into smaller chunks for more effective processing by the Gemini API.
* **User Interface:**  Add a preview of the generated commit message before committing, allowing users to edit if necessary.

## Installation
```bash
git clone <repo-url>
cd vscode-github-commit-automation-extension
npm install
```

* Add your google api key to the place where it uses

```bash
npx vsce package
code --install-extension ai-commit-helper-0.0.1.vsix
```

## Usage

* Stage your changes
* `Ctrl`+`Shift`+`P`
* Generate AI Commit Message


