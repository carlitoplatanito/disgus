import { useEffect, useState } from 'react'
import { createRootEvent, getComments, getRootEvent, getUser } from './helpers/nostr';
import Comment from './components/Comment';
import CommentForm from './components/CommentForm'
import UserForm from './components/UserForm'

function App({ config }) {
  const { title, canonical, event_id, relays } = config;
  const [ rootEvent, setRootEvent ] = useState(false)
  const [ user, setUser ] = useState(false);
  const [ comments, setComments ] = useState([]);

  useEffect(() => {
    if (!user && localStorage.getItem('user')) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, [user]);

  useEffect(() => {
    if (!rootEvent) {
      getRootEvent(config)
        .then((_event) => {
          setRootEvent(_event);
        });
    }
  }, [rootEvent]);

  useEffect(() => {
    if (rootEvent) {
      getComments(config, rootEvent).then((_comments) => {
        setComments(_comments);
      });
    }
  }, [rootEvent]);

  return (
    <div className="relative overflow-hidden my-2 p-2 sm:mx-auto sm:max-w-lg">
      <div className="border-bottom">
        <CommentForm config={config} user={user} setRootEvent={setRootEvent} rootEvent={rootEvent} setComments={setComments} />
        <UserForm config={config} user={user} setUser={setUser} />
      </div>
      <div>
      {comments.length > 0 ?
        comments.sort((a, b) => b.created_at - a.created_at).map((comment, i) => {
          return <Comment key={i} relays={relays} {...comment} />
        })
      : ''}
      </div>
    </div>
  )
}

export default App
