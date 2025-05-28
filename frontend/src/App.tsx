import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Events from './pages/Events/Events';
import NotFound from './pages/NotFound/NotFound';
import Header from './components/Layout/Header.tsx';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './components/AuthContext.tsx';
// import Footer from './components/Layout/Footer'

function App() {
  return (
    <AuthProvider> { /* Оборачиваем все в AuthProvider */}
      <div className="app-wrapper"> {/* Общая обертка для стилизации */} 
        <Header /> {/* Раскомментировали и убрали пропсы, так как Header теперь берет все из AuthContext */}
        <main className="main-content" style={{ paddingTop: '80px' }}> {/* Основной контент с отступом под шапку */} 
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            
            {/* Защищенные маршруты */}
            <Route element={<ProtectedRoute />}>
              {/* Здесь можно добавить защищенные маршруты */}
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        {/* <Footer /> */}
      </div>
    </AuthProvider>
  )
}

export default App;