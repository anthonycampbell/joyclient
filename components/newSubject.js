import Link from 'next/link'
import styles from './newSubject.module.css'
import TextAreaAutoSize from 'react-textarea-autosize'
import React, { useRef, useState, useEffect } from 'react'
import AutosizeInput from 'react-input-autosize'

function useOutsideAlerter(ref, setSelected) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setSelected(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);
}

function TH({handleChange, i, j, table, active, setSelected}){
    const inputElement = useRef(null)
    function handleClick(e){
        inputElement.current.focus();
        setSelected('0'+j)
    }
    return (
        <th onClick={handleClick} className={ active? styles.ths : styles.th}>
            <TextAreaAutoSize onChange={(e) => handleChange(e,i,j)}
                              ref={inputElement} 
                              placeholder='Enter Field'
                              value={table.fields[j]}
                              className={active? styles.thas : styles.tha}/>
        </th>
    )
}
function TD({handleChange, i, j, k, table, active, setSelected}){
    const inputElement = useRef(null)
    function handleClick(e){
        inputElement.current.focus();
        setSelected(''+(j+1)+k)
    }
    return (
        <td onClick={handleClick} className={ active? styles.tds : styles.td}>
            <TextAreaAutoSize onChange={(e) => handleChange(e,i,j,k)}
                              ref={inputElement} 
                              placeholder='Enter Cell'
                              value={table.rows[j][k]}
                              className={active? styles.tas : styles.ta}/>
        </td>
    )
}

export default function NewSubject({table, i, addField, removeField, addRow, removeRow, discardTable, handleChange}){
    const [isSelected, setSelected] = useState()
    const tref = useRef(null)
    useOutsideAlerter(tref, setSelected)
    return(
        <div>
            { table.title != null && 
            <AutosizeInput onChange={(e) => handleChange(e,i)}
                   type='text' 
                   placeholder='Enter Title'
                   placeholderIsMinWidth
                   inputStyle={{ fontSize: '1.17em',
                                 fontWeight: 'bold',
                                 border: 'none',
                                 textAlign: 'center'}}
                   style={{
                    display: 'block',
                    margin: 'auto',
                    marginTop: '1em'
                }} 
                   value={table.title}/>}
            { table.title != null && 
            <table className={styles.t}>
                <tbody ref={tref}>
                    <tr>
                        {table.fields.map((v,j) =>  <TH key={'0'+j}
                                                          handleChange={handleChange}
                                                          i={i} 
                                                          j={j} 
                                                          table={table}
                                                          active={isSelected === '0'+j}
                                                          setSelected={setSelected}/>)}
                        <th className={styles.th} style={{height: '24px'}}>
                            <button type='button' onClick={() => addField(i) }>+</button>
                            { table.fields.length > 0 ? 
                                <button type='button' onClick={() => removeField(i) }>-</button> 
                                : null }
                        </th>
                    </tr>
                    {table.rows.map((v, j) => {
                        return <tr key={j}>
                            {table.rows[j].map((v,k) => {
                                return <TD key={''+(j+1)+k}
                                           handleChange={handleChange}
                                           i={i} 
                                           j={j} 
                                           k={k} 
                                           table={table}
                                           active={isSelected === ''+(j+1)+k}
                                           setSelected={setSelected}/>
                            })}
                        </tr>
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        {table.fields.map((v,j) => {
                            if (j === 0){
                                return <td  key={''+(table.rows.length+1).toString()+j}
                                            className={styles.td}>
                                    <button type='button' 
                                            style={{width: '100%'}}
                                            onClick={() => discardTable(i) }>
                                                Discard table
                                    </button>
                                </td>
                            } else return <td key={''+(table.rows.length+1).toString()+j}
                                              className={styles.td}></td>
                        })}
                        <td className={styles.td} style={{height: '24px'}}>
                            <button type='button' onClick={() => addRow(i) }>+</button>
                            { table.rows.length > 0 ? 
                            <button type='button' onClick={() => removeRow(i) }>-</button> 
                            : null }
                        </td>
                    </tr>
                </tfoot>
            </table> }
        </div>
    );
}

export function formatSubjects(subjects){
    let elements = []
    for (let i = 0; i < subjects.length; i++){
        elements[i] = 
        <li key={subjects[i]._id}>
            <Link href='/subject/[id]' as={`/subject/${subjects[i]._id}`} >
                <a>{subjects[i].title}</a>
            </Link>
        </li>
    }
    return elements
}