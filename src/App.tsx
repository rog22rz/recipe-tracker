import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { weekRows } from './store/selectors';
import { useAppStore } from './store/store';

function WeekScreen() {
  const recipes = useAppStore((state) => state.recipes);
  const log = useAppStore((state) => state.log);
  const settings = useAppStore((state) => state.settings);
  const rows = weekRows(log, recipes, new Date(), settings);

  return (
    <ul>
      {rows.map((row) => (
        <li key={row.iso}>
          {row.dow} {row.date}
          <ul>
            {row.entries.length === 0 ? (
              <li>—</li>
            ) : (
              row.entries.map((entry) => <li key={entry.id}>{entry.name}</li>)
            )}
          </ul>
        </li>
      ))}
    </ul>
  );
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
