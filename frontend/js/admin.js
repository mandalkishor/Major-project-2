// ==========================================
// 0. CONFIGURATION
// ==========================================
const API_URL = "https://civicconnect-smart-complaint-reporting.onrender.com/api/complaints";

// ==========================================
// 1. DATA LOADING (TABLE)
// ==========================================
async function loadAdminComplaints() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const table = document.getElementById("adminTable");
        if (!table) return;
        
        table.innerHTML = "";

        data.forEach(c => {
            table.innerHTML += `
                <tr>
                    <td>${c.complaintId}</td>
                    <td>${c.category}</td>
                    <td>${c.area}</td>
                    <td><span class="status-badge ${c.status.toLowerCase()}">${c.status}</span></td>
                    <td>
                        ${c.status !== "Resolved" ? `
                            <button class="btn-resolve" data-id="${c._id}" onclick="markResolved(this)">
                                Mark Resolved
                            </button>
                        ` : `
                            <button class="btn-danger" data-id="${c._id}" onclick="deleteComplaint(this)">
                                Delete
                            </button>
                        `}
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
        alert("Failed to load complaints from server.");
    }
}

// ==========================================
// 2. ADMIN ACTIONS (PUT & DELETE)
// ==========================================
async function markResolved(btn) {
    const id = btn.dataset.id;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Resolved" })
        });

        if (!res.ok) throw new Error("Update failed");

        alert("Complaint marked as Resolved");
        loadAdminComplaints(); // Refresh Table
        drawAdminChart();      // Refresh Chart
    } catch (err) {
        console.error(err);
        alert("Error updating status.");
    }
}

async function deleteComplaint(btn) {
    const id = btn.dataset.id;

    if (!confirm("Are you sure you want to permanently delete this complaint?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (!res.ok) {
            const msg = await res.json();
            alert(msg.message || "Delete failed");
            return;
        }

        alert("Complaint deleted successfully");
        loadAdminComplaints();
        drawAdminChart();
    } catch (err) {
        console.error(err);
        alert("Server error during deletion.");
    }
}

// ==========================================
// 3. ANALYTICS (GOOGLE CHARTS)
// ==========================================
google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawAdminChart);

async function drawAdminChart() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const statusCounts = { "Pending": 0, "Resolved": 0 };
        data.forEach(c => {
            const s = c.status || "Pending";
            statusCounts[s] = (statusCounts[s] || 0) + 1;
        });

        const chartData = google.visualization.arrayToDataTable([
            ['Status', 'Count', { role: 'style' }],
            ['Pending', statusCounts["Pending"], '#e74c3c'],  // Red
            ['Resolved', statusCounts["Resolved"], '#2ecc71'] // Green
        ]);

        const isDarkMode = document.body.classList.contains("dark");
        const textColor = isDarkMode ? "#f0f0f0" : "#333333";

        const options = {
            title: 'Complaint Resolution Status',
            titleTextStyle: { color: textColor, fontSize: 18, bold: true },
            backgroundColor: 'transparent',
            hAxis: {
                title: 'Status',
                titleTextStyle: { color: textColor },
                textStyle: { color: textColor }
            },
            vAxis: {
                title: 'Number of Complaints',
                titleTextStyle: { color: textColor },
                textStyle: { color: textColor },
                gridlines: { color: isDarkMode ? '#444' : '#ccc' },
                viewWindow: { min: 0 }
            },
            legend: { position: 'none' },
            animation: { duration: 800, easing: 'out', startup: true }
        };

        const chartElement = document.getElementById('adminStatusChart');
        if (chartElement) {
            const chart = new google.visualization.ColumnChart(chartElement);
            chart.draw(chartData, options);
        }
    } catch (err) {
        console.error("Admin chart error:", err);
    }
}

// ==========================================
// 4. THEME & INITIALIZATION
// ==========================================
function toggleTheme() {
    document.body.classList.toggle("dark");
    const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
    localStorage.setItem("theme", currentTheme);

    // Re-draw chart to update colors
    if (typeof drawAdminChart === 'function') drawAdminChart();
}

// Run when page loads
document.addEventListener("DOMContentLoaded", () => {
    // Apply saved theme
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark");
    }
    
    // Load initial data
    loadAdminComplaints();
});
