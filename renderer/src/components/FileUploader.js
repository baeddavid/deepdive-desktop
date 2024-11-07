import React, { useEffect } from "react";

const FileUploader = () => {
    const handleFileUpload = () => {
        window.electron.ipcRenderer.send("open-file-dialog");
    };

    useEffect(() => {
        console.log("Attaching listeners");

        const onFileSelected = (filePath) => {
            console.log("File selected:", filePath);
            window.electron.ipcRenderer.send("save-file", filePath);
        };

        const onFileSaved = (destination) => {
            console.log("File saved at:", destination);
            // Temporarily remove alert to ensure it's not causing the issue
            alert(`File saved at: ${destination}`);
            console.log("Triggering alert - single log");
        };

        window.electron.ipcRenderer.on("file-selected", onFileSelected);
        window.electron.ipcRenderer.on("file-saved", onFileSaved);

        return () => {
            console.log("Removing listeners");
            window.electron.ipcRenderer.removeAllListeners("file-selected");
            window.electron.ipcRenderer.removeAllListeners("file-saved");
        };
    }, []);

    return (
        <div>
            <button onClick={handleFileUpload}>Upload csv/xlsx File</button>
        </div>
    );
};

export default FileUploader;
