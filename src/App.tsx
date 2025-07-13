import { useEffect } from 'react'
import { db } from './db';
import './App.css'

function App() {
  useEffect(() => {
    db.tags.add({ name: 'TestTag' }).then(() => {
      console.log('DB initialized and tag added!');
    });
  }, []);

  return (
    <div>
      <h1>SoloDo App</h1>
    </div>
  )
}

export default App;
