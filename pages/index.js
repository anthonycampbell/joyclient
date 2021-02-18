import Link from 'next/link'
import { auth } from '../utils/authenticate'
import { fetchUserData } from '../utils/fetchUserData'
import { useState } from 'react'
import useSWR, { mutate } from 'swr'

const fetcher = (url, input) => {
  return fetch(url, {
    method: input? 'POST':'GET',
    credentials: 'include',
    headers: { 'Accept': 'application/json',
               'Content-Type': 'application/json' },
    body: input? JSON.stringify(input) : null
  }).then(r => r.json())
}

export default function Index({ friends, friendRequests, sgs }){
  const studyGuides = sgs
  const [input, setInput] = useState({newStudyGuide: ''})
  const { data } = useSWR('http://localhost:3030/study_guide',
                          fetcher,
                          {initialData: {studyGuides}})

  async function handleChange(e){
    setInput({...input, [e.target.name]: e.target.value})
  }

  async function handleSubmit(e){
    e.preventDefault()
    await fetcher('http://localhost:3030/study_guide', input)
    setInput({newStudyGuide: ''})
    mutate('http://localhost:3030/study_guide')
  } 
  return (
    <>
      <h1>Study Guides</h1>
      {!data ? <div>loading...</div> : data.studyGuides.map((v,i) => {
        return (
          <div key={data.studyGuides[i].id}>
          <Link href='/studyguides/[id]' as={`/studyguides/${data.studyGuides[i].id}`} >
            <a>{data.studyGuides[i].title}</a>
          </Link>
          </div>
        )
      })}
      <form onSubmit={handleSubmit}>
        <input type='text'
               name='newStudyGuide' 
               value={input.newStudyGuide} 
               placeholder='Input Title'
               required 
               onChange={handleChange}></input>
        <input type='submit' 
               value='New Study Guide'></input>
      </form>
    </>
  );
} 

export async function getServerSideProps(ctx){
  if (!auth(ctx, '/', '/login')){
    return { props: {}}
  }
  let userData = await fetchUserData(ctx)
  let studyGuides = []
  try{
    let res = await fetch('http://localhost:3030/study_guide', {
      credentials: 'include',
      headers: { cookie: ctx.req.headers.cookie }
    })
    let json = await res.json()
    studyGuides = json.studyGuides ? json.studyGuides : [] 
  } catch(error) {
    console.error(error)
  }
  return { props: {friendRequests: userData.friendRequests,
                   friends: userData.friends,
                   sgs: studyGuides } }
}