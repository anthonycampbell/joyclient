export async function fetchUserData( ctx ){
    let friends = {}
    let friendRequests = []
    try{
        let res = await fetch('http://localhost:3030/friends', {
            credentials: 'include',
            headers: ctx.req ? {cookie: ctx.req.headers.cookie} : undefined
        })
        let json = await res.json()
        friends = json.friends ? json.friends : {}
    } catch(error) {
        console.error(error)
    }
    try{
        let res = await fetch('http://localhost:3030/friendRequests', {
            credentials: 'include',
            headers: ctx.req ? {cookie: ctx.req.headers.cookie} : undefined
        })
        let json = await res.json()
        friendRequests = json.requests ? json.requests : [] 
    } catch(error) {
        console.error(error)
    }

    return { friendRequests: friendRequests, friends: friends }
}