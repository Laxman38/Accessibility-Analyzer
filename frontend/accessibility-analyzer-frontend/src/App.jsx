import { Toaster } from "sonner";
import AccessibilityReport from "./components/AccessibilityReport";
import HeroSection from "./components/HeroSection";

function App() {
  return (
    <div className="App">
      <HeroSection />
      <AccessibilityReport />
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
