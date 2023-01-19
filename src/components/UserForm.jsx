import { useEffect, useState } from 'react';
// import { formatDate } from "../helpers/utils";
import { useUser } from '../context/user';
import { useRoot } from '../context/root';
import { FingerPrintIcon } from '@heroicons/react/24/solid';

export default function UserForm() {
    const { user, signInGuest, signIn } = useUser();
    const [ name, setName ] = useState('');
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        signInGuest(name);
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        signIn();
    }

    if (user) {
        return <div className="w-full text-right">Signed in as <a title={user.pubkey} href={`nostr:${user.pubkey}`}>{user.name || user.pubkey}</a></div>;
    }

    return (
        <div className="flex items-center justify-between">
            <form className="flex items-center justify-between" onSubmit={handleFormSubmit}>
                <button type="button" className="bg-black text-white font-bold py-2 px-4 whitespace-nowrap rounded focus:outline-none focus:shadow-outline" onClick={handleSignIn}>
                    <FingerPrintIcon className="inline-block" width={18} /> <span>Sign In</span>
                </button>
                <span className="mx-2 whitespace-nowrap">&middot; or &middot;</span>
                <input
                    type="text"
                    className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none"
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                    id="name"
                    placeholder="Continue as random"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="bg-black text-white font-bold py-2 px-4 my-2 rounded"
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                >
                    Continue
                </button>
            </form>
        </div>
    )
}