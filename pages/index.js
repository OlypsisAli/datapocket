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

  // let window;

  //
  const [welcomeState, setwelcomeState] = useState(false);
  const [state, setState] = useState(true);
  const handler = () => setState(true);
  const closeHandler = (event) => {
    setState(true);
    console.log("closed");
  };
  //

  // const [window, setWindow] = useState(false);

  // useEffect(() => {
  //   if (collectionUUid) {
  //     console.log("use effect");
  //     fetch("https://api.estuary.tech/content/stats?offset=0&limit=500", {
  //       method: "GET",
  //       // mode: "no-cors",
  //       headers: {
  //         Authorization: "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
  //       },
  //     })
  //       .then((data) => {
  //         console.log("Response", data);
  //         return data.json();
  //       })
  //       .then((data) => {
  //         setData(data);
  //         console.log("data from response", data);
  //       });
  //   }
  // }, 10000);

  // useEffect(() => {
  //   fetch("https://api.estuary.tech/collections/create", {
  //     method: "POST",
  //     headers: {
  //       Authorization: "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
  //     },
  //     body: JSON.stringify({
  //       name: "0x78ff9f195c55475bbdbf84a9734acc9d3bb2bd63aa5fff65973e058bc2a0bd5c7c24dbff60212d5d53b97cac1c0abb415c38fb1453eeb348d64a6e4b4234ac3d1b",
  //       description:
  //         "0x78ff9f195c55475bbdbf84a9734acc9d3bb2bd63aa5fff65973e058bc2a0bd5c7c24dbff60212d5d53b97cac1c0abb415c38fb1453eeb348d64a6e4b4234ac3d1b",
  //     }),
  //   })
  //     .then((data) => {
  //       let fakedata = [
  //         {
  //           name: "bob.mp3",
  //           cid: "xyzbool",
  //         },
  //       ];
  //       setData(fakedata);
  //       console.log("data", data);
  //       return data.json();
  //     })
  //     .then((data) => {
  //       // this.setState({ ...data });
  //     });

  //   console.log("use effect");
  //   fetch("https://api.estuary.tech/collections/create", {
  //     method: "POST",
  //     headers: {
  //       Authorization: "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
  //     },
  //     body: JSON.stringify({
  //       name: "0x78ff9f195c55475bbdbf84a9734acc9d3bb2bd63aa5fff65973e058bc2a0bd5c7c24dbff60212d5d53b97cac1c0abb415c38fb1453eeb348d64a6e4b4234ac3d1b",
  //       description:
  //         "0x78ff9f195c55475bbdbf84a9734acc9d3bb2bd63aa5fff65973e058bc2a0bd5c7c24dbff60212d5d53b97cac1c0abb415c38fb1453eeb348d64a6e4b4234ac3d1b",
  //     }),
  //   })
  //     .then((data) => {
  //       let fakedata = [
  //         {
  //           name: "bob.mp3",
  //           cid: "xyzbool",
  //         },
  //       ];
  //       setData(fakedata);
  //       console.log("data", data);
  //       return data.json();
  //     })
  //     .then((data) => {
  //       // this.setState({ ...data });
  //     });
  // }, []);

  function uploadAndEncrpytToast() {
    console.log("uploadingToast hit");
    // const { setToast } = useToasts()
    // const click = () =>
    setToast({
      text: <p>File Upload Started: Please keep window open</p>,
      delay: 10000,
    });
    // return (
    //   <Button scale={2 / 3} auto onClick={click}>
    //     Show Toast
    //   </Button>
    // );
  }

  function agreeToExportPublicKey() {
    console.log("uploadingToast hit");
    // const { setToast } = useToasts()
    // const click = () =>
    setToast({
      text: (
        <p>
          File Encryption Started: Provide your public key via Metamask prompt
        </p>
      ),
      delay: 10000,
    });
    // return (
    //   <Button scale={2 / 3} auto onClick={click}>
    //     Show Toast
    //   </Button>
    // );
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
          {/* <Modal.Subtitle>
          Welcome to the DataPocket beta! 
          </Modal.Subtitle> */}
          {/* <img src={metaMaskLogo.src} /> */}
          <Modal.Content>
            <p>
              DataPocket allows you to have full control of your personal files
              at all times. Files are encrypted via your Metamask wallet and
              stored on the filecoin network. The project is currently in beta
              and will become more feature rich as the weeks go by.
            </p>
          </Modal.Content>
          {/* <Modal.Action passive onClick={() => setState(false)}>
  Cancel
</Modal.Action> */}
          <Modal.Action passive onClick={() => setwelcomeState(false)}>
            Get Started!
          </Modal.Action>
          {/* <Modal.Action>Connect</Modal.Action> */}
        </Modal>
      </>
    );
  };

  const showmodal = () => {
    console.log("showmodel hit");
    // setState(true);
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
              DataPocket Beta Currently Requires Metamask
            </Modal.Subtitle>
            {/* <img src={metaMaskLogo.src} /> */}
            {/* <Modal.Content>
        <p>Some content contained within the modal.</p>
      </Modal.Content> */}
            {/* <Modal.Action passive onClick={() => setState(false)}>
        Cancel
      </Modal.Action> */}
            <Modal.Action passive onClick={web3Signin}>
              Connect
            </Modal.Action>
            {/* <Modal.Action>Connect</Modal.Action> */}
          </Modal>
        );
      } else {
        return (
          <Modal
            visible={state}
            onClose={closeHandler}
            className={styles.metaMaskLogo}
          >
            {/* <Modal.Title>Sign In</Modal.Title> */}
            <Modal.Subtitle>Metamask Not Detected</Modal.Subtitle>
            {/* <img src={metaMaskLogo.src} /> */}
            {/* <Modal.Content>
    <p>Some content contained within the modal.</p>
  </Modal.Content> */}
            {/* <Modal.Action passive onClick={() => setState(false)}>
    Cancel
  </Modal.Action> */}
            {/* <Modal.Action passive onClick={web3Signin}>
        Connect
      </Modal.Action> */}
            {/* <Modal.Action>Connect</Modal.Action> */}
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
    // let publicKey = await getPublicKey();
    // console.log("publicKey", publicKey);

    // encryptedMessage = bufferToHex(
    //         Buffer.from(
    //           JSON.stringify(
    //             encrypt({
    //               publicKey: publicKey,
    //               data: encryptresult[0],
    //               // data: e.target.files[0],
    //               version: "x25519-xsalsa20-poly1305",
    //             })
    //           ),
    //           "utf8"
    //         )
    //       );
    //       console.log("encryptedMessage", encryptedMessage);
    //       encryptresult[0] = encryptedMessage;

    let file = e.target.files[0];
    let fileName = e.target.files[0].name;
    console.log("file", file);
    console.log("fileName", fileName);
    // let encryptedMessage;
    console.log("e on load", e);

    //Returns key and cyphertext
    // let encryptresult = await encryptFile(reader.result);
    agreeToExportPublicKey();
    //1. encrypt
    let encryptresult = await aes(file);

    console.log("encryptresult", encryptresult);
    encryptresult = JSON.stringify(encryptresult);
    console.log("encryptresult after string", encryptresult);
    let dataBlob = new Blob([encryptresult], { type: "application/json" });
    dataBlob.name = e.target.files[0].name;
    console.log("dataBlob", dataBlob);

    //2. zip
    // let zippedFile = await zipFiles(encryptresult, fileName);

    //3. send
    // console.log("zippedFile", zippedFile);
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
    // https://dweb.link/ipfs/" + e.cid["/"]

    ///////
    // let publicKey = await getPublicKey();

    async function getText() {
      console.log("get text hit");
      let cypherObj;
      // read text from URL location
      var request = new XMLHttpRequest();
      // https://bafybeifm4giovpt2eylchcwe6augmtjzivf4xrxihtg3bcuefjlyu72qmq.ipfs.dweb.link/
      //bafybeifm4giovpt2eylchcwe6augmtjzivf4xrxihtg3bcuefjlyu72qmq.ipfs.dweb.link/
      // request.open("GET", "https://dweb.link/ipfs/" + cid, true);
      request.open(
        "GET",
        "https://shuttle-5.estuary.tech/gw/ipfs/" + cid,
        true
      );

      // request.open("GET", "https://bafybeifm4giovpt2eylchcwe6augmtjzivf4xrxihtg3bcuefjlyu72qmq.ipfs.dweb.link/", true);
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
          await fetch("https://api.estuary.tech/collections/list", {
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
                fetch("https://api.estuary.tech/collections/create", {
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
                    return data.json();
                  })
                  .then((data) => {
                    console.log("uuid", data.uuid);
                    let uuid = data.uuid;
                    setcollectionUUid(uuid);
                    //
                    fetch(
                      `https://api.estuary.tech/collections/content?coluuid=${uuid}`,
                      {
                        method: "GET",
                        headers: {
                          Authorization:
                            "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
                        },
                      }
                    )
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
                fetch(
                  `https://api.estuary.tech/collections/content?coluuid=${uuid}`,
                  {
                    method: "GET",
                    headers: {
                      Authorization:
                        "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
                    },
                  }
                )
                  .then((data) => {
                    return data.json();
                  })
                  .then((data) => {
                    console.log("data", data);
                    setData(data?.reverse());
                    // setData(data);

                    // data.forEach((e) => {
                    //   console.log("e", e);
                    //   let id = e.id;
                    //   fetch(`https://api.estuary.tech/pinning/pins/${id}`, {
                    //     method: "DELETE",
                    //     headers: {
                    //       Authorization:
                    //         "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
                    //     },
                    //   })
                    //     .then((data) => {
                    //       // return data.json();
                    //     })
                    //     .then((data) => {
                    //       // this.setState({ ...data });
                    //     });
                    // });
                    ///

                    console.log("collection found");
                  });
              }

              /////
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
          {/* <Modal.Title>Sign In</Modal.Title> */}
          <Modal.Subtitle>Metamask Not Detected</Modal.Subtitle>
          {/* <img src={metaMaskLogo.src} /> */}
          {/* <Modal.Content>
<p>Some content contained within the modal.</p>
</Modal.Content> */}
          {/* <Modal.Action passive onClick={() => setState(false)}>
Cancel
</Modal.Action> */}
          {/* <Modal.Action passive onClick={web3Signin}>
  Connect
</Modal.Action> */}
          {/* <Modal.Action>Connect</Modal.Action> */}
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
    // formData.append('name',"bob)
    console.log("formData", formData);
    console.log("formData('Data')", formData.getAll("data"));

    console.log("Array", Array.from(formData));
    // NOTE
    // This example uses XMLHttpRequest() instead of fetch
    // because we want to show progress. But you can use
    // fetch in this example if you like.
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      console.log({ loaded: event.loaded, total: event.total });

      if (event.loaded == event.total) {
        console.log("event loaded fully");
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            console.log("response", xhr.response);
            uploadSuccess();

            let resposneCid = JSON.parse(xhr.response);
            console.log("resposneCid", resposneCid);

            resposneCid = resposneCid.cid;
            console.log("resposneCid", resposneCid);

            console.log("collectionUUid", collectionUUid);
            fetch("https://api.estuary.tech/collections/add-content", {
              method: "POST",
              headers: {
                Authorization:
                  "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
              },
              body: JSON.stringify({
                contents: [],
                cids: [resposneCid],
                coluuid: collectionUUid,
              }),
            })
              .then((data) => {
                return data.json();
              })
              .then((data) => {
                console.log("add-content", data);
              });

            fetch(
              `https://api.estuary.tech/collections/content?coluuid=${collectionUUid}`,
              {
                method: "GET",
                headers: {
                  Authorization:
                    "Bearer EST77f86378-f332-421a-b42b-d8eba6b384e8ARY",
                },
              }
            )
              .then((data) => {
                console.log("data from response", data);
                return data.json();
              })
              .then((data) => {
                setData(data?.reverse());
                // setData(data);

                console.log("data at get collection", data);
              });
            //////////
            //////////
          }
        };
      }
    };
    // xhr.open("POST", "https://api.estuary.tech/content/add");
    xhr.open("POST", "https://shuttle-5.estuary.tech/content/add");
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

                  // window.open(
                  //   "https://dweb.link/ipfs/" + e.cid["/"],
                  //   "_blank"
                  // )
                }
              >
                <Table.Column prop="name" label="Name" />
                {/* <Table.Column prop="cid:" label="Cid" /> */}
                <Table.Column
                  // prop={"cid[/]"}
                  prop="cid"
                  label="Cid"
                  width={150}
                />
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
// window.open(URL, '_blank');
//              onRow={Table.TableOnRowClick=((e) => console.log(e))}

// onRow={Table.TableOnRowClick=((e) => window.open('https://dweb.link/ipfs/'+ e.cid,"_blank"))}

// <Loading>Uploading</Loading>

// window.ethereum.isMetaMask

// {!account ? (
//   <Modal
//     visible={state}
//     onClose={closeHandler}
//     className={styles.metaMaskLogo}
//   >
//     <Modal.Title>Sign In</Modal.Title>
//     <Modal.Subtitle>
//       DataPocket Beta Currently Requires Metamask
//     </Modal.Subtitle>
//     {/* <img src={metaMaskLogo.src} /> */}
//     {/* <Modal.Content>
//       <p>Some content contained within the modal.</p>
//     </Modal.Content> */}
//     {/* <Modal.Action passive onClick={() => setState(false)}>
//       Cancel
//     </Modal.Action> */}
//     <Modal.Action passive onClick={web3Signin}>
//       Connect
//     </Modal.Action>
//     <Modal.Action>Connect</Modal.Action>
//   </Modal>
// ) : null}
{
  /* <>
  <Modal visible={state} onClose={closeHandler} className={styles.metaMaskLogo}>
    <Modal.Title>Sign In</Modal.Title>
    <Modal.Subtitle>
      DataPocket Beta Currently Requires Metamask
    </Modal.Subtitle>
    {/* <img src={metaMaskLogo.src} /> */
}
{
  /* <Modal.Content>
      <p>Some content contained within the modal.</p>
    </Modal.Content> */
}
{
  /* <Modal.Action passive onClick={() => setState(false)}>
      Cancel
    </Modal.Action> */
}
{
  /* <Modal.Action passive onClick={web3Signin()}>Connect</Modal.Action>
  </Modal>
</> */
}
{
  /* <Text>File View</Text> */
}

// <Table
//   data={cidData}
//   onChange={(value) => setData(value)}
//   onRow={
//     (Table.TableOnRowClick = (e) => {
//       console.log("e", e), decryptData(e);
//     })

//     // window.open(
//     //   "https://dweb.link/ipfs/" + e.cid["/"],
//     //   "_blank"
//     // )
//   }
// >
//   <Table.Column prop="name" label="Name" />
//   {/* <Table.Column prop="cid:" label="Cid" /> */}
//   <Table.Column
//     // prop={"cid[/]"}
//     prop="cid"
//     label="Cid"
//     width={150}
//   />
// </Table>

// () => {
//   const { visible, setVisible, bindings } = useModal()
//   return (
//     <>
//       <Button auto onClick={() => setVisible(true)}>Show Modal</Button>
//       <Modal {...bindings}>
//         <Modal.Title>Modal</Modal.Title>
//         <Modal.Subtitle>Modal with a lot of content</Modal.Subtitle>
//         <Modal.Content>
//           <p>An open-source design system for building modern websites and applications.
//           An open-source design system for building modern websites and applications.
//           An open-source design system for building modern websites and applications. </p>
//         </Modal.Content>
//         <Modal.Action passive onClick={() => setVisible(false)}>Cancel</Modal.Action>
//         <Modal.Action>Submit</Modal.Action>
//       </Modal>
//     </>
//   )
// }