import { useRouter } from 'next/router'

export default function Logout(){
    const router = useRouter()
    async function logout(event){
        event.preventDefault()
        try{
            let res = await fetch('https://afternoon-reaches-73581.herokuapp.com/logout', {
                method: 'POST',
                credentials: 'include'
              })
            let json = await res.text()
            localStorage.removeItem('jwt')
            router.push('/login')
        } catch(error) {
            console.error(error)
        }

    }
    return (
        <form  onSubmit={logout}>
            <input type='submit' value = 'Logout'/>
        </form>
    );
}