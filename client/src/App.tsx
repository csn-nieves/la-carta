import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CocktailDetail from './pages/CocktailDetail';
import CreateCocktail from './pages/CreateCocktail';
import EditCocktail from './pages/EditCocktail';
import Favorites from './pages/Favorites';
import Notes from './pages/Notes';
import AdminUsers from './pages/AdminUsers';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cocktails/:id" element={<CocktailDetail />} />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateCocktail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cocktails/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditCocktail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <Notes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <AdminUsers />
                  </AdminRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
