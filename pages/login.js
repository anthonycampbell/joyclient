import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { auth } from '../utils/authenticate'

export default function Login(){
    const [input, setInput] = useState({})
    const router = useRouter()
    function handleChange(e){
        setInput({...input, [e.target.name]: e.target.value})
    }

    function handleSubmit(event){
        event.preventDefault()
        fetch('http://localhost:3030/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(input)
        })
        .then(res => res.json())
        .catch(err => console.error(err))
        .then(data => {
            router.push('/') 
        })
    }
    return ( 
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label>email:
                    <input type='text' name='email' required onChange={handleChange} />
                </label>
                <label>password:
                    <input type='password' name='password' required onChange={handleChange} />
                </label>
                    <input type="submit" value='submit' />
            </form>
            <Link href="/register"><a>Register Here</a></Link>
        </div>

    );
}

export function getServerSideProps(ctx){
    auth(ctx, '/login', '/')
    return { props: { } }
}