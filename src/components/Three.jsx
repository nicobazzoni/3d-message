import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Cloud, OrbitControls, Plane, Sky, Sparkles, Stars, Text, Text3D, Sphere, Billboard, ScreenSpace, Trail, CameraControls } from '@react-three/drei';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { SphereGeometry } from 'three';
import { signIn } from '../firebase'
import { OrthographicCamera,Bounds, useBounds } from '@react-three/drei';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBj569fcombAmC3dDyzXdOm-hMxPpkhrz4",
  authDomain: "text-r3f.firebaseapp.com",
  projectId: "text-r3f",
  storageBucket: "text-r3f.appspot.com",
  messagingSenderId: "1070529275605",
  appId: "1:1070529275605:web:a74a89a082a2298cbb245c"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaseApp);

const Three = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const sphereRef = useRef(); // Create a ref for the sphere
  const spacing = 1; // spacing between messages along the z-axis
  const staggerAmount = 0.5; // additional offset to stagger messages along the z-axis


  const animateSphere = (time) => {
    // Animation logic for moving the sphere
    if (sphereRef.current) {
      const x = Math.cos(time) * 5;
      const y = Math.sin(time) * 10;
      sphereRef.current.position.set(x, y, 0);
    }
  };
  function SelectToZoom({ children }) {
    const api = useBounds()
    return (
      <group onClick={(e) => (e.stopPropagation(), e.delta <= 2 && api.refresh(e.object).fit())} onPointerMissed={(e) => e.button === 0 && api.refresh().fit()}>
        {children}
      </group>
    )
  }

  

  const setZPositions = (messages, spacing, staggerAmount) => {
    const zPositions = [];
    let z = 0;
    for (let i = 0; i < messages.length; i++) {
      // Add an additional offset based on the index of the message
      z -= spacing + (i * staggerAmount);
      zPositions.push(z);
    }
    return zPositions;
  };
  const zPositions = setZPositions(messages, spacing, staggerAmount);
  //set the position of each message along the z axis but staggered so each one is visible
 

  //how do i call the above function to set the z positions of each message and username?
  

  useEffect(() => {
    let frameId;
    const animate = (time) => {
      animateSphere(time);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
//fectch messages from firebase as they are added 
    const fetchMessages = async () => {
      const querySnapshot = await getDocs(collection(firebaseDb, 'messages'));
      const messages = querySnapshot.docs.map((doc) => doc.data());
      setMessages(messages);
    }
    fetchMessages();

  }, []);

//show new messages as they are added
 
  onkeydown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }

  }




//function that positions each message along the z index in descending order
  
  

     



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !message) {
      return;
    }

    try {
      await addDoc(collection(firebaseDb, 'messages'), { username, message });
    } catch (error) {
      console.error('Error adding message to Firebase:', error);
    }

    setUsername('');
    setMessage('');
    //refresh messages
    const querySnapshot = await getDocs(collection(firebaseDb, 'messages'));
    const messages = querySnapshot.docs.map((doc) => doc.data());
    setMessages(messages);

  };

  const handleSpacebarDown = (event) => {
    const cameraPosition = cameraRef.current.position;
    const speed = 0.1; // adjust the speed of movement
    if (event.code === "Space") {
      // Move camera forward along z-axis
      cameraPosition.z -= speed;
    }
  };


  

  return (
    <div>
      <form onSubmit={handleSubmit}>
      <label  className="block mt-4 mb-2 p-4 text-sm font-medium text-gray-900 items-center justify-center ">Username: </label>
        <input  className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-200 focus:border-blue-500 block  w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' type="text" id="username"  value={username} onChange={(e) => setUsername(e.target.value)} />
        <br />
        <label htmlFor="message">Message: </label>
        <input className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-200 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' type="text" id="message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <br />
        <button className='  bg-stone-100 text-black hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-4 py-2  ' type="submit">Submit</button>
      </form>
      
      <Canvas  style={{ height: '100vh', width: '100vw' }} background='blue'>
      {/* <Plane args={[10, 10]}  rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <meshStandardMaterial color={'#000000'} />
      </Plane> */}
      <CameraControls />
       
        <Stars  radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Sparkles  position={[0, 0, 0]} />
        <ambientLight />
        {/* <Cloud position={[Math.random() * 10, 5,  Math.random() * 10, Math.random() * 10]} /> */}
        <Trail   width={0.2} // Width of the line
  color={'hotpink'} // Color of the line
  length={0.5} // Length of the line
  decay={0.5} // How fast the line fades away
  local={false} // Wether to use the target's world or local positions
  stride={1} // Min distance between previous and current point
  interval={1} // Number of frames to wait before next calculation
  target={null} // Optional target. This object will produce the trail.
  attenuation={(width) => width} // A function to define the width in each point along it.
>
        
        <Sphere ref={sphereRef} args={[1, 32, 32]} color="red">
          <meshStandardMaterial />
        </Sphere>
        
        </Trail>
       
        <pointLight position={[10, 10, 10]} color='red' />
          
        {messages.map((message, index) => (
          <OrthographicCamera makeDefault position={[0, 0, 8]} zoom={70} >
        
           <OrbitControls />
      
   
  <meshStandardMaterial color={'#000000'} metalness={1}  />
 
    
          <Text  key={index}
      //set position of each message along z axis but leave space between them
          position={[0, 0, zPositions[index]]}
          color="black"
          outlineColor="white" // set the outline color
          outlineWidth={0.1} // set the outline width
          fontSize={0.2}
          //make the text face the camera
       
          anchorX="center" // set the anchor point on x axis
          anchorY="middle"
          font="/Orbitron_Bold.json"
          
          lineHeight={1}
          textAlign="center" // set the text alignment
           // set the depth offset (should be a small value)
          
        // set the font size
         // set the anchor point on y axis
          letterSpacing={0.5} // set the letter spacing
          material={null} // set the material
        >
           {message.message} -  {message.username} 
          </Text>
        
          
        
         
        
          </OrthographicCamera>
        ))}
      </Canvas>
    </div>
  );
};

export default Three;
