import { User, Mail, Phone } from "lucide-react"

interface PersonalInfoCardProps {
  displayName: string
  email: string
  phone?: string
  isEditing: boolean
  onNameChange?: (value: string) => void
  onPhoneChange?: (value: string) => void
}

export default function PersonalInfoCard({
  displayName,
  email,
  phone,
  isEditing,
  onNameChange,
  onPhoneChange,
}: Readonly<PersonalInfoCardProps>) {
  return (
    <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
        <User className="w-5 h-5 text-primary" />
        Información Personal
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1 font-medium">Nombre Completo</label>
          {isEditing ? (
            <input
              type="text"
              defaultValue={displayName}
              onChange={(e) => onNameChange?.(e.target.value)}
              className="w-full glass rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p className="text-foreground">{displayName || "No especificado"}</p>
          )}
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1 flex items-center gap-2 font-medium">
            <Mail className="w-4 h-4" />
            Email
          </label>
          <p className="text-foreground">{email}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1 flex items-center gap-2 font-medium">
            <Phone className="w-4 h-4" />
            Teléfono
          </label>
          {isEditing ? (
            <input
              type="tel"
              defaultValue={phone}
              onChange={(e) => onPhoneChange?.(e.target.value)}
              placeholder="+52 123 456 7890"
              className="w-full glass rounded-xl px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <p className="text-foreground">{phone || "No especificado"}</p>
          )}
        </div>
      </div>
    </div>
  )
}
