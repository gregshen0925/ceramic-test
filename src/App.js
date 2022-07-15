import './App.css';
import { useState } from 'react'

import { CeramicClient } from '@ceramicnetwork/http-client'
import { getResolver } from '@ceramicnetwork/3id-did-resolver'

import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
import { DID } from 'dids'
import { IDX } from '@ceramicstudio/idx'

const endpoint = "https://ceramic-clay.3boxlabs.com"

function App() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState('')
  const [sexOrientation, setSexOrientation] = useState('')
  const [randomNumber, setNumber] = useState('')
  const [loaded, setLoaded] = useState(false)

  async function connect() {
    const addresses = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    return addresses
  }

  async function readProfile() {
    const [address] = await connect()
    const ceramic = new CeramicClient(endpoint)
    const idx = new IDX({ ceramic })

    try {
      const data = await idx.get(
        'basicProfile',
        `${address}@eip155:1`
      )
      console.log('data: ', data)
      if (data.name) setName(data.name)
      if (data.description) setImage(data.description)
      if (data.avatar) setImage(data.avatar)
      if (data.birthday) setImage(data.birthday)
      if (data.gender) setImage(data.gender)

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

    const idx = new IDX({ ceramic })

    await idx.set('basicProfile', {
      name,
      description,
      avatar: image,
      birthday,
      gender,
    })

    console.log("Profile updated!")
  }

  return (
    <div className="App">
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <input placeholder="Description" onChange={e => setDescription(e.target.value)} />
      <input placeholder="Profile Image" onChange={e => setImage(e.target.value)} />
      <input placeholder="Birthday" onChange={e => setBirthday(e.target.value)} />
      <input placeholder="Gender" onChange={e => setGender(e.target.value)} />
      <input placeholder="Sex Orientation" onChange={e => setSexOrientation(e.target.value)} />
      <input placeholder="Random Number" onChange={e => setNumber(e.target.value)} />
      <button onClick={updateProfile}>Set Profile</button>
      <button onClick={readProfile}>Read Profile</button>
      <button onClick={connect}>Connect Wallet</button>


      {name && <h3>{name}</h3>}
      {name && <h3>{description}</h3>}
      {image && <img style={{ width: '400px' }} src={image} />}
      {name && <h3>{birthday}</h3>}
      {name && <h3>{gender}</h3>}
      {name && <h3>{sexOrientation}</h3>}
      {name && <h3>{randomNumber}</h3>}
      {(!image && !name && loaded) && <h4>No profile, please create one...</h4>}
    </div>
  );
}

export default App;

