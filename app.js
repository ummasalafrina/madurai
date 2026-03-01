// --- State Management ---
const AppState = {
    user: null, // { name, phone, role, ward, points, reportsCount, cleanupsCount, badges }
    reports: [], // { id, location, category, desc, status: 'Pending'|'Resolved', photo, reporter, lat, lng }
    leaderboard: [
        { name: "Suresh K.", points: 850, role: "Volunteer", avatar: "https://ui-avatars.com/api/?name=Suresh+K&background=f1c40f&color=fff" },
        { name: "Anita M.", points: 620, role: "Citizen", avatar: "https://ui-avatars.com/api/?name=Anita+M&background=bdc3c7&color=fff" },
        { name: "Ramesh P.", points: 450, role: "Citizen", avatar: "https://ui-avatars.com/api/?name=Ramesh+P&background=cd7f32&color=fff" },
        { name: "Priya S.", points: 380, role: "Volunteer", avatar: "https://ui-avatars.com/api/?name=Priya+S&background=3498db&color=fff" },
        { name: "Kannan T.", points: 210, role: "Citizen", avatar: "https://ui-avatars.com/api/?name=Kannan+T&background=9b59b6&color=fff" }
    ],
    pendingUploadPhoto: null,
    pendingCleanupPhoto: null,
    currentViewingPinId: null
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const savedUser = localStorage.getItem('mcr_user');
    const savedReports = localStorage.getItem('mcr_reports');

    if (savedReports) {
        AppState.reports = JSON.parse(savedReports);
    } else {
        // Seed reports at real Madurai locations
        AppState.reports = [
            { id: 'R1', location: 'Anna Nagar', category: 'Plastic', desc: 'Plastic bottles scattered near the bus stop.', status: 'Pending', points: 50, photo: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&auto=format&fit=crop&q=60', reporter: 'Anita M.', lat: 9.9177, lng: 78.1453 },
            { id: 'R2', location: 'KK Nagar', category: 'Food Waste', desc: 'Food waste dumped outside the park gate.', status: 'In Progress', points: 50, photo: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=500&auto=format&fit=crop&q=60', reporter: 'Ramesh P.', lat: 9.9403, lng: 78.1348 },
            { id: 'R3', location: 'Periyar Bus Stand', category: 'Drainage', desc: 'Drainage overflow causing bad odor near the bus terminal.', status: 'Resolved', points: 75, photo: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=500&auto=format&fit=crop&q=60', reporter: 'Priya S.', lat: 9.9195, lng: 78.1223 },
            { id: 'R4', location: 'Mattuthavani', category: 'Construction', desc: 'Construction debris blocking the footpath.', status: 'Pending', points: 50, photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60', reporter: 'Kannan T.', lat: 9.9526, lng: 78.1388 }
        ];
        saveReports();
    }

    // Splash screen timing
    setTimeout(() => {
        if (savedUser) {
            AppState.user = JSON.parse(savedUser);
            updateDashboard();
            navigateTo('home-dashboard');
        } else {
            navigateTo('login-page');
        }
    }, 2000);

    setupEventListeners();
});

// --- Navigation ---
function navigateTo(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        if (screen.id === screenId) {
            screen.classList.remove('hidden');
            // small delay to allow display:block to apply before animating opacity
            setTimeout(() => {
                screen.classList.add('active');
            }, 10);
        } else {
            screen.classList.remove('active');
            setTimeout(() => {
                if (!screen.classList.contains('active')) {
                    screen.classList.add('hidden');
                }
            }, 400); // match transition time
        }
    });

    // Update bottom nav active state
    document.querySelectorAll('.bottom-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(screenId)) {
            item.classList.add('active');
        }
    });

    // Screen specific logic
    if (screenId === 'home-dashboard') {
        renderDashboardReports();
    } else if (screenId === 'map-screen') {
        renderMapPins();
    } else if (screenId === 'leaderboard-page') {
        renderLeaderboard();
    } else if (screenId === 'profile-page') {
        updateProfilePage();
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Role Selection
    document.querySelectorAll('.role-option').forEach(option => {
        option.addEventListener('click', (e) => {
            document.querySelectorAll('.role-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            document.getElementById('login-role').value = option.dataset.role;
        });
    });

    // Login Form Submit
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('login-name').value;
        const phone = document.getElementById('login-phone').value;
        const role = document.getElementById('login-role').value;
        const ward = document.getElementById('login-ward').value;

        if (!name || !phone || !role || !ward) {
            showToast('Please fill all fields', 'error');
            return;
        }

        const loader = document.querySelector('.btn-loader');
        const text = document.querySelector('.btn-text');

        loader.classList.remove('hidden');
        text.classList.add('hidden');

        // Simulate API call
        setTimeout(() => {
            AppState.user = {
                name, phone, role, ward,
                points: 0,
                reportsCount: 0,
                cleanupsCount: 0,
                badges: []
            };

            // If phone exists in leaderboard, merge it for demo purposes
            const existingUser = AppState.leaderboard.find(u => u.name.toLowerCase().includes(name.split(' ')[0].toLowerCase()));
            if (existingUser) {
                AppState.user.points = existingUser.points;
                checkBadges(true); // silent check
            }

            localStorage.setItem('mcr_user', JSON.stringify(AppState.user));

            updateDashboard();
            loader.classList.add('hidden');
            text.classList.remove('hidden');

            showToast(`Welcome ${name}! Logged in as ${role} from ${ward}`, 'success');
            navigateTo('home-dashboard');
        }, 1500);
    });

    // Report Flow - Photo Upload
    document.getElementById('garbage-photo').addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('photo-preview').src = e.target.result;
                AppState.pendingUploadPhoto = e.target.result;
                document.getElementById('photo-upload-container').querySelector('.upload-area').classList.add('hidden');
                document.getElementById('photo-preview-container').classList.remove('hidden');
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    document.getElementById('remove-photo-btn').addEventListener('click', () => {
        document.getElementById('garbage-photo').value = '';
        AppState.pendingUploadPhoto = null;
        document.getElementById('photo-preview-container').classList.add('hidden');
        document.getElementById('photo-upload-container').querySelector('.upload-area').classList.remove('hidden');
    });

    // Report Flow - Location Detect
    document.getElementById('detect-location-btn').addEventListener('click', () => {
        const locInput = document.getElementById('report-location');
        locInput.value = "Detecting...";
        setTimeout(() => {
            const locations = ["Anna Nagar Street 4", "K K Nagar Park", "Tallakulam Junction", "Goripalayam Signal"];
            locInput.value = locations[Math.floor(Math.random() * locations.length)];
        }, 1000);
    });

    // Report Flow - Category Selection
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.category-item').forEach(cat => cat.classList.remove('selected'));
            item.classList.add('selected');
            document.getElementById('report-category').value = item.dataset.category;
        });
    });

    // Submit Report
    document.getElementById('submit-report-btn').addEventListener('click', () => {
        const photo = AppState.pendingUploadPhoto;
        const location = document.getElementById('report-location').value;
        const category = document.getElementById('report-category').value;
        const desc = document.getElementById('report-desc').value;

        if (!photo || !location || !category) {
            showToast('Please provide photo, location and category', 'error');
            return;
        }

        const newReport = {
            id: 'R' + Date.now(),
            location,
            category,
            desc,
            status: 'Pending',
            points: 50,
            photo,
            reporter: AppState.user.name,
            // Random offset around Madurai center for demo
            lat: 9.9252 + (Math.random() - 0.5) * 0.04,
            lng: 78.1198 + (Math.random() - 0.5) * 0.04
        };

        AppState.reports.unshift(newReport);
        saveReports();

        // Update User Stats & Gamification
        AppState.user.reportsCount += 1;
        addPoints(50, 'Reporting Garbage');
        saveUser();

        showToast('Report Submitted Successfully!', 'success');

        // Reset form
        document.getElementById('remove-photo-btn').click();
        document.getElementById('report-location').value = '';
        document.getElementById('report-desc').value = '';
        document.querySelectorAll('.category-item').forEach(c => c.classList.remove('selected'));
        document.getElementById('report-category').value = '';

        setTimeout(() => {
            navigateTo('home-dashboard');
        }, 1500);
    });

    // --- Volunteer Cleanup Flow Events ---
    document.getElementById('accept-cleanup-btn').addEventListener('click', () => {
        document.getElementById('accept-cleanup-flow').classList.add('hidden');
        document.getElementById('complete-cleanup-flow').classList.remove('hidden');
    });

    document.getElementById('cleanup-photo').addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('cleanup-preview').src = e.target.result;
                AppState.pendingCleanupPhoto = e.target.result;
                document.getElementById('cleanup-photo-container').querySelector('.upload-area').classList.add('hidden');
                document.getElementById('cleanup-preview-container').classList.remove('hidden');
                document.getElementById('mark-cleaned-btn').disabled = false;
            }
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    document.getElementById('mark-cleaned-btn').addEventListener('click', () => {
        const reportIndex = AppState.reports.findIndex(r => r.id === AppState.currentViewingPinId);
        if (reportIndex > -1) {
            AppState.reports[reportIndex].status = 'Resolved';
            saveReports();

            AppState.user.cleanupsCount += 1;
            addPoints(75, 'Cleaning an Area');
            saveUser();

            closeSheet();
            addMapMarkers(); // Refresh markers – update pin to green
        }
    });
}

