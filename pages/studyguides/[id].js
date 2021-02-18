import React, { useState, useEffect } from 'react'
import NewSubject, { formatSubjects } from '../../components/newSubject'
import { auth } from '../../utils/authenticate'
import { fetchUserData } from '../../utils/fetchUserData'
import ShareDB from 'sharedb/lib/client'
import ReconnectingWebSocket from 'reconnecting-websocket';
import { useRouter } from 'next/router'


function useForceUpdate(){
    const [value, setValue] = useState(0);
    return () => setValue(value => ++value);
}

export default function Subject({ data }){
    const emptyTable = {title: null, fields: [], rows: [[]]}
    const [tables, setTables] = useState([emptyTable])
    const router = useRouter()
    const connection = getConn()
    const forceUpdate = useForceUpdate();

    function getConn(){
        const [conn, setConn] = useState(null)
        useEffect(()=>{
            var socket = new ReconnectingWebSocket('ws://localhost:3030')
            var connection = new ShareDB.Connection(socket)
            let doc = connection.get('new', router.query.id)
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
        let doc = connection.get('new', router.query.id)
        let l = doc.data.tables.length
        doc.submitOp([{p: ['tables', l+1], li:{title: '', fields: [''], rows:[['']]} }])
    }

    function discardTable(i){
        let doc = connection.get('new', router.query.id)
        let l = doc.data.tables.length
        let s = doc.data.tables[i]
        if (l <= 1){
            doc.submitOp([ {p: ['tables'], ld: s, li: [emptyTable]}])
        } else {
            doc.submitOp([ {p: ['tables', i], ld: s }])
        }
    }

    function addField(i){
        let doc = connection.get('new', router.query.id)
        let fl = doc.data.tables[i].fields.length
        doc.submitOp([{p:['tables', i, 'fields', fl], li: ''}])
        for(let j = 0; j < doc.data.tables[i].rows.length; j++){
            let rl = doc.data.tables[i].rows[j].length
            doc.submitOp([{p:['tables', i, 'rows', j, rl], li: ''}])
        }
    }

    function removeField(i){
        let doc = connection.get('new', router.query.id)
        let l = doc.data.tables.length
        let fl = doc.data.tables[i].fields.length
        doc.submitOp([{p:['tables', i, 'fields', fl-1], ld: ''}])
        for(let j = 0; j < doc.data.tables[i].rows.length; j++){
            let rl = doc.data.tables[i].rows[j].length
            doc.submitOp([{p:['tables', i, 'rows', j, rl-1], ld: ''}])
        }
    }

    function addRow(i){
        let doc = connection.get('new', router.query.id)
        let rl = doc.data.tables[i].rows.length
        doc.submitOp([{p:['tables', i, 'rows', rl], li: Array(doc.data.tables[i].fields.length).fill('')}])
    }

    function removeRow(i){
        let doc = connection.get('new', router.query.id)
        let l = doc.data.tables.length
        let rl = doc.data.tables[i].rows.length
        doc.submitOp([{p:['tables', i, 'rows', rl-1], ld: ['']}])
    }

    function handleChange(e, i, j, k){
        let doc = connection.get('new', router.query.id)
        if (e.target.placeholder === 'Enter Field'){
            doc.submitOp([{p:['tables', i, 'fields', j, 0], sd: doc.data.tables[i].fields[j]}])
            doc.submitOp([{p:['tables', i, 'fields', j, 0], si: e.target.value}])
        } else if (e.target.placeholder === 'Enter Cell'){
            doc.submitOp([{p:['tables', i, 'rows', j, k, 0], sd: doc.data.tables[i].rows[j][k]}])
            doc.submitOp([{p:['tables', i, 'rows', j, k, 0], si: e.target.value}])
        } else {
            doc.submitOp([{p:['tables', i, 'title', 0], sd: doc.data.tables[i].title}])
            doc.submitOp([{p:['tables', i, 'title', 0], si: e.target.value}])
        }
    }

    return (
        <>
            <div className='newTable' 
                 style={{overflow: 'scroll', width: '100%'}}>
                    {tables.map((v,i)=>{
                        return <NewSubject table = {tables[i]} 
                                           i = {i}
                                           addField = {addField}
                                           removeField = {removeField}
                                           addRow = {addRow}
                                           removeRow = {removeRow}
                                           discardTable = {discardTable}
                                           key={i}
                                           handleChange= {handleChange}/>
                    })}
            </div>
            <button type='button'
                    onClick={ newTable }
                    style={{marginTop: '1em',
                            marginBottom: '1em'}}>
                        New Table
            </button>
        </>
    
   );
}



export async function getServerSideProps(ctx){
    auth(ctx, '/studyguides/'+ctx.query.id, '/login')
    let path = 'http://localhost:3030/study_guide/'+ctx.query.id
    let userData = await fetchUserData(ctx)
    let data
    try{
        let res = await fetch(path)
        data = await res.json()
    } catch(error){
        console.error(error)
    }
    console.log(data)
    return { props: {friendRequests: userData.friendRequests, friends: userData.friends/*,  data: data */} }
}