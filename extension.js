const vscode = require('vscode');
const Chart = require('chart.js');

const activityData = [];

function logActivity(action, filePath) {
    const timestamp = new Date().toISOString();
    activityData.push({ action, filePath, timestamp });
    console.log(`${action} on file: ${filePath}`);
}

function generateHeatMap() {
    const ctx = document.getElementById('heatmap').getContext('2d');
    const data = {
        labels: activityData.map(entry => entry.filePath),
        datasets: [{
            data: activityData.map(entry => new Date(entry.timestamp).getHours()),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
        }],
    };
    const config = {
        type: 'bar',
        data: data,
    };
    new Chart(ctx, config);
}

function createWebview(context) {
    console.log('Creating webview...hii');
    const panel = vscode.window.createWebviewPanel(
        'heatmap',
        'Activity Heatmap',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(context.extensionPath)
            ],
            options: {
                contentSecurityPolicy: {
                    'script-src': ["'self'", "https://cdn.jsdelivr.net"]
                }
            }
        }
    );

    panel.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Activity Heatmap</title>
        </head>
        <body>
            <canvas id="heatmap" width="400" height="200"></canvas>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            <script>
                ${generateHeatMap.toString()}
                console.log('Webview content executed!');
                console.log('Chart.js version:', Chart.version);
                generateHeatMap();
            </script>
        </body>
        </html>
    `;
}


function activate(context) {
    let disposable = vscode.commands.registerCommand('vs-code-heat-map.showHeatmap', function () {
        createWebview();
    });
    context.subscriptions.push(disposable);

    vscode.workspace.onDidOpenTextDocument((document) => {
        const filePath = document.fileName;
        logActivity('Opened', filePath);
    });

    vscode.workspace.onDidChangeTextDocument((event) => {
        const filePath = event.document.fileName;
        logActivity('Edited', filePath);
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