// --- UI Updaters ---

function updateDashboard() {
    if (!AppState.user) return;

    // Set avatars
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(AppState.user.name)}&background=27ae60&color=fff`;
    document.getElementById('nav-avatar').src = avatarUrl;
    document.getElementById('profile-avatar').src = avatarUrl;

    document.getElementById('welcome-message').innerText = `Hello ${AppState.user.name.split(' ')[0]}`;
    document.getElementById('role-ward-message').innerText = `${AppState.user.role} • ${AppState.user.ward.split('(')[0].trim()}`;

    document.getElementById('nav-points-val').innerText = AppState.user.points;
    document.getElementById('stat-reports').innerText = AppState.user.reportsCount;
    document.getElementById('stat-cleanups').innerText = AppState.user.cleanupsCount;

    // Pre-fill profile page too
    updateProfilePage();
}

function renderDashboardReports() {
    const list = document.getElementById('dashboard-reports-list');
    list.innerHTML = '';

    if (AppState.reports.length === 0) {
        list.innerHTML = `<div class="empty-state">No reports yet. Be the first!</div>`;
        return;
    }

    // Show top 3 recent
    const recent = AppState.reports.slice(0, 3);

    recent.forEach(report => {
        const div = document.createElement('div');
        div.className = 'report-item';
        div.innerHTML = `
            <img src="${report.photo}" class="report-img" alt="Garbage">
            <div class="report-info">
                <h4>${report.location}</h4>
                <p>
                    <span class="status-badge ${report.status.toLowerCase()}">${report.status}</span>
                    • ${report.category}
                </p>
            </div>
        `;
        list.appendChild(div);
    });
}

// ─────────────────────────────────────────────
// Leaflet / OpenStreetMap map – NO API KEY needed
// ─────────────────────────────────────────────
let lMap = null;          // Leaflet map instance
let lMarkers = [];        // Leaflet layer for report markers
let lUserMarker = null;   // Blue dot for user location

/**
 * Build a coloured SVG drop-pin as a Leaflet DivIcon.
 */
function makePinIcon(color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11.314 16 26 16 26S32 27.314 32 16C32 7.163 24.837 0 16 0z"
            fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="16" cy="16" r="7" fill="#fff" fill-opacity="0.9"/>
    </svg>`;
    return L.divIcon({
        html: svg,
        className: '',           // No Leaflet default white box
        iconSize: [32, 42],
        iconAnchor: [16, 42],    // tip of the pin
        popupAnchor: [0, -44]
    });
}

