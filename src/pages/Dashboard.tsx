import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

    const [events, setEvents] = useState<Event[]>([]);
    const [attendingEvents, setAttendingEvents] = useState<Event[]>([]);
    const [mySubscriptions, setMySubscriptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    async function loadData() {
        setLoading(true);
        try {
            const [eventsRes, subsRes] = await Promise.all([
                api.get("/api/events"),
                api.get("/api/events/attending")
            ]);

            setEvents(eventsRes.data);
            setMySubscriptions(subsRes.data.map((e: any) => e.id));
            setAttendingEvents(subsRes.data); // Store full subscription data including checkedIn status
        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar eventos.", "error");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // ... mutations ... (kept in memory, assumed unchanged outside this block)
    const createEventMutation = useMutation({
        mutationFn: (newEvent: Omit<Event, 'id' | 'attendeesCount' | 'organizerId'>) => api.post('/api/events', newEvent),
        onSuccess: () => {
            loadData();
            setIsCreateModalOpen(false);
            addToast("Evento criado com sucesso!", "success");
        },
        onError: (error: any) => addToast(`Erro ao criar evento: ${error.response?.data?.message || error.message}`, "error")
    });

    const updateEventMutation = useMutation({
        mutationFn: (updatedEvent: Partial<Event>) => api.put(`/api/events/${editingEvent?.id}`, updatedEvent),
        onSuccess: () => {
            loadData();
            setEditingEvent(null);
            addToast("Evento atualizado com sucesso!", "success");
        },
        onError: (error: any) => addToast(`Erro ao atualizar evento: ${error.message}`, "error")
    });

    const deleteEventMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/api/events/${id}`),
        onSuccess: () => {
            loadData();
            addToast("Evento excluído com sucesso!", "success");
        },
        onError: (error: any) => addToast(`Erro ao excluir evento: ${error.message}`, "error")
    });

    const handleLogout = () => {
        logout();
        navigate("/");
        addToast("Você saiu do sistema.", "info");
    };

    // Filtered lists
    const myCreatedEvents = events.filter(e => e.organizerId === user?.id);
    const exploreEvents = events.filter(e => !(mySubscriptions.includes(e.id) || e.organizerId === user?.id));

    if (loading && events.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-background pb-10">
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
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-foreground">Painel de Eventos</h1>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Criar Evento
                    </Button>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 max-w-[600px] mb-6">
                        <TabsTrigger value="all">Explorar</TabsTrigger>
                        <TabsTrigger value="my-events">Criados por Mim</TabsTrigger>
                        <TabsTrigger value="attending">Minhas Inscrições</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                        {exploreEvents.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Nenhum evento novo para descobrir.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {exploreEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        user={user}
                                        isSubscribed={false}
                                        onUpdate={loadData}
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

                    <TabsContent value="my-events">
                        {myCreatedEvents.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Você ainda não criou nenhum evento.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myCreatedEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        user={user}
                                        isSubscribed={mySubscriptions.includes(event.id)}
                                        onUpdate={loadData}
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

                    <TabsContent value="attending">
                        {attendingEvents.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Você não está inscrito em nenhum evento.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {attendingEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        user={user}
                                        isSubscribed={true}
                                        onUpdate={loadData}
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
