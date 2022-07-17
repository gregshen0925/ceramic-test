import './App.css';
import { useState } from 'react'

import { CeramicClient } from '@ceramicnetwork/http-client'
import { getResolver } from '@ceramicnetwork/3id-did-resolver'

import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
import { DID } from 'dids'
import { IDX } from '@ceramicstudio/idx'

//this is free read/write node 
const endpoint = "https://ceramic-clay.3boxlabs.com"

function App() {
  const [name, setName] = useState('')
  const [info, setInfo] = useState('')
  // const [image, setImage] = useState('')
  // const [birthday, setBirthday] = useState('')
  // const [gender, setGender] = useState('')
  // const [sexOrientation, setSexOrientation] = useState('')
  // const [randomNumber, setNumber] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [addressToRead, setAddressToRead] = useState('')

  async function connect() {
    const addresses = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    return addresses
  }

  // this is for reading connected address
  async function readProfile() {
    const aliases = {
      schemas: {
        greg6: 'ceramic://k3y52l7qbv1frxhj4d1ryrt31p3iqgd80ti8g1nccwcdps75pfqu2b5ipyoqe0sn4',
      },
      definitions: {
        Greg6: 'kjzl6cwe1jw1472rit1356wmzig2xgw0u4ydqew3i6or08lp2x0llh3tvxgd9ow',
      },
      tiles: {},
    }
    const [address] = await connect()
    const ceramic = new CeramicClient(endpoint)
    const idx = new IDX({ ceramic, aliases })

    try {
      const data = await idx.get(
        'kjzl6cwe1jw1472rit1356wmzig2xgw0u4ydqew3i6or08lp2x0llh3tvxgd9ow',
        `${address}@eip155:1`
      )
      console.log(`${address}@eip155:1`)
      console.log('data: ', data)
      if (data.name) setName(data.name)
      if (data.info) setInfo(data.info)
      // if (data.avatar) setImage(data.avatar)
      // if (data.birthday) setBirthday(data.birthday)
      // if (data.gender) setGender(data.gender)
      // if (data.sexOrientation) setSexOrientation(data.sexOrientation)
      // if (data.randomNumber) setNumber(data.randomNumber)


    } catch (error) {
      console.log('error: ', error)
      setLoaded(true)
    }
  }
  //this is for reading other address's profile
  async function readAddressProfile() {
    const aliases = {
      schemas: {
        greg6: 'ceramic://k3y52l7qbv1frxhj4d1ryrt31p3iqgd80ti8g1nccwcdps75pfqu2b5ipyoqe0sn4',
      },
      definitions: {
        Greg6: 'kjzl6cwe1jw1472rit1356wmzig2xgw0u4ydqew3i6or08lp2x0llh3tvxgd9ow',
      },
      tiles: {},
    }
    const ceramic = new CeramicClient(endpoint)
    const idx = new IDX({ ceramic, aliases })

    if (!addressToRead) {
      return alert("Input an address")
    }

    try {
      const data = await idx.get(
        'kjzl6cwe1jw1472rit1356wmzig2xgw0u4ydqew3i6or08lp2x0llh3tvxgd9ow',
        `${addressToRead}@eip155:1`
      )
      console.log('data: ', data)
      if (data.name) setName(data.name)
      if (data.info) setInfo(data.info)
      // if (data.avatar) setImage(data.avatar)
      // if (data.birthday) setBirthday(data.birthday)
      // if (data.gender) setGender(data.gender)
      // if (data.sexOrientation) setSexOrientation(data.sexOrientation)
      // if (data.randomNumber) setNumber(data.randomNumber)


    } catch (error) {
      console.log('error: ', error)
      setLoaded(true)
    }
  }

  async function updateProfile() {
    const [address] = await connect()
    const ceramic = new CeramicClient(endpoint)
    const threeIdConnect = new ThreeIdConnect()
    const provider = new EthereumAuthProvider(window.ethereum, address)

    await threeIdConnect.connect(provider)

    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: {
        ...getResolver(ceramic)
      }
    })

    ceramic.setDID(did)
    await ceramic.did.authenticate()
    const aliases = {
      schemas: {
        greg6: 'ceramic://k3y52l7qbv1frxhj4d1ryrt31p3iqgd80ti8g1nccwcdps75pfqu2b5ipyoqe0sn4',
      },
      definitions: {
        Greg6: 'kjzl6cwe1jw1472rit1356wmzig2xgw0u4ydqew3i6or08lp2x0llh3tvxgd9ow',
      },
      tiles: {},
    }
    const idx = new IDX({ ceramic, aliases })

    await idx.set('kjzl6cwe1jw1472rit1356wmzig2xgw0u4ydqew3i6or08lp2x0llh3tvxgd9ow', {
      name,
      info,
      // avatar: image,
      // birthday,
      // gender,
      // sexOrientation,
      // randomNumber,
    })

    console.log("Profile updated!")
  }

  return (
    <div className="App">
      <input placeholder="name" onChange={e => setName(e.target.value)} />
      <input placeholder="info" onChange={e => setInfo(e.target.value)} />
      {/* <input placeholder="Profile Image" onChange={e => setImage(e.target.value)} />
      <input placeholder="Birthday" onChange={e => setBirthday(e.target.value)} />
      <input placeholder="Gender" onChange={e => setGender(e.target.value)} />
      <input placeholder="Sex Orientation" onChange={e => setSexOrientation(e.target.value)} />
      <input placeholder="Random Number" onChange={e => setNumber(e.target.value)} /> */}
      <button onClick={updateProfile}>Set Profile</button>
      <button onClick={readProfile}>Read Profile</button>
      <button onClick={connect}>Connect Wallet</button>
      <input placeholder="Address to read" onChange={e => setAddressToRead(e.target.value)} />
      <button onClick={readAddressProfile}>Read Address Profile</button>



      {name && <h3>Name: {name}</h3>}
      {info && <h3>Info: {info}</h3>}
      {/* {image && <img style={{ width: '400px' }} src={image} />}
      {birthday && <h3>Birthday: {birthday}</h3>}
      {gender && <h3>Gender: {gender}</h3>}
      {sexOrientation && <h3>Sex Orientation: {sexOrientation}</h3>}
      {randomNumber && <h3>Random Number: {randomNumber}</h3>} */}
      {(!info && !name && loaded) && <h4>No profile, please create one...</h4>}
    </div>
  );
}

export default App;

