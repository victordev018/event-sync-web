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

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Event, 'id' | 'attendeesCount' | 'organizerId'>) => void;
    isLoading?: boolean;
}

export function CreateEventModal({ isOpen, onClose, onSubmit, isLoading }: CreateEventModalProps) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema) as any,
    });

    const handleFormSubmit = (data: EventFormData) => {
        const payload = {
            ...data,
            date: new Date(data.date).toISOString()
        };
        onSubmit(payload);
        reset();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Criar Novo Evento"
            description="Preencha os detalhes para hospedar um novo evento."
        >
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <Input
                    label="Título do Evento"
                    placeholder="Ex: Tech Meetup 2024"
                    error={errors.title?.message}
                    {...register("title")}
                />

                <Input
                    label="Descrição"
                    placeholder="Descreva seu evento..."
                    error={errors.description?.message} // Using Input for now, usually Textarea
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
                    placeholder="Ex: Sala Principal, SP"
                    error={errors.location?.message}
                    {...register("location")}
                />

                <Input
                    label="Máx. Participantes"
                    type="number"
                    placeholder="50"
                    error={errors.maxAttendees?.message}
                    {...register("maxAttendees")}
                />

                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button type="submit" disabled={isLoading}>{isLoading ? "Criando..." : "Criar Evento"}</Button>
                </div>
            </form>
        </Modal>
    );
}
