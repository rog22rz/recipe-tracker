import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

function WeekScreen() {
  return <p>Week</p>;
}

function LibraryScreen() {
  return <p>Recipes</p>;
}

function RecipeDetailScreen() {
  return <p>Recipe detail</p>;
}

function RotationScreen() {
  return <p>Rotation</p>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<WeekScreen />} />
          <Route path="/recipes" element={<LibraryScreen />} />
          <Route path="/recipes/:id" element={<RecipeDetailScreen />} />
          <Route path="/rotation" element={<RotationScreen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
