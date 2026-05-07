import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, X, LayoutGrid, List } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('taskflow_todos');
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse todos', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('taskflow_todos', JSON.stringify(todos));
    }
  }, [todos, isLoaded]);

  const addTodo = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(t => !t.completed).length;

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-brand-50 pt-12 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex items-baseline justify-between">
          <div>
            <h1 id="app-title" className="text-4xl font-semibold tracking-tight text-brand-900 mb-1">
              TaskFlow
            </h1>
            <p className="text-brand-500 text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-mono text-brand-400">
              {todos.length > 0 ? `${todos.filter(t => t.completed).length}/${todos.length}` : '0/0'}
            </span>
          </div>
        </header>

        {/* Input Section */}
        <section className="mb-8" id="todo-input-section">
          <form onSubmit={addTodo} className="relative group">
            <input
              type="text"
              id="todo-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-white border border-brand-200 rounded-2xl py-4 pl-6 pr-14 text-brand-800 placeholder:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm group-hover:shadow-md"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center bg-brand-900 text-white rounded-xl hover:bg-brand-800 disabled:bg-brand-200 disabled:cursor-not-allowed transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>
        </section>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
          <div className="flex bg-brand-100 p-1 rounded-xl">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f 
                    ? 'bg-white text-brand-900 shadow-sm' 
                    : 'text-brand-500 hover:text-brand-700'
                }`}
              >
                {f.charAt(0) + f.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-brand-400 uppercase tracking-widest">
              {activeCount} items left
            </span>
            {todos.some(t => t.completed) && (
              <button 
                onClick={clearCompleted}
                className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
              >
                Clear completed
              </button>
            )}
          </div>
        </div>

        {/* Task List */}
        <main className="space-y-3" id="todo-list">
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo) => (
              <motion.div
                layout
                key={todo.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`group flex items-center gap-4 bg-white p-4 rounded-2xl border border-brand-200 shadow-sm hover:shadow-md transition-shadow ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 transition-colors ${
                    todo.completed ? 'text-green-500' : 'text-brand-300 hover:text-brand-400'
                  }`}
                >
                  {todo.completed ? (
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  ) : (
                    <Circle size={24} strokeWidth={2.5} />
                  )}
                </button>
                
                <span className={`flex-grow text-brand-800 transition-all ${
                  todo.completed ? 'line-through text-brand-400' : ''
                }`}>
                  {todo.text}
                </span>

                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-brand-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTodos.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 text-brand-300 mb-4">
                <LayoutGrid size={32} />
              </div>
              <h3 className="text-brand-900 font-medium tracking-tight">No tasks found</h3>
              <p className="text-brand-400 text-sm">
                {filter === 'all' 
                  ? "Start your day by adding some tasks above." 
                  : `You don't have any ${filter} tasks right now.`}
              </p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
