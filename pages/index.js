import React, { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import {
  Button,
  Page,
  Text,
  Table,
  Input,
  User,
  Loading,
  useToasts,
  Modal,
  useModal,
} from "@geist-ui/core";
import Link from "next/link";
import { File, FilePlus } from "@geist-ui/icons";
import dataPocketLogo from "../public/DataPocketLogo200200.png";
import metaMaskLogo from "../public/metamask-sm.png";
import { ethers } from "ethers";
import { SiweMessage } from "siwe";
import { ethUtil, bufferToHex } from "ethereumjs-util";
import { encrypt, decrypt } from "@metamask/eth-sig-util";
import cryptoJs from "crypto-js";
import JSZip, { forEach } from "jszip";
import {
  encryptFile,
  decryptCypher,
  zipFiles,
  unzipFiles,
  aes,
  decryptAES,
} from "../lib/utils";

export default function Home() {
  const [count, setCount] = useState(0);
  const fileInput = React.useRef();
  const [data, setData] = useState([]);
  const [account, setAccount] = useState(null);
  const [pubKey, setpubKey] = useState(null);
  const [encryptedData, setencryptedData] = useState();
  const [collectionUUid, setcollectionUUid] = useState();
  const { setToast } = useToasts();
  const { visible, setVisible, bindings } = useModal();
  const [welcomeState, setwelcomeState] = useState(false);
  const [state, setState] = useState(true);
  const handler = () => setState(true);
  const closeHandler = (event) => {
    setState(true);
    console.log("closed");
  };

  function uploadAndEncrpytToast() {
    console.log("uploadingToast hit");
    setToast({
      text: <p>File Upload Started: Please keep window open</p>,
      delay: 10000,
    });
  }

  function agreeToExportPublicKey() {
    console.log("uploadingToast hit");
    setToast({
      text: (
        <p>
          File Encryption Started: Provide your public key via Metamask prompt
        </p>
      ),
      delay: 10000,
    });
  }

  function uploadSuccess() {
    console.log("uploadingToast hit");

    setToast({
      text: "File Uploded To Filecoin Network!",
      type: "success",
      delay: 10000,
    });
  }

  const welcomeModal = () => {
    console.log("WELCOME MODAL HIT");
    return (
      <>
        <Modal
          visible={welcomeState}
          onClose={closeHandler}
          className={styles.metaMaskLogo}
        >
          <Modal.Title>Welcome to DataPocket beta!</Modal.Title>
          <Modal.Content>
            <p>
              DataPocket allows you to have full control of your personal files
              at all times. Files are encrypted via your Metamask wallet and
              stored on the filecoin network. The project is currently in beta
              and will become more feature rich as the weeks go by.
            </p>
          </Modal.Content>
          <Modal.Action passive onClick={() => setwelcomeState(false)}>
            Get Started!
          </Modal.Action>
        </Modal>
      </>
    );
  };

  const showmodal = () => {
    console.log("showmodel hit");
    if (typeof window !== "undefined") {
      if (window.ethereum && window.ethereum.isMetaMask) {
        return (
          <Modal
            visible={state}
            onClose={closeHandler}
            className={styles.metaMaskLogo}
          >
            <Modal.Title>Sign In</Modal.Title>
            <Modal.Subtitle>
              DataPocket Beta Currently Requires Metamask.
            </Modal.Subtitle>
            <Link
              href="https://www.youtube.com/watch?v=uD8V7lwW2no"
              target="_blank"
            >
              <a target="_blank">Demo Video</a>
            </Link>
            <Modal.Action passive onClick={web3Signin}>
              Connect
            </Modal.Action>
          </Modal>
        );
      } else {
        return (
          <Modal
            visible={state}
            onClose={closeHandler}
            className={styles.metaMaskLogo}
          >
            <Modal.Subtitle>Metamask Not Detected</Modal.Subtitle>
          </Modal>
        );
      }
    } else {
      console.log("window undefined");
    }
  };

  const encryptData = async (e) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();
    console.log("encryptData hit");
    console.log("e", e);

    let file = e.target.files[0];
    let fileName = e.target.files[0].name;
    console.log("file", file);
    console.log("fileName", fileName);
    console.log("e on load", e);

    agreeToExportPublicKey();
    //1. encrypt
    let encryptresult = await aes(file);

    console.log("encryptresult", encryptresult);
    encryptresult = JSON.stringify(encryptresult);
    console.log("encryptresult after string", encryptresult);
    let dataBlob = new Blob([encryptresult], { type: "application/json" });
    dataBlob.name = e.target.files[0].name;
    console.log("dataBlob", dataBlob);
    uploadAndEncrpytToast();
    upload(dataBlob, fileName);
  };

  const decryptData = async (e) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.listAccounts();

    console.log("decryptData hit");
    console.log("encryptedDataATdecrypt", e);
    let cid = e.cid;
    let cyphertext;
    console.log("cid", cid);
    let response;

    async function getText() {
      console.log("get text hit");
      let cypherObj;
      // read text from URL location
      var request = new XMLHttpRequest();
      request.open(
        "GET",
        "https://shuttle-5.estuary.tech/gw/ipfs/" + cid,
        true
      );

      request.responseType = "blob";
      request.send(null);
      request.onreadystatechange = async function () {
        if (request.readyState === 4 && request.status === 200) {
          response = request.response;
          console.log("request.response;", response);

          console.log(
            "JSON.parse(response)",
            JSON.parse(await response.text())
          );

          response = JSON.parse(await response.text());

          console.log("response", response);
          console.log("response.encrypted", response.encrypted);
          console.log("response.filename", response.filename);
          console.log("response.filetype", response.filetype);
          console.log("response.iv", response.iv);
          console.log("response.key", response.key);

          decryptAES(
            response.encrypted,
            response.iv,
            response.key,
            response.filetype,
            response.filename
          );
        }
      };
    }

    await getText();
  };

  ////SIWE
  const web3Signin = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      const domain = window.location.host;
      const origin = window.location.origin;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log("account 1", account);
      if (!account) {
        function createSiweMessage(address, statement) {
          const message = new SiweMessage({
            domain,
            address,
            statement,
            uri: origin,
            version: "1",
            chainId: "1",
          });
          return message.prepareMessage();
        }

        async function signInWithEthereum() {
          const address = await signer.getAddress();
          console.log("account", account);
          const message = createSiweMessage(
            address,
            "Sign in with Ethereum to the app."
          );
          // const address = await signer.getAddress()
          // console.log('address',await signer.getAddress());
          console.log(await signer.signMessage(message));
          setAccount(address);
          console.log("address shoud work", address);

          ///// 1. check if colleciton exists for the account
          console.log("use effect");
          await fetch("https://api.estuary.tech/collections/", {
            method: "GET",
            headers: {
              Authorization:
                "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
            },
          })
            .then((data) => {
              return data.json();
            })
            .then((data) => {
              console.log("data", data);
              const matchOfAccount = (e) => e.name == address;
              // data.findIndex(index);
              let index = data.findIndex(matchOfAccount);
              console.log("index", index);
              console.log("data[index]", data[index]);
              let uuid = data[index]?.uuid;
              console.log("does the orignial uuid exist", uuid);
              setcollectionUUid(uuid);
              console.log("acccount at SIWE", address);

              /////
              ///// 2. If account collection not found create a collection

              if (uuid == undefined) {
                console.log("uuid not found; createing new one");
                fetch("https://api.estuary.tech/collections/", {
                  method: "POST",
                  headers: {
                    Authorization:
                      "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
                  },
                  body: JSON.stringify({
                    name: address,
                    description: address,
                  }),
                })
                  .then((data) => {
                    console.log("data at post new collection", data);
                    return data.json();
                  })
                  .then((data) => {
                    console.log("uuid", data.uuid);
                    let uuid = data.uuid;
                    setcollectionUUid(uuid);
                    //
                    fetch(`https://api.estuary.tech/collections/${uuid}`, {
                      method: "GET",
                      headers: {
                        Authorization:
                          "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
                      },
                    })
                      .then((data) => {
                        return data.json();
                      })
                      .then((data) => {
                        console.log("data", data);
                        setData(data?.reverse());
                        // setData(data);
                        console.log("data at get collection", data);
                        setwelcomeState(true);
                      });
                    //
                  });
              }
              ///// 3.If yes then retive the collection

              if (uuid != undefined) {
                console.log("uuid at found", uuid);
                console.log("uuid found! let me get that collection");
                fetch(`https://api.estuary.tech/collections/${uuid}`, {
                  method: "GET",
                  headers: {
                    Authorization:
                      "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
                  },
                })
                  .then((data) => {
                    return data.json();
                  })
                  .then((data) => {
                    console.log("data", data);
                    setData(data?.reverse());

                    console.log("collection found");
                  });
              }
            });
        }

        async function connectWallet() {
          await provider
            .send("eth_requestAccounts", [])
            .then(() => {
              signInWithEthereum();
            })
            .catch(() => {
              console.log("user rejected request");
            });
        }
        await connectWallet();
      }
    } else {
      return (
        <Modal
          visible={state}
          onClose={closeHandler}
          className={styles.metaMaskLogo}
        >
          <Modal.Subtitle>Metamask Not Detected</Modal.Subtitle>
        </Modal>
      );
    }
  };
  ///

  let cidData = data?.map((array) => ({
    name: array.name,
    cid: array.cid,
  }));
  console.log("ciddata", cidData);

  Table.TableOnRowClick = {};

  const upload = async (blob, fileName) => {
    // e.persist();
    console.log("e", blob);
    console.log("filename at upload", fileName);
    // console.log("e.target.files", e.target.files);

    const formData = new FormData();

    formData.append("data", blob, fileName);
    console.log("formData", formData);
    console.log("formData('Data')", formData.getAll("data"));

    console.log("Array", Array.from(formData));

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      console.log({ loaded: event.loaded, total: event.total });

      if (event.loaded == event.total) {
        console.log("event loaded fully");
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            console.log("response", xhr.response);
            uploadSuccess();

            let response = JSON.parse(xhr.response);
            console.log("response", response);
            let responseCid = response.cid;
            // let contentId = response.estuaryId;
            // console.log("responseCid", responseCid);
            // console.log("contentId", contentId);
            console.log("collectionUUid", collectionUUid);

            //add to collection
            // https://shuttle-5.estuary.tech
            fetch(`https://api.estuary.tech/content/add-ipfs`, {
              method: "POST",
              headers: {
                Authorization:
                  "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
              },
              body: JSON.stringify({
                root: responseCid,
                coluuid: collectionUUid,
                filename: blob.name,
              }),
            })
              .then((data) => {
                return data.json();
              })
              .then((data) => {
                console.log("add-content", data);
              });

            fetch(`https://api.estuary.tech/collections/${collectionUUid}`, {
              method: "GET",
              headers: {
                Authorization:
                  "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
              },
            })
              .then((data) => {
                console.log("data from response", data);
                return data.json();
              })
              .then((data) => {
                setData(data?.reverse());
                // setData(data);

                console.log("data at get collection", data);
              });
          }
        };
      }
    };
    xhr.open("POST", "https://api.estuary.tech/content/add");
    // xhr.open("POST", "https://api.estuary.tech/content/add");
    xhr.setRequestHeader(
      "Authorization",
      "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY"
    );
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    //supported in new browsers...do JSONP based stuff in older browsers...figure out how
    xhr.setRequestHeader(
      "Access-Control-Allow-Origin",
      "http://geojsonlint.com/"
    );
    console.log("xhr", xhr);
    xhr.send(formData);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <img src={dataPocketLogo.src} alt="test" />
            {/* <Text>Logo</Text> */}
          </div>
          <div className={styles.nav}>
            {/* <Input placeholder="Search"></Input> */}
            {!account ? (
              <Button onClick={() => web3Signin()}>Connect</Button>
            ) : (
              <>
                <User
                  src="https://unix.bio/assets/avatar.png"
                  name={account}
                ></User>
                <Button id="logout" onClick={() => setAccount(null)}>
                  Log Out
                </Button>
              </>
            )}
          </div>
          <div className={styles.sidebar}>
            {/* <Text small>My Files</Text> */}
            {/* <Button auto icon={<File />} type="abort">
              My Files
            </Button> */}
            <Button
              auto
              icon={<FilePlus />}
              type="abort"
              onClick={() => fileInput.current.click()}
            >
              Add File
            </Button>
            <input
              ref={fileInput}
              type="file"
              style={{ display: "none" }}
              // onChange={upload.bind(this)}
              onChange={encryptData.bind(this)}
            />
          </div>
          <div className={styles.fileview}>
            {!account ? (
              showmodal()
            ) : (
              <Table
                data={cidData}
                onChange={(value) => setData(value)}
                onRow={
                  (Table.TableOnRowClick = (e) => {
                    console.log("e", e), decryptData(e);
                  })
                }
              >
                <Table.Column prop="name" label="Name" />
                <Table.Column prop="cid" label="Cid" width={150} />
              </Table>
            )}
            {welcomeModal()}
          </div>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
