import { collection } from "firebase/firestore";
import { db } from "../firebase";

export const utilisateursCol = collection(db, "utilisateurs");
export const personnesCol = collection(db, "personnes");
export const communesCol = collection(db, "communes");
export const quartiersCol = collection(db, "quartiers");
export const mouvementsCol = collection(db, "mouvements");
export const raisonsCol = collection(db, "raisons");
