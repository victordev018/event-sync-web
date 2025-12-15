import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import api from "../lib/api";
import { useToast } from "../context/ToastContext";
import type { User, Event } from "../types";

interface EventCardProps {
    event: Event;
    user?: User | null; // Make user optional as Home page might not have it or pass it differently
    isSubscribed?: boolean;
    onUpdate?: () => void;

    // Legacy props support (optional) - handling them or ignoring if we refactor Parent components
    isOrganizer?: boolean;
    isAttending?: boolean;
    onSubscribe?: (id: string) => void;
    onUnsubscribe?: (id: string) => void;
    onEdit?: (event: Event) => void;
    onDelete?: (id: string) => void;
}

export function EventCard({ event, user, isSubscribed, onUpdate, onEdit, onDelete }: EventCardProps) {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // If user is passed, use it. checking equality of IDs.
    const isOwner = user?.id === event.organizerId;
    const isFull = event.attendeesCount >= event.maxAttendees;

    // Formatting date safely
    const formattedDate = new Date(event.date);
    const dateStr = isNaN(formattedDate.getTime())
        ? event.date
        : format(formattedDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });

    async function handleSubscribe() {
        if (!user) {
            addToast("Você precisa estar logado para se inscrever.", "info");
            return;
        }
        try {
            setIsLoading(true);
            await api.post(`/api/events/${event.id}/subscribe`); // Using /api prefix based on project convention
            addToast("Inscrição realizada com sucesso!", "success");
            onUpdate?.();
        } catch (error: any) {
            // Handle 409 Conflict (Full or Already Subscribed)
            const msg = error.response?.data?.message || "Erro ao realizar inscrição.";
            addToast(msg, "error");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleUnsubscribe() {
        try {
            setIsLoading(true);
            await api.delete(`/api/events/${event.id}/subscribe`);
            addToast("Inscrição cancelada.", "info");
            onUpdate?.();
        } catch (error) {
            addToast("Erro ao cancelar inscrição.", "error");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="bg-white dark:bg-card rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-border flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-foreground line-clamp-1" title={event.title}>{event.title}</h3>
                    <p className="text-gray-500 dark:text-muted-foreground mt-1 text-sm line-clamp-2 min-h-[40px]">{event.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${isFull ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    }`}>
                    {event.attendeesCount} / {event.maxAttendees}
                </span>
            </div>

            <div className="space-y-3 mb-6 flex-grow">
                <div className="flex items-center text-gray-600 dark:text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                    <span>{dateStr}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    <span>{event.location}</span>
                </div>
            </div>

            <div className="mt-auto flex gap-2">
                {isOwner ? (
                    <>
                        <button
                            onClick={() => onEdit?.(event)}
                            className="flex-1 bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => onDelete?.(event.id)}
                            className="flex-1 bg-red-600 text-white py-2.5 rounded-md hover:bg-red-700 transition-colors font-medium text-sm shadow-sm"
                        >
                            Excluir
                        </button>
                    </>
                ) : isSubscribed ? (
                    <button
                        onClick={handleUnsubscribe}
                        disabled={isLoading}
                        className="w-full bg-white dark:bg-transparent text-red-600 py-2.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border border-red-200 dark:border-red-800 font-medium text-sm"
                    >
                        {isLoading ? "Processando..." : "Cancelar Inscrição"}
                    </button>
                ) : isFull ? (
                    <button disabled className="w-full bg-gray-100 dark:bg-muted text-gray-400 py-2.5 rounded-md cursor-not-allowed font-medium text-sm border border-gray-200 dark:border-muted-foreground/20">
                        Esgotado
                    </button>
                ) : (
                    <button
                        onClick={handleSubscribe}
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700 transition-colors font-medium text-sm shadow-sm"
                    >
                        {isLoading ? "Processando..." : "Inscrever-se"}
                    </button>
                )}
            </div>
        </div>
    );
}
