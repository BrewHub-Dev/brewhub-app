import { Building, MapPin, Building2, Briefcase } from "lucide-react"

interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

interface WorkInfoCardProps {
  branchName: string
  role: string
  address?: Address
}

export default function WorkInfoCard({ branchName, role, address }: Readonly<WorkInfoCardProps>) {
  const formattedAddress = address
    ? `${address.street}, ${address.city}, ${address.state}, ${address.zip}, ${address.country}`
    : "No especificada"

  return (
    <div className="glass rounded-2xl p-6 hover:shadow-2xl transition-all">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
        <Building className="w-5 h-5 text-primary" />
        Información Laboral
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1 flex items-center gap-2 font-medium">
            <Building2 className="w-4 h-4" />
            Sucursal
          </label>
          <p className="text-foreground">{branchName}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1 flex items-center gap-2 font-medium">
            <Briefcase className="w-4 h-4" />
            Rol
          </label>
          <p className="text-foreground">{role}</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1 flex items-center gap-2 font-medium">
            <MapPin className="w-4 h-4" />
            Ubicación
          </label>
          <p className="text-foreground">{formattedAddress}</p>
        </div>
      </div>
    </div>
  )
}
