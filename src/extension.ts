import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';


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

            const envPath = `${repoPath}/.env`;
            dotenv.config({ path: envPath });

            
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
    //const apiKey = process.env.GOOGLE_API_KEY;
    const apiKey = "<your-api-key>";
    if (!apiKey) {
      vscode.window.showErrorMessage("Google API key not found. Please set the GOOGLE_API_KEY environment variable.");
      return "Error: API key missing";
    }
  
    try {
      // Initialize the Google Generative AI client
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      const prompt = `Generate a concise Git commit message for the following changes:
  
  \`\`\`diff
  ${diff}
  \`\`\`
  
  Guidelines:
  - Keep the commit message short (50-72 characters)
  - Use imperative mood (e.g., "Add feature" not "Added feature")
  - Clearly describe the main purpose of the changes
  - Focus on the "what" and "why", not the "how"`;
  
      // Generate the commit message
      const result = await model.generateContent(prompt);
      const response = result.response;
      const commitMessage = response.text().trim();
  
      // Validate and truncate the commit message if needed
      const validatedMessage = commitMessage.length > 72 
        ? commitMessage.substring(0, 72).trim() 
        : commitMessage;
  
      return validatedMessage;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      
      // Provide a more detailed error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unexpected error generating commit message";
      
      vscode.window.showErrorMessage(errorMessage);
      return "Error generating commit message";
    }
  }


export function deactivate() {}
