
import React, { useState, useEffect } from 'react';
import './App.css';
import { register, login, getTasks, addTask, updateTask, deleteTask } from './api';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      // fetch tasks from server with current filter/sort
      const fetchTasks = async () => {
        const url = new URL(process.env.REACT_APP_API_URL + '/tasks');
        if (filter) url.searchParams.append('q', filter);
        if (sort) url.searchParams.append('sort', sort);
        const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setTasks(data);
      };
      fetchTasks();
    }
  }, [token, filter, sort]);

  const handleRegister = async () => {
    setError('');
    const res = await register(username, password);
    if (res.success) {
      handleLogin();
    } else {
      setError('Registration failed');
    }
  };

  const handleLogin = async () => {
    setError('');
    const res = await login(username, password);
    if (res.token) {
      setToken(res.token);
      setUsername('');
      setPassword('');
    } else {
      setError('Login failed');
    }
  };

  const handleLogout = () => {
    setToken('');
    setTasks([]);
  };

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
  const res = await addTask(token, newTask);
  // refresh from server
  const refreshed = await getTasks(token);
  setTasks(refreshed);
    setNewTask('');
  };

  const handleEditTask = async (id) => {
    setEditId(id);
    const task = tasks.find(t => t._id === id);
    setEditText(task.text);
  };

  const handleUpdateTask = async () => {
  const res = await updateTask(token, editId, editText);
  const refreshed = await getTasks(token);
  setTasks(refreshed);
    setEditId(null);
    setEditText('');
  };

  const handleDeleteTask = async (id) => {
  await deleteTask(token, id);
  const refreshed = await getTasks(token);
  setTasks(refreshed);
  };

  let filteredTasks = tasks.filter(t => t.text.toLowerCase().includes(filter.toLowerCase()));
  if (sort === 'asc') filteredTasks = filteredTasks.sort((a, b) => a.text.localeCompare(b.text));
  if (sort === 'desc') filteredTasks = filteredTasks.sort((a, b) => b.text.localeCompare(a.text));

  return (
    <div className="app">
      <div className="topbar">
        <div className="header">Task Manager</div>
        <div>
          {token ? <button className="logout-btn" onClick={handleLogout}>Logout</button> : null}
        </div>
      </div>
      {error && <div style={{color:'red', maxWidth:1100, margin:'0 auto 12px'}}>{error}</div>}
      {!token ? (
        <div>
          <h3>Register / Login</h3>
          <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <button onClick={handleRegister}>Register</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div className="card-grid">
          <div>
            <div className="card">
              <h3>Tasks</h3>
              <input className="task-input" placeholder="New Task" value={newTask} onChange={e => setNewTask(e.target.value)} />
              <button className="primary full-width" onClick={handleAddTask}>Add Task</button>
              <div style={{marginTop:12}}>
                <label>Filter:</label>
                <input className="task-input" value={filter} onChange={e => setFilter(e.target.value)} />
                <label>Sort:</label>
                <select className="task-input" value={sort} onChange={e => setSort(e.target.value)}>
                  <option value="">None</option>
                  <option value="asc">A → Z</option>
                  <option value="desc">Z → A</option>
                </select>
              </div>
              <ul className="task-list">
                {filteredTasks.map((task) => (
                  <li className="task-item" key={task._id}>
                    {editId === task._id ? (
                      <>
                        <div className="task-text">
                          <input value={editText} onChange={e => setEditText(e.target.value)} />
                        </div>
                        <div className="task-actions">
                          <button onClick={handleUpdateTask}>Save</button>
                          <button onClick={() => setEditId(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="task-text">{task.text}</div>
                        <div className="task-actions">
                          <button onClick={() => handleEditTask(task._id)}>Edit</button>
                          <button onClick={() => handleDeleteTask(task._id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <div className="card">
              <h3>Details</h3>
              <p>Selected task details will appear here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
