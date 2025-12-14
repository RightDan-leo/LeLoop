import { SimulationHistoryPoint } from '../types';

/**
 * Converts simulation history to CSV format and triggers a file download.
 * @param history The simulation history array
 * @param filename The name of the file to download
 */
export const exportToCSV = (history: SimulationHistoryPoint[], filename: string = 'simulation-data.csv') => {
    if (!history || history.length === 0) {
        alert('No data to export');
        return;
    }

    // 1. Collect all unique keys (columns) from the entire history
    //    (Nodes might be added dynamically, though in this app they are mostly static during run)
    const allKeys = new Set<string>();
    history.forEach(point => {
        Object.keys(point).forEach(key => allKeys.add(key));
    });

    // Ensure 'tick' is first
    allKeys.delete('tick');
    const sortedKeys = ['tick', ...Array.from(allKeys).sort()];

    // 2. Generate CSV Header
    const header = sortedKeys.join(',');

    // 3. Generate CSV Rows
    const rows = history.map(point => {
        return sortedKeys.map(key => {
            const value = point[key];
            return value !== undefined ? value : ''; // Handle missing values
        }).join(',');
    });

    // 4. Combine
    const csvContent = [header, ...rows].join('\n');

    // 5. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
