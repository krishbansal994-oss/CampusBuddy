import { useState, useEffect } from "react";
import "./App.css";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, addDoc, setDoc, deleteDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import Auth from "./auth";


const spaces = [
  {
    id: 1,
    name: "Central Library",
    type: "Library",
    location: "2nd Floor",
    capacity: 50,
    available: 18,
    status: "Available",
    environment: "Quiet",
    description:
      "A quiet study-friendly space with individual seating and a focused environment.",
  },
  {
    id: 2,
    name: "Block 34 - Room 204",
    type: "Classroom",
    location: "2nd Floor",
    capacity: 40,
    available: 8,
    status: "Moderate",
    environment: "Quiet",
    description:
      "A classroom suitable for focused work, revision and small group study.",
  },
  {
    id: 3,
    name: "Student Activity Center",
    type: "Common Area",
    location: "Ground Floor",
    capacity: 60,
    available: 32,
    status: "Available",
    environment: "Social",
    description:
      "A relaxed common area for collaboration, student activities and group work.",
  },
  {
    id: 4,
    name: "Block 32 - Study Hall",
    type: "Study Hall",
    location: "1st Floor",
    capacity: 35,
    available: 5,
    status: "Busy",
    environment: "Quiet",
    description:
      "A dedicated study hall. It is currently busy, but a few seats remain.",
  },
];


const studyActivities = [
  { id: 1, topic: "DSA / LeetCode", duration: "2 hrs", floor: "Floor 2" },
  { id: 2, topic: "Calculus", duration: "1 hr", floor: "Floor 2" },
  { id: 3, topic: "Web Development", duration: "2 hrs", floor: "Floor 2" },
];

const crowdData = [
  { time: "9:00 AM – 11:00 AM", value: 25, label: "Best time for silent study" },
  { time: "1:00 PM – 3:00 PM", value: 85, label: "Peak class break rush" },
  { time: "6:00 PM – 9:00 PM", value: 60, label: "Moderate evening crowd" },
];

const nightModeItems = [
  {
    icon: "🍜",
    title: "Late-Night Food",
    text: "Check late-night campus food options in the demo.",
  },
  {
    icon: "📚",
    title: "Late Study",
    text: "Central Library reading room night-hours concept.",
  },
  {
    icon: "☎️",
    title: "Emergency Quick-Dial",
    text: "One-tap access to emergency support numbers.",
  },
];

const events = [
  {
    id: 1,
    title: "AI & Innovation Workshop",
    category: "TECHNOLOGY",
    date: "12",
    month: "SEP",
    time: "5:00 PM",
    location: "Block 34",
    description:
      "Learn about practical AI, innovation and emerging technologies with fellow students.",
  },
  {
    id: 2,
    title: "Campus Coding Challenge",
    category: "COMPETITION",
    date: "13",
    month: "SEP",
    time: "6:30 PM",
    location: "University Auditorium",
    description:
      "A campus coding competition focused on programming, problem solving and teamwork.",
  },
  {
    id: 3,
    title: "Inter-University Football",
    category: "SPORTS",
    date: "14",
    month: "SEP",
    time: "4:00 PM",
    location: "Sports Complex",
    description:
      "Watch students compete in an inter-university football event at the Sports Complex.",
  },
  {
    id: 4,
    title: "Design Club Meetup",
    category: "CLUB",
    date: "15",
    month: "SEP",
    time: "4:00 PM",
    location: "Student Activity Center",
    description:
      "Meet creative students and explore design, UI/UX and visual projects.",
  },
];

const initialLostFoundReports = [
  {
    id: 1,
    type: "Lost",
    item: "Black Wireless Headphones",
    location: "Near Block 34",
    date: "Today",
    description: "Black over-ear wireless headphones.",
    icon: "🎧",
  },
  {
    id: 2,
    type: "Found",
    item: "Student ID Card",
    location: "Near Central Library",
    date: "Today",
    description: "Student ID card found near the library entrance.",
    icon: "💳",
  },
  {
    id: 3,
    type: "Lost",
    item: "Engineering Notebook",
    location: "Student Activity Center",
    date: "Yesterday",
    description: "Engineering notebook with handwritten class notes.",
    icon: "📚",
  },
];

const foodPlaces = [
  {
    id: 1,
    name: "Uni Mall Food Court",
    cuisine: "Multi-cuisine",
    price: "₹80 - ₹250",
    crowd: "Moderate",
    rating: "4.4",
    description:
      "A convenient multi-cuisine food court with meals, snacks and drinks.",
  },
  {
    id: 2,
    name: "Campus Cafe",
    cuisine: "Snacks & Coffee",
    price: "₹40 - ₹150",
    crowd: "Busy",
    rating: "4.2",
    description:
      "A quick stop for coffee, snacks and casual campus conversations.",
  },
  {
    id: 3,
    name: "South Indian Corner",
    cuisine: "South Indian",
    price: "₹50 - ₹180",
    crowd: "Available",
    rating: "4.5",
    description:
      "South Indian breakfast and meal options with relatively lower crowd levels.",
  },
];

const notices = [
  {
    id: 1,
    title: "Mid-Semester Examination Schedule",
    date: "11 Sep",
    type: "ACADEMIC",
    text: "Check your examination timetable and reporting instructions.",
    detail:
      "The latest demo academic notice contains the mid-semester examination schedule and reporting instructions. Students should check the official university communication before relying on this prototype data.",
  },
  {
    id: 2,
    title: "Holiday Announcement",
    date: "10 Sep",
    type: "NOTICE",
    text: "University holiday information and updated academic schedule.",
    detail:
      "This notice contains a holiday announcement and an updated academic schedule for students.",
  },
  {
    id: 3,
    title: "Assignment Submission Reminder",
    date: "9 Sep",
    type: "DEADLINE",
    text: "Students are reminded to complete pending submissions.",
    detail:
      "Students are reminded to review pending assignments and submit them before their applicable deadlines.",
  },
];

const buses = [
  {
    id: 1,
    route: "Route A",
    destination: "Main Gate",
    time: "Every 15 min",
    eta: "7 min",
    description:
      "A convenient route connecting the main campus area with the Main Gate.",
  },
  {
    id: 2,
    route: "Route B",
    destination: "Hostel Area",
    time: "Every 20 min",
    eta: "12 min",
    description:
      "Connects academic areas with the hostel zone for convenient student travel.",
  },
  {
    id: 3,
    route: "Route C",
    destination: "Academic Blocks",
    time: "Every 15 min",
    eta: "4 min",
    description:
      "Useful for quick travel between the main academic blocks.",
  },
];

const academicItems = [
  {
    id: "timetable",
    icon: "🕐",
    title: "Today's Timetable",
    text: "10:00 AM - Chemical Engineering • Block 34",
    detail:
      "Your demo timetable shows a Chemical Engineering class at 10:00 AM in Block 34.",
  },
  {
    id: "assignments",
    icon: "📝",
    title: "Assignments",
    text: "3 pending assignments • Next deadline Friday",
    detail:
      "You currently have 3 pending assignments in the demo dashboard. The nearest demo deadline is Friday.",
  },
  {
    id: "attendance",
    icon: "📊",
    title: "Attendance",
    text: "Current semester attendance: 86%",
    detail:
      "Your demo attendance is currently 86%. Keep attending regularly to stay above your target.",
  },
  {
    id: "exams",
    icon: "📅",
    title: "Examinations",
    text: "Mid-semester examinations begin next week.",
    detail:
      "Mid-semester examinations begin next week. Check the latest notice for the timetable.",
  },
];

const communityItems = [
  {
    id: "study",
    icon: "🤝",
    title: "Find a Study Partner",
    text: "Connect with students preparing for the same subjects.",
    detail:
      "Find students studying the same subjects and form focused study groups.",
  },
  {
    id: "projects",
    icon: "💻",
    title: "Find Project Teammates",
    text: "Looking for someone who knows React, Python, design or AI?",
    detail:
      "Discover project opportunities and find teammates with complementary skills.",
  },
  {
    id: "clubs",
    icon: "🎭",
    title: "Join a Club",
    text: "Discover technology, sports, cultural and creative clubs.",
    detail:
      "Explore student clubs and activities based on your interests.",
  },
  {
    id: "ask",
    icon: "❓",
    title: "Ask the Community",
    text: "Ask questions and share useful campus information.",
    detail:
      "Create a campus question or share useful information with other students.",
  },
];

const helpItems = [
  {
    id: "medical",
    icon: "🚑",
    title: "Medical Emergency",
    text: "Contact campus medical services immediately.",
    detail:
      "For a medical emergency, contact the appropriate campus medical service immediately.",
  },
  {
    id: "security",
    icon: "🛡️",
    title: "Campus Security",
    text: "Use campus security for urgent safety concerns.",
    detail:
      "Contact campus security for urgent safety concerns or suspicious activity.",
  },
  {
    id: "emergency",
    icon: "☎️",
    title: "Emergency",
    text: "For immediate danger, contact local emergency services.",
    detail:
      "For immediate danger, contact local emergency services immediately.",
  },
];

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #dbe2ea",
  fontSize: "15px",
  boxSizing: "border-box",
  fontFamily: "inherit",
};


function getAIIntent(query) {
  const text = query.toLowerCase();

  if (
    text.includes("study") ||
    text.includes("quiet") ||
    text.includes("library") ||
    text.includes("seat") ||
    text.includes("space") ||
    text.includes("room")
  ) {
    return {
      type: "spaces",
      title: "Best match: a quiet study space",
      message:
        "I found campus spaces that match your study needs. Central Library is the strongest demo recommendation because it is marked Quiet with 18 seats available.",
      action: "spaces",
    };
  }

  if (
    text.includes("event") ||
    text.includes("coding") ||
    text.includes("hackathon") ||
    text.includes("workshop") ||
    text.includes("competition") ||
    text.includes("club") ||
    text.includes("sports")
  ) {
    return {
      type: "events",
      title: "I found something happening on campus",
      message:
        "The CampusBuddy demo has upcoming technology, competition, sports and club events. The AI & Innovation Workshop is the closest technology-focused match.",
      action: "events",
    };
  }

  if (
    text.includes("food") ||
    text.includes("eat") ||
    text.includes("canteen") ||
    text.includes("cafe") ||
    text.includes("coffee") ||
    text.includes("lunch") ||
    text.includes("dinner")
  ) {
    return {
      type: "food",
      title: "Here are your food options",
      message:
        "For a lower-crowd option, South Indian Corner is the current demo recommendation. Campus Cafe is also available for snacks and coffee.",
      action: "food",
    };
  }

  if (
    text.includes("lost") ||
    text.includes("found") ||
    text.includes("id card") ||
    text.includes("headphone") ||
    text.includes("wallet") ||
    text.includes("notebook")
  ) {
    return {
      type: "lostfound",
      title: "Let's sort out Lost & Found",
      message:
        "CampusBuddy can take you to the Lost & Found board, where students can report missing or found belongings.",
      action: "lostfound",
    };
  }

  if (
    text.includes("assignment") ||
    text.includes("attendance") ||
    text.includes("timetable") ||
    text.includes("exam") ||
    text.includes("academic") ||
    text.includes("class")
  ) {
    return {
      type: "academic",
      title: "Your academic hub is the best place to check",
      message:
        "Open the Academic Hub for the demo timetable, assignments, attendance and examination information.",
      action: "academic",
    };
  }

  if (
    text.includes("notice") ||
    text.includes("announcement") ||
    text.includes("holiday") ||
    text.includes("update")
  ) {
    return {
      type: "notices",
      title: "I found the campus updates area",
      message:
        "The Campus Notices section contains the current demo academic and university announcements.",
      action: "notices",
    };
  }

  if (
    text.includes("bus") ||
    text.includes("transport") ||
    text.includes("hostel") ||
    text.includes("route")
  ) {
    return {
      type: "transport",
      title: "Let's check campus transport",
      message:
        "The Transport section shows the demo campus routes, frequencies and estimated next arrivals.",
      action: "transport",
    };
  }

  if (
    text.includes("help") ||
    text.includes("emergency") ||
    text.includes("security") ||
    text.includes("medical") ||
    text.includes("broken") ||
    text.includes("maintenance")
  ) {
    return {
      type: "help",
      title: "Campus Help can handle this",
      message:
        "You can report a maintenance or support issue here, and the page also shows important emergency guidance.",
      action: "help",
    };
  }

  if (
    text.includes("community") ||
    text.includes("partner") ||
    text.includes("teammate") ||
    text.includes("project")
  ) {
    return {
      type: "community",
      title: "Let's connect you with other students",
      message:
        "The Student Community area helps you find study partners, project teammates and student clubs.",
      action: "community",
    };
  }

  return {
    type: "ai",
    title: "I can help you navigate CampusBuddy",
    message:
      "Try asking about a study space, coding event, food, lost items, exams, notices, transport, campus help or student community.",
    action: "ai",
  };
}


async function sendSeatAlertRequest(spaceName) {
  const response = await fetch("http://localhost:3001/api/seat-alert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ spaceName }),
  });

  if (!response.ok) {
    throw new Error("Seat alert server is not running");
  }

  return response.json();
}


/*
 * CAMPUS MAP
 *
 * This is intentionally a lightweight, dependency-free campus map.
 * It uses real campus service names from the demo data and keeps the
 * location selection synchronized with the Space Finder list.
 *
 * The visual styling is primarily handled by App.css so this component
 * remains usable in both day mode and Night-Owl mode.
 */
const campusMapPoints = [
  {
    id: "library",
    name: "Central Library",
    short: "Library",
    icon: "📚",
    x: 22,
    y: 30,
    spaceId: 1,
    kind: "study",
  },
  {
    id: "block34",
    name: "Block 34",
    short: "Classrooms",
    icon: "🏫",
    x: 55,
    y: 24,
    spaceId: 2,
    kind: "academic",
  },
  {
    id: "activity",
    name: "Student Activity Center",
    short: "Activities",
    icon: "🤝",
    x: 76,
    y: 48,
    spaceId: 3,
    kind: "community",
  },
  {
    id: "block32",
    name: "Block 32 Study Hall",
    short: "Study Hall",
    icon: "📖",
    x: 38,
    y: 67,
    spaceId: 4,
    kind: "study",
  },
  {
    id: "food",
    name: "Food Court",
    short: "Food",
    icon: "🍔",
    x: 68,
    y: 75,
    spaceId: null,
    kind: "food",
  },
  {
    id: "gate",
    name: "Main Gate",
    short: "Entry",
    icon: "🚪",
    x: 10,
    y: 78,
    spaceId: null,
    kind: "entry",
  },
];

function CampusMap({ spaces: mapSpaces, selectedSpace, onSelectSpace }) {
  const safeSpaces = Array.isArray(mapSpaces) ? mapSpaces : [];

  function handlePointClick(point) {
    if (!point.spaceId) return;

    const match = safeSpaces.find(
      (space) => String(space.id) === String(point.spaceId)
    );

    if (match && typeof onSelectSpace === "function") {
      onSelectSpace(match);
    }
  }

  return (
    <section className="campus-map-panel" aria-label="Campus map">
      <div className="campus-map-heading">
        <div>
          <span className="eyebrow">CAMPUS MAP</span>
          <h2>Find your way around</h2>
          <p>
            Select a mapped place to open its live space information.
            This is a visual campus layout for the CampusBuddy prototype.
          </p>
        </div>

        <div className="campus-map-legend" aria-label="Map legend">
          <span>
            <i className="map-legend-dot map-legend-dot-study" />
            Study
          </span>
          <span>
            <i className="map-legend-dot map-legend-dot-academic" />
            Academic
          </span>
          <span>
            <i className="map-legend-dot map-legend-dot-community" />
            Community
          </span>
        </div>
      </div>

      <div className="campus-map-canvas">
        <div className="campus-map-road campus-map-road-main" />
        <div className="campus-map-road campus-map-road-cross" />
        <div className="campus-map-green campus-map-green-one" />
        <div className="campus-map-green campus-map-green-two" />
        <div className="campus-map-water" />

        {campusMapPoints.map((point) => {
          const isSelected =
            point.spaceId &&
            selectedSpace &&
            String(selectedSpace.id) === String(point.spaceId);

          return (
            <button
              key={point.id}
              type="button"
              className={
                isSelected
                  ? "campus-map-marker selected"
                  : "campus-map-marker"
              }
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
              }}
              onClick={() => handlePointClick(point)}
              disabled={!point.spaceId}
              aria-label={`${point.name}${point.spaceId ? " — open details" : ""}`}
              title={point.spaceId ? `Open ${point.name}` : point.name}
            >
              <span className="campus-map-marker-icon">{point.icon}</span>
              <span className="campus-map-marker-label">{point.short}</span>
            </button>
          );
        })}

        <div className="campus-map-compass" aria-hidden="true">
          <span>N</span>
          <strong>↑</strong>
        </div>

        <div className="campus-map-scale" aria-hidden="true">
          <span />
          <small>Campus layout</small>
        </div>
      </div>

      <div className="campus-map-footer">
        <span>
          📍 {campusMapPoints.filter((point) => point.spaceId).length} mapped
          spaces
        </span>
        <span>•</span>
        <span>⚡ Availability comes from CampusBuddy live state</span>
      </div>
    </section>
  );
}


