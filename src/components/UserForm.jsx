import { Fragment } from 'react';
import { classNames } from "../helpers/utils";
import { Menu, Transition } from '@headlessui/react';
import { useUser } from '../context/user';
import { useRoot } from '../context/root';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function UserForm() {
    const { comments } = useRoot();
    const { user, signInRandom, signIn, signOut } = useUser();
    
    return (
        <div className="flex items-center justify-between">
            <div className="whitespace-nowrap truncate">
                <b>{comments.length} Comments</b>
            </div>
            <Menu as="div" className="relative block text-right">
                <div>
                    <Menu.Button className="inline-flex align-center justify-center px-4 py-2">
                        <figure className="avatar placeholder mr-2">
                        {user && user.picture
                            ? <img className="object-cover rounded-full w-6 h-6 ring ring-1 ring-black" src={user.picture} style={{backgroundColor: `#${user.pubkey.substr(0,6)}`, lineHeight: 0}} />
                            : <div className="flex items-center justify-center w-6 h-6 ring ring-1 ring-black rounded-full uppercase text-black" style={{backgroundColor: `#${user.pubkey ? user.pubkey.substr(0,6) : 'ffffff'}`, lineHeight: 0, verticalAlign: 'center'}}><span className="text-md">{user.pubkey ? user.pubkey.substr(0,2) : '?'}</span></div>
                        }
                        </figure>
                        {user ? <b className="inline-block whitespace-nowrap w-auto truncate" style={{maxWidth: '250px'}}>{user.display_name || user.name || user.pubkey }</b> : <b>Login</b>}
                        <ChevronDownIcon className="-mr-1 ml-1 w-4" aria-hidden="true" />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {user ? 
                    <div className="py-1">
                        <Menu.Item>
                        {({ active }) => (
                            <a
                            onClick={(e) => { e.preventDefault(); signOut(); }}
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                            )}
                            >
                            Sign Out
                            </a>
                        )}
                        </Menu.Item>
                    </div>
                    :<div className="py-1">
                        <Menu.Item>
                        {({ active }) => (
                            <a
                            onClick={(e) => { e.preventDefault(); signIn(); }}
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                            )}
                            >
                            Sign In
                            </a>
                        )}
                        </Menu.Item>
                        <Menu.Item>
                        {({ active }) => (
                            <a
                            onClick={(e) => {e.preventDefault(); signInRandom(); }}
                            className={classNames(
                                active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                'block px-4 py-2 text-sm'
                            )}
                            >
                            Random Guest
                            </a>
                        )}
                        </Menu.Item>
                    </div>}
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    )
}