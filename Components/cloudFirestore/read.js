import firebase from "firebase/app";
import {
  doc,
  setDoc,
  collection,
  collectionReference,
} from "firebase/firestore";
import initFirebase from "../../firebase/initFirebase";

export default async function getCollection() {
  await initFirebase();

  firebase().collection('testAddress');
  // const snapshot = await firebase.firestore().collection("testAddress").get();
  // console.log(snapshot.docs.map((doc) => doc.data()));
}
