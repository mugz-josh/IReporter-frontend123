import React from 'react';
import { Palette, Sun, Moon, Eye, Heart, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const themes = [
  { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright' },
  { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
  { id: 'high-contrast', name: 'High Contrast', icon: Eye, description: 'Accessibility focused' },
  { id: 'colorblind', name: 'Colorblind Friendly', icon: Palette, description: 'Optimized colors' },
  { id: 'warm', name: 'Warm', icon: Heart, description: 'Cozy and inviting' },
] as const;

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Select theme">
          {currentTheme ? <currentTheme.icon className="h-5 w-5" /> : <Palette className="h-5 w-5" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className="flex items-center gap-3 p-3 cursor-pointer"
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{themeOption.name}</span>
                <span className="text-xs text-muted-foreground">{themeOption.description}</span>
              </div>
              {theme === themeOption.id && <Zap className="h-4 w-4 ml-auto text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
