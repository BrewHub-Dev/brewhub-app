import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Item, SelectedModifier } from "../types"

interface ModifierModalProps {
    item: Item | null
    onClose: () => void
    onAdd: (item: Item, modifiers: SelectedModifier[]) => void
}

export default function ModifierModal({ item, onClose, onAdd }: ModifierModalProps) {
    const [selected, setSelected] = useState<Record<string, string>>({})

    // Initialize first option for each modifier
    useEffect(() => {
        if (item?.modifiers) {
            const initial: Record<string, string> = {}
            item.modifiers.forEach((m: any) => {
                if (m.options?.length > 0) {
                    initial[m.name] = m.options[0].name
                }
            })
            setSelected(initial)
        }
    }, [item])

    if (!item) return null

    const handleSelect = (modName: string, optName: string) => {
        setSelected((prev) => ({ ...prev, [modName]: optName }))
    }

    const handleConfirm = () => {
        const finalModifiers: SelectedModifier[] = []
        item.modifiers?.forEach((m: any) => {
            const optName = selected[m.name]
            if (optName) {
                const option = m.options.find((o: any) => o.name === optName)
                if (option) {
                    finalModifiers.push({
                        name: m.name,
                        optionName: optName,
                        extraPrice: option.extraPrice || 0,
                    })
                }
            }
        })
        onAdd(item, finalModifiers)
    }

    // Calculate dynamic extra price
    let extraPrice = 0
    item.modifiers?.forEach((m: any) => {
        const optName = selected[m.name]
        if (optName) {
            const option = m.options.find((o: any) => o.name === optName)
            if (option) {
                extraPrice += option.extraPrice || 0
            }
        }
    })

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background border rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <button onClick={onClose} className="p-1 text-muted-foreground hover:bg-muted rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1 space-y-6">
                    {item.modifiers?.map((mod: any) => (
                        <div key={mod.name}>
                            <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide text-muted-foreground">
                                {mod.name}
                            </h4>
                            <div className="space-y-2">
                                {mod.options?.map((opt: any) => (
                                    <label
                                        key={opt.name}
                                        onClick={() => handleSelect(mod.name, opt.name)}
                                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selected[mod.name] === opt.name
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:bg-muted/50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected[mod.name] === opt.name ? "border-primary" : "border-muted-foreground"
                                                    }`}
                                            >
                                                {selected[mod.name] === opt.name && (
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium">{opt.name}</span>
                                        </div>
                                        {opt.extraPrice > 0 && (
                                            <span className="text-sm text-muted-foreground">
                                                +${opt.extraPrice.toFixed(2)}
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t bg-muted/20">
                    <Button onClick={handleConfirm} className="w-full h-12 text-base">
                        Agregar por ${(item.price + extraPrice).toFixed(2)}
                    </Button>
                </div>
            </div>
        </div>
    )
}
