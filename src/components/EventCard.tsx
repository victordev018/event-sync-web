import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Users, Edit2, Trash2, UserPlus, UserMinus, QrCode, ClipboardCheck } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card";
import type { Event, User } from "../types";
import { useToast } from "../context/ToastContext";
import { useState } from "react";
import api from "../lib/api";
import { CredentialModal } from "./CredentialModal";
import { CheckInList } from "./CheckInList";

interface EventCardProps {
    event: Event;
    user?: User | null;
    isSubscribed?: boolean;
    onUpdate?: () => void;
    onEdit?: (event: Event) => void;
    onDelete?: (id: string) => void;
}

export function EventCard({ event, user, isSubscribed, onUpdate, onEdit, onDelete }: EventCardProps) {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isCredentialOpen, setIsCredentialOpen] = useState(false);
    const [isCheckInListOpen, setIsCheckInListOpen] = useState(false);

    const isOwner = user?.id === event.organizerId;
    const isFull = event.maxAttendees > 0 && event.attendeesCount >= event.maxAttendees;

    const handleSubscribe = async () => {
        if (!user) {
            addToast("Faça login para se inscrever.", "error");
            return;
        }
        setLoading(true);
        try {
            await api.post(`/api/events/${event.id}/subscribe/${user.id}`);
            addToast("Inscrição realizada com sucesso!", "success");
            onUpdate?.();
        } catch (error: any) {
            addToast(error.response?.data?.message || "Erro ao se inscrever.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUnsubscribe = async () => {
        if (!user) return;
        if (!confirm("Tem certeza que deseja cancelar sua inscrição?")) return;

        setLoading(true);
        try {
            await api.delete(`/api/events/${event.id}/subscribe/${user.id}`);
            addToast("Inscrição cancelada.", "info");
            onUpdate?.();
        } catch (error: any) {
            addToast("Erro ao cancelar inscrição.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary mb-2 inline-block">
                                Evento
                            </span>
                            <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
                        </div>
                        {isOwner && onEdit && onDelete && (
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(event)} className="h-8 w-8 text-blue-500 hover:text-blue-700">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)} className="h-8 w-8 text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                    <p className="text-muted-foreground line-clamp-2 text-sm">{event.description}</p>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{format(new Date(event.date), "PPP 'às' HH:mm", { locale: ptBR })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{event.attendeesCount} / {event.maxAttendees} participantes</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    {isOwner ? (
                        <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                            onClick={() => setIsCheckInListOpen(true)}
                        >
                            <ClipboardCheck className="h-4 w-4" />
                            Gerenciar Check-in
                        </Button>
                    ) : isSubscribed ? (
                        <div className="flex gap-2 w-full">
                            <Button
                                variant="outline"
                                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 gap-2"
                                onClick={() => setIsCredentialOpen(true)}
                            >
                                <QrCode className="h-4 w-4" />
                                Credencial
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 gap-2"
                                onClick={handleUnsubscribe}
                                disabled={loading}
                            >
                                <UserMinus className="h-4 w-4" />
                                Cancelar
                            </Button>
                        </div>
                    ) : isFull ? (
                        <Button disabled className="w-full opacity-80" variant="secondary">Esgotado</Button>
                    ) : (
                        <Button className="w-full gap-2" onClick={handleSubscribe} disabled={loading}>
                            <UserPlus className="h-4 w-4" />
                            Inscrever-se
                        </Button>
                    )}
                </CardFooter>
            </Card>

            {user && (
                <CredentialModal
                    isOpen={isCredentialOpen}
                    onClose={() => setIsCredentialOpen(false)}
                    eventName={event.title}
                    userName={user.name}
                    eventId={event.id}
                    userId={user.id}
                />
            )}

            {isOwner && (
                <CheckInList
                    isOpen={isCheckInListOpen}
                    onClose={() => setIsCheckInListOpen(false)}
                    eventId={event.id}
                />
            )}
        </>
    );
}
