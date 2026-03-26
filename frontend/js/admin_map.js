// ==========================================
// 0. CONFIGURATION
// ==========================================
const API_URL = "https://civicconnect-smart-complaint-reporting.onrender.com/api/complaints";

// Global variable for the map
var adminMap;

// ==========================================
// 1. INITIALIZE MAP
// ==========================================
function initAdminMap() {
    const mapContainer = document.getElementById('adminMap');
    
    // Safety: Exit if the map container isn't found
    if (!mapContainer) return;

    // Destroy previous instance if it exists to prevent "already initialized" error
    if (adminMap) {
        adminMap.remove();
    }

    // Initialize Map centered on Pune
    adminMap = L.map('adminMap').setView([18.5204, 73.8567], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(adminMap);

    // Refresh size for flexbox layout (prevents gray box issue)
    setTimeout(() => {
        adminMap.invalidateSize();
    }, 500);

    // Fetch and plot data
    loadComplaintsOnMap();
}

// ==========================================
// 2. PLOT DATA ON MAP
// ==========================================
async function loadComplaintsOnMap() {
    try {
        const res = await fetch(API_URL);
        const complaints = await res.json();
        
        const validLocations = [];

        complaints.forEach(complaint => {
            // Only plot if coordinates exist
            if (complaint.latitude && complaint.longitude) {
                const lat = parseFloat(complaint.latitude);
                const lng = parseFloat(complaint.longitude);
                
                validLocations.push([lat, lng]);

                // Determine color: Bright Green for Resolved, Red for others
                const markerColor = complaint.status === 'Resolved' ? '#2ecc71' : '#ff0000';

                const marker = L.circleMarker([lat, lng], {
                    radius: 15,          // Big visible dots
                    fillColor: markerColor,
                    color: "#ffffff",    // White border
                    weight: 3,           // Thick border
                    opacity: 1,
                    fillOpacity: 1       // Solid color
                }).addTo(adminMap);

                // Popup with issue details
                marker.bindPopup(`
                    <div style="font-family: sans-serif;">
                        <b style="font-size: 14px; color: #333;">${complaint.category}</b><br>
                        <p style="margin: 5px 0; font-size: 12px;">${complaint.description}</p>
                        <small><b>ID:</b> ${complaint.complaintId}</small><br>
                        <small><b>Status:</b> ${complaint.status}</small>
                    </div>
                `);
            }
        });

        // Auto-zoom to fit all markers on the screen
        if (validLocations.length > 0) {
            const bounds = L.latLngBounds(validLocations);
            adminMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }

    } catch (err) {
        console.error("Map Data Error:", err);
    }
}

// ==========================================
// 3. ADMIN ACTIONS (OPTIONAL)
// ==========================================
// Function to update status directly from a map context if needed
async function updateStatusFromMap(id) {
    if (confirm("Mark this issue as Resolved?")) {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "Resolved" })
            });
            location.reload(); // Refresh to update marker color
        } catch (err) {
            alert("Update failed");
        }
    }
}

// Start the map after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initAdminMap);
