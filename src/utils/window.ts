/**
 * Opens the standalone recorder window.
 * Ensures only one instance of the recorder is open at a time.
 */
export const openRecorderWindow = async () => {
    // Check if window is already open
    const windows = await chrome.windows.getAll({ populate: true });
    // This is a heuristic. We might want to store the windowID in storage if we want to be precise,
    // but searching for the URL is safer against crashes/restarts.
    const recorderUrl = chrome.runtime.getURL("recorder.html");

    const existingWindow = windows.find((win) => {
        return win.tabs?.some((tab) => tab.url === recorderUrl);
    });

    if (existingWindow && existingWindow.id) {
        // Focus existing window
        await chrome.windows.update(existingWindow.id, { focused: true });
    } else {
        // Create new window
        // Centered window calculation could go here, but Chrome handles 'popup' positioning well usually.
        // Let's aim for a reasonable size.
        const width = 800;
        const height = 600;

        await chrome.windows.create({
            url: "recorder.html",
            type: "popup",
            width,
            height,
            focused: true,
        });
    }
};
