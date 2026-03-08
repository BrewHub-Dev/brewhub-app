"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getInvitations, createInvitation, deactivateInvitation } from "../api"
import type { CreateInvitationData } from "../api"

import {
    Plus,
    QrCode,
    Link2,
    Trash2,
    Loader2,
    Copy,
    Check,
    Users,
    Clock,
    X,
    Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import InviteQrModal from "./InviteQRModal"

function InviteForm({
    onSubmit,
    onCancel,
    isLoading,
}: {
    onSubmit: (data: CreateInvitationData) => void
    onCancel: () => void
    isLoading: boolean
}) {
    const [type, setType] = useState<"qr" | "link">("qr")
    const [maxUses, setMaxUses] = useState<string>("100")
    const [description, setDescription] = useState("")
    const [expiresAt, setExpiresAt] = useState("")

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        onSubmit({
            type,
            maxUses: maxUses ? Number(maxUses) : undefined,
            description: description || undefined,
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        })
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="p-5 rounded-xl border border-border/50 bg-muted/10 glass space-y-4"
        >
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Nueva Invitación</h3>

                <button
                    type="button"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* TYPE */}
            <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                    Tipo
                </label>

                <div className="grid grid-cols-2 gap-2">
                    {(["qr", "link"] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                                type === t
                                    ? "bg-primary/20 border-primary/50 text-primary"
                                    : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                            }`}
                        >
                            {t === "qr" ? (
                                <QrCode className="w-4 h-4" />
                            ) : (
                                <Link2 className="w-4 h-4" />
                            )}

                            {t === "qr" ? "Código QR" : "Link de invitación"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                        Usos máximos
                    </label>

                    <Input
                        type="number"
                        value={maxUses}
                        onChange={(e) => setMaxUses(e.target.value)}
                        placeholder="100"
                        min="1"
                        className="bg-muted/20 border"
                    />
                </div>

                <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                        Expira en
                    </label>

                    <Input
                        type="date"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                        className="bg-muted/20 border"
                    />
                </div>
            </div>

            <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                    Descripción
                </label>

                <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="QR para mostrador"
                    className="bg-muted/20 border"
                />
            </div>

            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isLoading} className="gap-2">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                    Crear invitación
                </Button>

                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancelar
                </Button>
            </div>
        </form>
    )
}

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    function copy() {
        navigator.clipboard.writeText(text)
        setCopied(true)

        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={copy}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
            {copied ? (
                <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
                <Copy className="w-3.5 h-3.5" />
            )}

            {copied ? "¡Copiado!" : "Copiar"}
        </button>
    )
}

export default function InvitationsView() {
    const [showForm, setShowForm] = useState(false)

    const [qrOpen, setQrOpen] = useState(false)
    const [selectedCode, setSelectedCode] = useState<string | null>(null)

    const queryClient = useQueryClient()

    const { data: invitations = [], isLoading } = useQuery({
        queryKey: ["invitations"],
        queryFn: getInvitations,
    })

    const createMutation = useMutation({
        mutationFn: createInvitation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] })
            setShowForm(false)
        },
    })

    const deactivateMutation = useMutation({
        mutationFn: deactivateInvitation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] })
        },
    })

    function openQr(code: string) {
        setSelectedCode(code)
        setQrOpen(true)
    }

    const activeInvitations = invitations.filter((i) => i.active)
    const inactiveInvitations = invitations.filter((i) => !i.active)

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">

                {/* HEADER */}

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Invitaciones
                        </h1>

                        <p className="text-muted-foreground mt-1">
                            Genera códigos QR y links para que clientes se unan a tu tienda
                        </p>
                    </div>

                    <Button
                        onClick={() => setShowForm(true)}
                        className="gap-2"
                        disabled={showForm}
                    >
                        <Plus className="w-4 h-4" />
                        Nueva invitación
                    </Button>
                </div>

                {/* FORM */}

                {showForm && (
                    <div className="mb-6">
                        <InviteForm
                            onSubmit={(data) => createMutation.mutate(data)}
                            onCancel={() => setShowForm(false)}
                            isLoading={createMutation.isPending}
                        />
                    </div>
                )}

                {/* LOADING */}

                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        {/* ACTIVE */}

                        {activeInvitations.length > 0 && (
                            <div className="space-y-3">

                                {activeInvitations.map((inv) => (
                                    <div
                                        key={inv._id}
                                        className="p-5 rounded-xl border border-border/50 bg-card/30 glass flex items-start gap-4"
                                    >
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                                inv.type === "qr"
                                                    ? "bg-purple-500/20 border border-purple-500/30"
                                                    : "bg-blue-500/20 border border-blue-500/30"
                                            }`}
                                        >
                                            {inv.type === "qr" ? (
                                                <QrCode className="w-6 h-6 text-purple-500" />
                                            ) : (
                                                <Link2 className="w-6 h-6 text-blue-500" />
                                            )}
                                        </div>

                                        <div className="flex-1">

                                            <div className="flex items-center gap-2 mb-1">

                                                <button
                                                    onClick={() =>
                                                        openQr(inv.inviteCode)
                                                    }
                                                    className="p-1.5 rounded-md hover:bg-muted transition"
                                                >
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                </button>

                                                <code className="font-mono text-base font-bold text-foreground">
                                                    {inv.inviteCode}
                                                </code>

                                                <CopyButton text={inv.inviteCode} />
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">

                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    {inv.usedCount} /{" "}
                                                    {inv.maxUses ? inv.maxUses : "∞"} usos
                                                </span>

                                                {inv.expiresAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        Expira{" "}
                                                        {new Date(
                                                            inv.expiresAt
                                                        ).toLocaleDateString("es-MX")}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `¿Desactivar ${inv.inviteCode}?`
                                                    )
                                                ) {
                                                    deactivateMutation.mutate(
                                                        inv._id
                                                    )
                                                }
                                            }}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* EMPTY */}

                        {activeInvitations.length === 0 && !showForm && (
                            <div className="text-center py-20 text-muted-foreground">
                                <QrCode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-lg font-medium">
                                    Sin invitaciones activas
                                </p>
                            </div>
                        )}
                    </>
                )}


                {selectedCode && (
                    <InviteQrModal
                        open={qrOpen}
                        onClose={() => setQrOpen(false)}
                        code={selectedCode}
                    />
                )}
            </div>
        </div>
    )
}
