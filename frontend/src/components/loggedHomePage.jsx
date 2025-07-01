import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "../css/loggedHomePage.css";

const LoggedHomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [hobbys, setHobbys] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [cardImageFile, setCardImageFile] = useState(null);
  const [profile, setProfile] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [swipePhotos, setSwipePhotos] = useState([]);
  const [currentSwipeIndex, setCurrentSwipeIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [matches, setMatches] = useState([]);
  const [hasNewMatch, setHasNewMatch] = useState(false);

  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const savedIndex = parseInt(localStorage.getItem("swipeIndex"), 10);
    if (!isNaN(savedIndex)) {
      setCurrentSwipeIndex(savedIndex);
    }
  }, []);

  useEffect(() => {
    fetchProfileData();
    fetchSwipePhotos();
  }, [username]);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      socketRef.current.emit("register", { username });
    });

    socketRef.current.on("match-found", (data) => {
      setChatVisible(true);
      setChatMessages((prev) => [...prev, data.message]);
      setMatches((prev) => [...new Set([...prev, data.with])]);
      setHasNewMatch(true);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [username]);

  const fetchProfileData = async () => {
    try {
      const res = await fetch(`http://localhost:5000/homepage/${username}`, {
        headers: { username },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch {}
  };

  const fetchSwipePhotos = async () => {
    try {
      const res = await fetch("http://localhost:5000/all_card_images", {
        headers: { username },
      });
      if (res.ok) {
        const data = await res.json();
        setSwipePhotos(data.photos);
      }
    } catch {}
  };

  const handleSwipe = (direction) => {
    if (swiping || currentSwipeIndex >= swipePhotos.length) return;
    const target = swipePhotos[currentSwipeIndex]?.split(".")[0];

    if (direction === "right") {
      fetch("http://localhost:5000/swipe_right", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: username, to: target }),
      });
    }

    setSwipeDirection(direction);
    setSwiping(true);
    setTimeout(() => {
      setSwiping(false);
      setSwipeDirection("");
      setCurrentSwipeIndex((prev) => {
        const next = prev + 1;
        localStorage.setItem("swipeIndex", next);
        return next;
      });
    }, 300);
  };

  const handleProfilePicChange = (e) => setProfilePic(e.target.files[0]);

  const HandleSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploadedProfilePic = profile.profile_pic;
      if (profilePic) {
        const fd = new FormData();
        fd.append("file", profilePic);
        const up = await fetch(`http://localhost:5000/upload/${username}`, {
          method: "POST",
          body: fd,
        });
        if (up.ok) uploadedProfilePic = (await up.json()).profile_pic;
      }

      let uploadedCardImage = profile.card_image;
      if (cardImageFile) {
        const fd = new FormData();
        fd.append("file", cardImageFile);
        const up = await fetch(`http://localhost:5000/upload_card_image/${username}`, {
          method: "POST",
          body: fd,
        });
        if (up.ok) uploadedCardImage = (await up.json()).card_image;
      }

      const res = await fetch(`http://localhost:5000/profile/${username}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          location,
          hobby: hobbys,
          profile_pic: uploadedProfilePic,
          card_image: uploadedCardImage,
        }),
      });

      if (res.ok) {
        fetchProfileData();
        setShowModal(false);
        setProfilePic(null);
        setCardImageFile(null);
      }
    } catch {}
  };

  const openModal = () => {
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setLocation(profile.location || "");
    setHobbys(profile.hobby || "");
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);
  const toggleChat = () => setChatVisible((v) => !v);
  const handleSearch = () =>
    searchQuery.trim() && navigate(`/search_profiles?q=${searchQuery}`);
  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages((prev) => [...prev, `${username}: ${newMessage}`]);
      setNewMessage("");
    }
  };

  const currentSwipePhoto = swipePhotos[currentSwipeIndex];

  return (
    <div className="logged-homepage">
      <nav className="navbar">
        <div className="navbar-left">
          <h2 className="navbar-brand">
            <img src="/assets/Nowy projekt.svg" alt="logo" height={30} />
            OIO
          </h2>
        </div>
        <div className="navbar-center">
          <input
            type="text"
            placeholder="Search..."
            className="navbar-search"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            Search
          </button>
        </div>
        <div className="navbar-right">
          <button onClick={openModal}>Edit Profile</button>
          <button className="messages-button" onClick={toggleChat}>
            Messages {hasNewMatch && <span className="notif-dot">●</span>}
          </button>
          {profile.profile_pic && (
            <img
              src={`http://localhost:5000/uploads/${profile.profile_pic}`}
              alt="Profile"
              className="navbar-profile-pic"
            />
          )}
        </div>
      </nav>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "50px" }}>
        {currentSwipePhoto ? (
          <div
            key={currentSwipeIndex}
            className={`swipe-card ${swiping ? `swipe-${swipeDirection}` : ""}`}
          >
            <img
              src={`http://localhost:5000/swipe_uploads/${currentSwipePhoto}?t=${Date.now()}`}
              alt="Swipe"
              style={{ width: "600px", height: "800px", objectFit: "cover", borderRadius: "8px", border: "2px solid #ccc" }}
            />
          </div>
        ) : (
          <p style={{ color: "gray", fontSize: "18px" }}>
            TO NARAZIE WSZYSTKO, WROC ZA JAKIS CZAS
          </p>
        )}

        {currentSwipePhoto && (
          <div className="swipe-buttons">
            <button onClick={() => handleSwipe("left")} className="swipe-left-btn">
              Swipe Left
            </button>
            <button onClick={() => handleSwipe("right")} className="swipe-right-btn">
              Swipe Right
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>×</span>
            <h2>Edit Profile</h2>
            <form onSubmit={HandleSubmit}>
              <label className="label">First Name</label>
              <input className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <label className="label">Last Name</label>
              <input className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <label className="label">Location</label>
              <input className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} />
              <label className="label">Hobbies</label>
              <input className="input-field" value={hobbys} onChange={(e) => setHobbys(e.target.value)} />
              <label className="label">Profile Picture</label>
              <input type="file" onChange={handleProfilePicChange} />
              <label className="label">Swipe Photo</label>
              <input type="file" onChange={(e) => setCardImageFile(e.target.files[0])} />
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="submit" className="submit-button">Save</button>
                <button type="button" className="cancel-button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {chatVisible && (
        <div className="chat-panel visible">
          <div className="chat-header">
            Chat
            <span onClick={toggleChat} style={{ cursor: "pointer" }}>×</span>
          </div>
          <div className="chat-content">
            {chatMessages.length > 0 ? (
              chatMessages.map((msg, i) => <p key={i}>{msg}</p>)
            ) : (
              <p>Brak wiadomości</p>
            )}
          </div>
          <div style={{ display: "flex", padding: "10px" }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Napisz coś..."
              style={{ flex: 1, marginRight: "10px" }}
            />
            <button onClick={sendMessage}>Wyślij</button>
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="match-list">
          <h3>Twoje matche:</h3>
          <ul>
            {matches.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LoggedHomePage;