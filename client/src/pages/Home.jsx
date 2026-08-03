import { supabase } from '../lib/supabase'

export default function Home({ user }) {
  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ padding:40 }}>
      <h1>Welcome, {user.user_metadata?.full_name || user.email}</h1>
      <p>{user.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  )
}