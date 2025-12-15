import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import type { Event } from "../types";

const eventSchema = z.object({
    title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
    description: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
    date: z.string().refine((val) => new Date(val) > new Date(), "A data deve ser futura"),
    location: z.string().min(3, "Localização é obrigatória"),
    maxAttendees: z.coerce.number().min(1, "Pelo menos 1 participante é necessário"),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EditEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: Event | null;
    onSubmit: (data: Partial<Event>) => void;
    isLoading?: boolean;
}

export function EditEventModal({ isOpen, onClose, event, onSubmit, isLoading }: EditEventModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema) as any,
    });

    useEffect(() => {
        if (event) {
            // Convert UTC ISO string to local datetime-local format
            const dateObj = new Date(event.date);
            const localIsoCheck = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

            reset({
                title: event.title,
                description: event.description,
                date: localIsoCheck,
                location: event.location,
                maxAttendees: event.maxAttendees
            });
        }
    }, [event, reset]);

    const handleFormSubmit = (data: EventFormData) => {
        const payload = {
            ...data,
            date: new Date(data.date).toISOString()
        };
        onSubmit(payload);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Evento"
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <Input
                    label="Título do Evento"
                    error={errors.title?.message}
                    {...register("title")}
                />

                <Input
                    label="Descrição"
                    error={errors.description?.message}
                    {...register("description")}
                />

                <Input
                    label="Data e Hora"
                    type="datetime-local"
                    error={errors.date?.message}
                    {...register("date")}
                />

                <Input
                    label="Localização"
                    error={errors.location?.message}
                    {...register("location")}
                />

                <Input
                    label="Máx. Participantes"
                    type="number"
                    error={errors.maxAttendees?.message}
                    {...register("maxAttendees")}
                />

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Salvando..." : "Salvar Alterações"}</Button>
                </div>
            </form>
        </Modal>
    );
}
