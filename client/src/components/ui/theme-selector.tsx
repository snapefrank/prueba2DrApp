import { Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

// Selector de tema desactivado - ahora solo muestra un icono sin funcionalidad
export function ThemeSelector() {
  // El tema siempre será "light" por las modificaciones en theme-store.ts
  return (
    <div className="opacity-0 w-0 h-0 overflow-hidden">
      {/* Componente oculto */}
      <Sun className="h-0 w-0" />
    </div>
  );
}