/**
 * Returns pin colour + points label for a report status.
 */
function statusMeta(status) {
    switch (status) {
        case 'Resolved': return { color: '#27ae60', label: '+75 pts' };
        case 'In Progress': return { color: '#f39c12', label: '+50 pts (In Progress)' };
        default: return { color: '#e74c3c', label: '+50 pts' };
    }
}

/**
 * Called the first time the map screen becomes visible.
 * Creates a Leaflet map with OSM tiles and wires up controls.
 */
function initLeafletMap() {
    if (lMap) {
        // Already initialised – just refresh markers
        addLeafletMarkers();
        return;
    }

    const MADURAI = [9.9252, 78.1198];

    lMap = L.map('leaflet-map', {
        center: MADURAI,
        zoom: 13,
        zoomControl: false   // we supply our own buttons
    });

    // OpenStreetMap tile layer – completely free, no key required
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(lMap);

    // Wire up custom zoom + locate buttons in the header
    document.getElementById('zoom-in-btn').addEventListener('click', () => lMap.zoomIn());
    document.getElementById('zoom-out-btn').addEventListener('click', () => lMap.zoomOut());
    document.getElementById('locate-me-btn').addEventListener('click', locateUser);

    addLeafletMarkers();
}

/**
 * Place / refresh all report pins on the map.
 */
