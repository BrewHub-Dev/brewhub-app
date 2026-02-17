import { UserPreferences } from "../types"

interface PreferencesCardProps {
  preferences: UserPreferences
  onPreferenceChange: (key: keyof UserPreferences, value: boolean) => void
}

export default function PreferencesCard({ preferences, onPreferenceChange }: Readonly<PreferencesCardProps>) {
  return (
    <div className="glass rounded-2xl p-6 mb-6 hover:shadow-2xl transition-all">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Preferencias</h3>
      <div className="space-y-4">
        <PreferenceToggle
          label="Notificaciones por Email"
          description="Recibe actualizaciones por correo"
          checked={preferences.emailNotifications}
          onChange={(checked) => onPreferenceChange("emailNotifications", checked)}
        />
        <PreferenceToggle
          label="Modo Oscuro"
          description="Tema visual de la aplicación"
          checked={preferences.darkMode}
          onChange={(checked) => onPreferenceChange("darkMode", checked)}
        />
        <PreferenceToggle
          label="Sonidos de la Aplicación"
          description="Reproducir sonidos al interactuar"
          checked={preferences.soundEffects}
          onChange={(checked) => onPreferenceChange("soundEffects", checked)}
        />
      </div>
    </div>
  )
}

interface PreferenceToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function PreferenceToggle({ label, description, checked, onChange }: Readonly<PreferenceToggleProps>) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-muted/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  )
}
