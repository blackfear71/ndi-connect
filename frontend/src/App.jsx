import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/layout/layout';

import Edition from './pages/edition/edition';
import Home from './pages/home/home';

import './App.css';

function App() {
    return (
        <div className="App">
            <BrowserRouter basename="/app">
                <Routes>
                    <Route path="/" element={<Layout />}>
                        {/* Accueil : route par défaut */}
                        <Route index element={<Home />} />

                        {/* Page de test */}
                        <Route path="edition/:id" element={<Edition />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