function addLeafletMarkers() {
    // Remove stale markers
    lMarkers.forEach(m => m.remove());
    lMarkers = [];

    AppState.reports.forEach(report => {
        const { color } = statusMeta(report.status);
        const icon = makePinIcon(color);
        const marker = L.marker([report.lat, report.lng], { icon, title: report.location });

        marker.on('click', () => openPinDetails(report));
        marker.addTo(lMap);
        lMarkers.push(marker);
    });
}

/**
 * Request the browser's real GPS location and drop a blue dot.
 */
function locateUser() {
    if (!navigator.geolocation) {
        showToast('Geolocation not supported by this browser', 'error');
        return;
    }
    showToast('Locating you…');
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const { latitude: lat, longitude: lng } = pos.coords;

            if (lUserMarker) lUserMarker.remove();

            // Blue SVG dot
            const blueDot = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" fill="#4285F4" stroke="#fff" stroke-width="3"/>
              <circle cx="10" cy="10" r="14" fill="#4285F4" fill-opacity="0.15"/>
            </svg>`;
            const icon = L.divIcon({ html: blueDot, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });

            lUserMarker = L.marker([lat, lng], { icon, title: 'You are here' });
            lUserMarker.addTo(lMap);
            lMap.setView([lat, lng], 15);
            showToast('Location found! 📍', 'success');
        },
        () => {
            // Geolocation denied – simulate near Madurai centre
            const simLat = 9.9252 + (Math.random() - 0.5) * 0.01;
            const simLng = 78.1198 + (Math.random() - 0.5) * 0.01;

            if (lUserMarker) lUserMarker.remove();

            const blueDot = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" fill="#4285F4" stroke="#fff" stroke-width="3"/>
              <circle cx="10" cy="10" r="14" fill="#4285F4" fill-opacity="0.15"/>
            </svg>`;
            const icon = L.divIcon({ html: blueDot, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });

            lUserMarker = L.marker([simLat, simLng], { icon, title: 'Simulated Location' });
            lUserMarker.bindPopup('<strong>Simulated location</strong><br>near Madurai city centre').openPopup();
            lUserMarker.addTo(lMap);
            lMap.setView([simLat, simLng], 15);
            showToast('Showing simulated location 📍');
        }
    );
}

/**
 * renderMapPins – called by navigateTo. Initialises or refreshes the map.
 */
function renderMapPins() {
    // Use a short timeout so the screen's CSS transition finishes
    // before Leaflet measures the container size.
    setTimeout(() => {
        initLeafletMap();
        if (lMap) lMap.invalidateSize();
    }, 420);
}

/**
 * addMapMarkers – called after a cleanup to refresh pins.
 */
