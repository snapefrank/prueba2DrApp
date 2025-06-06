import { useState } from 'react';
import {
  AccessibilityIcon,
  ZoomInIcon,
  ZoomOutIcon,
  Contrast,
  Languages,
  MousePointerClick
} from 'lucide-react';
import { usePreferences } from '@/hooks/use-preferences';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function AccessibilityPanel() {
  const {
    preferences,
    setLanguage,
    toggleAccessibilityMode,
    toggleAnimations,
    setFontSize,
    setColorContrast,
    resetPreferences
  } = usePreferences();
  
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          aria-label="Opciones de accesibilidad"
          className="fixed bottom-4 right-4 z-50"
        >
          <AccessibilityIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Opciones de accesibilidad</DialogTitle>
          <DialogDescription>
            Personaliza la aplicación para mejorar tu experiencia y accesibilidad.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Control de tamaño de fuente */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ZoomInIcon className="h-4 w-4" />
                <Label htmlFor="font-size">Tamaño de texto</Label>
              </div>
              <Select 
                value={preferences.fontSize}
                onValueChange={(value) => setFontSize(value as 'small' | 'medium' | 'large')}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeño</SelectItem>
                  <SelectItem value="medium">Mediano</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Control de idioma */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4" />
                <Label htmlFor="language">Idioma</Label>
              </div>
              <Select 
                value={preferences.language}
                onValueChange={(value) => setLanguage(value as 'es' | 'en')}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Modo de alto contraste */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Contrast className="h-4 w-4" />
              <Label htmlFor="contrast">Alto contraste</Label>
            </div>
            <Select 
              value={preferences.colorContrast}
              onValueChange={(value) => setColorContrast(value as 'normal' | 'high')}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Contraste" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Switches */}
          <div className="space-y-4">
            {/* Modo de accesibilidad */}
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center space-x-2">
                <MousePointerClick className="h-4 w-4" />
                <Label htmlFor="accessibility-mode">Foco mejorado</Label>
              </div>
              <Switch
                id="accessibility-mode"
                checked={preferences.accessibilityMode}
                onCheckedChange={toggleAccessibilityMode}
              />
            </div>
            
            {/* Reducir animaciones */}
            <div className="flex items-center justify-between">
              <div className="flex flex-1 items-center space-x-2">
                <ZoomOutIcon className="h-4 w-4" />
                <Label htmlFor="reduce-animations">Reducir animaciones</Label>
              </div>
              <Switch
                id="reduce-animations"
                checked={preferences.disableAnimations}
                onCheckedChange={toggleAnimations}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={resetPreferences}>
            Restablecer
          </Button>
          <DialogClose asChild>
            <Button>Guardar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}