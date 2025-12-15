import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Events from './pages/Events/Events';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound/NotFound';
import Header from './components/Layout/Header.tsx';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthInitializer } from './components/AuthInitializer';
import { App as AntdApp } from 'antd';
// import Footer from './components/Layout/Footer'

function App() {
  return (
    <AuthInitializer>
      <AntdApp>
        <div className="app-wrapper">
          <Header />
          <main className="main-content" style={{ paddingTop: '80px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/events" element={<Events />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<Profile />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AntdApp>
    </AuthInitializer>
  )
}

export default App;