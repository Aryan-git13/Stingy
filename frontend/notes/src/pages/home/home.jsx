import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/Cards/NoteCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import EmptyCard from "../../components/EmptyCard/EmptyCard";
import AddEditNotes from "./AddEditNotes";

import axiosInstance from "../../utils/axiosinstance";

const Home = () => {

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [allNotes, setAllNotes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();


  // ---------------- GET NOTES ----------------
  const getNotes = useCallback(async () => {

    setIsLoading(true);

    try {

      const token = localStorage.getItem("token");

      // If user not logged in → go to login page
      if (!token) {
        navigate("/login");
        return;
      }

      // Choose endpoint depending on search query
      const endpoint = searchQuery.trim()
        ? `/search-notes?query=${encodeURIComponent(searchQuery)}`
        : "/get-all-notes";

      const response = await axiosInstance.get(endpoint);

      // If notes exist in response → store them
      if (response.data?.notes) {
        setAllNotes(response.data.notes);
      }

    } catch (error) {

      // If token expired → logout
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setAllNotes([]);
      }

    } finally {
      setIsLoading(false);
    }

  }, [searchQuery, navigate]);



  // ---------------- GET USER INFO ----------------
  const getUser = async () => {
    try {

      const response = await axiosInstance.get("/get-user");

      if (response.data?.user) {
        setUserInfo(response.data.user);
      }

    } catch {
      setUserInfo(null);
    }
  };



  // ---------------- CHECK LOGIN ----------------
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    getUser();

  }, [navigate]);



  // ---------------- LOAD NOTES ----------------
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) return;

    getNotes();

  }, [getNotes]);



  // ---------------- OPEN ADD NOTE MODAL ----------------
  const handleAddNote = () => {
    setOpenAddEditModal({
      isShown: true,
      type: "add",
      data: null,
    });
  };



  // ---------------- SAVE NOTE ----------------
  const handleSaveNote = async (noteData) => {

    try {

      await axiosInstance.post("/add-note", noteData);

      // reload notes after saving
      await getNotes();

    } catch (error) {
      console.error(error);
    }

  };



  // ---------------- CLOSE MODAL ----------------
  const handleCloseModal = () => {
    setOpenAddEditModal({
      isShown: false,
      type: "add",
      data: null,
    });
  };



  // ---------------- TOKEN CHECK ----------------
  const token = localStorage.getItem("token");

  if (!token) {
    return null;
  }



  return (
    <div className="flex min-h-screen flex-col bg-gray-50">

      <Navbar user={userInfo} />

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-6xl">

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <h1 className="text-2xl font-bold text-gray-900">
              My Notes
            </h1>

            <div className="w-full sm:max-w-xs">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>

          </div>



          {isLoading ? (

            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            </div>

          ) : allNotes.length === 0 ? (

            <EmptyCard onAddNote={handleAddNote} />

          ) : (

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {allNotes.map((note) => (
                <NoteCard key={note._id} note={note} />
              ))}

            </div>

          )}

        </div>

      </main>



      <button
        onClick={handleAddNote}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-700"
      >
        +
      </button>



      <AddEditNotes
        isOpen={openAddEditModal.isShown}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        type={openAddEditModal.type}
        data={openAddEditModal.data}
      />

    </div>
  );
};

export default Home;