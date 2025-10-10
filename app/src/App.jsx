import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout/Layout';

import Edition from './pages/Edition/Edition';
import Home from './pages/Home/Home';
import Settings from './pages/Settings/Settings';

import { AuthProvider } from './utils/AuthContext';

import './App.css';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            {/* Editions : route par défaut */}
                            <Route index element={<Home />} />

                            {/* Edition */}
                            <Route path="edition/:id" element={<Edition />} />

                            {/* Paramètres */}
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;
