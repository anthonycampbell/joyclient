import React, { useState, useEffect } from 'react'
import NewSubject, { formatSubjects } from '../../../components/newSubject'
import { auth } from '../../../utils/authenticate'
import { fetchUserData } from '../../../utils/fetchUserData'
import ShareDB from 'sharedb/lib/client'
import ReconnectingWebSocket from 'reconnecting-websocket';

function useForceUpdate(){
    const [value, setValue] = useState(0);
    return () => setValue(value => ++value);
}

export default function Subject({ data }){
    const emptyTable = {title: null,fields: []}
    const [tables, setTables] = useState([emptyTable])
    const connection = getConn()
    const forceUpdate = useForceUpdate();
    let subjects = formatSubjects(data.subjects)

    function getConn(){
        const [conn, setConn] = useState(null)
        useEffect(()=>{
            var socket = new ReconnectingWebSocket('ws://localhost:3030')
            var connection = new ShareDB.Connection(socket)
            let doc = connection.get('subjects', 'newTables')
            doc.subscribe()
            doc.on('load', call)
            doc.on('op', call)
            setConn(connection)
            function call(){
                setTables(doc.data.tables)
                forceUpdate()
            }
            return () => connection.close()
        },[])
        return conn
    }
    
    function newTable(){
        let doc = connection.get('subjects', 'newTables')
        let l = doc.data.tables.length
        doc.submitOp([{p: ['tables', l+1], li:{title: '', fields: ['']} }])
    }

    function discardTable(i){
        let doc = connection.get('subjects', 'newTables')
        let l = doc.data.tables.length
        let s = doc.data.tables[i]
        if (l <= 1){
            doc.submitOp([ {p: ['tables'], ld: s, li: [emptyTable]}])
        } else {
            doc.submitOp([ {p: ['tables', i], ld: s }])
        }
    }

    function addField(i){
        let doc = connection.get('subjects', 'newTables')
        let fl = doc.data.tables[i].fields.length
        doc.submitOp([{p:['tables', i, 'fields', fl], li: ''}])
    }
    function removeField(i){
        let doc = connection.get('subjects', 'newTables')
        let l = doc.data.tables.length
        let fl = doc.data.tables[i].fields.length
        doc.submitOp([{p:['tables', i, 'fields', fl-1], ld: ''}])
    }

    function handleChange(e, i, j){
        let doc = connection.get('subjects', 'newTables')
        if (e.target.placeholder === 'Enter Field'){
            doc.submitOp([{p:['tables', i, 'fields', j, 0], sd: doc.data.tables[i].fields[j]}])
            doc.submitOp([{p:['tables', i, 'fields', j, 0], si: e.target.value}])
        } else {
            doc.submitOp([{p:['tables', i, 'title', 0], sd: doc.data.tables[i].title}])
            doc.submitOp([{p:['tables', i, 'title', 0], si: e.target.value}])
        }
    }

    function saveSubject(event, i){
        event.preventDefault()
        console.log(tables[i])
        discardTable(i)
    }

   return (
        <>
            <div>
                <h1>{data.title}</h1>
                <ul>
                    {subjects}
                </ul>
            </div>
            <div className='newTable'>
                
                {tables.map((v,i)=>{
                    return <NewSubject saveSubject = {saveSubject} 
                            table = {tables[i]} 
                            i = {i}
                            addField = {addField}
                            removeField = {removeField}
                            discardTable = {discardTable}
                            key={i}
                            handleChange= {handleChange}/>
                })}
            </div>
            <button type='button' onClick={ newTable }>New Table</button>
        </>
    
   );
}

export async function getServerSideProps(ctx){
    auth(ctx, '/subject/index', '/login')
    let userData = await fetchUserData(ctx)
    /*let data
    try{
        let res = await fetch('http://localhost:3030/study_guide', {
            credentials: 'include',
            headers: ctx.req ? {cookie: ctx.req.headers.cookie} : undefined
          })
        data = await res.json()
    } catch(error) {
        console.error(error)
    }*/
    return { props: {friendRequests: userData.friendRequests, friends: userData.friends/*,  data: data */} }
  }