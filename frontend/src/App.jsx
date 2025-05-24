import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/layout/layout';

import Home from './pages/home/home';
import TestFeature from './pages/testFeature/testFeature';

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
                        <Route
                            path="testPage/:test_id"
                            element={<TestFeature />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
