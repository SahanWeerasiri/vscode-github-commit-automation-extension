import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as path from 'path';
// Define interface for API response
interface GeminiResponse {
    candidates?: {
        output: string;
    }[];
    error?: {
        message: string;
        code: number;
    };
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('aiCommitHelper.generateCommit', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return;
        }

        const repoPath = workspaceFolders[0].uri.fsPath; // Get workspace root
        vscode.window.showInformationMessage(`Using repo path: ${repoPath}`);
        exec('git status', { cwd: repoPath }, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                return;
            }
            if (stderr) {
                vscode.window.showErrorMessage(`stderr: ${stderr}`);
                return;
            }
            vscode.window.showInformationMessage(`stdout: ${stdout}`);

            exec('git diff head',{ cwd: repoPath }, async (error, stdout, stderr) => {
                if (error) {
                          vscode.window.showErrorMessage(`Error fetching staged changes: ${stderr || error.message}`);
                    console.error("Git Error:", error, stderr);
                    return;
                }
            
                if (!stdout.trim()) {
                    vscode.window.showWarningMessage("No staged changes found.");
                    return;
                }
            
                let commitMessage = await generateCommitMessage(stdout);
            
                if (!commitMessage) {
                    vscode.window.showErrorMessage('Failed to generate commit message.');
                    return;
                }
            
                exec(`git commit -m "${commitMessage}"`,{ cwd: repoPath }, (err) => {
                    if (err) {
                        vscode.window.showErrorMessage('Error committing changes.');
                    } else {
                        vscode.window.showInformationMessage('Commit created successfully.');
                    }
                });
            });
        });

        
    });

    context.subscriptions.push(disposable);
}

async function generateCommitMessage(diff: string): Promise<string> {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        vscode.window.showErrorMessage("Google API key not found. Please set the GOOGLE_API_KEY environment variable.");
        return "Error: API key missing";
    }

    const model = "text-bison-001";
    const prompt = `Generate a concise Git commit message for the following changes:\n\n\`\`\`diff\n${diff}\n\`\`\``;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateText`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json() as GeminiResponse;
            console.error("Gemini API Error:", errorData);
            throw new Error(`Gemini API request failed with status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json() as GeminiResponse;
        
        if (!data.candidates?.[0]?.output) {
            throw new Error("Invalid response format from Gemini API");
        }

        return data.candidates[0].output.trim();

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        vscode.window.showErrorMessage(error instanceof Error ? error.message : "Error calling Gemini API.");
        return "Error generating commit message";
    }
}

export function deactivate() {}