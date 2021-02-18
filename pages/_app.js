 import App from 'next/app'
 import React from 'react'
 import ChatOverlay from '../components/friends'

class MyApp extends App{
    render(){
        const { Component, pageProps } = this.props
        if (pageProps.friends && pageProps.friendRequests){
            return( 
                <ChatOverlay friends={pageProps.friends} friendRequests={pageProps.friendRequests}>
                    <Component {...pageProps} />
                </ChatOverlay>
            )
        } else {
            return <Component {...pageProps} />
        }
    }
  }
  
  export default MyApp