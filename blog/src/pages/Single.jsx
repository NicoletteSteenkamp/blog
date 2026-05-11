import { useEffect, useState, useContext } from "react";
import Edit from "../assets/edit.png";
import Delete from "../assets/delete.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import DOMPurify from "dompurify";

const API = import.meta.env.VITE_API_URL;

const Single = () => {
  const [post, setPost] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  const postId = location.pathname.split("/")[2];
  const { currentUser } = useContext(AuthContext);

  // Fetch post
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API}/posts/${postId}`);
        setPost(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [postId]);

  // Delete post
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/posts/${postId}`);
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  // Simple "time ago" helper (replaces moment.js)
  const timeAgo = (date) => {
    if (!date) return "";

    const diff = Date.now() - new Date(date).getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="single">
      <div className="content">

        {/* Post image */}
        {post.img && (
          <img
            src={`${API}/upload/${post.img}`}
            alt=""
          />
        )}

        <div className="user">

          {/* user image */}
          {post.userImg && <img src={post.userImg} alt="" />}

          <div className="info">
            <span>{post.username}</span>
            <p>Posted {timeAgo(post.date)}</p>
          </div>

          {/* safe optional chaining */}
          {currentUser?.username === post.username && (
            <div className="edit">
              <Link to={`/write?edit=2`} state={post}>
                <img src={Edit} alt="edit" />
              </Link>
              <img onClick={handleDelete} src={Delete} alt="delete" />
            </div>
          )}
        </div>

        <h1>{post.title}</h1>

        <p
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(post.desc || ""),
          }}
        />

      </div>

      <Menu cat={post.cat} />
    </div>
  );
};

export default Single;