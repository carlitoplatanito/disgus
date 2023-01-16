import { useEffect, useState } from 'react'
import { getComments } from './helpers/nostr';
import Comment from './components/Comment';
import CommentForm from './components/CommentForm'
import UserForm from './components/UserForm'

function App({ config }) {
  const { title, canonical, relay } = config;
  const [ user, setUser ] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : false);
  const [ comments, setComments ] = useState([]);

  useEffect(() => {
    getComments(canonical, relay).then((cs) => {
      setComments(cs);
    });
  }, [canonical, relay]);

  return (
    <div className="relative overflow-hidden my-2 p-2 sm:mx-auto sm:max-w-lg">
      <div className="border-bottom">
        <CommentForm config={config} user={user} />
        <UserForm config={config} user={user} onSetUser={setUser} />
      </div>
      <div>
      {comments.length > 0 ?
        comments.sort((a, b) => b.created_at - a.created_at).map((comment, i) => {
          return <Comment key={i} {...comment} />
        })
      : ''}
      </div>
    </div>
  )
}

export default App