function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);

  useEffect(() => {
    if (typeof document !== "undefined" && !document.querySelector('link[rel="manifest"]')) {
      const manifest = document.createElement("link");
      manifest.rel = "manifest";
      manifest.href = "/manifest.webmanifest";
      document.head.appendChild(manifest);
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setCheckingAuth(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Keep the signed-in user's Firebase profile live.
  // This makes role/name changes appear immediately without refreshing.
  useEffect(() => {
    if (!user) {
      setStudentProfile(null);
      return;
    }

    const unsubscribeProfile = onSnapshot(
      doc(db, "users", user.uid),
      (snapshot) => {
        setStudentProfile(
          snapshot.exists() ? snapshot.data() : null
        );
      },
      (error) => {
        console.error("Could not sync student profile:", error);
        setStudentProfile(null);
      }
    );

    return () => unsubscribeProfile();
  }, [user]);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const [page, setPage] = useState("home");
  const [detail, setDetail] = useState(null);

  const [selectedSpace, setSelectedSpace] = useState(null);
  const [spaceFilter, setSpaceFilter] = useState("All");

  const [aiQuery, setAiQuery] = useState("");
  const [aiIntent, setAiIntent] = useState({
    type: "ai",
    title: "I can help you navigate CampusBuddy",
    message:
      "Try asking about a study space, coding event, food, lost items, exams, notices, transport, campus help or student community.",
    action: "ai",
  });

  const [nightMode, setNightMode] = useState(false);
  const [geoVerified, setGeoVerified] = useState(false);
  const [geoChecking, setGeoChecking] = useState(false);
  const [seatAlert, setSeatAlert] = useState(false);
  const [telegramDemo, setTelegramDemo] = useState(false);
  const [selectedStudyActivity, setSelectedStudyActivity] = useState(null);
  const [liveAvailability, setLiveAvailability] = useState(
    Object.fromEntries(spaces.map((space) => [space.id, space.available]))
  );
  const [seatAlertMessage, setSeatAlertMessage] = useState("");

  const [eventCategory, setEventCategory] = useState("All");
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [eventRegistrationLoading, setEventRegistrationLoading] = useState(false);
  const [eventRegistrationSaving, setEventRegistrationSaving] = useState(null);

  const [lostFoundMode, setLostFoundMode] = useState(null);
  const [lostFoundReports, setLostFoundReports] = useState(
    initialLostFoundReports
  );
  const [lostFoundLoading, setLostFoundLoading] = useState(false);
  const [lostFoundSubmitting, setLostFoundSubmitting] = useState(false);

  const [reportForm, setReportForm] = useState({
    item: "",
    location: "",
    date: "",
    description: "",
  });

  const [adminData, setAdminData] = useState({ notices: [], events: [] });
  const [firestoreSpaces, setFirestoreSpaces] = useState([]);
  const [spacesLoaded, setSpacesLoaded] = useState(false);

  const [firestoreFood, setFirestoreFood] = useState([]);
  const [foodLoaded, setFoodLoaded] = useState(false);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodSaving, setFoodSaving] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: "",
    cuisine: "Multi-cuisine",
    price: "₹50 - ₹200",
    crowd: "Moderate",
    rating: "4.0",
    description: "",
  });
  const [spaceLoading, setSpaceLoading] = useState(false);
  const [spaceSaving, setSpaceSaving] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [spaceForm, setSpaceForm] = useState({
    name: "",
    type: "Library",
    location: "",
    capacity: "50",
    available: "18",
    status: "Available",
    environment: "Quiet",
    description: "",
  });
  const [adminHelpReports, setAdminHelpReports] = useState([]);
  const [adminHelpLoading, setAdminHelpLoading] = useState(false);
  const [adminHelpUpdating, setAdminHelpUpdating] = useState(null);

  const [adminRegistrations, setAdminRegistrations] = useState([]);
  const [adminRegistrationsLoading, setAdminRegistrationsLoading] = useState(false);
  const [adminRegistrationEventFilter, setAdminRegistrationEventFilter] = useState("All");
  const [adminRegistrationDeleting, setAdminRegistrationDeleting] = useState(null);

  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminSection, setAdminSection] = useState("overview");
  const [editingAdminItem, setEditingAdminItem] = useState(null);
  const [adminForm, setAdminForm] = useState({ title: "", text: "", type: "ACADEMIC", date: "", month: "", time: "", location: "", category: "TECHNOLOGY", detail: "" });

  const [communityProfiles, setCommunityProfiles] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communitySaving, setCommunitySaving] = useState(false);
  const [communitySearch, setCommunitySearch] = useState("");
  const [communityForm, setCommunityForm] = useState({
    skills: "",
    lookingFor: "",
    interests: "",
  });

  // V2 profile + notification system. Profile fields are stored in the same
  // protected users/{uid} document so role information stays server-controlled.
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    course: "",
    year: "",
    department: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (!studentProfile) return;
    setProfileForm({
      name: studentProfile.name || user?.displayName || user?.email?.split("@")[0] || "",
      course: studentProfile.course || "",
      year: String(studentProfile.year || ""),
      department: studentProfile.department || "",
      phone: studentProfile.phone || "",
      bio: studentProfile.bio || "",
    });
  }, [studentProfile, user]);

  const [helpSubmitted, setHelpSubmitted] = useState(false);
  const [helpForm, setHelpForm] = useState({
    category: "Maintenance",
    location: "",
    description: "",
  });
  const [helpReports, setHelpReports] = useState([]);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpSubmitting, setHelpSubmitting] = useState(false);

  // Load persistent Lost & Found reports from Firestore.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadLostFoundReports = async () => {
      setLostFoundLoading(true);

      try {
        const snapshot = await getDocs(collection(db, "lost_found"));

        const firestoreReports = snapshot.docs
          .map((item) => {
            const data = item.data();

            return {
              id: item.id,
              type: data.type || "Lost",
              item: data.item || "Unknown item",
              location: data.location || "Campus",
              date: data.date || "",
              description: data.description || "",
              icon: data.icon || (data.type === "Found" ? "🎒" : "🔎"),
              userId: data.userId || "",
              reporterName: data.reporterName || "Campus student",
              reporterEmail: data.reporterEmail || "",
              source: "firestore",
            };
          })
          .sort((a, b) => {
            const aDate = a.date || "";
            const bDate = b.date || "";
            return bDate.localeCompare(aDate);
          });

        if (!cancelled) {
          // Keep the original demo reports and put real submitted reports first.
          setLostFoundReports([
            ...firestoreReports,
            ...initialLostFoundReports,
          ]);
        }
      } catch (error) {
        console.error("Could not load Lost & Found reports:", error);

        if (!cancelled) {
          setLostFoundReports(initialLostFoundReports);
        }
      } finally {
        if (!cancelled) {
          setLostFoundLoading(false);
        }
      }
    };

    loadLostFoundReports();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Real-time Firestore sync for Events + Notices.
  // Any authenticated student sees admin-created changes without refreshing.
  useEffect(() => {
    if (!user) {
      setAdminData({ notices: [], events: [] });
      setAdminLoading(false);
      return;
    }

    setAdminLoading(true);

    let noticesLoaded = false;
    let eventsLoaded = false;

    const finishInitialLoading = () => {
      if (noticesLoaded && eventsLoaded) {
        setAdminLoading(false);
      }
    };

    const unsubscribeNotices = onSnapshot(
      collection(db, "notices"),
      (snapshot) => {
        const firestoreNotices = snapshot.docs.map((item) => ({
          id: item.id,
          source: "firestore",
          ...item.data(),
        }));

        setAdminData((previous) => ({
          ...previous,
          notices: firestoreNotices,
        }));

        noticesLoaded = true;
        finishInitialLoading();
      },
      (error) => {
        console.error("Could not sync notices:", error);
        noticesLoaded = true;
        setAdminLoading(false);
      }
    );

    const unsubscribeEvents = onSnapshot(
      collection(db, "events"),
      (snapshot) => {
        const firestoreEvents = snapshot.docs.map((item) => ({
          id: item.id,
          source: "firestore",
          ...item.data(),
        }));

        setAdminData((previous) => ({
          ...previous,
          events: firestoreEvents,
        }));

        eventsLoaded = true;
        finishInitialLoading();
      },
      (error) => {
        console.error("Could not sync events:", error);
        eventsLoaded = true;
        setAdminLoading(false);
      }
    );

    return () => {
      unsubscribeNotices();
      unsubscribeEvents();
    };
  }, [user]);

  // Real-time Firestore sync for Spaces.
  // Students and admins see the same live campus-space data.
  useEffect(() => {
    if (!user) {
      setFirestoreSpaces([]);
      setSpacesLoaded(false);
      setSpaceLoading(false);
      return;
    }

    setSpaceLoading(true);

    const unsubscribeSpaces = onSnapshot(
      collection(db, "spaces"),
      (snapshot) => {
        const nextSpaces = snapshot.docs
          .map((item) => ({
            id: item.id,
            source: "firestore",
            ...item.data(),
          }))
          .map((space) => ({
            ...space,
            capacity: Number(space.capacity) || 0,
            available: Number(space.available) || 0,
            status: space.status || "Available",
            environment: space.environment || "Quiet",
          }));

        setFirestoreSpaces(nextSpaces);
        setSpacesLoaded(true);
        setSpaceLoading(false);

        setLiveAvailability((previous) => {
          const nextAvailability = { ...previous };

          nextSpaces.forEach((space) => {
            nextAvailability[space.id] = space.available;
          });

          return nextAvailability;
        });
      },
      (error) => {
        console.error("Could not sync spaces:", error);
        setSpacesLoaded(true);
        setSpaceLoading(false);
      }
    );

    return () => unsubscribeSpaces();
  }, [user]);

  // Real-time Firestore sync for Food & Canteens.
  useEffect(() => {
    if (!user) {
      setFirestoreFood([]);
      setFoodLoaded(false);
      setFoodLoading(false);
      return;
    }

    setFoodLoading(true);

    const unsubscribeFood = onSnapshot(
      collection(db, "food_places"),
      (snapshot) => {
        const nextFood = snapshot.docs.map((item) => ({
          id: item.id,
          source: "firestore",
          ...item.data(),
        }));

        setFirestoreFood(nextFood);
        setFoodLoaded(true);
        setFoodLoading(false);
      },
      (error) => {
        console.error("Could not sync food places:", error);
        setFoodLoaded(true);
        setFoodLoading(false);
      }
    );

    return () => unsubscribeFood();
  }, [user]);

  // Load all student help reports for authorised admins.
  useEffect(() => {
    if (!user || studentProfile?.role !== "admin") return;

    let cancelled = false;

    const loadAdminHelpReports = async () => {
      setAdminHelpLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "help_reports"));
        const reports = snapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

        if (!cancelled) setAdminHelpReports(reports);
      } catch (error) {
        console.error("Could not load admin help reports:", error);
        if (!cancelled) setAdminHelpReports([]);
      } finally {
        if (!cancelled) setAdminHelpLoading(false);
      }
    };

    loadAdminHelpReports();
    return () => { cancelled = true; };
  }, [user, studentProfile?.role]);

  // Real-time admin view of every event registration.
  // Only admins start this listener; Firestore rules enforce the same access boundary.
  useEffect(() => {
    if (!user || studentProfile?.role !== "admin") {
      setAdminRegistrations([]);
      setAdminRegistrationsLoading(false);
      return;
    }

    setAdminRegistrationsLoading(true);

    const unsubscribeRegistrations = onSnapshot(
      collection(db, "event_registrations"),
      (snapshot) => {
        const registrations = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => {
            const aTime = a.registeredAt?.seconds || 0;
            const bTime = b.registeredAt?.seconds || 0;
            return bTime - aTime;
          });

        setAdminRegistrations(registrations);
        setAdminRegistrationsLoading(false);
      },
      (error) => {
        console.error("Could not sync admin event registrations:", error);
        setAdminRegistrations([]);
        setAdminRegistrationsLoading(false);
      }
    );

    return () => unsubscribeRegistrations();
  }, [user, studentProfile?.role]);

  // Real-time student community directory from Firestore.
  // Profile changes appear for other signed-in students without refreshing.
  useEffect(() => {
    if (!user) {
      setCommunityProfiles([]);
      setCommunityLoading(false);
      return;
    }

    setCommunityLoading(true);

    const unsubscribeCommunity = onSnapshot(
      collection(db, "community"),
      (snapshot) => {
        const profiles = snapshot.docs
          .map((item) => ({
            id: item.id,
            source: "firestore",
            ...item.data(),
          }))
          .sort((a, b) => {
            const aName = (a.name || "").toLowerCase();
            const bName = (b.name || "").toLowerCase();
            return aName.localeCompare(bName);
          });

        setCommunityProfiles(profiles);

        const myProfile = profiles.find((profile) => profile.id === user.uid);
        if (myProfile) {
          setCommunityForm({
            skills: myProfile.skills || "",
            lookingFor: myProfile.lookingFor || "",
            interests: myProfile.interests || "",
          });
        }

        setCommunityLoading(false);
      },
      (error) => {
        console.error("Could not sync community profiles:", error);
        setCommunityProfiles([]);
        setCommunityLoading(false);
      }
    );

    return () => unsubscribeCommunity();
  }, [user]);

  // Real-time sync for this student's event registrations.
  useEffect(() => {
    if (!user) {
      setRegisteredEvents([]);
      setEventRegistrationLoading(false);
      return;
    }

    setEventRegistrationLoading(true);

    const registrationsQuery = query(
      collection(db, "event_registrations"),
      where("userId", "==", user.uid)
    );

    const unsubscribeRegistrations = onSnapshot(
      registrationsQuery,
      (snapshot) => {
        const ids = snapshot.docs
          .map((item) => item.data()?.eventId)
          .filter(Boolean);

        setRegisteredEvents(ids);
        setEventRegistrationLoading(false);
      },
      (error) => {
        console.error("Could not sync event registrations:", error);
        setRegisteredEvents([]);
        setEventRegistrationLoading(false);
      }
    );

    return () => unsubscribeRegistrations();
  }, [user]);

  // Load this student's support and maintenance reports from Firestore.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const loadHelpReports = async () => {
      setHelpLoading(true);

      try {
        const reportsQuery = query(
          collection(db, "help_reports"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(reportsQuery);

        const reports = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });

        if (!cancelled) setHelpReports(reports);
      } catch (error) {
        console.error("Could not load help reports:", error);
        if (!cancelled) setHelpReports([]);
      } finally {
        if (!cancelled) setHelpLoading(false);
      }
    };

    loadHelpReports();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Authentication gate — all hooks above stay unconditional,
  // so React's Rules of Hooks are preserved.
  if (checkingAuth) {
    return (
      <div className="app campus-3d">
        <h2>Loading CampusBuddy...</h2>
      </div>
    );
  }

  if (!user) {
    return <Auth onSuccess={setUser} />;
  }

  const visibleSpaces = spacesLoaded ? firestoreSpaces : spaces;
  const visibleFood = foodLoaded ? firestoreFood : foodPlaces;

  const filteredSpaces =
    spaceFilter === "All"
      ? visibleSpaces
      : visibleSpaces.filter((space) => space.status === spaceFilter);

  const visibleNotices = adminData.notices;
  const visibleEvents = adminData.events;

  const filteredEvents =
    eventCategory === "All"
      ? visibleEvents
      : visibleEvents.filter((event) => event.category === eventCategory);

  function resetSpaceForm() {
    setEditingSpace(null);
    setSpaceForm({
      name: "",
      type: "Library",
      location: "",
      capacity: "50",
      available: "18",
      status: "Available",
      environment: "Quiet",
      description: "",
    });
  }

  function startSpaceEdit(space) {
    if (space.source !== "firestore") return;

    setEditingSpace(space);
    setSpaceForm({
      name: space.name || "",
      type: space.type || "Library",
      location: space.location || "",
      capacity: String(space.capacity ?? ""),
      available: String(space.available ?? ""),
      status: space.status || "Available",
      environment: space.environment || "Quiet",
      description: space.description || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveSpace(event) {
    event.preventDefault();

    if (
      studentProfile?.role !== "admin" ||
      !user ||
      spaceSaving ||
      !spaceForm.name.trim()
    ) {
      return;
    }

    const capacity = Math.max(0, Number(spaceForm.capacity) || 0);
    const available = Math.min(
      capacity,
      Math.max(0, Number(spaceForm.available) || 0)
    );

    setSpaceSaving(true);

    try {
      const payload = {
        name: spaceForm.name.trim(),
        type: spaceForm.type,
        location: spaceForm.location.trim(),
        capacity,
        available,
        status: spaceForm.status,
        environment: spaceForm.environment,
        description: spaceForm.description.trim(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      };

      let spaceId = editingSpace?.id;

      if (spaceId && editingSpace.source === "firestore") {
        await setDoc(doc(db, "spaces", spaceId), payload, { merge: true });
      } else {
        const reference = await addDoc(collection(db, "spaces"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        spaceId = reference.id;
      }

      const localSpace = {
        id: spaceId,
        source: "firestore",
        ...payload,
      };

      setFirestoreSpaces((previous) =>
        editingSpace
          ? previous.map((space) =>
              space.id === spaceId ? { ...space, ...localSpace } : space
            )
          : [localSpace, ...previous]
      );
      setSpacesLoaded(true);
      setLiveAvailability((previous) => ({
        ...previous,
        [spaceId]: available,
      }));

      resetSpaceForm();
      alert(
        editingSpace
          ? "Space updated successfully in Firebase."
          : "Space published successfully to Firebase."
      );
    } catch (error) {
      console.error("Space save failed:", error);
      alert(
        "Could not save this space. Check your Firestore rules and try again."
      );
    } finally {
      setSpaceSaving(false);
    }
  }

  async function deleteSpace(space) {
    if (space.source !== "firestore" || studentProfile?.role !== "admin") {
      return;
    }

    if (!window.confirm(`Delete "${space.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "spaces", space.id));

      setFirestoreSpaces((previous) =>
        previous.filter((item) => item.id !== space.id)
      );

      setLiveAvailability((previous) => {
        const next = { ...previous };
        delete next[space.id];
        return next;
      });
    } catch (error) {
      console.error("Space delete failed:", error);
      alert(
        "Could not delete this space. Check your Firestore rules and try again."
      );
    }
  }

  function resetFoodForm() {
    setEditingFood(null);
    setFoodForm({
      name: "",
      cuisine: "Multi-cuisine",
      price: "₹50 - ₹200",
      crowd: "Moderate",
      rating: "4.0",
      description: "",
    });
  }

  function startFoodEdit(place) {
    if (place.source !== "firestore") return;

    setEditingFood(place);
    setFoodForm({
      name: place.name || "",
      cuisine: place.cuisine || "Multi-cuisine",
      price: place.price || "",
      crowd: place.crowd || "Moderate",
      rating: String(place.rating ?? "4.0"),
      description: place.description || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveFoodPlace(event) {
    event.preventDefault();

    if (
      studentProfile?.role !== "admin" ||
      !user ||
      foodSaving ||
      !foodForm.name.trim()
    ) {
      return;
    }

    setFoodSaving(true);

    try {
      const payload = {
        name: foodForm.name.trim(),
        cuisine: foodForm.cuisine.trim() || "Multi-cuisine",
        price: foodForm.price.trim() || "Price not added",
        crowd: foodForm.crowd,
        rating: foodForm.rating.trim() || "0.0",
        description: foodForm.description.trim(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
      };

      let foodId = editingFood?.id;

      if (foodId && editingFood.source === "firestore") {
        await setDoc(doc(db, "food_places", foodId), payload, { merge: true });
      } else {
        const reference = await addDoc(collection(db, "food_places"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        foodId = reference.id;
      }

      const localFood = {
        id: foodId,
        source: "firestore",
        ...payload,
      };

      setFirestoreFood((previous) =>
        editingFood
          ? previous.map((place) =>
              place.id === foodId ? { ...place, ...localFood } : place
            )
          : [localFood, ...previous]
      );

      setFoodLoaded(true);
      resetFoodForm();

      alert(
        editingFood
          ? "Food place updated successfully in Firebase."
          : "Food place published successfully to Firebase."
      );
    } catch (error) {
      console.error("Food place save failed:", error);
      alert(
        "Could not save this food place. Check your Firestore rules and try again."
      );
    } finally {
      setFoodSaving(false);
    }
  }

  async function deleteFoodPlace(place) {
    if (place.source !== "firestore" || studentProfile?.role !== "admin") {
      return;
    }

    if (!window.confirm(`Delete "${place.name}"?`)) return;

    try {
      await deleteDoc(doc(db, "food_places", place.id));
      setFirestoreFood((previous) =>
        previous.filter((item) => item.id !== place.id)
      );
    } catch (error) {
      console.error("Food place delete failed:", error);
      alert(
        "Could not delete this food place. Check your Firestore rules and try again."
      );
    }
  }

  function resetAdminForm() {
    setEditingAdminItem(null);
    setAdminForm({ title: "", text: "", type: "ACADEMIC", date: "", month: "", time: "", location: "", category: "TECHNOLOGY", detail: "" });
  }

  function startAdminEdit(item, section) {
    if (item.source !== "firestore") return;
    setAdminSection(section); setEditingAdminItem(item);
    setAdminForm({ title: item.title || "", text: item.text || "", type: item.type || "ACADEMIC", date: item.date || "", month: item.month || "", time: item.time || "", location: item.location || "", category: item.category || "TECHNOLOGY", detail: item.detail || item.text || "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveAdminItem(event) {
    event.preventDefault();
    if (studentProfile?.role !== "admin" || !user || adminSaving || !adminForm.title.trim()) return;
    setAdminSaving(true);
    try {
      const isNotice = adminSection === "notices";
      const collectionName = isNotice ? "notices" : "events";
      const payload = isNotice
        ? { title: adminForm.title.trim(), text: adminForm.text.trim(), detail: adminForm.detail.trim() || adminForm.text.trim(), type: adminForm.type, date: adminForm.date || new Date().toLocaleDateString("en-IN"), updatedAt: serverTimestamp(), createdBy: user.uid }
        : { title: adminForm.title.trim(), category: adminForm.category, date: adminForm.date.trim(), month: adminForm.month.trim(), time: adminForm.time.trim(), location: adminForm.location.trim(), text: adminForm.text.trim(), detail: adminForm.detail.trim() || adminForm.text.trim(), updatedAt: serverTimestamp(), createdBy: user.uid };
      let itemId = editingAdminItem?.id;
      if (itemId && editingAdminItem.source === "firestore") await setDoc(doc(db, collectionName, itemId), payload, { merge: true });
      else { const ref = await addDoc(collection(db, collectionName), { ...payload, createdAt: serverTimestamp() }); itemId = ref.id; }
      const localItem = { id: itemId, source: "firestore", ...payload };
      setAdminData((previous) => ({ ...previous, [collectionName]: editingAdminItem ? previous[collectionName].map((item) => item.id === itemId ? { ...item, ...localItem } : item) : [localItem, ...previous[collectionName]] }));
      resetAdminForm();
      alert(editingAdminItem ? "Updated successfully in Firebase." : "Published successfully to Firebase.");
    } catch (error) { console.error("Admin save failed:", error); alert("Could not save. Check your Firestore rules and try again."); }
    finally { setAdminSaving(false); }
  }

  async function deleteAdminItem(item, section) {
    if (item.source !== "firestore" || studentProfile?.role !== "admin") return;
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try { const collectionName = section === "notices" ? "notices" : "events"; await deleteDoc(doc(db, collectionName, item.id)); setAdminData((previous) => ({ ...previous, [section]: previous[section].filter((entry) => entry.id !== item.id) })); }
    catch (error) { console.error("Admin delete failed:", error); alert("Could not delete this item. Check your Firestore rules."); }
  }

  async function updateHelpReportStatus(report, status) {
    if (
      !user ||
      studentProfile?.role !== "admin" ||
      adminHelpUpdating === report.id
    ) return;

    setAdminHelpUpdating(report.id);
    try {
      await setDoc(
        doc(db, "help_reports", report.id),
        {
          status,
          updatedAt: serverTimestamp(),
          updatedBy: user.uid,
        },
        { merge: true }
      );

      setAdminHelpReports((previous) =>
        previous.map((item) =>
          item.id === report.id ? { ...item, status } : item
        )
      );
    } catch (error) {
      console.error("Help status update failed:", error);
      alert("Could not update this report. Check your Firestore rules.");
    } finally {
      setAdminHelpUpdating(null);
    }
  }

  async function saveStudentProfile(event) {
    event.preventDefault();
    if (!user || profileSaving) return;

    setProfileSaving(true);
    try {
      const payload = {
        name: profileForm.name.trim() || user.displayName || user.email?.split("@")[0] || "Campus student",
        course: profileForm.course.trim(),
        year: profileForm.year.trim(),
        department: profileForm.department.trim(),
        phone: profileForm.phone.trim(),
        bio: profileForm.bio.trim(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", user.uid), payload, { merge: true });
      setStudentProfile((previous) => ({ ...(previous || {}), ...payload, role: previous?.role || "student" }));
      alert("Your CampusBuddy profile was updated.");
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Could not update your profile. Check your Firebase rules and try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function saveCommunityProfile(event) {
    event.preventDefault();

    if (!user || communitySaving) return;

    const profileData = {
      name:
        studentProfile?.name ||
        user.displayName ||
        user.email?.split("@")[0] ||
        "Campus student",
      course: studentProfile?.course || "Student",
      year: studentProfile?.year || "Year not added",
      skills: communityForm.skills.trim(),
      lookingFor: communityForm.lookingFor.trim(),
      interests: communityForm.interests.trim(),
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };

    setCommunitySaving(true);

    try {
      await setDoc(doc(db, "community", user.uid), {
        ...profileData,
        createdAt:
          communityProfiles.find((profile) => profile.id === user.uid)?.createdAt ||
          serverTimestamp(),
      }, { merge: true });

      const localProfile = {
        id: user.uid,
        source: "firestore",
        ...profileData,
      };

      setCommunityProfiles((previous) => {
        const exists = previous.some((profile) => profile.id === user.uid);
        if (exists) {
          return previous.map((profile) =>
            profile.id === user.uid ? { ...profile, ...localProfile } : profile
          );
        }
        return [...previous, localProfile].sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );
      });

      alert("Community profile saved to Firebase.");
    } catch (error) {
      console.error("Community profile save failed:", error);
      alert("Could not save your community profile. Check your Firestore rules and try again.");
    } finally {
      setCommunitySaving(false);
    }
  }

  function goTo(nextPage, nextDetail = null) {
    setDetail(nextDetail);
    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleAI() {
    if (!aiQuery.trim()) return;

    const intent = getAIIntent(aiQuery);
    const text = aiQuery.toLowerCase();
    let contextual = { ...intent };

    if (intent.type === "spaces") {
      const quiet = visibleSpaces.filter((space) =>
        String(space.environment || "").toLowerCase().includes("quiet")
      );
      const match = quiet[0] || visibleSpaces[0];
      if (match) {
        const seats = liveAvailability[match.id] ?? match.available ?? 0;
        contextual.message = `${match.name} is a live match: ${seats} seats available, ${match.environment || "campus"} environment, ${match.location || "campus"}.`;
      }
    } else if (intent.type === "events") {
      const match = visibleEvents.find((event) =>
        text.includes("coding")
          ? /coding|tech|ai|hackathon/i.test(`${event.title} ${event.category}`)
          : true
      ) || visibleEvents[0];
      if (match) contextual.message = `${match.title} is coming up on ${match.date || "the scheduled date"} at ${match.time || "the listed time"} in ${match.location || "the campus venue"}.`;
    } else if (intent.type === "food") {
      const match = visibleFood[0];
      if (match) contextual.message = `${match.name} offers ${match.cuisine || "campus food"} at ${match.price || "campus pricing"}. Current crowd level: ${match.crowd || "not added"}.`;
    } else if (intent.type === "notices") {
      const match = visibleNotices[0];
      if (match) contextual.message = `Latest campus notice: ${match.title}. ${match.text || "Open Notices for the full details."}`;
    } else if (intent.type === "academic") {
      contextual.message = `Your Academic Hub has timetable, assignment, attendance and exam information. ${studentProfile?.course ? `Your profile is set to ${studentProfile.course}.` : "Add your course in Profile for more personalization."}`;
    } else if (intent.type === "community") {
      const count = communityProfiles.length;
      contextual.message = `${count} student profile${count === 1 ? "" : "s"} are currently visible in the Community directory. Search by skill, course or interest to find collaborators.`;
    } else if (intent.type === "help") {
      contextual.message = `You can submit a support request and track its status from Campus Help. You currently have ${helpReports.length} report${helpReports.length === 1 ? "" : "s"} in your account.`;
    }

    setAiIntent(contextual);
    goTo("ai");
  }

  function getDirections(place) {
    const location =
      place.name ||
      place.title ||
      place.destination ||
      place.location ||
      place.route;

    if (!location) return;

    const url =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(`${location}, LPU, Phagwara, Punjab`);

    window.open(url, "_blank", "noopener,noreferrer");
  }


  function verifyCampusPresence() {
    if (!navigator.geolocation) {
      return;
    }

    setGeoChecking(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat1 = position.coords.latitude * (Math.PI / 180);
        const lon1 = position.coords.longitude * (Math.PI / 180);
        const lat2 = 31.2536 * (Math.PI / 180);
        const lon2 = 75.7037 * (Math.PI / 180);

        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;

        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2;

        const distance = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        setGeoVerified(distance <= 150);
        setGeoChecking(false);
      },
      () => {
        setGeoChecking(false);
        setGeoVerified(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  async function registerEvent(id) {
    if (!user || eventRegistrationSaving === id) return;

    const alreadyRegistered = registeredEvents.includes(id);
    const safeEventId = String(id).replaceAll("/", "_");
    const registrationId = `${user.uid}_${safeEventId}`;
    const eventRecord =
      [...visibleEvents, ...events].find((item) => String(item.id) === String(id)) || null;

    setEventRegistrationSaving(id);

    try {
      if (alreadyRegistered) {
        await deleteDoc(doc(db, "event_registrations", registrationId));

        setRegisteredEvents((previous) =>
          previous.filter((eventId) => String(eventId) !== String(id))
        );
      } else {
        await setDoc(doc(db, "event_registrations", registrationId), {
          userId: user.uid,
          studentName:
            studentProfile?.name ||
            user.displayName ||
            user.email?.split("@")[0] ||
            "Campus student",
          studentEmail: user.email || "",
          eventId: id,
          eventTitle: eventRecord?.title || "",
          eventDate: eventRecord?.date || "",
          eventMonth: eventRecord?.month || "",
          eventTime: eventRecord?.time || "",
          eventLocation: eventRecord?.location || "",
          registeredAt: serverTimestamp(),
        });

        setRegisteredEvents((previous) =>
          previous.includes(id) ? previous : [...previous, id]
        );
      }
    } catch (error) {
      console.error("Event registration failed:", error);
      alert(
        "Could not update your event registration. Check your Firestore rules and try again."
      );
    } finally {
      setEventRegistrationSaving(null);
    }
  }

  async function deleteAdminRegistration(registration) {
    if (
      studentProfile?.role !== "admin" ||
      !registration?.id ||
      adminRegistrationDeleting === registration.id
    ) {
      return;
    }

    const studentName = registration.studentName || "this student";
    const eventTitle =
      registration.eventTitle ||
      [...visibleEvents, ...events].find(
        (item) => String(item.id) === String(registration.eventId)
      )?.title ||
      "this event";

    if (
      !window.confirm(
        `Remove ${studentName}'s registration for "${eventTitle}"?`
      )
    ) {
      return;
    }

    setAdminRegistrationDeleting(registration.id);

    try {
      await deleteDoc(doc(db, "event_registrations", registration.id));

      setAdminRegistrations((previous) =>
        previous.filter((item) => item.id !== registration.id)
      );
    } catch (error) {
      console.error("Admin registration delete failed:", error);
      alert(
        "Could not remove this registration. Check your Firestore rules and try again."
      );
    } finally {
      setAdminRegistrationDeleting(null);
    }
  }

  function formatRegistrationDate(timestamp) {
    if (!timestamp) return "Just now";

    let date = null;

    if (typeof timestamp.toDate === "function") {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (Number.isNaN(date.getTime())) return "Date unavailable";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function downloadRegistrationsCSV() {
    if (adminRegistrations.length === 0) return;

    const eventMap = new Map(
      [...events, ...visibleEvents].map((item) => [String(item.id), item])
    );

    const escapeCSV = (value) =>
      `"${String(value ?? "").replaceAll('"', '""')}"`;

    const rows = [
      [
        "Student Name",
        "Student Email",
        "Event",
        "Event Date",
        "Event Time",
        "Event Location",
        "Registered At",
      ],
      ...adminRegistrations.map((registration) => {
        const event = eventMap.get(String(registration.eventId));

        return [
          registration.studentName || "",
          registration.studentEmail || "",
          registration.eventTitle || event?.title || registration.eventId || "",
          registration.eventDate ||
            (event ? `${event.date || ""} ${event.month || ""}`.trim() : ""),
          registration.eventTime || event?.time || "",
          registration.eventLocation || event?.location || "",
          formatRegistrationDate(registration.registeredAt),
        ];
      }),
    ];

    const csv = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `campusbuddy-event-registrations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function openLostFoundForm(type) {
    setLostFoundMode(type);
    setReportForm({
      item: "",
      location: "",
      date: "",
      description: "",
    });
  }

  function handleReportChange(event) {
    const { name, value } = event.target;

    setReportForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function submitLostFoundReport(event) {
    event.preventDefault();

    if (
      !reportForm.item ||
      !reportForm.location ||
      !reportForm.date ||
      !reportForm.description ||
      !lostFoundMode ||
      !user ||
      lostFoundSubmitting
    ) {
      return;
    }

    setLostFoundSubmitting(true);

    const reportData = {
      type: lostFoundMode,
      item: reportForm.item.trim(),
      location: reportForm.location.trim(),
      date: reportForm.date,
      description: reportForm.description.trim(),
      icon: lostFoundMode === "Lost" ? "🔎" : "🎒",
      userId: user.uid,
      reporterName:
        studentProfile?.name ||
        user.displayName ||
        user.email?.split("@")[0] ||
        "Campus student",
      reporterEmail: user.email || "",
      createdAt: serverTimestamp(),
    };

    try {
      const documentReference = await addDoc(
        collection(db, "lost_found"),
        reportData
      );

      const newReport = {
        id: documentReference.id,
        ...reportData,
        createdAt: new Date(),
        source: "firestore",
      };

      setLostFoundReports((previous) => [newReport, ...previous]);

      setReportForm({
        item: "",
        location: "",
        date: "",
        description: "",
      });

      setLostFoundMode(null);
    } catch (error) {
      console.error("Could not save Lost & Found report:", error);
      alert(
        "Could not save the report to Firebase. Check your Firestore database/rules and try again."
      );
    } finally {
      setLostFoundSubmitting(false);
    }
  }

  async function submitHelpReport(event) {
    event.preventDefault();

    if (
      !user ||
      helpSubmitting ||
      !helpForm.location.trim() ||
      !helpForm.description.trim()
    ) {
      return;
    }

    setHelpSubmitting(true);

    const reportData = {
      userId: user.uid,
      studentName:
        studentProfile?.name ||
        user.displayName ||
        user.email?.split("@")[0] ||
        "Campus student",
      category: helpForm.category,
      location: helpForm.location.trim(),
      description: helpForm.description.trim(),
      status: "Open",
      createdAt: serverTimestamp(),
    };

    try {
      const reportRef = await addDoc(
        collection(db, "help_reports"),
        reportData
      );

      setHelpReports((previous) => [
        {
          id: reportRef.id,
          ...reportData,
          createdAt: { seconds: Math.floor(Date.now() / 1000) },
        },
        ...previous,
      ]);

      setHelpForm({
        category: "Maintenance",
        location: "",
        description: "",
      });

      setHelpSubmitted(true);
    } catch (error) {
      console.error("Could not save help report:", error);
      alert(
        "Could not save your request to Firebase. Check your Firestore rules and try again."
      );
    } finally {
      setHelpSubmitting(false);
    }
  }

  function resetToHome() {
    setDetail(null);
    setLostFoundMode(null);
    setPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /*
   * DETAIL PAGE
   */
  if (detail) {
    return (
      <div className={nightMode ? "app night-owl campus-3d" : "app campus-3d"}>
        <Navbar setPage={goTo} nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={studentProfile} user={user} onLogout={handleLogout} />

        <main className="space-finder">
          <button className="back-button" onClick={() => setDetail(null)}>
            ← Back
          </button>

          <DetailView
            detail={detail}
            setPage={goTo}
            getDirections={getDirections}
            registeredEvents={registeredEvents}
            registerEvent={registerEvent}
          />
        </main>
      </div>
    );
  }

  /*
   * LOST & FOUND
   */
  if (page === "lostfound") {
    return (
      <div className={nightMode ? "app night-owl campus-3d" : "app campus-3d"}>
        <Navbar setPage={goTo} nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={studentProfile} user={user} onLogout={handleLogout} />

        <main className="space-finder">
          <BackButton setPage={goTo} />

          <PageHeader
            eyebrow="CAMPUS LOST & FOUND"
            title="Lost something? Found something?"
            text="Help your campus community return lost belongings."
            count={lostFoundReports.length}
            countText="recent reports"
          />

          {!lostFoundMode ? (
            <>
              <div className="module-grid">
                <DashboardModule
                  icon="😢"
                  title="I Lost Something"
                  text="Report an item you lost on campus."
                  onClick={() => openLostFoundForm("Lost")}
                  featured
                />

                <DashboardModule
                  icon="🎒"
                  title="I Found Something"
                  text="Report an item you found so the owner can find it."
                  onClick={() => openLostFoundForm("Found")}
                />
              </div>

              <section className="section dashboard-section">
                <span className="eyebrow">RECENT REPORTS</span>
                <h2>Items reported on campus</h2>

                {lostFoundLoading && (
                  <p style={{ opacity: 0.7, marginBottom: "14px" }}>
                    Loading reports from Firebase...
                  </p>
                )}

                <div className="mini-space-list">
                  {lostFoundReports.map((report) => (
                    <button
                      className="mini-space clickable-card"
                      key={report.id}
                      onClick={() => goTo("detail", report)}
                    >
                      <div className="mini-space-icon">{report.icon}</div>

                      <div>
                        <strong>{report.item}</strong>
                        <p>
                          {report.type} near {report.location} • {report.date}
                        </p>
                        <p>{report.description}</p>
                        {report.source === "firestore" && (
                          <small style={{ opacity: 0.65 }}>
                            Reported by {report.reporterName || "Campus student"}
                          </small>
                        )}
                      </div>

                      <span className="event-tag">
                        {report.type.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <ReportForm
              mode={lostFoundMode}
              form={reportForm}
              onChange={handleReportChange}
              onSubmit={submitLostFoundReport}
              onBack={() => setLostFoundMode(null)}
              submitting={lostFoundSubmitting}
            />
          )}
        </main>
      </div>
    );
  }

  /*
   * SPACE FINDER
   */
  if (page === "spaces") {
    return (
      <div className={nightMode ? "app night-owl campus-3d" : "app campus-3d"}>
        <Navbar setPage={goTo} nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={studentProfile} user={user} onLogout={handleLogout} />

        <main className="space-finder">
          <BackButton setPage={goTo} />

          <PageHeader
            eyebrow="CAMPUS SPACE FINDER"
            title="Find your perfect space."
            text="Discover available places to study, work, collaborate or relax."
            count={filteredSpaces.length}
            countText="spaces found"
          />

          <CampusMap
            spaces={spaces}
            selectedSpace={selectedSpace}
            onSelectSpace={setSelectedSpace}
          />

          <div className="filter-bar">
            <span>Availability:</span>

            {["All", "Available", "Moderate", "Busy"].map((option) => (
              <button
                key={option}
                className={
                  spaceFilter === option ? "filter active" : "filter"
                }
                onClick={() => setSpaceFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <section
            style={{
              margin: "24px 0",
              padding: "22px",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
            }}
          >
            <span className="eyebrow">SPACE INSIGHT</span>
            <h2 style={{ marginBottom: "6px" }}>Expected campus crowd</h2>
            <p style={{ marginTop: 0, opacity: 0.7 }}>
              Simple heuristic demo based on typical campus patterns — not a live prediction model.
            </p>

            <div style={{ display: "grid", gap: "13px", marginTop: "16px" }}>
              {crowdData.map((item) => (
                <div key={item.time}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <strong>{item.time}</strong>
                    <span>{item.value}% crowd</span>
                  </div>
                  <div
                    style={{
                      height: "12px",
                      background: "#e5e7eb",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${item.value}%`,
                        height: "100%",
                        background: "currentColor",
                        borderRadius: "999px",
                        opacity: 0.7,
                      }}
                    />
                  </div>
                  <small style={{ opacity: 0.65 }}>{item.label}</small>
                </div>
              ))}
            </div>
          </section>

          <div className="space-finder-layout">
            <div className="finder-list">
              {filteredSpaces.map((space) => (
                <button
                  className={
                    selectedSpace?.id === space.id
                      ? "finder-card selected clickable-card"
                      : "finder-card clickable-card"
                  }
                  key={space.id}
                  onClick={() => setSelectedSpace(space)}
                >
                  <div className="finder-card-icon">
                    {space.type === "Library"
                      ? "📚"
                      : space.type === "Classroom"
                      ? "🏫"
                      : space.type === "Study Hall"
                      ? "📖"
                      : "🪑"}
                  </div>

                  <div className="finder-card-info">
                    <div className="finder-card-top">
                      <h3>{space.name}</h3>

                      <span
                        className={
                          "status " + space.status.toLowerCase()
                        }
                      >
                        ● {space.status}
                      </span>
                    </div>

                    <p>
                      {space.type} • {space.location}
                    </p>

                    <div className="space-meta">
                      <span>
                        👥{" "}
                        {liveAvailability[space.id] ?? space.available ?? 0} seats
                      </span>
                      <span>•</span>
                      <span>🔇 {space.environment}</span>
                      <span>•</span>
                      <span>⚡ LIVE</span>
                    </div>
                  </div>

                  <span className="arrow">→</span>
                </button>
              ))}
            </div>

            <div className="space-details">
              {selectedSpace ? (
                <>
                  <div className="details-icon">📍</div>

                  <span className="eyebrow">SPACE DETAILS</span>

                  <h2>{selectedSpace.name}</h2>

                  <p className="details-location">
                    {selectedSpace.location}
                  </p>

                  <div className="availability-box">
                    <div>
                      <span>Available seats</span>
                      <strong>{liveAvailability[selectedSpace.id] ?? selectedSpace.available ?? 0}</strong>
                    </div>

                    <div>
                      <span>Capacity</span>
                      <strong>{selectedSpace.capacity}</strong>
                    </div>
                  </div>

                  <div className="detail-row">
                    <span>Type</span>
                    <strong>{selectedSpace.type}</strong>
                  </div>

                  <div className="detail-row">
                    <span>Environment</span>
                    <strong>{selectedSpace.environment}</strong>
                  </div>

                  <p style={{ lineHeight: 1.7 }}>
                    {selectedSpace.description}
                  </p>

                  <div
                    style={{
                      margin: "18px 0",
                      padding: "16px",
                      borderRadius: "16px",
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <strong>🔔 Alert Me When Seats Open</strong>
                    <p style={{ margin: "7px 0 12px", lineHeight: 1.5 }}>
                      Get notified instead of repeatedly refreshing this page.
                    </p>

                    <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
                      <button
                        className="primary-button"
                        onClick={async () => {
                          const nextState = !seatAlert;
                          setSeatAlert(nextState);
                          setTelegramDemo(true);

                          if (!nextState) {
                            setSeatAlertMessage("Seat alert turned off.");
                            return;
                          }

                          try {
                            await sendSeatAlertRequest(selectedSpace.name);
                            setSeatAlertMessage(
                              "🔔 Telegram alert enabled. You'll get a message when seats open."
                            );
                          } catch {
                            setSeatAlertMessage(
                              "🔔 Demo alert enabled. Connect the optional Telegram server for phone notifications."
                            );
                          }
                        }}
                      >
                        {seatAlert ? "✓ Alert Enabled" : "Notify Me"}
                      </button>

                      <button
                        className="view-all"
                        onClick={() => {
                          const current = liveAvailability[selectedSpace.id];
                          const next = Math.min(
                            selectedSpace.capacity,
                            current + 3
                          );

                          setLiveAvailability((previous) => ({
                            ...previous,
                            [selectedSpace.id]: next,
                          }));

                          if (seatAlert && next > current) {
                            setSeatAlertMessage(
                              `🔔 Demo alert: ${selectedSpace.name} now has ${next} seats available!`
                            );

                            if ("Notification" in window) {
                              if (Notification.permission === "granted") {
                                new Notification("CampusBuddy — Seat Available", {
                                  body: `${selectedSpace.name} now has ${next} seats available.`,
                                });
                              } else if (Notification.permission !== "denied") {
                                Notification.requestPermission().then((permission) => {
                                  if (permission === "granted") {
                                    new Notification("CampusBuddy — Seat Available", {
                                      body: `${selectedSpace.name} now has ${next} seats available.`,
                                    });
                                  }
                                });
                              }
                            }
                          }
                        }}
                      >
                        ⚡ Simulate 3 seats opening
                      </button>
                    </div>

                    {seatAlertMessage && (
                      <div
                        style={{
                          marginTop: "12px",
                          padding: "11px 13px",
                          borderRadius: "10px",
                          background: "#eaf5d1",
                          color: "#26321e",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {seatAlertMessage}
                      </div>
                    )}

                    {telegramDemo && (
                      <small style={{ display: "block", marginTop: "9px", opacity: 0.7 }}>
                        Telegram mode: the frontend will use the local notification server when it is running.
                      </small>
                    )}
                  </div>

                  <div
                    style={{
                      margin: "18px 0",
                      padding: "16px",
                      borderRadius: "16px",
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <strong>👥 Who's Studying What?</strong>
                    <p style={{ margin: "7px 0 12px" }}>
                      Quiet academic activity — no chat or social feed.
                    </p>

                    <div style={{ display: "grid", gap: "8px" }}>
                      {studyActivities.map((activity) => (
                        <button
                          key={activity.id}
                          onClick={() => setSelectedStudyActivity(activity)}
                          style={{
                            textAlign: "left",
                            padding: "11px 13px",
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            background: "white",
                            cursor: "pointer",
                          }}
                        >
                          <strong>{activity.topic}</strong>
                          <span style={{ marginLeft: "8px", opacity: 0.65 }}>
                            • {activity.duration} • {activity.floor}
                          </span>
                        </button>
                      ))}
                    </div>

                    {selectedStudyActivity && (
                      <p style={{ marginBottom: 0, marginTop: "12px" }}>
                        <strong>3 students</strong> currently studying around{" "}
                        {selectedStudyActivity.topic} on {selectedStudyActivity.floor}.
                      </p>
                    )}
                  </div>

                  <button
                    className="primary-button full-button"
                    onClick={() => getDirections(selectedSpace)}
                  >
                    🧭 Get Directions
                  </button>

                  <button
                    className="view-all full-button"
                    onClick={() => goTo("detail", selectedSpace)}
                  >
                    View Full Space Details →
                  </button>
                </>
              ) : (
                <div className="empty-details">
                  <div>👆</div>
                  <h3>Select a space</h3>
                  <p>Click a space to see its details.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
   * EVENTS
   */
  if (page === "events") {
    return (
      <div className={nightMode ? "app night-owl campus-3d" : "app campus-3d"}>
        <Navbar setPage={goTo} nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={studentProfile} user={user} onLogout={handleLogout} />

        <main className="space-finder">
          <BackButton setPage={goTo} />

          <PageHeader
            eyebrow="CAMPUS EVENTS"
            title="Discover what's happening."
            text="Find workshops, competitions, sports and student activities."
            count={filteredEvents.length}
            countText="events"
          />

          <div className="filter-bar">
            <span>Category:</span>

            {[
              "All",
              "TECHNOLOGY",
              "COMPETITION",
              "SPORTS",
              "CLUB",
            ].map((category) => (
              <button
                key={category}
                className={
                  eventCategory === category ? "filter active" : "filter"
                }
                onClick={() => setEventCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {eventRegistrationLoading && (
            <div style={{ marginBottom: "14px", color: "#5d718f", fontWeight: 700 }}>
              Loading your Firebase registrations...
            </div>
          )}

          <div
            style={{
              marginBottom: "18px",
              padding: "16px 18px",
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span className="eyebrow">MY EVENT ACTIVITY</span>
              <strong style={{ display: "block", marginTop: "4px" }}>
                {registeredEvents.length} event{registeredEvents.length === 1 ? "" : "s"} registered
              </strong>
            </div>
            {registeredEvents.length > 0 && (
              <span style={{ fontSize: "13px", color: "#5d718f", fontWeight: 700 }}>
                Your registration is saved to Firebase.
              </span>
            )}
          </div>

          <div className="mini-event-list">
            {filteredEvents.map((event) => {
              const registered = registeredEvents.includes(event.id);

              return (
                <div className="mini-event" key={event.id}>
                  <div className="event-date">
                    <strong>{event.date}</strong>
                    <span>{event.month}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <span className="event-tag">{event.category}</span>

                    <h3>{event.title}</h3>

                    <p>
                      📍 {event.location} • {event.time}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="primary-button"
                        onClick={() => registerEvent(event.id)}
                      >
                        {eventRegistrationSaving === event.id
                          ? "Saving..."
                          : registered
                            ? "✓ Registered"
                            : "Register / Interested"}
                      </button>

                      <button
                        className="view-all"
                        onClick={() => goTo("detail", event)}
                      >
                        View Event →
                      </button>

                      <button
                        className="view-all"
                        onClick={() => getDirections(event)}
                      >
                        📍 Directions
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  /*
   * FOOD
   */
  if (page === "food") {
    return (
      <SimplePage
        setPage={goTo}
        eyebrow="FOOD & CANTEENS"
        title="Find something good to eat."
        text="Explore campus food spots, prices, ratings and crowd levels."
        nightMode={nightMode}
        setNightMode={setNightMode}
        geoVerified={geoVerified}
        profile={studentProfile}
        user={user}
        onLogout={handleLogout}
      >
        {foodLoading && (
          <p style={{ opacity: 0.7, marginBottom: "16px" }}>
            Loading food places from Firebase...
          </p>
        )}

        {visibleFood.length === 0 ? (
          <section className="section dashboard-section">
            <div className="notice-banner">
              <div className="notice-icon">🍽️</div>
              <div>
                <span className="eyebrow">FOOD & CANTEENS</span>
                <h3>No food places published yet.</h3>
                <p>
                  Campus administrators can publish food places from the Admin dashboard.
                </p>
              </div>
            </div>
          </section>
        ) : (
          <div className="module-grid">
            {visibleFood.map((place) => (
              <DashboardModule
                key={place.id}
                icon="🍔"
                title={place.name}
                text={
                  <>
                    {place.cuisine}
                    <br />
                    {place.price} • ⭐ {place.rating}
                    <br />
                    Crowd: {place.crowd}
                  </>
                }
                onClick={() => goTo("detail", place)}
              />
            ))}
          </div>
        )}

        {visibleFood.length > 0 && (
          <section className="section">
            <div className="notice-banner">
              <div className="notice-icon">🍽️</div>
              <div>
                <span className="eyebrow">CAMPUS FOOD</span>
                <h3>Food places from CampusBuddy</h3>
                <p>
                  {visibleFood[0].name} is currently listed with a rating of{" "}
                  {visibleFood[0].rating} and {String(visibleFood[0].crowd).toLowerCase()} crowd.
                </p>
              </div>
              <button onClick={() => goTo("detail", visibleFood[0])}>
                View place →
              </button>
            </div>
          </section>
        )}
      </SimplePage>
    );
  }

  /*
   * ACADEMIC HUB
   */
  if (page === "academic") {
    return (
      <SimplePage
        setPage={goTo}
        eyebrow="ACADEMIC HUB"
        title="Stay on top of your academics."
        text="Your academic information in one place."
        nightMode={nightMode}
        setNightMode={setNightMode}
        geoVerified={geoVerified}
        profile={studentProfile}
        user={user}
        onLogout={handleLogout}
      >
        <div className="module-grid">
          {academicItems.map((item) => (
            <InfoCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              text={item.text}
              onClick={() => goTo("detail", item)}
            />
          ))}
        </div>
      </SimplePage>
    );
  }

  /*
   * NOTICES
   */
  if (page === "notices") {
    return (
      <SimplePage
        setPage={goTo}
        eyebrow="CAMPUS NOTICES"
        title="Important campus updates."
        text="Keep up with academic and university announcements."
        nightMode={nightMode}
        setNightMode={setNightMode}
        geoVerified={geoVerified}
        profile={studentProfile}
        user={user}
        onLogout={handleLogout}
      >
        <div className="mini-space-list">
          {visibleNotices.map((notice) => (
            <button
              className="mini-space clickable-card"
              key={notice.id}
              onClick={() => goTo("detail", notice)}
            >
              <div className="mini-space-icon">📢</div>

              <div>
                <span className="event-tag">{notice.type}</span>
                <strong>{notice.title}</strong>
                <p>{notice.text}</p>
                <p>Published: {notice.date}</p>
              </div>

              <span className="arrow">→</span>
            </button>
          ))}
        </div>
      </SimplePage>
    );
  }

  /*
   * CAMPUS HELP
   */
  if (page === "help") {
    const isAdminUser = studentProfile?.role === "admin";

    if (isAdminUser) {
      return (
        <SimplePage
          setPage={goTo}
          eyebrow="ADMIN SUPPORT CENTER"
          title="Manage campus help."
          text="Review student maintenance requests and update their status from one place."
          nightMode={nightMode}
          setNightMode={setNightMode}
          geoVerified={geoVerified}
          profile={studentProfile}
          user={user}
          onLogout={handleLogout}
        >
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "22px",
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <span className="eyebrow">ADMIN MODE</span>
            <h2 style={{ marginBottom: "7px" }}>You are signed in as an administrator.</h2>
            <p style={{ marginBottom: "16px" }}>
              Student help requests belong in the Admin Dashboard. You can review
              reports, see who submitted them, and change each request from Open
              to In Progress or Resolved.
            </p>
            <button className="primary-button" onClick={() => goTo("admin")}>
              Open Admin Help Reports →
            </button>
          </div>

          <section className="section dashboard-section">
            <div style={{ marginBottom: "14px" }}>
              <span className="eyebrow">SUPPORT SNAPSHOT</span>
              <h2 style={{ marginBottom: "5px" }}>Current requests</h2>
              <p>Quick status counts from the reports available to this admin account.</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                ["Total", adminHelpReports.length, "📋"],
                ["Open", adminHelpReports.filter((report) => (report.status || "Open") === "Open").length, "🟠"],
                ["In Progress", adminHelpReports.filter((report) => report.status === "In Progress").length, "🔵"],
                ["Resolved", adminHelpReports.filter((report) => report.status === "Resolved").length, "🟢"],
              ].map(([label, value, icon]) => (
                <div
                  key={label}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    padding: "18px",
                  }}
                >
                  <div style={{ fontSize: "20px" }}>{icon}</div>
                  <strong style={{ display: "block", fontSize: "28px", marginTop: "7px" }}>
                    {value}
                  </strong>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#60708a" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="section dashboard-section" style={{ marginTop: "24px" }}>
            <div style={{ marginBottom: "14px" }}>
              <span className="eyebrow">EMERGENCY CONTACTS</span>
              <h2 style={{ marginBottom: "5px" }}>Campus support information</h2>
              <p>These are the same important support contacts shown to students.</p>
            </div>

            <div className="module-grid">
              {helpItems.map((item) => (
                <InfoCard
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  text={item.text}
                  onClick={() => goTo("detail", item)}
                />
              ))}
            </div>
          </section>
        </SimplePage>
      );
    }

    return (
      <SimplePage
        setPage={goTo}
        eyebrow="CAMPUS HELP"
        title="Need help? Report it."
        text="Report maintenance issues and quickly find important campus contacts."
        nightMode={nightMode}
        setNightMode={setNightMode}
        geoVerified={geoVerified}
        profile={studentProfile}
        user={user}
        onLogout={handleLogout}
      >
        {helpSubmitted ? (
          <div className="notice-banner">
            <div className="notice-icon">✅</div>

            <div>
              <span className="eyebrow">REPORT SUBMITTED</span>

              <h3>Thanks! Your issue has been reported.</h3>

              <p>
                The campus support team can now review your report.
              </p>
            </div>

            <button onClick={() => setHelpSubmitted(false)}>
              New report
            </button>
          </div>
        ) : (
          <section
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "30px",
              maxWidth: "750px",
              border: "1px solid #e5e7eb",
            }}
          >
            <form onSubmit={submitHelpReport}>
              <FormLabel text="Issue type" />

              <select
                value={helpForm.category}
                onChange={(e) =>
                  setHelpForm({
                    ...helpForm,
                    category: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option>Maintenance</option>
                <option>Safety</option>
                <option>Broken Equipment</option>
                <option>Cleanliness</option>
                <option>Other</option>
              </select>

              <FormLabel text="Location" />

              <input
                value={helpForm.location}
                onChange={(e) =>
                  setHelpForm({
                    ...helpForm,
                    location: e.target.value,
                  })
                }
                placeholder="e.g. Block 34, Room 204"
                required
                style={inputStyle}
              />

              <FormLabel text="Description" />

              <textarea
                value={helpForm.description}
                onChange={(e) =>
                  setHelpForm({
                    ...helpForm,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the problem..."
                rows="5"
                required
                style={inputStyle}
              />

              <button
                className="primary-button full-button"
                type="submit"
                disabled={helpSubmitting}
              >
                {helpSubmitting
                  ? "Saving to Firebase..."
                  : "Submit Help Request →"}
              </button>
            </form>
          </section>
        )}

        <section
          className="section dashboard-section"
          style={{ marginTop: "28px" }}
        >
          <div style={{ marginBottom: "14px" }}>
            <span className="eyebrow">YOUR REPORTS</span>
            <h2 style={{ marginBottom: "5px" }}>Issue history</h2>
            <p>Track support and maintenance requests submitted from your account.</p>
          </div>

          {helpLoading ? (
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "22px",
              }}
            >
              Loading your Firebase reports...
            </div>
          ) : helpReports.length === 0 ? (
            <div
              style={{
                background: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "22px",
              }}
            >
              <strong>No reports yet.</strong>
              <p style={{ marginBottom: 0 }}>
                Your submitted issues will appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {helpReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "18px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <strong>{report.category}</strong>
                    <span
                      style={{
                        padding: "5px 9px",
                        borderRadius: "999px",
                        background: "#fff3ed",
                        color: "#c54f3d",
                        fontSize: "12px",
                        fontWeight: 800,
                      }}
                    >
                      {report.status || "Open"}
                    </span>
                  </div>
                  <p style={{ margin: "8px 0 4px" }}>
                    <strong>Location:</strong> {report.location}
                  </p>
                  <p style={{ margin: 0 }}>{report.description}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="module-grid" style={{ marginTop: "25px" }}>
          {helpItems.map((item) => (
            <InfoCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              text={item.text}
              onClick={() => goTo("detail", item)}
            />
          ))}
        </div>
      </SimplePage>
    );
  }

  /*
   * ADMIN DASHBOARD
   */
  if (page === "admin") {
    if (studentProfile?.role !== "admin") return <SimplePage setPage={goTo} eyebrow="ADMIN ACCESS" title="Restricted area." text="Authorised campus administrators only." nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={studentProfile} user={user} onLogout={handleLogout}><div className="notice-banner"><div className="notice-icon">🔐</div><div><span className="eyebrow">ACCESS DENIED</span><h3>Admin role required</h3><p>Your Firebase user profile does not have the <strong>admin</strong> role.</p></div></div></SimplePage>;

    const adminList =
      adminSection === "notices"
        ? adminData.notices
        : adminSection === "events"
        ? adminData.events
        : adminSection === "spaces"
        ? firestoreSpaces
        : adminSection === "food"
        ? firestoreFood
        : adminSection === "registrations"
        ? adminRegistrations
        : adminHelpReports;
    return <SimplePage setPage={goTo} eyebrow="CAMPUS ADMIN" title="Control the campus experience." text="Manage campus content, spaces, food, student registrations and support reports from Firebase." nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={studentProfile} user={user} onLogout={handleLogout}>
      <div className="admin-hero">
        <div>
          <span className="eyebrow">LIVE CONTENT CONTROL</span>
          <h2>One dashboard. Campus content + student support.</h2>
          <p>
            Changes made here are stored in Firestore and reflected in the student experience.
          </p>
        </div>
        <div className="admin-status">● Firebase connected</div>
      </div>
      <div className="filter-bar admin-tabs">
        <button className={adminSection === "overview" ? "filter active" : "filter"} onClick={() => { setAdminSection("overview"); resetAdminForm(); resetSpaceForm(); resetFoodForm(); }}>📊 Overview</button>
        <button className={adminSection === "notices" ? "filter active" : "filter"} onClick={() => { setAdminSection("notices"); resetAdminForm(); resetSpaceForm(); resetFoodForm(); }}>📢 Notices</button>
        <button className={adminSection === "events" ? "filter active" : "filter"} onClick={() => { setAdminSection("events"); resetAdminForm(); resetSpaceForm(); resetFoodForm(); }}>📅 Events</button>
        <button className={adminSection === "spaces" ? "filter active" : "filter"} onClick={() => { setAdminSection("spaces"); resetAdminForm(); resetSpaceForm(); resetFoodForm(); }}>🏫 Spaces</button>
        <button className={adminSection === "food" ? "filter active" : "filter"} onClick={() => { setAdminSection("food"); resetAdminForm(); resetSpaceForm(); resetFoodForm(); }}>🍔 Food</button>
        <button className={adminSection === "registrations" ? "filter active" : "filter"} onClick={() => { setAdminSection("registrations"); resetAdminForm(); resetSpaceForm(); resetFoodForm(); }}>🎟️ Registrations</button>
        <button className={adminSection === "help" ? "filter active" : "filter"} onClick={() => { setAdminSection("help"); resetAdminForm(); resetSpaceForm(); resetFoodForm(); }}>🛠️ Help Reports</button>
      </div>
      {adminSection === "overview" && (() => {
        const openHelp = adminHelpReports.filter(
          (report) => (report.status || "Open") === "Open"
        ).length;
        const inProgressHelp = adminHelpReports.filter(
          (report) => report.status === "In Progress"
        ).length;
        const resolvedHelp = adminHelpReports.filter(
          (report) => report.status === "Resolved"
        ).length;

        const uniqueRegisteredStudents = new Set(
          adminRegistrations.map(
            (registration) =>
              registration.userId ||
              registration.studentEmail ||
              registration.studentName
          )
        ).size;

        const overviewStats = [
          {
            label: "Published notices",
            value: adminData.notices.length,
            icon: "📢",
            action: "notices",
            helper: "Live Firestore content",
          },
          {
            label: "Upcoming events",
            value: adminData.events.length,
            icon: "📅",
            action: "events",
            helper: "Live Firestore content",
          },
          {
            label: "Campus spaces",
            value: firestoreSpaces.length,
            icon: "🏫",
            action: "spaces",
            helper: "Managed spaces",
          },
          {
            label: "Food places",
            value: firestoreFood.length,
            icon: "🍔",
            action: "food",
            helper: "Managed food listings",
          },
          {
            label: "Event registrations",
            value: adminRegistrations.length,
            icon: "🎟️",
            action: "registrations",
            helper: `${uniqueRegisteredStudents} unique student${uniqueRegisteredStudents === 1 ? "" : "s"}`,
          },
          {
            label: "Open help reports",
            value: openHelp,
            icon: "🆘",
            action: "help",
            helper: `${inProgressHelp} in progress • ${resolvedHelp} resolved`,
          },
        ];

        const recentRegistrations = adminRegistrations.slice(0, 5);
        const recentHelpReports = adminHelpReports.slice(0, 5);

        return (
          <section style={{ width: "100%" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: "14px",
                marginBottom: "22px",
              }}
            >
              {overviewStats.map((stat) => (
                <button
                  key={stat.label}
                  type="button"
                  onClick={() => setAdminSection(stat.action)}
                  style={{
                    textAlign: "left",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "20px",
                    padding: "20px",
                    cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(20, 33, 61, 0.05)",
                  }}
                >
                  <div style={{ fontSize: "22px" }}>{stat.icon}</div>
                  <strong
                    style={{
                      display: "block",
                      fontSize: "32px",
                      lineHeight: 1,
                      marginTop: "12px",
                    }}
                  >
                    {stat.value}
                  </strong>
                  <span
                    style={{
                      display: "block",
                      marginTop: "9px",
                      fontSize: "12px",
                      fontWeight: 900,
                      color: "#14213d",
                    }}
                  >
                    {stat.label}
                  </span>
                  <small
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#60708a",
                      lineHeight: 1.4,
                    }}
                  >
                    {stat.helper}
                  </small>
                </button>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
                marginBottom: "22px",
              }}
            >
              <section className="admin-list-card">
                <div className="admin-card-heading">
                  <div>
                    <span className="eyebrow">QUICK ACTIONS</span>
                    <h3>Manage campus content</h3>
                  </div>
                </div>

                <div style={{ display: "grid", gap: "10px" }}>
                  {[
                    ["📢", "Publish notice", "notices"],
                    ["📅", "Create event", "events"],
                    ["🏫", "Add campus space", "spaces"],
                    ["🍔", "Add food place", "food"],
                  ].map(([icon, label, section]) => (
                    <button
                      key={section}
                      type="button"
                      className="view-all"
                      onClick={() => {
                        setAdminSection(section);
                        resetAdminForm();
                        resetSpaceForm();
                        resetFoodForm();
                      }}
                      style={{
                        textAlign: "left",
                        padding: "13px 15px",
                        width: "100%",
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>{icon}</span>
                      {label} →
                    </button>
                  ))}
                </div>
              </section>

              <section className="admin-list-card">
                <div className="admin-card-heading">
                  <div>
                    <span className="eyebrow">SUPPORT HEALTH</span>
                    <h3>Student help status</h3>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setAdminSection("help")}
                  >
                    Open reports
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "10px",
                  }}
                >
                  {[
                    ["Open", openHelp, "🟠"],
                    ["Progress", inProgressHelp, "🔵"],
                    ["Resolved", resolvedHelp, "🟢"],
                  ].map(([label, value, icon]) => (
                    <div
                      key={label}
                      style={{
                        padding: "14px",
                        borderRadius: "14px",
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div>{icon}</div>
                      <strong
                        style={{
                          display: "block",
                          fontSize: "24px",
                          marginTop: "7px",
                        }}
                      >
                        {value}
                      </strong>
                      <small style={{ color: "#60708a", fontWeight: 800 }}>
                        {label}
                      </small>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "18px",
              }}
            >
              <section className="admin-list-card">
                <div className="admin-card-heading">
                  <div>
                    <span className="eyebrow">RECENT ACTIVITY</span>
                    <h3>Latest event registrations</h3>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setAdminSection("registrations")}
                  >
                    View all
                  </button>
                </div>

                {recentRegistrations.length === 0 ? (
                  <p>No event registrations yet.</p>
                ) : (
                  <div className="admin-item-list">
                    {recentRegistrations.map((registration) => (
                      <div className="admin-item" key={registration.id}>
                        <div className="admin-item-main">
                          <strong>
                            {registration.studentName || "Campus student"}
                          </strong>
                          <p>
                            {registration.eventTitle ||
                              `Event ${registration.eventId || ""}`}
                          </p>
                          <small style={{ opacity: 0.65 }}>
                            {formatRegistrationDate(registration.registeredAt)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="admin-list-card">
                <div className="admin-card-heading">
                  <div>
                    <span className="eyebrow">NEEDS ATTENTION</span>
                    <h3>Latest help reports</h3>
                  </div>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setAdminSection("help")}
                  >
                    View all
                  </button>
                </div>

                {recentHelpReports.length === 0 ? (
                  <p>No student help reports yet.</p>
                ) : (
                  <div className="admin-item-list">
                    {recentHelpReports.map((report) => (
                      <div className="admin-item" key={report.id}>
                        <div className="admin-item-main">
                          <span className="event-tag">
                            {report.status || "Open"}
                          </span>
                          <strong>{report.category || "Support"}</strong>
                          <p>{report.location || "Campus"}</p>
                          <small style={{ opacity: 0.65 }}>
                            {report.description || "No description added."}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </section>
        );
      })()}

      {adminSection === "help" && (() => {
        const total = adminHelpReports.length;
        const open = adminHelpReports.filter((report) => (report.status || "Open") === "Open").length;
        const inProgress = adminHelpReports.filter((report) => report.status === "In Progress").length;
        const resolved = adminHelpReports.filter((report) => report.status === "Resolved").length;

        const categoryCounts = adminHelpReports.reduce((counts, report) => {
          const category = report.category || "Other";
          counts[category] = (counts[category] || 0) + 1;
          return counts;
        }, {});

        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

        return (
          <section style={{ marginBottom: "22px" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px"
            }}>
              {[
                ["TOTAL", total, "📋"],
                ["OPEN", open, "🟠"],
                ["IN PROGRESS", inProgress, "🔵"],
                ["RESOLVED", resolved, "🟢"]
              ].map(([label, value, icon]) => (
                <div key={label} style={{
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "18px",
                  padding: "18px"
                }}>
                  <div style={{ fontSize: "20px" }}>{icon}</div>
                  <strong style={{ display: "block", fontSize: "30px", marginTop: "8px" }}>{value}</strong>
                  <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: ".08em", color: "#60708a" }}>{label}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: "12px",
              padding: "16px 18px",
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              borderRadius: "16px"
            }}>
              <span className="eyebrow">CAMPUS SUPPORT OVERVIEW</span>
              <p style={{ margin: "6px 0 0" }}>
                {topCategory
                  ? <><strong>{topCategory[0]}</strong> is currently the most reported category with <strong>{topCategory[1]}</strong> request{topCategory[1] === 1 ? "" : "s"}.</>
                  : "No support requests have been submitted yet."}
              </p>
            </div>
          </section>
        );
      })()}

      {adminSection === "registrations" ? (
        (() => {
          const eventMap = new Map(
            [...events, ...visibleEvents].map((item) => [String(item.id), item])
          );

          const registrationEventOptions = [
            ...new Set(
              adminRegistrations
                .map((registration) => {
                  const event = eventMap.get(String(registration.eventId));
                  return {
                    id: String(registration.eventId || ""),
                    title:
                      registration.eventTitle ||
                      event?.title ||
                      `Event ${registration.eventId || ""}`,
                  };
                })
                .filter((item) => item.id)
                .map((item) => JSON.stringify(item))
            ),
          ]
            .map((item) => JSON.parse(item))
            .sort((a, b) => a.title.localeCompare(b.title));

          const filteredRegistrations =
            adminRegistrationEventFilter === "All"
              ? adminRegistrations
              : adminRegistrations.filter(
                  (registration) =>
                    String(registration.eventId) ===
                    String(adminRegistrationEventFilter)
                );

          const uniqueStudents = new Set(
            adminRegistrations.map(
              (registration) =>
                registration.userId || registration.studentEmail || registration.studentName
            )
          ).size;

          const registeredEventCount = new Set(
            adminRegistrations.map((registration) => String(registration.eventId))
          ).size;

          return (
            <section style={{ width: "100%" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                {[
                  ["TOTAL REGISTRATIONS", adminRegistrations.length, "🎟️"],
                  ["UNIQUE STUDENTS", uniqueStudents, "👥"],
                  ["EVENTS WITH REGISTRATIONS", registeredEventCount, "📅"],
                ].map(([label, value, icon]) => (
                  <div
                    key={label}
                    style={{
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "18px",
                      padding: "18px",
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>{icon}</div>
                    <strong
                      style={{
                        display: "block",
                        fontSize: "30px",
                        marginTop: "8px",
                      }}
                    >
                      {value}
                    </strong>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: ".08em",
                        color: "#60708a",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>

              <section className="admin-list-card" style={{ width: "100%" }}>
                <div className="admin-card-heading">
                  <div>
                    <span className="eyebrow">EVENT REGISTRATION MANAGEMENT</span>
                    <h3>Students registered for campus events</h3>
                  </div>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={downloadRegistrationsCSV}
                    disabled={adminRegistrations.length === 0}
                  >
                    ⬇ Export CSV
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(220px, 1fr) auto",
                    gap: "12px",
                    alignItems: "end",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <FormLabel text="Filter by event" />
                    <select
                      style={inputStyle}
                      value={adminRegistrationEventFilter}
                      onChange={(event) =>
                        setAdminRegistrationEventFilter(event.target.value)
                      }
                    >
                      <option value="All">All events</option>
                      {registrationEventOptions.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: "12px",
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      fontWeight: 800,
                    }}
                  >
                    Showing {filteredRegistrations.length}
                  </div>
                </div>

                {adminRegistrationsLoading ? (
                  <p>Loading registrations from Firebase...</p>
                ) : filteredRegistrations.length === 0 ? (
                  <div
                    style={{
                      padding: "24px",
                      borderRadius: "16px",
                      background: "#f8fafc",
                      border: "1px dashed #dbe2ea",
                    }}
                  >
                    <strong>No registrations found.</strong>
                    <p style={{ marginBottom: 0 }}>
                      Student event registrations will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div className="admin-item-list">
                    {filteredRegistrations.map((registration) => {
                      const event = eventMap.get(String(registration.eventId));
                      const eventTitle =
                        registration.eventTitle ||
                        event?.title ||
                        `Event ${registration.eventId || ""}`;

                      const eventDate =
                        registration.eventDate ||
                        (event
                          ? `${event.date || ""} ${event.month || ""}`.trim()
                          : "");

                      return (
                        <div className="admin-item" key={registration.id}>
                          <div className="admin-item-main">
                            <span className="event-tag">
                              {event?.category || "EVENT"}
                            </span>
                            <strong>{eventTitle}</strong>
                            <p>
                              👤 {registration.studentName || "Campus student"}
                              {registration.studentEmail
                                ? ` • ${registration.studentEmail}`
                                : ""}
                            </p>
                            <p style={{ marginBottom: "4px" }}>
                              📅 {eventDate || "Date not added"}
                              {registration.eventTime || event?.time
                                ? ` • ${registration.eventTime || event?.time}`
                                : ""}
                              {registration.eventLocation || event?.location
                                ? ` • ${registration.eventLocation || event?.location}`
                                : ""}
                            </p>
                            <small style={{ opacity: 0.65 }}>
                              Registered {formatRegistrationDate(registration.registeredAt)}
                            </small>
                          </div>

                          <div className="admin-item-actions">
                            <button
                              className="danger-button"
                              disabled={adminRegistrationDeleting === registration.id}
                              onClick={() => deleteAdminRegistration(registration)}
                            >
                              {adminRegistrationDeleting === registration.id
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </section>
          );
        })()
      ) : adminSection === "spaces" ? (
        <div className="admin-grid">
          <section className="admin-form-card">
            <div className="admin-card-heading">
              <div>
                <span className="eyebrow">{editingSpace ? "EDIT SPACE" : "PUBLISH SPACE"}</span>
                <h3>{editingSpace ? "Update this space" : "New campus space"}</h3>
              </div>
              {editingSpace && (
                <button className="secondary-button" type="button" onClick={resetSpaceForm}>
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={saveSpace}>
              <FormLabel text="Space name" />
              <input
                style={inputStyle}
                value={spaceForm.name}
                onChange={(event) =>
                  setSpaceForm({ ...spaceForm, name: event.target.value })
                }
                placeholder="e.g. Central Library"
                required
              />

              <FormLabel text="Type" />
              <select
                style={inputStyle}
                value={spaceForm.type}
                onChange={(event) =>
                  setSpaceForm({ ...spaceForm, type: event.target.value })
                }
              >
                <option>Library</option>
                <option>Classroom</option>
                <option>Study Hall</option>
                <option>Common Area</option>
                <option>Lab</option>
                <option>Cafeteria</option>
              </select>

              <FormLabel text="Location" />
              <input
                style={inputStyle}
                value={spaceForm.location}
                onChange={(event) =>
                  setSpaceForm({ ...spaceForm, location: event.target.value })
                }
                placeholder="e.g. 2nd Floor"
                required
              />

              <div className="admin-form-two-col">
                <div>
                  <FormLabel text="Capacity" />
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    value={spaceForm.capacity}
                    onChange={(event) =>
                      setSpaceForm({ ...spaceForm, capacity: event.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <FormLabel text="Available seats" />
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    value={spaceForm.available}
                    onChange={(event) =>
                      setSpaceForm({ ...spaceForm, available: event.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <FormLabel text="Availability status" />
              <select
                style={inputStyle}
                value={spaceForm.status}
                onChange={(event) =>
                  setSpaceForm({ ...spaceForm, status: event.target.value })
                }
              >
                <option>Available</option>
                <option>Moderate</option>
                <option>Busy</option>
              </select>

              <FormLabel text="Environment" />
              <select
                style={inputStyle}
                value={spaceForm.environment}
                onChange={(event) =>
                  setSpaceForm({ ...spaceForm, environment: event.target.value })
                }
              >
                <option>Quiet</option>
                <option>Social</option>
                <option>Collaborative</option>
                <option>Active</option>
              </select>

              <FormLabel text="Description" />
              <textarea
                style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
                value={spaceForm.description}
                onChange={(event) =>
                  setSpaceForm({ ...spaceForm, description: event.target.value })
                }
                placeholder="Describe the space..."
                required
              />

              <button
                className="primary-button admin-publish"
                type="submit"
                disabled={spaceSaving}
              >
                {spaceSaving
                  ? "Saving to Firebase..."
                  : editingSpace
                  ? "✓ Update space"
                  : "🚀 Publish space"}
              </button>
            </form>
          </section>

          <section className="admin-list-card">
            <div className="admin-card-heading">
              <div>
                <span className="eyebrow">FIRESTORE SPACES</span>
                <h3>Published campus spaces</h3>
              </div>
              <span className="admin-count">{firestoreSpaces.length}</span>
            </div>

            {spaceLoading ? (
              <p>Loading spaces from Firebase...</p>
            ) : firestoreSpaces.length === 0 ? (
              <p>No Firebase spaces yet. Publish your first space using the form.</p>
            ) : (
              <div className="admin-item-list">
                {firestoreSpaces.map((space) => (
                  <div className="admin-item" key={space.id}>
                    <div className="admin-item-main">
                      <span className="event-tag">
                        {space.type || "SPACE"}
                      </span>
                      <strong>{space.name}</strong>
                      <p>
                        {space.location || "Campus"} • {space.available ?? 0} / {space.capacity ?? 0} seats • {space.status || "Available"}
                      </p>
                      <small style={{ opacity: 0.65 }}>
                        {space.environment || "Quiet"} environment
                      </small>
                    </div>

                    <div className="admin-item-actions">
                      <button
                        className="secondary-button"
                        onClick={() => startSpaceEdit(space)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => deleteSpace(space)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : adminSection === "food" ? (
        <div className="admin-grid">
          <section className="admin-form-card">
            <div className="admin-card-heading">
              <div>
                <span className="eyebrow">{editingFood ? "EDIT FOOD PLACE" : "PUBLISH FOOD PLACE"}</span>
                <h3>{editingFood ? "Update this food place" : "New campus food place"}</h3>
              </div>
              {editingFood && (
                <button className="secondary-button" type="button" onClick={resetFoodForm}>
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={saveFoodPlace}>
              <FormLabel text="Food place name" />
              <input
                style={inputStyle}
                value={foodForm.name}
                onChange={(event) =>
                  setFoodForm({ ...foodForm, name: event.target.value })
                }
                placeholder="e.g. Uni Mall Food Court"
                required
              />

              <FormLabel text="Cuisine / food type" />
              <input
                style={inputStyle}
                value={foodForm.cuisine}
                onChange={(event) =>
                  setFoodForm({ ...foodForm, cuisine: event.target.value })
                }
                placeholder="e.g. Multi-cuisine"
                required
              />

              <FormLabel text="Price range" />
              <input
                style={inputStyle}
                value={foodForm.price}
                onChange={(event) =>
                  setFoodForm({ ...foodForm, price: event.target.value })
                }
                placeholder="e.g. ₹50 - ₹200"
                required
              />

              <div className="admin-form-two-col">
                <div>
                  <FormLabel text="Crowd level" />
                  <select
                    style={inputStyle}
                    value={foodForm.crowd}
                    onChange={(event) =>
                      setFoodForm({ ...foodForm, crowd: event.target.value })
                    }
                  >
                    <option>Available</option>
                    <option>Moderate</option>
                    <option>Busy</option>
                  </select>
                </div>

                <div>
                  <FormLabel text="Rating" />
                  <input
                    style={inputStyle}
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={foodForm.rating}
                    onChange={(event) =>
                      setFoodForm({ ...foodForm, rating: event.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <FormLabel text="Description" />
              <textarea
                style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }}
                value={foodForm.description}
                onChange={(event) =>
                  setFoodForm({ ...foodForm, description: event.target.value })
                }
                placeholder="Describe the food place, popular items, timings, etc."
                required
              />

              <button
                className="primary-button admin-publish"
                type="submit"
                disabled={foodSaving}
              >
                {foodSaving
                  ? "Saving to Firebase..."
                  : editingFood
                  ? "✓ Update food place"
                  : "🚀 Publish food place"}
              </button>
            </form>
          </section>

          <section className="admin-list-card">
            <div className="admin-card-heading">
              <div>
                <span className="eyebrow">FIRESTORE FOOD PLACES</span>
                <h3>Published food places</h3>
              </div>
              <span className="admin-count">{firestoreFood.length}</span>
            </div>

            {foodLoading ? (
              <p>Loading food places from Firebase...</p>
            ) : firestoreFood.length === 0 ? (
              <p>No Firebase food places yet. Publish your first one using the form.</p>
            ) : (
              <div className="admin-item-list">
                {firestoreFood.map((place) => (
                  <div className="admin-item" key={place.id}>
                    <div className="admin-item-main">
                      <span className="event-tag">{place.cuisine || "FOOD"}</span>
                      <strong>{place.name}</strong>
                      <p>
                        {place.price || "Price not added"} • ⭐ {place.rating || "0.0"} • Crowd: {place.crowd || "Moderate"}
                      </p>
                      <small style={{ opacity: 0.65 }}>
                        {place.description || "No description added."}
                      </small>
                    </div>

                    <div className="admin-item-actions">
                      <button
                        className="secondary-button"
                        onClick={() => startFoodEdit(place)}
                      >
                        Edit
                      </button>
                      <button
                        className="danger-button"
                        onClick={() => deleteFoodPlace(place)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : adminSection === "help" ? (
        <section className="admin-list-card" style={{ width: "100%" }}>
          <div className="admin-card-heading">
            <div><span className="eyebrow">STUDENT SUPPORT</span><h3>Help & maintenance reports</h3></div>
            <span className="admin-count">{adminHelpReports.length}</span>
          </div>
          {adminHelpLoading ? <p>Loading student reports from Firebase...</p> : adminHelpReports.length === 0 ? (
            <p>No help reports have been submitted yet.</p>
          ) : (
            <div className="admin-item-list">
              {adminHelpReports.map((report) => (
                <div className="admin-item" key={report.id}>
                  <div className="admin-item-main">
                    <span className="event-tag">{report.category || "SUPPORT"}</span>
                    <strong>{report.location || "Campus"}</strong>
                    <p>{report.description || "No description added."}</p>
                    <small style={{ opacity: 0.65 }}>
                      Reported by {report.studentName || "Campus student"}
                      {report.studentEmail ? ` • ${report.studentEmail}` : ""}
                    </small>
                  </div>
                  <div className="admin-item-actions" style={{ alignItems: "center" }}>
                    <select
                      style={{ ...inputStyle, minWidth: "145px", padding: "10px 12px" }}
                      value={report.status || "Open"}
                      disabled={adminHelpUpdating === report.id}
                      onChange={(e) => updateHelpReportStatus(report, e.target.value)}
                    >
                      <option>Open</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
      <div className="admin-grid">
        <section className="admin-form-card"><div className="admin-card-heading"><div><span className="eyebrow">{editingAdminItem ? "EDIT" : "PUBLISH"}</span><h3>{editingAdminItem ? "Update this item" : `New ${adminSection === "notices" ? "notice" : "event"}`}</h3></div>{editingAdminItem && <button className="secondary-button" type="button" onClick={resetAdminForm}>Cancel</button>}</div>
          <form onSubmit={saveAdminItem}><FormLabel text="Title" /><input style={inputStyle} value={adminForm.title} onChange={(e) => setAdminForm({ ...adminForm, title: e.target.value })} placeholder="Title" required />
          {adminSection === "notices" ? <><FormLabel text="Notice type" /><select style={inputStyle} value={adminForm.type} onChange={(e) => setAdminForm({ ...adminForm, type: e.target.value })}><option>ACADEMIC</option><option>GENERAL</option><option>URGENT</option><option>EVENT</option></select><FormLabel text="Published date" /><input style={inputStyle} value={adminForm.date} onChange={(e) => setAdminForm({ ...adminForm, date: e.target.value })} placeholder="12 Sep 2026" /><FormLabel text="Message" /><textarea style={{ ...inputStyle, minHeight: "110px", resize: "vertical" }} value={adminForm.text} onChange={(e) => setAdminForm({ ...adminForm, text: e.target.value })} placeholder="What should students know?" required /><FormLabel text="Details" /><textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} value={adminForm.detail} onChange={(e) => setAdminForm({ ...adminForm, detail: e.target.value })} placeholder="Additional information" /></> : <><FormLabel text="Category" /><select style={inputStyle} value={adminForm.category} onChange={(e) => setAdminForm({ ...adminForm, category: e.target.value })}><option>TECHNOLOGY</option><option>COMPETITION</option><option>SPORTS</option><option>CLUB</option></select><div className="admin-form-two-col"><div><FormLabel text="Date" /><input style={inputStyle} value={adminForm.date} onChange={(e) => setAdminForm({ ...adminForm, date: e.target.value })} placeholder="18" /></div><div><FormLabel text="Month" /><input style={inputStyle} value={adminForm.month} onChange={(e) => setAdminForm({ ...adminForm, month: e.target.value })} placeholder="SEP" /></div></div><FormLabel text="Time" /><input style={inputStyle} value={adminForm.time} onChange={(e) => setAdminForm({ ...adminForm, time: e.target.value })} placeholder="4:00 PM – 6:00 PM" /><FormLabel text="Location" /><input style={inputStyle} value={adminForm.location} onChange={(e) => setAdminForm({ ...adminForm, location: e.target.value })} placeholder="Block 34 Auditorium" /><FormLabel text="Message" /><textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} value={adminForm.text} onChange={(e) => setAdminForm({ ...adminForm, text: e.target.value })} placeholder="Tell students what this event is about." /><FormLabel text="Details" /><textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} value={adminForm.detail} onChange={(e) => setAdminForm({ ...adminForm, detail: e.target.value })} placeholder="Event details" /></>}
          <button className="primary-button admin-publish" type="submit" disabled={adminSaving}>{adminSaving ? "Saving to Firebase..." : editingAdminItem ? "✓ Update content" : "🚀 Publish to campus"}</button></form>
        </section>
        <section className="admin-list-card">
          <div className="admin-card-heading">
            <div>
              <span className="eyebrow">FIRESTORE ITEMS</span>
              <h3>{adminSection === "notices" ? "Published notices" : adminSection === "events" ? "Published events" : adminSection === "spaces" ? "Published spaces" : adminSection === "food" ? "Published food places" : adminSection === "registrations" ? "Event registrations" : adminSection === "overview" ? "Admin overview" : "Student help reports"}</h3>
            </div>
            <span className="admin-count">{adminList.length}</span>
          </div>

          {adminSection === "help" ? (
            adminHelpLoading ? (
              <p>Loading student support reports...</p>
            ) : adminList.length === 0 ? (
              <p>No student help reports yet.</p>
            ) : (
              <div className="admin-item-list">
                {adminList.map((report) => {
                  const status = report.status || "Open";
                  return (
                    <div className="admin-item" key={report.id}>
                      <div className="admin-item-main">
                        <span className="event-tag">{report.category || "OTHER"}</span>
                        <strong>{report.location || "Campus location"}</strong>
                        <p>{report.description || "No description added."}</p>
                        <small style={{ opacity: 0.65 }}>
                          Reported by {report.studentName || "Campus student"}
                          {report.studentEmail ? ` • ${report.studentEmail}` : ""}
                        </small>
                      </div>

                      <div className="admin-item-actions" style={{ alignItems: "center" }}>
                        <select
                          value={status}
                          disabled={adminHelpUpdating === report.id}
                          onChange={(event) => updateHelpReportStatus(report, event.target.value)}
                          style={{
                            padding: "9px 10px",
                            borderRadius: "10px",
                            border: "1px solid #dbe2ea",
                            fontWeight: 700,
                            background: "white"
                          }}
                        >
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Resolved</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            adminLoading ? <p>Loading Firebase content...</p> : adminList.length === 0 ? <p>No admin-created content yet.</p> : (
              <div className="admin-item-list">
                {adminList.map((item) => (
                  <div className="admin-item" key={item.id}>
                    <div className="admin-item-main">
                      <span className="event-tag">{item.type || item.category || "CAMPUS"}</span>
                      <strong>{item.title}</strong>
                      <p>{item.text || item.detail || "No description added."}</p>
                    </div>
                    <div className="admin-item-actions">
                      <button className="secondary-button" disabled={item.source !== "firestore"} onClick={() => startAdminEdit(item, adminSection)}>Edit</button>
                      <button className="danger-button" disabled={item.source !== "firestore"} onClick={() => deleteAdminItem(item, adminSection)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      </div>
      )}
    </SimplePage>;
  }

  /*
   * PROFILE
   */
  if (page === "profile") {
    const initials = (profileForm.name || "Student")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");

    return (
      <SimplePage
        setPage={goTo}
        eyebrow="MY PROFILE"
        title="Make CampusBuddy yours."
        text="Keep your student information current so CampusBuddy can personalize your campus experience."
        nightMode={nightMode}
        setNightMode={setNightMode}
        geoVerified={geoVerified}
        profile={studentProfile}
        user={user}
        onLogout={handleLogout}
      >
        <section className="profile-editor-card">
          <div className="profile-editor-header">
            <div className="profile-editor-avatar">{initials || "S"}</div>
            <div>
              <span className="eyebrow">PERSONALIZED CAMPUS EXPERIENCE</span>
              <h2>{profileForm.name || "Campus student"}</h2>
              <p>{user.email}</p>
            </div>
            <span className="profile-role-pill">{studentProfile?.role === "admin" ? "ADMIN" : "STUDENT"}</span>
          </div>

          <form onSubmit={saveStudentProfile} className="profile-editor-form">
            <div className="profile-form-grid">
              <div><FormLabel text="Full name" /><input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} style={inputStyle} required /></div>
              <div><FormLabel text="Course / programme" /><input value={profileForm.course} onChange={(e) => setProfileForm({ ...profileForm, course: e.target.value })} placeholder="e.g. B.Tech CSE" style={inputStyle} /></div>
              <div><FormLabel text="Year" /><input value={profileForm.year} onChange={(e) => setProfileForm({ ...profileForm, year: e.target.value })} placeholder="e.g. 1" style={inputStyle} /></div>
              <div><FormLabel text="Department" /><input value={profileForm.department} onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })} placeholder="e.g. Computer Science" style={inputStyle} /></div>
              <div><FormLabel text="Phone" /><input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="Optional" style={inputStyle} /></div>
              <div className="profile-form-full"><FormLabel text="Short bio" /><textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="What are you interested in on campus?" rows="4" style={inputStyle} /></div>
            </div>
            <div className="profile-editor-actions">
              <button className="primary-button" type="submit" disabled={profileSaving}>{profileSaving ? "Saving..." : "Save Profile"}</button>
              <button className="view-all" type="button" onClick={() => goTo("community")}>Edit Community Profile →</button>
            </div>
          </form>
        </section>

        <section className="section dashboard-section">
          <div className="section-heading-row"><div><span className="eyebrow">PERSONALIZATION</span><h2>What CampusBuddy can use</h2></div></div>
          <div className="module-grid">
            <DashboardModule icon="🎯" title="Better AI results" text="Your course, interests and profile help tailor campus suggestions." onClick={() => goTo("home")} />
            <DashboardModule icon="🤝" title="Community matching" text="Skills and interests make it easier to find project and study partners." onClick={() => goTo("community")} />
            <DashboardModule icon="📅" title="Event discovery" text="Use your interests when browsing campus activities." onClick={() => goTo("events")} />
            <DashboardModule icon="🔔" title="Campus updates" text="See notices, event activity and support updates in one place." onClick={() => goTo("notifications")} />
          </div>
        </section>
      </SimplePage>
    );
  }

  /*
   * NOTIFICATIONS / CAMPUS INTELLIGENCE
   */
  if (page === "notifications") {
    const notificationItems = [
      ...visibleNotices.slice(0, 5).map((notice) => ({ id: `notice-${notice.id}`, icon: "📢", type: "Notice", title: notice.title, text: notice.text, action: () => goTo("notices") })),
      ...visibleEvents.slice(0, 5).map((event) => ({ id: `event-${event.id}`, icon: "📅", type: "Event", title: event.title, text: `${event.date || "Upcoming"} • ${event.location || "Campus"}`, action: () => goTo("events") })),
      ...helpReports.slice(0, 5).map((report) => ({ id: `help-${report.id}`, icon: "🆘", type: "Support", title: `${report.category} request`, text: `${report.location} • ${report.status || "Open"}`, action: () => goTo("help") })),
    ];

    return (
      <SimplePage
        setPage={goTo}
        eyebrow="CAMPUS UPDATES"
        title="Your notification center."
        text="Important notices, event activity and your support requests in one live view."
        nightMode={nightMode}
        setNightMode={setNightMode}
        geoVerified={geoVerified}
        profile={studentProfile}
        user={user}
        onLogout={handleLogout}
      >
        <section className="notification-hero">
          <div><span className="eyebrow">LIVE CAMPUS INTELLIGENCE</span><h2>{notificationItems.length} updates available</h2><p>Notices and events are synced from Firebase in real time. Support updates are tied to your account.</p></div>
          <button className="primary-button" onClick={() => { if ("Notification" in window) Notification.requestPermission(); }}>🔔 Enable browser alerts</button>
        </section>

        {notificationItems.length === 0 ? (
          <div className="empty-details"><div>✨</div><h3>You are all caught up.</h3><p>New campus updates will appear here automatically.</p></div>
        ) : (
          <div className="notification-list">
            {notificationItems.map((item) => (
              <button className="notification-card" key={item.id} onClick={item.action}>
                <span className="notification-icon">{item.icon}</span>
                <span className="notification-copy"><small>{item.type}</small><strong>{item.title}</strong><span>{item.text}</span></span>
                <span className="notification-arrow">→</span>
              </button>
            ))}
          </div>
        )}
      </SimplePage>
    );
  }

  /*
   * COMMUNITY
   */
  if (page === "community") {
    const currentUserId = user?.uid;

    const normalizedCommunitySearch = communitySearch.trim().toLowerCase();

    const filteredCommunityProfiles = communityProfiles.filter((profile) => {
      if (!normalizedCommunitySearch) return true;

      const searchableText = [
        profile.name,
        profile.course,
        profile.year,
        profile.skills,
        profile.lookingFor,
        profile.interests,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedCommunitySearch);
    });

    return (
      <SimplePage
        setPage={goTo}
        eyebrow="STUDENT COMMUNITY"
        title="Find your people."
        text="Create your student profile and discover people for study groups, projects and hackathons."
        nightMode={nightMode}
        setNightMode={setNightMode}
        geoVerified={geoVerified}
        profile={studentProfile}
        user={user}
        onLogout={handleLogout}
      >
        <section
          className="section dashboard-section"
          style={{
            maxWidth: "1000px",
            margin: "0 auto 32px",
          }}
        >
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              padding: "30px",
              boxShadow: "0 12px 30px rgba(20, 33, 61, 0.06)",
            }}
          >
            <span className="eyebrow">YOUR COMMUNITY PROFILE</span>
            <h2 style={{ marginBottom: "8px" }}>Let people know what you bring.</h2>
            <p style={{ marginBottom: "20px" }}>
              Your name, course and year come from your CampusBuddy profile.
              Add skills and what you are looking for so other students can find you.
            </p>

            <form onSubmit={saveCommunityProfile}>
              <FormLabel text="Skills" />
              <input
                value={communityForm.skills}
                onChange={(event) =>
                  setCommunityForm((previous) => ({
                    ...previous,
                    skills: event.target.value,
                  }))
                }
                placeholder="e.g. React, Python, Figma, AI"
                style={inputStyle}
              />

              <FormLabel text="Looking for" />
              <input
                value={communityForm.lookingFor}
                onChange={(event) =>
                  setCommunityForm((previous) => ({
                    ...previous,
                    lookingFor: event.target.value,
                  }))
                }
                placeholder="e.g. Hackathon teammate / Study partner"
                style={inputStyle}
              />

              <FormLabel text="Interests / subjects" />
              <input
                value={communityForm.interests}
                onChange={(event) =>
                  setCommunityForm((previous) => ({
                    ...previous,
                    interests: event.target.value,
                  }))
                }
                placeholder="e.g. DSA, Web Development, Robotics"
                style={inputStyle}
              />

              <button
                className="primary-button"
                type="submit"
                disabled={communitySaving}
                style={{ marginTop: "20px" }}
              >
                {communitySaving ? "Saving to Firebase..." : "Save Community Profile"}
              </button>
            </form>
          </div>
        </section>

        <section
          className="section dashboard-section"
          style={{
            maxWidth: "1000px",
            margin: "0 auto 36px",
          }}
        >
          <div style={{ marginBottom: "18px" }}>
            <span className="eyebrow">STUDENT DIRECTORY</span>
            <h2 style={{ marginBottom: "6px" }}>People on CampusBuddy</h2>
            <p>Discover students who are open to collaborating.</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: "10px",
              marginBottom: "18px",
            }}
          >
            <input
              value={communitySearch}
              onChange={(event) => setCommunitySearch(event.target.value)}
              placeholder="Search by name, skill, course, interest..."
              style={inputStyle}
            />
            <button
              className="view-all"
              type="button"
              onClick={() => setCommunitySearch("")}
            >
              Clear
            </button>
          </div>

          {communityLoading ? (
            <div className="dashboard-section" style={{ padding: "28px", textAlign: "center" }}>
              Loading community profiles...
            </div>
          ) : communityProfiles.length === 0 ? (
            <div className="dashboard-section" style={{ padding: "28px" }}>
              <strong>No community profiles yet.</strong>
              <p style={{ marginBottom: 0 }}>
                Save your profile above to become the first student in the directory.
              </p>
            </div>
          ) : filteredCommunityProfiles.length === 0 ? (
            <div className="dashboard-section" style={{ padding: "28px" }}>
              <strong>No matching students found.</strong>
              <p style={{ marginBottom: 0 }}>
                Try another name, skill, course or interest.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "18px",
              }}
            >
              {filteredCommunityProfiles.map((profile) => {
                const isCurrentUser = profile.id === currentUserId;
                const skillTags = (profile.skills || "")
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean);

                return (
                  <article
                    key={profile.id}
                    style={{
                      background: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "20px",
                      padding: "22px",
                      boxShadow: "0 10px 24px rgba(20, 33, 61, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                      <div>
                        <strong style={{ fontSize: "20px", color: "#14213d" }}>
                          {profile.name || "Campus student"}
                        </strong>
                        <div style={{ marginTop: "5px", color: "#5d718f" }}>
                          {profile.course || "Student"} • {profile.year || "Year not added"}
                        </div>
                      </div>

                      {isCurrentUser && (
                        <span
                          style={{
                            height: "fit-content",
                            padding: "6px 9px",
                            borderRadius: "999px",
                            background: "#e8f7f1",
                            color: "#147d63",
                            fontSize: "12px",
                            fontWeight: "800",
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </div>

                    {skillTags.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px", marginTop: "16px" }}>
                        {skillTags.map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            style={{
                              padding: "6px 9px",
                              borderRadius: "999px",
                              background: "#eef4ff",
                              color: "#214a87",
                              fontSize: "12px",
                              fontWeight: "700",
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {profile.lookingFor && (
                      <div style={{ marginTop: "16px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "800", letterSpacing: ".08em", color: "#ff654d" }}>
                          LOOKING FOR
                        </div>
                        <p style={{ margin: "5px 0 0" }}>{profile.lookingFor}</p>
                      </div>
                    )}

                    {profile.interests && (
                      <div style={{ marginTop: "12px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "800", letterSpacing: ".08em", color: "#60708a" }}>
                          INTERESTS
                        </div>
                        <p style={{ margin: "5px 0 0" }}>{profile.interests}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="module-grid">
          {communityItems.map((item) => (
            <InfoCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              text={item.text}
              onClick={() => goTo("detail", item)}
            />
          ))}
        </div>
      </SimplePage>
    );
  }

  /*
   * TRANSPORT
   */
  if (page === "transport") {
    return (
      <SimplePage
        setPage={goTo}
        eyebrow="CAMPUS TRANSPORT"
        title="Know before you go."
        text="Check campus routes, timings and estimated arrivals."
        nightMode={nightMode}
        setNightMode={setNightMode}
        geoVerified={geoVerified}
        profile={studentProfile}
        user={user}
        onLogout={handleLogout}
      >
        <div className="mini-space-list">
          {buses.map((bus) => (
            <button
              className="mini-space clickable-card"
              key={bus.id}
              onClick={() => goTo("detail", bus)}
            >
              <div className="mini-space-icon">🚌</div>

              <div>
                <strong>
                  {bus.route} — {bus.destination}
                </strong>

                <p>
                  {bus.time} • Next bus in {bus.eta}
                </p>
              </div>

              <span className="status available">● LIVE</span>
            </button>
          ))}
        </div>
      </SimplePage>
    );
  }

  /*
   * AI
   */
  if (page === "ai") {
    return (
      <div className={nightMode ? "app night-owl campus-3d" : "app campus-3d"}>
        <Navbar setPage={goTo} nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={studentProfile} user={user} onLogout={handleLogout} />

        <main className="ai-page">
          <BackButton setPage={goTo} />

          <div className="ai-header">
            <div className="ai-orb">✨</div>

            <span className="eyebrow">CAMPUS AI</span>

            <h1>Your intelligent campus companion.</h1>

            <p>
              Ask CampusBuddy about spaces, events, food, navigation and
              everyday campus life.
            </p>
          </div>

          <div className="ai-chat">
            <div className="ai-message user-message">
              {aiQuery || "What can CampusBuddy help me with?"}
            </div>

            <div className="ai-message assistant-message">
              <div className="assistant-label">✨ CampusBuddy AI</div>
              <small style={{ display: "block", opacity: 0.6, marginBottom: "10px" }}>
                Grounded campus assistant • heuristic prototype, not a claimed deep-learning model
              </small>

              <h3>{aiIntent.title}</h3>

              <p style={{ lineHeight: 1.7, marginBottom: "18px" }}>
                {aiIntent.message}
              </p>

              {aiIntent.action !== "ai" && (
                <button
                  className="primary-button"
                  style={{ marginBottom: "18px" }}
                  onClick={() => goTo(aiIntent.action)}
                >
                  Open {aiIntent.action === "lostfound"
                    ? "Lost & Found"
                    : aiIntent.action.charAt(0).toUpperCase() +
                      aiIntent.action.slice(1)} →
                </button>
              )}

              <button
                className="recommendation clickable-card"
                onClick={() => goTo("detail", visibleSpaces[0] || spaces[0])}
              >
                <div className="recommendation-icon">📚</div>

                <div>
                  <strong>Central Library</strong>
                  <p>
                    Quiet Zone • 18 seats available • 5 min from Block 34
                  </p>
                </div>

                <span className="status available">● Available</span>
              </button>

              <button
                className="recommendation clickable-card"
                onClick={() => goTo("detail", events[0])}
              >
                <div className="recommendation-icon">🎯</div>

                <div>
                  <strong>AI & Innovation Workshop</strong>
                  <p>12 SEP • 5:00 PM • Block 34</p>
                </div>

                <span className="event-tag">RELEVANT</span>
              </button>

              {(visibleFood[0] || foodPlaces[2]) && (
                <button
                  className="recommendation clickable-card"
                  onClick={() => goTo("detail", visibleFood[0] || foodPlaces[2])}
                >
                  <div className="recommendation-icon">🍔</div>

                  <div>
                    <strong>{(visibleFood[0] || foodPlaces[2]).name}</strong>
                    <p>
                      {(visibleFood[0] || foodPlaces[2]).price} • ⭐ {(visibleFood[0] || foodPlaces[2]).rating} • {(visibleFood[0] || foodPlaces[2]).crowd} crowd
                    </p>
                  </div>

                  <span className="event-tag">FOOD</span>
                </button>
              )}
            </div>
          </div>

          <div className="ai-input-box">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAI();
              }}
              placeholder="Ask CampusBuddy anything..."
            />

            <button onClick={handleAI}>Ask AI →</button>
          </div>
        </main>
      </div>
    );
  }

  /*
   * HOME DASHBOARD
   */
  return (
    <div className={nightMode ? "app night-owl campus-3d" : "app campus-3d"}>
      <Navbar setPage={goTo} nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={studentProfile} user={user} onLogout={handleLogout} />

      <main>
        <div className="campus-3d-orbit campus-3d-orbit-one" />
        <div className="campus-3d-orbit campus-3d-orbit-two" />
        <section className="dashboard-hero">
          <div>
            <span className="welcome">YOUR CAMPUS, SIMPLIFIED</span>

            <h1>
              Good morning,
              <br />
              <span>
                {studentProfile?.role === "admin"
                  ? "Admin 👋"
                  : `${studentProfile?.name || "Student"} 👋`}
              </span>
            </h1>

            <p>
              {studentProfile?.role === "admin"
                ? "Manage campus content, spaces, food and student support from one place."
                : "Everything you need for a better campus day, in one place."}
            </p>
          </div>

          <div className="campus-status">
            <span className="live-dot">● CAMPUS LIVE</span>
            <strong>28°C</strong>
            <span>Phagwara, Punjab</span>
          </div>
        </section>

        <section className="student-profile-strip">
          <div className="profile-avatar-large">
            {(
              studentProfile?.name ||
              user?.email?.split("@")[0] ||
              "S"
            )
              .trim()
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="student-profile-main">
            <span className="eyebrow">YOUR CAMPUSBUDDY PROFILE</span>
            <h2>
              {studentProfile?.name || "Student"}
            </h2>
            <p>
              {studentProfile?.studentId
                ? `Student ID • ${studentProfile.studentId}`
                : user?.email || "Student account"}
              {studentProfile?.course
                ? ` • ${studentProfile.course}`
                : ""}
              {studentProfile?.year
                ? ` • Year ${studentProfile.year}`
                : ""}
            </p>
          </div>

          <div className="student-profile-meta">
            <span className="profile-status-dot">●</span>
            <span>Account active</span>
            <span
              style={{
                padding: "6px 9px",
                borderRadius: "999px",
                background:
                  studentProfile?.role === "admin" ? "#eef4ff" : "#f3f4f6",
                color:
                  studentProfile?.role === "admin" ? "#214a87" : "#52606d",
                fontSize: "11px",
                fontWeight: 900,
                letterSpacing: ".08em",
              }}
            >
              {studentProfile?.role === "admin" ? "ADMIN" : "STUDENT"}
            </span>
            <button
              className="profile-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </section>

        <section className="ai-search-section">
          <div className="ai-search-title">
            <div className="ai-mini-icon">✨</div>

            <div>
              <strong>Ask CampusBuddy AI</strong>
              <span>Your campus assistant</span>
            </div>
          </div>

          <div className="ai-search">
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAI();
              }}
              placeholder="e.g. Find a quiet place near Block 34..."
            />

            <button onClick={handleAI}>Ask AI</button>
          </div>

          <div className="suggestion-row">
            <button
              onClick={() =>
                setAiQuery("Find me a quiet place to study")
              }
            >
              📚 Find a study space
            </button>

            <button
              onClick={() =>
                setAiQuery("What coding events are happening?")
              }
            >
              💻 Find coding events
            </button>

            <button
              onClick={() => setAiQuery("Where can I eat nearby?")}
            >
              🍔 Find food
            </button>
          </div>
        </section>

        <section className="personalized-strip">
          <div>
            <span className="eyebrow">PERSONALIZED FOR YOU</span>
            <h3>{studentProfile?.course ? `${studentProfile.course} • ${studentProfile.year ? `Year ${studentProfile.year}` : "Campus"}` : "Complete your profile for smarter recommendations"}</h3>
            <p>{studentProfile?.interests || studentProfile?.bio || "Add your course, interests and skills so CampusBuddy can tailor spaces, events and community suggestions."}</p>
          </div>
          <button className="secondary-button" onClick={() => goTo("profile")}>{studentProfile?.course ? "Update Profile" : "Complete Profile"} →</button>
        </section>

        {nightMode && (
          <section className="section dashboard-section">
            <div className="notice-banner">
              <div className="notice-icon">🌙</div>
              <div style={{ flex: 1 }}>
                <span className="eyebrow">NIGHT-OWL MODE</span>
                <h3>Built for campus life after 8 PM.</h3>
                <p>
                  Late-night food, study spaces and emergency support are surfaced first.
                </p>
              </div>
            </div>

            <div className="module-grid" style={{ marginTop: "18px" }}>
              {nightModeItems.map((item) => (
                <DashboardModule
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  text={item.text}
                  onClick={() => {
                    if (item.title === "Late Study") goTo("spaces");
                    else if (item.title === "Late-Night Food") goTo("food");
                    else goTo("help");
                  }}
                />
              ))}
            </div>
          </section>
        )}

        <section className="section dashboard-section">
          <div className="section-heading-row">
            <div>
              <span className="eyebrow">CAMPUS SERVICES</span>
              <h2>Everything you need</h2>
            </div>
          </div>

          <div className="module-grid">
            <DashboardModule
              icon="🗺️"
              title="Campus Map"
              text="Find classrooms, labs, hostels, parking and more."
              onClick={() => goTo("spaces")}
              featured
            />

            <DashboardModule
              icon="📅"
              title="Campus Events"
              text="Discover workshops, hackathons, sports and clubs."
              onClick={() => goTo("events")}
            />

            <DashboardModule
              icon="🍔"
              title="Food & Canteens"
              text="Menus, prices, ratings and crowd levels."
              onClick={() => goTo("food")}
            />

            <DashboardModule
              icon="🎓"
              title="Academic Hub"
              text="Timetable, exams, assignments and attendance."
              onClick={() => goTo("academic")}
            />

            <DashboardModule
              icon="📢"
              title="Campus Notices"
              text="Stay updated with important university announcements."
              onClick={() => goTo("notices")}
            />

            <DashboardModule
              icon="🆘"
              title="Campus Help"
              text="Report maintenance issues and find emergency help."
              onClick={() => goTo("help")}
            />

            <DashboardModule
              icon="🤝"
              title="Student Community"
              text="Find study partners and project teammates."
              onClick={() => goTo("community")}
            />

            <DashboardModule
              icon="🚌"
              title="Campus Transport"
              text="Bus routes, timings and estimated arrivals."
              onClick={() => goTo("transport")}
            />

            <DashboardModule
              icon="🔎"
              title="Lost & Found"
              text="Report lost items and help return things to their owners."
              onClick={() => goTo("lostfound")}
            />

            <DashboardModule
              icon="🔔"
              title="Notifications"
              text="See campus notices, event updates and support activity."
              onClick={() => goTo("notifications")}
            />

            <DashboardModule
              icon="👤"
              title="My Profile"
              text="Update your course, year, department and preferences."
              onClick={() => goTo("profile")}
            />
          </div>
        </section>

        <section className="section dashboard-section">
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "20px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <span className="eyebrow">PROOF OF PRESENCE</span>
            <h3 style={{ marginBottom: "6px" }}>Verify you're actually on campus</h3>
            <p style={{ marginTop: 0, opacity: 0.7 }}>
              A geofence can make campus check-ins harder to fake. Location stays in the browser for this prototype.
            </p>
            <button
              className="primary-button"
              onClick={verifyCampusPresence}
              disabled={geoChecking}
            >
              {geoChecking
                ? "Checking location..."
                : geoVerified
                ? "✓ Campus Verified"
                : "Verify Campus Presence"}
            </button>
            {geoVerified && (
              <span style={{ marginLeft: "12px", fontWeight: 700 }}>
                🛡️ Verified Campus Check-in
              </span>
            )}
          </div>

          <div className="dashboard-two-column">
            <div>
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">RIGHT NOW</span>
                  <h2>Available spaces</h2>
                </div>

                <button
                  className="view-all"
                  onClick={() => goTo("spaces")}
                >
                  View all →
                </button>
              </div>

              <div className="mini-space-list">
                {visibleSpaces.slice(0, 3).map((space) => (
                  <button
                    className="mini-space clickable-card"
                    key={space.id}
                    onClick={() => {
                      setSelectedSpace(space);
                      goTo("spaces");
                    }}
                  >
                    <div className="mini-space-icon">📚</div>

                    <div>
                      <strong>{space.name}</strong>
                      <p>
                        {space.location} • {space.available} seats
                      </p>
                    </div>

                    <span
                      className={
                        "status " + space.status.toLowerCase()
                      }
                    >
                      ● {space.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">DON'T MISS OUT</span>
                  <h2>Upcoming events</h2>
                </div>

                <button
                  className="view-all"
                  onClick={() => goTo("events")}
                >
                  All events →
                </button>
              </div>

              <div className="mini-event-list">
                {visibleEvents.slice(0, 2).map((event) => (
                  <button
                    className="mini-event clickable-card"
                    key={event.id}
                    onClick={() => goTo("detail", event)}
                  >
                    <div className="event-date">
                      <strong>{event.date}</strong>
                      <span>{event.month}</span>
                    </div>

                    <div>
                      <span className="event-tag">{event.category}</span>

                      <h3>{event.title}</h3>

                      <p>
                        📍 {event.location} • {event.time}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="notice-banner">
            <div className="notice-icon">📢</div>

            <div>
              <span className="eyebrow">CAMPUS NOTICE</span>

              <h3>Important academic updates</h3>

              <p>
                Check the latest examination schedule and academic
                announcements.
              </p>
            </div>

            <button onClick={() => goTo("notices")}>
              View notices →
            </button>
          </div>
        </section>
      </main>

      <footer>
        <div className="logo">
          <span className="logo-icon">C</span>
          <span>CampusBuddy</span>
        </div>

        <div>
          <p>Making campus life easier, one fix at a time.</p>
          <small style={{ opacity: 0.65 }}>
            Personal campus platform • Firebase-powered
          </small>
        </div>
      </footer>
    </div>
  );
}

/*
 * REUSABLE DETAIL VIEW
 */
function DetailView({
  detail,
  setPage,
  getDirections,
  registeredEvents,
  registerEvent,
}) {
  const isEvent = Boolean(detail.category && detail.title);
  const isSpace = Boolean(detail.name && detail.capacity);
  const isFood = Boolean(detail.cuisine);
  const isBus = Boolean(detail.route);
  const isReport = Boolean(detail.item && detail.type);

  const isGeneric = !isEvent && !isSpace && !isFood && !isBus && !isReport;

  const heading =
    detail.title ||
    detail.name ||
    detail.item ||
    (detail.route
      ? `${detail.route} — ${detail.destination}`
      : "CampusBuddy Details");

  const icon =
    detail.icon ||
    (isEvent
      ? "📅"
      : isSpace
      ? "📍"
      : isFood
      ? "🍔"
      : isBus
      ? "🚌"
      : isReport
      ? "🔎"
      : "✨");

  return (
    <section
      className="section dashboard-section"
      style={{ maxWidth: "850px", margin: "0 auto" }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "24px",
          padding: "32px",
        }}
      >
        <div style={{ fontSize: "48px", marginBottom: "15px" }}>
          {icon}
        </div>

        <span className="eyebrow">
          {detail.category || detail.type || "CAMPUSFIX"}
        </span>

        <h1>{heading}</h1>

        <p style={{ fontSize: "17px", lineHeight: 1.7 }}>
          {detail.detail || detail.description || detail.text}
        </p>

        {isEvent && (
          <>
            <div className="detail-row">
              <span>When</span>
              <strong>
                {detail.date} {detail.month} • {detail.time}
              </strong>
            </div>

            <div className="detail-row">
              <span>Location</span>
              <strong>{detail.location}</strong>
            </div>
          </>
        )}

        {isSpace && (
          <>
            <div className="detail-row">
              <span>Location</span>
              <strong>{detail.location}</strong>
            </div>

            <div className="detail-row">
              <span>Available seats</span>
              <strong>
                {detail.available} / {detail.capacity}
              </strong>
            </div>

            <div className="detail-row">
              <span>Environment</span>
              <strong>{detail.environment}</strong>
            </div>
          </>
        )}

        {isFood && (
          <>
            <div className="detail-row">
              <span>Cuisine</span>
              <strong>{detail.cuisine}</strong>
            </div>

            <div className="detail-row">
              <span>Price</span>
              <strong>{detail.price}</strong>
            </div>

            <div className="detail-row">
              <span>Rating</span>
              <strong>⭐ {detail.rating}</strong>
            </div>

            <div className="detail-row">
              <span>Crowd</span>
              <strong>{detail.crowd}</strong>
            </div>
          </>
        )}

        {isBus && (
          <>
            <div className="detail-row">
              <span>Destination</span>
              <strong>{detail.destination}</strong>
            </div>

            <div className="detail-row">
              <span>Frequency</span>
              <strong>{detail.time}</strong>
            </div>

            <div className="detail-row">
              <span>Next bus</span>
              <strong>{detail.eta}</strong>
            </div>
          </>
        )}

        {isReport && (
          <>
            <div className="detail-row">
              <span>Status</span>
              <strong>{detail.type}</strong>
            </div>

            <div className="detail-row">
              <span>Location</span>
              <strong>{detail.location}</strong>
            </div>

            <div className="detail-row">
              <span>Date</span>
              <strong>{detail.date}</strong>
            </div>
          </>
        )}

        {isGeneric && detail.text && (
          <div className="detail-row">
            <span>Information</span>
            <strong>{detail.text}</strong>
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "25px",
          }}
        >
          {isEvent && (
            <button
              className="primary-button"
              onClick={() => registerEvent(detail.id)}
            >
              {registeredEvents.includes(detail.id)
                ? "✓ Interested"
                : "Register / Interested"}
            </button>
          )}

          {(isEvent || isSpace || isFood) && (
            <button
              className="view-all"
              onClick={() => getDirections(detail)}
            >
              📍 {isFood ? "Find on Map" : "Get Directions"}
            </button>
          )}

          {isBus && (
            <button
              className="view-all"
              onClick={() => getDirections(detail)}
            >
              🚌 Open Route
            </button>
          )}

          <button
            className="view-all"
            onClick={() => setPage("home")}
          >
            ← Dashboard
          </button>
        </div>
      </div>
    </section>
  );
}

/*
 * NAVBAR
 */
function Navbar({
  setPage,
  nightMode,
  setNightMode,
  geoVerified,
  profile,
  user,
  onLogout,
}) {
  const displayName =
    profile?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Student";

  const isAdmin = profile?.role === "admin";
  const roleLabel = isAdmin ? "ADMIN" : "STUDENT";

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <nav className="navbar">
      <button
        className="logo"
        onClick={() => setPage("home")}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <span className="logo-icon">C</span>
        <span>CampusBuddy</span>
      </button>

      <div className="nav-links">
        <button onClick={() => setPage("home")}>Home</button>
        <button onClick={() => setPage("spaces")}>Spaces</button>
        <button onClick={() => setPage("events")}>Events</button>
        <button onClick={() => setPage("notifications")}>🔔</button>
        <button onClick={() => setPage("profile")}>Profile</button>
        {isAdmin && (
          <button
            className="admin-nav-link"
            onClick={() => setPage("admin")}
          >
            Admin
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {geoVerified && (
          <span
            title="Campus location verified"
            style={{
              padding: "8px 10px",
              borderRadius: "999px",
              background: "#ecfdf5",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            🛡️ Verified
          </span>
        )}

        <button
          onClick={() => setNightMode(!nightMode)}
          style={{
            border: "1px solid #dbe2ea",
            borderRadius: "999px",
            padding: "9px 13px",
            background: "white",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          {nightMode ? "🌙 Night-Owl" : "☀️ Day Mode"}
        </button>

        <button
          className="profile-button profile-button-rich"
          onClick={() => setPage("home")}
          title={`${roleLabel} account: ${displayName}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "9px",
          }}
        >
          <span className="profile-mini-avatar">{initials || "S"}</span>

          <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
            <span>{displayName}</span>
            <span
              style={{
                marginTop: "4px",
                fontSize: "10px",
                fontWeight: 900,
                letterSpacing: ".09em",
                opacity: 0.7,
              }}
            >
              {roleLabel}
            </span>
          </span>
        </button>

        {onLogout && (
          <button
            className="logout-icon-button"
            onClick={onLogout}
            title={`Log out ${roleLabel} account`}
            aria-label={`Log out ${roleLabel} account`}
          >
            ↪
          </button>
        )}
      </div>
    </nav>
  );
}

/*
 * DASHBOARD MODULE
 */
function DashboardModule({
  icon,
  title,
  text,
  onClick,
  featured = false,
}) {
  return (
    <button
      className={
        featured
          ? "dashboard-module featured depth-card"
          : "dashboard-module depth-card"
      }
      onClick={onClick}
    >
      <div className="module-icon">{icon}</div>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <span className="module-arrow">→</span>
    </button>
  );
}

/*
 * BACK BUTTON
 */
function BackButton({ setPage }) {
  return (
    <button
      className="back-button"
      onClick={() => setPage("home")}
    >
      ← Back to dashboard
    </button>
  );
}

/*
 * PAGE HEADER
 */
function PageHeader({
  eyebrow,
  title,
  text,
  count,
  countText,
}) {
  return (
    <div className="finder-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>

        <h1>{title}</h1>

        <p>{text}</p>
      </div>

      {count !== undefined && (
        <div className="space-count">
          <strong>{count}</strong>
          <span>{countText}</span>
        </div>
      )}
    </div>
  );
}

/*
 * SIMPLE PAGE
 */
function SimplePage({
  setPage,
  eyebrow,
  title,
  text,
  children,
  nightMode = false,
  setNightMode,
  geoVerified = false,
  profile,
  user,
  onLogout,
}) {
  return (
    <div className="app campus-3d">
      <Navbar setPage={setPage} nightMode={nightMode} setNightMode={setNightMode} geoVerified={geoVerified} profile={profile} user={user} onLogout={onLogout} />

      <main className="space-finder">
        <BackButton setPage={setPage} />

        <PageHeader
          eyebrow={eyebrow}
          title={title}
          text={text}
        />

        {children}
      </main>
    </div>
  );
}

/*
 * INFO CARD
 */
function InfoCard({
  icon,
  title,
  text,
  onClick,
}) {
  return (
    <button
      className="dashboard-module clickable-card depth-card"
      onClick={onClick}
    >
      <div className="module-icon">{icon}</div>

      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>

      <span className="module-arrow">→</span>
    </button>
  );
}

/*
 * FORM LABEL
 */
function FormLabel({ text }) {
  return (
    <label
      style={{
        display: "block",
        fontWeight: "700",
        marginTop: "16px",
        marginBottom: "8px",
      }}
    >
      {text}
    </label>
  );
}

/*
 * LOST & FOUND FORM
 */
function ReportForm({
  mode,
  form,
  onChange,
  onSubmit,
  onBack,
  submitting = false,
}) {
  return (
    <section
      className="section dashboard-section"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "24px",
          padding: "32px",
        }}
      >
        <button
          className="back-button"
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <span className="eyebrow">
          {mode === "Lost"
            ? "REPORT LOST ITEM"
            : "REPORT FOUND ITEM"}
        </span>

        <h2>
          {mode === "Lost"
            ? "Tell us what you lost"
            : "Tell us what you found"}
        </h2>

        <p>
          Add a few details so the campus community can identify the item.
        </p>

        <form onSubmit={onSubmit}>
          <FormLabel text="Item name" />

          <input
            name="item"
            value={form.item}
            onChange={onChange}
            placeholder="e.g. Black AirPods"
            required
            style={inputStyle}
          />

          <FormLabel
            text={
              mode === "Lost"
                ? "Where did you lose it?"
                : "Where did you find it?"
            }
          />

          <input
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="e.g. Block 34, Library"
            required
            style={inputStyle}
          />

          <FormLabel text="Date" />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={onChange}
            required
            style={inputStyle}
          />

          <FormLabel text="Description" />

          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Add colour, brand or identifying details..."
            rows="5"
            required
            style={inputStyle}
          />

          <button
            type="submit"
            className="primary-button full-button"
            style={{ marginTop: "20px" }}
            disabled={submitting}
          >
            {submitting ? "Saving to Firebase..." : "Submit Report →"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default App;