function addMapMarkers() {
    if (lMap) addLeafletMarkers();
}

// ─── Bottom-sheet detail popup ───────────────

function openPinDetails(report) {
    AppState.currentViewingPinId = report.id;

    const statusEl = document.getElementById('sheet-status');
    statusEl.className = `status-badge ${report.status === 'In Progress' ? 'in-progress' : report.status.toLowerCase()}`;
    statusEl.innerText = report.status;

    document.getElementById('sheet-category').innerText = report.category;
    document.getElementById('sheet-img').src = report.photo;
    document.getElementById('sheet-location').innerText = report.location;
    document.getElementById('sheet-desc').innerText = report.desc || 'No description provided.';
    document.getElementById('sheet-reporter').innerText = report.reporter;

    const { label } = statusMeta(report.status);
    document.getElementById('sheet-points').innerText = label;

    const actionArea = document.getElementById('volunteer-action-area');

    if (report.status === 'Pending' && AppState.user && AppState.user.role === 'Volunteer') {
        actionArea.classList.remove('hidden');
        document.getElementById('accept-cleanup-flow').classList.remove('hidden');
        document.getElementById('complete-cleanup-flow').classList.add('hidden');

        document.getElementById('cleanup-photo').value = '';
        AppState.pendingCleanupPhoto = null;
        document.getElementById('cleanup-preview-container').classList.add('hidden');
        document.getElementById('cleanup-photo-container').querySelector('.upload-area').classList.remove('hidden');
        document.getElementById('mark-cleaned-btn').disabled = true;
    } else {
        actionArea.classList.add('hidden');
    }

    document.getElementById('pin-details-sheet').classList.add('active');
}

function closeSheet() {
    document.getElementById('pin-details-sheet').classList.remove('active');
}

