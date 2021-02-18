import { useState, useEffect, useRef } from 'react';
import ReconnectingWebSocket from 'reconnecting-websocket';

function useWS(url, friend) {
  const [ws, setWS] = useState(null)
  useEffect(() => {
    const ws = new ReconnectingWebSocket(url)
    ws.onopen = () => ws.send(JSON.stringify({ type: 'newChat', friend: friend.id}))
    ws.onclose = () => console.log('ws closed')
    setWS(ws)
    return () => {
      ws.close()
    }
  }, [])
  return ws
}

function ChatBox({ws, friend, chat, openChats, index, setOpenChats, messages, setMessages}){
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef(null)
  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView()
  }
  
  useEffect(() => { 
        let mounted = true
        async function getMessages(){
          try {
            let res = await fetch('http://localhost:3030/chat',{
              method: 'POST',
              credentials: 'include',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({friend: friend.id})
            })
            let json = await res.json()
            if (mounted){
              setMessages(json.messages)
            }
          } catch(error) {
            console.error(error)
          }
      }
      getMessages()
      return () => mounted = false
  }, [])

  useEffect( () => {if(messagesEndRef.current){messagesEndRef.current.scrollIntoView()}})

  function send(e){
    e.preventDefault()
    var msg = {type: 'message', message: message, id: friend.id, chat: chat.id}
    ws.send( JSON.stringify(msg))
    setMessage("")
  }
  function chatBoxOff(e) {
    var swap = [... openChats].fill(false)
    swap.splice(index, 1, false)
    setOpenChats(swap)
  }
  return (
    <div style={{position: 'fixed', 
                 right: '250px',
                 bottom: '0',
                 margin: '5px',
                 textAlign: 'center',
                 backgroundColor: 'white'}}>
      <button style={{width: '200px'}}
              onClick={chatBoxOff}>
                     {friend.username}
      </button>
      <div style={{ height: '250px',
                    width: '200px',
                    border: '1px solid black',
                    overflow: 'auto'}} >
        {messages.map((v,i) => {
          if (v.writer == friend.id){
            return <p style={{ maxWidth: '70%',
                               margin: '2px',
                               paddingLeft: '10px',
                               paddingRight: '10px',
                               paddingTop: '4px',
                               paddingBottom: '4px',
                               borderRadius: '10px',
                               backgroundColor: '#e6e6e6',
                               clear: 'both',
                               float: 'left'}} key={i}>
                                 {v.data}
                   </p>
          } else {
            return <p style={{ maxWidth: '70%',
                               margin: '2px',
                               paddingLeft: '10px',
                               paddingRight: '10px',
                               paddingTop: '4px',
                               paddingBottom: '4px',
                               borderRadius: '10px',
                               backgroundColor: 'dodgerblue',
                               color: 'white',
                               clear: 'both',
                               float: 'right'}}
                               key={i}>
                                 {v.data}
                   </p>
          }
        })}
        <div style={{clear: 'both'}} ref={messagesEndRef} ></div>
      </div>
      <form onSubmit={send} >
        <input style={{width: '152px'}} type='text' value={message} onChange={e => setMessage(e.target.value)}/>
        <input style={{width: '40px'}} type='submit' value='send'/>
      </form>
    </div>
  );
}

export default function Chat({friend, openChats, index, setOpenChats}){
    const [chat, setChat] = useState({})
    const [messages, setMessages] = useState([])
    const ws = useWS('ws://localhost:3030/chat', friend)
    useEffect(() => {
      if (ws){
        ws.onmessage = (event) => {
          let d = JSON.parse(event.data)
          switch(d.type){
            case 'chat':
              setChat(d)
              break;
            case 'newMessage':
              setMessages(oldMessages => [...oldMessages, d.newMessage])
              break;
          }
        }
      }
    })
    
    function toggleChatBox(e){
      var swap = [... openChats].fill(false)
      swap.splice(index, 1, true)
      setOpenChats(swap)
    }
    return(
      <>
        <button style={{width:'100%',
                        paddingTop: '5px',
                        paddingBottom: '5px'}}
                        onClick={toggleChatBox}>
                          {friend.username}
        </button>
        { openChats[index] ? <ChatBox ws={ws} friend={friend} chat={chat} openChats={openChats} index={index} setOpenChats={setOpenChats} messages={messages} setMessages={setMessages}/> : null}
      </>
    );
}