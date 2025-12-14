import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Events from './pages/Events/Events';
import NotFound from './pages/NotFound/NotFound';
import Header from './components/Layout/Header.tsx';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthContext.tsx';
import { App as AntdApp } from 'antd';
// import Footer from './components/Layout/Footer'

function App() {
  return (
    <AuthProvider>
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
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </AntdApp>
    </AuthProvider>
  )
}

export default App;