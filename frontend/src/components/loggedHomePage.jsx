import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import "../css/loggedHomePage.css";
import "react-easy-crop/react-easy-crop.css";

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

  // Crop states
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fileInputRef = useRef();
  const username = localStorage.getItem("username");
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/homepage/${username}`, {
        headers: { username },
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

  const handleProfilePicChange = (e) => setProfilePic(e.target.files[0]);

  const openCropModal = () => {
    fileInputRef.current.click();
  };

  const handleFileSelectForCrop = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setShowCropModal(true);
    }
  };

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const saveCroppedImage = async () => {
    const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
    const croppedFile = new File([croppedBlob], "cropped.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", croppedFile);

    try {
      const uploadCardResponse = await fetch(`http://localhost:5000/upload_card_image/${username}`, {
        method: "POST",
        body: formData,
      });

      if (uploadCardResponse.ok) {
        const data = await uploadCardResponse.json();
        setMessage("Swipe photo uploaded successfully");

        // ✅ odśwież dane profilu po przesłaniu zdjęcia
        fetchProfileData();
      } else {
        setMessage("Failed to upload swipe photo");
      }
    } catch (error) {
      setMessage("Error uploading swipe photo");
    }

    setShowCropModal(false);
  };

  const HandleSubmit = async (e) => {
    e.preventDefault();

    try {
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

      const response = await fetch(`http://localhost:5000/profile/${username}`, {
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

  const HandleCloseModal = () => setShowModal(false);
  const handleSearch = () => searchQuery.trim() !== "" && navigate(`/search_profiles?q=${searchQuery}`);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleChat = () => setChatVisible((prev) => !prev);

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
        </div>
      </div>

      {/* ✅ NEW swipe photo container outside profile-info */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        marginTop: "50px"
      }}>
        {profile.card_image ? (
          <img
            src={`http://localhost:5000/swipe_uploads/${profile.card_image}`}
            alt="Swipe"
            style={{
              width: "600px",
              height: "800px",
              objectFit: "cover",
              borderRadius: "8px",
              border: "2px solid #ccc"
            }}
          />
        ) : (
          <p style={{ color: "gray", fontSize: "18px" }}>No swipe photo uploaded</p>
        )}
      </div>

      {/* Crop modal overlay */}
      {showCropModal && selectedImage && (
        <div className="crop-modal">
          <div className="crop-container">
            <Cropper
              image={selectedImage}
              crop={crop}
              zoom={zoom}
              aspect={3 / 4}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="crop-buttons">
            <button onClick={saveCroppedImage}>OK</button>
            <button onClick={() => setShowCropModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={HandleCloseModal}>&times;</span>
            <h2>Edit Profile</h2>
            <form onSubmit={HandleSubmit}>
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

              <div className="card-image-upload" style={{ marginTop: 20 }}>
                <button type="button" onClick={openCropModal}>
                  Add Swipe Photo
                </button>
              </div>

              <div>
                <label className="label">First name</label>
                <input className="input-field" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input-field" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input-field" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div>
                <label className="label">Hobbys</label>
                <input className="input-field" type="text" value={hobbys} onChange={(e) => setHobbys(e.target.value)} />
              </div>

              <button type="submit" className="submit-button">Save Profile</button>
            </form>
            {message && <p className="message">{message}</p>}
          </div>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelectForCrop}
      />
    </div>
  );
};

export default LoggedHomePage;
