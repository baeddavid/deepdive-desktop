const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"), // if you have a preload script
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
    });

    mainWindow.loadURL(`http://localhost:3000`); // React app runs on port 3000 by default
}

ipcMain.on("open-file-dialog", async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ["openFile"],
        filters: [{ name: "CSV and XLSX Files", extensions: ["csv", "xlsx"] }],
    });

    if (!canceled && filePaths.length > 0) {
        const filePath = filePaths[0];
        event.sender.send("file-selected", filePath);
    }
});

ipcMain.on("save-file", (event, filePath) => {
    const uploadsDir = path.join(
        os.homedir(),
        "Documents",
        "DeepDive",
        "Uploads"
    );
    if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });

    const fileName = path.basename(filePath);
    const destination = path.join(uploadsDir, fileName);

    fs.copyFile(filePath, destination, (err) => {
        if (err) {
            console.error("Failed to save file:", err);
        } else {
            console.log("Emitting 'file-saved' event");
            event.sender.send("file-saved", destination); // Emit only once
        }
    });
});

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
