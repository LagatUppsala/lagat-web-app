"use client"

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

type Ingredient = {
  embedding: number[];
  name: string;
};

type Recipe = {
  id: string;
  name: string;
  link_url: string;
  ingredients: Ingredient[];
};


export default function Home() {

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">LAGAT</h1>
    </div>
  );
}
