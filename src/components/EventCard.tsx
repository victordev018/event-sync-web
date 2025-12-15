import { Calendar, MapPin } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/Card"
import { Badge } from "./ui/Badge"
import { Button } from "./ui/Button"
import type { Event } from "../types"

interface EventCardProps {
    event: Event;
    isOrganizer?: boolean;
    isAttending?: boolean;
    onSubscribe?: (id: string) => void;
    onUnsubscribe?: (id: string) => void;
    onEdit?: (event: Event) => void;
    onDelete?: (id: string) => void;
}

export function EventCard({
    event,
    isOrganizer,
    isAttending,
    onSubscribe,
    onUnsubscribe,
    onEdit,
    onDelete
}: EventCardProps) {
    const isSoldOut = event.attendeesCount >= event.maxAttendees;
    const formattedDate = new Date(event.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                    {isSoldOut ? (
                        <Badge variant="destructive" className="whitespace-nowrap">Esgotado</Badge>
                    ) : (
                        <Badge variant="secondary" className="whitespace-nowrap text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300">
                            {event.attendeesCount} / {event.maxAttendees}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 flex gap-2">
                {isOrganizer ? (
                    <>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit?.(event)}>
                            Editar
                        </Button>
                        <Button variant="destructive" size="sm" className="flex-1" onClick={() => onDelete?.(event.id)}>
                            Excluir
                        </Button>
                    </>
                ) : (
                    isAttending ? (
                        <Button variant="secondary" size="sm" className="w-full" onClick={() => onUnsubscribe?.(event.id)}>
                            Cancelar Inscrição
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="w-full"
                            disabled={isSoldOut}
                            onClick={() => onSubscribe?.(event.id)}
                        >
                            {isSoldOut ? "Esgotado" : "Inscrever-se"}
                        </Button>
                    )
                )}
            </CardFooter>
        </Card>
    )
}
