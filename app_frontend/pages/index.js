import Head from "next/head";
import Header from "../components/Header";
import { v4 as uuidv4 } from "uuid";
import ScrollToTop from "react-scroll-to-top";
import Masonry from "react-masonry-css";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Spinner from "../components/Spinner";
import { useStateContext } from "./context/NoteContext";
import Note from "../components/Note";
import { useState } from "react";
import { client } from "../client";
import { feedQuery, searchQuery } from "../utils/queries";

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1,
};

export default function Home() {
  const router = useRouter();
  const { searchString, setSearchString, setNotes, notes, loading, setLoading } = useStateContext();

  useEffect(() => {
    const User =
      localStorage.getItem("user") !== "undefined"
        ? JSON.parse(localStorage.getItem("user"))
        : localStorage.clear();

    if (!User) router.push("/login");
  }, []);

  useEffect(() => {
    if (searchString) {
      setLoading(true);
      const query = searchQuery(searchString, JSON.parse(localStorage.getItem('user'))?.uid);
      console.log(query)
      client.fetch(query).then((data) => {
        setNotes(data.filter(item => item?.postedBy?._id === JSON.parse(localStorage.getItem('user'))?.uid)
        );

        setLoading(false);
      });
    } else {
      setLoading(true);
      const query = feedQuery(JSON.parse(localStorage.getItem("user"))?.uid);
      client.fetch(query).then((data) => {
        setNotes(data);
        console.log(data);
        setLoading(false);
      });
    }
  }, [searchString]);

  if (loading) {
    return <Spinner />;
  }
  return (
    <>
      <Head>
        <title>Next-Sanity Notes App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <Header />
        {loading && <Spinner />}

        {notes.length === 0 && (
          <p className="text-3xl text-gray-900 text-center my-4">
            No Notes Found
          </p>
        )}

        <Masonry
          className="flex justify-between gap-2 sm:w-full lg:w-[95%] lg:mx-auto px-3 py-4 rounded"
          breakpointCols={breakpointColumnsObj}
        >
          {notes && notes.map((note) => <Note key={note._id} {...note} />)}

          <ScrollToTop smooth />
        </Masonry>
      </div>
    </>
  );
}
