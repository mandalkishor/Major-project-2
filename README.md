# CivicConnect-Smart-Complaint-Reporting-System

CivicConnect is a high-performance, citizen-driven platform designed to bridge the gap between residents and local authorities. It empowers users to report real-world issues such as road damage, garbage, and streetlighting with precise GPS data, real-time tracking, and data-driven analytics and stronger civic responsibility at zero cost.

## 📺 Project Walkthrough
### 🚀 [Live Demo: Experience CivicConnect](https://civic-connect-smart-complaint-repor.vercel.app/)
### 🚀 [Demo Video Link: ](https://youtu.be/xBH3V7bbu4A)
Click the badge above to watch the full project explanation and technical demonstration

## 🧩 The Problem

In many cities, civic issues often go unreported or unresolved due to:
- Opacity: Citizens don't know the status of their reports.
- Inaccuracy: Manual location descriptions lead to confusion for repair crews.
- Redundancy: Multiple people reporting the same pothole creates data noise.
- Friction: Complicated login processes prevent quick reporting.
- Citizens rarely receive updates once a complaint is raised, leading to frustration and mistrust in governance systems.

## 💡 Our Solution

CivicConnect provides a zero-cost, web-based solution where:
- Interactive Map Reporting: Users drop a pin to capture exact coordinates (Latitude/Longitude).
- Public Dashboard: A transparent view of all civic issues and their current resolution status.
- Intelligent Grouping: A "Report Same Issue" feature that increases priority without cluttering the database.
- Visual Analytics: Dynamic charts to help authorities identify high-frequency problem zones.
- This system ensures end-to-end visibility from complaint submission to resolution.

## 👉 View all screenshots in the **/screenshots** folder.

## Process Flow & System Architecture Diagram

![image](https://github.com/omsalokhe/CivicConnect-Smart-Complaint-Reporting-System/blob/e53d61f04c99acab8024e98ab431fd0788c021b1/public/architecture%20of%20process.png)

## 🚀 Opportunities Addressed
 ![image](https://github.com/omsalokhe/CivicConnect-Smart-Complaint-Reporting-System/blob/8ff8e4820e6da8308370b6ec7800886077fb0f8a/public/image4_imresizer.jpg)
  

## How CivicConnect Is Different & Better

<img width="600" height="600" alt="image" src="https://github.com/user-attachments/assets/db85de9a-414b-4494-a7ac-b466acbd4516" />

## 🧠 Brief About the Solution

- CivicConnect is built using a modern web architecture with separation of concerns:
  - Frontend handles UI and user interactions
  - Backend manages complaint logic and APIs
  - Database stores complaints securely
- The system ensures that:
  - Every complaint is uniquely identifiable
  - Status changes are reflected instantly
  - Duplicate complaints strengthen issue priority
  
## Technologies Used
- 🌐 Frontend
   - HTML5
   - CSS3 (Modern UI Design)
   - JavaScript (ES6+)
- ⚙ Backend
   - Node.js
   - Express.js
- 🗄 Database
   - MongoDB
   - Mongoose ODM
- Deployment
   - Netlify (Frontend)
- Analytics
   - Google Charts API

## 📂 System Architecture
### **High-Level Data Flow**
CivicConnect follows a **decoupled MERN architecture**, ensuring a clear separation between user interaction, business logic, and data persistence.
```mermaid
graph TD
    A[Citizen / User] -->|Reports Issue| B(Frontend: HTML/JS)
    B -->|API Request: POST| C{Backend: Node/Express}
    C -->|Store Data| D[(Database: MongoDB)]
    C -->|Fetch Stats| D
    C -->|Send Response| B
    B -->|Render Analytics| E[Google Charts API]
    B -->|Render Map| F[Leaflet.js / OSM]
    
    G[Admin] -->|Update Status| C
    C -->|PUT Request| D
```
## How to run locally?
1. Clone the repo:
   
git clone https://github.com/omsalokhe/CivicConnect-Smart-Complaint-Reporting-System

2. Install dependencies
   
npm install

3. Start backend
   
node server.js

4. Open frontend
   
Open index.html using Live Server

## 🛡️ License

 GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007
 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

## Developed with ❤️ for Smarter Cities.
- linkedin : www.linkedin.com/in/om-salokhe-78abb4339
- Demo Video Link: https://youtu.be/xBH3V7bbu4A
  
- ## 📺 Live Project Links
- MVP Link :
- **Frontend (UI):** [https://your-vercel-link.vercel.app](https://civic-connect-smart-complaint-repor.vercel.app/)
  - Hosting: Deployed on Vercel for high-performance frontend hosting, ensuring instant access across all devices.
  - Performance: Optimized for speed and responsiveness to provide a seamless user experience.
- **Backend (API):** [https://civicconnect-smart-complaint-reporting.onrender.com/api/complaints](https://civicconnect-smart-complaint-reporting.onrender.com/api/complaints)
  - Hosting: Powered by a live Node.js/Express API on Render to deliver real-time civic issue reporting.
  - Data Engine: Connects directly to MongoDB Atlas for secure, cloud-based data storage and status tracking.


