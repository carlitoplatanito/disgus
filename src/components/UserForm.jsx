import { useEffect, useState } from 'react';
// import { formatDate } from "../helpers/utils";
import { getUser, createGuest } from '../helpers/nostr';
import { FingerPrintIcon } from '@heroicons/react/24/solid';

export default function CommentForm({ user,  setUser, config }) {
    const { relays } = config;
    const [ name, setName ] = useState('');

    const signIn = () => {
        window.nostr.getPublicKey().then((pk) => {
            getUser(pk, relays).then((_user) => {
                localStorage.setItem('user', JSON.stringify(_user));
                setUser(_user);
            });
        });
    }

    const signUp = () => {
        createGuest(name, relays).then((_user) => {
            localStorage.setItem('user', JSON.stringify(_user))
            setUser(_user);
        });
    }

    return (
        <div className="flex items-center justify-between">
            {!user &&
                <div className="mr-4">
                    <button type="button" className="bg-black text-white font-bold py-2 px-4 whitespace-nowrap rounded focus:outline-none focus:shadow-outline" onClick={()=>signIn()}>
                        <FingerPrintIcon className="inline-block" width={18} /> <span>Sign In</span>
                    </button>
                </div>
            }
            {!user && 
                <form className="flex items-center justify-between" onSubmit={
                    (e)=>{
                        e.preventDefault();
                        signUp();
                    }}>
                    <input
                        type="text"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="name"
                        placeholder="Continue as random"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-black text-white font-bold py-2 px-4 my-2 rounded focus:outline-none focus:shadow-outline">
                        Continue
                    </button>
                </form>
            }
            {user && <div className="w-full text-right">Signed in as <a title={user.pubkey} href={`nostr:${user.pubkey}`}>{user.name || user.pubkey}</a></div>}
        </div>
    )
}