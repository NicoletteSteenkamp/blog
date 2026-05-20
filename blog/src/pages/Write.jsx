import { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

// IMPORTANT for cookie-based auth
axios.defaults.withCredentials = true;

const Write = () => {
  const state = useLocation().state;

  const [title, setTitle] = useState(state?.title || "");
  const [value, setValue] = useState(state?.desc || "");
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState(state?.cat || "");

  const navigate = useNavigate();

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(`${API}/upload`, formData, {
        withCredentials: true,
      });

      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();

    const imgUrl = await upload();

    try {
      if (state) {
        await axios.put(
          `${API}/posts/${state.id}`,
          {
            title,
            desc: value,
            cat,
            img: file ? imgUrl : "",
          },
          { withCredentials: true }
        );
      } else {
        await axios.post(
          `${API}/posts`,
          {
            title,
            desc: value,
            cat,
            img: file ? imgUrl : "",
          },
          { withCredentials: true }
        );
      }

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="add">
      <div className="content">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="editorContainer">
          <ReactQuill
            className="editor"
            theme="snow"
            value={value}
            onChange={setValue}
          />
        </div>
      </div>

      <div className="menu">
        <div className="item">
          <h1>Publish</h1>

          <input
            style={{ display: "none" }}
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
          />

          <label className="file" htmlFor="file">
            Upload Image
          </label>

          <div className="buttons">
            <button onClick={handleClick}>Publish</button>
          </div>
        </div>

        <div className="item">
          <h1>Category</h1>

          {["art", "science", "technology", "cinema", "design", "food"].map(
            (c) => (
              <div className="cat" key={c}>
                <input
                  type="radio"
                  name="cat"
                  value={c}
                  checked={cat === c}
                  onChange={(e) => setCat(e.target.value)}
                />
                <label>{c}</label>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Write;