function renderLeaderboard() {
    // Add current user to leaderboard temp array for sorting
    let displayBoard = [...AppState.leaderboard];

    // Check if user already in mock data
    const existingIndex = displayBoard.findIndex(u => u.name === AppState.user.name);
    if (existingIndex === -1 && AppState.user.points > 0) {
        displayBoard.push({
            name: AppState.user.name,
            points: AppState.user.points,
            role: AppState.user.role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(AppState.user.name)}&background=27ae60&color=fff`,
            isCurrentUser: true
        });
    } else if (existingIndex > -1) {
        displayBoard[existingIndex].points = AppState.user.points;
        displayBoard[existingIndex].isCurrentUser = true;
    }

    displayBoard.sort((a, b) => b.points - a.points);

    // Top 3
    const topThree = document.getElementById('top-three-container');
    topThree.innerHTML = '';

    const rankOrder = [1, 0, 2]; // For display layout: 2nd, 1st, 3rd
    rankOrder.forEach(idx => {
        if (displayBoard[idx]) {
            const user = displayBoard[idx];
            const rank = idx + 1;
            const highlight = user.isCurrentUser ? 'font-weight: 800; color: var(--primary-color)' : '';

            topThree.innerHTML += `
                <div class="top-user rank-${rank}">
                    <div class="avatar-wrapper" style="position:relative">
                        <img src="${user.avatar}" class="avatar" alt="${user.name}">
                        <div class="rank-badge">${rank}</div>
                    </div>
                    <h4 style="${highlight}">${user.name.split(' ')[0]}</h4>
                    <span>${user.points} pts</span>
                </div>
            `;
        }
    });

    // Rest of list
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    for (let i = 3; i < displayBoard.length; i++) {
        const user = displayBoard[i];
        const highlight = user.isCurrentUser ? 'background: rgba(46, 204, 113, 0.1); border: 1px solid var(--primary-color);' : '';

        list.innerHTML += `
            <div class="lb-item" style="${highlight}">
                <div class="lb-rank">${i + 1}</div>
                <img src="${user.avatar}" class="avatar" style="width:40px; height:40px;" alt="${user.name}">
                <div class="lb-info">
                    <h4>${user.name} <small style="color:var(--text-light); font-weight:normal">(${user.role})</small></h4>
                </div>
                <div class="lb-points">${user.points} pts</div>
            </div>
        `;
    }
}

function updateProfilePage() {
    if (!AppState.user) return;

    document.getElementById('profile-name').innerText = AppState.user.name;
    document.getElementById('profile-ward').innerText = AppState.user.ward;
    document.getElementById('profile-role').innerText = AppState.user.role;

    document.getElementById('profile-total-points').innerText = AppState.user.points;
    document.getElementById('profile-reports').innerText = AppState.user.reportsCount;
    document.getElementById('profile-cleanups').innerText = AppState.user.cleanupsCount;

    // Badges update
    const hasHero = AppState.user.points >= 100;
    const hasGuardian = AppState.user.points >= 300;

    const heroBadge = document.getElementById('badge-hero');
    const guardianBadge = document.getElementById('badge-guardian');

    if (hasHero) {
        heroBadge.classList.remove('locked');
        if (!AppState.user.badges.includes('Street Hero')) AppState.user.badges.push('Street Hero');
    }

    if (hasGuardian) {
        guardianBadge.classList.remove('locked');
        if (!AppState.user.badges.includes('Madurai Guardian')) AppState.user.badges.push('Madurai Guardian');
    }
}

// --- Gamification Logic ---
function addPoints(points, reason) {
    const previousPoints = AppState.user.points;
    AppState.user.points += points;
    updateDashboard(); // Update top nav immediately

    // Show Reward Popup
    document.getElementById('reward-title').innerText = "Great Work!";
    document.getElementById('reward-message').innerText = `You earned ${points} Points for ${reason}!`;
    document.getElementById('reward-points').innerText = `+${points}`;
    document.getElementById('reward-popup').classList.remove('hidden');

    // Check for badges after popup is closed
    setTimeout(() => {
        checkBadges(false, previousPoints, AppState.user.points);
    }, 500);
}

function closeRewardPopup() {
    document.getElementById('reward-popup').classList.add('hidden');
}

function checkBadges(silent, prevPoints = 0, newPoints = 0) {
    if (!AppState.user.badges) AppState.user.badges = [];

    let unlocked = null;

    if (newPoints >= 100 && prevPoints < 100 && !AppState.user.badges.includes('Street Hero')) {
        unlocked = { name: 'Street Hero', icon: 'fa-medal', color: 'linear-gradient(135deg, #3498db, #2980b9)' };
        AppState.user.badges.push('Street Hero');
    } else if (newPoints >= 300 && prevPoints < 300 && !AppState.user.badges.includes('Madurai Guardian')) {
        unlocked = { name: 'Madurai Guardian', icon: 'fa-shield-halved', color: 'linear-gradient(135deg, #9b59b6, #8e44ad)' };
        AppState.user.badges.push('Madurai Guardian');
    }

    if (unlocked && !silent) {
        // Wait for reward popup to likely be closed, or show sequentially
        setTimeout(() => {
            document.getElementById('unlocked-badge-name').innerText = unlocked.name;
            const iconContainer = document.getElementById('unlocked-badge-icon');
            iconContainer.innerHTML = `<i class="fa-solid ${unlocked.icon}"></i>`;
            iconContainer.style.background = unlocked.color;

            document.getElementById('badge-popup').classList.remove('hidden');
        }, 1500); // Wait 1.5s after reward popup appears
    }

    saveUser();
}

function closeBadgePopup() {
    document.getElementById('badge-popup').classList.add('hidden');
}

// --- Utils ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideDown 0.3s cubic-bezier(0.25, 1, 0.5, 1) reverse';
        setTimeout(() => toast.remove(), 280);
    }, 3000);
}

function saveUser() {
    localStorage.setItem('mcr_user', JSON.stringify(AppState.user));
}

function saveReports() {
    localStorage.setItem('mcr_reports', JSON.stringify(AppState.reports));
}

function logout() {
    localStorage.removeItem('mcr_user');
    AppState.user = null;
    navigateTo('login-page');
}
