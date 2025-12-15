import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import type { Event } from "../types";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { EventCard } from "../components/EventCard";
import { CreateEventModal } from "../components/CreateEventModal";
import { EditEventModal } from "../components/EditEventModal";
import { Button } from "../components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/Tabs";

export function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    // Queries
    const { data: myEvents, isLoading: loadingMyEvents } = useQuery<Event[]>({
        queryKey: ['my-events'],
        queryFn: async () => (await api.get('/api/events/my-events')).data
    });

    const { data: attendingEvents, isLoading: loadingAttending } = useQuery<Event[]>({
        queryKey: ['attending-events'],
        queryFn: async () => (await api.get('/api/events/attending')).data
    });

    // Mutations
    const createEventMutation = useMutation({
        mutationFn: (newEvent: Omit<Event, 'id' | 'attendeesCount'>) => api.post('/api/events', newEvent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-events'] });
            setIsCreateModalOpen(false);
            addToast("Evento criado com sucesso!", "success");
        },
        onError: (error: any) => addToast(`Erro ao criar evento: ${error.response?.data?.message || error.message}`, "error")
    });

    const updateEventMutation = useMutation({
        mutationFn: (updatedEvent: Partial<Event>) => api.put(`/api/events/${editingEvent?.id}`, updatedEvent),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-events'] });
            setEditingEvent(null);
            addToast("Evento atualizado com sucesso!", "success");
        },
        onError: (error: any) => addToast(`Erro ao atualizar evento: ${error.message}`, "error")
    });

    const deleteEventMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/api/events/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-events'] });
            addToast("Evento excluído com sucesso!", "success");
        },
        onError: (error: any) => addToast(`Erro ao excluir evento: ${error.message}`, "error")
    });

    const unsubscribeMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/api/events/${id}/subscribe`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attending-events'] });
            queryClient.invalidateQueries({ queryKey: ['my-events'] }); // Capacity might change
            addToast("Inscrição cancelada com sucesso.", "success");
        },
        onError: (error: any) => addToast(`Erro ao cancelar inscrição: ${error.message}`, "error")
    });

    const handleLogout = () => {
        logout();
        navigate("/");
        addToast("Você saiu do sistema.", "info");
    };

    return (
        <div className="min-h-screen bg-background pb-10">
            <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>EventSync</h1>
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">/ Dashboard</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-medium">{user?.name}</span>
                        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tight">Meu Espaço</h2>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Criar Evento
                    </Button>
                </div>

                <Tabs defaultValue="my-events" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                        <TabsTrigger value="my-events">Meus Eventos</TabsTrigger>
                        <TabsTrigger value="attending">Inscrições</TabsTrigger>
                    </TabsList>

                    <TabsContent value="my-events" className="mt-6">
                        {loadingMyEvents ? (
                            <div>Carregando...</div>
                        ) : myEvents?.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Você ainda não criou nenhum evento.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myEvents?.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        isOrganizer={true}
                                        onEdit={(e) => setEditingEvent(e)}
                                        onDelete={(id) => {
                                            if (confirm("Tem certeza que deseja excluir este evento?")) {
                                                deleteEventMutation.mutate(id);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="attending" className="mt-6">
                        {loadingAttending ? (
                            <div>Carregando...</div>
                        ) : attendingEvents?.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Você não está inscrito em nenhum evento.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {attendingEvents?.map(event => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        isAttending={true}
                                        onUnsubscribe={(id) => {
                                            if (confirm("Tem certeza que deseja cancelar sua inscrição?")) {
                                                unsubscribeMutation.mutate(id);
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            <CreateEventModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={(data) => createEventMutation.mutate(data)}
                isLoading={createEventMutation.isPending}
            />

            <EditEventModal
                isOpen={!!editingEvent}
                onClose={() => setEditingEvent(null)}
                event={editingEvent}
                onSubmit={(data) => updateEventMutation.mutate(data)}
                isLoading={updateEventMutation.isPending}
            />
        </div>
    );
}
