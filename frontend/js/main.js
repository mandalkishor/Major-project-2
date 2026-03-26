// ==========================================
// 0. CONFIGURATION
// ==========================================
const API_BASE_URL = "https://civicconnect-smart-complaint-reporting.onrender.com/api/complaints";

// ==========================================
// 1. GOOGLE CHARTS INITIALIZATION
// ==========================================
if (typeof google !== 'undefined' && google.charts) {
    google.charts.load('current', { 'packages': ['corechart'] });
    google.charts.setOnLoadCallback(refreshChart);
}

async function refreshChart() {
    if (typeof google === 'undefined' || !google.visualization) {
        console.warn("Google Charts library not loaded yet.");
        return; 
    }
    try {
        const response = await fetch(API_BASE_URL);
        const complaints = await response.json();

        const counts = {};
        complaints.forEach(c => {
            counts[c.category] = (counts[c.category] || 0) + (c.reportCount || 1);
        });

        const chartData = [['Category', 'Total Reports']];
        for (let category in counts) {
            chartData.push([category, counts[category]]);
        }

        const dataTable = google.visualization.arrayToDataTable(chartData);
        const isDarkMode = document.body.classList.contains("dark");
        const textColor = isDarkMode ? "#f0f0f0" : "#333333";

        const options = {
            title: 'Live Civic Issue Statistics',
            titleTextStyle: { color: textColor, fontSize: 18, bold: true },
            legend: { textStyle: { color: textColor } },
            pieSliceTextStyle: { color: '#ffffff' },
            is3D: true,
            backgroundColor: 'transparent',
            chartArea: { width: '90%', height: '80%' },
            animation: { duration: 1000, easing: 'out', startup: true }
        };

        const chartElement = document.getElementById('piechart');
        if (chartElement) {
            const chart = new google.visualization.PieChart(chartElement);
            chart.draw(dataTable, options);
        }
    } catch (err) {
        console.error("Chart error:", err);
    }
}

// ==========================================
// 2. COMPLAINT SUBMISSION
// ==========================================
async function submitComplaint(e) {
    e.preventDefault();
    
    let selectedCategory = document.getElementById("category").value;
    if (selectedCategory === "Other") {
        selectedCategory = document.getElementById("otherCategoryInput").value;
    }

    const data = {
        name: document.getElementById("name").value,
        category: selectedCategory,
        area: document.getElementById("location").value,
        latitude: document.getElementById("latitude").value,
        longitude: document.getElementById("longitude").value,
        description: document.getElementById("description").value
    };

    try {
        const res = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        const complaintId = result.complaintId;

        const card = document.querySelector('.card');
        card.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: #2ecc71; margin-bottom: 15px;">✔️ Complaint Registered!</h2>
                <p style="margin-bottom: 5px; font-weight: bold;">Your Tracking ID:</p>
                <div style="background: #f4f4f4; border: 1px dashed #ccc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 id="cid" style="margin: 0; color: #333; letter-spacing: 2px;">${complaintId}</h3>
                </div>
                <button onclick="copyID()" class="btn btn-primary" style="margin-bottom: 10px; width: 100%;">📋 Copy ID</button>
                <br>
                <a href="index.html" style="text-decoration: none; color: #3498db; font-size: 0.9em;">← Submit Another Report</a>
            </div>
        `;
    } catch (err) {
        console.error("Error:", err);
        alert("❌ Submission failed. Please check your connection.");
    }
}

function copyID() {
    const idText = document.getElementById("cid").innerText;
    navigator.clipboard.writeText(idText)
        .then(() => alert("✅ Complaint ID copied: " + idText))
        .catch(() => alert("❌ Failed to copy ID"));
}

// ==========================================
// 3. DASHBOARD & TRACKING
// ==========================================
async function loadDashboard() {
    try {
        const res = await fetch(API_BASE_URL);
        const data = await res.json();
        const table = document.getElementById("dashboardTable");
        if(!table) return;

        table.innerHTML = ""; 
        data.forEach(c => {
            table.innerHTML += `
                <tr>
                    <td>${c.category}</td>
                    <td>${c.area}</td>
                    <td class="status-pending">${c.status || "Pending"}</td>
                    <td>${c.reportCount}</td>
                    <td>
                        <button onclick="reportSameIssue('${c._id}')">Report Same Issue</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) { console.error("Dashboard load error:", err); }
}

async function trackComplaint() {
    const id = document.getElementById("trackId").value;
    if (!id) return alert("Please enter Complaint ID");

    try {
        const res = await fetch(`${API_BASE_URL}/track/${id}`);
        if (!res.ok) throw new Error("Invalid ID");
        const data = await res.json();
        document.getElementById("result").innerText = `Status: ${data.status}`;
    } catch {
        alert("Invalid Complaint ID");
    }
}

async function reportSameIssue(id) {
    await fetch(`${API_BASE_URL}/report-same/${id}`, { method: "PUT" });
    loadDashboard(); 
    refreshChart(); 
}

// ==========================================
// 4. THEME & MAP LOGIC
// ==========================================
function toggleTheme() {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
    if (typeof refreshChart === 'function') refreshChart();
}

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("themeToggle");
    if (btn) btn.addEventListener("click", toggleTheme);
    if (localStorage.getItem("theme") === "dark") document.body.classList.add("dark");

    const reportMapElement = document.getElementById('map');
    if (reportMapElement) initMap();
});

let map, marker;

function initMap() {
    const defaultLat = 18.5204; // Pune Coordinates
    const defaultLng = 73.8567;

    map = L.map('map').setView([defaultLat, defaultLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    marker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);

    marker.on('dragend', () => getAddress(marker.getLatLng().lat, marker.getLatLng().lng));
    map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        getAddress(e.latlng.lat, e.latlng.lng);
    });
}

async function getAddress(lat, lng) {
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lng;
    const locInput = document.getElementById('location');
    locInput.value = "Fetching address...";

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        locInput.value = data.display_name || "Unknown Location";
    } catch { locInput.value = "Error fetching address"; }
}

async function searchArea() {
    const query = document.getElementById('mapSearch').value;
    if (!query) return;
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Pune")}`);
        const results = await res.json();
        if (results.length > 0) {
            const { lat, lon, display_name } = results[0];
            map.setView([lat, lon], 16);
            marker.setLatLng([lat, lon]);
            document.getElementById('location').value = display_name;
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lon;
        }
    } catch { alert("Search service error"); }
}

function toggleOtherCategory() {
    const categorySelect = document.getElementById("category");
    const otherInput = document.getElementById("otherCategoryInput");
    const isOther = categorySelect.value === "Other";
    otherInput.style.display = isOther ? "block" : "none";
    otherInput.required = isOther;
}
