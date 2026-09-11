import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { PasscodeGate } from './lib/auth/PasscodeGate';
import { LibraryScreen } from './screens/LibraryScreen/LibraryScreen';
import { RecipeDetailScreen } from './screens/RecipeDetailScreen/RecipeDetailScreen';
import { RotationScreen } from './screens/RotationScreen/RotationScreen';
import { WeekScreen } from './screens/WeekScreen/WeekScreen';

export function App() {
  return (
    <PasscodeGate>
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
    </PasscodeGate>
  );
}
