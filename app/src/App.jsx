import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout/Layout';

import Edition from './pages/Edition/Edition';
import Home from './pages/Home/Home';

import './App.css';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
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
