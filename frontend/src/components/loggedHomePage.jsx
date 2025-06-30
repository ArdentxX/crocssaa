import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/loggedHomePage.css";

const LoggedHomePage = () => {
  const [showModal, setShowModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [hobbys, setHobbys] = useState("");
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [cardImageFile, setCardImageFile] = useState(null);

  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/homepage/${username}`, {
        headers: {
          username,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setMessage(data.message);
      } else {
        setMessage("Unauthorized");
      }
    } catch (error) {
      setMessage("Error fetching profile data");
    }
  };

  const handleProfilePicChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  const handleCardImageChange = (e) => {
    setCardImageFile(e.target.files[0]); // pojedynczy plik do swipe
  };

  const HandleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload profile pic if changed
      let uploadedProfilePic = profile.profile_pic;
      if (profilePic) {
        const formData = new FormData();
        formData.append("file", profilePic);

        const uploadResponse = await fetch(`http://localhost:5000/upload/${username}`, {
          method: "POST",
          body: formData,
        });

        if (uploadResponse.ok) {
          const data = await uploadResponse.json();
          uploadedProfilePic = data.profile_pic;
        } else {
          setMessage("Failed to upload profile photo");
          return;
        }
      }

      // Upload card image (swipe photo) if selected
      let uploadedCardImage = profile.card_image;
      if (cardImageFile) {
        const formData = new FormData();
        formData.append("file", cardImageFile);

        const uploadCardResponse = await fetch(`http://localhost:5000/upload_card_image/${username}`, {
          method: "POST",
          body: formData,
        });

        if (uploadCardResponse.ok) {
          const data = await uploadCardResponse.json();
          uploadedCardImage = data.card_image;
        } else {
          setMessage("Failed to upload swipe photo");
          return;
        }
      }

      // Update profile data
      const response = await fetch(`http://localhost:5000/profile/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          location: location,
          hobby: hobbys,
          profile_pic: uploadedProfilePic,
          card_image: uploadedCardImage, // jeśli chcesz, możesz aktualizować od razu
        }),
      });

      if (response.ok) {
        setMessage("Profile updated successfully");
        fetchProfileData();
        setShowModal(false);
        setProfilePic(null);
        setCardImageFile(null);
      } else {
        setMessage("Failed to update profile");
      }
    } catch (error) {
      setMessage("Error updating profile");
    }
  };

  const HandleOpenModal = () => {
    setFirstName(profile.first_name || "");
    setLastName(profile.last_name || "");
    setLocation(profile.location || "");
    setHobbys(profile.hobby || "");
    setProfilePic(null);
    setCardImageFile(null);
    setShowModal(true);
  };

  const HandleCloseModal = () => {
    setShowModal(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      navigate(`/search_profiles?q=${searchQuery}`);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleChat = () => setChatVisible((prev) => !prev);

  const [searchQuery, setSearchQuery] = useState("");

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
          <button onClick={HandleOpenModal}>Edit Profile</button>
          <button className="messages-button" onClick={toggleChat}>
            Messages
          </button>
          {profile.profile_pic && (
            <img
              src={`http://localhost:5000/uploads/${profile.profile_pic}`}
              alt="Profile"
              className="navbar-profile-pic"
              onClick={toggleSidebar}
            />
          )}
        </div>
      </nav>

      {/* Chat panel */}
      <div className={`chat-panel ${chatVisible ? "visible" : ""}`}>
        <div className="chat-header">
          Czaty
          <button onClick={toggleChat} style={{ cursor: "pointer" }}>
            X
          </button>
        </div>
        <div className="chat-content">
          {/* Tutaj zawartość czatu */}
          <p>Tu będzie czat...</p>
        </div>
      </div>

      {sidebarOpen && <div className="backdrop active" onClick={toggleSidebar}></div>}

      <div className={`main-content ${sidebarOpen ? "active" : ""}`}>
        <h1 className="main-name">Profile</h1>
        <div className="profile-info">
          <h3 className="profile-header">Profile Information</h3>
          <div className="profile-details">
            <p>First Name: {profile.first_name || "Not provided"}</p>
            <p>Last Name: {profile.last_name || "Not provided"}</p>
            <p>Location: {profile.location || "Not provided"}</p>
            <p>Hobbys: {profile.hobby || "Not provided"}</p>
          </div>



          {/* Wyświetl swipe photo (card_image) na środku w 300x400 */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
            {profile.card_image ? (
              <img
                src={`http://localhost:5000/uploads/${profile.card_image}`}
                alt="Swipe card"
                style={{ width: 300, height: 400, objectFit: "cover" }}
              />
            ) : (
              <p>No swipe photo uploaded</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={HandleCloseModal}>
              &times;
            </span>
            <h2>Edit Profile</h2>
            <form onSubmit={HandleSubmit}>
              {/* Profilowe zdjęcie */}
              <div className="image-upload">
                <input
                  type="file"
                  accept="image/*"
                  id="profile-pic-input"
                  style={{ display: "none" }}
                  onChange={handleProfilePicChange}
                />
                {profilePic ? (
                  <img
                    src={URL.createObjectURL(profilePic)}
                    alt="Profile Preview"
                    className="profile-preview"
                    onClick={() => document.getElementById("profile-pic-input").click()}
                  />
                ) : (
                  <img
                    src={
                      profile.profile_pic
                        ? `http://localhost:5000/uploads/${profile.profile_pic}`
                        : "/assets/default-profile.png"
                    }
                    alt="Profile"
                    className="profile-preview"
                    onClick={() => document.getElementById("profile-pic-input").click()}
                  />
                )}
                <p className="click-to-change">Click to change photo</p>
              </div>

              {/* Dodawanie jednego zdjęcia do swipowania */}
              <div className="card-image-upload" style={{ marginTop: 20 }}>
                <label htmlFor="card-image-input" className="label">
                  Add Swipe Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="card-image-input"
                  onChange={handleCardImageChange}
                />
              </div>

              {/* Pozostałe pola */}
              <div>
                <label className="label">First name</label>
                <input
                  className="input-field"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Last name</label>
                <input
                  className="input-field"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  className="input-field"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Hobbys</label>
                <input
                  className="input-field"
                  type="text"
                  value={hobbys}
                  onChange={(e) => setHobbys(e.target.value)}
                />
              </div>

              <button type="submit" className="submit-button">
                Save Profile
              </button>
            </form>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggedHomePage;
