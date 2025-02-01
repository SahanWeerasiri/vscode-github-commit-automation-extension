import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('ai-commit-helper.commitai', async () => {
        // Fetch Git diff
        exec('git diff --cached', async (error, stdout) => {
            if (error) {
                vscode.window.showErrorMessage('Error fetching staged changes');
                return;
            }

            // Call an AI model (Replace with actual API call)
            let commitMessage = await generateCommitMessage(stdout);

            if (!commitMessage) {
                vscode.window.showErrorMessage('Failed to generate commit message.');
                return;
            }

            // Commit with the AI-generated message
            exec(`git commit -m "${commitMessage}"`, (err) => {
                if (err) {
                    vscode.window.showErrorMessage('Error committing changes.');
                } else {
                    vscode.window.showInformationMessage('Commit created successfully.');
                }
            });
        });
    });

    context.subscriptions.push(disposable);
}

async function generateCommitMessage(diff: string): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY; // Retrieve your Google API key
    if (!apiKey) {
        vscode.window.showErrorMessage("Google API key not found. Please set the GOOGLE_API_KEY environment variable.");
        return "Error: API key missing";
    }

    const model = "models/text-bison-001"; // Gemini API model name

    const prompt = `Generate a concise and informative Git commit message for the following changes:\n\n\`\`\`diff\n${diff}\n\`\`\``;

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta2/" + model + ":generateText",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    prompt: {
                        text: prompt,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            vscode.window.showErrorMessage(`Gemini API request failed: ${response.status} - ${response.statusText}`);
            return "Error generating commit message";
        }

        const data = await response.json();
        const commitMessage = data.candidates[0].output;

        return commitMessage.trim();


    } catch (error) {
        console.error("Error calling Gemini API:", error);
        vscode.window.showErrorMessage("Error calling Gemini API.");
        return "Error generating commit message";
    }

}


export function deactivate() {}
