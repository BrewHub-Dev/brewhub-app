import api from "@/lib/api"

export interface Invitation {
    _id: string
    tenantId: string
    inviteCode: string
    type: "qr" | "link"
    maxUses?: number
    usedCount: number
    active: boolean
    branchId?: string
    expiresAt?: string
    metadata?: {
        createdBy: string
        description?: string
    }
    createdAt: string
}

export interface CreateInvitationData {
    type: "qr" | "link"
    maxUses?: number
    expiresAt?: string
    description?: string
    branchId?: string
}

export async function getInvitations(): Promise<Invitation[]> {
    try {
        const response = await api.get("/invitations")
        if (!response) return []
        return Array.isArray(response) ? response : []
    } catch (err) {
        console.error("Error al obtener invitaciones:", err)
        return []
    }
}

export async function createInvitation(data: CreateInvitationData): Promise<{ ok: boolean; invitation: Invitation }> {
    const response = await api.post("/invitations", {
        type: data.type,
        maxUses: data.maxUses,
        expiresAt: data.expiresAt,
        description: data.description,
        branchId: data.branchId,
    })
    return response
}

export async function deactivateInvitation(invitationId: string): Promise<{ ok: boolean }> {
    const response = await api.del(`/invitations/${invitationId}`)
    return response
}
