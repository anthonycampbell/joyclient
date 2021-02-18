import { auth } from '../../../utils/authenticate'
import { fetchUserData } from '../../../utils/fetchUserData'
function Entries({ data }){
    return(
        <>
            <table>
                <tbody>
                    <tr>
                        {data.subject.fields.map((field, i) => {
                            return <th key={i}>{field}</th>
                        })}
                    </tr>
                    {data.entries.map((entry) => {
                        return(
                            <tr key={entry._id}>
                                {entry.values.map((value, i) => {
                                    return <td key={i}>{ value }</td>
                                })}
                            </tr>)
                    })}
                </tbody>
            </table>
            <form onSubmit={onSubmit}>
                {data.subject.fields.map((v,i) => {
                    return (
                        <label key={i}>
                            <input type="text" name={v} placeholder={v} />
                        </label>
                    )
                })}
                <input type='submit' value={'add to '+ data.title}/>
            </form>
        </>
    );
    function onSubmit(event) {
        /*event.preventDefault()
        console.log(event.target)
        const newEntry = new FormData(event.target)
        console.log(event.target.children)
        fetch(api, {
            method: 'POST',
            body: newEntry
        })*/
    }
}

export async function getServerSideProps(ctx){
    auth(ctx, '/subject/'+ctx.query.id, '/login')
    let path = 'http://localhost:3030/study_guide/subject/'+ctx.query.id
    let userData = await fetchUserData(ctx)
    let data
    try{
        let res = await fetch(path)
        data = await res.json()
    } catch(error){
        console.error(error)
    }
    return { props: {friendRequests: userData.friendRequests, friends: userData.friends,  data: data } }
}

export default Entries